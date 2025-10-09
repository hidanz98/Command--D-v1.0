import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Calculator,
  DollarSign,
  Users,
  FileText,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Percent,
  Receipt,
  Banknote,
  PieChart,
  BarChart3,
  TrendingUp,
  Building2,
  Shield,
  Lock,
  Settings,
  Zap,
  Target,
  Calendar,
  Clock,
  Star,
  Gift,
} from "lucide-react";
import { triggerPayrollExtra } from "./PayrollNotifications";

// Interfaces
interface Employee {
  id: string;
  name: string;
  email: string;
  cpf: string;
  position: string;
  department: string;
  baseSalary: number;
  hireDate: string;
  status: "active" | "inactive" | "vacation" | "dismissed";
  workHours: number;
  bankAccount: string;
  pix: string;
  hasContract: boolean;
  salaryType: "monthly" | "hourly";
  dependents: number;
  healthPlan: boolean;
  lifeInsurance: boolean;
  mealVoucher: number;
  transportVoucher: number;
}

interface PayrollExtra {
  id: string;
  employeeId: string;
  type: "bonus" | "commission" | "overtime" | "allowance" | "deduction";
  category: "declared" | "undeclared"; // Com ou sem declaração
  name: string;
  amount: number;
  percentage?: number;
  baseAmount?: number;
  description: string;
  period: string; // YYYY-MM
  recurring: boolean;
  taxable: boolean;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  status: "pending" | "approved" | "paid" | "cancelled";
}

interface TaxCalculation {
  inss: {
    rate: number;
    amount: number;
    ceiling: number;
  };
  irrf: {
    rate: number;
    amount: number;
    deduction: number;
    taxableIncome: number;
  };
  fgts: {
    rate: number;
    amount: number;
  };
  totalTaxes: number;
  netSalary: number;
  grossSalary: number;
}

interface PayrollEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseSalary: number;
  workedHours: number;
  overtimeHours: number;
  extras: PayrollExtra[];
  declaredExtras: number;
  undeclaredExtras: number;
  grossSalary: number;
  benefits: {
    mealVoucher: number;
    transportVoucher: number;
    healthPlan: number;
    lifeInsurance: number;
  };
  deductions: {
    inss: number;
    irrf: number;
    healthPlan: number;
    otherDeductions: number;
  };
  fgts: number;
  netSalary: number;
  taxCalculation: TaxCalculation;
  status: "draft" | "calculated" | "approved" | "paid";
  calculatedAt: string;
  approvedAt?: string;
  paidAt?: string;
  payslipGenerated: boolean;
}

// Tax tables for 2025 (valores atualizados)
const INSS_TABLE = [
  { min: 0, max: 1412.00, rate: 0.075 },
  { min: 1412.01, max: 2666.68, rate: 0.09 },
  { min: 2666.69, max: 4000.03, rate: 0.12 },
  { min: 4000.04, max: 7786.02, rate: 0.14 },
];

const IRRF_TABLE = [
  { min: 0, max: 2259.20, rate: 0, deduction: 0 },
  { min: 2259.21, max: 2826.65, rate: 0.075, deduction: 169.44 },
  { min: 2826.66, max: 3751.05, rate: 0.15, deduction: 381.44 },
  { min: 3751.06, max: 4664.68, rate: 0.225, deduction: 662.77 },
  { min: 4664.69, max: Infinity, rate: 0.275, deduction: 896.00 },
];

const DEPENDENT_DEDUCTION = 189.59; // Per dependent
const FGTS_RATE = 0.08;

// Mock Data
const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "1",
    name: "João Silva Santos",
    email: "joao.silva@bilscinema.com",
    cpf: "123.456.789-00",
    position: "Técnico de Equipamentos Senior",
    department: "Operações",
    baseSalary: 4200.00,
    hireDate: "2023-01-15",
    status: "active",
    workHours: 220,
    bankAccount: "Banco do Brasil - 1234-5 / 12345-6",
    pix: "joao.silva@bilscinema.com",
    hasContract: true,
    salaryType: "monthly",
    dependents: 2,
    healthPlan: true,
    lifeInsurance: true,
    mealVoucher: 600.00,
    transportVoucher: 200.00,
  },
  {
    id: "2",
    name: "Maria Santos Oliveira",
    email: "maria.santos@bilscinema.com",
    cpf: "987.654.321-00",
    position: "Assistente Financeiro",
    department: "Financeiro",
    baseSalary: 3200.00,
    hireDate: "2023-03-10",
    status: "active",
    workHours: 220,
    bankAccount: "Caixa Econômica - 0987 / 98765-4",
    pix: "(31) 98888-8888",
    hasContract: true,
    salaryType: "monthly",
    dependents: 1,
    healthPlan: true,
    lifeInsurance: false,
    mealVoucher: 600.00,
    transportVoucher: 180.00,
  },
];

const MOCK_PAYROLL_EXTRAS: PayrollExtra[] = [
  {
    id: "1",
    employeeId: "1",
    type: "bonus",
    category: "declared",
    name: "Bônus por Performance",
    amount: 500.00,
    description: "Bônus trimestral por metas atingidas",
    period: "2025-01",
    recurring: false,
    taxable: true,
    createdBy: "Admin",
    createdAt: "2025-01-15T10:00:00Z",
    approvedBy: "Manager",
    approvedAt: "2025-01-15T14:00:00Z",
    status: "approved",
  },
  {
    id: "2",
    employeeId: "1",
    type: "allowance",
    category: "undeclared",
    name: "Ajuda de Custo (Não Declarada)",
    amount: 300.00,
    description: "Ajuda de custo para projeto especial",
    period: "2025-01",
    recurring: false,
    taxable: false,
    createdBy: "Admin",
    createdAt: "2025-01-15T10:00:00Z",
    approvedBy: "Admin",
    approvedAt: "2025-01-15T14:00:00Z",
    status: "approved",
  },
];

interface Props {
  isAdmin?: boolean;
}

export const AutomatedPayroll: React.FC<Props> = ({ isAdmin = true }) => {
  const [employees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [payrollExtras, setPayrollExtras] = useState<PayrollExtra[]>(() => {
    // Load from localStorage or use mock data
    const saved = localStorage.getItem('payrollExtras');
    return saved ? JSON.parse(saved) : MOCK_PAYROLL_EXTRAS;
  });
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [showCalculationModal, setShowCalculationModal] = useState<string | null>(null);
  const [editingExtra, setEditingExtra] = useState<PayrollExtra | null>(null);
  const [newExtra, setNewExtra] = useState<Partial<PayrollExtra>>({
    type: "bonus",
    category: "declared",
    amount: 0,
    taxable: true,
    recurring: false,
    status: "pending",
  });

  // Calculate INSS
  const calculateINSS = (salary: number): { rate: number; amount: number; ceiling: number } => {
    let totalINSS = 0;
    let lastBracket = 0;

    for (const bracket of INSS_TABLE) {
      const bracketMin = Math.max(bracket.min, lastBracket);
      const bracketMax = Math.min(bracket.max, salary);

      if (bracketMax > bracketMin) {
        totalINSS += (bracketMax - bracketMin) * bracket.rate;
      }

      lastBracket = bracket.max;
      if (salary <= bracket.max) break;
    }

    const maxINSS = INSS_TABLE[INSS_TABLE.length - 1].max * INSS_TABLE[INSS_TABLE.length - 1].rate;
    const finalINSS = Math.min(totalINSS, maxINSS);

    return {
      rate: finalINSS / Math.min(salary, INSS_TABLE[INSS_TABLE.length - 1].max),
      amount: finalINSS,
      ceiling: INSS_TABLE[INSS_TABLE.length - 1].max,
    };
  };

  // Calculate IRRF
  const calculateIRRF = (taxableIncome: number, dependents: number): { rate: number; amount: number; deduction: number; taxableIncome: number } => {
    const dependentDeduction = dependents * DEPENDENT_DEDUCTION;
    const adjustedIncome = Math.max(0, taxableIncome - dependentDeduction);

    for (const bracket of IRRF_TABLE) {
      if (adjustedIncome >= bracket.min && adjustedIncome <= bracket.max) {
        const irrfAmount = Math.max(0, (adjustedIncome * bracket.rate) - bracket.deduction);
        return {
          rate: bracket.rate,
          amount: irrfAmount,
          deduction: bracket.deduction + dependentDeduction,
          taxableIncome: adjustedIncome,
        };
      }
    }

    return { rate: 0, amount: 0, deduction: dependentDeduction, taxableIncome: adjustedIncome };
  };

  // Calculate full tax
  const calculateTaxes = (employee: Employee, grossSalary: number): TaxCalculation => {
    const inss = calculateINSS(grossSalary);
    const taxableIncome = grossSalary - inss.amount;
    const irrf = calculateIRRF(taxableIncome, employee.dependents);
    const fgts = {
      rate: FGTS_RATE,
      amount: grossSalary * FGTS_RATE,
    };

    const totalTaxes = inss.amount + irrf.amount;
    const netSalary = grossSalary - totalTaxes;

    return {
      inss,
      irrf,
      fgts,
      totalTaxes,
      netSalary,
      grossSalary,
    };
  };

  // Calculate payroll for employee
  const calculateEmployeePayroll = (employee: Employee, period: string): PayrollEntry => {
    // Get worked hours from timesheet system
    const workedHours = 220; // Mock - should come from timesheet
    const overtimeHours = Math.max(0, workedHours - 220);
    
    // Get extras for this employee and period
    const employeeExtras = payrollExtras.filter(
      extra => extra.employeeId === employee.id && extra.period === period && extra.status === "approved"
    );

    // Calculate declared and undeclared extras
    const declaredExtras = employeeExtras
      .filter(extra => extra.category === "declared")
      .reduce((sum, extra) => sum + extra.amount, 0);

    const undeclaredExtras = employeeExtras
      .filter(extra => extra.category === "undeclared")
      .reduce((sum, extra) => sum + extra.amount, 0);

    // Calculate overtime
    const overtimePay = employee.salaryType === "hourly" 
      ? (employee.baseSalary / 220) * overtimeHours * 1.5 
      : 0;

    // Gross salary = base + declared extras + overtime (undeclared extras don't count for tax calculation)
    const grossSalary = employee.baseSalary + declaredExtras + overtimePay;

    // Calculate taxes
    const taxCalculation = calculateTaxes(employee, grossSalary);

    // Benefits
    const benefits = {
      mealVoucher: employee.mealVoucher,
      transportVoucher: employee.transportVoucher,
      healthPlan: employee.healthPlan ? 150.00 : 0,
      lifeInsurance: employee.lifeInsurance ? 50.00 : 0,
    };

    // Deductions
    const deductions = {
      inss: taxCalculation.inss.amount,
      irrf: taxCalculation.irrf.amount,
      healthPlan: employee.healthPlan ? 150.00 : 0,
      otherDeductions: 0,
    };

    // Net salary = gross salary - taxes + undeclared extras + benefits - benefit deductions
    const netSalary = taxCalculation.netSalary + undeclaredExtras + benefits.mealVoucher + benefits.transportVoucher - deductions.healthPlan;

    return {
      id: `payroll_${employee.id}_${period}`,
      employeeId: employee.id,
      employeeName: employee.name,
      period,
      baseSalary: employee.baseSalary,
      workedHours,
      overtimeHours,
      extras: employeeExtras,
      declaredExtras,
      undeclaredExtras,
      grossSalary,
      benefits,
      deductions,
      fgts: taxCalculation.fgts.amount,
      netSalary,
      taxCalculation,
      status: "calculated",
      calculatedAt: new Date().toISOString(),
      payslipGenerated: false,
    };
  };

  // Calculate payroll for all employees
  const calculatePayroll = () => {
    const entries = employees
      .filter(emp => emp.status === "active")
      .map(emp => calculateEmployeePayroll(emp, selectedPeriod));
    
    setPayrollEntries(entries);
  };

  // Add extra
  const handleAddExtra = () => {
    if (!newExtra.employeeId || !newExtra.name || !newExtra.amount) return;

    const extra: PayrollExtra = {
      id: `extra_${Date.now()}`,
      employeeId: newExtra.employeeId!,
      type: newExtra.type || "bonus",
      category: newExtra.category || "declared",
      name: newExtra.name,
      amount: newExtra.amount,
      percentage: newExtra.percentage,
      baseAmount: newExtra.baseAmount,
      description: newExtra.description || "",
      period: selectedPeriod,
      recurring: newExtra.recurring || false,
      taxable: newExtra.taxable !== false,
      createdBy: "Admin",
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    setPayrollExtras([...payrollExtras, extra]);

    // Save to localStorage for persistence
    const allExtras = [...payrollExtras, extra];
    localStorage.setItem('payrollExtras', JSON.stringify(allExtras));

    // Trigger notification for admin
    const employee = employees.find(emp => emp.id === extra.employeeId);
    if (employee) {
      triggerPayrollExtra(employee.name, extra.name, extra.amount);
    }

    setNewExtra({
      type: "bonus",
      category: "declared",
      amount: 0,
      taxable: true,
      recurring: false,
      status: "pending",
    });
    setShowExtraModal(false);
  };

  // Approve extra
  const approveExtra = (extraId: string) => {
    const updatedExtras = payrollExtras.map(extra =>
      extra.id === extraId
        ? { ...extra, status: "approved" as const, approvedBy: "Admin", approvedAt: new Date().toISOString() }
        : extra
    );

    setPayrollExtras(updatedExtras);

    // Save to localStorage
    localStorage.setItem('payrollExtras', JSON.stringify(updatedExtras));

    // Trigger payroll recalculation
    localStorage.setItem('lastPayrollCalculation', new Date().toISOString());
  };

  // Auto-save payroll extras to localStorage
  useEffect(() => {
    localStorage.setItem('payrollExtras', JSON.stringify(payrollExtras));
  }, [payrollExtras]);

  // Auto-calculate when period changes or extras are updated
  useEffect(() => {
    if (selectedPeriod) {
      calculatePayroll();
    }
  }, [selectedPeriod, payrollExtras]);

  const totalGrossSalary = payrollEntries.reduce((sum, entry) => sum + entry.grossSalary, 0);
  const totalNetSalary = payrollEntries.reduce((sum, entry) => sum + entry.netSalary, 0);
  const totalTaxes = payrollEntries.reduce((sum, entry) => sum + entry.taxCalculation.totalTaxes, 0);
  const totalFGTS = payrollEntries.reduce((sum, entry) => sum + entry.fgts, 0);
  const totalDeclaredExtras = payrollEntries.reduce((sum, entry) => sum + entry.declaredExtras, 0);
  const totalUndeclaredExtras = payrollEntries.reduce((sum, entry) => sum + entry.undeclaredExtras, 0);

  const pendingExtras = payrollExtras.filter(extra => extra.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-white">Folha de Pagamento Automática</h3>
          <p className="text-gray-400 mt-1">
            Cálculos automáticos com impostos e extras personalizados
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowExtraModal(true)}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <Gift className="w-4 h-4 mr-2" />
            Adicionar Extra
          </Button>
          <Button
            onClick={calculatePayroll}
            className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
          >
            <Zap className="w-4 h-4 mr-2" />
            Recalcular
          </Button>
          <Button
            variant="outline"
            className="text-cinema-yellow border-cinema-yellow"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <Card className="bg-cinema-dark border-cinema-gray-light">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Período de Referência</Label>
              <Input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white mt-1 w-48"
              />
            </div>
            
            {pendingExtras.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">
                    {pendingExtras.length} extras aguardando aprovação
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-blue-400">{payrollEntries.length}</p>
            <p className="text-gray-400 text-sm">Funcionários</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-green-400">
              R$ {totalGrossSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">Salário Bruto</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <Banknote className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-blue-400">
              R$ {totalNetSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">Salário Líquido</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <Receipt className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-red-400">
              R$ {totalTaxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">Total Impostos</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-purple-400">
              R$ {totalFGTS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">FGTS Total</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <Gift className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-yellow-400">
              R$ {(totalDeclaredExtras + totalUndeclaredExtras).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">Extras Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown of Extras */}
      {(totalDeclaredExtras > 0 || totalUndeclaredExtras > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-cinema-dark border-cinema-gray-light">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Eye className="w-5 h-5 mr-2 text-green-400" />
                Extras Declarados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  R$ {totalDeclaredExtras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-gray-400 text-sm">Incluído no cálculo de impostos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cinema-dark border-cinema-gray-light">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <EyeOff className="w-5 h-5 mr-2 text-orange-400" />
                Extras Não Declarados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">
                  R$ {totalUndeclaredExtras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-gray-400 text-sm">Isento de impostos (por fora)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payroll Table */}
      <Card className="bg-cinema-dark border-cinema-gray-light">
        <CardHeader>
          <CardTitle className="text-white">Folha de Pagamento - {selectedPeriod}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-cinema-gray-light">
                <tr>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Funcionário</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Salário Base</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Extras</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Bruto</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">INSS</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">IRRF</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">FGTS</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Líquido</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {payrollEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{entry.employeeName}</p>
                        <p className="text-gray-400 text-xs">
                          {employees.find(emp => emp.id === entry.employeeId)?.position}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      R$ {entry.baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {entry.declaredExtras > 0 && (
                          <div className="text-green-400">
                            +R$ {entry.declaredExtras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (declarado)
                          </div>
                        )}
                        {entry.undeclaredExtras > 0 && (
                          <div className="text-orange-400">
                            +R$ {entry.undeclaredExtras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (por fora)
                          </div>
                        )}
                        {entry.declaredExtras === 0 && entry.undeclaredExtras === 0 && (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-green-400 font-medium">
                      R$ {entry.grossSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-red-400">
                      R$ {entry.deductions.inss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      <div className="text-xs text-gray-500">
                        {(entry.taxCalculation.inss.rate * 100).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-red-400">
                      R$ {entry.deductions.irrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      <div className="text-xs text-gray-500">
                        {(entry.taxCalculation.irrf.rate * 100).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-purple-400">
                      R$ {entry.fgts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      <div className="text-xs text-gray-500">8%</div>
                    </td>
                    <td className="px-4 py-3 text-blue-400 font-bold">
                      R$ {entry.netSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-cinema-yellow border-cinema-yellow"
                          onClick={() => setShowCalculationModal(entry.id)}
                        >
                          <Calculator className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-400 border-blue-400"
                        >
                          <FileText className="w-3 h-3" />
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

      {/* Pending Extras */}
      {pendingExtras.length > 0 && (
        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
              Extras Pendentes de Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-cinema-gray-light">
                  <tr>
                    <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Funcionário</th>
                    <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Tipo</th>
                    <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Descrição</th>
                    <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Valor</th>
                    <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Categoria</th>
                    <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingExtras.map((extra) => (
                    <tr key={extra.id} className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter">
                      <td className="px-4 py-3 text-white">
                        {employees.find(emp => emp.id === extra.employeeId)?.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize text-gray-400">{extra.type}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{extra.name}</td>
                      <td className="px-4 py-3 text-green-400 font-medium">
                        R$ {extra.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          extra.category === "declared" 
                            ? "text-green-400 bg-green-400/20" 
                            : "text-orange-400 bg-orange-400/20"
                        }`}>
                          {extra.category === "declared" ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Declarado
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Não Declarado
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-500 text-white hover:bg-green-600"
                            onClick={() => approveExtra(extra.id)}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-400 border-red-400"
                          >
                            <X className="w-3 h-3" />
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
      )}

      {/* Add Extra Modal */}
      {showExtraModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-cinema-dark border-cinema-gray-light w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Adicionar Extra</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExtraModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Funcionário</Label>
                  <Select value={newExtra.employeeId} onValueChange={(value) => setNewExtra({...newExtra, employeeId: value})}>
                    <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                      <SelectValue placeholder="Selecione o funcionário" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.filter(emp => emp.status === "active").map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Tipo</Label>
                  <Select value={newExtra.type} onValueChange={(value) => setNewExtra({...newExtra, type: value as PayrollExtra['type']})}>
                    <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bonus">Bônus</SelectItem>
                      <SelectItem value="commission">Comissão</SelectItem>
                      <SelectItem value="overtime">Hora Extra</SelectItem>
                      <SelectItem value="allowance">Ajuda de Custo</SelectItem>
                      <SelectItem value="deduction">Desconto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Categoria Fiscal</Label>
                  <Select value={newExtra.category} onValueChange={(value) => setNewExtra({...newExtra, category: value as PayrollExtra['category']})}>
                    <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="declared">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-2 text-green-400" />
                          Declarado (com impostos)
                        </div>
                      </SelectItem>
                      <SelectItem value="undeclared">
                        <div className="flex items-center">
                          <EyeOff className="w-4 h-4 mr-2 text-orange-400" />
                          Não Declarado (por fora)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Valor</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newExtra.amount}
                    onChange={(e) => setNewExtra({...newExtra, amount: parseFloat(e.target.value) || 0})}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="0,00"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-white">Nome/Descrição</Label>
                  <Input
                    value={newExtra.name}
                    onChange={(e) => setNewExtra({...newExtra, name: e.target.value})}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="Ex: Bônus por performance trimestral"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-white">Observações</Label>
                  <Textarea
                    value={newExtra.description}
                    onChange={(e) => setNewExtra({...newExtra, description: e.target.value})}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="Detalhes adicionais sobre o extra..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={newExtra.recurring}
                    onChange={(e) => setNewExtra({...newExtra, recurring: e.target.checked})}
                    className="w-4 h-4 text-cinema-yellow bg-cinema-dark border-cinema-gray-light rounded focus:ring-cinema-yellow"
                  />
                  <Label htmlFor="recurring" className="text-white">
                    Extra recorrente (todos os meses)
                  </Label>
                </div>
              </div>

              {/* Category Explanation */}
              <div className="bg-cinema-dark-lighter rounded-lg p-4 border border-cinema-gray-light">
                <h4 className="text-white font-semibold mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-cinema-yellow" />
                  Diferença entre Categorias Fiscais
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <Eye className="w-4 h-4 text-green-400 mt-0.5" />
                    <div>
                      <span className="text-green-400 font-medium">Declarado:</span>
                      <span className="text-gray-400"> Integra o salário bruto, incide INSS, IRRF e FGTS. Aparece no holerite oficial.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <EyeOff className="w-4 h-4 text-orange-400 mt-0.5" />
                    <div>
                      <span className="text-orange-400 font-medium">Não Declarado:</span>
                      <span className="text-gray-400"> Pago "por fora", sem impostos. Não aparece no holerite oficial, apenas no relatório interno.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowExtraModal(false)}
                  className="text-gray-400 border-gray-600"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddExtra}
                  className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Adicionar Extra
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calculation Details Modal */}
      {showCalculationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-cinema-dark border-cinema-gray-light w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Detalhes do Cálculo</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCalculationModal(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const entry = payrollEntries.find(e => e.id === showCalculationModal);
                if (!entry) return null;

                const employee = employees.find(emp => emp.id === entry.employeeId);
                if (!employee) return null;

                return (
                  <div className="space-y-6">
                    {/* Employee Info */}
                    <div className="bg-cinema-dark-lighter rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">{entry.employeeName}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Cargo:</span>
                          <span className="text-white ml-2">{employee.position}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Departamento:</span>
                          <span className="text-white ml-2">{employee.department}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Dependentes:</span>
                          <span className="text-white ml-2">{employee.dependents}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Período:</span>
                          <span className="text-white ml-2">{entry.period}</span>
                        </div>
                      </div>
                    </div>

                    {/* Calculation Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Income */}
                      <div>
                        <h5 className="text-cinema-yellow font-semibold mb-3">Rendimentos</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Salário Base:</span>
                            <span className="text-white">R$ {entry.baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          {entry.declaredExtras > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Extras Declarados:</span>
                              <span className="text-green-400">+R$ {entry.declaredExtras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          {entry.overtimeHours > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Horas Extras ({entry.overtimeHours}h):</span>
                              <span className="text-green-400">+R$ {((entry.baseSalary / 220) * entry.overtimeHours * 1.5).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          <div className="border-t border-cinema-gray-light pt-2 flex justify-between font-semibold">
                            <span className="text-white">Salário Bruto:</span>
                            <span className="text-green-400">R$ {entry.grossSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div>
                        <h5 className="text-cinema-yellow font-semibold mb-3">Descontos</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">INSS ({(entry.taxCalculation.inss.rate * 100).toFixed(2)}%):</span>
                            <span className="text-red-400">-R$ {entry.deductions.inss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">IRRF ({(entry.taxCalculation.irrf.rate * 100).toFixed(2)}%):</span>
                            <span className="text-red-400">-R$ {entry.deductions.irrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          {entry.deductions.healthPlan > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Plano de Saúde:</span>
                              <span className="text-red-400">-R$ {entry.deductions.healthPlan.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          <div className="border-t border-cinema-gray-light pt-2 flex justify-between font-semibold">
                            <span className="text-white">Total Descontos:</span>
                            <span className="text-red-400">-R$ {entry.taxCalculation.totalTaxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Benefits and Extras */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Benefits */}
                      <div>
                        <h5 className="text-cinema-yellow font-semibold mb-3">Benefícios</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Vale Refeição:</span>
                            <span className="text-blue-400">+R$ {entry.benefits.mealVoucher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Vale Transporte:</span>
                            <span className="text-blue-400">+R$ {entry.benefits.transportVoucher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">FGTS (8%):</span>
                            <span className="text-purple-400">R$ {entry.fgts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Undeclared Extras */}
                      {entry.undeclaredExtras > 0 && (
                        <div>
                          <h5 className="text-cinema-yellow font-semibold mb-3">Extras (Por Fora)</h5>
                          <div className="space-y-2 text-sm">
                            {entry.extras.filter(extra => extra.category === "undeclared").map(extra => (
                              <div key={extra.id} className="flex justify-between">
                                <span className="text-gray-400">{extra.name}:</span>
                                <span className="text-orange-400">+R$ {extra.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            ))}
                            <div className="border-t border-cinema-gray-light pt-2 flex justify-between font-semibold">
                              <span className="text-white">Total Por Fora:</span>
                              <span className="text-orange-400">+R$ {entry.undeclaredExtras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Final Calculation */}
                    <div className="bg-cinema-yellow/10 border border-cinema-yellow/20 rounded-lg p-4">
                      <div className="text-center">
                        <h5 className="text-cinema-yellow font-semibold mb-2">Salário Líquido Final</h5>
                        <p className="text-3xl font-bold text-white">
                          R$ {entry.netSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          = Bruto - Impostos + Benefícios + Extras por Fora
                        </p>
                      </div>
                    </div>

                    {/* Tax Calculation Details */}
                    <div className="bg-cinema-dark-lighter rounded-lg p-4">
                      <h5 className="text-cinema-yellow font-semibold mb-3">Detalhes dos Impostos</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h6 className="text-white font-medium mb-2">INSS</h6>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Base de Cálculo:</span>
                              <span className="text-white">R$ {Math.min(entry.grossSalary, entry.taxCalculation.inss.ceiling).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Alíquota:</span>
                              <span className="text-white">{(entry.taxCalculation.inss.rate * 100).toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Teto:</span>
                              <span className="text-white">R$ {entry.taxCalculation.inss.ceiling.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h6 className="text-white font-medium mb-2">IRRF</h6>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Renda Tributável:</span>
                              <span className="text-white">R$ {entry.taxCalculation.irrf.taxableIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Alíquota:</span>
                              <span className="text-white">{(entry.taxCalculation.irrf.rate * 100).toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Dedução:</span>
                              <span className="text-white">R$ {entry.taxCalculation.irrf.deduction.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AutomatedPayroll;
