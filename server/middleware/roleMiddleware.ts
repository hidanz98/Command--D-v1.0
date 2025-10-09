/**
 * MIDDLEWARE DE ROLE (RBAC)
 * 
 * Controle de acesso baseado em roles
 */

import { Request, Response, NextFunction } from 'express';

// Tipos de roles disponíveis
export type UserRole = 'ADMIN' | 'CLIENT' | 'EMPLOYEE' | 'MASTER_ADMIN';

declare global {
  namespace Express {
    interface Request {
      userRole?: UserRole;
    }
  }
}

/**
 * Middleware que requer uma ou mais roles específicas
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verifica se o usuário está autenticado
      if (!req.userId) {
        return res.status(401).json({
          error: 'Não autenticado',
          message: 'Faça login para acessar este recurso'
        });
      }

      // Pega a role do usuário
      // TODO: Buscar role do banco de dados
      // Por enquanto, assume que veio no token JWT
      const userRole = req.userRole || 'CLIENT';

      // Verifica se a role está permitida
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você não tem permissão para acessar este recurso',
          requiredRoles: allowedRoles,
          yourRole: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de role:', error);
      res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
};

/**
 * Middleware que verifica se é admin
 */
export const requireAdmin = requireRole(['ADMIN', 'MASTER_ADMIN']);

/**
 * Middleware que verifica se é funcionário ou admin
 */
export const requireStaff = requireRole(['ADMIN', 'EMPLOYEE', 'MASTER_ADMIN']);

/**
 * Middleware que verifica se é master admin
 */
export const requireMasterAdmin = requireRole(['MASTER_ADMIN']);

