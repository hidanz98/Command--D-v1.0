import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export interface JWTPayload {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      tenantId?: string;
      userRole?: string;
      userEmail?: string;
    }
  }
}

/**
 * Middleware de autenticação JWT
 * Valida token e injeta dados do usuário no request
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token não fornecido',
        message: 'Faça login para acessar este recurso'
      });
    }

    const payload = AuthService.verifyToken(token);

    if (!payload) {
      return res.status(403).json({
        error: 'Token inválido ou expirado',
        message: 'Faça login novamente'
      });
    }

    // Injeta dados no request
    req.userId = payload.userId;
    req.tenantId = payload.tenantId;
    req.userRole = payload.role;
    req.userEmail = payload.email;

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({ error: 'Erro ao validar autenticação' });
  }
};

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  static async authenticateUser(email: string, password: string) {
    console.log('🔐 Tentativa de login:', { email, passwordLength: password?.length });
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenant: true,
        employees: true
      }
    });

    console.log('👤 Usuário encontrado:', user ? { id: user.id, email: user.email, isActive: user.isActive } : 'NÃO');

    if (!user || !user.isActive) {
      console.log('❌ Usuário não encontrado ou inativo');
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await this.verifyPassword(password, user.password);
    console.log('🔑 Senha válida:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Senha inválida');
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenant: user.tenant
      },
      token
    };
  }

  static async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    tenantId: string;
  }) {
    const hashedPassword = await this.hashPassword(userData.password);
    
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role as any,
        tenantId: userData.tenantId
      },
      include: {
        tenant: true
      }
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      tenant: user.tenant
    };
  }

  static async getTenantById(tenantId: string) {
    return prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        tenantSettings: true
      }
    });
  }

  static async createTenant(tenantData: {
    name: string;
    slug: string;
    description?: string;
    settings?: any;
  }) {
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantData.name,
        slug: tenantData.slug,
        description: tenantData.description,
        settings: tenantData.settings || {}
      }
    });

    // Create default settings
    await prisma.tenantSettings.create({
      data: {
        tenantId: tenant.id,
        siteName: tenantData.name,
        businessName: tenantData.name
      }
    });

    return tenant;
  }
}
