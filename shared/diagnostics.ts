// Interfaces para o sistema de diagnóstico do PC

export interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  eventId: number;
  message: string;
  category: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'hardware' | 'driver' | 'software';
  status: 'ok' | 'warning' | 'error' | 'unknown';
  manufacturer?: string;
  driver?: string;
  driverVersion?: string;
  driverDate?: string;
  problemCode?: number;
  problemDescription?: string;
  solution?: string;
}

export interface SystemInfo {
  os: {
    name: string;
    version: string;
    build: string;
    architecture: string;
  };
  cpu: {
    name: string;
    cores: number;
    threads: number;
    speed: string;
    usage: number;
  };
  memory: {
    total: number;
    available: number;
    used: number;
    usagePercent: number;
  };
  disk: {
    drives: Array<{
      letter: string;
      total: number;
      free: number;
      used: number;
      usagePercent: number;
    }>;
  };
  gpu?: {
    name: string;
    driver: string;
    memory: string;
  };
  uptime: number;
  lastBoot: string;
}

export interface SystemChange {
  id: string;
  timestamp: Date;
  type: 'install' | 'uninstall' | 'update' | 'driver' | 'config' | 'hardware';
  description: string;
  details?: string;
  user?: string;
}

export interface CompatibilityIssue {
  id: string;
  device: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  possibleSolutions: string[];
  status: 'detected' | 'investigating' | 'resolved';
  detectedAt: Date;
}

export interface DiagnosticsResponse {
  systemInfo: SystemInfo;
  logs: SystemLog[];
  devices: DeviceInfo[];
  changes: SystemChange[];
  issues: CompatibilityIssue[];
  generatedAt: Date;
}

export interface LogFilter {
  level?: string[];
  source?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

// Códigos de erro comuns do Windows e suas soluções
export const WINDOWS_ERROR_SOLUTIONS: Record<number, { description: string; solutions: string[] }> = {
  1: {
    description: 'Dispositivo não está configurado corretamente',
    solutions: [
      'Reinstalar o driver do dispositivo',
      'Verificar se há atualizações de driver disponíveis',
      'Executar o solucionador de problemas do Windows'
    ]
  },
  3: {
    description: 'Driver do dispositivo pode estar corrompido',
    solutions: [
      'Desinstalar e reinstalar o driver',
      'Baixar driver do site do fabricante',
      'Usar a restauração do sistema para voltar a um ponto anterior'
    ]
  },
  10: {
    description: 'Dispositivo não pode iniciar',
    solutions: [
      'Reiniciar o computador',
      'Atualizar o driver do dispositivo',
      'Verificar conexões físicas do hardware'
    ]
  },
  12: {
    description: 'Dispositivo não encontrou recursos suficientes',
    solutions: [
      'Desativar outros dispositivos para liberar recursos',
      'Atualizar BIOS/UEFI',
      'Verificar conflitos de IRQ no Gerenciador de Dispositivos'
    ]
  },
  14: {
    description: 'Dispositivo requer reinicialização',
    solutions: [
      'Reiniciar o computador para aplicar mudanças'
    ]
  },
  18: {
    description: 'Reinstalar drivers do dispositivo',
    solutions: [
      'Desinstalar o dispositivo no Gerenciador de Dispositivos',
      'Reiniciar o computador para reinstalação automática',
      'Baixar e instalar driver manualmente do fabricante'
    ]
  },
  19: {
    description: 'Registro do Windows pode estar corrompido',
    solutions: [
      'Executar sfc /scannow no Prompt de Comando',
      'Usar a restauração do sistema',
      'Reinstalar o driver do dispositivo'
    ]
  },
  21: {
    description: 'Windows está removendo o dispositivo',
    solutions: [
      'Aguardar alguns segundos e reiniciar',
      'Se persistir, verificar o hardware fisicamente'
    ]
  },
  22: {
    description: 'Dispositivo foi desativado',
    solutions: [
      'Habilitar o dispositivo no Gerenciador de Dispositivos',
      'Clicar com botão direito > Ativar dispositivo'
    ]
  },
  24: {
    description: 'Dispositivo não presente ou não funcionando corretamente',
    solutions: [
      'Verificar se o dispositivo está conectado',
      'Testar em outra porta/slot',
      'Verificar se o dispositivo precisa de energia adicional'
    ]
  },
  28: {
    description: 'Drivers não estão instalados',
    solutions: [
      'Baixar drivers do site do fabricante',
      'Usar o Windows Update para buscar drivers',
      'Executar o solucionador de problemas de hardware'
    ]
  },
  29: {
    description: 'Dispositivo desativado no firmware (BIOS/UEFI)',
    solutions: [
      'Entrar na BIOS/UEFI e habilitar o dispositivo',
      'Verificar configurações de boot seguro'
    ]
  },
  31: {
    description: 'Windows não consegue carregar os drivers',
    solutions: [
      'Atualizar o Windows',
      'Reinstalar os drivers do dispositivo',
      'Verificar compatibilidade do driver com a versão do Windows'
    ]
  },
  32: {
    description: 'Driver de serviço foi desabilitado',
    solutions: [
      'Verificar serviços do Windows (services.msc)',
      'Definir o serviço do driver para iniciar automaticamente'
    ]
  },
  33: {
    description: 'Windows não pode determinar recursos necessários',
    solutions: [
      'Atualizar BIOS/UEFI do sistema',
      'Verificar documentação do hardware para requisitos'
    ]
  },
  34: {
    description: 'Windows não pode determinar configurações',
    solutions: [
      'Configurar manualmente os recursos no Gerenciador de Dispositivos',
      'Consultar documentação do hardware'
    ]
  },
  35: {
    description: 'Firmware não tem informações suficientes',
    solutions: [
      'Atualizar BIOS/UEFI',
      'Contatar fabricante do computador'
    ]
  },
  36: {
    description: 'Dispositivo solicitando interrupção PCI',
    solutions: [
      'Atualizar BIOS/UEFI',
      'Verificar configurações de IRQ na BIOS'
    ]
  },
  37: {
    description: 'Driver retornou falha',
    solutions: [
      'Reinstalar o driver',
      'Tentar versão anterior do driver',
      'Contatar suporte do fabricante'
    ]
  },
  38: {
    description: 'Driver anterior ainda na memória',
    solutions: [
      'Reiniciar o computador',
      'Desinstalar completamente e reinstalar o driver'
    ]
  },
  39: {
    description: 'Driver corrompido ou ausente',
    solutions: [
      'Reinstalar o driver do dispositivo',
      'Executar verificação de arquivos do sistema',
      'Restaurar sistema para ponto anterior'
    ]
  },
  40: {
    description: 'Informações de registro do serviço incorretas',
    solutions: [
      'Reinstalar o driver',
      'Verificar entradas de registro relacionadas'
    ]
  },
  41: {
    description: 'Driver carregado mas dispositivo não encontrado',
    solutions: [
      'Verificar conexão física do dispositivo',
      'Testar dispositivo em outro computador',
      'Verificar se há danos físicos'
    ]
  },
  42: {
    description: 'Dispositivo duplicado no sistema',
    solutions: [
      'Desinstalar um dos dispositivos duplicados',
      'Reiniciar o computador'
    ]
  },
  43: {
    description: 'Driver reportou falha do dispositivo',
    solutions: [
      'Reiniciar o computador',
      'Atualizar ou reinstalar o driver',
      'Verificar se o hardware está com defeito'
    ]
  },
  44: {
    description: 'Aplicativo ou serviço desligou o dispositivo',
    solutions: [
      'Reiniciar o computador',
      'Verificar quais programas podem estar interferindo'
    ]
  },
  45: {
    description: 'Dispositivo não está conectado',
    solutions: [
      'Conectar o dispositivo',
      'Verificar cabos e conexões',
      'Testar em outra porta'
    ]
  },
  46: {
    description: 'Windows está desligando',
    solutions: [
      'Aguardar conclusão do desligamento e reiniciar'
    ]
  },
  47: {
    description: 'Windows preparando para remoção segura',
    solutions: [
      'Usar a opção "Remover hardware com segurança"',
      'Aguardar conclusão do processo'
    ]
  },
  48: {
    description: 'Software do dispositivo foi bloqueado',
    solutions: [
      'Verificar se o driver é compatível com o Windows',
      'Baixar driver certificado do fabricante',
      'Desativar assinatura de driver (não recomendado)'
    ]
  },
  49: {
    description: 'Registro do sistema excedeu tamanho limite',
    solutions: [
      'Executar limpeza de disco',
      'Verificar e reparar registro do Windows'
    ]
  },
  50: {
    description: 'Windows não pode aplicar propriedades',
    solutions: [
      'Reinstalar o driver',
      'Executar verificação de integridade do sistema'
    ]
  },
  51: {
    description: 'Dispositivo aguardando outro dispositivo',
    solutions: [
      'Verificar se todos os dispositivos relacionados estão funcionando',
      'Instalar drivers de dispositivos dependentes'
    ]
  },
  52: {
    description: 'Assinatura do driver não pôde ser verificada',
    solutions: [
      'Baixar driver oficial do fabricante',
      'Verificar integridade do download',
      'Desativar verificação de assinatura temporariamente'
    ]
  },
  53: {
    description: 'Dispositivo reservado para depurador do kernel',
    solutions: [
      'Desativar depuração do kernel se não necessária',
      'Verificar configurações de boot'
    ]
  },
  54: {
    description: 'Dispositivo UEFI falhou e precisa de reinicialização',
    solutions: [
      'Reiniciar o computador',
      'Atualizar BIOS/UEFI'
    ]
  },
  56: {
    description: 'Windows verificando drivers para modo de exibição',
    solutions: [
      'Aguardar conclusão da verificação',
      'Atualizar drivers de vídeo'
    ]
  }
};

