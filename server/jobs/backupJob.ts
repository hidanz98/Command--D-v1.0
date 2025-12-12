import { prisma } from '../lib/prisma';
import { BackupService } from '../lib/BackupService';

/**
 * Job que executa backups automáticos para todos os tenants
 */
export async function runAutomaticBackups() {
  try {
    console.log('💾 Iniciando backups automáticos...');

    // Buscar todos os tenants com backup automático habilitado
    const tenants = await prisma.tenant.findMany({
      where: { isActive: true },
      include: {
        tenantSettings: true
      }
    });

    for (const tenant of tenants) {
      const settings = tenant.tenantSettings;

      // Verificar se backup automático está habilitado
      if (!settings || !settings.autoBackupEnabled) {
        continue;
      }

      console.log(`📦 Iniciando backup para: ${tenant.name}`);

      const backupService = new BackupService(settings);

      const result = await backupService.createBackup({
        tenantId: tenant.id,
        tenantName: tenant.slug,
        compress: true
      });

      if (result.success) {
        console.log(`✅ Backup concluído para ${tenant.name}: ${result.filename}`);
      } else {
        console.error(`❌ Falha no backup para ${tenant.name}: ${result.error}`);
      }
    }

    console.log('✅ Backups automáticos concluídos!');
  } catch (error) {
    console.error('❌ Erro ao executar backups automáticos:', error);
  }
}

/**
 * Calcula o próximo horário de execução baseado na frequência
 */
function calculateNextRun(frequency: string): Date {
  const now = new Date();
  const next = new Date();

  switch (frequency) {
    case 'hourly':
      next.setHours(now.getHours() + 1, 0, 0, 0);
      break;
    case 'daily':
      next.setDate(now.getDate() + 1);
      next.setHours(2, 0, 0, 0); // 2h da manhã
      break;
    case 'weekly':
      next.setDate(now.getDate() + 7);
      next.setHours(2, 0, 0, 0); // 2h da manhã
      break;
    case 'monthly':
      next.setMonth(now.getMonth() + 1, 1);
      next.setHours(2, 0, 0, 0); // 2h da manhã do dia 1
      break;
    default:
      next.setDate(now.getDate() + 1);
      next.setHours(2, 0, 0, 0); // Padrão: diariamente às 2h
  }

  return next;
}

/**
 * Inicia o job de backup automático
 */
export function startBackupJob() {
  console.log('💾 Job de backup automático inicializado');

  // Executar backup inicial após 5 minutos (para não sobrecarregar a inicialização)
  setTimeout(() => {
    runAutomaticBackups();
  }, 5 * 60 * 1000);

  // Executar backups diariamente às 2h da manhã
  const scheduleDaily = () => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(2, 0, 0, 0);

    // Se já passou das 2h hoje, agendar para amanhã
    if (now > scheduledTime) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilRun = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      runAutomaticBackups();
      // Reagendar para o próximo dia
      setInterval(runAutomaticBackups, 24 * 60 * 60 * 1000); // 24 horas
    }, timeUntilRun);

    console.log(`⏰ Próximo backup automático agendado para: ${scheduledTime.toLocaleString('pt-BR')}`);
  };

  scheduleDaily();
}

/**
 * Cria um backup manual imediatamente
 */
export async function createManualBackup(tenantId: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { tenantSettings: true }
    });

    if (!tenant || !tenant.tenantSettings) {
      return {
        success: false,
        message: 'Tenant ou configurações não encontrados'
      };
    }

    const backupService = new BackupService(tenant.tenantSettings);

    const result = await backupService.createBackup({
      tenantId: tenant.id,
      tenantName: tenant.slug,
      compress: true
    });

    if (result.success) {
      return {
        success: true,
        message: 'Backup criado com sucesso',
        data: result
      };
    } else {
      return {
        success: false,
        message: result.error || 'Erro ao criar backup'
      };
    }
  } catch (error) {
    console.error('Erro ao criar backup manual:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

