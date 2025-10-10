/**
 * MIDDLEWARE DE TENANT
 * 
 * Valida e injeta o tenantId nas requisições
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

/**
 * Middleware que requer tenantId
 * Extrai do header x-tenant-id ou do usuário autenticado
 */
export const requireTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) Header tem prioridade
    let tenantId = req.headers['x-tenant-id'] as string;

    // 2) Sem header: tente obter o tenant padrão do banco
    if (!tenantId) {
      const tenant = await prisma.tenant.findFirst({ orderBy: { createdAt: 'asc' } });
      if (tenant) tenantId = tenant.id;
    }

    if (!tenantId) {
      return res.status(400).json({
        error: 'Tenant ID obrigatório',
        message: 'Nenhum tenant encontrado. Crie um tenant ou envie o header x-tenant-id.'
      });
    }

    req.tenantId = tenantId;
    next();
  } catch (error) {
    console.error('Erro no middleware de tenant:', error);
    res.status(500).json({ error: 'Erro ao processar tenant' });
  }
};

/**
 * Middleware opcional de tenant
 * Injeta se existir, mas não bloqueia se não existir
 */
export const optionalTenant = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (tenantId) {
      req.tenantId = tenantId;
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de tenant:', error);
    next();
  }
};

