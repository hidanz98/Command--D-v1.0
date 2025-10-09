import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../lib/auth';
import { prisma } from '../lib/prisma';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
    role: string;
    email: string;
  };
  tenantId?: string;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const payload = AuthService.verifyToken(token);
    if (!payload) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { tenant: true }
    });

    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'User not found or inactive' });
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireTenant = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Add tenantId to request for easy access
  req.tenantId = req.user.tenantId;
  next();
};
