import { RequestHandler } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  calculateRentalPrice,
  calculateDays,
  calculateLateFee,
  calculateDiscount,
  calculateTotal
} from '../lib/pricingCalculator';
import { EmailService } from '../lib/EmailService';

export const getOrders: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { page = 1, limit = 10, status, clientId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const where: any = {
      tenantId
    };

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          client: true,
          items: {
            include: {
              product: true
            }
          },
          payments: true
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get orders' 
    });
  }
};

export const getOrder: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        tenantId
      },
      include: {
        client: true,
        items: {
          include: {
            product: true
          }
        },
        payments: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get order' 
    });
  }
};

/**
 * Verificar disponibilidade do produto no período
 */
async function checkProductAvailability(
  productId: string,
  startDate: Date,
  endDate: Date,
  tenantId: string,
  quantity: number = 1
): Promise<{ available: boolean; conflicts?: any[] }> {
  // Buscar pedidos que conflitam
  const conflicts = await prisma.order.findMany({
    where: {
      tenantId,
      status: {
        notIn: ['CANCELLED', 'RETURNED', 'COMPLETED']
      },
      items: {
        some: {
          productId,
          OR: [
            // Início do novo pedido está dentro de um período existente
            {
              AND: [
                { startDate: { lte: startDate } },
                { endDate: { gte: startDate } }
              ]
            },
            // Fim do novo pedido está dentro de um período existente
            {
              AND: [
                { startDate: { lte: endDate } },
                { endDate: { gte: endDate } }
              ]
            },
            // Novo pedido engloba um período existente
            {
              AND: [
                { startDate: { gte: startDate } },
                { endDate: { lte: endDate } }
              ]
            }
          ]
        }
      }
    },
    include: {
      items: {
        where: { productId }
      }
    }
  });

  // Verificar se tem quantidade suficiente
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    return { available: false };
  }

  // Calcular quantidade já alocada
  const allocatedQuantity = conflicts.reduce((sum, order) => {
    const item = order.items.find(i => i.productId === productId);
    return sum + (item?.quantity || 0);
  }, 0);

  const availableQuantity = product.quantity - allocatedQuantity;

  return {
    available: availableQuantity >= quantity,
    conflicts: conflicts.length > 0 ? conflicts : undefined
  };
}

export const createOrder: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { clientId, items, startDate, endDate, notes, deliveryAddress, pickupAddress } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    if (!clientId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Client ID and items are required' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const orderStartDate = new Date(startDate);
    const orderEndDate = new Date(endDate);

    if (orderStartDate >= orderEndDate) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Calcular número de dias
    const days = calculateDays(orderStartDate, orderEndDate);

    // Generate order number
    const orderCount = await prisma.order.count({
      where: { tenantId }
    });
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`;

    // Processar e validar itens
    let subtotal = 0;
    const orderItems = [];
    const productsToUpdate = [];

    for (const item of items) {
      const product = await prisma.product.findFirst({
        where: {
          id: item.productId,
          tenantId,
          isActive: true
        }
      });

      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }

      // Verificar disponibilidade
      const availability = await checkProductAvailability(
        item.productId,
        orderStartDate,
        orderEndDate,
        tenantId,
        item.quantity || 1
      );

      if (!availability.available) {
        return res.status(400).json({
          error: `Product "${product.name}" is not available for the requested period`,
          productId: item.productId,
          conflicts: availability.conflicts
        });
      }

      // Calcular preço automaticamente baseado no período
      const pricing = calculateRentalPrice(
        product.dailyPrice,
        product.weeklyPrice,
        product.monthlyPrice,
        days
      );

      const quantity = item.quantity || 1;
      const unitPrice = pricing.basePrice;
      const itemTotal = unitPrice * quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity,
        unitPrice,
        totalPrice: itemTotal,
        startDate: orderStartDate,
        endDate: orderEndDate
      });

      // Marcar para atualizar estoque
      productsToUpdate.push({
        id: item.productId,
        quantity
      });
    }

    // Calcular desconto e total
    const discount = calculateDiscount(subtotal, days);
    const tax = 0; // Adicionar lógica de impostos se necessário
    const total = calculateTotal(subtotal, discount, tax);

    // Criar pedido com transação
    const order = await prisma.$transaction(async (tx) => {
      // Criar pedido
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          clientId,
          startDate: orderStartDate,
          endDate: orderEndDate,
          subtotal,
          discount,
          tax,
          total,
          notes,
          deliveryAddress,
          pickupAddress,
          tenantId,
          status: 'PENDING',
          items: {
            create: orderItems
          }
        },
        include: {
          client: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Atualizar produtos (marcar como RENTED e diminuir quantidade)
      for (const productUpdate of productsToUpdate) {
        await tx.product.update({
          where: { id: productUpdate.id },
          data: {
            status: 'RENTED',
            quantity: {
              decrement: productUpdate.quantity
            }
          }
        });
      }

      // Criar pagamento pendente
      await tx.payment.create({
        data: {
          orderId: createdOrder.id,
          amount: total,
          method: 'PENDING',
          status: 'PENDING',
          tenantId
        }
      });

      return createdOrder;
    });

    // Enviar email de confirmação (não bloqueia a resposta)
    try {
      const tenantSettings = await prisma.tenantSettings.findUnique({
        where: { tenantId }
      });

      if (tenantSettings && tenantSettings.emailEnabled && order.client.email) {
        const emailService = new EmailService(tenantSettings);
        await emailService.sendOrderConfirmation(
          order.client.email,
          order.client.name,
          order.orderNumber,
          orderStartDate,
          orderEndDate,
          order.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.totalPrice
          })),
          total
        );
      }
    } catch (emailError) {
      // Log erro mas não falha a criação do pedido
      console.error('Erro ao enviar email de confirmação:', emailError);
    }

    res.status(201).json({
      success: true,
      data: order,
      pricing: {
        days,
        subtotal,
        discount,
        tax,
        total
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create order' 
    });
  }
};

export const updateOrderStatus: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;
    const { status } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const order = await prisma.order.updateMany({
      where: {
        id,
        tenantId
      },
      data: { status }
    });

    if (order.count === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Enviar email se status foi confirmado
    if (status === 'CONFIRMED' && updatedOrder && updatedOrder.client.email) {
      try {
        const tenantSettings = await prisma.tenantSettings.findUnique({
          where: { tenantId }
        });

        if (tenantSettings && tenantSettings.emailEnabled) {
          const emailService = new EmailService(tenantSettings);
          await emailService.sendOrderConfirmation(
            updatedOrder.client.email,
            updatedOrder.client.name,
            updatedOrder.orderNumber,
            updatedOrder.startDate,
            updatedOrder.endDate,
            updatedOrder.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.totalPrice
            })),
            updatedOrder.total
          );
        }
      } catch (emailError) {
        console.error('Erro ao enviar email de confirmação:', emailError);
      }
    }

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update order status' 
    });
  }
};

/**
 * Devolver pedido/locação
 */
export const returnOrder: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;
    const { actualReturnDate, condition, notes: returnNotes, damageDescription } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    // Buscar pedido
    const order = await prisma.order.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'RETURNED' || order.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Order already returned' });
    }

    const returnDate = actualReturnDate ? new Date(actualReturnDate) : new Date();

    // Calcular multa por atraso
    let lateFee = 0;
    let daysLate = 0;

    if (order.endDate && returnDate > order.endDate) {
      daysLate = calculateDays(order.endDate, returnDate);
      
      // Calcular multa por produto
      for (const item of order.items) {
        const itemLateFee = calculateLateFee(
          order.endDate,
          returnDate,
          item.product.dailyPrice
        );
        lateFee += itemLateFee * item.quantity;
      }
    }

    // Taxa de dano (se houver)
    const damageFee = condition === 'damaged' ? 500 : 0; // R$ 500 fixo por dano

    const totalAdditionalFees = lateFee + damageFee;

    // Atualizar com transação
    const result = await prisma.$transaction(async (tx) => {
      // Atualizar pedido
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: 'RETURNED',
          returnDate,
          notes: returnNotes || order.notes
        },
        include: {
          client: true,
          items: {
            include: {
              product: true
            }
          },
          payments: true
        }
      });

      // Liberar produtos
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            status: 'AVAILABLE',
            quantity: {
              increment: item.quantity
            }
          }
        });
      }

      // Se tem taxa adicional (multa ou dano), criar pagamento
      if (totalAdditionalFees > 0) {
        const feeDescription = [];
        if (lateFee > 0) {
          feeDescription.push(`Multa por ${daysLate} dia(s) de atraso: R$ ${lateFee.toFixed(2)}`);
        }
        if (damageFee > 0) {
          feeDescription.push(`Taxa de dano: R$ ${damageFee.toFixed(2)}`);
        }

        await tx.payment.create({
          data: {
            orderId: id,
            amount: totalAdditionalFees,
            method: 'PENDING',
            status: 'PENDING',
            tenantId,
            notes: feeDescription.join('; ')
          }
        });
      }

      return updatedOrder;
    });

    res.json({
      success: true,
      data: result,
      fees: {
        lateFee,
        daysLate,
        damageFee,
        total: totalAdditionalFees
      },
      message: totalAdditionalFees > 0 
        ? `Returned with additional fees: R$ ${totalAdditionalFees.toFixed(2)}`
        : 'Returned on time without additional fees'
    });
  } catch (error) {
    console.error('Return order error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to return order' 
    });
  }
};
