import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  Building,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  FileText,
  Calculator,
  BarChart3,
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  Eye,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Percent,
  Wallet,
  HandCoins,
  CircleDollarSign,
  FileBarChart,
  PlusCircle,
  MinusCircle,
  Printer,
  FileSpreadsheet,
  Bell,
  Send,
  MessageSquare,
  Target,
  PieChart,
  Archive,
  CopyCheck,
  Banknote,
  Zap,
  RefreshCw,
  ExternalLink,
  Settings,
  Shield,
  Lock,
  UserCheck,
  Clipboard,
} from "lucide-react";
import {
  ReceivablesTab,
  PayablesTab,
  CashFlowTab,
  EmployeesTab,
  PayrollTab,
  ReportsTab,
  TaxesTab,
} from "./FinancialERPTabs";
import { AutoTimesheetSystem } from "./AutoTimesheetSystem";
import AutomatedPayroll from "./AutomatedPayroll";

// Interfaces
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  rg: string;
  position: string;
  department: string;
  baseSalary: number;
  benefits: number;
  discounts: number;
  grossSalary: number;
  netSalary: number;
  hireDate: string;
  status: "active" | "inactive" | "vacation" | "dismissed";
  address: string;
  birthDate: string;
  workHours: number;
  overtime: number;
  bankAccount: string;
  pix: string;
  emergencyContact: string;
  hasContract: boolean;
  isOnline?: boolean;
}

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  subcategory: string;
  description: string;
  amount: number;
  date: string;
  dueDate: string;
  payDate?: string;
  status: "pending" | "paid" | "overdue" | "cancelled" | "partial";
  clientId?: string;
  supplierId?: string;
  invoiceNumber: string;
  paymentMethod: string;
  installments: number;
  currentInstallment: number;
  totalInstallments: number;
  recurrent: boolean;
  recurrentPeriod?: "monthly" | "quarterly" | "annual";
  tags: string[];
  notes: string;
  costCenter: string;
  project?: string;
  attachments: string[];
  approval: {
    required: boolean;
    approved: boolean;
    approver?: string;
    approvalDate?: string;
  };
}

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  agency?: string;
  account?: string;
  accountNumber?: string;
  accountType?: "checking" | "savings" | "business" | "investment" | "pix";
  balance: number;
  type?: "checking" | "savings" | "investment" | "pix";
  active?: boolean;
  isActive?: boolean;
  lastUpdate?: string;
  currency?: string;
  pluggyConnectionId?: string;
  lastSync?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

interface CostCenter {
  id: string;
  name: string;
  description: string;
  budget: number;
  spent: number;
  responsible: string;
  department: string;
  departmentId: string;
  active: boolean;
  code?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TaxConfig {
  id: string;
  name: string;
  rate: number;
  type: "federal" | "state" | "municipal";
  baseCalculation: string;
  dueDay: number;
  autoCalculate: boolean;
  regime: "simples" | "presumido" | "real";
}

interface CompanyConfig {
  cnpj: string;
  companyName: string;
  regime: "simples" | "presumido" | "real";
  activity: string;
  address: string;
  phone: string;
  email: string;
  stateRegistration: string;
  municipalRegistration: string;
  autoDetected: boolean;
  lastUpdate: string | null;
}

interface Notification {
  id: string;
  type: "payment_due" | "payment_overdue" | "receivable_due" | "tax_due" | "payroll_due" | "approval_required";
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  date: string;
  read: boolean;
  actionRequired: boolean;
  relatedId?: string;
}

interface Report {
  id: string;
  name: string;
  type: "financial" | "tax" | "payroll" | "cashflow" | "profit_loss" | "balance_sheet";
  period: string;
  status: "generating" | "ready" | "error";
  generatedAt: string;
  downloadUrl?: string;
}

// Interfaces para Contas Bancárias e Pluggy
// Removido: interface BankAccount duplicada
// Usando a interface BankAccount definida anteriormente

interface PluggyCredentials {
  id: string;
  clientId: string;
  clientSecret: string;
  sandbox: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PluggyConnection {
  id: string;
  bankAccountId: string;
  pluggyItemId: string;
  status: "active" | "error" | "expired" | "disconnected";
  lastSync: string;
  errorMessage?: string;
  createdAt: string;
}

// Mock Data
const MOCK_COMPANY_CONFIG: CompanyConfig = {
  cnpj: "12.345.678/0001-90",
  companyName: "Bil's Cinema e Vídeo Ltda",
  regime: "simples",
  activity: "7723",
  address: "Rua das Câmeras, 123 - Belo Horizonte/MG",
  phone: "(31) 99990-8485",
  email: "financeiro@bilscinema.com.br",
  stateRegistration: "123456789",
  municipalRegistration: "987654321",
  autoDetected: false,
  lastUpdate: null,
};

const MOCK_DEPARTMENTS: Department[] = [
  {
    id: "1",
    name: "Operações",
    description: "Departamento responsável pelas operações principais",
    active: true
  },
  {
    id: "2",
    name: "Financeiro",
    description: "Departamento financeiro e contábil",
    active: true
  },
  {
    id: "3",
    name: "Marketing",
    description: "Departamento de marketing e vendas",
    active: true
  },
  {
    id: "4",
    name: "Técnico",
    description: "Departamento técnico e manutenção",
    active: true
  },
  {
    id: "5",
    name: "Administrativo",
    description: "Departamento administrativo",
    active: true
  }
];

// Mock data para Contas Bancárias e Pluggy
const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "1",
    name: "Conta Corrente Principal",
    bank: "Banco do Brasil",
    accountNumber: "12345-6",
    accountType: "checking",
    balance: 125680.50,
    currency: "BRL",
    isActive: true,
    pluggyConnectionId: "conn_001",
    lastSync: "2024-01-10T10:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T10:30:00Z"
  },
  {
    id: "2",
    name: "Conta Poupança",
    bank: "Caixa Econômica Federal",
    accountNumber: "54321-0",
    accountType: "savings",
    balance: 45000.00,
    currency: "BRL",
    isActive: true,
    pluggyConnectionId: "conn_002",
    lastSync: "2024-01-10T09:15:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T09:15:00Z"
  },
  {
    id: "3",
    name: "Conta Empresarial",
    bank: "Itaú",
    accountNumber: "98765-4",
    accountType: "business",
    balance: 95000.00,
    currency: "BRL",
    isActive: true,
    pluggyConnectionId: "conn_003",
    lastSync: "2024-01-10T11:45:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T11:45:00Z"
  }
];

const MOCK_PLUGGY_CREDENTIALS: PluggyCredentials = {
  id: "1",
  clientId: "client_123456789",
  clientSecret: "secret_987654321",
  sandbox: true,
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
};

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "1",
    name: "João Silva Santos",
    email: "joao.silva@bilscinema.com",
    phone: "(31) 99999-9999",
    cpf: "123.456.789-00",
    rg: "MG-12.345.678",
    position: "Técnico de Equipamentos Senior",
    department: "Operações",
    baseSalary: 4200.0,
    benefits: 800.0,
    discounts: 420.0,
    grossSalary: 5000.0,
    netSalary: 3780.0,
    hireDate: "2023-01-15",
    status: "active",
    address: "Rua das Flores, 123 - Centro - Belo Horizonte/MG",
    birthDate: "1985-03-20",
    workHours: 220,
    overtime: 20,
    bankAccount: "Banco do Brasil - 1234-5 / 12345-6",
    pix: "joao.silva@bilscinema.com",
    emergencyContact: "Maria Silva - (31) 98888-8888",
    hasContract: true,
  },
  {
    id: "2",
    name: "Maria Santos Oliveira",
    email: "maria.santos@bilscinema.com",
    phone: "(31) 98888-8888",
    cpf: "987.654.321-00",
    rg: "MG-87.654.321",
    position: "Assistente Financeiro",
    department: "Financeiro",
    baseSalary: 3200.0,
    benefits: 600.0,
    discounts: 320.0,
    grossSalary: 3800.0,
    netSalary: 2880.0,
    hireDate: "2023-03-10",
    status: "active",
    address: "Av. Contorno, 456 - Funcionários - Belo Horizonte/MG",
    birthDate: "1990-07-15",
    workHours: 220,
    overtime: 0,
    bankAccount: "Caixa Econômica - 0987 / 98765-4",
    pix: "(31) 98888-8888",
    emergencyContact: "João Oliveira - (31) 97777-7777",
    hasContract: true,
  },
];

// Função para gerar transações com datas dinâmicas (últimos 30 dias)
const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const today = new Date();
  
  // Templates de pedidos de locação (receitas)
  const orderTemplates = [
    { client: "Otavio Almeida de Souza", items: "Sony FX6 + KIT COOKE SP3", amount: 1200, project: "Documentário Amazônia" },
    { client: "Maria Santos", items: "Canon R5C + Monitor Atomos", amount: 850, project: "Filme Publicitário XYZ" },
    { client: "Pedro Costa", items: "Blackmagic URSA Mini Pro", amount: 450, project: "Videoclipe Rock Band" },
    { client: "Ana Oliveira", items: "RED Komodo 6K", amount: 980, project: "Curta Metragem" },
    { client: "Carlos Mendes", items: "Sony FX3 + Lentes Zeiss", amount: 1500, project: "Comercial TV" },
    { client: "João Silva", items: "Pacote Completo Casamento", amount: 2600, project: "Evento Social" },
    { client: "Fernanda Lima", items: "DJI Ronin + Canon R5C", amount: 1350, project: "Videoclipe Pop" },
    { client: "Roberto Alves", items: "Kit Iluminação LED", amount: 780, project: "Entrevista Corporativa" },
    { client: "Patricia Costa", items: "Drone DJI Inspire 3", amount: 1900, project: "Filmagem Aérea" },
    { client: "Lucas Pereira", items: "Kit Áudio Profissional", amount: 650, project: "Podcast Estúdio" },
  ];
  
  // Templates de despesas (algumas recorrentes, outras manuais)
  const expenseTemplates = [
    // Despesas recorrentes (mensais)
    { category: "Administrativo", subcategory: "Aluguel", description: "Aluguel do Estúdio", amount: 3200, paymentMethod: "Transferência", recurrent: true, frequency: "monthly" },
    { category: "Administrativo", subcategory: "Energia", description: "Conta de Luz CEMIG", amount: 890, paymentMethod: "Débito Automático", recurrent: true, frequency: "monthly" },
    { category: "Administrativo", subcategory: "Água", description: "Conta de Água COPASA", amount: 280, paymentMethod: "Débito Automático", recurrent: true, frequency: "monthly" },
    { category: "Administrativo", subcategory: "Internet", description: "Internet Fibra Óptica 500MB", amount: 350, paymentMethod: "Débito Automático", recurrent: true, frequency: "monthly" },
    { category: "Administrativo", subcategory: "Telefonia", description: "Telefone Fixo + Móvel Corporativo", amount: 420, paymentMethod: "Débito Automático", recurrent: true, frequency: "monthly" },
    { category: "Operacional", subcategory: "Seguros", description: "Seguro de Equipamentos", amount: 2100, paymentMethod: "Boleto", recurrent: true, frequency: "monthly" },
    { category: "Marketing", subcategory: "Digital", description: "Anúncios Google Ads", amount: 1500, paymentMethod: "Cartão Corporativo", recurrent: true, frequency: "monthly" },
    { category: "Administrativo", subcategory: "Contabilidade", description: "Serviços Contábeis", amount: 1200, paymentMethod: "Transferência", recurrent: true, frequency: "monthly" },
    
    // Despesas manuais/eventuais
    { category: "Manutenção", subcategory: "Equipamentos", description: "Revisão Canon R5C", amount: 850, paymentMethod: "Cartão Corporativo", recurrent: false },
    { category: "Operacional", subcategory: "Transporte", description: "Combustível e Pedágio", amount: 450, paymentMethod: "Dinheiro", recurrent: false },
    { category: "Operacional", subcategory: "Limpeza", description: "Limpeza de Sensores", amount: 380, paymentMethod: "PIX", recurrent: false },
    { category: "Marketing", subcategory: "Material", description: "Impressão de Flyers", amount: 320, paymentMethod: "PIX", recurrent: false },
    { category: "Operacional", subcategory: "Manutenção", description: "Calibração de Equipamentos", amount: 580, paymentMethod: "PIX", recurrent: false },
    { category: "Operacional", subcategory: "Materiais", description: "Cartões de Memória e Baterias", amount: 650, paymentMethod: "PIX", recurrent: false },
  ];
  
  let id = 1;
  
  // Separar despesas recorrentes das manuais
  const recurrentExpenses = expenseTemplates.filter(e => e.recurrent);
  const manualExpenses = expenseTemplates.filter(e => !e.recurrent);
  
  // Gerar transações para os últimos 30 dias
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfMonth = date.getDate();
    
    // 1-2 pedidos de locação por dia
    const numOrders = Math.floor(Math.random() * 2) + 1;
    
    for (let j = 0; j < numOrders; j++) {
      const order = orderTemplates[Math.floor(Math.random() * orderTemplates.length)];
      const isPaid = Math.random() > 0.15; // 85% pagas
      const paymentMethod = ['PIX', 'PIX', 'PIX', 'Transferência', 'Boleto', 'Cartão'][Math.floor(Math.random() * 6)];
      
      transactions.push({
        id: `${id++}`,
    type: "income",
    category: "Locação",
        subcategory: "Equipamentos",
        description: `Pedido #${String(5067 + id).padStart(6, '0')} - ${order.client} - ${order.items}`,
        amount: order.amount + (Math.random() * 100 - 50), // Variação de ±50
        date: dateStr,
        dueDate: dateStr,
        payDate: isPaid ? dateStr : undefined,
        status: isPaid ? "paid" : "pending",
        clientId: `CLI-${Math.floor(Math.random() * 20) + 1}`,
        invoiceNumber: `NF-${String(id).padStart(4, '0')}/2025`,
        paymentMethod: paymentMethod,
    installments: 1,
    currentInstallment: 1,
    totalInstallments: 1,
    recurrent: false,
        tags: ["locacao", "equipamentos"],
        notes: order.project,
    costCenter: "operacoes",
        project: order.project,
    attachments: [],
    approval: {
      required: false,
      approved: true,
    },
      });
    }
    
    // Adicionar despesas recorrentes (sempre no dia 5 do mês)
    if (dayOfMonth === 5) {
      recurrentExpenses.forEach(expense => {
        const isPaid = Math.random() > 0.1; // 90% pagas (despesas recorrentes são mais confiáveis)
        
        transactions.push({
          id: `${id++}`,
    type: "expense",
          category: expense.category,
          subcategory: expense.subcategory,
          description: `${expense.description}`,
          amount: expense.amount + (Math.random() * 20 - 10), // Variação pequena de ±10
          date: dateStr,
          dueDate: dateStr,
          payDate: isPaid ? dateStr : undefined,
          status: isPaid ? "paid" : "pending",
          supplierId: `FOR-${Math.floor(Math.random() * 5) + 1}`,
          invoiceNumber: `NFS-${String(id).padStart(6, '0')}`,
          paymentMethod: expense.paymentMethod,
    installments: 1,
    currentInstallment: 1,
    totalInstallments: 1,
          recurrent: true,
          recurrentPeriod: expense.frequency as "monthly" | "quarterly" | "annual",
          tags: [expense.category.toLowerCase(), "recorrente"],
          notes: "Despesa recorrente mensal",
          costCenter: "administrativo",
    attachments: [],
    approval: {
      required: true,
            approved: isPaid,
          },
        });
      });
    }
    
    // Adicionar despesas manuais aleatoriamente (0-2 por dia)
    const numManualExpenses = Math.floor(Math.random() * 3);
    
    for (let j = 0; j < numManualExpenses; j++) {
      const expense = manualExpenses[Math.floor(Math.random() * manualExpenses.length)];
      const isPaid = Math.random() > 0.3; // 70% pagas
      
      transactions.push({
        id: `${id++}`,
    type: "expense",
        category: expense.category,
        subcategory: expense.subcategory,
        description: `${expense.description}`,
        amount: expense.amount + (Math.random() * 100 - 50), // Variação de ±50
        date: dateStr,
        dueDate: dateStr,
        payDate: isPaid ? dateStr : undefined,
        status: isPaid ? "paid" : "pending",
        supplierId: `FOR-${Math.floor(Math.random() * 10) + 1}`,
        invoiceNumber: `NFS-${String(id).padStart(6, '0')}`,
        paymentMethod: expense.paymentMethod,
    installments: 1,
    currentInstallment: 1,
    totalInstallments: 1,
        recurrent: false,
        tags: [expense.category.toLowerCase()],
        notes: "",
        costCenter: expense.category === "Administrativo" ? "administrativo" : "operacoes",
    attachments: [],
    approval: {
      required: true,
          approved: isPaid,
        },
      });
    }
  }
  
  // Adicionar transação real da NF 4016 - Kilomba Producoes
  transactions.push({
    id: "NF-4016-KILOMBA",
    type: "income",
    description: "NF 4016 - Kilomba Producoes - Locação Equipamentos",
    amount: 1360,
    date: "2025-12-05",
    dueDate: "2025-12-12",
    status: "pending",
    category: "Locação",
    clientId: "Kilomba Producoes Ltda",
    invoiceNumber: "NF-4016/2025",
    installments: 1,
    currentInstallment: 1,
    tags: ["kilomba", "riofilme", "locacao"],
    notes: "Projeto: O que quero dizer quando falo de amor\nProdução: RIOFILME - Contrato nº 1053/2023\nEquipamentos: CANON 24/70, BMPCC 6K PRO, SACHTLER FSB8, SSD Samsung, PowerBank",
    costCenter: "operacoes",
    attachments: [],
    approval: {
      required: false,
      approved: true,
    },
  });
  
  return transactions.sort((a, b) => b.date.localeCompare(a.date));
};

const MOCK_TRANSACTIONS: Transaction[] = generateMockTransactions();

const MOCK_COST_CENTERS: CostCenter[] = [
  {
    id: "operacoes",
    name: "Operações",
    description: "Custos operacionais diretos",
    budget: 25000,
    spent: 12500,
    responsible: "João Silva",
    department: "Operações",
    departmentId: "1",
    active: true,
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Publicidade e marketing digital",
    budget: 8000,
    spent: 4200,
    responsible: "Ana Costa",
    department: "Marketing",
    departmentId: "3",
    active: true,
  },
  {
    id: "administrativo",
    name: "Administrativo",
    description: "Custos administrativos e financeiros",
    budget: 20000,
    spent: 18500,
    responsible: "Maria Santos",
    department: "Financeiro",
    departmentId: "2",
    active: true,
  },
  {
    id: "manutencao",
    name: "Manutenção",
    description: "Manutenção de equipamentos",
    budget: 10000,
    spent: 3400,
    responsible: "Carlos Tech",
    department: "Técnico",
    departmentId: "4",
    active: true,
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "payment_overdue",
    title: "Pagamento em Atraso",
    message: "Folha de pagamento de Janeiro venceu há 3 dias",
    priority: "urgent",
    date: "2025-01-17",
    read: false,
    actionRequired: true,
    relatedId: "3",
  },
  {
    id: "2",
    type: "receivable_due",
    title: "Cobrança Vencendo",
    message: "Fatura NF-008/2025 vence em 5 dias",
    priority: "medium",
    date: "2025-01-15",
    read: false,
    actionRequired: true,
    relatedId: "4",
  },
  {
    id: "3",
    type: "approval_required",
    title: "Aprovação Necessária",
    message: "Despesa de manutenção aguarda aprovação",
    priority: "high",
    date: "2025-01-14",
    read: false,
    actionRequired: true,
    relatedId: "2",
  },
  {
    id: "4",
    type: "tax_due",
    title: "DAS Vencendo",
    message: "DAS de Janeiro vence em 10 dias",
    priority: "medium",
    date: "2025-01-13",
    read: true,
    actionRequired: true,
  },
];

export const FinancialERP: React.FC = () => {
  const { user } = useAuth();
  const isMasterAdmin = user?.role === 'master_admin' || user?.email === 'master@bilscinema.com';
  
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>(() => {
    // Carregar dados salvos do localStorage
    const saved = localStorage.getItem('companyConfig');
    if (saved) {
      try {
        return { ...MOCK_COMPANY_CONFIG, ...JSON.parse(saved) };
      } catch {
        return MOCK_COMPANY_CONFIG;
      }
    }
    return MOCK_COMPANY_CONFIG;
  });
  const [editingCompanyConfig, setEditingCompanyConfig] = useState<CompanyConfig>(MOCK_COMPANY_CONFIG);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(MOCK_BANK_ACCOUNTS);
  const [pluggyCredentials, setPluggyCredentials] = useState<PluggyCredentials>(() => {
    // Carregar do localStorage se existir
    const saved = localStorage.getItem('pluggyCredentials');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return MOCK_PLUGGY_CREDENTIALS;
      }
    }
    return MOCK_PLUGGY_CREDENTIALS;
  });
  const [costCenters, setCostCenters] = useState<CostCenter[]>(MOCK_COST_CENTERS);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [costCenterCategories, setCostCenterCategories] = useState([
    { id: "1", name: "Operacional", description: "Custos operacionais diretos" },
    { id: "2", name: "Administrativo", description: "Custos administrativos e gerenciais" },
    { id: "3", name: "Marketing", description: "Custos de marketing e vendas" },
    { id: "4", name: "Tecnologia", description: "Custos de TI e tecnologia" },
    { id: "5", name: "Manutenção", description: "Custos de manutenção e infraestrutura" }
  ]);
  const [newCostCenter, setNewCostCenter] = useState<Partial<CostCenter>>({
    name: "",
    description: "",
    budget: 0,
    responsible: "",
    department: "",
    departmentId: "",
    active: true
  });

  const [showModal, setShowModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({
    name: "",
    manager: "",
    description: "",
    active: true
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("current_month");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para Contas Bancárias
  const [newBankAccount, setNewBankAccount] = useState<Partial<BankAccount>>({
    name: "",
    bank: "",
    accountNumber: "",
    accountType: "checking",
    balance: 0,
    currency: "BRL",
    isActive: true
  });
  const [editingBankAccount, setEditingBankAccount] = useState<BankAccount | null>(null);
  const [newPluggyCredentials, setNewPluggyCredentials] = useState<Partial<PluggyCredentials>>({
    clientId: "",
    clientSecret: "",
    sandbox: true,
    isActive: true
  });

  // Debug: Monitorar mudanças no showModal
  useEffect(() => {
    console.log("showModal mudou para:", showModal);
  }, [showModal]);

  // Form states
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: "income",
    category: "",
    subcategory: "",
    description: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    status: "pending",
    paymentMethod: "",
    installments: 1,
    currentInstallment: 1,
    totalInstallments: 1,
    recurrent: false,
    tags: [],
    notes: "",
    costCenter: "",
    attachments: [],
    approval: { required: false, approved: false },
  });

  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    position: "",
    department: "",
    baseSalary: 0,
    benefits: 0,
    discounts: 0,
    hireDate: new Date().toISOString().split("T")[0],
    status: "active",
    workHours: 220,
    overtime: 0,
    hasContract: false,
  });

  // Financial calculations
  const financialMetrics = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthTransactions = transactions.filter((t) =>
      t.date.startsWith(currentMonth)
    );

    const totalIncome = currentMonthTransactions
      .filter((t) => t.type === "income" && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentMonthTransactions
      .filter((t) => t.type === "expense" && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingReceivables = transactions
      .filter((t) => t.type === "income" && t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingPayables = transactions
      .filter((t) => t.type === "expense" && t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0);

    const overdueReceivables = transactions
      .filter((t) => t.type === "income" && t.status === "overdue")
      .reduce((sum, t) => sum + t.amount, 0);

    const overduePayables = transactions
      .filter((t) => t.type === "expense" && t.status === "overdue")
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    const totalBankBalance = bankAccounts
      .filter(acc => acc.active)
      .reduce((sum, acc) => sum + acc.balance, 0);

    const unreadNotifications = notifications.filter(n => !n.read).length;
    const urgentNotifications = notifications.filter(n => n.priority === "urgent" && !n.read).length;

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      pendingReceivables,
      pendingPayables,
      overdueReceivables,
      overduePayables,
      totalBankBalance,
      unreadNotifications,
      urgentNotifications,
    };
  }, [transactions, bankAccounts, notifications]);

  // Função para formatar CNPJ
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  // Função para salvar dados da empresa
  const saveCompanyConfig = () => {
    setCompanyConfig(editingCompanyConfig);
    setIsEditingCompany(false);
    // Salvar no localStorage para persistência
    localStorage.setItem('companyConfig', JSON.stringify(editingCompanyConfig));
    console.log("Dados da empresa salvos:", editingCompanyConfig);
    alert('✅ Dados da empresa salvos com sucesso!');
  };

  // Estado para loading da busca CNPJ
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);

  // Função para buscar dados do CNPJ na BrasilAPI (gratuita)
  const buscarDadosCNPJ = async (cnpj: string) => {
    // Remove caracteres não numéricos
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) {
      alert('CNPJ deve ter 14 dígitos');
      return;
    }

    setBuscandoCNPJ(true);
    
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      
      if (!response.ok) {
        throw new Error('CNPJ não encontrado');
      }
      
      const dados = await response.json();
      
      // Montar endereço completo
      const enderecoCompleto = [
        dados.descricao_tipo_de_logradouro,
        dados.logradouro,
        dados.numero,
        dados.complemento,
        dados.bairro,
        dados.municipio,
        dados.uf,
        dados.cep ? `CEP: ${dados.cep}` : ''
      ].filter(Boolean).join(', ');

      // Determinar regime tributário baseado no porte
      let regime: "simples" | "presumido" | "real" = "simples";
      if (dados.opcao_pelo_simples) {
        regime = "simples";
      } else if (dados.porte === "DEMAIS" || dados.porte === "GRANDE") {
        regime = "real";
      } else {
        regime = "presumido";
      }

      // Atualizar os dados
      setEditingCompanyConfig(prev => ({
        ...prev,
        companyName: dados.razao_social || prev.companyName,
        cnpj: formatCNPJ(cnpjLimpo),
        address: enderecoCompleto || prev.address,
        phone: dados.ddd_telefone_1 ? `(${dados.ddd_telefone_1.substring(0,2)}) ${dados.ddd_telefone_1.substring(2)}` : prev.phone,
        email: dados.email || prev.email,
        activity: dados.cnae_fiscal?.toString() || prev.activity,
        regime: regime,
      }));

      alert(`✅ Dados carregados!\n\nEmpresa: ${dados.razao_social}\nSituação: ${dados.descricao_situacao_cadastral}`);
      
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
      alert('❌ Erro ao buscar CNPJ. Verifique se o número está correto.');
    } finally {
      setBuscandoCNPJ(false);
    }
  };

  // Função para iniciar edição
  const startEditing = () => {
    setEditingCompanyConfig(companyConfig);
    setIsEditingCompany(true);
  };

  // Função para cancelar edição
  const cancelEditing = () => {
    setEditingCompanyConfig(companyConfig);
    setIsEditingCompany(false);
  };

  // Handlers
  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount) return;

    const transaction: Transaction = {
      id: `trans_${Date.now()}`,
      type: newTransaction.type || "income",
      category: newTransaction.category || "",
      subcategory: newTransaction.subcategory || "",
      description: newTransaction.description,
      amount: newTransaction.amount,
      date: newTransaction.date || new Date().toISOString().split("T")[0],
      dueDate: newTransaction.dueDate || new Date().toISOString().split("T")[0],
      status: newTransaction.status || "pending",
      invoiceNumber: `${newTransaction.type === "income" ? "NF" : "NFS"}-${String(transactions.length + 1).padStart(3, "0")}/2025`,
      paymentMethod: newTransaction.paymentMethod || "",
      installments: newTransaction.installments || 1,
      currentInstallment: 1,
      totalInstallments: newTransaction.totalInstallments || newTransaction.installments || 1,
      recurrent: newTransaction.recurrent || false,
      recurrentPeriod: newTransaction.recurrentPeriod,
      tags: newTransaction.tags || [],
      notes: newTransaction.notes || "",
      costCenter: newTransaction.costCenter || "",
      project: newTransaction.project,
      attachments: newTransaction.attachments || [],
      approval: newTransaction.approval || { required: false, approved: false },
    };

    setTransactions([...transactions, transaction]);
    setNewTransaction({
      type: "income",
      category: "",
      subcategory: "",
      description: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      status: "pending",
      paymentMethod: "",
      installments: 1,
      currentInstallment: 1,
      totalInstallments: 1,
      recurrent: false,
      tags: [],
      notes: "",
      costCenter: "",
      attachments: [],
      approval: { required: false, approved: false },
    });
    setShowModal(null);
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.baseSalary) return;

    const grossSalary = (newEmployee.baseSalary || 0) + (newEmployee.benefits || 0);
    const netSalary = grossSalary - (newEmployee.discounts || 0);

    const employee: Employee = {
      id: `emp_${Date.now()}`,
      name: newEmployee.name,
      email: newEmployee.email,
      phone: newEmployee.phone || "",
      cpf: newEmployee.cpf || "",
      rg: newEmployee.rg || "",
      position: newEmployee.position || "",
      department: newEmployee.department || "",
      baseSalary: newEmployee.baseSalary || 0,
      benefits: newEmployee.benefits || 0,
      discounts: newEmployee.discounts || 0,
      grossSalary,
      netSalary,
      hireDate: newEmployee.hireDate || new Date().toISOString().split("T")[0],
      status: newEmployee.status || "active",
      address: newEmployee.address || "",
      birthDate: newEmployee.birthDate || "",
      workHours: newEmployee.workHours || 220,
      overtime: newEmployee.overtime || 0,
      bankAccount: newEmployee.bankAccount || "",
      pix: newEmployee.pix || "",
      emergencyContact: newEmployee.emergencyContact || "",
      hasContract: newEmployee.hasContract || false,
    };

    setEmployees([...employees, employee]);
    setNewEmployee({
      name: "",
      email: "",
      phone: "",
      cpf: "",
      position: "",
      department: "",
      baseSalary: 0,
      benefits: 0,
      discounts: 0,
      hireDate: new Date().toISOString().split("T")[0],
      status: "active",
      workHours: 220,
      overtime: 0,
      hasContract: false,
    });
    setShowModal(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-400 bg-green-400/20";
      case "pending":
        return "text-yellow-400 bg-yellow-400/20";
      case "overdue":
        return "text-red-400 bg-red-400/20";
      case "cancelled":
        return "text-gray-400 bg-gray-400/20";
      case "partial":
        return "text-blue-400 bg-blue-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "overdue":
        return <AlertTriangle className="w-4 h-4" />;
      case "cancelled":
        return <X className="w-4 h-4" />;
      case "partial":
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-400 bg-red-400/20";
      case "high":
        return "text-orange-400 bg-orange-400/20";
      case "medium":
        return "text-yellow-400 bg-yellow-400/20";
      case "low":
        return "text-green-400 bg-green-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Função para salvar transação
  const handleSaveTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: newTransaction.type || "income",
      category: newTransaction.category || "",
      subcategory: newTransaction.subcategory || "",
      description: newTransaction.description || "",
      amount: newTransaction.amount || 0,
      date: newTransaction.date || new Date().toISOString().split("T")[0],
      dueDate: newTransaction.dueDate || new Date().toISOString().split("T")[0],
      status: newTransaction.status || "pending",
      paymentMethod: newTransaction.paymentMethod || "",
      installments: newTransaction.installments || 1,
      currentInstallment: newTransaction.currentInstallment || 1,
      totalInstallments: newTransaction.totalInstallments || 1,
      recurrent: newTransaction.recurrent || false,
      tags: newTransaction.tags || [],
      notes: newTransaction.notes || "",
      costCenter: newTransaction.costCenter || "",
      attachments: newTransaction.attachments || [],
      approval: newTransaction.approval || { required: false, approved: false },
      invoiceNumber: `INV-${Date.now()}`,
    };

    setTransactions([...transactions, transaction]);
    setNewTransaction({
      type: "income",
      category: "",
      subcategory: "",
      description: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      status: "pending",
      paymentMethod: "",
      installments: 1,
      currentInstallment: 1,
      totalInstallments: 1,
      recurrent: false,
      tags: [],
      notes: "",
      costCenter: "",
      attachments: [],
      approval: { required: false, approved: false },
    });
    setShowModal(null);
    alert("Transação salva com sucesso!");
  };

  // Função para salvar funcionário
  const handleSaveEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.baseSalary) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const employee: Employee = {
      id: Date.now().toString(),
      name: newEmployee.name || "",
      email: newEmployee.email || "",
      phone: newEmployee.phone || "",
      cpf: newEmployee.cpf || "",
      rg: newEmployee.rg || "",
      position: newEmployee.position || "",
      department: newEmployee.department || "",
      baseSalary: newEmployee.baseSalary || 0,
      benefits: newEmployee.benefits || 0,
      discounts: newEmployee.discounts || 0,
      grossSalary: (newEmployee.baseSalary || 0) + (newEmployee.benefits || 0),
      netSalary: (newEmployee.baseSalary || 0) + (newEmployee.benefits || 0) - (newEmployee.discounts || 0),
      hireDate: newEmployee.hireDate || new Date().toISOString().split("T")[0],
      status: newEmployee.status || "active",
      address: newEmployee.address || "",
      birthDate: newEmployee.birthDate || "",
      workHours: newEmployee.workHours || 220,
      overtime: newEmployee.overtime || 0,
      bankAccount: newEmployee.bankAccount || "",
      pix: newEmployee.pix || "",
      emergencyContact: newEmployee.emergencyContact || "",
      hasContract: newEmployee.hasContract || false,
      isOnline: false,
    };

    setEmployees([...employees, employee]);
    setNewEmployee({
      name: "",
      email: "",
      phone: "",
      cpf: "",
      rg: "",
      position: "",
      department: "",
      baseSalary: 0,
      benefits: 0,
      discounts: 0,
      hireDate: new Date().toISOString().split("T")[0],
      status: "active",
      workHours: 220,
      overtime: 0,
      hasContract: false,
    });
    setShowModal(null);
    alert("Funcionário adicionado com sucesso!");
  };

  // Função para salvar centro de custo
  const handleSaveCostCenter = () => {
    if (!newCostCenter.name) {
      alert("Por favor, preencha o nome do centro de custo");
      return;
    }

    if (editingCostCenter) {
      // Editando centro de custo existente
      const updatedCostCenter: CostCenter = {
        ...editingCostCenter,
        name: newCostCenter.name || "",
        description: newCostCenter.description || "",
        budget: newCostCenter.budget || 0,
        responsible: newCostCenter.responsible || "",
        department: newCostCenter.department || "",
        departmentId: newCostCenter.departmentId || "",
        active: newCostCenter.active !== false,
        updatedAt: new Date().toISOString().split("T")[0]
      };

      setCostCenters(costCenters.map(cc => cc.id === editingCostCenter.id ? updatedCostCenter : cc));
      setEditingCostCenter(null);
      alert("Centro de custo atualizado com sucesso!");
    } else {
      // Criando novo centro de custo
      const costCenter: CostCenter = {
        id: Date.now().toString(),
        name: newCostCenter.name || "",
        description: newCostCenter.description || "",
        budget: newCostCenter.budget || 0,
        spent: 0,
        responsible: newCostCenter.responsible || "",
        department: newCostCenter.department || "",
        departmentId: newCostCenter.departmentId || "",
        active: newCostCenter.active !== false,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0]
      };

      setCostCenters([...costCenters, costCenter]);
      alert("Centro de custo criado com sucesso!");
    }

    setNewCostCenter({
      name: "",
      description: "",
      budget: 0,
      responsible: "",
      department: "",
      departmentId: "",
      active: true
    });
    setShowModal(null);
  };

  // Função para editar centro de custo
  const handleEditCostCenter = (costCenter: CostCenter) => {
    setEditingCostCenter(costCenter);
    setNewCostCenter({
      name: costCenter.name,
      description: costCenter.description,
      budget: costCenter.budget,
      responsible: costCenter.responsible,
      department: costCenter.department,
      departmentId: costCenter.departmentId || "",
      active: costCenter.active
    });
    setShowModal("cost-center");
  };

  // Função para excluir centro de custo
  const handleDeleteCostCenter = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este centro de custo?")) {
      setCostCenters(costCenters.filter(cc => cc.id !== id));
      alert("Centro de custo excluído com sucesso!");
    }
  };

  // Funções para gerenciar departamentos
  const handleSaveDepartment = () => {
    if (!newDepartment.name) {
      alert("Nome do departamento é obrigatório!");
      return;
    }

    if (editingDepartment) {
      // Editando departamento existente
      const updatedDepartment: Department = {
        ...editingDepartment,
        name: newDepartment.name || "",
        description: newDepartment.description || "",
        active: newDepartment.active !== false
      };

      setDepartments(departments.map(d => d.id === editingDepartment.id ? updatedDepartment : d));
      setEditingDepartment(null);
      alert("Departamento atualizado com sucesso!");
    } else {
      // Criando novo departamento
      const department: Department = {
        id: Date.now().toString(),
        name: newDepartment.name || "",
        description: newDepartment.description || "",
        active: newDepartment.active !== false
      };

      setDepartments([...departments, department]);
      alert("Departamento criado com sucesso!");
    }

    setNewDepartment({
      name: "",
      description: "",
      active: true
    });
    setShowModal(null);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setNewDepartment({
      name: department.name,
      description: department.description,
      active: department.active
    });
    setShowModal("departments");
  };

  const handleDeleteDepartment = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este departamento?")) {
      setDepartments(departments.filter(d => d.id !== id));
      alert("Departamento excluído com sucesso!");
    }
  };

  const updateTransactionStatus = (id: string, status: string) => {
    setTransactions(transactions.map(t =>
      t.id === id ? { ...t, status: status as Transaction['status'], payDate: status === 'paid' ? new Date().toISOString().split('T')[0] : t.payDate } : t
    ));
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-cinema-dark-lighter">
      {/* Header Moderno */}
      <div className="p-4 space-y-4 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800">
        {/* Título e Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Financeiro</h2>
              <p className="text-zinc-500 text-xs">Gestão completa</p>
            </div>
          </div>
          {/* Status e Ações */}
          <div className="flex items-center gap-2">
            {financialMetrics.urgentNotifications > 0 && (
              <button
                onClick={() => setActiveTab("notifications")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-xs font-medium">{financialMetrics.urgentNotifications}</span>
              </button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hidden md:flex"
            >
              <Download className="w-4 h-4 mr-1" />
              Backup
            </Button>
          </div>
        </div>

        {/* Info Rápida */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1.5 bg-zinc-800/80 rounded-lg text-zinc-400 border border-zinc-700/50">
            {companyConfig.cnpj}
          </span>
          <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 font-medium">
            {companyConfig.regime.toUpperCase()}
          </span>
        </div>

        {/* Navigation Tabs - Grid 3 colunas no Mobile */}
        <div className="grid grid-cols-3 md:flex md:flex-wrap gap-2">
          {[
            { id: "dashboard", name: "Início", icon: BarChart3 },
            { id: "receivables", name: "Receber", icon: TrendingUp },
            { id: "payables", name: "Pagar", icon: TrendingDown },
            { id: "cashflow", name: "Fluxo", icon: DollarSign },
            { id: "bank-accounts", name: "Bancos", icon: CreditCard },
            { id: "employees", name: "Equipe", icon: Users },
            { id: "timesheet", name: "Ponto", icon: Clock },
            { id: "payroll", name: "Folha", icon: Receipt },
            { id: "company", name: "Empresa", icon: Building2 },
            ...(isMasterAdmin ? [{ id: "notifications", name: "Alertas", icon: Bell }] : []),
            { id: "reports", name: "Relatórios", icon: FileText },
            { id: "taxes", name: "Impostos", icon: Calculator },
            { id: "cost-centers", name: "Custos", icon: Building },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 
                p-3 md:px-4 md:py-2 rounded-xl transition-all duration-200
                ${activeTab === tab.id
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold shadow-lg shadow-amber-500/20"
                  : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-700/50"
                }
              `}
            >
              <tab.icon className={`w-5 h-5 md:w-4 md:h-4 ${activeTab === tab.id ? 'text-black' : ''}`} />
              <span className="text-[10px] md:text-sm text-center leading-tight">{tab.name}</span>
              {tab.id === "notifications" && financialMetrics.unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {financialMetrics.unreadNotifications}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-zinc-950 pb-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            {/* Main KPIs - Grid 2x2 no mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">+12.5%</span>
                </div>
                <p className="text-zinc-400 text-xs mb-1">Faturamento</p>
                <p className="text-lg font-bold text-white">
                  R$ {(financialMetrics.totalIncome / 1000).toFixed(0)}k
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-500/20 to-rose-600/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  <span className="text-[10px] text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full">-5.2%</span>
                </div>
                <p className="text-zinc-400 text-xs mb-1">Despesas</p>
                <p className="text-lg font-bold text-white">
                  R$ {(financialMetrics.totalExpenses / 1000).toFixed(0)}k
                </p>
              </div>

              <div className={`bg-gradient-to-br ${financialMetrics.netProfit >= 0 ? 'from-cyan-500/20 to-blue-600/10 border-cyan-500/20' : 'from-orange-500/20 to-red-600/10 border-orange-500/20'} border rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <CircleDollarSign className={`w-5 h-5 ${financialMetrics.netProfit >= 0 ? 'text-cyan-400' : 'text-orange-400'}`} />
                  <span className={`text-[10px] ${financialMetrics.netProfit >= 0 ? 'text-cyan-400 bg-cyan-500/20' : 'text-orange-400 bg-orange-500/20'} px-2 py-0.5 rounded-full`}>
                    {financialMetrics.profitMargin.toFixed(0)}%
                  </span>
                </div>
                <p className="text-zinc-400 text-xs mb-1">Lucro</p>
                <p className="text-lg font-bold text-white">
                  R$ {(financialMetrics.netProfit / 1000).toFixed(0)}k
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-indigo-600/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Wallet className="w-5 h-5 text-purple-400" />
                  <span className="text-[10px] text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                    {bankAccounts.filter(acc => acc.active).length} contas
                  </span>
                </div>
                <p className="text-zinc-400 text-xs mb-1">Saldo</p>
                <p className="text-lg font-bold text-white">
                  R$ {(financialMetrics.totalBankBalance / 1000).toFixed(0)}k
                </p>
              </div>
            </div>

            {/* Quick Actions - Grid 2x2 no mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => setShowModal("transaction")}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 rounded-xl text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <PlusCircle className="w-6 h-6" />
                <span className="text-xs font-medium">Nova Receita</span>
              </button>

              <button
                onClick={() => {
                  setNewTransaction({ ...newTransaction, type: "expense" });
                  setShowModal("transaction");
                }}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 rounded-xl text-white shadow-lg shadow-red-500/20 transition-all active:scale-95"
              >
                <MinusCircle className="w-6 h-6" />
                <span className="text-xs font-medium">Nova Despesa</span>
              </button>

              <button
                onClick={() => setShowModal("employee")}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 rounded-xl text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                <UserCheck className="w-6 h-6" />
                <span className="text-xs font-medium">Funcionário</span>
              </button>

              <button
                onClick={() => setActiveTab("reports")}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 rounded-xl text-white shadow-lg shadow-purple-500/20 transition-all active:scale-95"
              >
                <FileBarChart className="w-6 h-6" />
                <span className="text-xs font-medium">Relatórios</span>
              </button>
            </div>

            {/* Financial Overview - Mais compacto no mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Contas a Receber */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-medium text-sm">A Receber</h3>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs">Em Aberto</span>
                    <span className="text-amber-400 font-medium text-sm">
                      R$ {(financialMetrics.pendingReceivables / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs">Em Atraso</span>
                    <span className="text-red-400 font-medium text-sm">
                      R$ {(financialMetrics.overdueReceivables / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("receivables")}
                  className="w-full text-center py-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors"
                >
                  Ver Detalhes →
                </button>
              </div>

              {/* Contas a Pagar */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                  </div>
                  <h3 className="text-white font-medium text-sm">A Pagar</h3>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs">A Vencer</span>
                    <span className="text-amber-400 font-medium text-sm">
                      R$ {(financialMetrics.pendingPayables / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs">Vencidas</span>
                    <span className="text-red-400 font-medium text-sm">
                      R$ {(financialMetrics.overduePayables / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("payables")}
                  className="w-full text-center py-2 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  Ver Detalhes →
                </button>
              </div>
            </div>

            {/* Bank Accounts */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-white font-medium text-sm">Contas Bancárias</h3>
                </div>
                <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Atualizar
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {bankAccounts.filter(acc => acc.active).slice(0, 4).map((account) => (
                  <div
                    key={account.id}
                    className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                        account.type === "checking" ? "bg-blue-500/20" :
                        account.type === "savings" ? "bg-green-500/20" :
                        account.type === "investment" ? "bg-purple-500/20" :
                        "bg-orange-500/20"
                      }`}>
                        <Building className={`w-3 h-3 ${
                          account.type === "checking" ? "text-blue-400" :
                          account.type === "savings" ? "text-green-400" :
                          account.type === "investment" ? "text-purple-400" :
                          "text-orange-400"
                        }`} />
                      </div>
                      <span className="text-white text-xs font-medium truncate">{account.bank}</span>
                    </div>
                    <p className="text-amber-400 font-bold text-sm">
                      R$ {(account.balance / 1000).toFixed(1)}k
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab("bank-accounts")}
                className="w-full mt-4 text-center py-2 text-xs font-medium text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors"
              >
                Ver Todas →
              </button>
            </div>

            {/* Cost Centers Performance */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Building className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-white font-medium text-sm">Centros de Custo</h3>
              </div>
              <div className="space-y-3">
                {costCenters.filter(center => center.active).slice(0, 3).map((center) => {
                  const percentage = (center.spent / center.budget) * 100;
                  return (
                    <div key={center.id} className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-xs font-medium truncate">{center.name}</span>
                        <span className={`text-xs font-bold ${
                          percentage > 95 ? "text-red-400" :
                          percentage > 80 ? "text-amber-400" :
                          "text-emerald-400"
                        }`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            percentage > 95 ? "bg-red-400" :
                            percentage > 80 ? "bg-amber-400" :
                            "bg-emerald-400"
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-zinc-500 text-[10px]">
                          R$ {(center.spent / 1000).toFixed(1)}k
                        </span>
                        <span className="text-zinc-500 text-[10px]">
                          R$ {(center.budget / 1000).toFixed(1)}k
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setActiveTab("cost-centers")}
                className="w-full mt-4 text-center py-2 text-xs font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-colors"
              >
                Ver Todos →
              </button>
            </div>
          </div>
        )}

        {/* Receivables Tab */}
        {activeTab === "receivables" && (
          <ReceivablesTab
            activeTab={activeTab}
            transactions={transactions}
            employees={employees}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            onSearch={setSearchTerm}
            onFilterChange={setFilterStatus}
            onStatusUpdate={updateTransactionStatus}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        )}

        {/* Payables Tab */}
        {activeTab === "payables" && (
          <PayablesTab
            activeTab={activeTab}
            transactions={transactions}
            employees={employees}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            onSearch={setSearchTerm}
            onFilterChange={setFilterStatus}
            onStatusUpdate={updateTransactionStatus}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        )}

        {/* Cash Flow Tab */}
        {activeTab === "cashflow" && (
          <CashFlowTab
            activeTab={activeTab}
            transactions={transactions}
            employees={employees}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            onSearch={setSearchTerm}
            onFilterChange={setFilterStatus}
            onStatusUpdate={updateTransactionStatus}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        )}

        {/* Bank Accounts Tab */}
        {activeTab === "bank-accounts" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Contas Bancárias</h2>
                <p className="text-gray-400">Gerencie suas contas bancárias e integração com Pluggy</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setShowModal("pluggy-credentials")}
                  variant="outline"
                  className="bg-cinema-dark border-cinema-gray-light text-white hover:bg-cinema-dark-lighter"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Pluggy
                </Button>
                {pluggyCredentials.isActive && (
                  <Button
                    onClick={async () => {
                      try {
                        // Mostrar loading
                        alert('⏳ Gerando token de conexão...');
                        
                        // Obter o token do localStorage
                        const authToken = localStorage.getItem('token');
                        
                        // Chamar API para gerar Connect Token
                        const response = await fetch('/api/pluggy/connect-token', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                          },
                          body: JSON.stringify({
                            clientId: pluggyCredentials.clientId,
                            clientSecret: pluggyCredentials.clientSecret,
                            sandbox: pluggyCredentials.sandbox,
                          }),
                        });
                        
                        const data = await response.json();
                        
                        if (!response.ok || !data.connectToken) {
                          alert(`❌ Erro: ${data.error || 'Falha ao gerar token'}`);
                          return;
                        }
                        
                        // Abrir Pluggy Connect com o token
                        const connectUrl = `https://connect.pluggy.ai/?connect_token=${data.connectToken}`;
                        
                        const width = 500;
                        const height = 700;
                        const left = (window.innerWidth - width) / 2;
                        const top = (window.innerHeight - height) / 2;
                        
                        const popup = window.open(
                          connectUrl,
                          'PluggyConnect',
                          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
                        );
                        
                        if (!popup) {
                          alert('❌ Popup bloqueado! Permita popups para este site.');
                        }
                      } catch (error) {
                        console.error('Erro ao conectar Pluggy:', error);
                        alert('❌ Erro ao conectar com Pluggy. Tente novamente.');
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    🏦 Conectar Banco via Pluggy
                  </Button>
                )}
                {pluggyCredentials.isActive && (
                  <Button
                    onClick={async () => {
                      try {
                        const authToken = localStorage.getItem('token');
                        
                        alert('🔄 Sincronizando contas do Pluggy...');
                        
                        const response = await fetch('/api/pluggy/items', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                          },
                          body: JSON.stringify({
                            clientId: pluggyCredentials.clientId,
                            clientSecret: pluggyCredentials.clientSecret,
                          }),
                        });
                        
                        const data = await response.json();
                        
                        if (!response.ok) {
                          alert(`❌ Erro: ${data.error}`);
                          return;
                        }
                        
                        if (data.accounts && data.accounts.length > 0) {
                          // Adicionar contas encontradas
                          const novasContas = data.accounts.map((acc: any, index: number) => ({
                            id: `pluggy-${acc.id}`,
                            name: acc.name || `Conta ${acc.bankName}`,
                            bank: acc.bankName,
                            accountNumber: acc.number || acc.id.substring(0, 10),
                            accountType: acc.type === 'CHECKING' ? 'checking' : acc.type === 'SAVINGS' ? 'savings' : 'checking',
                            balance: acc.balance || 0,
                            active: true,
                            pluggyConnectionId: acc.itemId,
                            pluggyAccountId: acc.id,
                          }));
                          
                          setBankAccounts(prev => {
                            // Remover duplicatas
                            const existingIds = prev.map(p => p.pluggyConnectionId).filter(Boolean);
                            const novasUnicas = novasContas.filter((n: any) => !existingIds.includes(n.pluggyConnectionId));
                            return [...prev, ...novasUnicas];
                          });
                          
                          alert(`✅ ${data.accounts.length} conta(s) sincronizada(s)!\n\n${data.accounts.map((a: any) => `• ${a.bankName}: R$ ${(a.balance || 0).toFixed(2)}`).join('\n')}`);
                        } else {
                          alert(`ℹ️ Nenhuma conta encontrada.\n\nItems conectados: ${data.items?.length || 0}\n\nSe você acabou de conectar, aguarde alguns minutos e tente novamente.`);
                        }
                      } catch (error) {
                        console.error('Erro ao sincronizar:', error);
                        alert('❌ Erro ao sincronizar contas');
                      }
                    }}
                    variant="outline"
                    className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    🔄 Sincronizar Contas Pluggy
                  </Button>
                )}
                <Button
                  onClick={() => setShowModal("add-bank-account")}
                  className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Conta Manual
                </Button>
              </div>
            </div>

            {/* Pluggy Status */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Status da Integração Pluggy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${pluggyCredentials.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-white">
                      {pluggyCredentials.isActive ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    <span className="text-sm">Ambiente: </span>
                    <span className="font-medium">{pluggyCredentials.sandbox ? 'Sandbox' : 'Produção'}</span>
                  </div>
                  <div className="text-gray-400">
                    <span className="text-sm">Client ID: </span>
                    <span className="font-medium">{pluggyCredentials.clientId}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Accounts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bankAccounts.map((account) => (
                <Card key={account.id} className="bg-cinema-dark border-cinema-gray-light">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-lg">{account.name}</CardTitle>
                        <p className="text-gray-400 text-sm">{account.bank}</p>
                        <p className="text-gray-500 text-xs">Conta: {account.accountNumber}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingBankAccount(account);
                            setShowModal("edit-bank-account");
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir esta conta?')) {
                              setBankAccounts(bankAccounts.filter(acc => acc.id !== account.id));
                            }
                          }}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Saldo:</span>
                        <span className="text-white font-bold">
                          R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tipo:</span>
                        <span className="text-white">
                          {account.accountType === 'checking' ? 'Corrente' : 
                           account.accountType === 'savings' ? 'Poupança' : 'Empresarial'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`font-medium ${account.isActive ? 'text-green-400' : 'text-red-400'}`}>
                          {account.isActive ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      {account.pluggyConnectionId && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Pluggy:</span>
                          <span className="text-green-400 text-sm">Conectado</span>
                        </div>
                      )}
                      {account.lastSync && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Última Sync:</span>
                          <span className="text-gray-400 text-sm">
                            {new Date(account.lastSync).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {bankAccounts.length === 0 && (
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-8 text-center">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">Nenhuma conta bancária cadastrada</h3>
                  <p className="text-gray-400 mb-4">Adicione suas contas bancárias para começar a usar a integração</p>
                  <Button
                    onClick={() => setShowModal("add-bank-account")}
                    className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeira Conta
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === "employees" && (
          <EmployeesTab employees={employees} />
        )}

        {/* Ponto Automático Tab */}
        {activeTab === "timesheet" && (
          <AutoTimesheetSystem />
        )}

        {/* Payroll Tab */}
        {activeTab === "payroll" && (
          <AutomatedPayroll isAdmin={true} />
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <ReportsTab />
        )}

        {/* Taxes Tab */}
        {activeTab === "taxes" && (
          <TaxesTab />
        )}

        {/* Company Settings Tab */}
        {activeTab === "company" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Dados da Empresa</h3>
              <div className="flex space-x-2">
                {!isEditingCompany ? (
                  <Button
                    onClick={startEditing}
                    className="bg-cinema-yellow text-cinema-dark hover:bg-yellow-500"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={cancelEditing}
                      variant="outline"
                      className="border-cinema-gray-light text-white hover:bg-cinema-gray-light"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={saveCompanyConfig}
                      className="bg-cinema-yellow text-cinema-dark hover:bg-yellow-500"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Company Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-cinema-yellow" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Razão Social</Label>
                    <Input
                      value={isEditingCompany ? editingCompanyConfig.companyName : companyConfig.companyName}
                      onChange={(e) => isEditingCompany && setEditingCompanyConfig({
                        ...editingCompanyConfig,
                        companyName: e.target.value
                      })}
                      disabled={!isEditingCompany}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white disabled:opacity-50"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">CNPJ</Label>
                    <div className="flex gap-2">
                      <Input
                        value={isEditingCompany ? editingCompanyConfig.cnpj : companyConfig.cnpj}
                        onChange={(e) => isEditingCompany && setEditingCompanyConfig({
                          ...editingCompanyConfig,
                          cnpj: formatCNPJ(e.target.value)
                        })}
                        disabled={!isEditingCompany}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white disabled:opacity-50 flex-1"
                        placeholder="00.000.000/0000-00"
                      />
                      {isEditingCompany && (
                        <Button
                          type="button"
                          onClick={() => buscarDadosCNPJ(editingCompanyConfig.cnpj)}
                          disabled={buscandoCNPJ}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                        >
                          {buscandoCNPJ ? (
                            <Clock className="w-4 h-4 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    {isEditingCompany && (
                      <p className="text-xs text-gray-400 mt-1">
                        Digite o CNPJ e clique na lupa para buscar dados automaticamente
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-white">Regime Tributário</Label>
                    <Select
                      value={isEditingCompany ? editingCompanyConfig.regime : companyConfig.regime}
                      onValueChange={(value: "simples" | "presumido" | "real") => 
                        isEditingCompany && setEditingCompanyConfig({
                          ...editingCompanyConfig,
                          regime: value
                        })
                      }
                      disabled={!isEditingCompany}
                    >
                      <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white disabled:opacity-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simples">Simples Nacional</SelectItem>
                        <SelectItem value="presumido">Lucro Presumido</SelectItem>
                        <SelectItem value="real">Lucro Real</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Código da Atividade</Label>
                    <Input
                      value={isEditingCompany ? editingCompanyConfig.activity : companyConfig.activity}
                      onChange={(e) => isEditingCompany && setEditingCompanyConfig({
                        ...editingCompanyConfig,
                        activity: e.target.value
                      })}
                      disabled={!isEditingCompany}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white disabled:opacity-50"
                      placeholder="Ex: 7723"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-cinema-yellow" />
                    Endereço e Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Endereço</Label>
                    <Textarea
                      value={isEditingCompany ? editingCompanyConfig.address : companyConfig.address}
                      onChange={(e) => isEditingCompany && setEditingCompanyConfig({
                        ...editingCompanyConfig,
                        address: e.target.value
                      })}
                      disabled={!isEditingCompany}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white disabled:opacity-50"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Telefone</Label>
                      <Input
                        value={isEditingCompany ? editingCompanyConfig.phone : companyConfig.phone}
                        onChange={(e) => isEditingCompany && setEditingCompanyConfig({
                          ...editingCompanyConfig,
                          phone: formatPhone(e.target.value)
                        })}
                        disabled={!isEditingCompany}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white disabled:opacity-50"
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Email</Label>
                      <Input
                        value={isEditingCompany ? editingCompanyConfig.email : companyConfig.email}
                        onChange={(e) => isEditingCompany && setEditingCompanyConfig({
                          ...editingCompanyConfig,
                          email: e.target.value
                        })}
                        disabled={!isEditingCompany}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white disabled:opacity-50"
                        placeholder="contato@empresa.com.br"
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Inscrição Estadual</Label>
                      <Input
                        value={isEditingCompany ? editingCompanyConfig.stateRegistration : companyConfig.stateRegistration}
                        onChange={(e) => isEditingCompany && setEditingCompanyConfig({
                          ...editingCompanyConfig,
                          stateRegistration: e.target.value
                        })}
                        disabled={!isEditingCompany}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white disabled:opacity-50"
                        placeholder="000000000"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Inscrição Municipal</Label>
                      <Input
                        value={isEditingCompany ? editingCompanyConfig.municipalRegistration : companyConfig.municipalRegistration}
                        onChange={(e) => isEditingCompany && setEditingCompanyConfig({
                          ...editingCompanyConfig,
                          municipalRegistration: e.target.value
                        })}
                        disabled={!isEditingCompany}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white disabled:opacity-50"
                        placeholder="000000000"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Central de Notificações</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="text-cinema-yellow border-cinema-yellow"
                  onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                >
                  <CopyCheck className="w-4 h-4 mr-2" />
                  Marcar Todas como Lidas
                </Button>
              </div>
            </div>

            {/* Priority Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['urgent', 'high', 'medium', 'low'].map(priority => {
                const count = notifications.filter(n => n.priority === priority && !n.read).length;
                return (
                  <Card key={priority} className="bg-cinema-dark border-cinema-gray-light">
                    <CardContent className="p-4 text-center">
                      <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${getPriorityColor(priority)}`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-bold text-white">{count}</p>
                      <p className="text-gray-400 text-sm capitalize">{priority}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Notifications List */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardContent className="p-0">
                <div className="space-y-0">
                  {notifications
                    .sort((a, b) => {
                      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
                    })
                    .map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-cinema-gray-light hover:bg-cinema-dark-lighter cursor-pointer ${
                        !notification.read ? 'bg-cinema-yellow/5 border-l-4 border-l-cinema-yellow' : ''
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                            {notification.type === "payment_due" && <Clock className="w-4 h-4" />}
                            {notification.type === "payment_overdue" && <AlertTriangle className="w-4 h-4" />}
                            {notification.type === "receivable_due" && <DollarSign className="w-4 h-4" />}
                            {notification.type === "tax_due" && <Calculator className="w-4 h-4" />}
                            {notification.type === "payroll_due" && <Users className="w-4 h-4" />}
                            {notification.type === "approval_required" && <Shield className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className={`font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-cinema-yellow rounded-full"></div>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
                            <p className="text-gray-500 text-xs mt-2">{notification.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          {notification.actionRequired && (
                            <Button size="sm" className="bg-cinema-yellow text-cinema-dark">
                              Ação
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transaction Modal */}
        {showModal === "transaction" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-cinema-dark border-cinema-gray-light w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">
                    {newTransaction.type === "income" ? "Nova Receita" : "Nova Despesa"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowModal(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Tipo</Label>
                    <Select value={newTransaction.type} onValueChange={(value) => setNewTransaction({...newTransaction, type: value as "income" | "expense"})}>
                      <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Categoria</Label>
                    <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}>
                      <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {newTransaction.type === "income" ? (
                          <>
                            <SelectItem value="Locação">Locação</SelectItem>
                            <SelectItem value="Vendas">Vendas</SelectItem>
                            <SelectItem value="Serviços">Serviços</SelectItem>
                            <SelectItem value="Outros">Outros</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="Pessoal">Pessoal</SelectItem>
                            <SelectItem value="Manutenção">Manutenção</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Administrativo">Administrativo</SelectItem>
                            <SelectItem value="Impostos">Impostos</SelectItem>
                            <SelectItem value="Outros">Outros</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-white">Descrição</Label>
                    <Input
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="Descrição detalhada da transação"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Valor</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Centro de Custo</Label>
                    <Select value={newTransaction.costCenter} onValueChange={(value) => setNewTransaction({...newTransaction, costCenter: value})}>
                      <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                        <SelectValue placeholder="Selecione o centro de custo" />
                      </SelectTrigger>
                      <SelectContent>
                        {costCenters.map(center => (
                          <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Data</Label>
                    <Input
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Vencimento</Label>
                    <Input
                      type="date"
                      value={newTransaction.dueDate}
                      onChange={(e) => setNewTransaction({...newTransaction, dueDate: e.target.value})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Forma de Pagamento</Label>
                    <Select value={newTransaction.paymentMethod} onValueChange={(value) => setNewTransaction({...newTransaction, paymentMethod: value})}>
                      <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                        <SelectValue placeholder="Selecione a forma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="Transferência Bancária">Transferência Bancária</SelectItem>
                        <SelectItem value="Boleto Bancário">Boleto Bancário</SelectItem>
                        <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                        <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Parcelas</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newTransaction.installments}
                      onChange={(e) => setNewTransaction({...newTransaction, installments: parseInt(e.target.value) || 1, totalInstallments: parseInt(e.target.value) || 1})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-white">Observações</Label>
                    <Textarea
                      value={newTransaction.notes}
                      onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(null)}
                    className="text-gray-400 border-gray-600"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveTransaction}
                    className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Employee Modal */}
        {showModal === "employee" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-cinema-dark border-cinema-gray-light w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Novo Funcionário</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowModal(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-cinema-yellow font-semibold mb-3">Dados Pessoais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Nome Completo *</Label>
                      <Input
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        placeholder="Nome completo do funcionário"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Email *</Label>
                      <Input
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        placeholder="email@bilscinema.com"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Telefone</Label>
                      <Input
                        value={newEmployee.phone}
                        onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        placeholder="(31) 99999-9999"
                      />
                    </div>

                    <div>
                      <Label className="text-white">CPF</Label>
                      <Input
                        value={newEmployee.cpf}
                        onChange={(e) => setNewEmployee({...newEmployee, cpf: e.target.value})}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Data de Nascimento</Label>
                      <Input
                        type="date"
                        value={newEmployee.birthDate}
                        onChange={(e) => setNewEmployee({...newEmployee, birthDate: e.target.value})}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Data de Admissão *</Label>
                      <Input
                        type="date"
                        value={newEmployee.hireDate}
                        onChange={(e) => setNewEmployee({...newEmployee, hireDate: e.target.value})}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h4 className="text-cinema-yellow font-semibold mb-3">Dados Profissionais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Cargo *</Label>
                      <Input
                        value={newEmployee.position}
                        onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        placeholder="Ex: Técnico de Equipamentos"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Departamento</Label>
                      <Select value={newEmployee.department} onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}>
                        <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Operações">Operações</SelectItem>
                          <SelectItem value="Financeiro">Financeiro</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Técnico">Técnico</SelectItem>
                          <SelectItem value="Administrativo">Administrativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white">Salário Base *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newEmployee.baseSalary}
                        onChange={(e) => setNewEmployee({...newEmployee, baseSalary: parseFloat(e.target.value) || 0})}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        placeholder="0,00"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Benefícios</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newEmployee.benefits}
                        onChange={(e) => setNewEmployee({...newEmployee, benefits: parseFloat(e.target.value) || 0})}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        placeholder="0,00"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Horas de Trabalho/Mês</Label>
                      <Input
                        type="number"
                        value={newEmployee.workHours}
                        onChange={(e) => setNewEmployee({...newEmployee, workHours: parseInt(e.target.value) || 220})}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        placeholder="220"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Status</Label>
                      <Select value={newEmployee.status} onValueChange={(value) => setNewEmployee({...newEmployee, status: value as Employee['status']})}>
                        <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                          <SelectItem value="vacation">Férias</SelectItem>
                          <SelectItem value="dismissed">Demitido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h4 className="text-cinema-yellow font-semibold mb-3">Informações Adicionais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Dados Bancários</Label>
                      <Input
                        value={newEmployee.bankAccount}
                        onChange={(e) => setNewEmployee({...newEmployee, bankAccount: e.target.value})}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        placeholder="Banco - Agência / Conta"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Chave PIX</Label>
                      <Input
                        value={newEmployee.pix}
                        onChange={(e) => setNewEmployee({...newEmployee, pix: e.target.value})}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        placeholder="CPF, email ou telefone"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-white">Endereço</Label>
                      <Input
                        value={newEmployee.address}
                        onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        placeholder="Endereço completo"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-white">Contato de Emergência</Label>
                      <Input
                        value={newEmployee.emergencyContact}
                        onChange={(e) => setNewEmployee({...newEmployee, emergencyContact: e.target.value})}
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        placeholder="Nome - Telefone"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="hasContract"
                          checked={newEmployee.hasContract}
                          onChange={(e) => setNewEmployee({...newEmployee, hasContract: e.target.checked})}
                          className="w-4 h-4 text-cinema-yellow bg-cinema-dark border-cinema-gray-light rounded focus:ring-cinema-yellow"
                        />
                        <Label htmlFor="hasContract" className="text-white">
                          Contrato de trabalho assinado
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(null)}
                    className="text-gray-400 border-gray-600"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveEmployee}
                    className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Cadastrar Funcionário
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cost Centers Tab */}
        {activeTab === "cost-centers" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Centros de Custo</h3>
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    console.log("Clicando em Departamentos");
                    console.log("showModal antes:", showModal);
                    setShowModal("departments");
                    console.log("showModal depois:", "departments");
                  }}
                  variant="outline"
                  className="border-cinema-gray-light text-white hover:bg-cinema-gray"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Departamentos
                </Button>
                <Button
                  onClick={() => setShowModal("cost-center")}
                  className="bg-cinema-yellow text-cinema-dark"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Centro de Custo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {costCenters.map((center) => (
                <Card key={center.id} className="bg-cinema-dark border-cinema-gray-light">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-white">{center.name}</h4>
                        <p className="text-sm text-gray-400">Código: {center.code}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        center.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {center.active ? 'Ativo' : 'Inativo'}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{center.description}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Orçamento:</span>
                        <span className="text-white">R$ {center.budget.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Responsável:</span>
                        <span className="text-white">{center.responsible}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Departamento:</span>
                        <span className="text-white">{center.department}</span>
                      </div>
                      {center.category && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Categoria:</span>
                          <span className="text-white">{center.category}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-cinema-yellow border-cinema-yellow"
                        onClick={() => handleEditCostCenter(center)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-400 border-red-400"
                        onClick={() => handleDeleteCostCenter(center.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Cost Center Modal */}
        {showModal === "cost-center" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">
                    {editingCostCenter ? "Editar Centro de Custo" : "Novo Centro de Custo"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowModal(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Nome *</Label>
                    <Input
                      value={newCostCenter.name}
                      onChange={(e) => setNewCostCenter({...newCostCenter, name: e.target.value})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="Nome do centro de custo"
                    />
                  </div>


                  <div className="md:col-span-2">
                    <Label className="text-white">Descrição</Label>
                    <Textarea
                      value={newCostCenter.description}
                      onChange={(e) => setNewCostCenter({...newCostCenter, description: e.target.value})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="Descrição do centro de custo"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Orçamento</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newCostCenter.budget}
                      onChange={(e) => setNewCostCenter({...newCostCenter, budget: parseFloat(e.target.value) || 0})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Responsável</Label>
                    <Input
                      value={newCostCenter.responsible}
                      onChange={(e) => setNewCostCenter({...newCostCenter, responsible: e.target.value})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Departamento</Label>
                    <Select 
                      value={newCostCenter.departmentId} 
                      onValueChange={(value) => {
                        const selectedDept = departments.find(d => d.id === value);
                        setNewCostCenter({
                          ...newCostCenter, 
                          departmentId: value,
                          department: selectedDept?.name || ""
                        });
                      }}
                    >
                      <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent className="bg-cinema-dark border-cinema-gray-light">
                        {departments.map((dept) => (
                          <SelectItem 
                            key={dept.id} 
                            value={dept.id}
                            className="text-white hover:bg-cinema-gray"
                          >
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowModal(null);
                      setEditingCostCenter(null);
                      setNewCostCenter({
                        name: "",
                        description: "",
                        budget: 0,
                        responsible: "",
                        department: "",
                        active: true,
                        category: ""
                      });
                    }}
                    className="text-gray-400 border-gray-600"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveCostCenter}
                    className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingCostCenter ? "Atualizar Centro de Custo" : "Salvar Centro de Custo"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Departments Modal */}
        {showModal === "departments" && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            style={{ zIndex: 9999 }}
          >
            <Card className="w-full max-w-4xl bg-cinema-dark border-cinema-gray-light max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">
                    {editingDepartment ? "Editar Departamento" : "Gerenciar Departamentos"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log("Fechando modal");
                      setShowModal(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formulário para Novo/Editar Departamento */}
                {editingDepartment ? (
                  <div className="space-y-4 border-b border-cinema-gray-light pb-6">
                    <h3 className="text-lg font-semibold text-cinema-yellow">
                      Editar Departamento
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Nome</Label>
                        <Input
                          value={editingDepartment.name}
                          onChange={(e) => setEditingDepartment({...editingDepartment, name: e.target.value})}
                          className="bg-cinema-gray border-cinema-gray-light text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Responsável</Label>
                        <Input
                          value={editingDepartment.manager}
                          onChange={(e) => setEditingDepartment({...editingDepartment, manager: e.target.value})}
                          className="bg-cinema-gray border-cinema-gray-light text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-white">Descrição</Label>
                      <Input
                        value={editingDepartment.description || ''}
                        onChange={(e) => setEditingDepartment({...editingDepartment, description: e.target.value})}
                        className="bg-cinema-gray border-cinema-gray-light text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setDepartments(departments.map(d => d.id === editingDepartment.id ? editingDepartment : d));
                          setEditingDepartment(null);
                        }}
                        className="bg-cinema-yellow text-cinema-dark"
                      >
                        Salvar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingDepartment(null)}
                        className="border-gray-500 text-gray-400"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 border-b border-cinema-gray-light pb-6">
                    <h3 className="text-lg font-semibold text-cinema-yellow">
                      Novo Departamento
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Nome *</Label>
                        <Input
                          placeholder="Ex: Marketing"
                          className="bg-cinema-gray border-cinema-gray-light text-white"
                          value={newDepartment.name || ''}
                          onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label className="text-white">Responsável</Label>
                        <Input
                          placeholder="Nome do responsável"
                          className="bg-cinema-gray border-cinema-gray-light text-white"
                          value={newDepartment.manager || ''}
                          onChange={(e) => setNewDepartment({...newDepartment, manager: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-white">Descrição</Label>
                      <Input
                        placeholder="Descrição do departamento"
                        className="bg-cinema-gray border-cinema-gray-light text-white"
                        value={newDepartment.description || ''}
                        onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                      />
                    </div>
                    <Button
                      onClick={() => {
                        if (newDepartment.name && newDepartment.name.trim()) {
                          const dept: Department = {
                            id: `dept_${Date.now()}`,
                            name: newDepartment.name.trim(),
                            manager: newDepartment.manager || '',
                            employeeCount: 0,
                            budget: 0,
                            description: newDepartment.description || '',
                            active: true
                          };
                          setDepartments(prev => [...prev, dept]);
                          setNewDepartment({ name: '', manager: '', description: '' });
                          alert(`Departamento "${dept.name}" criado com sucesso!`);
                        } else {
                          alert('Por favor, preencha o nome do departamento.');
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Departamento
                    </Button>
                  </div>
                )}

                {/* Lista de Departamentos */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Departamentos Cadastrados</h3>
                  {departments.length === 0 ? (
                    <p className="text-gray-400">Nenhum departamento cadastrado.</p>
                  ) : (
                    departments.map((dept) => (
                      <Card key={dept.id} className="bg-cinema-gray border-cinema-gray-light">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-white font-semibold">{dept.name}</h4>
                              <p className="text-gray-400 text-sm">Responsável: {dept.manager || 'Não definido'}</p>
                              <p className="text-gray-400 text-sm">{dept.employeeCount} funcionários</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingDepartment(dept)}
                                className="border-cinema-yellow text-cinema-yellow"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDepartments(departments.filter(d => d.id !== dept.id))}
                                className="border-red-500 text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bank Account Modal */}
        {showModal === "add-bank-account" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-cinema-dark border-cinema-gray-light w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Nova Conta Bancária</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowModal(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Nome da Conta *</Label>
                    <Input
                      value={newBankAccount.name}
                      onChange={(e) => setNewBankAccount({...newBankAccount, name: e.target.value})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="Ex: Conta Corrente Principal"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Banco *</Label>
                    <Input
                      value={newBankAccount.bank}
                      onChange={(e) => setNewBankAccount({...newBankAccount, bank: e.target.value})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="Ex: Banco do Brasil"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Número da Conta *</Label>
                    <Input
                      value={newBankAccount.accountNumber}
                      onChange={(e) => setNewBankAccount({...newBankAccount, accountNumber: e.target.value})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="Ex: 12345-6"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Tipo da Conta *</Label>
                    <Select
                      value={newBankAccount.accountType}
                      onValueChange={(value) => setNewBankAccount({...newBankAccount, accountType: value as any})}
                    >
                      <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Conta Corrente</SelectItem>
                        <SelectItem value="savings">Conta Poupança</SelectItem>
                        <SelectItem value="business">Conta Empresarial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Saldo Inicial</Label>
                    <Input
                      type="number"
                      value={newBankAccount.balance}
                      onChange={(e) => setNewBankAccount({...newBankAccount, balance: parseFloat(e.target.value) || 0})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Moeda</Label>
                    <Select
                      value={newBankAccount.currency}
                      onValueChange={(value) => setNewBankAccount({...newBankAccount, currency: value})}
                    >
                      <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real (BRL)</SelectItem>
                        <SelectItem value="USD">Dólar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newBankAccount.isActive}
                    onChange={(e) => setNewBankAccount({...newBankAccount, isActive: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="isActive" className="text-white">Conta ativa</Label>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(null)}
                    className="border-cinema-gray-light text-white hover:bg-cinema-dark-lighter"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      if (!newBankAccount.name || !newBankAccount.bank || !newBankAccount.accountNumber) {
                        alert("Por favor, preencha todos os campos obrigatórios");
                        return;
                      }
                      const account: BankAccount = {
                        id: Date.now().toString(),
                        name: newBankAccount.name || "",
                        bank: newBankAccount.bank || "",
                        accountNumber: newBankAccount.accountNumber || "",
                        accountType: newBankAccount.accountType || "checking",
                        balance: newBankAccount.balance || 0,
                        currency: newBankAccount.currency || "BRL",
                        isActive: newBankAccount.isActive !== false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      };
                      setBankAccounts([...bankAccounts, account]);
                      setNewBankAccount({
                        name: "",
                        bank: "",
                        accountNumber: "",
                        accountType: "checking",
                        balance: 0,
                        currency: "BRL",
                        isActive: true
                      });
                      setShowModal(null);
                      alert("Conta bancária adicionada com sucesso!");
                    }}
                    className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  >
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Bank Account Modal */}
        {showModal === "edit-bank-account" && editingBankAccount && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-cinema-dark border-cinema-gray-light w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Editar Conta Bancária</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingBankAccount(null);
                      setShowModal(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Nome da Conta *</Label>
                    <Input
                      value={editingBankAccount.name}
                      onChange={(e) => setEditingBankAccount({...editingBankAccount, name: e.target.value})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Banco *</Label>
                    <Input
                      value={editingBankAccount.bank}
                      onChange={(e) => setEditingBankAccount({...editingBankAccount, bank: e.target.value})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Número da Conta *</Label>
                    <Input
                      value={editingBankAccount.accountNumber}
                      onChange={(e) => setEditingBankAccount({...editingBankAccount, accountNumber: e.target.value})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Tipo da Conta *</Label>
                    <Select
                      value={editingBankAccount.accountType}
                      onValueChange={(value) => setEditingBankAccount({...editingBankAccount, accountType: value as any})}
                    >
                      <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Conta Corrente</SelectItem>
                        <SelectItem value="savings">Conta Poupança</SelectItem>
                        <SelectItem value="business">Conta Empresarial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Saldo</Label>
                    <Input
                      type="number"
                      value={editingBankAccount.balance}
                      onChange={(e) => setEditingBankAccount({...editingBankAccount, balance: parseFloat(e.target.value) || 0})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Moeda</Label>
                    <Select
                      value={editingBankAccount.currency}
                      onValueChange={(value) => setEditingBankAccount({...editingBankAccount, currency: value})}
                    >
                      <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real (BRL)</SelectItem>
                        <SelectItem value="USD">Dólar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActiveEdit"
                    checked={editingBankAccount.isActive}
                    onChange={(e) => setEditingBankAccount({...editingBankAccount, isActive: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="isActiveEdit" className="text-white">Conta ativa</Label>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingBankAccount(null);
                      setShowModal(null);
                    }}
                    className="border-cinema-gray-light text-white hover:bg-cinema-dark-lighter"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      if (!editingBankAccount.name || !editingBankAccount.bank || !editingBankAccount.accountNumber) {
                        alert("Por favor, preencha todos os campos obrigatórios");
                        return;
                      }
                      setBankAccounts(bankAccounts.map(acc => 
                        acc.id === editingBankAccount.id 
                          ? {...editingBankAccount, updatedAt: new Date().toISOString()}
                          : acc
                      ));
                      setEditingBankAccount(null);
                      setShowModal(null);
                      alert("Conta bancária atualizada com sucesso!");
                    }}
                    className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  >
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pluggy Credentials Modal */}
        {showModal === "pluggy-credentials" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-cinema-dark border-cinema-gray-light w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Configuração Pluggy</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowModal(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">ℹ️ Informações Importantes</h4>
                  <ul className="text-blue-300 text-sm space-y-1">
                    <li>• Cada locadora deve ter suas próprias credenciais Pluggy</li>
                    <li>• As credenciais são cobradas diretamente pela Pluggy</li>
                    <li>• Use o ambiente Sandbox para testes</li>
                    <li>• Mantenha suas credenciais seguras</li>
                  </ul>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-white">Client ID *</Label>
                    <Input
                      value={newPluggyCredentials.clientId}
                      onChange={(e) => setNewPluggyCredentials({...newPluggyCredentials, clientId: e.target.value})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="Seu Client ID da Pluggy"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Client Secret *</Label>
                    <Input
                      type="password"
                      value={newPluggyCredentials.clientSecret}
                      onChange={(e) => setNewPluggyCredentials({...newPluggyCredentials, clientSecret: e.target.value})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="Seu Client Secret da Pluggy"
                    />
                  </div>
                </div>
                {/* Tutorial / Ajuda */}
                <div className="bg-cinema-dark-lighter/50 border border-cinema-gray-light/40 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    <div className="text-gray-300 text-sm leading-relaxed">
                      Precisa de ajuda para obter o <span className="font-medium text-white">Client ID</span> e o <span className="font-medium text-white">Client Secret</span>? Siga o passo a passo ou acesse seu painel da Pluggy.
                    </div>
                    <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                      <a href="https://pluggy.ai/docs/getting-started/overview" target="_blank" rel="noreferrer">
                        <Button variant="outline" className="border-cinema-gray-light text-white hover:bg-cinema-dark">
                          <FileText className="w-4 h-4 mr-2" /> Ver tutorial
                        </Button>
                      </a>
                      <a href="https://github.com/pluggyai/meu-pluggy" target="_blank" rel="noreferrer">
                        <Button variant="outline" className="border-cinema-gray-light text-white hover:bg-cinema-dark">
                          <ExternalLink className="w-4 h-4 mr-2" /> Meu Pluggy (GitHub)
                        </Button>
                      </a>
                      <a href="https://dashboard.pluggy.ai/" target="_blank" rel="noreferrer">
                        <Button className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark whitespace-nowrap">
                          <Settings className="w-4 h-4 mr-2" /> Dashboard Pluggy
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sandbox"
                    checked={newPluggyCredentials.sandbox}
                    onChange={(e) => setNewPluggyCredentials({...newPluggyCredentials, sandbox: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="sandbox" className="text-white">Usar ambiente Sandbox (recomendado para testes)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActivePluggy"
                    checked={newPluggyCredentials.isActive}
                    onChange={(e) => setNewPluggyCredentials({...newPluggyCredentials, isActive: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="isActivePluggy" className="text-white">Ativar integração</Label>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(null)}
                    className="border-cinema-gray-light text-white hover:bg-cinema-dark-lighter"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      if (!newPluggyCredentials.clientId || !newPluggyCredentials.clientSecret) {
                        alert("Por favor, preencha Client ID e Client Secret");
                        return;
                      }
                      const newCreds = {
                        id: "1",
                        clientId: newPluggyCredentials.clientId,
                        clientSecret: newPluggyCredentials.clientSecret,
                        sandbox: newPluggyCredentials.sandbox !== false,
                        isActive: newPluggyCredentials.isActive !== false,
                      };
                      // Salvar no localStorage
                      localStorage.setItem('pluggyCredentials', JSON.stringify(newCreds));
                      setPluggyCredentials({
                        id: "1",
                        clientId: newPluggyCredentials.clientId,
                        clientSecret: newPluggyCredentials.clientSecret,
                        sandbox: newPluggyCredentials.sandbox !== false,
                        isActive: newPluggyCredentials.isActive !== false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      });
                      setNewPluggyCredentials({
                        clientId: "",
                        clientSecret: "",
                        sandbox: true,
                        isActive: true
                      });
                      setShowModal(null);
                      alert("Credenciais Pluggy configuradas com sucesso!");
                    }}
                    className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  >
                    Salvar Configuração
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialERP;


