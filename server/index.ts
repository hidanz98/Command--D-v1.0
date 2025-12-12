import express from "express";
import cors from "cors";
import { handlePing } from "./routes/ping";
import { handleDemo } from "./routes/demo";
import { login, register, me, createTenant } from "./routes/auth";
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
  app.use(express.json());
  
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
  // MIDDLEWARE DE VALIDAÇÃO DE LICENÇA
  // ==============================================
  // Aplicar em rotas protegidas (opcional, pode ser usado seletivamente)
  // Descomente as linhas abaixo para ativar validação de licença
  
  // Exemplo: Validar licença em todas as rotas de produtos
  // app.use("/api/products", checkLicenseStatus);
  
  // Exemplo: Validar licença e verificar limites do plano
  // app.use("/api/*", checkLicenseStatus, checkPlanLimits);

  return app;
}
