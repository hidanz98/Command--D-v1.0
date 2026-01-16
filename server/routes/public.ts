import { RequestHandler } from 'express';
import { prisma } from '../lib/prisma';

// Public products list (no auth), meant for catalog pages
export const getPublicProducts: RequestHandler = async (_req, res) => {
  try {
    // Fetch all active products and filter in memory
    const allProducts = await prisma.product.findMany({
      where: { 
        isActive: true
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by visibility in memory (since Prisma types not fully generated yet)
    const products = allProducts.filter((p: any) => 
      p.visibility === 'PUBLIC' || p.visibility === 'ECOMMERCE' || !p.visibility
    );

    const data = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku ?? '',
      category: p.category?.name ?? 'Outros',
      dailyPrice: p.dailyPrice,
      quantity: p.quantity ?? 0,
      // Sempre tentar usar imagens públicas; se não tiver, usar foto interna como fallback
      images:
        p.images && p.images.length > 0
          ? p.images
          : p.internalImage
            ? [p.internalImage]
            : ['/placeholder.svg'],
      internalImage: p.internalImage ?? '',
      tags: p.tags ?? [],
      available:
        p.status === 'AVAILABLE' &&
        (p.quantity ?? 0) - (p.maintenanceQuantity ?? 0) > 0,
      featured: p.featured ?? false,
      inMaintenance: p.inMaintenance ?? false,
      maintenanceQuantity: p.maintenanceQuantity ?? 0,
      description: p.description ?? '',
      visibility: p.visibility ?? 'PUBLIC',
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Public products error:', error);
    res.status(500).json({ success: false, error: 'Failed to load products' });
  }
};


