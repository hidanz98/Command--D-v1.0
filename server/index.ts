import express from "express";
import cors from "cors";
import { handlePing } from "./routes/ping";
import { handleDemo } from "./routes/demo";
import { login, register, me, createTenant, debugUser } from "./routes/auth";
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "./routes/products";
import { getProductHistory, createHistoryRecord } from "./routes/product-history";
import { getCategories } from "./routes/categories";
import { 
  generateQRCode, 
  generateBarcode, 
  getPrintCodes, 
  scanProduct, 
  batchGenerateCodes 
} from "./routes/product-codes";
import {
  listMaintenances,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getProductMaintenances,
  getUpcomingMaintenances,
  getMaintenanceReport
} from "./routes/maintenances";
import { 
  getSettings, 
  updateSettings, 
  updateScannerSettings,
  updateEmailSettings,
  updateWhatsAppSettings,
  updateSecuritySettings,
  updateAppearanceSettings,
  updateBackupSettings,
  updateGeneralSettings
} from "./routes/settings";
import { sendTestEmail } from "./routes/email-test";
import { 
  createBackup,
  listBackups,
  downloadBackup,
  restoreBackup,
  deleteBackup
} from "./routes/backup";
import { 
  getOrders, 
  getOrder, 
  createOrder, 
  updateOrderStatus,
  returnOrder
} from "./routes/orders";
import clientsRouter from "./routes/clients";
import { 
  getEmployees, 
  getEmployee, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee 
} from "./routes/employees";
import { 
  getTimesheets, 
  clockIn, 
  clockOut, 
  approveTimesheet 
} from "./routes/timesheets";
import nfseRouter from "./routes/nfse";
import pluggyRouter from "./routes/pluggy";
import identityValidationRouter from "./routes/identity-validation";
import { authenticateToken } from "./lib/auth";
import { requireRole } from "./middleware/roleMiddleware";
import { requireTenant } from "./middleware/tenantMiddleware";
import { validateLicense, checkLicenseStatus, checkPlanLimits } from "./middleware/licenseValidation";
import { 
  getLicenses, 
  createLicense, 
  updateLicense, 
  suspendLicense, 
  activateLicense, 
  receiveHeartbeat,
  registerPayment,
  getDashboard
} from "./routes/master";
import partnershipsRouter from "./routes/partnerships";
import diagnosticsRouter from "./routes/diagnostics";
import remoteAiRouter from "./routes/remote-ai";
import { startHeartbeat } from "./jobs/heartbeat";
import { getPublicProducts } from "./routes/public";
import { startLicenseChecker } from "./jobs/licenseChecker";
import { startReminderJob } from "./jobs/reminderJob";
import { startBackupJob } from "./jobs/backupJob";
import { upload, uploadProductImage, uploadProductImages, deleteProductImage } from "./routes/upload";
import path from "path";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  
  // Middleware para garantir que rotas de API sempre retornem JSON
  app.use('/api', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Garantir Content-Type JSON para todas as rotas de API
    res.setHeader('Content-Type', 'application/json');
    next();
  });
  
  // Aumentar limite do body para suportar imagens em base64
  app.use(express.json({ 
    limit: '50mb',
    verify: (req: any, res: any, buf: Buffer) => {
      // Log se o body for muito grande
      if (buf.length > 10 * 1024 * 1024) {
        console.log('⚠️ Body grande recebido:', (buf.length / 1024 / 1024).toFixed(2), 'MB');
      }
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // Middleware para capturar erros de parsing do JSON
  app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof SyntaxError && 'body' in err) {
      console.error('❌ Erro ao parsear JSON:', err.message);
      return res.status(400).json({
        success: false,
        error: 'JSON inválido no corpo da requisição',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    next(err);
  });
  
  // Servir arquivos estáticos da pasta uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Iniciar jobs (apenas se houver LICENSE_API_KEY configurada)
  if (process.env.LICENSE_API_KEY) {
    console.log('🫀 Iniciando heartbeat...');
    startHeartbeat();
  }

  // Iniciar job de verificação de licenças (apenas no servidor MASTER)
  if (process.env.MASTER_DATABASE_URL) {
    console.log('🤖 Iniciando license checker...');
    startLicenseChecker();
  }

  // Iniciar job de lembretes de devolução
  console.log('🔔 Iniciando job de lembretes...');
  startReminderJob();

  // Iniciar job de backup automático
  console.log('💾 Iniciando job de backup automático...');
  startBackupJob();

  // Public API Routes
  app.get("/api/ping", handlePing);
  app.get("/api/demo", handleDemo);
  app.get("/api/public/products", getPublicProducts);
  
  // Auth Routes
  app.post("/api/auth/login", login);
  app.post("/api/auth/register", register);
  app.post("/api/auth/tenant", createTenant);
  app.get("/api/auth/debug/user", debugUser); // Debug: verificar usuário
  
  // Protected Routes
  app.get("/api/auth/me", authenticateToken, me);
  
  // Products Routes
  app.get("/api/products", authenticateToken, requireTenant, getProducts);
  app.get("/api/products/:id", authenticateToken, requireTenant, getProduct);
  app.post("/api/products", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), createProduct);
  app.put("/api/products/:id", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), updateProduct);
  app.delete("/api/products/:id", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), deleteProduct);
  
  // Product History Routes
  app.get("/api/products/:productId/history", authenticateToken, requireTenant, getProductHistory);
  app.post("/api/product-history", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), createHistoryRecord);
  
  // Product Codes Routes (QR Code e Barcode)
  app.post("/api/products/:id/generate-qrcode", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), generateQRCode);
  app.post("/api/products/:id/generate-barcode", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), generateBarcode);
  app.get("/api/products/:id/print-codes", authenticateToken, requireTenant, getPrintCodes);
  app.get("/api/products/scan/:code", authenticateToken, requireTenant, scanProduct);
  app.post("/api/products/batch-generate-codes", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), batchGenerateCodes);
  
  // Product Maintenances Routes
  app.get("/api/maintenances", authenticateToken, requireTenant, listMaintenances);
  app.get("/api/maintenances/upcoming", authenticateToken, requireTenant, getUpcomingMaintenances);
  app.get("/api/maintenances/report", authenticateToken, requireTenant, getMaintenanceReport);
  app.get("/api/maintenances/:id", authenticateToken, requireTenant, getMaintenanceById);
  app.post("/api/maintenances", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), createMaintenance);
  app.put("/api/maintenances/:id", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), updateMaintenance);
  app.delete("/api/maintenances/:id", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), deleteMaintenance);
  app.get("/api/products/:productId/maintenances", authenticateToken, requireTenant, getProductMaintenances);
  
  // Category Routes
  app.get("/api/categories", authenticateToken, requireTenant, getCategories);
  
  // Settings Routes
  app.get("/api/settings", authenticateToken, requireTenant, getSettings);
  app.put("/api/settings", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), updateSettings);
  app.patch("/api/settings/scanner", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), updateScannerSettings);
  app.patch("/api/settings/email", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), updateEmailSettings);
  app.patch("/api/settings/whatsapp", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), updateWhatsAppSettings);
  app.patch("/api/settings/security", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), updateSecuritySettings);
  app.patch("/api/settings/appearance", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), updateAppearanceSettings);
  app.patch("/api/settings/backup", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), updateBackupSettings);
  app.patch("/api/settings/general", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), updateGeneralSettings);
  
  // Email Test Route
  app.post("/api/email/test", authenticateToken, requireTenant, sendTestEmail);
  
  // Backup Routes
  app.post("/api/backup/create", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), createBackup);
  app.get("/api/backup/list", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), listBackups);
  app.get("/api/backup/download/:filename", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), downloadBackup);
  app.post("/api/backup/restore/:filename", authenticateToken, requireTenant, requireRole(['MASTER_ADMIN']), restoreBackup);
  app.delete("/api/backup/:filename", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), deleteBackup);
  
  // Upload Routes
  app.post("/api/upload/product-image", authenticateToken, requireRole(['ADMIN', 'MASTER_ADMIN']), upload.single('image'), uploadProductImage);
  app.post("/api/upload/product-images", authenticateToken, requireRole(['ADMIN', 'MASTER_ADMIN']), upload.array('images', 5), uploadProductImages);
  app.delete("/api/upload/product-image/:filename", authenticateToken, requireRole(['ADMIN', 'MASTER_ADMIN']), deleteProductImage);
  
  // Orders Routes
  app.get("/api/orders", authenticateToken, requireTenant, getOrders);
  app.get("/api/orders/:id", authenticateToken, requireTenant, getOrder);
  app.post("/api/orders", authenticateToken, requireTenant, createOrder);
  app.put("/api/orders/:id/status", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), updateOrderStatus);
  app.post("/api/orders/:id/return", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), returnOrder);
  
  // Clients Routes (usando router completo)
  app.use("/api/clients", clientsRouter);
  
  // Employees Routes
  app.get("/api/employees", authenticateToken, requireTenant, getEmployees);
  app.get("/api/employees/:id", authenticateToken, requireTenant, getEmployee);
  app.post("/api/employees", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), createEmployee);
  app.put("/api/employees/:id", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), updateEmployee);
  app.delete("/api/employees/:id", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), deleteEmployee);
  
  // Timesheets Routes
  app.get("/api/timesheets", authenticateToken, requireTenant, getTimesheets);
  app.post("/api/timesheets/clock-in", authenticateToken, requireTenant, clockIn);
  app.post("/api/timesheets/clock-out", authenticateToken, requireTenant, clockOut);
  app.put("/api/timesheets/:id/approve", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), approveTimesheet);
  
  // NFSe Routes (apenas para ADMIN e MASTER_ADMIN)
  app.use("/api/nfse", authenticateToken, requireTenant, requireRole(['ADMIN', 'MASTER_ADMIN']), nfseRouter);
  
  // Pluggy Routes (integração bancária - Open Banking)
  app.use("/api/pluggy", authenticateToken, pluggyRouter);
  app.use("/api/identity", identityValidationRouter); // Validação de identidade (BigDataCorp)
  
  // ==============================================
  // ROTAS DO SERVIDOR MASTER (Otávio)
  // ==============================================
  // Estas rotas só funcionam no servidor master
  // Requerem autenticação especial
  
  app.get("/api/master/dashboard", getDashboard);
  app.get("/api/master/licenses", getLicenses);
  app.post("/api/master/licenses", createLicense);
  app.put("/api/master/licenses/:id", updateLicense);
  app.post("/api/master/licenses/:id/suspend", suspendLicense);
  app.post("/api/master/licenses/:id/activate", activateLicense);
  app.post("/api/master/heartbeat", receiveHeartbeat);
  app.post("/api/master/payments", registerPayment);
  
  // ==============================================
  // ROTAS DE PARCERIAS (Opcional)
  // ==============================================
  // Permite compartilhar cadastro de clientes entre locadoras parceiras
  app.use("/api/partnerships", authenticateToken, requireTenant, partnershipsRouter);
  
  // ==============================================
  // ROTAS DE DIAGNÓSTICO DO SISTEMA
  // ==============================================
  // Monitoramento de logs, dispositivos e compatibilidade
  app.use("/api/diagnostics", diagnosticsRouter);
  
  // ==============================================
  // IA REMOTA - Controle do Cursor via iPhone
  // ==============================================
  app.use("/api/remote-ai", remoteAiRouter);
  
  // ==============================================
  // MIDDLEWARE DE VALIDAÇÃO DE LICENÇA
  // ==============================================
  // Aplicar em rotas protegidas (opcional, pode ser usado seletivamente)
  // Descomente as linhas abaixo para ativar validação de licença
  
  // Exemplo: Validar licença em todas as rotas de produtos
  // app.use("/api/products", checkLicenseStatus);
  
  // Exemplo: Validar licença e verificar limites do plano
  // app.use("/api/*", checkLicenseStatus, checkPlanLimits);

  // ==============================================
  // HANDLER DE ERRO GLOBAL
  // ==============================================
  // IMPORTANTE: Deve ser o ÚLTIMO middleware registrado
  // Garante que TODOS os erros retornem JSON, nunca HTML
  
  // Handler para rotas não encontradas (404) - ANTES do handler de erro
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Só retornar 404 se for uma rota de API
    if (req.path.startsWith('/api/')) {
      res.status(404).json({
        success: false,
        error: 'Rota não encontrada',
        path: req.path
      });
    } else {
      // Para rotas não-API, deixar o Vite/React lidar
      next();
    }
  });
  
  // Handler de erro global - DEVE ser o último
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ === ERRO NÃO TRATADO ===');
    console.error('URL:', req.url);
    console.error('Method:', req.method);
    console.error('Headers:', req.headers);
    console.error('Erro:', err);
    console.error('Tipo do erro:', err?.constructor?.name);
    console.error('Mensagem:', err?.message);
    console.error('Stack:', err?.stack);
    
    // Sempre retornar JSON, nunca HTML
    // Verificar se já foi enviada resposta
    if (res.headersSent) {
      console.error('⚠️ Headers já enviados, não é possível enviar resposta JSON');
      return next(err);
    }
    
    // Garantir Content-Type JSON
    res.setHeader('Content-Type', 'application/json');
    
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? {
        type: err?.constructor?.name,
        stack: err?.stack,
        url: req.url,
        method: req.method,
        code: err?.code
      } : undefined
    });
  });

  return app;
}
