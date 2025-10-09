/**
 * ROTAS DE CLIENTES COM SISTEMA DE APROVAÇÃO
 * 
 * Endpoints para:
 * - Cadastro de cliente com documentos
 * - Upload de documentos
 * - Aprovação/rejeição por funcionários
 * - Listagem de cadastros pendentes
 * - Histórico de aprovações
 */

import { Router, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../lib/auth";
import { requireTenant } from "../middleware/tenantMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import { uploadMultipleDocuments, calculateFileHash, deleteFile, validateFilePath } from "../middleware/documentUpload";
import { validatePDF, validateDocumentType, checkRequiredDocuments } from "../lib/pdfValidator";
import path from "path";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/clients
 * Listar todos os clientes aprovados
 */
export const getClients: RequestHandler = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID obrigatório" });
    }

    const clients = await prisma.client.findMany({
      where: {
        tenantId,
        status: 'APPROVED'
      },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        documents: {
          select: {
            id: true,
            type: true,
            uploadedAt: true,
            validatedAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(clients);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    res.status(500).json({ error: "Erro ao buscar clientes" });
  }
};

/**
 * GET /api/clients/pending
 * Listar cadastros pendentes de aprovação (ADMIN/EMPLOYEE apenas)
 */
export const getPendingClients: RequestHandler = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID obrigatório" });
    }

    const pendingClients = await prisma.client.findMany({
      where: {
        tenantId,
        status: 'PENDING'
      },
      include: {
        documents: {
          select: {
            id: true,
            type: true,
            fileName: true,
            filePath: true,
            fileSize: true,
            fileHash: true,
            uploadedAt: true,
            isValid: true,
            validationResult: true
          },
          orderBy: {
            uploadedAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // Mais antigos primeiro
      }
    });

    res.json(pendingClients);
  } catch (error) {
    console.error("Erro ao buscar cadastros pendentes:", error);
    res.status(500).json({ error: "Erro ao buscar cadastros pendentes" });
  }
};

/**
 * GET /api/clients/:id
 * Buscar cliente específico
 */
export const getClient: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID obrigatório" });
    }

    const client = await prisma.client.findFirst({
      where: {
        id,
        tenantId
      },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true
              }
            },
            payments: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        documents: true
      }
    });

    if (!client) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.json(client);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    res.status(500).json({ error: "Erro ao buscar cliente" });
  }
};

/**
 * POST /api/clients/register
 * Cadastro inicial de cliente com documentos
 */
export const registerClient: RequestHandler = async (req, res) => {
  try {
    // O upload já foi processado pelo middleware uploadMultipleDocuments
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Nenhum documento foi enviado" });
    }

    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID obrigatório" });
    }

    // Dados do cliente
    const {
      name,
      email,
      phone,
      cpfCnpj,
      personType,
      address,
      city,
      state,
      zipCode,
      // Metadados dos documentos
      documentTypes // Array com tipos de cada documento: ['CPF', 'RG', 'PROOF_OF_ADDRESS']
    } = req.body;

    // Validações básicas
    if (!name || !email || !cpfCnpj || !personType) {
      // Limpar arquivos se validação falhar
      for (const file of files) {
        await deleteFile(file.path);
      }
      return res.status(400).json({ error: "Dados obrigatórios faltando" });
    }

    // Verificar se já existe cliente com mesmo CPF/CNPJ
    const existingClient = await prisma.client.findFirst({
      where: {
        tenantId,
        cpfCnpj
      }
    });

    if (existingClient) {
      // Limpar arquivos
      for (const file of files) {
        await deleteFile(file.path);
      }
      return res.status(400).json({ 
        error: "Já existe um cadastro com este CPF/CNPJ",
        clientId: existingClient.id,
        status: existingClient.status
      });
    }

    // Parse dos tipos de documento
    const docTypes: string[] = JSON.parse(documentTypes || '[]');

    // Validar cada documento
    const documentValidations = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const docType = docTypes[i] || 'UNKNOWN';

      // Calcular hash do arquivo
      const fileHash = await calculateFileHash(file.path);

      // Validar PDF
      const pdfValidation = await validatePDF(file.path);

      documentValidations.push({
        file,
        type: docType,
        hash: fileHash,
        validation: pdfValidation
      });
    }

    // Verificar documentos obrigatórios
    const requiredDocs = checkRequiredDocuments(
      documentValidations.map(d => ({ type: d.type })),
      personType === 'juridica' ? 'juridica' : 'fisica'
    );

    if (!requiredDocs.isComplete) {
      // Limpar arquivos
      for (const file of files) {
        await deleteFile(file.path);
      }
      return res.status(400).json({
        error: "Documentos obrigatórios faltando",
        missing: requiredDocs.missing
      });
    }

    // Criar cliente em transação
    const client = await prisma.$transaction(async (tx) => {
      // Criar cliente com status PENDING
      const newClient = await tx.client.create({
        data: {
          tenantId,
          name,
          email,
          phone,
          cpfCnpj,
          personType: personType.toUpperCase(),
          address: address || '',
          city: city || '',
          state: state || '',
          zipCode: zipCode || '',
          status: 'PENDING',
          rejectionReason: null,
          approvedAt: null,
          approvedBy: null
        }
      });

      // Criar registros de documentos
      for (const docValidation of documentValidations) {
        await tx.document.create({
          data: {
            clientId: newClient.id,
            tenantId,
            type: docValidation.type,
            fileName: docValidation.file.originalname,
            filePath: docValidation.file.path,
            fileSize: docValidation.file.size,
            fileHash: docValidation.hash,
            mimeType: docValidation.file.mimetype,
            uploadedAt: new Date(),
            isValid: docValidation.validation.isValid,
            validationResult: docValidation.validation as any,
            validatedAt: new Date()
          }
        });
      }

      return newClient;
    });

    // Criar notificação para admins/funcionários
    await prisma.notification.create({
      data: {
        tenantId,
        userId: null, // Para todos os admins/funcionários
        type: 'CLIENT_REGISTRATION',
        title: 'Novo cadastro pendente',
        message: `Cliente ${name} enviou documentos para aprovação`,
        data: {
          clientId: client.id,
          clientName: name,
          documentCount: files.length
        } as any,
        read: false
      }
    });

    res.status(201).json({
      message: "Cadastro enviado com sucesso! Aguarde a aprovação.",
      clientId: client.id,
      status: client.status,
      documentsUploaded: files.length
    });
  } catch (error) {
    console.error("Erro ao registrar cliente:", error);
    
    // Limpar arquivos em caso de erro
    const files = req.files as Express.Multer.File[];
    if (files) {
      for (const file of files) {
        await deleteFile(file.path);
      }
    }

    res.status(500).json({ error: "Erro ao processar cadastro" });
  }
};

/**
 * POST /api/clients/:id/approve
 * Aprovar cadastro de cliente (ADMIN/EMPLOYEE apenas)
 */
export const approveClient: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const userId = req.userId;

    if (!tenantId || !userId) {
      return res.status(400).json({ error: "Autenticação inválida" });
    }

    // Buscar cliente
    const client = await prisma.client.findFirst({
      where: {
        id,
        tenantId,
        status: 'PENDING'
      },
      include: {
        documents: true
      }
    });

    if (!client) {
      return res.status(404).json({ error: "Cliente não encontrado ou já foi processado" });
    }

    // Verificar se todos documentos são válidos
    const invalidDocs = client.documents.filter(doc => !doc.isValid);
    if (invalidDocs.length > 0) {
      return res.status(400).json({
        error: "Existem documentos inválidos",
        invalidDocuments: invalidDocs.map(d => d.type)
      });
    }

    // Atualizar cliente
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: userId,
        rejectionReason: null
      }
    });

    // Criar notificação para o cliente (se houver user associado)
    await prisma.notification.create({
      data: {
        tenantId,
        userId: null,
        type: 'CLIENT_APPROVED',
        title: 'Cadastro aprovado!',
        message: `Seu cadastro foi aprovado. Você já pode realizar locações.`,
        data: {
          clientId: client.id,
          clientName: client.name
        } as any,
        read: false
      }
    });

    res.json({
      message: "Cliente aprovado com sucesso!",
      client: updatedClient
    });
  } catch (error) {
    console.error("Erro ao aprovar cliente:", error);
    res.status(500).json({ error: "Erro ao aprovar cliente" });
  }
};

/**
 * POST /api/clients/:id/reject
 * Rejeitar cadastro de cliente (ADMIN/EMPLOYEE apenas)
 */
export const rejectClient: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const tenantId = req.tenantId;
    const userId = req.userId;

    if (!tenantId || !userId) {
      return res.status(400).json({ error: "Autenticação inválida" });
    }

    if (!reason) {
      return res.status(400).json({ error: "Motivo da rejeição é obrigatório" });
    }

    // Buscar cliente
    const client = await prisma.client.findFirst({
      where: {
        id,
        tenantId,
        status: 'PENDING'
      },
      include: {
        documents: true
      }
    });

    if (!client) {
      return res.status(404).json({ error: "Cliente não encontrado ou já foi processado" });
    }

    // Atualizar cliente
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        approvedAt: null,
        approvedBy: null
      }
    });

    // Criar notificação
    await prisma.notification.create({
      data: {
        tenantId,
        userId: null,
        type: 'CLIENT_REJECTED',
        title: 'Cadastro rejeitado',
        message: `Seu cadastro foi rejeitado. Motivo: ${reason}`,
        data: {
          clientId: client.id,
          clientName: client.name,
          reason
        } as any,
        read: false
      }
    });

    // Opcionalmente, deletar documentos após rejeição (ou manter para histórico)
    // Para manter histórico, não deletamos os arquivos

    res.json({
      message: "Cadastro rejeitado",
      client: updatedClient
    });
  } catch (error) {
    console.error("Erro ao rejeitar cliente:", error);
    res.status(500).json({ error: "Erro ao rejeitar cliente" });
  }
};

/**
 * GET /api/clients/:id/documents/:documentId/download
 * Download de documento (ADMIN/EMPLOYEE apenas)
 */
export const downloadDocument: RequestHandler = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    const tenantId = req.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID obrigatório" });
    }

    // Buscar documento
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        clientId: id,
        tenantId
      }
    });

    if (!document) {
      return res.status(404).json({ error: "Documento não encontrado" });
    }

    // Validar path do arquivo
    if (!validateFilePath(document.filePath)) {
      return res.status(403).json({ error: "Acesso ao arquivo negado" });
    }

    // Enviar arquivo
    res.download(document.filePath, document.fileName);
  } catch (error) {
    console.error("Erro ao baixar documento:", error);
    res.status(500).json({ error: "Erro ao baixar documento" });
  }
};

/**
 * POST /api/clients/:id/documents/upload
 * Upload adicional de documentos para cliente existente
 */
export const uploadAdditionalDocuments: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    const tenantId = req.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID obrigatório" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Nenhum documento foi enviado" });
    }

    // Buscar cliente
    const client = await prisma.client.findFirst({
      where: {
        id,
        tenantId
      }
    });

    if (!client) {
      // Limpar arquivos
      for (const file of files) {
        await deleteFile(file.path);
      }
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const { documentTypes } = req.body;
    const docTypes: string[] = JSON.parse(documentTypes || '[]');

    // Validar e criar documentos
    const createdDocuments = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const docType = docTypes[i] || 'OTHER';

      const fileHash = await calculateFileHash(file.path);
      const pdfValidation = await validatePDF(file.path);

      const document = await prisma.document.create({
        data: {
          clientId: id,
          tenantId,
          type: docType,
          fileName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          fileHash,
          mimeType: file.mimetype,
          uploadedAt: new Date(),
          isValid: pdfValidation.isValid,
          validationResult: pdfValidation as any,
          validatedAt: new Date()
        }
      });

      createdDocuments.push(document);
    }

    res.json({
      message: "Documentos enviados com sucesso",
      documents: createdDocuments
    });
  } catch (error) {
    console.error("Erro ao enviar documentos:", error);
    
    // Limpar arquivos
    const files = req.files as Express.Multer.File[];
    if (files) {
      for (const file of files) {
        await deleteFile(file.path);
      }
    }

    res.status(500).json({ error: "Erro ao enviar documentos" });
  }
};

// Configurar rotas
router.get("/", authenticateToken, requireTenant, getClients);
router.get("/pending", authenticateToken, requireTenant, requireRole(['ADMIN', 'EMPLOYEE', 'MASTER_ADMIN']), getPendingClients);
router.get("/:id", authenticateToken, requireTenant, getClient);

// Registro público (sem authenticateToken)
router.post("/register", requireTenant, uploadMultipleDocuments, registerClient);

// Aprovação/rejeição (apenas admin/funcionário)
router.post("/:id/approve", authenticateToken, requireTenant, requireRole(['ADMIN', 'EMPLOYEE', 'MASTER_ADMIN']), approveClient);
router.post("/:id/reject", authenticateToken, requireTenant, requireRole(['ADMIN', 'EMPLOYEE', 'MASTER_ADMIN']), rejectClient);

// Download de documento (apenas admin/funcionário)
router.get("/:id/documents/:documentId/download", authenticateToken, requireTenant, requireRole(['ADMIN', 'EMPLOYEE', 'MASTER_ADMIN']), downloadDocument);

// Upload adicional
router.post("/:id/documents/upload", authenticateToken, requireTenant, uploadMultipleDocuments, uploadAdditionalDocuments);

export default router;
