import { RequestHandler } from 'express';
import { prisma } from '../lib/prisma';

// Get product history
export const getProductHistory: RequestHandler = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const history = await prisma.productHistory.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limitar a 100 últimos registros
    });

    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching product history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch product history' });
  }
};

// Create history record
export const createHistoryRecord: RequestHandler = async (req, res) => {
  try {
    const {
      productId,
      action,
      field,
      oldValue,
      newValue,
      observation,
      userId,
      userName,
      userEmail,
      tenantId,
    } = req.body;

    // Validação: observação obrigatória para mudanças de quantidade
    if (action === 'QUANTITY_CHANGE' && !observation) {
      return res.status(400).json({
        success: false,
        error: 'Observação é obrigatória ao alterar quantidade',
      });
    }

    const record = await prisma.productHistory.create({
      data: {
        productId,
        action,
        field,
        oldValue: oldValue?.toString(),
        newValue: newValue?.toString(),
        observation,
        userId,
        userName,
        userEmail,
        tenantId,
      },
    });

    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Error creating history record:', error);
    res.status(500).json({ success: false, error: 'Failed to create history record' });
  }
};

// Helper function to log product changes
export async function logProductChange(params: {
  productId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'QUANTITY_CHANGE' | 'PRICE_CHANGE' | 'STATUS_CHANGE';
  field?: string;
  oldValue?: any;
  newValue?: any;
  observation?: string;
  userId: string;
  userName: string;
  userEmail: string;
  tenantId: string;
}) {
  try {
    await prisma.productHistory.create({
      data: {
        productId: params.productId,
        action: params.action,
        field: params.field,
        oldValue: params.oldValue?.toString(),
        newValue: params.newValue?.toString(),
        observation: params.observation,
        userId: params.userId,
        userName: params.userName,
        userEmail: params.userEmail,
        tenantId: params.tenantId,
      },
    });
    return true;
  } catch (error) {
    console.error('Error logging product change:', error);
    return false;
  }
}

