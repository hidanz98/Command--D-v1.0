/**
 * JOB: VERIFICADOR DE LICENÇAS (Roda no servidor MASTER do Otávio)
 * 
 * Este job verifica periodicamente:
 * - Licenças trial que expiraram
 * - Pagamentos atrasados
 * - Sistemas offline há muito tempo
 * - E toma ações automáticas (suspender, avisar, etc)
 */

import { masterPrisma } from '../lib/masterPrisma';

// Rodar a cada hora
const CHECK_INTERVAL = 60 * 60 * 1000;

/**
 * Verificar e expirar trials
 */
async function checkExpiredTrials() {
  try {
    const now = new Date();
    
    const expiredTrials = await masterPrisma.licenseHolder.findMany({
      where: {
        licenseStatus: 'TRIAL',
        trialEndsAt: {
          lt: now
        }
      }
    });

    for (const license of expiredTrials) {
      console.log(`⏰ Trial expirado: ${license.companyName} (${license.subdomain})`);
      
      // Marcar como expirado
      await masterPrisma.licenseHolder.update({
        where: { id: license.id },
        data: {
          licenseStatus: 'EXPIRED',
          isActive: false
        }
      });

      // Log de auditoria
      await masterPrisma.masterAuditLog.create({
        data: {
          action: 'license_expired',
          entity: 'license',
          metadata: {
            entityId: license.id,
            details: {
              companyName: license.companyName,
              trialEndsAt: license.trialEndsAt,
              reason: 'Trial period ended'
            }
          },
          licenseHolderId: license.id
        }
      });

      // TODO: Enviar email para o dono da locadora
      console.log(`📧 [TODO] Enviar email para ${license.ownerEmail} sobre trial expirado`);
    }

    console.log(`✅ Verificação de trials: ${expiredTrials.length} expirados`);
  } catch (error) {
    console.error('Erro ao verificar trials expirados:', error);
  }
}

/**
 * Verificar pagamentos atrasados e suspender
 */
async function checkOverduePayments() {
  try {
    const now = new Date();
    const gracePeriod = new Date();
    gracePeriod.setDate(gracePeriod.getDate() - 7); // 7 dias de tolerância

    // Buscar licenças ativas com pagamento vencido há mais de 7 dias
    const overduePayments = await masterPrisma.licenseHolder.findMany({
      where: {
        licenseStatus: 'ACTIVE',
        paymentStatus: 'OVERDUE',
        nextPayment: {
          lt: gracePeriod
        }
      }
    });

    for (const license of overduePayments) {
      console.log(`💳 Pagamento atrasado (>7 dias): ${license.companyName}`);
      
      // Suspender licença
      await masterPrisma.licenseHolder.update({
        where: { id: license.id },
        data: {
          licenseStatus: 'SUSPENDED',
          isActive: false
        }
      });

      // Log
      await masterPrisma.masterAuditLog.create({
        data: {
          action: 'license_suspended',
          entity: 'license',
          metadata: {
            entityId: license.id,
            details: {
              reason: 'Payment overdue (>7 days)',
              lastPayment: license.lastPayment,
              nextPayment: license.nextPayment
            }
          },
          licenseHolderId: license.id
        }
      });

      // TODO: Enviar email
      console.log(`📧 [TODO] Enviar email de suspensão para ${license.ownerEmail}`);
    }

    // Avisar sobre pagamentos que vencem em breve (próximos 3 dias)
    const upcomingPayments = new Date();
    upcomingPayments.setDate(upcomingPayments.getDate() + 3);

    const paymentsDueSoon = await masterPrisma.licenseHolder.findMany({
      where: {
        licenseStatus: 'ACTIVE',
        paymentStatus: 'PENDING',
        nextPayment: {
          gte: now,
          lte: upcomingPayments
        }
      }
    });

    for (const license of paymentsDueSoon) {
      console.log(`📅 Pagamento vence em breve: ${license.companyName}`);
      // TODO: Enviar lembrete
    }

    console.log(`✅ Verificação de pagamentos: ${overduePayments.length} suspensos, ${paymentsDueSoon.length} alertas`);
  } catch (error) {
    console.error('Erro ao verificar pagamentos:', error);
  }
}

/**
 * Verificar sistemas offline
 */
async function checkOfflineSystems() {
  try {
    const threshold = new Date();
    threshold.setHours(threshold.getHours() - 24); // 24 horas sem heartbeat

    const offlineSystems = await masterPrisma.licenseHolder.findMany({
      where: {
        isActive: true,
        lastHeartbeat: {
          lt: threshold
        }
      }
    });

    for (const license of offlineSystems) {
      const hoursOffline = Math.floor((Date.now() - new Date(license.lastHeartbeat!).getTime()) / (1000 * 60 * 60));
      
      console.log(`📡 Sistema offline há ${hoursOffline}h: ${license.companyName}`);
      
      // TODO: Enviar alerta para o Otávio
      // TODO: Enviar email para a locadora
    }

    console.log(`✅ Verificação de sistemas offline: ${offlineSystems.length} encontrados`);
  } catch (error) {
    console.error('Erro ao verificar sistemas offline:', error);
  }
}

/**
 * Gerar faturas mensais automaticamente
 */
async function generateMonthlyInvoices() {
  try {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Buscar licenças ativas que precisam de fatura
    const licensesNeedingInvoice = await masterPrisma.licenseHolder.findMany({
      where: {
        licenseStatus: 'ACTIVE',
        plan: {
          not: 'TRIAL'
        }
      },
      include: {
        invoices: {
          where: {
            referenceMonth: currentMonthStr
          }
        }
      }
    });

    let generated = 0;

    for (const license of licensesNeedingInvoice) {
      // Se já tem fatura este mês, pular
      if (license.invoices && license.invoices.length > 0) {
        continue;
      }

      // Criar invoice
      await masterPrisma.invoice.create({
        data: {
          licenseHolderId: license.id,
          referenceMonth: currentMonthStr,
          amount: license.monthlyFee || 0,
          status: 'pending',
          dueDate: new Date(now.getFullYear(), now.getMonth(), 10), // Dia 10 de cada mês
          description: `Fatura mensal - ${license.plan}`
        }
      });

      // Payment para LicenseHolder está na Invoice, não criar Payment separado

      generated++;
      console.log(`📄 Fatura gerada para ${license.companyName} - R$ ${license.monthlyFee}`);
    }

    console.log(`✅ Faturas geradas: ${generated}`);
  } catch (error) {
    console.error('Erro ao gerar faturas:', error);
  }
}

/**
 * Executar todas as verificações
 */
export async function runLicenseChecks() {
  console.log('🔍 Iniciando verificação de licenças...');
  
  await checkExpiredTrials();
  await checkOverduePayments();
  await checkOfflineSystems();
  
  // Gerar faturas apenas no dia 1º do mês
  const now = new Date();
  if (now.getDate() === 1) {
    await generateMonthlyInvoices();
  }
  
  console.log('✅ Verificação de licenças concluída\n');
}

/**
 * Iniciar job de verificação
 */
export function startLicenseChecker() {
  console.log('🤖 License Checker iniciado');
  
  // Executar imediatamente
  runLicenseChecks();
  
  // Depois executar a cada hora
  setInterval(runLicenseChecks, CHECK_INTERVAL);
}

