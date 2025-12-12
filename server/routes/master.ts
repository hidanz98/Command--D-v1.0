import { Router, RequestHandler } from 'express';
import { masterPrisma } from '../lib/masterPrisma';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const router = Router();

// ==============================================
// ROTAS PARA O SERVIDOR MASTER (Otávio)
// ==============================================

/**
 * GET /api/master/licenses
 * Listar todas as licenças (Dashboard do Otávio)
 */
export const getLicenses: RequestHandler = async (req, res) => {
  try {
    const { status, plan, search } = req.query;

    const where: any = {};

    if (status) {
      where.licenseStatus = status;
    }

    if (plan) {
      where.plan = plan;
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search as string, mode: 'insensitive' } },
        { ownerEmail: { contains: search as string, mode: 'insensitive' } },
        { cnpj: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const licenses = await masterPrisma.licenseHolder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        payments: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            payments: true,
            invoices: true
          }
        }
      }
    });

    // Estatísticas gerais
    const stats = await masterPrisma.licenseHolder.groupBy({
      by: ['licenseStatus'],
      _count: true
    });

    const totalRevenue = await masterPrisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true }
    });

    res.json({
      success: true,
      data: {
        licenses,
        stats: {
          byStatus: stats,
          totalRevenue: totalRevenue._sum.amount || 0,
          totalLicenses: licenses.length
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar licenças:', error);
    res.status(500).json({ error: 'Erro ao buscar licenças' });
  }
};

/**
 * POST /api/master/licenses
 * Criar nova licença (quando nova locadora contratar)
 */
export const createLicense: RequestHandler = async (req, res) => {
  try {
    const {
      companyName,
      cnpj,
      ownerName,
      ownerEmail,
      ownerPhone,
      ownerAddress,
      plan = 'TRIAL',
      subdomain,
      serverUrl,
      serverIp,
      enabledFeatures
    } = req.body;

    // Validações
    if (!companyName || !ownerName || !ownerEmail || !ownerPhone || !subdomain) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: companyName, ownerName, ownerEmail, ownerPhone, subdomain' 
      });
    }

    // Verificar se subdomain já existe
    const existingSubdomain = await masterPrisma.licenseHolder.findUnique({
      where: { subdomain }
    });

    if (existingSubdomain) {
      return res.status(400).json({ error: 'Subdomain já existe' });
    }

    // Verificar se email já existe
    const existingEmail = await masterPrisma.licenseHolder.findFirst({
      where: { ownerEmail }
    });

    if (existingEmail) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Gerar chaves de API
    const apiKey = `cmd_${crypto.randomBytes(16).toString('hex')}`;
    const apiSecret = crypto.randomBytes(32).toString('hex');
    const apiSecretHash = await bcrypt.hash(apiSecret, 10);

    // Gerar license key
    const licenseKey = `LICENSE-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    // Calcular valores
    let monthlyFee = 0;
    let maxUsers = 3;
    let maxProducts = 100;

    switch (plan) {
      case 'TRIAL':
        monthlyFee = 0;
        maxUsers = 3;
        maxProducts = 50;
        break;
      case 'BASIC':
        monthlyFee = 200;
        maxUsers = 3;
        maxProducts = 100;
        break;
      case 'PRO':
        monthlyFee = 500;
        maxUsers = 10;
        maxProducts = 500;
        break;
      case 'ENTERPRISE':
        monthlyFee = 1000;
        maxUsers = 9999;
        maxProducts = 9999;
        break;
    }

    // Trial expira em 30 dias
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);

    // Próximo pagamento
    const nextPayment = new Date();
    nextPayment.setMonth(nextPayment.getMonth() + 1);

    // Definir data de expiração
    const expiryDate = plan === 'TRIAL' ? trialEndsAt : new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    const license = await masterPrisma.licenseHolder.create({
      data: {
        companyName,
        cnpj,
        email: ownerEmail || companyName + '@tempmail.com',
        ownerName,
        ownerEmail,
        ownerPhone,
        address: ownerAddress,
        licenseKey,
        licenseStatus: plan === 'TRIAL' ? 'TRIAL' : 'ACTIVE',
        trialEndsAt: plan === 'TRIAL' ? trialEndsAt : null,
        expiryDate: expiryDate,
        plan,
        monthlyFee,
        maxUsers,
        maxProducts,
        subdomain,
        apiKey,
        isActive: true,
        enabledFeatures: enabledFeatures || {
          nfse: true,
          erp: true,
          timesheet: true,
          partnerships: false
        },
        paymentStatus: plan === 'TRIAL' ? 'PENDING' : 'PENDING',
        nextPayment: plan === 'TRIAL' ? trialEndsAt : nextPayment
      }
    });

    // Log de auditoria
    await masterPrisma.masterAuditLog.create({
      data: {
        action: 'license_created',
        entity: 'license',
        metadata: {
          entityId: license.id,
          details: {
            companyName,
            plan,
            subdomain
          }
        },
        licenseHolderId: license.id
      }
    });

    res.status(201).json({
      success: true,
      data: {
        license,
        credentials: {
          apiKey,
          apiSecret, // IMPORTANTE: Mostrar apenas 1 vez!
          licenseKey
        }
      }
    });
  } catch (error) {
    console.error('Erro ao criar licença:', error);
    res.status(500).json({ error: 'Erro ao criar licença' });
  }
};

/**
 * PUT /api/master/licenses/:id
 * Atualizar licença
 */
export const updateLicense: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Não permitir atualizar certas coisas diretamente
    delete updates.apiKey;
    delete updates.apiSecret;
    delete updates.licenseKey;
    delete updates.totalRevenue;

    const license = await masterPrisma.licenseHolder.update({
      where: { id },
      data: updates
    });

    await masterPrisma.masterAuditLog.create({
      data: {
        licenseHolderId: id,
        action: 'license_updated',
        entity: 'license',
        metadata: {
          entityId: id,
          details: updates
        }
      }
    });

    res.json({
      success: true,
      data: { license }
    });
  } catch (error) {
    console.error('Erro ao atualizar licença:', error);
    res.status(500).json({ error: 'Erro ao atualizar licença' });
  }
};

/**
 * POST /api/master/licenses/:id/suspend
 * Suspender licença (por falta de pagamento)
 */
export const suspendLicense: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const license = await masterPrisma.licenseHolder.update({
      where: { id },
      data: {
        licenseStatus: 'SUSPENDED',
        isActive: false
      }
    });

    await masterPrisma.masterAuditLog.create({
      data: {
        licenseHolderId: id,
        action: 'license_suspended',
        entity: 'license',
        metadata: {
          entityId: id,
          details: { reason }
        }
      }
    });

    res.json({
      success: true,
      data: { license }
    });
  } catch (error) {
    console.error('Erro ao suspender licença:', error);
    res.status(500).json({ error: 'Erro ao suspender licença' });
  }
};

/**
 * POST /api/master/licenses/:id/activate
 * Reativar licença
 */
export const activateLicense: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const license = await masterPrisma.licenseHolder.update({
      where: { id },
      data: {
        licenseStatus: 'ACTIVE',
        isActive: true
      }
    });

    await masterPrisma.masterAuditLog.create({
      data: {
        licenseHolderId: id,
        action: 'license_activated',
        entity: 'license',
        metadata: {
          entityId: id
        }
      }
    });

    res.json({
      success: true,
      data: { license }
    });
  } catch (error) {
    console.error('Erro ao ativar licença:', error);
    res.status(500).json({ error: 'Erro ao ativar licença' });
  }
};

/**
 * POST /api/master/heartbeat
 * Receber heartbeat das instalações (chamado pelas locadoras)
 */
export const receiveHeartbeat: RequestHandler = async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API Key requerida' });
    }

    const { version, metrics } = req.body;

    const license = await masterPrisma.licenseHolder.findUnique({
      where: { apiKey }
    });

    if (!license) {
      return res.status(404).json({ error: 'Licença não encontrada' });
    }

    // Atualizar heartbeat
    await masterPrisma.licenseHolder.update({
      where: { id: license.id },
      data: {
        lastHeartbeat: new Date(),
        version
      }
    });

    // Retornar status da licença
    res.json({
      success: true,
      data: {
        licenseStatus: license.licenseStatus,
        isActive: license.isActive,
        plan: license.plan,
        expiresAt: license.licenseExpiry,
        features: license.enabledFeatures
      }
    });
  } catch (error) {
    console.error('Erro ao processar heartbeat:', error);
    res.status(500).json({ error: 'Erro ao processar heartbeat' });
  }
};

/**
 * POST /api/master/payments
 * Registrar pagamento
 */
export const registerPayment: RequestHandler = async (req, res) => {
  try {
    const {
      licenseHolderId,
      amount,
      referenceMonth,
      paymentMethod,
      transactionId
    } = req.body;

    // Payment precisa de tenantId, então vamos usar Invoice para LicenseHolder
    // Atualizar a Invoice como paga
    const invoice = await masterPrisma.invoice.findFirst({
      where: {
        licenseHolderId,
        referenceMonth
      }
    });

    if (invoice) {
      await masterPrisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'paid',
          paidAt: new Date()
        }
      });
    }

    // Atualizar status da licença
    await masterPrisma.licenseHolder.update({
      where: { id: licenseHolderId },
      data: {
        paymentStatus: 'PAID',
        lastPayment: new Date(),
        nextPayment: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        licenseStatus: 'ACTIVE',
        isActive: true,
        totalRevenue: {
          increment: amount
        }
      }
    });

    await masterPrisma.masterAuditLog.create({
      data: {
        licenseHolderId: licenseHolderId,
        action: 'payment_received',
        entity: 'invoice',
        metadata: {
          entityId: invoice?.id || 'unknown',
          details: { amount, licenseHolderId, referenceMonth }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: { invoice, message: 'Pagamento registrado com sucesso' }
    });
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    res.status(500).json({ error: 'Erro ao registrar pagamento' });
  }
};

/**
 * GET /api/master/dashboard
 * Dashboard principal do Otávio
 */
export const getDashboard: RequestHandler = async (req, res) => {
  try {
    // Total de licenças
    const totalLicenses = await masterPrisma.licenseHolder.count();
    
    // Licenças ativas
    const activeLicenses = await masterPrisma.licenseHolder.count({
      where: { licenseStatus: 'ACTIVE' }
    });

    // Em trial
    const trialLicenses = await masterPrisma.licenseHolder.count({
      where: { licenseStatus: 'TRIAL' }
    });

    // Suspensas
    const suspendedLicenses = await masterPrisma.licenseHolder.count({
      where: { licenseStatus: 'SUSPENDED' }
    });

    // Receita total
    const totalRevenue = await masterPrisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true }
    });

    // Receita mensal (mês atual)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = await masterPrisma.payment.aggregate({
      where: {
        status: 'PAID',
        paidAt: { gte: startOfMonth }
      },
      _sum: { amount: true }
    });

    // Pagamentos pendentes
    const pendingPayments = await masterPrisma.payment.count({
      where: { status: 'PENDING' }
    });

    // Receita por plano
    const revenueByPlan = await masterPrisma.licenseHolder.groupBy({
      by: ['plan'],
      _sum: { totalRevenue: true },
      _count: true
    });

    // Últimas licenças criadas
    const recentLicenses = await masterPrisma.licenseHolder.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        plan: true,
        licenseStatus: true,
        createdAt: true,
        lastHeartbeat: true
      }
    });

    // Sistemas offline (sem heartbeat há mais de 1 hora)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const offlineSystems = await masterPrisma.licenseHolder.count({
      where: {
        isActive: true,
        lastHeartbeat: { lt: oneHourAgo }
      }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalLicenses,
          activeLicenses,
          trialLicenses,
          suspendedLicenses,
          offlineSystems
        },
        revenue: {
          total: totalRevenue._sum.amount || 0,
          monthly: monthlyRevenue._sum.amount || 0,
          pending: pendingPayments,
          byPlan: revenueByPlan
        },
        recentLicenses
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ error: 'Erro ao buscar dashboard' });
  }
};

// Exportar router
export default router;

