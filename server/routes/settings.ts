import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";

const prisma = new PrismaClient();

// Função para encriptar dados sensíveis (senhas, API keys)
const encrypt = (text: string): string => {
  const algorithm = 'aes-256-cbc';
  const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Função para decriptar dados
const decrypt = (text: string): string => {
  try {
    const algorithm = 'aes-256-cbc';
    const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return text; // Se falhar, retorna o texto original
  }
};

// ==============================================
// GET ALL SETTINGS
// ==============================================
export const getSettings: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant não identificado" });
    }

    let settings = await prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    // Se não existir, criar com valores padrão
    if (!settings) {
      settings = await prisma.tenantSettings.create({
        data: { tenantId },
      });
    }

    // Não enviar senhas para o frontend
    const safeSettings = {
      ...settings,
      smtpPassword: settings.smtpPassword ? '********' : null,
      whatsappApiKey: settings.whatsappApiKey ? '********' : null,
      backupCloudCredentials: settings.backupCloudCredentials ? '********' : null,
    };

    res.json(safeSettings);
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    res.status(500).json({ error: "Erro ao buscar configurações" });
  }
};

// ==============================================
// UPDATE ALL SETTINGS (Generic)
// ==============================================
export const updateSettings: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant não identificado" });
    }

    const data = req.body;

    // Encriptar campos sensíveis se estiverem sendo atualizados
    if (data.smtpPassword && data.smtpPassword !== '********') {
      data.smtpPassword = encrypt(data.smtpPassword);
    } else {
      delete data.smtpPassword; // Não atualizar se for o placeholder
    }

    if (data.whatsappApiKey && data.whatsappApiKey !== '********') {
      data.whatsappApiKey = encrypt(data.whatsappApiKey);
    } else {
      delete data.whatsappApiKey;
    }

    if (data.backupCloudCredentials && data.backupCloudCredentials !== '********') {
      data.backupCloudCredentials = encrypt(data.backupCloudCredentials);
    } else {
      delete data.backupCloudCredentials;
    }

    const settings = await prisma.tenantSettings.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data },
    });

    const safeSettings = {
      ...settings,
      smtpPassword: settings.smtpPassword ? '********' : null,
      whatsappApiKey: settings.whatsappApiKey ? '********' : null,
      backupCloudCredentials: settings.backupCloudCredentials ? '********' : null,
    };

    res.json(safeSettings);
  } catch (error) {
    console.error("Erro ao atualizar configurações:", error);
    res.status(500).json({ error: "Erro ao atualizar configurações" });
  }
};

// ==============================================
// EMAIL SETTINGS
// ==============================================
const emailSettingsSchema = z.object({
  emailEnabled: z.boolean(),
  emailProvider: z.enum(["smtp", "resend", "sendgrid", "mailgun"]).optional(),
  
  // SMTP
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpUseTLS: z.boolean().optional(),
  
  // Resend
  resendApiKey: z.string().optional(),
  
  // Geral
  emailFromName: z.string().optional(),
  emailFromAddress: z.string().email().optional(),
});

export const updateEmailSettings: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant não identificado" });
    }

    const data = emailSettingsSchema.parse(req.body);

    // Encriptar senha SMTP
    if (data.smtpPassword && data.smtpPassword !== '********') {
      data.smtpPassword = encrypt(data.smtpPassword);
    } else {
      delete data.smtpPassword as any;
    }

    // Encriptar API Key do Resend
    if (data.resendApiKey && data.resendApiKey !== '********') {
      data.resendApiKey = encrypt(data.resendApiKey);
    } else {
      delete data.resendApiKey as any;
    }

    const settings = await prisma.tenantSettings.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data },
    });

    res.json({ 
      success: true, 
      message: "Configurações de email salvas com sucesso",
      emailEnabled: settings.emailEnabled 
    });
  } catch (error) {
    console.error("Erro ao atualizar configurações de email:", error);
    res.status(500).json({ error: "Erro ao salvar configurações de email" });
  }
};

// ==============================================
// WHATSAPP SETTINGS
// ==============================================
const whatsappSettingsSchema = z.object({
  whatsappEnabled: z.boolean(),
  whatsappApiKey: z.string().optional(),
  whatsappPhoneNumber: z.string().optional(),
  whatsappSendOrderConfirm: z.boolean().optional(),
  whatsappSendReminder: z.boolean().optional(),
  whatsappSendInvoice: z.boolean().optional(),
  whatsappReminderDays: z.number().optional(),
});

export const updateWhatsAppSettings: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant não identificado" });
    }

    const data = whatsappSettingsSchema.parse(req.body);

    // Encriptar API key
    if (data.whatsappApiKey && data.whatsappApiKey !== '********') {
      data.whatsappApiKey = encrypt(data.whatsappApiKey);
    } else {
      delete data.whatsappApiKey as any;
    }

    const settings = await prisma.tenantSettings.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data },
    });

    res.json({ 
      success: true, 
      message: "Configurações de WhatsApp salvas com sucesso",
      whatsappEnabled: settings.whatsappEnabled 
    });
  } catch (error) {
    console.error("Erro ao atualizar configurações de WhatsApp:", error);
    res.status(500).json({ error: "Erro ao salvar configurações de WhatsApp" });
  }
};

// ==============================================
// SECURITY SETTINGS
// ==============================================
const securitySettingsSchema = z.object({
  require2FA: z.boolean().optional(),
  requireStrongPassword: z.boolean().optional(),
  passwordMinLength: z.number().min(6).max(32).optional(),
  requireUppercase: z.boolean().optional(),
  requireNumbers: z.boolean().optional(),
  requireSpecialChars: z.boolean().optional(),
  sessionTimeoutMinutes: z.number().min(5).max(1440).optional(),
  maxLoginAttempts: z.number().min(3).max(10).optional(),
  lockoutDurationMinutes: z.number().min(5).max(60).optional(),
  enableIPWhitelist: z.boolean().optional(),
  allowedIPs: z.string().optional(),
});

export const updateSecuritySettings: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant não identificado" });
    }

    const data = securitySettingsSchema.parse(req.body);

    const settings = await prisma.tenantSettings.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data },
    });

    res.json({ 
      success: true, 
      message: "Configurações de segurança salvas com sucesso" 
    });
  } catch (error) {
    console.error("Erro ao atualizar configurações de segurança:", error);
    res.status(500).json({ error: "Erro ao salvar configurações de segurança" });
  }
};

// ==============================================
// APPEARANCE SETTINGS
// ==============================================
const appearanceSettingsSchema = z.object({
  siteName: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
});

export const updateAppearanceSettings: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant não identificado" });
    }

    const data = appearanceSettingsSchema.parse(req.body);

    const settings = await prisma.tenantSettings.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data },
    });

    res.json({ 
      success: true, 
      message: "Configurações de aparência salvas com sucesso",
      settings: {
        siteName: settings.siteName,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        accentColor: settings.accentColor,
      }
    });
  } catch (error) {
    console.error("Erro ao atualizar configurações de aparência:", error);
    res.status(500).json({ error: "Erro ao salvar configurações de aparência" });
  }
};

// ==============================================
// BACKUP SETTINGS
// ==============================================
const backupSettingsSchema = z.object({
  autoBackupEnabled: z.boolean().optional(),
  backupFrequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']).optional(),
  backupRetentionDays: z.number().min(1).max(365).optional(),
  backupCloudEnabled: z.boolean().optional(),
  backupCloudProvider: z.enum(['local', 'aws-s3', 'google-drive', 'dropbox', 'azure']).optional(),
  backupCloudCredentials: z.string().optional(),
});

export const updateBackupSettings: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant não identificado" });
    }

    const data = backupSettingsSchema.parse(req.body);

    // Encriptar credenciais cloud
    if (data.backupCloudCredentials && data.backupCloudCredentials !== '********') {
      data.backupCloudCredentials = encrypt(data.backupCloudCredentials);
    } else {
      delete data.backupCloudCredentials as any;
    }

    const settings = await prisma.tenantSettings.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data },
    });

    res.json({ 
      success: true, 
      message: "Configurações de backup salvas com sucesso",
      autoBackupEnabled: settings.autoBackupEnabled 
    });
  } catch (error) {
    console.error("Erro ao atualizar configurações de backup:", error);
    res.status(500).json({ error: "Erro ao salvar configurações de backup" });
  }
};

// ==============================================
// GENERAL SETTINGS (Rental rules, payments, etc)
// ==============================================
const generalSettingsSchema = z.object({
  // Notifications
  notifyEmail: z.boolean().optional(),
  notifyWhatsApp: z.boolean().optional(),
  notifyPush: z.boolean().optional(),
  
  // Rentals
  enableLateFee: z.boolean().optional(),
  lateFeePercentage: z.number().min(0).max(100).optional(),
  enableDeposit: z.boolean().optional(),
  depositPercentage: z.number().min(0).max(100).optional(),
  enableNFSe: z.boolean().optional(),
  autoIssueNFSe: z.boolean().optional(),
  
  // Payments
  enablePaymentPix: z.boolean().optional(),
  enablePaymentCard: z.boolean().optional(),
  enablePaymentBoleto: z.boolean().optional(),
  enablePaymentCash: z.boolean().optional(),
  pixKey: z.string().optional(),
});

export const updateGeneralSettings: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant não identificado" });
    }

    const data = generalSettingsSchema.parse(req.body);

    const settings = await prisma.tenantSettings.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data },
    });

    res.json({ 
      success: true, 
      message: "Configurações gerais salvas com sucesso" 
    });
  } catch (error) {
    console.error("Erro ao atualizar configurações gerais:", error);
    res.status(500).json({ error: "Erro ao salvar configurações gerais" });
  }
};

// ==============================================
// SCANNER SETTINGS (já existia, mantendo)
// ==============================================
const scannerSettingsSchema = z.object({
  enableCheckoutScanner: z.boolean(),
  enableCheckinScanner: z.boolean(),
  requireScanOnCheckout: z.boolean(),
  requireScanOnCheckin: z.boolean(),
});

export const updateScannerSettings: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant não identificado" });
    }

    const data = scannerSettingsSchema.parse(req.body);

    const settings = await prisma.tenantSettings.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data },
    });

    res.json({ 
      success: true, 
      message: "Configurações de scanner salvas com sucesso" 
    });
  } catch (error) {
    console.error("Erro ao atualizar configurações de scanner:", error);
    res.status(500).json({ error: "Erro ao salvar configurações de scanner" });
  }
};

// Exportar função auxiliar de decriptação para uso em outros serviços
export { decrypt };
