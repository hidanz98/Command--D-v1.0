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
    // Garantir que sempre retornamos JSON
    res.setHeader('Content-Type', 'application/json');
    
    // 1) Header tem prioridade
    let tenantId = req.headers['x-tenant-id'] as string;

    // 2) Sem header: tente obter o tenant padrão do banco
    if (!tenantId) {
      try {
        const tenant = await prisma.tenant.findFirst({ orderBy: { createdAt: 'asc' } });
        if (tenant) tenantId = tenant.id;
      } catch (dbError: any) {
        console.error('❌ Erro ao buscar tenant no banco:', dbError);
        // Continuar mesmo se der erro (pode ser que não exista tenant ainda)
      }
    }

    if (!tenantId) {
      console.warn('⚠️ Tenant ID não encontrado para:', req.url);
      return res.status(400).json({
        success: false,
        error: 'Tenant ID obrigatório',
        message: 'Nenhum tenant encontrado. Crie um tenant ou envie o header x-tenant-id.'
      });
    }

    req.tenantId = tenantId;
    next();
  } catch (error: any) {
    console.error('❌ Erro no middleware de tenant:', error);
    console.error('Stack:', error?.stack);
    
    // Garantir que sempre retornamos JSON, mesmo em erro
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        error: 'Erro ao processar tenant',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
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

