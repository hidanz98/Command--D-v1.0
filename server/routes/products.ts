import { RequestHandler } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { logProductChange } from './product-history';

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
    const { tenantId, userId } = req;
    const productData = req.body;

    if (!tenantId || !userId) {
      return res.status(400).json({ error: 'Tenant ID and User ID required' });
    }

    // Get user info for audit
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        tenantId,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        category: true
      }
    });

    // Log creation
    await logProductChange({
      productId: product.id,
      action: 'CREATE',
      userId: userId,
      userName: user.name,
      userEmail: user.email,
      tenantId: tenantId,
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
    const { tenantId, userId } = req;
    const { id } = req.params;
    const updateData = { ...req.body };

    if (!tenantId || !userId) {
      return res.status(400).json({ error: 'Tenant ID and User ID required' });
    }

    // Remove campos que não existem no schema do Prisma
    // 'category' é uma string enviada pelo frontend, mas o Prisma usa 'categoryId' como relação
    delete updateData.category;
    // 'quantityObservation' é apenas para histórico, não é um campo do produto
    delete updateData.quantityObservation;
    // Campos que podem vir vazios e causar problemas
    if (updateData.kitParentId === '') delete updateData.kitParentId;
    if (updateData.maintenanceStartDate === '') delete updateData.maintenanceStartDate;
    if (updateData.maintenanceEndDate === '') delete updateData.maintenanceEndDate;
    
    // Campos com restrição UNIQUE - converter vazio para null para evitar conflitos
    if (updateData.qrCode === '') updateData.qrCode = null;
    if (updateData.barcode === '') updateData.barcode = null;
    if (updateData.serialNumber === '') updateData.serialNumber = null;

    // Get user info
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get current product state
    const currentProduct = await prisma.product.findFirst({
      where: { id, tenantId }
    });

    if (!currentProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if quantity is being changed
    const isQuantityChange = updateData.quantity !== undefined && updateData.quantity !== currentProduct.quantity;
    // Guardar quantityObservation antes de deletar do updateData
    const quantityObservation = req.body.quantityObservation;

    if (isQuantityChange) {
      // Check permission
      if (!user.canEditQuantity && user.role !== 'ADMIN' && user.role !== 'MASTER_ADMIN') {
        return res.status(403).json({ 
          success: false,
          error: 'Você não tem permissão para editar quantidades. Entre em contato com um administrador.' 
        });
      }

      // Observation is required for quantity changes
      if (!quantityObservation) {
        return res.status(400).json({ 
          success: false,
          error: 'Observação é obrigatória ao alterar a quantidade do produto.' 
        });
      }
    }

    // Update product
    const product = await prisma.product.updateMany({
      where: {
        id,
        tenantId
      },
      data: {
        ...updateData,
        updatedBy: userId,
      }
    });

    if (product.count === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Log changes
    const changes: Array<{field: string; oldValue: any; newValue: any}> = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== (currentProduct as any)[key]) {
        changes.push({
          field: key,
          oldValue: (currentProduct as any)[key],
          newValue: updateData[key]
        });
      }
    });

    // Log each change
    for (const change of changes) {
      const action = change.field === 'quantity' ? 'QUANTITY_CHANGE'
                   : change.field.includes('Price') ? 'PRICE_CHANGE'
                   : change.field === 'status' ? 'STATUS_CHANGE'
                   : 'UPDATE';

      await logProductChange({
        productId: id,
        action: action as any,
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        observation: change.field === 'quantity' ? quantityObservation : undefined,
        userId: userId,
        userName: user.name,
        userEmail: user.email,
        tenantId: tenantId,
      });
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
