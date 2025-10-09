/**
 * MIDDLEWARE DE TENANT
 * 
 * Valida e injeta o tenantId nas requisições
 */

import { Request, Response, NextFunction } from 'express';

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
export const requireTenant = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Tenta pegar do header primeiro
    let tenantId = req.headers['x-tenant-id'] as string;

    // Se não tem no header, tenta pegar do usuário autenticado
    if (!tenantId && req.userId) {
      // Por enquanto, usa um tenant padrão
      // TODO: Buscar tenantId do usuário no banco
      tenantId = 'default-tenant';
    }

    // Se ainda não tem, retorna erro
    if (!tenantId) {
      return res.status(400).json({
        error: 'Tenant ID obrigatório',
        message: 'Envie o header x-tenant-id ou faça login'
      });
    }

    // Injeta o tenantId no request
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

