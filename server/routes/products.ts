import { RequestHandler } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getProducts: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { page = 1, limit = 10, search, category, status } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const where: any = {
      tenantId,
      isActive: true
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (status) {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get products' 
    });
  }
};

export const getProduct: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const product = await prisma.product.findFirst({
      where: {
        id,
        tenantId
      },
      include: {
        category: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get product' 
    });
  }
};

export const createProduct: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const productData = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        tenantId
      },
      include: {
        category: true
      }
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create product' 
    });
  }
};

export const updateProduct: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;
    const updateData = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const product = await prisma.product.updateMany({
      where: {
        id,
        tenantId
      },
      data: updateData
    });

    if (product.count === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = await prisma.product.findFirst({
      where: { id, tenantId },
      include: { category: true }
    });

    res.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update product' 
    });
  }
};

export const deleteProduct: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const product = await prisma.product.updateMany({
      where: {
        id,
        tenantId
      },
      data: {
        isActive: false
      }
    });

    if (product.count === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete product' 
    });
  }
};
