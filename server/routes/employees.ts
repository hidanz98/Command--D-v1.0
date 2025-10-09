import { RequestHandler } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getEmployees: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { page = 1, limit = 10, search, department, isActive } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const where: any = {
      tenantId
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { position: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (department) {
      where.department = department;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          user: true
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.employee.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        employees,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get employees' 
    });
  }
};

export const getEmployee: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id,
        tenantId
      },
      include: {
        user: true,
        timesheets: {
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get employee' 
    });
  }
};

export const createEmployee: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const employeeData = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const employee = await prisma.employee.create({
      data: {
        ...employeeData,
        tenantId
      },
      include: {
        user: true
      }
    });

    res.status(201).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create employee' 
    });
  }
};

export const updateEmployee: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;
    const updateData = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const employee = await prisma.employee.updateMany({
      where: {
        id,
        tenantId
      },
      data: updateData
    });

    if (employee.count === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const updatedEmployee = await prisma.employee.findFirst({
      where: { id, tenantId },
      include: { user: true }
    });

    res.json({
      success: true,
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update employee' 
    });
  }
};

export const deleteEmployee: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const employee = await prisma.employee.updateMany({
      where: {
        id,
        tenantId
      },
      data: {
        isActive: false
      }
    });

    if (employee.count === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete employee' 
    });
  }
};
