import React, { useState, useMemo, useEffect } from "react";
import { useOffline } from "@/hooks/use-offline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationManager } from "@/components/NotificationManager";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  Receipt,
  FileText,
  Calculator,
  PieChart,
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
  Target,
  Percent,
  Archive,
  Wallet,
  HandCoins,
  CircleDollarSign,
  FileBarChart,
  PlusCircle,
  MinusCircle,
  Printer,
  FileSpreadsheet,
  Building,
  CopyCheck,
  Bell,
  Send,
  MessageSquare,
} from "lucide-react";

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
  status: "active" | "inactive" | "vacation";
  address: string;
  birthDate: string;
  workHours: number;
  overtime: number;
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
  status: "pending" | "paid" | "overdue" | "cancelled";
  clientId?: string;
  supplierId?: string;
  invoiceNumber: string;
  paymentMethod: string;
  installments: number;
  currentInstallment: number;
  recurrent: boolean;
  tags: string[];
  notes: string;
}

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  agency: string;
  account: string;
  balance: number;
  type: "checking" | "savings" | "investment";
}

interface CostCenter {
  id: string;
  name: string;
  description: string;
  budget: number;
  spent: number;
  responsible: string;
}

interface TaxConfig {
  id: string;
  name: string;
  rate: number;
  type: "federal" | "state" | "municipal";
  baseCalculation: string;
  dueDay: number;
}

// Mock Data
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
    address: "Rua das Flores, 123 - Bairro Centro - Belo Horizonte/MG",
    birthDate: "1985-03-20",
    workHours: 220,
    overtime: 20,
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
    address: "Av. Contorno, 456 - Bairro Funcionários - Belo Horizonte/MG",
    birthDate: "1990-07-15",
    workHours: 220,
    overtime: 0,
  },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "income",
    category: "Locação",
    subcategory: "Câmeras",
    description: "Locação Sony FX6 - Produção Comercial Coca-Cola",
    amount: 2400.0,
    date: "2025-01-15",
    dueDate: "2025-01-15",
    status: "paid",
    clientId: "CLI-001",
    invoiceNumber: "NF-001/2025",
    paymentMethod: "PIX",
    installments: 1,
    currentInstallment: 1,
    recurrent: false,
    tags: ["cameras", "commercial"],
    notes: "Cliente fidelizado - desconto 5%",
  },
  {
    id: "2",
    type: "expense",
    category: "Manutenção",
    subcategory: "Equipamentos",
    description: "Revisão completa Canon R5C - Autorizada Canon",
    amount: 850.0,
    date: "2025-01-12",
    dueDate: "2025-01-12",
    status: "paid",
    supplierId: "FOR-001",
    invoiceNumber: "NFS-001234",
    paymentMethod: "Cartão Corporativo",
    installments: 1,
    currentInstallment: 1,
    recurrent: false,
    tags: ["maintenance", "canon"],
    notes: "Garantia até dezembro/2025",
  },
  {
    id: "3",
    type: "expense",
    category: "Pessoal",
    subcategory: "Salários",
    description: "Folha de Pagamento - Janeiro 2025",
    amount: 18500.0,
    date: "2025-01-30",
    dueDate: "2025-01-30",
    status: "pending",
    invoiceNumber: "FP-01/2025",
    paymentMethod: "Transferência Bancária",
    installments: 1,
    currentInstallment: 1,
    recurrent: true,
    tags: ["payroll", "monthly"],
    notes: "Inclui 13º proporcional e férias",
  },
  {
    id: "4",
    type: "income",
    category: "Locação",
    subcategory: "Pacotes",
    description: "Pacote Completo Casamento - Maria & João",
    amount: 5200.0,
    date: "2025-01-20",
    dueDate: "2025-02-15",
    status: "pending",
    clientId: "CLI-008",
    invoiceNumber: "NF-008/2025",
    paymentMethod: "Boleto Bancário",
    installments: 2,
    currentInstallment: 1,
    recurrent: false,
    tags: ["wedding", "package"],
    notes: "2x R$ 2.600,00 - Parcela 1/2",
  },
];

const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "1",
    name: "Conta Corrente Principal",
    bank: "Banco do Brasil",
    agency: "1234-5",
    account: "12345-6",
    balance: 45680.5,
    type: "checking",
  },
  {
    id: "2",
    name: "Poupança Reserva",
    bank: "Caixa Econômica",
    agency: "0987",
    account: "98765-4",
    balance: 125000.0,
    type: "savings",
  },
  {
    id: "3",
    name: "Investimentos CDB",
    bank: "Bradesco",
    agency: "5678",
    account: "11111-1",
    balance: 80000.0,
    type: "investment",
  },
];

const COST_CENTERS = [
  {
    id: "1",
    name: "Operações",
    description: "Custos operacionais",
    budget: 15000,
    spent: 8500,
    responsible: "João Silva",
  },
  {
    id: "2",
    name: "Marketing",
    description: "Publicidade e marketing",
    budget: 5000,
    spent: 3200,
    responsible: "Ana Costa",
  },
  {
    id: "3",
    name: "Administrativo",
    description: "Custos administrativos",
    budget: 12000,
    spent: 9800,
    responsible: "Maria Santos",
  },
];

const TAX_CONFIG: TaxConfig[] = [
  {
    id: "1",
    name: "IRPJ",
    rate: 15,
    type: "federal",
    baseCalculation: "Lucro Real",
    dueDay: 31,
  },
  {
    id: "2",
    name: "CSLL",
    rate: 9,
    type: "federal",
    baseCalculation: "Lucro Real",
    dueDay: 31,
  },
  {
    id: "3",
    name: "PIS",
    rate: 1.65,
    type: "federal",
    baseCalculation: "Faturamento",
    dueDay: 25,
  },
  {
    id: "4",
    name: "COFINS",
    rate: 7.6,
    type: "federal",
    baseCalculation: "Faturamento",
    dueDay: 25,
  },
  {
    id: "5",
    name: "ISS",
    rate: 5,
    type: "municipal",
    baseCalculation: "Serviços",
    dueDay: 10,
  },
];

export const FinanceManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const {
    isOnline,
    isSyncing,
    pendingActions,
    offlineData,
    addEmployee: addOfflineEmployee,
    updateEmployee: updateOfflineEmployee,
    deleteEmployee: deleteOfflineEmployee,
    calculatePayroll,
    syncData,
  } = useOffline();

  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [transactions, setTransactions] =
    useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [bankAccounts] = useState<BankAccount[]>(MOCK_BANK_ACCOUNTS);
  const [costCenters] = useState(COST_CENTERS);

  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("current_month");
  const [searchTerm, setSearchTerm] = useState("");

  // Tax system state
  const [taxSystem, setTaxSystem] = useState({
    cnpj: "12.345.678/0001-90",
    companyName: "Bil's Cinema e Vídeo Ltda",
    regime: "simples", // simples, presumido, real
    activity: "7723", // CNAE
    autoDetected: false,
    lastUpdate: null,
  });

  const [isDetectingTaxes, setIsDetectingTaxes] = useState(false);

  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
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
    hireDate: "",
    status: "active",
    address: "",
    birthDate: "",
    workHours: 220,
    overtime: 0,
  });

  // Sync offline data with local state
  useEffect(() => {
    if (offlineData.employees.length > 0) {
      setEmployees(offlineData.employees);
    }
  }, [offlineData.employees]);

  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: "income",
    category: "",
    subcategory: "",
    description: "",
    amount: 0,
    date: "",
    dueDate: "",
    status: "pending",
    paymentMethod: "",
    installments: 1,
    currentInstallment: 1,
    recurrent: false,
    tags: [],
    notes: "",
  });

  // Cálculos Financeiros
  const financialMetrics = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthTransactions = transactions.filter((t) =>
      t.date.startsWith(currentMonth),
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

    const totalBankBalance = bankAccounts.reduce(
      (sum, acc) => sum + acc.balance,
      0,
    );

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
    };
  }, [transactions, bankAccounts]);

  // Tax calculation based on regime
  const calculateTaxes = (income: number, regime: string, cnae: string) => {
    switch (regime) {
      case "simples":
        // Simples Nacional - Anexo III (Serviços)
        const annualRevenue = income * 12;
        const simplesRate =
          annualRevenue <= 180000
            ? 0.06
            : annualRevenue <= 360000
              ? 0.112
              : annualRevenue <= 720000
                ? 0.135
                : annualRevenue <= 1800000
                  ? 0.16
                  : 0.21;
        return {
          total: income * simplesRate,
          irpj: income * simplesRate * 0.0533,
          csll: income * simplesRate * 0.0319,
          pis: 0, // Incluído no DAS
          cofins: 0, // Incluído no DAS
          iss: income * simplesRate * 0.1467,
          inss: income * simplesRate * 0.2817,
          icms: 0,
          rate: simplesRate,
        };

      case "presumido":
        // Lucro Presumido
        const presumedProfit = income * 0.32; // 32% para serviços
        return {
          total: presumedProfit * 0.24 + income * 0.0365 + income * 0.05,
          irpj: presumedProfit * 0.15,
          csll: presumedProfit * 0.09,
          pis: income * 0.0065,
          cofins: income * 0.03,
          iss: income * 0.05,
          inss: 0,
          icms: 0,
          rate:
            (presumedProfit * 0.24 + income * 0.0365 + income * 0.05) / income,
        };

      case "real":
        // Lucro Real
        const realProfit = financialMetrics.netProfit;
        return {
          total: realProfit * 0.24 + income * 0.0925 + income * 0.05,
          irpj: realProfit * 0.15,
          csll: realProfit * 0.09,
          pis: income * 0.0165,
          cofins: income * 0.076,
          iss: income * 0.05,
          inss: 0,
          icms: 0,
          rate: (realProfit * 0.24 + income * 0.0925 + income * 0.05) / income,
        };

      default:
        return {
          total: 0,
          irpj: 0,
          csll: 0,
          pis: 0,
          cofins: 0,
          iss: 0,
          inss: 0,
          icms: 0,
          rate: 0,
        };
    }
  };

  // Auto detect tax regime based on CNPJ
  const autoDetectTaxRegime = async (cnpj: string) => {
    setIsDetectingTaxes(true);

    try {
      // Simulate API call to ReceitaWS or similar service
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock detection based on revenue
      const annualRevenue = financialMetrics.totalIncome * 12;
      let detectedRegime = "simples";

      if (annualRevenue > 4800000) {
        detectedRegime = "real"; // Obrigatório para faturamento > 4,8mi
      } else if (annualRevenue > 1800000) {
        detectedRegime = "presumido"; // Recomendado entre 1,8mi e 4,8mi
      }

      setTaxSystem((prev) => ({
        ...prev,
        regime: detectedRegime,
        autoDetected: true,
        lastUpdate: new Date().toISOString(),
      }));

      alert(
        `Regime tributário detectado automaticamente: ${
          detectedRegime === "simples"
            ? "Simples Nacional"
            : detectedRegime === "presumido"
              ? "Lucro Presumido"
              : "Lucro Real"
        }`,
      );
    } catch (error) {
      alert(
        "Erro ao detectar regime tributário. Verifique o CNPJ e tente novamente.",
      );
    } finally {
      setIsDetectingTaxes(false);
    }
  };

  const currentTaxes = calculateTaxes(
    financialMetrics.totalIncome,
    taxSystem.regime,
    taxSystem.activity,
  );

  // Handlers
  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.baseSalary)
      return;

    // Use offline system to add employee with automatic payroll calculation
    const employee = await addOfflineEmployee({
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
      hireDate: newEmployee.hireDate || new Date().toISOString().split("T")[0],
      status: newEmployee.status || "active",
      address: newEmployee.address || "",
      birthDate: newEmployee.birthDate || "",
      workHours: newEmployee.workHours || 220,
      overtime: newEmployee.overtime || 0,
    });
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
      hireDate: "",
      status: "active",
      address: "",
      birthDate: "",
      workHours: 220,
      overtime: 0,
    });
    setShowEmployeeModal(false);
  };

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
      currentInstallment: newTransaction.currentInstallment || 1,
      recurrent: newTransaction.recurrent || false,
      tags: newTransaction.tags || [],
      notes: newTransaction.notes || "",
    };

    setTransactions([...transactions, transaction]);
    setNewTransaction({
      type: "income",
      category: "",
      subcategory: "",
      description: "",
      amount: 0,
      date: "",
      dueDate: "",
      status: "pending",
      paymentMethod: "",
      installments: 1,
      currentInstallment: 1,
      recurrent: false,
      tags: [],
      notes: "",
    });
    setShowTransactionModal(false);
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
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || transaction.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-full bg-cinema-dark-lighter">
      {/* Header */}
      <div className="p-4 border-b border-cinema-gray-light">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">
              Sistema Financeiro ERP
            </h2>
            <p className="text-gray-400 text-sm">
              Gestão financeira completa integrada ao sistema
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="text-cinema-yellow border-cinema-yellow"
            >
              <Download className="w-4 h-4 mr-2" />
              Backup
            </Button>
            <Button
              variant="outline"
              className="text-cinema-yellow border-cinema-yellow"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "dashboard", name: "Dashboard", icon: BarChart3 },
            { id: "receivables", name: "Contas a Receber", icon: TrendingUp },
            { id: "payables", name: "Contas a Pagar", icon: TrendingDown },
            { id: "cashflow", name: "Fluxo de Caixa", icon: DollarSign },
            { id: "employees", name: "Funcionários", icon: Users },
            { id: "payroll", name: "Folha Pagamento", icon: Receipt },
            { id: "notifications", name: "Notificações", icon: Bell },
            { id: "reports", name: "Relatórios", icon: FileText },
            { id: "taxes", name: "Impostos", icon: Calculator },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={
                activeTab === tab.id
                  ? "bg-cinema-yellow text-cinema-dark"
                  : "text-gray-300 border-cinema-gray-light hover:border-cinema-yellow hover:text-cinema-yellow"
              }
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        className="p-4 overflow-y-auto"
        style={{ height: "calc(100% - 140px)" }}
      >
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Financial KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Faturamento Mês</p>
                      <p className="text-xl font-bold text-green-400">
                        R$ {financialMetrics.totalIncome.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        +12.5% vs mês anterior
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Despesas Mês</p>
                      <p className="text-xl font-bold text-red-400">
                        R$ {financialMetrics.totalExpenses.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        -5.2% vs mês anterior
                      </p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Lucro Líquido</p>
                      <p
                        className={`text-xl font-bold ${financialMetrics.netProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        R$ {financialMetrics.netProfit.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Margem: {financialMetrics.profitMargin.toFixed(1)}%
                      </p>
                    </div>
                    <CircleDollarSign
                      className={`w-8 h-8 ${financialMetrics.netProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Saldo Bancos</p>
                      <p className="text-xl font-bold text-blue-400">
                        R$ {financialMetrics.totalBankBalance.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {bankAccounts.length} contas
                      </p>
                    </div>
                    <Wallet className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <ArrowUpRight className="w-5 h-5 mr-2 text-green-400" />
                    Contas a Receber
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Em Aberto:</span>
                      <span className="text-yellow-400 font-medium">
                        R${" "}
                        {financialMetrics.pendingReceivables.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Em Atraso:</span>
                      <span className="text-red-400 font-medium">
                        R${" "}
                        {financialMetrics.overdueReceivables.toLocaleString()}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-cinema-yellow text-cinema-dark"
                      onClick={() => setActiveTab("receivables")}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <ArrowDownRight className="w-5 h-5 mr-2 text-red-400" />
                    Contas a Pagar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">A Vencer:</span>
                      <span className="text-yellow-400 font-medium">
                        R$ {financialMetrics.pendingPayables.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Vencidas:</span>
                      <span className="text-red-400 font-medium">
                        R$ {financialMetrics.overduePayables.toLocaleString()}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-cinema-yellow text-cinema-dark"
                      onClick={() => setActiveTab("payables")}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bank Accounts */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white">Contas Bancárias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {bankAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="p-4 bg-cinema-dark-lighter rounded-lg border border-cinema-gray-light/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">
                          {account.name}
                        </h4>
                        <div
                          className={`p-1 rounded ${
                            account.type === "checking"
                              ? "bg-blue-400/20"
                              : account.type === "savings"
                                ? "bg-green-400/20"
                                : "bg-purple-400/20"
                          }`}
                        >
                          <Building
                            className={`w-4 h-4 ${
                              account.type === "checking"
                                ? "text-blue-400"
                                : account.type === "savings"
                                  ? "text-green-400"
                                  : "text-purple-400"
                            }`}
                          />
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">{account.bank}</p>
                      <p className="text-gray-400 text-xs">
                        Ag: {account.agency} | Cc: {account.account}
                      </p>
                      <p className="text-cinema-yellow font-bold text-lg mt-2">
                        R$ {account.balance.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost Centers */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white">Centros de Custo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costCenters.map((center) => (
                    <div
                      key={center.id}
                      className="p-4 bg-cinema-dark-lighter rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-medium">
                            {center.name}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {center.description}
                          </p>
                          <p className="text-gray-500 text-xs">
                            Responsável: {center.responsible}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">
                            R$ {center.spent.toLocaleString()}
                          </p>
                          <p className="text-gray-400 text-sm">
                            de R$ {center.budget.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-cinema-gray rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            center.spent / center.budget > 0.9
                              ? "bg-red-400"
                              : center.spent / center.budget > 0.7
                                ? "bg-yellow-400"
                                : "bg-green-400"
                          }`}
                          style={{
                            width: `${Math.min((center.spent / center.budget) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {((center.spent / center.budget) * 100).toFixed(1)}%
                        utilizado
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Receivables Tab */}
        {activeTab === "receivables" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Contas a Receber</h3>
              <Button
                onClick={() => setShowTransactionModal(true)}
                className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Receita
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar receitas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-cinema-dark border-cinema-gray-light text-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-cinema-dark border border-cinema-gray-light text-white rounded-md px-3 py-2"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Vencido</option>
              </select>
            </div>

            {/* Receivables Table */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-cinema-gray-light">
                      <tr>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Cliente
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Descrição
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Valor
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Vencimento
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions
                        .filter((t) => t.type === "income")
                        .map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter"
                          >
                            <td className="px-4 py-3 text-white text-sm">
                              {transaction.clientId || "Cliente Geral"}
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-white text-sm font-medium">
                                  {transaction.description}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {transaction.category} •{" "}
                                  {transaction.invoiceNumber}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-green-400 font-medium">
                                R$ {transaction.amount.toLocaleString()}
                              </span>
                              {transaction.installments > 1 && (
                                <p className="text-xs text-gray-400">
                                  {transaction.currentInstallment}/
                                  {transaction.installments}x
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-sm">
                              {transaction.dueDate}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}
                              >
                                {getStatusIcon(transaction.status)}
                                <span className="ml-1 capitalize">
                                  {transaction.status}
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                {transaction.status === "pending" && (
                                  <Button
                                    size="sm"
                                    className="bg-green-500 text-white hover:bg-green-600"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-400 border-blue-400"
                                  title="Enviar Cobrança"
                                  onClick={() => setActiveTab("notifications")}
                                >
                                  <Send className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-cinema-yellow border-cinema-yellow"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-cinema-yellow border-cinema-yellow"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payables Tab */}
        {activeTab === "payables" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Contas a Pagar</h3>
              <Button
                onClick={() => {
                  setNewTransaction({ ...newTransaction, type: "expense" });
                  setShowTransactionModal(true);
                }}
                className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Despesa
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar despesas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-cinema-dark border-cinema-gray-light text-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-cinema-dark border border-cinema-gray-light text-white rounded-md px-3 py-2"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Vencido</option>
              </select>
            </div>

            {/* Payables Table */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-cinema-gray-light">
                      <tr>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Fornecedor
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Descrição
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Valor
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Vencimento
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions
                        .filter((t) => t.type === "expense")
                        .map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter"
                          >
                            <td className="px-4 py-3 text-white text-sm">
                              {transaction.supplierId || "Fornecedor Geral"}
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-white text-sm font-medium">
                                  {transaction.description}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {transaction.category} •{" "}
                                  {transaction.invoiceNumber}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-red-400 font-medium">
                                R$ {transaction.amount.toLocaleString()}
                              </span>
                              {transaction.installments > 1 && (
                                <p className="text-xs text-gray-400">
                                  {transaction.currentInstallment}/
                                  {transaction.installments}x
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-sm">
                              {transaction.dueDate}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}
                              >
                                {getStatusIcon(transaction.status)}
                                <span className="ml-1 capitalize">
                                  {transaction.status}
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                {transaction.status === "pending" && (
                                  <Button
                                    size="sm"
                                    className="bg-green-500 text-white hover:bg-green-600"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-cinema-yellow border-cinema-yellow"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-cinema-yellow border-cinema-yellow"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cash Flow Tab */}
        {activeTab === "cashflow" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Fluxo de Caixa</h3>

            {/* Cash Flow Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4">
                  <div className="text-center">
                    <PlusCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Entradas (30 dias)</p>
                    <p className="text-xl font-bold text-green-400">
                      R${" "}
                      {(
                        financialMetrics.totalIncome +
                        financialMetrics.pendingReceivables
                      ).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4">
                  <div className="text-center">
                    <MinusCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Saídas (30 dias)</p>
                    <p className="text-xl font-bold text-red-400">
                      R${" "}
                      {(
                        financialMetrics.totalExpenses +
                        financialMetrics.pendingPayables
                      ).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4">
                  <div className="text-center">
                    <DollarSign className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Saldo Projetado</p>
                    <p className="text-xl font-bold text-blue-400">
                      R${" "}
                      {(
                        financialMetrics.totalBankBalance +
                        financialMetrics.pendingReceivables -
                        financialMetrics.pendingPayables
                      ).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cash Flow Chart Placeholder */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white">
                  Projeção de Fluxo de Caixa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-cinema-dark-lighter rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-cinema-yellow mx-auto mb-4" />
                    <p className="text-gray-400">
                      Gráfico de fluxo de caixa será exibido aqui
                    </p>
                    <p className="text-gray-500 text-sm">
                      Integração com bibliotecas de gráficos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white">
                  Movimentações Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 8).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg ${transaction.type === "income" ? "bg-green-400/20" : "bg-red-400/20"}`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="w-4 h-4 text-green-400" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {transaction.description}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {transaction.date} • {transaction.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}
                        >
                          {transaction.type === "income" ? "+" : "-"}R${" "}
                          {transaction.amount.toLocaleString()}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}
                        >
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 capitalize">
                            {transaction.status}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === "employees" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h3 className="text-xl font-bold text-white">
                  Gestão de Funcionários
                </h3>

                {/* Online/Offline Status */}
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-400" : "bg-red-400"}`}
                  ></div>
                  <span
                    className={`text-sm font-medium ${isOnline ? "text-green-400" : "text-red-400"}`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>

                {/* Sync Status */}
                {isSyncing && (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cinema-yellow"></div>
                    <span className="text-sm text-cinema-yellow">
                      Sincronizando...
                    </span>
                  </div>
                )}

                {/* Pending Actions */}
                {pendingActions > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="bg-orange-400/20 text-orange-400 px-2 py-1 rounded-full text-xs">
                      {pendingActions} ações pendentes
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                {!isOnline && (
                  <Button
                    onClick={syncData}
                    disabled={isSyncing}
                    variant="outline"
                    className="text-cinema-yellow border-cinema-yellow"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Sincronizar
                  </Button>
                )}
                <Button
                  onClick={() => setShowEmployeeModal(true)}
                  className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Funcionário
                </Button>
              </div>
            </div>

            {/* Offline Mode Banner */}
            {!isOnline && (
              <Card className="bg-orange-400/20 border-orange-400/30">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-6 h-6 text-orange-400" />
                    <div>
                      <h4 className="text-orange-400 font-semibold">
                        Modo Offline Ativado
                      </h4>
                      <p className="text-orange-300 text-sm">
                        Sistema funcionando offline. Todos os cálculos são
                        automáticos e as alterações serão sincronizadas quando a
                        conexão for restabelecida.
                        {pendingActions > 0 &&
                          ` ${pendingActions} ações aguardando sincronização.`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Online Mode Features */}
            {isOnline && (
              <Card className="bg-green-400/20 border-green-400/30">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div>
                      <h4 className="text-green-400 font-semibold">
                        Sistema Online
                      </h4>
                      <p className="text-green-300 text-sm">
                        Cálculos automáticos ativos. Folha de pagamento
                        atualizada em tempo real com INSS, IRPF e benefícios.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Employee Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-cinema-yellow mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {employees.filter((e) => e.status === "active").length}
                  </p>
                  <p className="text-gray-400 text-sm">Funcionários Ativos</p>
                </CardContent>
              </Card>
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    R${" "}
                    {employees
                      .reduce((sum, emp) => sum + emp.grossSalary, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">Folha Bruta</p>
                  <div className="flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                    <span className="text-xs text-green-400">
                      Auto-calculado
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4 text-center">
                  <Banknote className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    R${" "}
                    {employees
                      .reduce((sum, emp) => sum + emp.netSalary, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">Folha Líquida</p>
                  <div className="flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
                    <span className="text-xs text-blue-400">Com descontos</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {employees.reduce((sum, emp) => sum + emp.overtime, 0)}
                  </p>
                  <p className="text-gray-400 text-sm">Horas Extras</p>
                </CardContent>
              </Card>
            </div>

            {/* Employees Table */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-cinema-gray-light">
                      <tr>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Funcionário
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Cargo
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Departamento
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Salário Base
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Sal. Líquido
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => (
                        <tr
                          key={employee.id}
                          className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-white font-medium">
                                {employee.name}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {employee.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-white text-sm">
                            {employee.position}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-sm">
                            {employee.department}
                          </td>
                          <td className="px-4 py-3 text-green-400 font-medium">
                            R$ {employee.baseSalary.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-cinema-yellow font-medium">
                            R$ {employee.netSalary.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                employee.status === "active"
                                  ? "text-green-400 bg-green-400/20"
                                  : employee.status === "vacation"
                                    ? "text-yellow-400 bg-yellow-400/20"
                                    : "text-red-400 bg-red-400/20"
                              }`}
                            >
                              {employee.status === "active"
                                ? "Ativo"
                                : employee.status === "vacation"
                                  ? "Férias"
                                  : "Inativo"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingEmployee(employee)}
                                className="text-cinema-yellow border-cinema-yellow"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-400 border-red-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payroll Tab */}
        {activeTab === "payroll" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                Folha de Pagamento
              </h3>
              <div className="flex space-x-2">
                <Button className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calcular Folha
                </Button>
                <Button
                  variant="outline"
                  className="text-cinema-yellow border-cinema-yellow"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>

            {/* Payroll Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    R${" "}
                    {employees
                      .reduce((sum, emp) => sum + emp.baseSalary, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">Salários Base</p>
                </CardContent>
              </Card>
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4 text-center">
                  <PlusCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    R${" "}
                    {employees
                      .reduce((sum, emp) => sum + emp.benefits, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">Benefícios</p>
                </CardContent>
              </Card>
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4 text-center">
                  <MinusCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    R${" "}
                    {employees
                      .reduce(
                        (sum, emp) =>
                          sum + emp.discounts + emp.grossSalary * 0.24,
                        0,
                      )
                      .toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">Descontos</p>
                </CardContent>
              </Card>
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4 text-center">
                  <Banknote className="w-8 h-8 text-cinema-yellow mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    R${" "}
                    {employees
                      .reduce((sum, emp) => sum + emp.netSalary, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">Total Líquido</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Payroll */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white">
                  Detalhamento da Folha - Janeiro 2025
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-cinema-gray-light">
                      <tr>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Funcionário
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Sal. Base
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          H. Extras
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Benefícios
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          INSS
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          IR
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Líquido
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => {
                        const inss = employee.grossSalary * 0.11;
                        const ir = employee.grossSalary * 0.13;
                        const overtimePay =
                          (employee.baseSalary / 220) * 1.5 * employee.overtime;

                        return (
                          <tr
                            key={employee.id}
                            className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter"
                          >
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-white font-medium">
                                  {employee.name}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {employee.position}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-white">
                              R$ {employee.baseSalary.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-green-400">
                              R$ {overtimePay.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-blue-400">
                              R$ {employee.benefits.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-red-400">
                              R$ {inss.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-red-400">
                              R$ {ir.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-cinema-yellow font-bold">
                              R$ {employee.netSalary.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">
              Central de Relatórios
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  name: "DRE - Demonstrativo Resultado",
                  description: "Receitas, custos e despesas por período",
                  icon: FileBarChart,
                  period: "Mensal/Anual",
                },
                {
                  name: "Fluxo de Caixa Realizado",
                  description: "Entradas e saídas efetivas",
                  icon: DollarSign,
                  period: "Diário/Mensal",
                },
                {
                  name: "Relatório de Cobrança",
                  description: "Títulos vencidos e a vencer",
                  icon: AlertTriangle,
                  period: "Em aberto",
                },
                {
                  name: "Análise de Custos",
                  description: "Custos por centro e categoria",
                  icon: PieChart,
                  period: "Mensal",
                },
                {
                  name: "Folha de Pagamento",
                  description: "Relatório completo da folha",
                  icon: Users,
                  period: "Mensal",
                },
                {
                  name: "Obrigações Fiscais",
                  description: "Impostos calculados e devidos",
                  icon: Calculator,
                  period: "Mensal",
                },
                {
                  name: "Rentabilidade por Produto",
                  description: "Margem de lucro por equipamento",
                  icon: Target,
                  period: "Customizado",
                },
                {
                  name: "Análise de Inadimplência",
                  description: "Clientes em atraso e histórico",
                  icon: TrendingDown,
                  period: "Em aberto",
                },
                {
                  name: "Balancete Contábil",
                  description: "Saldos de contas contábeis",
                  icon: Building,
                  period: "Mensal",
                },
              ].map((report, index) => (
                <Card
                  key={index}
                  className="bg-cinema-dark border-cinema-gray-light"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="p-2 bg-cinema-yellow/20 rounded-lg">
                        <report.icon className="w-5 h-5 text-cinema-yellow" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">
                          {report.name}
                        </h4>
                        <p className="text-gray-400 text-xs mt-1">
                          {report.description}
                        </p>
                        <p className="text-cinema-yellow text-xs mt-2">
                          Período: {report.period}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-cinema-yellow text-cinema-dark"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Visualizar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-cinema-yellow border-cinema-yellow"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-cinema-yellow border-cinema-yellow"
                      >
                        <FileSpreadsheet className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && <NotificationManager />}

        {/* Taxes Tab */}
        {activeTab === "taxes" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                Gestão de Impostos
              </h3>
              <Button
                onClick={() => autoDetectTaxRegime(taxSystem.cnpj)}
                disabled={isDetectingTaxes}
                className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
              >
                {isDetectingTaxes ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cinema-dark mr-2"></div>
                    Detectando...
                  </div>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Detectar Regime Automaticamente
                  </>
                )}
              </Button>
            </div>

            {/* Company Tax Info */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white">
                  Informações Tributárias da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white text-sm">CNPJ</Label>
                    <Input
                      value={taxSystem.cnpj}
                      onChange={(e) =>
                        setTaxSystem((prev) => ({
                          ...prev,
                          cnpj: e.target.value,
                        }))
                      }
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white text-sm">
                      Regime Tributário
                    </Label>
                    <select
                      value={taxSystem.regime}
                      onChange={(e) =>
                        setTaxSystem((prev) => ({
                          ...prev,
                          regime: e.target.value,
                        }))
                      }
                      className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                    >
                      <option value="simples">Simples Nacional</option>
                      <option value="presumido">Lucro Presumido</option>
                      <option value="real">Lucro Real</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-white text-sm">CNAE Principal</Label>
                    <Input
                      value={taxSystem.activity}
                      onChange={(e) =>
                        setTaxSystem((prev) => ({
                          ...prev,
                          activity: e.target.value,
                        }))
                      }
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="7723 - Locação"
                    />
                  </div>
                </div>

                {taxSystem.autoDetected && (
                  <div className="flex items-center p-3 bg-green-400/20 border border-green-400/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    <p className="text-green-400 text-sm">
                      Regime detectado automaticamente em{" "}
                      {new Date(taxSystem.lastUpdate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tax Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4 text-center">
                  <Calculator className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    R${" "}
                    {currentTaxes.pis + currentTaxes.cofins > 0
                      ? (
                          currentTaxes.pis + currentTaxes.cofins
                        ).toLocaleString()
                      : "0"}
                  </p>
                  <p className="text-gray-400 text-sm">PIS/COFINS</p>
                  <p className="text-xs text-gray-500">
                    {(
                      ((currentTaxes.pis + currentTaxes.cofins) /
                        financialMetrics.totalIncome) *
                      100
                    ).toFixed(2)}
                    %
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4 text-center">
                  <Percent className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    R$ {currentTaxes.irpj.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">IRPJ</p>
                  <p className="text-xs text-gray-500">
                    {(
                      (currentTaxes.irpj / financialMetrics.totalIncome) *
                      100
                    ).toFixed(2)}
                    %
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4 text-center">
                  <Building className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    R$ {currentTaxes.csll.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">CSLL</p>
                  <p className="text-xs text-gray-500">
                    {(
                      (currentTaxes.csll / financialMetrics.totalIncome) *
                      100
                    ).toFixed(2)}
                    %
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4 text-center">
                  <CopyCheck className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    R$ {currentTaxes.iss.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">ISS</p>
                  <p className="text-xs text-gray-500">
                    {(
                      (currentTaxes.iss / financialMetrics.totalIncome) *
                      100
                    ).toFixed(2)}
                    %
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tax Details by Regime */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white">
                  Detalhamento -{" "}
                  {taxSystem.regime === "simples"
                    ? "Simples Nacional"
                    : taxSystem.regime === "presumido"
                      ? "Lucro Presumido"
                      : "Lucro Real"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-cinema-yellow font-semibold mb-3">
                        Impostos Calculados
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">IRPJ:</span>
                          <span className="text-white">
                            R$ {currentTaxes.irpj.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">CSLL:</span>
                          <span className="text-white">
                            R$ {currentTaxes.csll.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">PIS:</span>
                          <span className="text-white">
                            R$ {currentTaxes.pis.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">COFINS:</span>
                          <span className="text-white">
                            R$ {currentTaxes.cofins.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">ISS:</span>
                          <span className="text-white">
                            R$ {currentTaxes.iss.toLocaleString()}
                          </span>
                        </div>
                        {currentTaxes.inss > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">INSS:</span>
                            <span className="text-white">
                              R$ {currentTaxes.inss.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-cinema-gray-light pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span className="text-cinema-yellow">Total:</span>
                            <span className="text-cinema-yellow">
                              R$ {currentTaxes.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-cinema-yellow font-semibold mb-3">
                        Informações do Regime
                      </h4>
                      <div className="space-y-2 text-sm">
                        {taxSystem.regime === "simples" && (
                          <>
                            <p className="text-gray-400">
                              Alíquota Unificada:{" "}
                              <span className="text-white">
                                {(currentTaxes.rate * 100).toFixed(2)}%
                              </span>
                            </p>
                            <p className="text-gray-400">
                              Faixa de Faturamento:{" "}
                              <span className="text-white">
                                {financialMetrics.totalIncome * 12 <= 180000
                                  ? "Até R$ 180.000"
                                  : financialMetrics.totalIncome * 12 <= 360000
                                    ? "Até R$ 360.000"
                                    : financialMetrics.totalIncome * 12 <=
                                        720000
                                      ? "Até R$ 720.000"
                                      : financialMetrics.totalIncome * 12 <=
                                          1800000
                                        ? "Até R$ 1.800.000"
                                        : "Acima de R$ 1.800.000"}
                              </span>
                            </p>
                            <p className="text-gray-400">
                              Vencimento:{" "}
                              <span className="text-white">
                                Até dia 20 do mês seguinte
                              </span>
                            </p>
                          </>
                        )}
                        {taxSystem.regime === "presumido" && (
                          <>
                            <p className="text-gray-400">
                              Base de Cálculo IRPJ/CSLL:{" "}
                              <span className="text-white">32% da receita</span>
                            </p>
                            <p className="text-gray-400">
                              PIS/COFINS:{" "}
                              <span className="text-white">
                                Cumulativo (3,65%)
                              </span>
                            </p>
                            <p className="text-gray-400">
                              Apuração:{" "}
                              <span className="text-white">Trimestral</span>
                            </p>
                          </>
                        )}
                        {taxSystem.regime === "real" && (
                          <>
                            <p className="text-gray-400">
                              Base de Cálculo:{" "}
                              <span className="text-white">Lucro efetivo</span>
                            </p>
                            <p className="text-gray-400">
                              PIS/COFINS:{" "}
                              <span className="text-white">
                                Não-cumulativo (9,25%)
                              </span>
                            </p>
                            <p className="text-gray-400">
                              Apuração:{" "}
                              <span className="text-white">
                                Mensal ou anual
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Configuration */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white">
                  Configuração de Impostos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {TAX_CONFIG.map((tax) => (
                    <div
                      key={tax.id}
                      className="flex items-center justify-between p-4 bg-cinema-dark-lighter rounded-lg"
                    >
                      <div>
                        <h4 className="text-white font-medium">{tax.name}</h4>
                        <p className="text-gray-400 text-sm">
                          Base: {tax.baseCalculation}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Vencimento: Todo dia {tax.dueDay}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-cinema-yellow font-bold text-lg">
                          {tax.rate}%
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            tax.type === "federal"
                              ? "text-red-400 bg-red-400/20"
                              : tax.type === "state"
                                ? "text-blue-400 bg-blue-400/20"
                                : "text-green-400 bg-green-400/20"
                          }`}
                        >
                          {tax.type === "federal"
                            ? "Federal"
                            : tax.type === "state"
                              ? "Estadual"
                              : "Municipal"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tax Calendar */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white">
                  Calendário Fiscal - Próximos Vencimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const nextMonth = new Date();
                    nextMonth.setMonth(nextMonth.getMonth() + 1);

                    if (taxSystem.regime === "simples") {
                      return [
                        {
                          tax: "Simples Nacional (DAS)",
                          date: `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-20`,
                          amount: currentTaxes.total,
                          status: "pending",
                          description: "Guia unificada com todos os impostos",
                        },
                      ];
                    } else {
                      return [
                        {
                          tax: "ISS",
                          date: `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-10`,
                          amount: currentTaxes.iss,
                          status: "pending",
                          description: "Imposto Sobre Serviços",
                        },
                        {
                          tax: "PIS/COFINS",
                          date: `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-25`,
                          amount: currentTaxes.pis + currentTaxes.cofins,
                          status: "pending",
                          description: "Contribuições Sociais",
                        },
                        {
                          tax: "IRPJ/CSLL",
                          date:
                            taxSystem.regime === "presumido"
                              ? `${nextMonth.getFullYear()}-${String(Math.ceil(nextMonth.getMonth() / 3) * 3).padStart(2, "0")}-31`
                              : `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-31`,
                          amount: currentTaxes.irpj + currentTaxes.csll,
                          status: "pending",
                          description:
                            taxSystem.regime === "presumido"
                              ? "Apuração trimestral"
                              : "Apuração mensal",
                        },
                      ];
                    }
                  })().map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded-lg border-l-4 border-l-yellow-400"
                    >
                      <div>
                        <p className="text-white font-medium">{item.tax}</p>
                        <p className="text-gray-400 text-sm">
                          Vencimento: {new Date(item.date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {item.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-cinema-yellow font-bold">
                          R$ {item.amount.toLocaleString()}
                        </p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs text-yellow-400 bg-yellow-400/20">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendente
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      {/* Add Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Cadastro de Funcionário
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmployeeModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Nome Completo *</Label>
                  <Input
                    value={newEmployee.name || ""}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, name: e.target.value })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="Ex: João Silva Santos"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">E-mail *</Label>
                  <Input
                    type="email"
                    value={newEmployee.email || ""}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, email: e.target.value })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="joao@empresa.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Telefone</Label>
                  <Input
                    value={newEmployee.phone || ""}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, phone: e.target.value })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="(31) 99999-9999"
                  />
                </div>
                <div>
                  <Label className="text-white">CPF</Label>
                  <Input
                    value={newEmployee.cpf || ""}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, cpf: e.target.value })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="123.456.789-00"
                  />
                </div>
                <div>
                  <Label className="text-white">RG</Label>
                  <Input
                    value={newEmployee.rg || ""}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, rg: e.target.value })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="MG-12.345.678"
                  />
                </div>
              </div>

              {/* Professional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Cargo *</Label>
                  <Input
                    value={newEmployee.position || ""}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        position: e.target.value,
                      })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="Ex: Técnico de Equipamentos"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Departamento *</Label>
                  <select
                    value={newEmployee.department || ""}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        department: e.target.value,
                      })
                    }
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Selecionar Departamento</option>
                    <option value="Operações">Operações</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Atendimento">Atendimento</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>

              {/* Financial Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Salário Base (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newEmployee.baseSalary || 0}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        baseSalary: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Benefícios (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newEmployee.benefits || 0}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        benefits: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label className="text-white">Descontos (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newEmployee.discounts || 0}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        discounts: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Data de Admissão</Label>
                  <Input
                    type="date"
                    value={newEmployee.hireDate || ""}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        hireDate: e.target.value,
                      })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Data de Nascimento</Label>
                  <Input
                    type="date"
                    value={newEmployee.birthDate || ""}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        birthDate: e.target.value,
                      })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Endereço Completo</Label>
                <Input
                  value={newEmployee.address || ""}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, address: e.target.value })
                  }
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  placeholder="Rua, número, bairro, cidade, estado"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleAddEmployee}
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Cadastrar Funcionário
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEmployeeModal(false)}
                  className="flex-1 text-gray-400 border-gray-400 hover:text-white hover:border-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Nova {newTransaction.type === "income" ? "Receita" : "Despesa"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white">Tipo de Transação</Label>
                <select
                  value={newTransaction.type || "income"}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      type: e.target.value as "income" | "expense",
                    })
                  }
                  className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                >
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              </div>

              <div>
                <Label className="text-white">Descrição *</Label>
                <Input
                  value={newTransaction.description || ""}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      description: e.target.value,
                    })
                  }
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  placeholder="Descreva a transação..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Categoria</Label>
                  <select
                    value={newTransaction.category || ""}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        category: e.target.value,
                      })
                    }
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  >
                    <option value="">Selecionar Categoria</option>
                    {newTransaction.type === "income" ? (
                      <>
                        <option value="Locação">Locação</option>
                        <option value="Serviços">Serviços</option>
                        <option value="Vendas">Vendas</option>
                        <option value="Outros">Outros</option>
                      </>
                    ) : (
                      <>
                        <option value="Pessoal">Pessoal</option>
                        <option value="Manutenção">Manutenção</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Impostos">Impostos</option>
                        <option value="Outros">Outros</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <Label className="text-white">Valor (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newTransaction.amount || 0}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Data da Transação</Label>
                  <Input
                    type="date"
                    value={newTransaction.date || ""}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        date: e.target.value,
                      })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Data de Vencimento</Label>
                  <Input
                    type="date"
                    value={newTransaction.dueDate || ""}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        dueDate: e.target.value,
                      })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Forma de Pagamento</Label>
                  <select
                    value={newTransaction.paymentMethod || ""}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  >
                    <option value="">Selecionar</option>
                    <option value="PIX">PIX</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão Débito">Cartão Débito</option>
                    <option value="Cartão Crédito">Cartão Crédito</option>
                    <option value="Boleto">Boleto Bancário</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>
                <div>
                  <Label className="text-white">Status</Label>
                  <select
                    value={newTransaction.status || "pending"}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="overdue">Vencido</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-white">Observações</Label>
                <textarea
                  value={newTransaction.notes || ""}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      notes: e.target.value,
                    })
                  }
                  className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 h-20 resize-none"
                  placeholder="Observações adicionais..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newTransaction.recurrent || false}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      recurrent: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label className="text-white">Transação recorrente</Label>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleAddTransaction}
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar{" "}
                  {newTransaction.type === "income" ? "Receita" : "Despesa"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowTransactionModal(false)}
                  className="flex-1 text-gray-400 border-gray-400 hover:text-white hover:border-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Editar Funcionário
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingEmployee(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Nome Completo</Label>
                  <Input
                    value={editingEmployee.name}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        name: e.target.value,
                      })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">E-mail</Label>
                  <Input
                    type="email"
                    value={editingEmployee.email}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        email: e.target.value,
                      })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Cargo</Label>
                  <Input
                    value={editingEmployee.position}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        position: e.target.value,
                      })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Salário Base (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingEmployee.baseSalary}
                    onChange={(e) => {
                      const baseSalary = parseFloat(e.target.value) || 0;
                      const grossSalary = baseSalary + editingEmployee.benefits;
                      const netSalary =
                        grossSalary -
                        editingEmployee.discounts -
                        grossSalary * 0.24;
                      setEditingEmployee({
                        ...editingEmployee,
                        baseSalary,
                        grossSalary,
                        netSalary,
                      });
                    }}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Status</Label>
                <select
                  value={editingEmployee.status}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                >
                  <option value="active">Ativo</option>
                  <option value="vacation">Férias</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => {
                    setEmployees(
                      employees.map((emp) =>
                        emp.id === editingEmployee.id ? editingEmployee : emp,
                      ),
                    );
                    setEditingEmployee(null);
                  }}
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingEmployee(null)}
                  className="flex-1 text-gray-400 border-gray-400 hover:text-white hover:border-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
