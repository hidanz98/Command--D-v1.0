import { RequestHandler } from 'express';
import { AuthService } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * GET /api/auth/debug/user?email=...
 * Debug: Verificar se usuário existe
 */
export const debugUser: RequestHandler = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const searchEmail = email.toLowerCase().trim();
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: searchEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        tenantId: true,
        createdAt: true
      }
    });

    // Buscar cliente associado
    const client = await prisma.client.findFirst({
      where: { email: searchEmail },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        tenantId: true,
        createdAt: true
      }
    });

    return res.json({
      user: user ? {
        exists: true,
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        tenantId: user.tenantId,
        createdAt: user.createdAt
      } : {
        exists: false,
        message: 'Usuário não encontrado na tabela User'
      },
      client: client ? {
        exists: true,
        id: client.id,
        name: client.name,
        email: client.email,
        status: client.status,
        tenantId: client.tenantId,
        createdAt: client.createdAt
      } : {
        exists: false,
        message: 'Cliente não encontrado na tabela Client'
      },
      summary: {
        userExists: !!user,
        clientExists: !!client,
        canLogin: !!(user && user.isActive),
        status: client?.status || 'N/A'
      }
    });
  } catch (error: any) {
    console.error('Erro ao verificar usuário:', error);
    res.status(500).json({ error: error.message });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await AuthService.authenticateUser(email, password);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Login failed' 
    });
  }
};

export const register: RequestHandler = async (req, res) => {
  try {
    const { email, password, name, role = 'CLIENT', tenantId } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // If tenantId provided, verify tenant exists
    let finalTenantId = tenantId;
    if (tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });
      if (!tenant) {
        return res.status(400).json({ error: 'Invalid tenant' });
      }
    } else {
      // Create default tenant for new user
      const defaultTenant = await AuthService.createTenant({
        name: `${name}'s Company`,
        slug: `${name.toLowerCase().replace(/\s+/g, '-')}-company`
      });
      finalTenantId = defaultTenant.id;
    }

    const user = await AuthService.createUser({
      email,
      password,
      name,
      role,
      tenantId: finalTenantId
    });

    res.status(201).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed' 
    });
  }
};

export const me: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        tenant: {
          include: {
            tenantSettings: true
          }
        },
        employees: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenant: user.tenant,
        employee: user.employees?.[0] || null
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get user data' 
    });
  }
};

export const createTenant: RequestHandler = async (req, res) => {
  try {
    const { name, slug, description, settings } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    // Check if slug already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug }
    });

    if (existingTenant) {
      return res.status(400).json({ error: 'Tenant slug already exists' });
    }

    const tenant = await AuthService.createTenant({
      name,
      slug,
      description,
      settings
    });

    res.status(201).json({
      success: true,
      data: { tenant }
    });
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create tenant' 
    });
  }
};
