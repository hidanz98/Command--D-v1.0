import { RequestHandler } from 'express';
import { AuthService } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

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
