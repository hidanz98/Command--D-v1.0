import { RequestHandler } from 'express';
import { prisma } from '../lib/prisma';

// Public products list (no auth), meant for catalog pages
export const getPublicProducts: RequestHandler = async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    const data = products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category?.name ?? 'Outros',
      dailyPrice: p.dailyPrice,
      images: p.images && p.images.length > 0 ? p.images : ['/placeholder.svg'],
      tags: p.tags ?? [],
      available: p.status === 'AVAILABLE',
      featured: (p.tags ?? []).includes('featured'),
      description: p.description ?? '',
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Public products error:', error);
    res.status(500).json({ success: false, error: 'Failed to load products' });
  }
};


