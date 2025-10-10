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

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

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
