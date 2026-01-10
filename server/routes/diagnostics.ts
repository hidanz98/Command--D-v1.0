import { Router, RequestHandler } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import {
  DiagnosticsResponse,
  SystemInfo,
  SystemLog,
  DeviceInfo,
  SystemChange,
  CompatibilityIssue,
  WINDOWS_ERROR_SOLUTIONS
} from "../../shared/diagnostics";

const router = Router();
const execAsync = promisify(exec);

// Diretório para salvar logs
const LOGS_DIR = path.join(process.cwd(), "storage", "system-logs");

// Garantir que o diretório de logs existe
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Função auxiliar para executar comandos PowerShell
async function runPowerShell(command: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(
      `powershell -NoProfile -NonInteractive -Command "${command.replace(/"/g, '\\"')}"`,
      { maxBuffer: 50 * 1024 * 1024 } // 50MB buffer
    );
    return stdout.trim();
  } catch (error: any) {
    console.error("Erro PowerShell:", error.message);
    return "";
  }
}

// Coletar informações do sistema
async function getSystemInfo(): Promise<SystemInfo> {
  try {
    // Sistema operacional
    const osInfo = await runPowerShell(`
      $os = Get-CimInstance Win32_OperatingSystem
      @{
        Name = $os.Caption
        Version = $os.Version
        Build = $os.BuildNumber
        Architecture = $os.OSArchitecture
        LastBoot = $os.LastBootUpTime.ToString('o')
      } | ConvertTo-Json
    `);

    // CPU
    const cpuInfo = await runPowerShell(`
      $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
      $usage = (Get-CimInstance Win32_Processor).LoadPercentage | Measure-Object -Average
      @{
        Name = $cpu.Name
        Cores = $cpu.NumberOfCores
        Threads = $cpu.NumberOfLogicalProcessors
        Speed = "$($cpu.MaxClockSpeed) MHz"
        Usage = $usage.Average
      } | ConvertTo-Json
    `);

    // Memória
    const memInfo = await runPowerShell(`
      $mem = Get-CimInstance Win32_OperatingSystem
      $total = [math]::Round($mem.TotalVisibleMemorySize / 1MB, 2)
      $free = [math]::Round($mem.FreePhysicalMemory / 1MB, 2)
      $used = [math]::Round($total - $free, 2)
      @{
        Total = $total
        Available = $free
        Used = $used
        UsagePercent = [math]::Round(($used / $total) * 100, 1)
      } | ConvertTo-Json
    `);

    // Discos
    const diskInfo = await runPowerShell(`
      Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | ForEach-Object {
        @{
          Letter = $_.DeviceID
          Total = [math]::Round($_.Size / 1GB, 2)
          Free = [math]::Round($_.FreeSpace / 1GB, 2)
          Used = [math]::Round(($_.Size - $_.FreeSpace) / 1GB, 2)
          UsagePercent = [math]::Round((($_.Size - $_.FreeSpace) / $_.Size) * 100, 1)
        }
      } | ConvertTo-Json
    `);

    // GPU
    const gpuInfo = await runPowerShell(`
      $gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1
      if ($gpu) {
        @{
          Name = $gpu.Name
          Driver = $gpu.DriverVersion
          Memory = "$([math]::Round($gpu.AdapterRAM / 1GB, 2)) GB"
        } | ConvertTo-Json
      }
    `);

    // Uptime
    const uptimeInfo = await runPowerShell(`
      $uptime = (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
      [math]::Round($uptime.TotalHours, 1)
    `);

    const osData = JSON.parse(osInfo || "{}");
    const cpuData = JSON.parse(cpuInfo || "{}");
    const memData = JSON.parse(memInfo || "{}");
    let diskData = JSON.parse(diskInfo || "[]");
    if (!Array.isArray(diskData)) diskData = [diskData];
    const gpuData = gpuInfo ? JSON.parse(gpuInfo) : undefined;

    return {
      os: {
        name: osData.Name || "Windows",
        version: osData.Version || "",
        build: osData.Build || "",
        architecture: osData.Architecture || ""
      },
      cpu: {
        name: cpuData.Name || "Desconhecido",
        cores: cpuData.Cores || 0,
        threads: cpuData.Threads || 0,
        speed: cpuData.Speed || "",
        usage: cpuData.Usage || 0
      },
      memory: {
        total: memData.Total || 0,
        available: memData.Available || 0,
        used: memData.Used || 0,
        usagePercent: memData.UsagePercent || 0
      },
      disk: {
        drives: diskData
      },
      gpu: gpuData,
      uptime: parseFloat(uptimeInfo) || 0,
      lastBoot: osData.LastBoot || new Date().toISOString()
    };
  } catch (error) {
    console.error("Erro ao obter informações do sistema:", error);
    return {
      os: { name: "Erro", version: "", build: "", architecture: "" },
      cpu: { name: "Erro", cores: 0, threads: 0, speed: "", usage: 0 },
      memory: { total: 0, available: 0, used: 0, usagePercent: 0 },
      disk: { drives: [] },
      uptime: 0,
      lastBoot: ""
    };
  }
}

// Coletar logs do sistema Windows
async function getSystemLogs(limit: number = 100): Promise<SystemLog[]> {
  try {
    const logsJson = await runPowerShell(`
      $events = @()
      
      # Logs do Sistema
      $events += Get-WinEvent -LogName System -MaxEvents ${Math.floor(limit / 3)} -ErrorAction SilentlyContinue | 
        Where-Object { $_.LevelDisplayName -in @('Error', 'Warning', 'Critical') } |
        Select-Object @{N='Id';E={$_.RecordId}}, 
                      @{N='Timestamp';E={$_.TimeCreated.ToString('o')}},
                      @{N='Level';E={$_.LevelDisplayName.ToLower()}},
                      @{N='Source';E={$_.ProviderName}},
                      @{N='EventId';E={$_.Id}},
                      @{N='Message';E={$_.Message.Substring(0, [Math]::Min(500, $_.Message.Length))}},
                      @{N='Category';E={'System'}}
      
      # Logs de Aplicação
      $events += Get-WinEvent -LogName Application -MaxEvents ${Math.floor(limit / 3)} -ErrorAction SilentlyContinue | 
        Where-Object { $_.LevelDisplayName -in @('Error', 'Warning', 'Critical') } |
        Select-Object @{N='Id';E={$_.RecordId}}, 
                      @{N='Timestamp';E={$_.TimeCreated.ToString('o')}},
                      @{N='Level';E={$_.LevelDisplayName.ToLower()}},
                      @{N='Source';E={$_.ProviderName}},
                      @{N='EventId';E={$_.Id}},
                      @{N='Message';E={$_.Message.Substring(0, [Math]::Min(500, $_.Message.Length))}},
                      @{N='Category';E={'Application'}}
      
      # Logs de Segurança (se tiver permissão)
      try {
        $events += Get-WinEvent -LogName Security -MaxEvents ${Math.floor(limit / 3)} -ErrorAction SilentlyContinue | 
          Where-Object { $_.LevelDisplayName -in @('Error', 'Warning', 'Critical') } |
          Select-Object @{N='Id';E={$_.RecordId}}, 
                        @{N='Timestamp';E={$_.TimeCreated.ToString('o')}},
                        @{N='Level';E={$_.LevelDisplayName.ToLower()}},
                        @{N='Source';E={$_.ProviderName}},
                        @{N='EventId';E={$_.Id}},
                        @{N='Message';E={$_.Message.Substring(0, [Math]::Min(500, $_.Message.Length))}},
                        @{N='Category';E={'Security'}}
      } catch {}
      
      $events | Sort-Object Timestamp -Descending | Select-Object -First ${limit} | ConvertTo-Json -Depth 3
    `);

    let logs = JSON.parse(logsJson || "[]");
    if (!Array.isArray(logs)) logs = [logs];

    return logs.map((log: any) => ({
      id: String(log.Id || Math.random()),
      timestamp: new Date(log.Timestamp || Date.now()),
      level: log.Level === 'critical' ? 'critical' : log.Level === 'error' ? 'error' : log.Level === 'warning' ? 'warning' : 'info',
      source: log.Source || "Desconhecido",
      eventId: log.EventId || 0,
      message: log.Message || "",
      category: log.Category || "System"
    }));
  } catch (error) {
    console.error("Erro ao obter logs:", error);
    return [];
  }
}

// Coletar informações de dispositivos
async function getDeviceInfo(): Promise<DeviceInfo[]> {
  try {
    const devicesJson = await runPowerShell(`
      $devices = @()
      
      # Dispositivos com problemas
      $problemDevices = Get-CimInstance Win32_PnPEntity | Where-Object { $_.ConfigManagerErrorCode -ne 0 }
      foreach ($dev in $problemDevices) {
        $driver = Get-CimInstance Win32_PnPSignedDriver | Where-Object { $_.DeviceID -eq $dev.DeviceID } | Select-Object -First 1
        $devices += @{
          Id = $dev.DeviceID
          Name = $dev.Name
          Type = 'hardware'
          Status = if ($dev.ConfigManagerErrorCode -eq 0) { 'ok' } else { 'error' }
          Manufacturer = $dev.Manufacturer
          Driver = if ($driver) { $driver.DriverName } else { 'N/A' }
          DriverVersion = if ($driver) { $driver.DriverVersion } else { 'N/A' }
          DriverDate = if ($driver.DriverDate) { $driver.DriverDate.ToString('yyyy-MM-dd') } else { 'N/A' }
          ProblemCode = $dev.ConfigManagerErrorCode
        }
      }
      
      # Dispositivos importantes (mesmo sem problemas)
      $importantTypes = @('Display', 'Net', 'USB', 'Disk', 'Audio')
      $importantDevices = Get-CimInstance Win32_PnPEntity | Where-Object { 
        $_.ConfigManagerErrorCode -eq 0 -and 
        ($_.PNPClass -in $importantTypes -or $_.Name -match 'NVIDIA|AMD|Intel|Realtek|USB|Audio|Display|Network')
      } | Select-Object -First 20
      
      foreach ($dev in $importantDevices) {
        $driver = Get-CimInstance Win32_PnPSignedDriver | Where-Object { $_.DeviceID -eq $dev.DeviceID } | Select-Object -First 1
        $devices += @{
          Id = $dev.DeviceID
          Name = $dev.Name
          Type = 'hardware'
          Status = 'ok'
          Manufacturer = $dev.Manufacturer
          Driver = if ($driver) { $driver.DriverName } else { 'N/A' }
          DriverVersion = if ($driver) { $driver.DriverVersion } else { 'N/A' }
          DriverDate = if ($driver.DriverDate) { $driver.DriverDate.ToString('yyyy-MM-dd') } else { 'N/A' }
          ProblemCode = 0
        }
      }
      
      $devices | ConvertTo-Json -Depth 3
    `);

    let devices = JSON.parse(devicesJson || "[]");
    if (!Array.isArray(devices)) devices = [devices];

    return devices.map((dev: any) => {
      const errorInfo = WINDOWS_ERROR_SOLUTIONS[dev.ProblemCode];
      return {
        id: dev.Id || String(Math.random()),
        name: dev.Name || "Dispositivo Desconhecido",
        type: "hardware" as const,
        status: dev.Status === 'ok' ? 'ok' : 'error',
        manufacturer: dev.Manufacturer,
        driver: dev.Driver,
        driverVersion: dev.DriverVersion,
        driverDate: dev.DriverDate,
        problemCode: dev.ProblemCode,
        problemDescription: errorInfo?.description || undefined,
        solution: errorInfo?.solutions[0] || undefined
      };
    });
  } catch (error) {
    console.error("Erro ao obter dispositivos:", error);
    return [];
  }
}

// Coletar alterações recentes do sistema
async function getSystemChanges(): Promise<SystemChange[]> {
  try {
    const changesJson = await runPowerShell(`
      $changes = @()
      
      # Programas instalados recentemente
      $installed = Get-CimInstance Win32_Product | 
        Where-Object { $_.InstallDate } |
        Sort-Object InstallDate -Descending |
        Select-Object -First 10 |
        ForEach-Object {
          @{
            Id = $_.IdentifyingNumber
            Timestamp = if ($_.InstallDate) { 
              [datetime]::ParseExact($_.InstallDate, 'yyyyMMdd', $null).ToString('o') 
            } else { 
              (Get-Date).ToString('o') 
            }
            Type = 'install'
            Description = "Instalado: $($_.Name)"
            Details = "Versão: $($_.Version) | Fabricante: $($_.Vendor)"
          }
        }
      $changes += $installed
      
      # Atualizações do Windows
      $updates = Get-HotFix | 
        Sort-Object InstalledOn -Descending |
        Select-Object -First 10 |
        ForEach-Object {
          @{
            Id = $_.HotFixID
            Timestamp = if ($_.InstalledOn) { $_.InstalledOn.ToString('o') } else { (Get-Date).ToString('o') }
            Type = 'update'
            Description = "Windows Update: $($_.HotFixID)"
            Details = $_.Description
          }
        }
      $changes += $updates
      
      # Drivers atualizados recentemente (últimos 30 dias)
      $driverChanges = Get-CimInstance Win32_PnPSignedDriver | 
        Where-Object { $_.DriverDate -gt (Get-Date).AddDays(-30) } |
        Sort-Object DriverDate -Descending |
        Select-Object -First 10 |
        ForEach-Object {
          @{
            Id = $_.DeviceID
            Timestamp = if ($_.DriverDate) { $_.DriverDate.ToString('o') } else { (Get-Date).ToString('o') }
            Type = 'driver'
            Description = "Driver atualizado: $($_.DeviceName)"
            Details = "Versão: $($_.DriverVersion)"
          }
        }
      $changes += $driverChanges
      
      $changes | Sort-Object Timestamp -Descending | Select-Object -First 30 | ConvertTo-Json -Depth 3
    `);

    let changes = JSON.parse(changesJson || "[]");
    if (!Array.isArray(changes)) changes = [changes];

    return changes.map((change: any) => ({
      id: change.Id || String(Math.random()),
      timestamp: new Date(change.Timestamp || Date.now()),
      type: change.Type || "config",
      description: change.Description || "",
      details: change.Details
    }));
  } catch (error) {
    console.error("Erro ao obter alterações:", error);
    return [];
  }
}

// Detectar problemas de compatibilidade
async function getCompatibilityIssues(devices: DeviceInfo[], logs: SystemLog[]): Promise<CompatibilityIssue[]> {
  const issues: CompatibilityIssue[] = [];

  // Verificar dispositivos com problemas
  for (const device of devices) {
    if (device.status === 'error' && device.problemCode) {
      const errorInfo = WINDOWS_ERROR_SOLUTIONS[device.problemCode];
      issues.push({
        id: `device-${device.id}`,
        device: device.name,
        issue: errorInfo?.description || `Código de erro: ${device.problemCode}`,
        severity: device.problemCode >= 40 ? 'high' : 'medium',
        possibleSolutions: errorInfo?.solutions || ['Verificar documentação do fabricante'],
        status: 'detected',
        detectedAt: new Date()
      });
    }
  }

  // Analisar logs recentes para padrões de erros
  const errorPatterns: Record<string, { count: number; messages: string[] }> = {};
  for (const log of logs) {
    if (log.level === 'error' || log.level === 'critical') {
      const key = log.source;
      if (!errorPatterns[key]) {
        errorPatterns[key] = { count: 0, messages: [] };
      }
      errorPatterns[key].count++;
      if (errorPatterns[key].messages.length < 3) {
        errorPatterns[key].messages.push(log.message);
      }
    }
  }

  // Criar issues para fontes com múltiplos erros
  for (const [source, data] of Object.entries(errorPatterns)) {
    if (data.count >= 3) {
      issues.push({
        id: `log-${source}`,
        device: source,
        issue: `${data.count} erros detectados: ${data.messages[0]?.substring(0, 100)}...`,
        severity: data.count >= 10 ? 'high' : data.count >= 5 ? 'medium' : 'low',
        possibleSolutions: [
          'Verificar se há atualizações para o componente',
          'Reinstalar o software/driver relacionado',
          'Verificar logs detalhados no Visualizador de Eventos'
        ],
        status: 'detected',
        detectedAt: new Date()
      });
    }
  }

  return issues;
}

// Salvar logs em arquivo
async function saveLogs(data: DiagnosticsResponse): Promise<string> {
  const filename = `diagnostic-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(LOGS_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  
  // Manter apenas os últimos 50 arquivos
  const files = fs.readdirSync(LOGS_DIR)
    .filter(f => f.startsWith('diagnostic-'))
    .sort()
    .reverse();
  
  for (let i = 50; i < files.length; i++) {
    fs.unlinkSync(path.join(LOGS_DIR, files[i]));
  }
  
  return filepath;
}

// GET /api/diagnostics - Obter diagnóstico completo
const getDiagnostics: RequestHandler = async (req, res) => {
  try {
    console.log("Iniciando diagnóstico do sistema...");
    
    const [systemInfo, logs, devices, changes] = await Promise.all([
      getSystemInfo(),
      getSystemLogs(parseInt(req.query.logLimit as string) || 100),
      getDeviceInfo(),
      getSystemChanges()
    ]);

    const issues = await getCompatibilityIssues(devices, logs);

    const response: DiagnosticsResponse = {
      systemInfo,
      logs,
      devices,
      changes,
      issues,
      generatedAt: new Date()
    };

    // Salvar logs automaticamente
    if (req.query.save !== 'false') {
      const savedPath = await saveLogs(response);
      console.log("Diagnóstico salvo em:", savedPath);
    }

    res.json(response);
  } catch (error: any) {
    console.error("Erro no diagnóstico:", error);
    res.status(500).json({ 
      error: "Erro ao executar diagnóstico",
      message: error.message 
    });
  }
};

// GET /api/diagnostics/logs - Obter apenas logs
const getLogs: RequestHandler = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await getSystemLogs(limit);
    res.json({ logs, generatedAt: new Date() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/diagnostics/devices - Obter apenas dispositivos
const getDevices: RequestHandler = async (req, res) => {
  try {
    const devices = await getDeviceInfo();
    res.json({ devices, generatedAt: new Date() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/diagnostics/system - Obter apenas info do sistema
const getSystem: RequestHandler = async (req, res) => {
  try {
    const systemInfo = await getSystemInfo();
    res.json({ systemInfo, generatedAt: new Date() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/diagnostics/history - Listar diagnósticos salvos
const getHistory: RequestHandler = async (req, res) => {
  try {
    const files = fs.readdirSync(LOGS_DIR)
      .filter(f => f.startsWith('diagnostic-'))
      .map(f => ({
        filename: f,
        path: path.join(LOGS_DIR, f),
        date: f.replace('diagnostic-', '').replace('.json', '').replace(/-/g, ':').slice(0, 19),
        size: fs.statSync(path.join(LOGS_DIR, f)).size
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
    
    res.json({ files });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/diagnostics/history/:filename - Obter diagnóstico específico
const getHistoryFile: RequestHandler = async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(LOGS_DIR, filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: "Arquivo não encontrado" });
    }
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/diagnostics/export - Exportar relatório
const exportReport: RequestHandler = async (req, res) => {
  try {
    const diagnostics = req.body as DiagnosticsResponse;
    
    // Criar relatório em texto
    let report = `
╔══════════════════════════════════════════════════════════════════╗
║               RELATÓRIO DE DIAGNÓSTICO DO SISTEMA                ║
║                   Gerado em: ${new Date().toLocaleString('pt-BR')}                  ║
╚══════════════════════════════════════════════════════════════════╝

════════════════════════════════════════════════════════════════════
                        INFORMAÇÕES DO SISTEMA
════════════════════════════════════════════════════════════════════
Sistema Operacional: ${diagnostics.systemInfo.os.name}
Versão: ${diagnostics.systemInfo.os.version} (Build ${diagnostics.systemInfo.os.build})
Arquitetura: ${diagnostics.systemInfo.os.architecture}

CPU: ${diagnostics.systemInfo.cpu.name}
Núcleos: ${diagnostics.systemInfo.cpu.cores} | Threads: ${diagnostics.systemInfo.cpu.threads}
Velocidade: ${diagnostics.systemInfo.cpu.speed}
Uso Atual: ${diagnostics.systemInfo.cpu.usage}%

Memória Total: ${diagnostics.systemInfo.memory.total} GB
Memória Usada: ${diagnostics.systemInfo.memory.used} GB (${diagnostics.systemInfo.memory.usagePercent}%)
Memória Livre: ${diagnostics.systemInfo.memory.available} GB

${diagnostics.systemInfo.gpu ? `GPU: ${diagnostics.systemInfo.gpu.name}
Driver: ${diagnostics.systemInfo.gpu.driver}
Memória: ${diagnostics.systemInfo.gpu.memory}` : ''}

Tempo Ligado: ${diagnostics.systemInfo.uptime} horas
Último Boot: ${diagnostics.systemInfo.lastBoot}

════════════════════════════════════════════════════════════════════
                     PROBLEMAS DE COMPATIBILIDADE
════════════════════════════════════════════════════════════════════
`;

    if (diagnostics.issues.length === 0) {
      report += "\n✅ Nenhum problema de compatibilidade detectado!\n";
    } else {
      diagnostics.issues.forEach((issue, i) => {
        report += `
[${i + 1}] ${issue.device}
    Problema: ${issue.issue}
    Severidade: ${issue.severity.toUpperCase()}
    Soluções Possíveis:
${issue.possibleSolutions.map((s, j) => `      ${j + 1}. ${s}`).join('\n')}
`;
      });
    }

    report += `
════════════════════════════════════════════════════════════════════
                        DISPOSITIVOS COM ERRO
════════════════════════════════════════════════════════════════════
`;

    const errorDevices = diagnostics.devices.filter(d => d.status === 'error');
    if (errorDevices.length === 0) {
      report += "\n✅ Todos os dispositivos estão funcionando corretamente!\n";
    } else {
      errorDevices.forEach((device, i) => {
        report += `
[${i + 1}] ${device.name}
    Fabricante: ${device.manufacturer || 'N/A'}
    Driver: ${device.driver || 'N/A'} (${device.driverVersion || 'N/A'})
    Código de Erro: ${device.problemCode}
    Problema: ${device.problemDescription || 'Desconhecido'}
    Solução: ${device.solution || 'Verificar documentação'}
`;
      });
    }

    report += `
════════════════════════════════════════════════════════════════════
                         ERROS RECENTES
════════════════════════════════════════════════════════════════════
`;

    const errorLogs = diagnostics.logs.filter(l => l.level === 'error' || l.level === 'critical').slice(0, 20);
    if (errorLogs.length === 0) {
      report += "\n✅ Nenhum erro crítico nos logs recentes!\n";
    } else {
      errorLogs.forEach((log, i) => {
        const date = new Date(log.timestamp).toLocaleString('pt-BR');
        report += `
[${date}] [${log.level.toUpperCase()}] ${log.source}
    ID do Evento: ${log.eventId}
    ${log.message.substring(0, 200)}${log.message.length > 200 ? '...' : ''}
`;
      });
    }

    report += `
════════════════════════════════════════════════════════════════════
                      ALTERAÇÕES RECENTES
════════════════════════════════════════════════════════════════════
`;

    diagnostics.changes.slice(0, 15).forEach((change, i) => {
      const date = new Date(change.timestamp).toLocaleString('pt-BR');
      const typeLabel = {
        install: '📦 Instalação',
        uninstall: '🗑️ Desinstalação',
        update: '🔄 Atualização',
        driver: '🔧 Driver',
        config: '⚙️ Configuração',
        hardware: '🖥️ Hardware'
      }[change.type] || '📋 Alteração';
      
      report += `
[${date}] ${typeLabel}
    ${change.description}
    ${change.details || ''}
`;
    });

    report += `
════════════════════════════════════════════════════════════════════
                         FIM DO RELATÓRIO
════════════════════════════════════════════════════════════════════
`;

    // Salvar relatório
    const filename = `relatorio-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    const filepath = path.join(LOGS_DIR, filename);
    fs.writeFileSync(filepath, report, 'utf-8');

    res.json({ 
      success: true, 
      filename,
      filepath,
      report 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Configurar rotas
router.get("/", getDiagnostics);
router.get("/logs", getLogs);
router.get("/devices", getDevices);
router.get("/system", getSystem);
router.get("/history", getHistory);
router.get("/history/:filename", getHistoryFile);
router.post("/export", exportReport);

export default router;

