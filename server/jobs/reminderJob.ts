import { prisma } from '../lib/prisma';
import { EmailService } from '../lib/EmailService';

/**
 * Job que envia lembretes de devolução para pedidos próximos do vencimento
 * Executa diariamente às 9h da manhã
 */
export async function sendRentalReminders() {
  try {
    console.log('🔔 Iniciando envio de lembretes de devolução...');

    // Buscar todos os tenants ativos
    const tenants = await prisma.tenant.findMany({
      where: { isActive: true },
      include: {
        tenantSettings: true
      }
    });

    for (const tenant of tenants) {
      const settings = tenant.tenantSettings;
      
      // Verificar se email está habilitado
      if (!settings || !settings.emailEnabled) {
        continue;
      }

      // Calcular datas relevantes
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Buscar pedidos que vencem amanhã
      const orders = await prisma.order.findMany({
        where: {
          tenantId: tenant.id,
          status: 'CONFIRMED',
          endDate: {
            gte: tomorrow,
            lt: dayAfterTomorrow
          }
        },
        include: {
          client: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      console.log(`📧 Encontrados ${orders.length} pedidos para ${tenant.name}`);

      // Enviar lembretes
      const emailService = new EmailService(settings);
      
      for (const order of orders) {
        if (!order.client.email) {
          continue;
        }

        try {
          await emailService.sendReturnReminder(
            order.client.email,
            order.client.name,
            order.orderNumber,
            order.endDate
          );
          
          console.log(`✅ Lembrete enviado para ${order.client.email} (Pedido: ${order.orderNumber})`);
        } catch (error) {
          console.error(`❌ Erro ao enviar lembrete para ${order.client.email}:`, error);
        }
      }
    }

    console.log('✅ Processamento de lembretes concluído!');
  } catch (error) {
    console.error('❌ Erro ao processar lembretes:', error);
  }
}

/**
 * Inicializa o cron job de lembretes
 * Executa diariamente às 9h
 */
export function startReminderJob() {
  // Executar imediatamente para teste
  console.log('🔔 Job de lembretes inicializado');

  // Executar a cada 24 horas (às 9h da manhã)
  const scheduleDaily = () => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(9, 0, 0, 0);

    // Se já passou das 9h hoje, agendar para amanhã
    if (now > scheduledTime) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilRun = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      sendRentalReminders();
      // Reagendar para o próximo dia
      setInterval(sendRentalReminders, 24 * 60 * 60 * 1000); // 24 horas
    }, timeUntilRun);

    console.log(`⏰ Próximo envio de lembretes agendado para: ${scheduledTime.toLocaleString('pt-BR')}`);
  };

  scheduleDaily();
}

