import { Request, Response, NextFunction } from 'express';
import { masterPrisma } from '../lib/masterPrisma';
import { AuthenticatedRequest } from './auth';

// Estender o tipo de Request para incluir dados da licença
export interface LicenseRequest extends AuthenticatedRequest {
  license?: {
    id: string;
    companyName: string;
    plan: string;
    status: string;
    features: any;
  };
}

/**
 * Middleware para validar licença do sistema
 * Este middleware verifica se a instalação tem uma licença válida
 * no servidor MASTER do Otávio
 */
export const validateLicense = async (
  req: LicenseRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = process.env.LICENSE_API_KEY;
    
    if (!apiKey) {
      console.error('LICENSE_API_KEY não configurada no .env');
      return res.status(500).json({ 
        error: 'Sistema não configurado corretamente. Entre em contato com o administrador.',
        code: 'MISSING_LICENSE_KEY'
      });
    }

    // Verificar licença no servidor master
    const license = await masterPrisma.licenseHolder.findUnique({
      where: { apiKey }
    });

    if (!license) {
      console.error('Licença não encontrada para apiKey:', apiKey);
      return res.status(401).json({ 
        error: 'Licença inválida. Entre em contato com o fornecedor.',
        code: 'INVALID_LICENSE'
      });
    }

    // Verificar status da licença
    if (license.licenseStatus === 'SUSPENDED') {
      return res.status(403).json({ 
        error: 'Sistema suspenso por falta de pagamento. Entre em contato com o fornecedor.',
        code: 'LICENSE_SUSPENDED',
        nextPayment: license.nextPayment,
        supportEmail: 'suporte@command-d.com.br'
      });
    }

    if (license.licenseStatus === 'EXPIRED') {
      return res.status(403).json({ 
        error: 'Licença expirada. Renove sua assinatura.',
        code: 'LICENSE_EXPIRED',
        expiryDate: license.licenseExpiry
      });
    }

    if (license.licenseStatus === 'BLOCKED') {
      return res.status(403).json({ 
        error: 'Sistema bloqueado. Entre em contato com o suporte.',
        code: 'LICENSE_BLOCKED'
      });
    }

    if (license.licenseStatus === 'CANCELLED') {
      return res.status(403).json({ 
        error: 'Licença cancelada.',
        code: 'LICENSE_CANCELLED'
      });
    }

    if (!license.isActive) {
      return res.status(403).json({ 
        error: 'Sistema desativado temporariamente.',
        code: 'SYSTEM_INACTIVE'
      });
    }

    // Verificar se está em trial e expirou
    if (license.licenseStatus === 'TRIAL' && license.trialEndsAt) {
      if (new Date() > new Date(license.trialEndsAt)) {
        // Atualizar status para EXPIRED
        await masterPrisma.licenseHolder.update({
          where: { id: license.id },
          data: { licenseStatus: 'EXPIRED' }
        });

        return res.status(403).json({ 
          error: 'Período de trial expirado. Assine um plano para continuar.',
          code: 'TRIAL_EXPIRED',
          trialEndsAt: license.trialEndsAt
        });
      }

      // Avisar se está próximo de expirar (5 dias)
      const daysUntilExpiry = Math.ceil((new Date(license.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 5) {
        res.setHeader('X-License-Warning', `Trial expira em ${daysUntilExpiry} dias`);
      }
    }

    // Verificar pagamento atrasado
    if (license.paymentStatus === 'OVERDUE') {
      res.setHeader('X-Payment-Warning', 'Pagamento em atraso. Sistema pode ser suspenso em breve.');
    }

    // Atualizar heartbeat (assíncrono, não bloqueia a request)
    masterPrisma.licenseHolder.update({
      where: { id: license.id },
      data: { 
        lastHeartbeat: new Date(),
        version: process.env.APP_VERSION || 'unknown'
      }
    }).catch(err => {
      console.error('Erro ao atualizar heartbeat:', err);
    });

    // Adicionar info da licença na request
    req.license = {
      id: license.id,
      companyName: license.companyName,
      plan: license.plan,
      status: license.licenseStatus,
      features: license.enabledFeatures as any
    };
    
    next();
  } catch (error) {
    console.error('Erro ao validar licença:', error);
    
    // Em caso de erro, permitir acesso (failsafe)
    // mas logar o erro para investigação
    console.warn('AVISO: Validação de licença falhou, permitindo acesso temporário');
    next();
  }
};

/**
 * Middleware mais leve - apenas verifica se a licença está ativa
 * Não bloqueia em caso de erro (para evitar downtime)
 */
export const checkLicenseStatus = async (
  req: LicenseRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = process.env.LICENSE_API_KEY;
    
    if (apiKey) {
      const license = await masterPrisma.licenseHolder.findUnique({
        where: { apiKey },
        select: {
          id: true,
          companyName: true,
          plan: true,
          licenseStatus: true,
          isActive: true,
          trialEndsAt: true,
          paymentStatus: true
        }
      });

      if (license) {
        req.license = {
          id: license.id,
          companyName: license.companyName,
          plan: license.plan,
          status: license.licenseStatus,
          features: null
        };

        // Avisos no header (não bloqueia)
        if (license.licenseStatus === 'TRIAL' && license.trialEndsAt) {
          const daysLeft = Math.ceil((new Date(license.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft >= 0) {
            res.setHeader('X-Trial-Days-Left', daysLeft.toString());
          }
        }

        if (license.paymentStatus === 'OVERDUE') {
          res.setHeader('X-Payment-Status', 'overdue');
        }
      }
    }
  } catch (error) {
    console.error('Erro no checkLicenseStatus:', error);
  }
  
  // Sempre passa (failsafe)
  next();
};

/**
 * Middleware para features específicas
 * Verifica se a licença tem acesso a uma feature
 */
export const requireFeature = (featureName: string) => {
  return (req: LicenseRequest, res: Response, next: NextFunction) => {
    if (!req.license) {
      return res.status(403).json({ 
        error: 'Licença não validada',
        code: 'LICENSE_NOT_VALIDATED'
      });
    }

    const features = req.license.features || {};
    
    if (!features[featureName]) {
      return res.status(403).json({ 
        error: `Feature "${featureName}" não habilitada no seu plano`,
        code: 'FEATURE_NOT_ENABLED',
        currentPlan: req.license.plan
      });
    }

    next();
  };
};

/**
 * Middleware para verificar limites do plano
 */
export const checkPlanLimits = async (
  req: LicenseRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = process.env.LICENSE_API_KEY;
    
    if (!apiKey) {
      return next();
    }

    const license = await masterPrisma.licenseHolder.findUnique({
      where: { apiKey },
      select: {
        plan: true,
        maxUsers: true,
        maxProducts: true
      }
    });

    if (license) {
      // Adicionar limites no header para o frontend
      res.setHeader('X-Plan-Max-Users', license.maxUsers.toString());
      res.setHeader('X-Plan-Max-Products', license.maxProducts.toString());
      res.setHeader('X-Plan-Type', license.plan);
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar limites do plano:', error);
    next();
  }
};

