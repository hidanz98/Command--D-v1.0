import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { EmailService } from "../lib/EmailService";
import { prisma } from "../lib/prisma";
import { z } from "zod";

const testEmailSchema = z.object({
  toEmail: z.string().email(),
});

/**
 * Enviar email de teste
 * POST /api/email/test
 */
export const sendTestEmail: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant não identificado" });
    }

    const { toEmail } = testEmailSchema.parse(req.body);

    // Buscar configurações do tenant
    const tenantSettings = await prisma.tenantSettings.findUnique({
      where: { tenantId }
    });

    if (!tenantSettings || !tenantSettings.emailEnabled) {
      return res.status(400).json({ error: "Email não está habilitado. Ative nas configurações." });
    }

    // Enviar email de teste
    const emailService = new EmailService(tenantSettings);
    await emailService.sendTestEmail(toEmail);

    res.json({
      success: true,
      message: `Email de teste enviado para ${toEmail}`,
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de teste:", error);
    
    // Mensagens de erro mais amigáveis
    let errorMessage = "Erro ao enviar email de teste";
    
    if (error.message.includes("não está habilitado")) {
      errorMessage = "Email não está habilitado. Ative nas configurações.";
    } else if (error.message.includes("API Key")) {
      errorMessage = "API Key inválida ou não configurada.";
    } else if (error.message.includes("SMTP")) {
      errorMessage = "Configurações SMTP inválidas. Verifique host, porta e credenciais.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ error: errorMessage });
  }
};

