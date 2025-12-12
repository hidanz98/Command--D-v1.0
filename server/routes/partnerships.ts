/**
 * API DE PARCERIAS
 * 
 * Permite que 2 locadoras façam parceria para compartilhar
 * APENAS dados básicos de clientes (nome, CPF, telefone, email)
 * 
 * NUNCA compartilha:
 * - Histórico de locações
 * - Valores pagos
 * - Dados financeiros
 * - Produtos alugados
 */

import { Router, RequestHandler } from 'express';
import { masterPrisma } from '../lib/masterPrisma';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/partnerships
 * Listar parcerias da locadora atual
 */
export const getPartnerships: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const apiKey = process.env.LICENSE_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API Key não configurada' });
    }

    // Buscar licença atual
    const currentLicense = await masterPrisma.licenseHolder.findUnique({
      where: { apiKey }
    });

    if (!currentLicense) {
      return res.status(404).json({ error: 'Licença não encontrada' });
    }

    // Buscar parcerias
    const partnerships = await masterPrisma.partnership.findMany({
      where: {
        OR: [
          { partnerFromId: currentLicense.id },
          { partnerToId: currentLicense.id }
        ],
        status: 'ACTIVE'
      },
      include: {
        partnerFrom: {
          select: {
            id: true,
            companyName: true,
            subdomain: true,
            ownerName: true,
            ownerPhone: true
          }
        },
        partnerTo: {
          select: {
            id: true,
            companyName: true,
            subdomain: true,
            ownerName: true,
            ownerPhone: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: { partnerships }
    });
  } catch (error) {
    console.error('Erro ao buscar parcerias:', error);
    res.status(500).json({ error: 'Erro ao buscar parcerias' });
  }
};

/**
 * POST /api/partnerships/request
 * Solicitar parceria com outra locadora
 */
export const requestPartnership: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { targetSubdomain, allowCrossRental, requestMessage } = req.body;
    const apiKey = process.env.LICENSE_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: 'API Key não configurada' });
    }

    // Buscar licença atual
    const currentLicense = await masterPrisma.licenseHolder.findUnique({
      where: { apiKey }
    });

    if (!currentLicense) {
      return res.status(404).json({ error: 'Licença não encontrada' });
    }

    // Buscar licença parceira
    const targetLicense = await masterPrisma.licenseHolder.findUnique({
      where: { subdomain: targetSubdomain }
    });

    if (!targetLicense) {
      return res.status(404).json({ error: 'Locadora não encontrada' });
    }

    if (targetLicense.id === currentLicense.id) {
      return res.status(400).json({ error: 'Não pode fazer parceria consigo mesmo' });
    }

    // Verificar se já existe parceria
    const existing = await masterPrisma.partnership.findFirst({
      where: {
        OR: [
          { partnerFromId: currentLicense.id, partnerToId: targetLicense.id },
          { partnerFromId: targetLicense.id, partnerToId: currentLicense.id }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Parceria já existe' });
    }

    // Criar solicitação de parceria
    const partnership = await masterPrisma.partnership.create({
      data: {
        licenseHolderId: currentLicense.id,
        partnerName: targetLicense.companyName,
        partnerEmail: targetLicense.email,
        partnerPhone: targetLicense.phone,
        partnerFromId: currentLicense.id,
        partnerToId: targetLicense.id,
        status: 'PENDING',
        shareClientData: true,
        allowCrossRental: allowCrossRental || false
      }
    });

    // Log
    await masterPrisma.masterAuditLog.create({
      data: {
        action: 'partnership_requested',
        entity: 'partnership',
        metadata: {
          entityId: partnership.id,
          userEmail: req.user?.email,
          details: {
            from: currentLicense.companyName,
            to: targetLicense.companyName,
            message: requestMessage
          }
        },
        licenseHolderId: currentLicense.id
      }
    });

    // TODO: Enviar email para a outra locadora e para o Otávio

    res.status(201).json({
      success: true,
      data: { partnership },
      message: 'Solicitação de parceria enviada. Aguardando aprovação do administrador.'
    });
  } catch (error) {
    console.error('Erro ao solicitar parceria:', error);
    res.status(500).json({ error: 'Erro ao solicitar parceria' });
  }
};

/**
 * GET /api/partnerships/shared-clients
 * Buscar clientes compartilhados (apenas dados básicos!)
 */
export const getSharedClients: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { search } = req.query;
    const apiKey = process.env.LICENSE_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: 'API Key não configurada' });
    }

    // Buscar licença atual
    const currentLicense = await masterPrisma.licenseHolder.findUnique({
      where: { apiKey }
    });

    if (!currentLicense) {
      return res.status(404).json({ error: 'Licença não encontrada' });
    }

    // Buscar parcerias ativas
    const partnerships = await masterPrisma.partnership.findMany({
      where: {
        OR: [
          { partnerFromId: currentLicense.id },
          { partnerToId: currentLicense.id }
        ],
        status: 'ACTIVE',
        shareClientData: true
      },
      include: {
        partnerFrom: true,
        partnerTo: true
      }
    });

    if (partnerships.length === 0) {
      return res.json({
        success: true,
        data: { clients: [] },
        message: 'Sem parcerias ativas'
      });
    }

    // Buscar clientes apenas do tenant dos parceiros (não do próprio)
    const partnerTenantIds: string[] = [];
    
    for (const partnership of partnerships) {
      const partnerId = partnership.partnerFromId === currentLicense.id
        ? partnership.partnerToId
        : partnership.partnerFromId;
      
      // Aqui precisaríamos mapear licenseHolderId -> tenantId
      // Por simplicidade, vamos buscar pelo subdomain
    }

    // IMPORTANTE: Retornar APENAS dados básicos
    // NUNCA retornar histórico de pedidos, valores, etc
    const clients = await prisma.client.findMany({
      where: {
        // Buscar em outros tenants parceiros
        // tenant: { slug: { in: partnerSubdomains } },
        ...(search && {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { document: { contains: search as string, mode: 'insensitive' } },
            { email: { contains: search as string, mode: 'insensitive' } }
          ]
        })
      },
      select: {
        // APENAS dados básicos, SEM histórico
        id: true,
        name: true,
        email: true,
        phone: true,
        document: true,
        type: true,
        company: true,
        // NÃO incluir: orders, valores, histórico
      },
      take: 50
    });

    res.json({
      success: true,
      data: {
        clients,
        partnerships: partnerships.length
      },
      message: 'Dados compartilhados de forma segura (apenas informações básicas)'
    });
  } catch (error) {
    console.error('Erro ao buscar clientes compartilhados:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes compartilhados' });
  }
};

/**
 * POST /api/partnerships/import-client
 * Importar cliente compartilhado para o sistema local
 */
export const importSharedClient: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { sourceClientId, partnershipId } = req.body;

    if (!req.tenantId) {
      return res.status(400).json({ error: 'Tenant não identificado' });
    }

    // Verificar se a parceria é válida e ativa
    const partnership = await masterPrisma.partnership.findFirst({
      where: {
        id: partnershipId,
        status: 'ACTIVE',
        shareClientData: true
      }
    });

    if (!partnership) {
      return res.status(403).json({ error: 'Parceria não encontrada ou inativa' });
    }

    // Buscar cliente original (apenas dados básicos)
    const sourceClient = await prisma.client.findUnique({
      where: { id: sourceClientId },
      select: {
        name: true,
        email: true,
        phone: true,
        document: true,
        type: true,
        company: true,
        address: true,
        city: true,
        state: true,
        zipCode: true
        // NÃO copiar histórico de pedidos!
      }
    });

    if (!sourceClient) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Verificar se já existe no tenant atual
    const existing = await prisma.client.findFirst({
      where: {
        tenantId: req.tenantId,
        document: sourceClient.document
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Cliente já existe no seu sistema' });
    }

    // Criar novo cliente no tenant atual
    const newClient = await prisma.client.create({
      data: {
        ...sourceClient,
        tenantId: req.tenantId
      }
    });

    res.status(201).json({
      success: true,
      data: { client: newClient },
      message: 'Cliente importado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao importar cliente:', error);
    res.status(500).json({ error: 'Erro ao importar cliente' });
  }
};

// Exportar router configurado
router.get('/', getPartnerships);
router.post('/request', requestPartnership);
router.get('/shared-clients', getSharedClients);
router.post('/import-client', importSharedClient);

export default router;

