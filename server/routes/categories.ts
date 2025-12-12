import { RequestHandler } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getCategories: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    console.log('📂 GET /api/categories - tenantId:', tenantId);

    if (!tenantId) {
      console.log('❌ Tenant ID ausente');
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const categories = await prisma.category.findMany({
      where: {
        tenantId,
        isActive: true
      },
      orderBy: { name: 'asc' }
    });

    console.log(`✅ Encontradas ${categories.length} categorias:`, categories.map(c => c.name));

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get categories' 
    });
  }
};

