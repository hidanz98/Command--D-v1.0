import { RequestHandler } from 'express';
import { prisma } from '../lib/prisma';
import { BackupService } from '../lib/BackupService';
import { createManualBackup } from '../jobs/backupJob';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Cria um backup manual
 * POST /api/backup/create
 */
export const createBackup: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const result = await createManualBackup(tenantId);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar backup'
    });
  }
};

/**
 * Lista todos os backups disponíveis
 * GET /api/backup/list
 */
export const listBackups: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { tenantSettings: true }
    });

    if (!tenant || !tenant.tenantSettings) {
      return res.status(404).json({ error: 'Tenant não encontrado' });
    }

    const backupService = new BackupService(tenant.tenantSettings);
    const backups = await backupService.listBackups(tenantId);

    res.json({
      success: true,
      data: backups
    });
  } catch (error) {
    console.error('Erro ao listar backups:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar backups'
    });
  }
};

/**
 * Baixa um arquivo de backup
 * GET /api/backup/download/:filename
 */
export const downloadBackup: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { filename } = req.params;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { tenantSettings: true }
    });

    if (!tenant || !tenant.tenantSettings) {
      return res.status(404).json({ error: 'Tenant não encontrado' });
    }

    const backupService = new BackupService(tenant.tenantSettings);
    const backups = await backupService.listBackups(tenantId);

    const backup = backups.find(b => b.filename === filename);

    if (!backup) {
      return res.status(404).json({ error: 'Backup não encontrado' });
    }

    res.download(backup.filepath, backup.filename);
  } catch (error) {
    console.error('Erro ao baixar backup:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao baixar backup'
    });
  }
};

/**
 * Restaura um backup
 * POST /api/backup/restore/:filename
 */
export const restoreBackup: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { filename } = req.params;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { tenantSettings: true }
    });

    if (!tenant || !tenant.tenantSettings) {
      return res.status(404).json({ error: 'Tenant não encontrado' });
    }

    const backupService = new BackupService(tenant.tenantSettings);
    const backups = await backupService.listBackups(tenantId);

    const backup = backups.find(b => b.filename === filename);

    if (!backup) {
      return res.status(404).json({ error: 'Backup não encontrado' });
    }

    const success = await backupService.restoreBackup(backup.filepath);

    if (success) {
      res.json({
        success: true,
        message: 'Backup restaurado com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro ao restaurar backup'
      });
    }
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao restaurar backup'
    });
  }
};

/**
 * Exclui um backup
 * DELETE /api/backup/:filename
 */
export const deleteBackup: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req;
    const { filename } = req.params;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { tenantSettings: true }
    });

    if (!tenant || !tenant.tenantSettings) {
      return res.status(404).json({ error: 'Tenant não encontrado' });
    }

    const backupService = new BackupService(tenant.tenantSettings);
    const backups = await backupService.listBackups(tenantId);

    const backup = backups.find(b => b.filename === filename);

    if (!backup) {
      return res.status(404).json({ error: 'Backup não encontrado' });
    }

    const fs = require('fs/promises');
    await fs.unlink(backup.filepath);

    res.json({
      success: true,
      message: 'Backup excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir backup:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir backup'
    });
  }
};

