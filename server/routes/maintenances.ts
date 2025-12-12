import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Lista todas as manutenções
 * GET /api/maintenances
 */
export const listMaintenances: RequestHandler = async (req, res) => {
  try {
    const { productId, status, type, priority } = req.query;

    const where: any = {};

    if (productId) where.productId = productId as string;
    if (status) where.status = status as string;
    if (type) where.type = type as string;
    if (priority) where.priority = priority as string;

    const maintenances = await prisma.productMaintenance.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "desc",
      },
    });

    res.status(200).json(maintenances);
  } catch (error) {
    console.error("Erro ao listar manutenções:", error);
    res.status(500).json({ error: "Erro ao listar manutenções" });
  }
};

/**
 * Busca uma manutenção por ID
 * GET /api/maintenances/:id
 */
export const getMaintenanceById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const maintenance = await prisma.productMaintenance.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!maintenance) {
      return res.status(404).json({ error: "Manutenção não encontrada" });
    }

    res.status(200).json(maintenance);
  } catch (error) {
    console.error("Erro ao buscar manutenção:", error);
    res.status(500).json({ error: "Erro ao buscar manutenção" });
  }
};

/**
 * Cria uma nova manutenção
 * POST /api/maintenances
 */
export const createMaintenance: RequestHandler = async (req, res) => {
  try {
    const {
      productId,
      type,
      status,
      priority,
      title,
      description,
      issue,
      solution,
      cost,
      laborCost,
      partsCost,
      technician,
      technicianId,
      serviceProvider,
      scheduledDate,
      startedAt,
      completedAt,
      replacedParts,
      notes,
      attachments,
      nextMaintenanceDate,
      tenantId,
      createdBy,
    } = req.body;

    // Valida campos obrigatórios
    if (!productId || !title || !tenantId) {
      return res.status(400).json({
        error: "productId, title e tenantId são obrigatórios",
      });
    }

    // Verifica se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const maintenance = await prisma.productMaintenance.create({
      data: {
        productId,
        type,
        status,
        priority,
        title,
        description,
        issue,
        solution,
        cost: cost ? parseFloat(cost) : undefined,
        laborCost: laborCost ? parseFloat(laborCost) : undefined,
        partsCost: partsCost ? parseFloat(partsCost) : undefined,
        technician,
        technicianId,
        serviceProvider,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        startedAt: startedAt ? new Date(startedAt) : undefined,
        completedAt: completedAt ? new Date(completedAt) : undefined,
        replacedParts,
        notes,
        attachments: attachments || [],
        nextMaintenanceDate: nextMaintenanceDate
          ? new Date(nextMaintenanceDate)
          : undefined,
        tenantId,
        createdBy,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    // Se a manutenção está iniciada ou em progresso, atualiza o status do produto
    if (status === "IN_PROGRESS") {
      await prisma.product.update({
        where: { id: productId },
        data: { status: "MAINTENANCE" },
      });
    }

    res.status(201).json(maintenance);
  } catch (error) {
    console.error("Erro ao criar manutenção:", error);
    res.status(500).json({ error: "Erro ao criar manutenção" });
  }
};

/**
 * Atualiza uma manutenção
 * PUT /api/maintenances/:id
 */
export const updateMaintenance: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      status,
      priority,
      title,
      description,
      issue,
      solution,
      cost,
      laborCost,
      partsCost,
      technician,
      technicianId,
      serviceProvider,
      scheduledDate,
      startedAt,
      completedAt,
      replacedParts,
      notes,
      attachments,
      nextMaintenanceDate,
      updatedBy,
    } = req.body;

    const existingMaintenance = await prisma.productMaintenance.findUnique({
      where: { id },
    });

    if (!existingMaintenance) {
      return res.status(404).json({ error: "Manutenção não encontrada" });
    }

    const updateData: any = {
      updatedBy,
    };

    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (issue !== undefined) updateData.issue = issue;
    if (solution !== undefined) updateData.solution = solution;
    if (cost !== undefined) updateData.cost = parseFloat(cost);
    if (laborCost !== undefined) updateData.laborCost = parseFloat(laborCost);
    if (partsCost !== undefined) updateData.partsCost = parseFloat(partsCost);
    if (technician !== undefined) updateData.technician = technician;
    if (technicianId !== undefined) updateData.technicianId = technicianId;
    if (serviceProvider !== undefined)
      updateData.serviceProvider = serviceProvider;
    if (scheduledDate !== undefined)
      updateData.scheduledDate = new Date(scheduledDate);
    if (startedAt !== undefined) updateData.startedAt = new Date(startedAt);
    if (completedAt !== undefined)
      updateData.completedAt = new Date(completedAt);
    if (replacedParts !== undefined) updateData.replacedParts = replacedParts;
    if (notes !== undefined) updateData.notes = notes;
    if (attachments !== undefined) updateData.attachments = attachments;
    if (nextMaintenanceDate !== undefined)
      updateData.nextMaintenanceDate = new Date(nextMaintenanceDate);

    const maintenance = await prisma.productMaintenance.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    // Atualiza status do produto baseado no status da manutenção
    if (status === "IN_PROGRESS") {
      await prisma.product.update({
        where: { id: existingMaintenance.productId },
        data: { status: "MAINTENANCE" },
      });
    } else if (status === "COMPLETED") {
      // Volta o produto para disponível se não houver outras manutenções em progresso
      const otherMaintenances = await prisma.productMaintenance.findMany({
        where: {
          productId: existingMaintenance.productId,
          status: "IN_PROGRESS",
          id: { not: id },
        },
      });

      if (otherMaintenances.length === 0) {
        await prisma.product.update({
          where: { id: existingMaintenance.productId },
          data: { status: "AVAILABLE" },
        });
      }
    }

    res.status(200).json(maintenance);
  } catch (error) {
    console.error("Erro ao atualizar manutenção:", error);
    res.status(500).json({ error: "Erro ao atualizar manutenção" });
  }
};

/**
 * Deleta uma manutenção
 * DELETE /api/maintenances/:id
 */
export const deleteMaintenance: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const maintenance = await prisma.productMaintenance.findUnique({
      where: { id },
    });

    if (!maintenance) {
      return res.status(404).json({ error: "Manutenção não encontrada" });
    }

    await prisma.productMaintenance.delete({
      where: { id },
    });

    res.status(200).json({ message: "Manutenção deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar manutenção:", error);
    res.status(500).json({ error: "Erro ao deletar manutenção" });
  }
};

/**
 * Lista manutenções de um produto específico
 * GET /api/products/:productId/maintenances
 */
export const getProductMaintenances: RequestHandler = async (req, res) => {
  try {
    const { productId } = req.params;

    const maintenances = await prisma.productMaintenance.findMany({
      where: { productId },
      orderBy: {
        scheduledDate: "desc",
      },
    });

    res.status(200).json(maintenances);
  } catch (error) {
    console.error("Erro ao buscar manutenções do produto:", error);
    res.status(500).json({ error: "Erro ao buscar manutenções do produto" });
  }
};

/**
 * Lista manutenções pendentes ou agendadas
 * GET /api/maintenances/upcoming
 */
export const getUpcomingMaintenances: RequestHandler = async (req, res) => {
  try {
    const { tenantId } = req.query;

    const where: any = {
      status: {
        in: ["SCHEDULED", "PENDING"],
      },
    };

    if (tenantId) where.tenantId = tenantId as string;

    const maintenances = await prisma.productMaintenance.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "asc",
      },
    });

    res.status(200).json(maintenances);
  } catch (error) {
    console.error("Erro ao buscar manutenções agendadas:", error);
    res.status(500).json({ error: "Erro ao buscar manutenções agendadas" });
  }
};

/**
 * Relatório de manutenções
 * GET /api/maintenances/report
 */
export const getMaintenanceReport: RequestHandler = async (req, res) => {
  try {
    const { tenantId, startDate, endDate } = req.query;

    const where: any = {};

    if (tenantId) where.tenantId = tenantId as string;

    if (startDate && endDate) {
      where.scheduledDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const maintenances = await prisma.productMaintenance.findMany({
      where,
      include: {
        product: true,
      },
    });

    // Estatísticas
    const total = maintenances.length;
    const byStatus = maintenances.reduce((acc: any, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {});

    const byType = maintenances.reduce((acc: any, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {});

    const totalCost = maintenances.reduce(
      (sum, m) => sum + (m.cost || 0),
      0
    );

    const avgCost = total > 0 ? totalCost / total : 0;

    res.status(200).json({
      total,
      byStatus,
      byType,
      totalCost,
      avgCost,
      maintenances,
    });
  } catch (error) {
    console.error("Erro ao gerar relatório de manutenções:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de manutenções" });
  }
};

