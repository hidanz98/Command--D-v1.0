import React, { useState, useEffect } from "react";
import { gerarFaturaPDF } from "./FaturaLocacao";
import { FaturaPDFEditor } from "./FaturaPDFEditor";
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
  Search,
  Building2,
  Download,
  Upload,
  Eye,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
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
  type: string;
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
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalType, setModalType] = useState<'view' | 'edit' | null>(null);
  const [showFaturaEditor, setShowFaturaEditor] = useState(false);

  const openModal = (transaction: Transaction, type: 'view' | 'edit') => {
    setSelectedTransaction(transaction);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
    setModalType(null);
  };
  
  return (
    <div className="space-y-4">
      {/* Header Moderno */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Contas a Receber</h3>
            <p className="text-zinc-500 text-xs">{receivables.length} registros</p>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/20">
          <Plus className="w-4 h-4" />
          Nova Receita
        </button>
      </div>

      {/* Filters - Compacto no Mobile */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 rounded-xl text-sm"
        >
          <option value="all">Todos</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="overdue">Vencido</option>
        </select>
      </div>

      {/* Summary Cards - Grid 2x2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/10 border border-emerald-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-400 text-xs">Recebido</span>
          </div>
          <p className="text-white font-bold">
            R$ {(receivables.filter(r => r.status === "paid").reduce((sum, r) => sum + r.amount, 0) / 1000).toFixed(1)}k
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-400 text-xs">A Receber</span>
          </div>
          <p className="text-white font-bold">
            R$ {(receivables.filter(r => r.status === "pending").reduce((sum, r) => sum + r.amount, 0) / 1000).toFixed(1)}k
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-rose-600/10 border border-red-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-zinc-400 text-xs">Atrasado</span>
          </div>
          <p className="text-white font-bold">
            R$ {(receivables.filter(r => r.status === "overdue").reduce((sum, r) => sum + r.amount, 0) / 1000).toFixed(1)}k
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/10 border border-blue-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-400 text-xs">Faturas</span>
          </div>
          <p className="text-white font-bold">{receivables.length}</p>
        </div>
      </div>

      {/* Lista de Transações - Cards Expansíveis */}
      <div className="space-y-2">
        {receivables
          .filter(r => filterStatus === 'all' || r.status === filterStatus)
          .filter(r => !searchTerm || r.description.toLowerCase().includes(searchTerm.toLowerCase()))
          .slice(0, 15)
          .map((transaction) => (
          <details key={transaction.id} className="group">
            <summary className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 hover:border-emerald-500/30 transition-colors cursor-pointer list-none">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{transaction.description}</p>
                  <p className="text-zinc-500 text-xs">{transaction.clientId || "Cliente"} • Venc: {transaction.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold text-sm">
                    R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    transaction.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                    transaction.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {transaction.status === 'paid' ? 'Pago' : 
                     transaction.status === 'overdue' ? 'Vencido' : 'Pendente'}
                  </span>
                </div>
              </div>
            </summary>
            
            {/* Área Expandida com Ações */}
            <div className="bg-zinc-800/30 border border-zinc-800 border-t-0 rounded-b-xl p-3 -mt-2 pt-4">
              {/* Detalhes */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div>
                  <span className="text-zinc-500">Categoria:</span>
                  <span className="text-white ml-1">{transaction.category}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Nº Fatura:</span>
                  <span className="text-white ml-1">{transaction.invoiceNumber || '-'}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Parcela:</span>
                  <span className="text-white ml-1">{transaction.currentInstallment}/{transaction.installments}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Data:</span>
                  <span className="text-white ml-1">{transaction.date}</span>
                </div>
              </div>
              
              {/* Botões de Ação */}
              <div className="flex flex-wrap gap-2">
                {transaction.status === 'pending' && (
                  <button 
                    onClick={() => onStatusUpdate(transaction.id, 'paid')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Marcar Pago
                  </button>
                )}
                {transaction.status === 'overdue' && (
                  <button 
                    onClick={() => onStatusUpdate(transaction.id, 'paid')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Marcar Pago
                  </button>
                )}
                {(transaction.status === 'pending' || transaction.status === 'overdue') && (
                  <button className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-colors">
                    <Send className="w-3 h-3" />
                    Cobrar
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); openModal(transaction, 'view'); }}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Ver
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); openModal(transaction, 'edit'); }}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                >
                  <Edit className="w-3 h-3" />
                  Editar
                </button>
              </div>
            </div>
          </details>
        ))}
      </div>

      {/* Modal Ver/Editar Receita */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h3 className="text-white font-bold">
                {modalType === 'view' ? 'Detalhes da Receita' : 'Editar Receita'}
              </h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {modalType === 'view' ? (
                <>
                  <div className="bg-zinc-800/50 rounded-xl p-4">
                    <p className="text-emerald-400 text-2xl font-bold">
                      R$ {selectedTransaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-zinc-400 text-sm">{selectedTransaction.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-zinc-800/30 rounded-lg p-3">
                      <p className="text-zinc-500 text-xs">Cliente</p>
                      <p className="text-white">{selectedTransaction.clientId || 'Não informado'}</p>
                    </div>
                    <div className="bg-zinc-800/30 rounded-lg p-3">
                      <p className="text-zinc-500 text-xs">Status</p>
                      <p className={`font-medium ${selectedTransaction.status === 'paid' ? 'text-emerald-400' : selectedTransaction.status === 'overdue' ? 'text-red-400' : 'text-amber-400'}`}>
                        {selectedTransaction.status === 'paid' ? 'Pago' : selectedTransaction.status === 'overdue' ? 'Vencido' : 'Pendente'}
                      </p>
                    </div>
                    <div className="bg-zinc-800/30 rounded-lg p-3">
                      <p className="text-zinc-500 text-xs">Categoria</p>
                      <p className="text-white">{selectedTransaction.category}</p>
                    </div>
                    <div className="bg-zinc-800/30 rounded-lg p-3">
                      <p className="text-zinc-500 text-xs">Vencimento</p>
                      <p className="text-white">{selectedTransaction.dueDate}</p>
                    </div>
                  </div>
                  {/* Botões de Ação */}
                  <div className="space-y-2">
                    {selectedTransaction.status !== 'paid' && (
                      <button onClick={() => { onStatusUpdate(selectedTransaction.id, 'paid'); closeModal(); }}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium">
                        ✓ Marcar como Pago
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        closeModal();
                        setShowFaturaEditor(true);
                      }}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-medium flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Gerar Fatura PDF
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="text-zinc-400 text-xs block mb-1">Descrição</label>
                      <input type="text" defaultValue={selectedTransaction.description}
                        className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm" />
                    </div>
                    <div>
                      <label className="text-zinc-400 text-xs block mb-1">Valor (R$)</label>
                      <input type="text" defaultValue={selectedTransaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm" />
                    </div>
                    <div>
                      <label className="text-zinc-400 text-xs block mb-1">Vencimento</label>
                      <input type="text" defaultValue={selectedTransaction.dueDate}
                        placeholder="AAAA-MM-DD"
                        className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm" />
                    </div>
                    <div>
                      <label className="text-zinc-400 text-xs block mb-1">Status</label>
                      <select defaultValue={selectedTransaction.status}
                        className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm appearance-none">
                        <option value="pending">Pendente</option>
                        <option value="paid">Pago</option>
                        <option value="overdue">Vencido</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button onClick={closeModal} className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-medium">Cancelar</button>
                    <button onClick={closeModal} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium">Salvar</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Editor de Fatura PDF */}
      {showFaturaEditor && selectedTransaction && (
        <FaturaPDFEditor
          dados={{
            clienteNome: selectedTransaction.clientId || '',
            clienteCNPJ: '',
            clienteEndereco: '',
            clienteBairro: '',
            clienteCEP: '',
            clienteMunicipio: '',
            clienteUF: 'MG',
            clienteTelefone: '',
            numeroFatura: selectedTransaction.invoiceNumber || '',
            dataEmissao: selectedTransaction.date,
            dataVencimento: selectedTransaction.dueDate,
            naturezaOperacao: 'Locação de Equipamentos',
            itens: [{
              descricao: selectedTransaction.description,
              quantidade: 1,
              valorUnitario: selectedTransaction.amount,
              valorTotal: selectedTransaction.amount,
            }],
            valorTotal: selectedTransaction.amount,
            observacoes: selectedTransaction.notes || '',
          }}
          onClose={() => setShowFaturaEditor(false)}
        />
      )}
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
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalType, setModalType] = useState<'view' | 'edit' | null>(null);

  const openModal = (transaction: Transaction, type: 'view' | 'edit') => {
    setSelectedTransaction(transaction);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
    setModalType(null);
  };
  
  return (
    <div className="space-y-4">
      {/* Header Moderno */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-600 rounded-xl flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Contas a Pagar</h3>
            <p className="text-zinc-500 text-xs">{payables.length} registros</p>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-red-500/20">
          <Plus className="w-4 h-4" />
          Nova Despesa
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 rounded-xl text-sm"
        >
          <option value="all">Todos</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="overdue">Vencido</option>
        </select>
      </div>

      {/* Summary Cards - Grid 2x2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-red-500/20 to-rose-600/10 border border-red-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-red-400" />
            <span className="text-zinc-400 text-xs">Pago</span>
          </div>
          <p className="text-white font-bold">
            R$ {(payables.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0) / 1000).toFixed(1)}k
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-400 text-xs">A Pagar</span>
          </div>
          <p className="text-white font-bold">
            R$ {(payables.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0) / 1000).toFixed(1)}k
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-600/10 border border-orange-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-zinc-400 text-xs">Atrasado</span>
          </div>
          <p className="text-white font-bold">
            R$ {(payables.filter(p => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0) / 1000).toFixed(1)}k
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-indigo-600/10 border border-purple-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-400 text-xs">Contas</span>
          </div>
          <p className="text-white font-bold">{payables.length}</p>
        </div>
      </div>

      {/* Lista de Transações - Cards Expansíveis */}
      <div className="space-y-2">
        {payables
          .filter(r => filterStatus === 'all' || r.status === filterStatus)
          .filter(r => !searchTerm || r.description.toLowerCase().includes(searchTerm.toLowerCase()))
          .slice(0, 15)
          .map((transaction) => (
          <details key={transaction.id} className="group">
            <summary className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 hover:border-red-500/30 transition-colors cursor-pointer list-none">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{transaction.description}</p>
                  <p className="text-zinc-500 text-xs">{transaction.supplierId || "Fornecedor"} • Venc: {transaction.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-bold text-sm">
                    R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    transaction.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                    transaction.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {transaction.status === 'paid' ? 'Pago' : 
                     transaction.status === 'overdue' ? 'Vencido' : 'Pendente'}
                  </span>
                </div>
              </div>
            </summary>
            
            {/* Área Expandida com Ações */}
            <div className="bg-zinc-800/30 border border-zinc-800 border-t-0 rounded-b-xl p-3 -mt-2 pt-4">
              {/* Detalhes */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div>
                  <span className="text-zinc-500">Categoria:</span>
                  <span className="text-white ml-1">{transaction.category}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Nº Nota:</span>
                  <span className="text-white ml-1">{transaction.invoiceNumber || '-'}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Parcela:</span>
                  <span className="text-white ml-1">{transaction.currentInstallment}/{transaction.installments}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Data:</span>
                  <span className="text-white ml-1">{transaction.date}</span>
                </div>
              </div>
              
              {/* Botões de Ação */}
              <div className="flex flex-wrap gap-2">
                {(transaction.status === 'pending' || transaction.status === 'overdue') && (
                  <button 
                    onClick={() => onStatusUpdate(transaction.id, 'paid')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Marcar Pago
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); openModal(transaction, 'view'); }}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Ver
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); openModal(transaction, 'edit'); }}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                >
                  <Edit className="w-3 h-3" />
                  Editar
                </button>
              </div>
            </div>
          </details>
        ))}
      </div>

      {/* Modal Ver/Editar Despesa */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h3 className="text-white font-bold">
                {modalType === 'view' ? 'Detalhes da Despesa' : 'Editar Despesa'}
              </h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {modalType === 'view' ? (
                <>
                  <div className="bg-zinc-800/50 rounded-xl p-4">
                    <p className="text-red-400 text-2xl font-bold">
                      R$ {selectedTransaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-zinc-400 text-sm">{selectedTransaction.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-zinc-800/30 rounded-lg p-3">
                      <p className="text-zinc-500 text-xs">Fornecedor</p>
                      <p className="text-white">{selectedTransaction.supplierId || 'Não informado'}</p>
                    </div>
                    <div className="bg-zinc-800/30 rounded-lg p-3">
                      <p className="text-zinc-500 text-xs">Status</p>
                      <p className={`font-medium ${selectedTransaction.status === 'paid' ? 'text-emerald-400' : selectedTransaction.status === 'overdue' ? 'text-red-400' : 'text-amber-400'}`}>
                        {selectedTransaction.status === 'paid' ? 'Pago' : selectedTransaction.status === 'overdue' ? 'Vencido' : 'Pendente'}
                      </p>
                    </div>
                    <div className="bg-zinc-800/30 rounded-lg p-3">
                      <p className="text-zinc-500 text-xs">Categoria</p>
                      <p className="text-white">{selectedTransaction.category}</p>
                    </div>
                    <div className="bg-zinc-800/30 rounded-lg p-3">
                      <p className="text-zinc-500 text-xs">Vencimento</p>
                      <p className="text-white">{selectedTransaction.dueDate}</p>
                    </div>
                  </div>
                  {selectedTransaction.status !== 'paid' && (
                    <button onClick={() => { onStatusUpdate(selectedTransaction.id, 'paid'); closeModal(); }}
                      className="w-full py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-medium">
                      ✓ Marcar como Pago
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="text-zinc-400 text-xs block mb-1">Descrição</label>
                      <input type="text" defaultValue={selectedTransaction.description}
                        className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm" />
                    </div>
                    <div>
                      <label className="text-zinc-400 text-xs block mb-1">Valor (R$)</label>
                      <input type="text" defaultValue={selectedTransaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm" />
                    </div>
                    <div>
                      <label className="text-zinc-400 text-xs block mb-1">Vencimento</label>
                      <input type="date" defaultValue={selectedTransaction.dueDate}
                        className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm" />
                    </div>
                    <div>
                      <label className="text-zinc-400 text-xs block mb-1">Status</label>
                      <select defaultValue={selectedTransaction.status}
                        className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm">
                        <option value="pending">Pendente</option>
                        <option value="paid">Pago</option>
                        <option value="overdue">Vencido</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button onClick={closeModal} className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-medium">Cancelar</button>
                    <button onClick={closeModal} className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-medium">Salvar</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
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
    <div className="space-y-4">
      {/* Header Moderno */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Fluxo de Caixa</h3>
            <p className="text-zinc-500 text-xs">Últimos 30 dias</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs"
          >
            <Download className="w-3 h-3" />
            CSV
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs"
          >
            <Printer className="w-3 h-3" />
            PDF
          </button>
        </div>
      </div>

      {/* Cash Flow Summary - Grid 2x2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/10 border border-emerald-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-400 text-xs">Entradas</span>
          </div>
          <p className="text-white font-bold">
            R$ {(totalReceived / 1000).toFixed(1)}k
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-rose-600/10 border border-red-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <MinusCircle className="w-4 h-4 text-red-400" />
            <span className="text-zinc-400 text-xs">Saídas</span>
          </div>
          <p className="text-white font-bold">
            R$ {(totalPaid / 1000).toFixed(1)}k
          </p>
        </div>

        <div className={`bg-gradient-to-br ${(totalReceived - totalPaid) >= 0 ? 'from-cyan-500/20 to-blue-600/10 border-cyan-500/20' : 'from-orange-500/20 to-red-600/10 border-orange-500/20'} border rounded-xl p-3`}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className={`w-4 h-4 ${(totalReceived - totalPaid) >= 0 ? 'text-cyan-400' : 'text-orange-400'}`} />
            <span className="text-zinc-400 text-xs">Saldo</span>
          </div>
          <p className="text-white font-bold">
            R$ {((totalReceived - totalPaid) / 1000).toFixed(1)}k
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-violet-600/10 border border-purple-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-400 text-xs">Projeção</span>
          </div>
          <p className="text-white font-bold">
            R$ {(((totalReceived + pendingIncome) - (totalPaid + pendingExpenses)) / 1000).toFixed(1)}k
          </p>
        </div>
      </div>

      {/* Gráfico Compacto para Mobile */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-medium text-sm">Últimos 7 dias</h4>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-full"></span> Entrada</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full"></span> Saída</span>
          </div>
        </div>
        
        {/* Mini Barras */}
        <div className="flex items-end justify-between gap-1 h-24 mb-2">
          {chartData.slice(-7).map((d, i) => {
            const maxVal = Math.max(...chartData.slice(-7).map(x => Math.max(x.income, x.expense)));
            const incomeH = maxVal > 0 ? (d.income / maxVal) * 80 : 0;
            const expenseH = maxVal > 0 ? (d.expense / maxVal) * 80 : 0;
            return (
              <div key={i} className="flex-1 flex items-end gap-0.5">
                <div 
                  className="flex-1 bg-emerald-400/80 rounded-t-sm" 
                  style={{ height: `${incomeH}px` }}
                ></div>
                <div 
                  className="flex-1 bg-red-400/80 rounded-t-sm" 
                  style={{ height: `${expenseH}px` }}
                ></div>
              </div>
            );
          })}
        </div>
        
        {/* Dias da semana */}
        <div className="flex justify-between text-[9px] text-zinc-500">
          {chartData.slice(-7).map((d, i) => (
            <span key={i}>{d.date.split('-')[2]}</span>
          ))}
        </div>
      </div>

      {/* Movimentações Recentes */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <h4 className="text-white font-medium text-sm mb-3">Movimentações</h4>
        <div className="space-y-2">
          {chartData.slice(-5).reverse().filter(d => d.income > 0 || d.expense > 0).slice(0, 5).map((d, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${d.income > d.expense ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                  {d.income > d.expense ? (
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <MinusCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-white text-xs font-medium">
                    {d.date.split('-')[2]}/{d.date.split('-')[1]}
                  </p>
                  <p className="text-zinc-500 text-[10px]">
                    Saldo: R$ {d.balance.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {d.income > 0 && (
                  <p className="text-emerald-400 text-xs font-medium">
                    +R$ {(d.income / 1000).toFixed(1)}k
                  </p>
                )}
                {d.expense > 0 && (
                  <p className="text-red-400 text-xs">
                    -R$ {(d.expense / 1000).toFixed(1)}k
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico Desktop (escondido no mobile) */}
      <div className="hidden md:block bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <h4 className="text-white font-medium text-sm mb-4">Evolução (30 dias)</h4>
        <div className="h-48">
          <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="xMidYMid meet">
            {/* Bars */}
            {chartData.map((d, i) => {
              const x = (i * 1000) / 30;
              const barWidth = 1000 / 30 / 2.5;
              const incomeHeight = maxValue > 0 ? (d.income / maxValue) * 180 : 0;
              const expenseHeight = maxValue > 0 ? (d.expense / maxValue) * 180 : 0;

              return (
                <g key={i}>
                  <rect x={x} y={200 - incomeHeight} width={barWidth} height={incomeHeight} fill="#4ade80" opacity="0.8" rx="1" />
                  <rect x={x + barWidth + 1} y={200 - expenseHeight} width={barWidth} height={expenseHeight} fill="#f87171" opacity="0.8" rx="1" />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Tabela de Transações Desktop */}
      <div className="hidden md:block bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <h4 className="text-white font-medium text-sm mb-3">Transações Recentes</h4>
        <div className="space-y-2">
          {transactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${transaction.type === "income" ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                  {transaction.type === "income" ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{transaction.description}</p>
                  <p className="text-zinc-500 text-xs">{transaction.date}</p>
                </div>
              </div>
              <p className={`font-bold text-sm ${transaction.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                {transaction.type === "income" ? "+" : "-"}R$ {(transaction.amount / 1000).toFixed(1)}k
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const EmployeesTab: React.FC<{ employees: Employee[] }> = ({ employees }) => {
  const activeEmployees = employees.filter(e => e.status === "active");
  const totalSalaries = activeEmployees.reduce((sum, e) => sum + e.grossSalary, 0);

  return (
    <div className="space-y-4">
      {/* Header Moderno */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Equipe</h3>
            <p className="text-zinc-500 text-xs">{employees.length} funcionários</p>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-cyan-500/20">
          <Plus className="w-4 h-4" />
          Novo
        </button>
      </div>

      {/* Summary Cards - Grid 2x2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/10 border border-blue-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-400 text-xs">Ativos</span>
          </div>
          <p className="text-white font-bold">{activeEmployees.length}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/10 border border-emerald-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-400 text-xs">Folha</span>
          </div>
          <p className="text-white font-bold">
            R$ {(totalSalaries / 1000).toFixed(1)}k
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-400 text-xs">Férias</span>
          </div>
          <p className="text-white font-bold">
            {employees.filter(e => e.status === "vacation").length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-violet-600/10 border border-purple-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-400 text-xs">Média</span>
          </div>
          <p className="text-white font-bold">
            R$ {((totalSalaries / activeEmployees.length) / 1000).toFixed(1)}k
          </p>
        </div>
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
    <div className="space-y-4">
      {/* Header Moderno */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-600 rounded-xl flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Folha de Pagamento</h3>
            <p className="text-zinc-500 text-xs">{currentMonth}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Aprovar
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs">
            <Download className="w-3 h-3" />
            Exportar
          </button>
        </div>
      </div>

      {/* Payroll Summary - Grid 2x2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/10 border border-blue-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-400 text-xs">Func.</span>
          </div>
          <p className="text-white font-bold">{activeEmployees.length}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/10 border border-emerald-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-400 text-xs">Bruto</span>
          </div>
          <p className="text-white font-bold">
            R$ {(totalGrossPay / 1000).toFixed(1)}k
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-rose-600/10 border border-red-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <MinusCircle className="w-4 h-4 text-red-400" />
            <span className="text-zinc-400 text-xs">Descontos</span>
          </div>
          <p className="text-white font-bold">
            R$ {(totalDeductions / 1000).toFixed(1)}k
          </p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-400 text-xs">Líquido</span>
          </div>
          <p className="text-white font-bold">
            R$ {(totalNetPay / 1000).toFixed(1)}k
          </p>
        </div>
      </div>

      {/* Payroll List - Cards no Mobile */}
      <div className="space-y-2">
        {mockPayroll.map((payroll) => (
          <div key={payroll.employeeId} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 hover:border-pink-500/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{payroll.employeeName}</p>
                <p className="text-zinc-500 text-xs">Base: R$ {payroll.baseSalary.toLocaleString('pt-BR')}</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 font-bold text-sm">
                  R$ {payroll.netPay.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
                <span className="text-[10px] text-zinc-500">Líquido</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela Desktop (escondida) */}
      <div className="hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-zinc-700">
              <tr>
                <th className="px-4 py-3 text-left text-amber-400 font-medium text-xs">Funcionário</th>
                <th className="px-4 py-3 text-left text-amber-400 font-medium text-xs">Base</th>
                <th className="px-4 py-3 text-left text-amber-400 font-medium text-xs">Benefícios</th>
                <th className="px-4 py-3 text-left text-amber-400 font-medium text-xs">Bruto</th>
                <th className="px-4 py-3 text-left text-amber-400 font-medium text-xs">INSS</th>
                <th className="px-4 py-3 text-left text-amber-400 font-medium text-xs">IRRF</th>
                <th className="px-4 py-3 text-left text-amber-400 font-medium text-xs">Outros</th>
                <th className="px-4 py-3 text-left text-amber-400 font-medium text-xs">Líquido</th>
                <th className="px-4 py-3 text-left text-amber-400 font-medium text-xs">Ações</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
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
    <div className="space-y-4">
      {/* Header Moderno */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Relatórios</h3>
            <p className="text-zinc-500 text-xs">Análises financeiras</p>
          </div>
        </div>
      </div>

      {/* Quick Reports - Grid 2x2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 rounded-xl text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95">
          <FileText className="w-6 h-6" />
          <span className="text-xs font-medium">DRE</span>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 rounded-xl text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
          <BarChart3 className="w-6 h-6" />
          <span className="text-xs font-medium">Fluxo</span>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 rounded-xl text-white shadow-lg shadow-purple-500/20 transition-all active:scale-95">
          <Calculator className="w-6 h-6" />
          <span className="text-xs font-medium">Impostos</span>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 rounded-xl text-white shadow-lg shadow-orange-500/20 transition-all active:scale-95">
          <Users className="w-6 h-6" />
          <span className="text-xs font-medium">Folha</span>
        </button>
      </div>

      {/* Reports List */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <h4 className="text-white font-medium text-sm mb-3">Relatórios Disponíveis</h4>
        <div className="space-y-2">
          {mockReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-teal-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">{report.name}</h4>
                  <p className="text-zinc-500 text-xs">{report.period}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  report.status === "ready" ? "text-emerald-400 bg-emerald-500/20" :
                  report.status === "generating" ? "text-amber-400 bg-amber-500/20" :
                  "text-red-400 bg-red-500/20"
                }`}>
                  {report.status === "ready" ? "Pronto" :
                   report.status === "generating" ? "Gerando" : "Erro"}
                </span>
                {report.status === "ready" && (
                  <button className="p-1.5 bg-teal-500/20 rounded-lg hover:bg-teal-500/30 transition-colors">
                    <Download className="w-3 h-3 text-teal-400" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TaxesTab: React.FC = () => {
  // ===========================================
  // 🏆 SISTEMA DE IMPOSTOS PROFISSIONAL
  // Integrado com BrasilAPI para dados do CNPJ
  // ===========================================

  // Tabela do Simples Nacional - Anexo III (Serviços)
  const SIMPLES_ANEXO_III = [
    { faixa: 1, limiteInferior: 0, limiteSuperior: 180000, aliquota: 6.00, deducao: 0 },
    { faixa: 2, limiteInferior: 180000.01, limiteSuperior: 360000, aliquota: 11.20, deducao: 9360 },
    { faixa: 3, limiteInferior: 360000.01, limiteSuperior: 720000, aliquota: 13.50, deducao: 17640 },
    { faixa: 4, limiteInferior: 720000.01, limiteSuperior: 1800000, aliquota: 16.00, deducao: 35640 },
    { faixa: 5, limiteInferior: 1800000.01, limiteSuperior: 3600000, aliquota: 21.00, deducao: 125640 },
    { faixa: 6, limiteInferior: 3600000.01, limiteSuperior: 4800000, aliquota: 33.00, deducao: 648000 },
  ];

  // Estado com histórico de faturamento (12 meses)
  const [taxConfig, setTaxConfig] = useState(() => {
    const saved = localStorage.getItem('taxConfig_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.historicoFaturamento || !Array.isArray(parsed.historicoFaturamento)) {
          parsed.historicoFaturamento = Array(12).fill(15000);
        }
        return parsed;
      } catch {
        return getDefaultTaxConfig();
      }
    }
    return getDefaultTaxConfig();
  });

  function getDefaultTaxConfig() {
    return {
      cnpj: '',
      razaoSocial: '',
      porte: '',
      cnae: '',
      cnaDescricao: '',
      cidade: '',
      uf: '',
      optanteSimples: false,
      regime: 'simples',
      faturamentoMensal: 15000,
      folhaDePagamento: 5000,
      historicoFaturamento: Array(12).fill(15000),
      issRate: 5.0,
      calcularAutomatico: true,
      dataConsultaCNPJ: null,
    };
  }

  const [taxes, setTaxes] = useState<TaxCalculation[]>([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isFetchingCNPJ, setIsFetchingCNPJ] = useState(false);
  const [cnpjInput, setCnpjInput] = useState(taxConfig.cnpj || '');

  // Buscar dados do CNPJ via BrasilAPI
  const buscarDadosCNPJ = async () => {
    const cnpjLimpo = cnpjInput.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) {
      alert('❌ CNPJ inválido! Digite 14 números.');
      return;
    }

    setIsFetchingCNPJ(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      if (!response.ok) {
        throw new Error('CNPJ não encontrado');
      }
      const data = await response.json();
      
      // Determinar regime baseado nos dados
      let regime = 'presumido';
      if (data.opcao_pelo_simples) {
        regime = 'simples';
      }
      
      // ISS por cidade (BH = 5%, SP = 2% a 5%, etc)
      let issRate = 5.0;
      if (data.municipio === 'SAO PAULO') issRate = 5.0;
      if (data.municipio === 'RIO DE JANEIRO') issRate = 5.0;
      if (data.municipio === 'BELO HORIZONTE') issRate = 5.0;

      setTaxConfig(prev => ({
        ...prev,
        cnpj: cnpjLimpo,
        razaoSocial: data.razao_social || '',
        porte: data.porte || '',
        cnae: data.cnae_fiscal?.toString() || '',
        cnaeDescricao: data.cnae_fiscal_descricao || '',
        cidade: data.municipio || '',
        uf: data.uf || '',
        optanteSimples: data.opcao_pelo_simples || false,
        regime: regime,
        issRate: issRate,
        dataConsultaCNPJ: new Date().toISOString(),
      }));

      alert(`✅ CNPJ ENCONTRADO!\n\n📋 ${data.razao_social}\n🏢 Porte: ${data.porte}\n📍 ${data.municipio}/${data.uf}\n💼 Simples Nacional: ${data.opcao_pelo_simples ? 'SIM ✅' : 'NÃO ❌'}\n🏭 CNAE: ${data.cnae_fiscal_descricao}`);
    } catch (error) {
      alert('❌ Erro ao buscar CNPJ. Verifique se o número está correto.');
    } finally {
      setIsFetchingCNPJ(false);
    }
  };

  // Formatar CNPJ
  const formatarCNPJ = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 14) {
      return numeros
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return valor;
  };

  // Salvar configurações no localStorage
  useEffect(() => {
    localStorage.setItem('taxConfig_v3', JSON.stringify(taxConfig));
  }, [taxConfig]);

  // Calcular RBT12 (Receita Bruta Total dos últimos 12 meses)
  const calcularRBT12 = (): number => {
    if (!taxConfig.historicoFaturamento || !Array.isArray(taxConfig.historicoFaturamento)) {
      return taxConfig.faturamentoMensal * 12;
    }
    return taxConfig.historicoFaturamento.reduce((sum: number, val: number) => sum + (val || 0), 0);
  };

  // Calcular Fator R (Folha de Pagamento / RBT12)
  const calcularFatorR = (): number => {
    const rbt12 = calcularRBT12();
    if (rbt12 === 0) return 0;
    const folhaAnual = (taxConfig.folhaDePagamento || 0) * 12;
    return (folhaAnual / rbt12) * 100;
  };

  // Encontrar faixa do Simples Nacional
  const encontrarFaixaSimples = (rbt12: number) => {
    return SIMPLES_ANEXO_III.find(f => rbt12 >= f.limiteInferior && rbt12 <= f.limiteSuperior) || SIMPLES_ANEXO_III[0];
  };

  // Calcular alíquota efetiva do Simples Nacional
  const calcularAliquotaEfetiva = (): number => {
    const rbt12 = calcularRBT12();
    const faixa = encontrarFaixaSimples(rbt12);
    
    if (rbt12 === 0) return faixa.aliquota;
    
    // Fórmula: [(RBT12 × Aliq) - PD] / RBT12
    const aliquotaEfetiva = ((rbt12 * (faixa.aliquota / 100)) - faixa.deducao) / rbt12 * 100;
    return Math.max(aliquotaEfetiva, 0);
  };

  // Função principal de cálculo de impostos
  const calcularImpostos = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const base = taxConfig.faturamentoMensal;
      const hoje = new Date();
      const rbt12 = calcularRBT12();
      const fatorR = calcularFatorR();
      const aliquotaEfetiva = calcularAliquotaEfetiva();
      const faixa = encontrarFaixaSimples(rbt12);
      
      let novosImpostos: TaxCalculation[] = [];

      if (taxConfig.regime === 'simples') {
        // ============================================
        // SIMPLES NACIONAL - Anexo III (Serviços)
        // ============================================
        const valorDAS = base * (aliquotaEfetiva / 100);
        
        novosImpostos = [
          {
            name: `DAS - Simples Nacional (Faixa ${faixa.faixa})`,
            rate: aliquotaEfetiva,
            base: base,
            amount: valorDAS,
            dueDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 20).toISOString().split('T')[0],
            paid: false,
          },
        ];

        // Detalhamento dos tributos dentro do DAS
        const detalhamento = [
          { nome: 'IRPJ', percentual: 4.00 },
          { nome: 'CSLL', percentual: 3.50 },
          { nome: 'COFINS', percentual: 12.82 },
          { nome: 'PIS', percentual: 2.78 },
          { nome: 'CPP', percentual: 43.40 },
          { nome: 'ISS', percentual: 33.50 },
        ];

      } else if (taxConfig.regime === 'presumido') {
        // ============================================
        // LUCRO PRESUMIDO
        // ============================================
        const basePresuncao = base * 0.32; // 32% para serviços
        
        novosImpostos = [
          {
            name: "ISS - Imposto sobre Serviços (Municipal)",
            rate: taxConfig.issRate,
            base: base,
            amount: base * (taxConfig.issRate / 100),
            dueDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 10).toISOString().split('T')[0],
            paid: false,
          },
          {
            name: "PIS (Cumulativo)",
            rate: 0.65,
            base: base,
            amount: base * 0.0065,
            dueDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 25).toISOString().split('T')[0],
            paid: false,
          },
          {
            name: "COFINS (Cumulativo)",
            rate: 3.00,
            base: base,
            amount: base * 0.03,
            dueDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 25).toISOString().split('T')[0],
            paid: false,
          },
          {
            name: "IRPJ (15% sobre 32%)",
            rate: 15,
            base: basePresuncao,
            amount: basePresuncao * 0.15,
            dueDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 30).toISOString().split('T')[0],
            paid: false,
          },
          {
            name: "CSLL (9% sobre 32%)",
            rate: 9,
            base: basePresuncao,
            amount: basePresuncao * 0.09,
            dueDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 30).toISOString().split('T')[0],
            paid: false,
          },
        ];
      } else {
        // ============================================
        // LUCRO REAL
        // ============================================
        const lucroEstimado = base * 0.20; // Estimativa de 20% de lucro
        
        novosImpostos = [
          {
            name: "ISS (Municipal)",
            rate: taxConfig.issRate,
            base: base,
            amount: base * (taxConfig.issRate / 100),
            dueDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 10).toISOString().split('T')[0],
            paid: false,
          },
          {
            name: "PIS (Não-cumulativo)",
            rate: 1.65,
            base: base,
            amount: base * 0.0165,
            dueDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 25).toISOString().split('T')[0],
            paid: false,
          },
          {
            name: "COFINS (Não-cumulativo)",
            rate: 7.60,
            base: base,
            amount: base * 0.076,
            dueDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 25).toISOString().split('T')[0],
            paid: false,
          },
          {
            name: "IRPJ (15% sobre lucro real)",
            rate: 15,
            base: lucroEstimado,
            amount: lucroEstimado * 0.15,
            dueDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 30).toISOString().split('T')[0],
            paid: false,
          },
          {
            name: "Adicional IRPJ (10%)",
            rate: 10,
            base: Math.max(lucroEstimado - 20000, 0),
            amount: Math.max(lucroEstimado - 20000, 0) * 0.10,
            dueDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 30).toISOString().split('T')[0],
            paid: false,
          },
          {
            name: "CSLL (9% sobre lucro real)",
            rate: 9,
            base: lucroEstimado,
            amount: lucroEstimado * 0.09,
            dueDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 30).toISOString().split('T')[0],
            paid: false,
          },
        ];
      }

      setTaxes(novosImpostos);
      localStorage.setItem('calculatedTaxes', JSON.stringify(novosImpostos));
      setIsCalculating(false);
      
      const totalImpostos = novosImpostos.reduce((s, t) => s + t.amount, 0);
      const cargaTributaria = (totalImpostos / base) * 100;
      
      alert(`✅ IMPOSTOS CALCULADOS COM SUCESSO!\n\n📊 RESUMO:\n• Regime: ${taxConfig.regime.toUpperCase()}\n• Faturamento: R$ ${base.toLocaleString('pt-BR')}\n• RBT12: R$ ${rbt12.toLocaleString('pt-BR')}\n${taxConfig.regime === 'simples' ? `• Faixa: ${faixa.faixa}ª\n• Alíquota Nominal: ${faixa.aliquota}%\n• Alíquota Efetiva: ${aliquotaEfetiva.toFixed(2)}%\n• Fator R: ${fatorR.toFixed(2)}%` : ''}\n\n💰 TOTAL A PAGAR: R$ ${totalImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n📈 Carga Tributária: ${cargaTributaria.toFixed(2)}%`);
    }, 500);
  };

  // Carregar impostos salvos
  useEffect(() => {
    const saved = localStorage.getItem('calculatedTaxes');
    if (saved) {
      try {
        setTaxes(JSON.parse(saved));
      } catch {
        // Usar mock se não houver dados salvos
      }
    }
  }, []);

  // Marcar imposto como pago
  const marcarComoPago = (index: number) => {
    const novosTaxes = [...taxes];
    novosTaxes[index].paid = !novosTaxes[index].paid;
    setTaxes(novosTaxes);
    localStorage.setItem('calculatedTaxes', JSON.stringify(novosTaxes));
  };

  // Salvar configurações
  const salvarConfig = () => {
    localStorage.setItem('taxConfig_v3', JSON.stringify(taxConfig));
    setShowConfigModal(false);
    
    const rbt12 = calcularRBT12();
    const aliquota = calcularAliquotaEfetiva();
    alert(`✅ Configurações salvas!\n\n📊 Resumo:\n• Faturamento Mensal: R$ ${taxConfig.faturamentoMensal.toLocaleString('pt-BR')}\n• RBT12: R$ ${rbt12.toLocaleString('pt-BR')}\n• Alíquota Efetiva: ${aliquota.toFixed(2)}%`);
  };

  const totalTaxes = taxes.reduce((sum, tax) => sum + tax.amount, 0);
  const overdueTaxes = taxes.filter(tax => new Date(tax.dueDate) < new Date() && !tax.paid);
  const paidTaxes = taxes.filter(tax => tax.paid);

  return (
    <div className="space-y-6">
      {/* Modal de Configuração */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 pt-20" style={{ zIndex: 9999 }}>
          <Card className="bg-cinema-dark border-cinema-gray-light w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>⚙️ Configuração de Impostos</span>
                <Button variant="ghost" size="sm" onClick={() => setShowConfigModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CNPJ com integração BrasilAPI */}
              <div className="p-4 bg-cinema-gray rounded-lg border border-cinema-yellow/30">
                <Label className="text-cinema-yellow font-semibold text-lg mb-2 block">
                  🔍 Buscar Dados do CNPJ (BrasilAPI)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={cnpjInput}
                    onChange={(e) => setCnpjInput(formatarCNPJ(e.target.value))}
                    placeholder="00.000.000/0000-00"
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white flex-1"
                    maxLength={18}
                  />
                  <Button 
                    onClick={buscarDadosCNPJ}
                    disabled={isFetchingCNPJ}
                    className="bg-cinema-yellow text-cinema-dark hover:bg-yellow-400"
                  >
                    {isFetchingCNPJ ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-1" />
                        Buscar
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Dados do CNPJ encontrado */}
                {taxConfig.razaoSocial && (
                  <div className="mt-3 p-3 bg-green-900/30 rounded border border-green-500/50">
                    <p className="text-green-400 font-semibold">{taxConfig.razaoSocial}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <p className="text-gray-300">📍 {taxConfig.cidade}/{taxConfig.uf}</p>
                      <p className="text-gray-300">🏢 {taxConfig.porte}</p>
                      <p className="text-gray-300">💼 Simples: {taxConfig.optanteSimples ? '✅ SIM' : '❌ NÃO'}</p>
                      <p className="text-gray-300">🏭 CNAE: {taxConfig.cnae}</p>
                    </div>
                    <p className="text-gray-400 text-xs mt-2">{taxConfig.cnaeDescricao}</p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-white">Regime Tributário</Label>
                <Select 
                  value={taxConfig.regime} 
                  onValueChange={(v) => setTaxConfig({...taxConfig, regime: v})}
                >
                  <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simples">Simples Nacional (Anexo III)</SelectItem>
                    <SelectItem value="presumido">Lucro Presumido</SelectItem>
                    <SelectItem value="real">Lucro Real</SelectItem>
                  </SelectContent>
                </Select>
                {taxConfig.optanteSimples && taxConfig.regime !== 'simples' && (
                  <p className="text-yellow-400 text-xs mt-1">⚠️ Empresa é optante do Simples Nacional!</p>
                )}
              </div>

              <div>
                <Label className="text-white">Faturamento Mensal Médio (R$)</Label>
                <Input
                  type="number"
                  value={taxConfig.faturamentoMensal}
                  onChange={(e) => {
                    const valor = parseFloat(e.target.value) || 0;
                    // Atualiza o histórico com o mesmo valor para todos os 12 meses
                    setTaxConfig({
                      ...taxConfig, 
                      faturamentoMensal: valor,
                      historicoFaturamento: Array(12).fill(valor)
                    });
                  }}
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                />
                <p className="text-gray-400 text-xs mt-1">
                  RBT12 (12 meses): R$ {((taxConfig.faturamentoMensal || 0) * 12).toLocaleString('pt-BR')}
                </p>
              </div>

              {taxConfig.regime === 'simples' && (
                <>
                  <div>
                    <Label className="text-white">Folha de Pagamento Mensal (R$)</Label>
                    <Input
                      type="number"
                      value={taxConfig.folhaDePagamento || 0}
                      onChange={(e) => setTaxConfig({...taxConfig, folhaDePagamento: parseFloat(e.target.value) || 0})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      Fator R: {(((taxConfig.folhaDePagamento || 0) * 12) / ((taxConfig.faturamentoMensal || 1) * 12) * 100).toFixed(2)}%
                      {((taxConfig.folhaDePagamento || 0) * 12) / ((taxConfig.faturamentoMensal || 1) * 12) >= 0.28 ? ' ✅ Anexo III' : ' ⚠️ Pode ser Anexo V'}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-900/30 rounded border border-blue-500/50">
                    <p className="text-blue-400 font-semibold mb-2">📊 Cálculo Automático</p>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>• RBT12: R$ {((taxConfig.faturamentoMensal || 0) * 12).toLocaleString('pt-BR')}</p>
                      <p>• Faixa: {encontrarFaixaSimples((taxConfig.faturamentoMensal || 0) * 12).faixa}ª</p>
                      <p>• Alíquota Nominal: {encontrarFaixaSimples((taxConfig.faturamentoMensal || 0) * 12).aliquota}%</p>
                      <p>• Alíquota Efetiva: <span className="text-cinema-yellow font-bold">{calcularAliquotaEfetiva().toFixed(2)}%</span></p>
                    </div>
                  </div>
                </>
              )}

              {taxConfig.regime !== 'simples' && (
                <>
                  <div>
                    <Label className="text-white">Alíquota ISS (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={taxConfig.issRate}
                      onChange={(e) => setTaxConfig({...taxConfig, issRate: parseFloat(e.target.value) || 0})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                    <p className="text-gray-400 text-xs mt-1">Varia de 2% a 5% conforme município</p>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={salvarConfig} className="flex-1 bg-cinema-yellow text-cinema-dark">
                  Salvar Configurações
                </Button>
                <Button onClick={() => setShowConfigModal(false)} variant="outline" className="flex-1 text-white border-cinema-gray-light">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-4">
        <h3 className="text-xl font-bold text-white">Gestão de Impostos</h3>
        <div className="flex flex-wrap gap-2">
          <Button 
            className="bg-green-500 text-white hover:bg-green-600"
            onClick={calcularImpostos}
            disabled={isCalculating}
          >
            {isCalculating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {isCalculating ? 'Calculando...' : 'Calcular Automaticamente'}
          </Button>
          <Button 
            variant="outline" 
            className="text-cinema-yellow border-cinema-yellow"
            onClick={() => setShowConfigModal(true)}
          >
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
            <p className="text-lg font-bold text-blue-400">{taxConfig.regime.toUpperCase()}</p>
            <p className="text-gray-400 text-sm">Regime Atual</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-green-400">{paidTaxes.length}</p>
            <p className="text-gray-400 text-sm">Pagos</p>
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
                {taxes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      <Calculator className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum imposto calculado</p>
                      <p className="text-sm">Clique em "Calcular Automaticamente" para gerar os impostos do mês</p>
                    </td>
                  </tr>
                ) : (
                  taxes.map((tax, index) => (
                    <tr key={index} className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter">
                      <td className="px-4 py-3 text-white font-medium">{tax.name}</td>
                      <td className="px-4 py-3 text-gray-400">{tax.rate}%</td>
                      <td className="px-4 py-3 text-gray-400">
                        R$ {tax.base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-4 py-3 font-medium ${tax.paid ? 'text-green-400 line-through' : 'text-red-400'}`}>
                        R$ {tax.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(tax.dueDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          tax.paid ? "text-green-400 bg-green-400/20" :
                          new Date(tax.dueDate) < new Date() ? "text-red-400 bg-red-400/20" :
                          "text-yellow-400 bg-yellow-400/20"
                        }`}>
                          {tax.paid ? "✓ Pago" :
                           new Date(tax.dueDate) < new Date() ? "⚠ Vencido" : "⏳ Pendente"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className={tax.paid ? "bg-gray-500 text-white" : "bg-green-500 text-white hover:bg-green-600"}
                            onClick={() => marcarComoPago(index)}
                            title={tax.paid ? "Marcar como não pago" : "Marcar como pago"}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-cinema-yellow border-cinema-yellow" title="Gerar guia">
                            <FileText className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-blue-400 border-blue-400" title="Download">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
