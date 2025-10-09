import { RequestHandler } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getTimesheets: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { page = 1, limit = 10, employeeId, date, status } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const where: any = {
      tenantId
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      where.date = {
        gte: startDate,
        lt: endDate
      };
    }

    if (status) {
      where.status = status;
    }

    const [timesheets, total] = await Promise.all([
      prisma.timesheet.findMany({
        where,
        include: {
          employee: {
            include: {
              user: true
            }
          }
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { date: 'desc' }
      }),
      prisma.timesheet.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        timesheets,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get timesheets error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get timesheets' 
    });
  }
};

export const clockIn: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId, user } = req;
    const { location, notes } = req.body;

    if (!tenantId || !user) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    // Find employee
    const employee = await prisma.employee.findFirst({
      where: {
        userId: user.userId,
        tenantId,
        isActive: true
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already clocked in today
    const existingTimesheet = await prisma.timesheet.findFirst({
      where: {
        employeeId: employee.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    if (existingTimesheet && existingTimesheet.clockIn) {
      return res.status(400).json({ error: 'Already clocked in today' });
    }

    const timesheet = await prisma.timesheet.upsert({
      where: {
        id: existingTimesheet?.id || 'new'
      },
      update: {
        clockIn: new Date(),
        clockInLocation: location,
        status: 'PENDING'
      },
      create: {
        employeeId: employee.id,
        date: today,
        clockIn: new Date(),
        clockInLocation: location,
        notes,
        status: 'PENDING',
        tenantId
      }
    });

    res.json({
      success: true,
      data: timesheet
    });
  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to clock in' 
    });
  }
};

export const clockOut: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId, user } = req;
    const { location, notes } = req.body;

    if (!tenantId || !user) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    // Find employee
    const employee = await prisma.employee.findFirst({
      where: {
        userId: user.userId,
        tenantId,
        isActive: true
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's timesheet
    const timesheet = await prisma.timesheet.findFirst({
      where: {
        employeeId: employee.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    if (!timesheet || !timesheet.clockIn) {
      return res.status(400).json({ error: 'Must clock in first' });
    }

    if (timesheet.clockOut) {
      return res.status(400).json({ error: 'Already clocked out today' });
    }

    const updatedTimesheet = await prisma.timesheet.update({
      where: { id: timesheet.id },
      data: {
        clockOut: new Date(),
        clockOutLocation: location,
        notes: notes || timesheet.notes
      }
    });

    res.json({
      success: true,
      data: updatedTimesheet
    });
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to clock out' 
    });
  }
};

export const approveTimesheet: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId, user } = req;
    const { id } = req.params;
    const { approved } = req.body;

    if (!tenantId || !user) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    const timesheet = await prisma.timesheet.findFirst({
      where: {
        id,
        tenantId
      }
    });

    if (!timesheet) {
      return res.status(404).json({ error: 'Timesheet not found' });
    }

    const updatedTimesheet = await prisma.timesheet.update({
      where: { id },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        isApproved: approved,
        approvedBy: user.userId,
        approvedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedTimesheet
    });
  } catch (error) {
    console.error('Approve timesheet error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to approve timesheet' 
    });
  }
};
