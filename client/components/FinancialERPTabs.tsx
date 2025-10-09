import React from "react";
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
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  FileText,
  Calculator,
  BarChart3,
  Users,
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
  PlusCircle,
  MinusCircle,
  Printer,
  FileSpreadsheet,
  Send,
  MessageSquare,
  Target,
  PieChart,
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
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
} from "lucide-react";

// Interfaces (same as main file)
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

interface TaxCalculation {
  name: string;
  rate: number;
  base: number;
  amount: number;
  dueDate: string;
  paid: boolean;
}

interface PayrollItem {
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  benefits: number;
  overtime: number;
  grossPay: number;
  deductions: {
    inss: number;
    irrf: number;
    fgts: number;
    others: number;
  };
  netPay: number;
  period: string;
  status: "draft" | "approved" | "paid";
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

interface Props {
  activeTab: string;
  transactions: Transaction[];
  employees: Employee[];
  searchTerm: string;
  filterStatus: string;
  onSearch: (term: string) => void;
  onFilterChange: (status: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

export const ReceivablesTab: React.FC<Props> = ({
  transactions,
  searchTerm,
  filterStatus,
  onSearch,
  onFilterChange,
  onStatusUpdate,
  getStatusColor,
  getStatusIcon,
}) => {
  const receivables = transactions.filter(t => t.type === "income");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Contas a Receber</h3>
        <Button className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark">
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
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 bg-cinema-dark border-cinema-gray-light text-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          className="bg-cinema-dark border border-cinema-gray-light text-white rounded-md px-3 py-2"
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="overdue">Vencido</option>
          <option value="partial">Parcial</option>
        </select>
        <Button variant="outline" className="text-cinema-yellow border-cinema-yellow">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Receivables Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-green-400">
              R$ {receivables.filter(r => r.status === "paid").reduce((sum, r) => sum + r.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">Recebido</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-yellow-400">
              R$ {receivables.filter(r => r.status === "pending").reduce((sum, r) => sum + r.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">A Receber</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-red-400">
              R$ {receivables.filter(r => r.status === "overdue").reduce((sum, r) => sum + r.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">Em Atraso</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-blue-400">
              {receivables.length}
            </p>
            <p className="text-gray-400 text-sm">Total de Faturas</p>
          </CardContent>
        </Card>
      </div>

      {/* Receivables Table */}
      <Card className="bg-cinema-dark border-cinema-gray-light">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-cinema-gray-light">
                <tr>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Descrição</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Valor</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Vencimento</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {receivables.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter">
                    <td className="px-4 py-3 text-white text-sm">
                      {transaction.clientId || "Cliente Geral"}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white text-sm font-medium">{transaction.description}</p>
                        <p className="text-gray-400 text-xs">{transaction.category} • {transaction.invoiceNumber}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-400 font-medium">
                        R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      {transaction.installments > 1 && (
                        <p className="text-xs text-gray-400">
                          {transaction.currentInstallment}/{transaction.installments}x
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{transaction.dueDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1 capitalize">{transaction.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        {transaction.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-500 text-white hover:bg-green-600"
                              onClick={() => onStatusUpdate(transaction.id, "paid")}
                              title="Marcar como pago"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white"
                              title="Emitir NFSe"
                            >
                              <FileText className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-400 border-blue-400"
                          title="Enviar Cobrança"
                        >
                          <Send className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-cinema-yellow border-cinema-yellow"
                          title="Visualizar"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-cinema-yellow border-cinema-yellow"
                          title="Editar"
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
  );
};

export const PayablesTab: React.FC<Props> = ({
  transactions,
  searchTerm,
  filterStatus,
  onSearch,
  onFilterChange,
  onStatusUpdate,
  getStatusColor,
  getStatusIcon,
}) => {
  const payables = transactions.filter(t => t.type === "expense");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Contas a Pagar</h3>
        <Button className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark">
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
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 bg-cinema-dark border-cinema-gray-light text-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          className="bg-cinema-dark border border-cinema-gray-light text-white rounded-md px-3 py-2"
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="overdue">Vencido</option>
        </select>
        <Button variant="outline" className="text-cinema-yellow border-cinema-yellow">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Payables Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <TrendingDown className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-red-400">
              R$ {payables.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">Pago</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-yellow-400">
              R$ {payables.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">A Pagar</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-red-400">
              R$ {payables.filter(p => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">Em Atraso</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <Receipt className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-blue-400">
              {payables.length}
            </p>
            <p className="text-gray-400 text-sm">Total de Contas</p>
          </CardContent>
        </Card>
      </div>

      {/* Payables Table */}
      <Card className="bg-cinema-dark border-cinema-gray-light">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-cinema-gray-light">
                <tr>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Fornecedor</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Descrição</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Valor</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Vencimento</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {payables.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter">
                    <td className="px-4 py-3 text-white text-sm">
                      {transaction.supplierId || "Fornecedor Geral"}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white text-sm font-medium">{transaction.description}</p>
                        <p className="text-gray-400 text-xs">{transaction.category} • {transaction.invoiceNumber}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-red-400 font-medium">
                        R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      {transaction.installments > 1 && (
                        <p className="text-xs text-gray-400">
                          {transaction.currentInstallment}/{transaction.installments}x
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{transaction.dueDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1 capitalize">{transaction.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        {transaction.status === "pending" && (
                          <Button
                            size="sm"
                            className="bg-green-500 text-white hover:bg-green-600"
                            onClick={() => onStatusUpdate(transaction.id, "paid")}
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
  );
};

export const CashFlowTab: React.FC<Props> = ({
  transactions,
}) => {
  const totalReceived = transactions.filter(t => t.type === "income" && t.status === "paid").reduce((sum, t) => sum + t.amount, 0);
  const totalPaid = transactions.filter(t => t.type === "expense" && t.status === "paid").reduce((sum, t) => sum + t.amount, 0);
  const pendingIncome = transactions.filter(t => t.type === "income" && t.status === "pending").reduce((sum, t) => sum + t.amount, 0);
  const pendingExpenses = transactions.filter(t => t.type === "expense" && t.status === "pending").reduce((sum, t) => sum + t.amount, 0);

  // Gerar dados do gráfico dos últimos 30 dias
  const generateChartData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayIncome = transactions
        .filter(t => t.type === "income" && t.status === "paid" && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const dayExpense = transactions
        .filter(t => t.type === "expense" && t.status === "paid" && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      
      data.push({
        date: dateStr,
        income: dayIncome,
        expense: dayExpense,
        balance: dayIncome - dayExpense,
      });
    }
    
    return data;
  };

  const chartData = generateChartData();
  const maxValue = Math.max(...chartData.map(d => Math.max(d.income, d.expense)));

  const handleExport = () => {
    // Criar cabeçalho do relatório
    const header = [
      'RELATÓRIO DE FLUXO DE CAIXA',
      `Período: ${chartData[chartData.length - 1].date} a ${chartData[0].date}`,
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      '',
      'RESUMO CONSOLIDADO',
      `Total de Entradas: R$ ${chartData.reduce((sum, d) => sum + d.income, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `Total de Saídas: R$ ${chartData.reduce((sum, d) => sum + d.expense, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `Saldo do Período: R$ ${chartData.reduce((sum, d) => sum + d.balance, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      '',
      'MOVIMENTAÇÃO DIÁRIA',
    ];
    
    const csvContent = [
      ...header,
      ['Data', 'Entradas (R$)', 'Saídas (R$)', 'Saldo Diário (R$)'].join(','),
      ...chartData.map(d => [
        d.date,
        d.income.toFixed(2),
        d.expense.toFixed(2),
        d.balance.toFixed(2)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `fluxo-caixa-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Fluxo de Caixa</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          h1 { color: #1a1a1a; border-bottom: 2px solid #fbbf24; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 30px; }
          .summary { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .summary-item { margin: 8px 0; font-size: 16px; }
          .positive { color: #22c55e; font-weight: bold; }
          .negative { color: #ef4444; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #fbbf24; color: #1a1a1a; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:hover { background: #f9f9f9; }
          .footer { margin-top: 40px; text-align: center; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>📊 Relatório de Fluxo de Caixa</h1>
        <p><strong>Período:</strong> ${chartData[chartData.length - 1].date} a ${chartData[0].date}</p>
        <p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        
        <div class="summary">
          <h2>Resumo Consolidado (30 dias)</h2>
          <div class="summary-item">💰 <strong>Total de Entradas:</strong> <span class="positive">R$ ${chartData.reduce((sum, d) => sum + d.income, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
          <div class="summary-item">💸 <strong>Total de Saídas:</strong> <span class="negative">R$ ${chartData.reduce((sum, d) => sum + d.expense, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
          <div class="summary-item">📈 <strong>Saldo do Período:</strong> <span class="${chartData.reduce((sum, d) => sum + d.balance, 0) >= 0 ? 'positive' : 'negative'}">R$ ${chartData.reduce((sum, d) => sum + d.balance, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
        </div>
        
        <h2>Movimentação Diária Detalhada</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Entradas</th>
              <th>Saídas</th>
              <th>Saldo Diário</th>
            </tr>
          </thead>
          <tbody>
            ${chartData.map(d => `
              <tr>
                <td>${new Date(d.date).toLocaleDateString('pt-BR')}</td>
                <td class="positive">R$ ${d.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="negative">R$ ${d.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="${d.balance >= 0 ? 'positive' : 'negative'}">R$ ${d.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Bil's Cinema - Sistema Financeiro ERP</p>
          <p>Relatório gerado automaticamente pelo sistema</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 100);
          };
        </script>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Fluxo de Caixa</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="text-cinema-yellow border-cinema-yellow hover:bg-cinema-yellow/10"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button 
            variant="outline" 
            className="text-cinema-yellow border-cinema-yellow hover:bg-cinema-yellow/10"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <PlusCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Entradas Realizadas</p>
            <p className="text-xl font-bold text-green-400">
              R$ {totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <MinusCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Saídas Realizadas</p>
            <p className="text-xl font-bold text-red-400">
              R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Saldo Atual</p>
            <p className={`text-xl font-bold ${(totalReceived - totalPaid) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {(totalReceived - totalPaid).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Projeção (30 dias)</p>
            <p className={`text-xl font-bold ${((totalReceived + pendingIncome) - (totalPaid + pendingExpenses)) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {((totalReceived + pendingIncome) - (totalPaid + pendingExpenses)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card className="bg-cinema-dark border-cinema-gray-light">
        <CardHeader>
          <CardTitle className="text-white">Evolução do Fluxo de Caixa (Últimos 30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-cinema-dark-lighter rounded-lg p-4">
            <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid meet">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i}>
                  <line
                    x1="50"
                    y1={50 + (i * 250) / 4}
                    x2="950"
                    y2={50 + (i * 250) / 4}
                    stroke="#333"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                  <text
                    x="30"
                    y={55 + (i * 250) / 4}
                    fill="#999"
                    fontSize="10"
                    textAnchor="end"
                  >
                    R${((maxValue * (4 - i)) / 4 / 1000).toFixed(1)}k
                  </text>
                </g>
              ))}

              {/* Bars - Income (Green) and Expense (Red) */}
              {chartData.map((d, i) => {
                const x = 50 + (i * 900) / 30;
                const barWidth = 900 / 30 / 2.5;
                const incomeHeight = maxValue > 0 ? (d.income / maxValue) * 250 : 0;
                const expenseHeight = maxValue > 0 ? (d.expense / maxValue) * 250 : 0;

                return (
                  <g key={i}>
                    {/* Income bar */}
                    <rect
                      x={x}
                      y={300 - incomeHeight - 50}
                      width={barWidth}
                      height={incomeHeight}
                      fill="#4ade80"
                      opacity="0.8"
                      rx="2"
                    >
                      <title>{`${d.date}\nEntradas: R$ ${d.income.toFixed(2)}`}</title>
                    </rect>
                    
                    {/* Expense bar */}
                    <rect
                      x={x + barWidth + 2}
                      y={300 - expenseHeight - 50}
                      width={barWidth}
                      height={expenseHeight}
                      fill="#f87171"
                      opacity="0.8"
                      rx="2"
                    >
                      <title>{`${d.date}\nSaídas: R$ ${d.expense.toFixed(2)}`}</title>
                    </rect>

                    {/* Date labels (show every 5 days) */}
                    {i % 5 === 0 && (
                      <text
                        x={x + barWidth}
                        y="290"
                        fill="#999"
                        fontSize="8"
                        textAnchor="middle"
                        transform={`rotate(-45, ${x + barWidth}, 290)`}
                      >
                        {d.date.split('-')[2]}/{d.date.split('-')[1]}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Legend */}
              <g>
                <rect x="750" y="20" width="15" height="15" fill="#4ade80" opacity="0.8" rx="2" />
                <text x="770" y="32" fill="#ddd" fontSize="12">Entradas</text>
                
                <rect x="850" y="20" width="15" height="15" fill="#f87171" opacity="0.8" rx="2" />
                <text x="870" y="32" fill="#ddd" fontSize="12">Saídas</text>
              </g>
            </svg>
          </div>

          {/* Chart Summary */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="p-2 bg-green-900/20 border border-green-500/30 rounded">
              <p className="text-green-400 font-bold text-lg">
                R$ {chartData.reduce((sum, d) => sum + d.income, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-gray-400 text-xs">Total Entradas (30d)</p>
            </div>
            <div className="p-2 bg-red-900/20 border border-red-500/30 rounded">
              <p className="text-red-400 font-bold text-lg">
                R$ {chartData.reduce((sum, d) => sum + d.expense, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-gray-400 text-xs">Total Saídas (30d)</p>
            </div>
            <div className="p-2 bg-blue-900/20 border border-blue-500/30 rounded">
              <p className={`font-bold text-lg ${chartData.reduce((sum, d) => sum + d.balance, 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                R$ {chartData.reduce((sum, d) => sum + d.balance, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-gray-400 text-xs">Saldo Acumulado (30d)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-cinema-dark border-cinema-gray-light">
        <CardHeader>
          <CardTitle className="text-white">Movimentações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${transaction.type === "income" ? "bg-green-400/20" : "bg-red-400/20"}`}>
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="w-4 h-4 text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{transaction.description}</p>
                    <p className="text-gray-400 text-xs">{transaction.date} • {transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}>
                    {transaction.type === "income" ? "+" : "-"}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-gray-400 text-xs capitalize">{transaction.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const EmployeesTab: React.FC<{ employees: Employee[] }> = ({ employees }) => {
  const activeEmployees = employees.filter(e => e.status === "active");
  const totalSalaries = activeEmployees.reduce((sum, e) => sum + e.grossSalary, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Gestão de Funcionários</h3>
        <Button className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark">
          <Plus className="w-4 h-4 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      {/* Employee Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-blue-400">{activeEmployees.length}</p>
            <p className="text-gray-400 text-sm">Funcionários Ativos</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-green-400">
              R$ {totalSalaries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">Folha Total</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-yellow-400">
              {employees.filter(e => e.status === "vacation").length}
            </p>
            <p className="text-gray-400 text-sm">Em Férias</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <Briefcase className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-purple-400">
              {Math.round(totalSalaries / activeEmployees.length) || 0}
            </p>
            <p className="text-gray-400 text-sm">Salário Médio</p>
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
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Nome</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Cargo</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Departamento</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Salário</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{employee.name}</p>
                        <p className="text-gray-400 text-xs">{employee.email}</p>
                        <p className="text-gray-400 text-xs">{employee.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white">{employee.position}</td>
                    <td className="px-4 py-3 text-gray-400">{employee.department}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-green-400 font-medium">
                          R$ {employee.grossSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Líquido: R$ {employee.netSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        employee.status === "active" ? "text-green-400 bg-green-400/20" :
                        employee.status === "vacation" ? "text-yellow-400 bg-yellow-400/20" :
                        employee.status === "inactive" ? "text-gray-400 bg-gray-400/20" :
                        "text-red-400 bg-red-400/20"
                      }`}>
                        {employee.status === "active" ? "Ativo" :
                         employee.status === "vacation" ? "Férias" :
                         employee.status === "inactive" ? "Inativo" : "Demitido"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-cinema-yellow border-cinema-yellow">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-cinema-yellow border-cinema-yellow">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-blue-400 border-blue-400">
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
    </div>
  );
};

export const PayrollTab: React.FC<{ employees: Employee[] }> = ({ employees }) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const activeEmployees = employees.filter(e => e.status === "active");

  // Mock payroll calculations
  const mockPayroll: PayrollItem[] = activeEmployees.map(emp => {
    const inss = emp.grossSalary * 0.08; // 8% INSS (simplified)
    const irrf = emp.grossSalary > 4664.68 ? emp.grossSalary * 0.15 - 869.36 : 0; // IRRF simplified
    const fgts = emp.grossSalary * 0.08; // 8% FGTS
    const totalDeductions = inss + irrf;
    
    return {
      employeeId: emp.id,
      employeeName: emp.name,
      baseSalary: emp.baseSalary,
      benefits: emp.benefits,
      overtime: emp.overtime,
      grossPay: emp.grossSalary,
      deductions: {
        inss,
        irrf,
        fgts,
        others: emp.discounts,
      },
      netPay: emp.grossSalary - totalDeductions - emp.discounts,
      period: currentMonth,
      status: "draft",
    };
  });

  const totalGrossPay = mockPayroll.reduce((sum, p) => sum + p.grossPay, 0);
  const totalNetPay = mockPayroll.reduce((sum, p) => sum + p.netPay, 0);
  const totalDeductions = mockPayroll.reduce((sum, p) => sum + p.deductions.inss + p.deductions.irrf + p.deductions.others, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Folha de Pagamento</h3>
        <div className="flex space-x-2">
          <Button className="bg-green-500 text-white hover:bg-green-600">
            <CheckCircle className="w-4 h-4 mr-2" />
            Aprovar Folha
          </Button>
          <Button variant="outline" className="text-cinema-yellow border-cinema-yellow">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Payroll Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-blue-400">{activeEmployees.length}</p>
            <p className="text-gray-400 text-sm">Funcionários</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-green-400">
              R$ {totalGrossPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">Total Bruto</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <MinusCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-red-400">
              R$ {totalDeductions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">Total Descontos</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <PlusCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-blue-400">
              R$ {totalNetPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">Total Líquido</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card className="bg-cinema-dark border-cinema-gray-light">
        <CardHeader>
          <CardTitle className="text-white">Folha de Pagamento - {currentMonth}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-cinema-gray-light">
                <tr>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Funcionário</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Salário Base</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Benefícios</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Total Bruto</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">INSS</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">IRRF</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Outros</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Líquido</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockPayroll.map((payroll) => (
                  <tr key={payroll.employeeId} className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter">
                    <td className="px-4 py-3 text-white">{payroll.employeeName}</td>
                    <td className="px-4 py-3 text-gray-400">
                      R$ {payroll.baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      R$ {payroll.benefits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-green-400 font-medium">
                      R$ {payroll.grossPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-red-400">
                      R$ {payroll.deductions.inss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-red-400">
                      R$ {payroll.deductions.irrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-red-400">
                      R$ {payroll.deductions.others.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-blue-400 font-bold">
                      R$ {payroll.netPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-cinema-yellow border-cinema-yellow">
                          <FileText className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-blue-400 border-blue-400">
                          <Send className="w-3 h-3" />
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
  );
};

export const ReportsTab: React.FC = () => {
  const mockReports: Report[] = [
    {
      id: "1",
      name: "Demonstrativo de Resultado (DRE)",
      type: "profit_loss",
      period: "Janeiro 2025",
      status: "ready",
      generatedAt: "2025-01-15T10:30:00Z",
      downloadUrl: "/reports/dre-jan-2025.pdf",
    },
    {
      id: "2",
      name: "Balanço Patrimonial",
      type: "balance_sheet",
      period: "Janeiro 2025",
      status: "ready",
      generatedAt: "2025-01-15T10:30:00Z",
      downloadUrl: "/reports/balanco-jan-2025.pdf",
    },
    {
      id: "3",
      name: "Fluxo de Caixa Detalhado",
      type: "cashflow",
      period: "Janeiro 2025",
      status: "generating",
      generatedAt: "2025-01-15T10:30:00Z",
    },
    {
      id: "4",
      name: "Relatório de Impostos",
      type: "tax",
      period: "Janeiro 2025",
      status: "ready",
      generatedAt: "2025-01-15T10:30:00Z",
      downloadUrl: "/reports/impostos-jan-2025.pdf",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Relatórios Financeiros</h3>
        <Button className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark">
          <Plus className="w-4 h-4 mr-2" />
          Gerar Relatório
        </Button>
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
          <div className="text-center">
            <FileText className="w-6 h-6 mx-auto mb-1" />
            <div className="text-sm font-semibold">DRE</div>
            <div className="text-xs opacity-90">Demonstrativo</div>
          </div>
        </Button>

        <Button className="h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
          <div className="text-center">
            <BarChart3 className="w-6 h-6 mx-auto mb-1" />
            <div className="text-sm font-semibold">Fluxo de Caixa</div>
            <div className="text-xs opacity-90">Movimentações</div>
          </div>
        </Button>

        <Button className="h-20 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
          <div className="text-center">
            <Calculator className="w-6 h-6 mx-auto mb-1" />
            <div className="text-sm font-semibold">Impostos</div>
            <div className="text-xs opacity-90">Tributos</div>
          </div>
        </Button>

        <Button className="h-20 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
          <div className="text-center">
            <Users className="w-6 h-6 mx-auto mb-1" />
            <div className="text-sm font-semibold">Folha</div>
            <div className="text-xs opacity-90">Pagamento</div>
          </div>
        </Button>
      </div>

      {/* Reports List */}
      <Card className="bg-cinema-dark border-cinema-gray-light">
        <CardHeader>
          <CardTitle className="text-white">Relatórios Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-cinema-dark-lighter rounded-lg border border-cinema-gray-light/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cinema-yellow/20 rounded-lg">
                    <FileText className="w-5 h-5 text-cinema-yellow" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{report.name}</h4>
                    <p className="text-gray-400 text-sm">{report.period} • {report.type}</p>
                    <p className="text-gray-500 text-xs">
                      Gerado em: {new Date(report.generatedAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    report.status === "ready" ? "text-green-400 bg-green-400/20" :
                    report.status === "generating" ? "text-yellow-400 bg-yellow-400/20" :
                    "text-red-400 bg-red-400/20"
                  }`}>
                    {report.status === "ready" ? "Pronto" :
                     report.status === "generating" ? "Gerando..." : "Erro"}
                  </span>
                  {report.status === "ready" && report.downloadUrl && (
                    <Button size="sm" className="bg-cinema-yellow text-cinema-dark">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  )}
                  {report.status === "generating" && (
                    <div className="animate-spin">
                      <RefreshCw className="w-4 h-4 text-yellow-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const TaxesTab: React.FC = () => {
  const mockTaxes: TaxCalculation[] = [
    {
      name: "DAS - Simples Nacional",
      rate: 6.0,
      base: 15000,
      amount: 900,
      dueDate: "2025-02-20",
      paid: false,
    },
    {
      name: "ISS - Imposto sobre Serviços",
      rate: 5.0,
      base: 15000,
      amount: 750,
      dueDate: "2025-02-10",
      paid: false,
    },
    {
      name: "PIS",
      rate: 1.65,
      base: 15000,
      amount: 247.5,
      dueDate: "2025-02-25",
      paid: false,
    },
    {
      name: "COFINS",
      rate: 7.6,
      base: 15000,
      amount: 1140,
      dueDate: "2025-02-25",
      paid: false,
    },
  ];

  const totalTaxes = mockTaxes.reduce((sum, tax) => sum + tax.amount, 0);
  const overdueTaxes = mockTaxes.filter(tax => new Date(tax.dueDate) < new Date() && !tax.paid);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Gestão de Impostos</h3>
        <div className="flex space-x-2">
          <Button className="bg-green-500 text-white hover:bg-green-600">
            <Zap className="w-4 h-4 mr-2" />
            Calcular Automaticamente
          </Button>
          <Button variant="outline" className="text-cinema-yellow border-cinema-yellow">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Tax Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <Calculator className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-red-400">
              R$ {totalTaxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">Total de Impostos</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-yellow-400">{overdueTaxes.length}</p>
            <p className="text-gray-400 text-sm">Vencidos</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-blue-400">6.0%</p>
            <p className="text-gray-400 text-sm">Taxa Simples</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-green-400">
              R$ {(totalTaxes * 0.85).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">Economia Anual</p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Configuration */}
      <Card className="bg-cinema-dark border-cinema-gray-light">
        <CardHeader>
          <CardTitle className="text-white">Configuração Tributária</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Regime Tributário</Label>
              <Select defaultValue="simples">
                <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
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
              <Label className="text-white">CNAE Principal</Label>
              <Input
                defaultValue="7723 - Aluguel de objetos pessoais e domésticos"
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                readOnly
              />
            </div>
            <div>
              <Label className="text-white">Anexo Simples Nacional</Label>
              <Input
                defaultValue="Anexo III - Serviços"
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                readOnly
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Taxes Table */}
      <Card className="bg-cinema-dark border-cinema-gray-light">
        <CardHeader>
          <CardTitle className="text-white">Impostos do Mês</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-cinema-gray-light">
                <tr>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Imposto</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Alíquota</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Base Cálculo</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Valor</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Vencimento</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockTaxes.map((tax, index) => (
                  <tr key={index} className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter">
                    <td className="px-4 py-3 text-white font-medium">{tax.name}</td>
                    <td className="px-4 py-3 text-gray-400">{tax.rate}%</td>
                    <td className="px-4 py-3 text-gray-400">
                      R$ {tax.base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-red-400 font-medium">
                      R$ {tax.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{tax.dueDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        tax.paid ? "text-green-400 bg-green-400/20" :
                        new Date(tax.dueDate) < new Date() ? "text-red-400 bg-red-400/20" :
                        "text-yellow-400 bg-yellow-400/20"
                      }`}>
                        {tax.paid ? "Pago" :
                         new Date(tax.dueDate) < new Date() ? "Vencido" : "Pendente"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        {!tax.paid && (
                          <Button size="sm" className="bg-green-500 text-white hover:bg-green-600">
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="text-cinema-yellow border-cinema-yellow">
                          <FileText className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-blue-400 border-blue-400">
                          <Download className="w-3 h-3" />
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
  );
};
