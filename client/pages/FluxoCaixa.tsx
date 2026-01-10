import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  Plus,
  Wallet,
  CreditCard,
  Banknote,
  PiggyBank,
  Receipt,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  PieChart,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Tipos
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: Date;
  status: 'completed' | 'pending' | 'overdue';
  paymentMethod?: string;
  clientName?: string;
  orderId?: string;
}

// Dados mockados
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'income', category: 'Locação', description: 'Globo Filmes - Pedido #PED-001', amount: 5000, date: new Date(2026, 0, 10), status: 'completed', paymentMethod: 'PIX', clientName: 'Globo Filmes', orderId: 'PED-001' },
  { id: '2', type: 'income', category: 'Locação', description: 'MS Produções - Pedido #PED-002', amount: 900, date: new Date(2026, 0, 8), status: 'completed', paymentMethod: 'Cartão', clientName: 'MS Produções', orderId: 'PED-002' },
  { id: '3', type: 'expense', category: 'Manutenção', description: 'Reparo Sennheiser MKH', amount: 850, date: new Date(2026, 0, 9), status: 'completed', paymentMethod: 'Boleto' },
  { id: '4', type: 'income', category: 'Locação', description: 'Produtora XYZ - Pedido #PED-004', amount: 4500, date: new Date(2026, 0, 5), status: 'overdue', clientName: 'Produtora XYZ', orderId: 'PED-004' },
  { id: '5', type: 'expense', category: 'Aluguel', description: 'Aluguel do Galpão', amount: 3500, date: new Date(2026, 0, 5), status: 'completed', paymentMethod: 'Transferência' },
  { id: '6', type: 'income', category: 'Locação', description: 'Festival BH - Pedido #PED-005', amount: 480, date: new Date(2026, 0, 6), status: 'pending', clientName: 'Festival BH', orderId: 'PED-005' },
  { id: '7', type: 'expense', category: 'Funcionários', description: 'Folha de Pagamento', amount: 8500, date: new Date(2026, 0, 5), status: 'completed', paymentMethod: 'Transferência' },
  { id: '8', type: 'expense', category: 'Energia', description: 'Conta de Luz', amount: 650, date: new Date(2026, 0, 10), status: 'pending' },
  { id: '9', type: 'income', category: 'Locação', description: 'Ana Costa - Pedido #PED-003', amount: 3000, date: new Date(2026, 0, 15), status: 'pending', clientName: 'Ana Costa', orderId: 'PED-003' },
  { id: '10', type: 'expense', category: 'Marketing', description: 'Anúncios Instagram', amount: 500, date: new Date(2026, 0, 8), status: 'completed', paymentMethod: 'Cartão' },
];

// Resumo financeiro
const FINANCIAL_SUMMARY = {
  balance: 45680,
  monthIncome: 13880,
  monthExpense: 14000,
  pendingReceive: 7980,
  pendingPay: 650,
  overdue: 4500,
};

// Projeção
const PROJECTION = {
  nextMonth: {
    income: 18500,
    expense: 15000,
    balance: 49180,
  },
  categories: {
    income: [
      { name: 'Locações', value: 15000, percentage: 81 },
      { name: 'Vendas', value: 2500, percentage: 14 },
      { name: 'Outros', value: 1000, percentage: 5 },
    ],
    expense: [
      { name: 'Funcionários', value: 8500, percentage: 57 },
      { name: 'Aluguel', value: 3500, percentage: 23 },
      { name: 'Manutenção', value: 1500, percentage: 10 },
      { name: 'Outros', value: 1500, percentage: 10 },
    ]
  }
};

export default function FluxoCaixa() {
  const [period, setPeriod] = useState('month');
  const [filter, setFilter] = useState('all');

  // Filtrar transações
  const filteredTransactions = MOCK_TRANSACTIONS.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'income') return t.type === 'income';
    if (filter === 'expense') return t.type === 'expense';
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'overdue') return t.status === 'overdue';
    return true;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  // Status badge
  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400"><CheckCircle2 className="h-3 w-3 mr-1" />Pago</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500/20 text-red-400"><AlertTriangle className="h-3 w-3 mr-1" />Atrasado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Fluxo de Caixa</h1>
                <p className="text-sm text-slate-400">Controle financeiro completo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="year">Este Ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-slate-600">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Cards Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-950/50 to-green-950/50 border-emerald-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">Saldo Atual</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    R$ {FINANCIAL_SUMMARY.balance.toLocaleString('pt-BR')}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-emerald-400">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>+12.5% vs mês anterior</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <Wallet className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-950/50 to-teal-950/50 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">Entradas (Mês)</p>
                  <p className="text-2xl font-bold text-green-400">
                    R$ {FINANCIAL_SUMMARY.monthIncome.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    A receber: R$ {FINANCIAL_SUMMARY.pendingReceive.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-950/50 to-rose-950/50 border-red-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">Saídas (Mês)</p>
                  <p className="text-2xl font-bold text-red-400">
                    R$ {FINANCIAL_SUMMARY.monthExpense.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    A pagar: R$ {FINANCIAL_SUMMARY.pendingPay.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <TrendingDown className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-950/50 to-orange-950/50 border-amber-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">Inadimplência</p>
                  <p className="text-2xl font-bold text-amber-400">
                    R$ {FINANCIAL_SUMMARY.overdue.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">1 cliente em atraso</p>
                </div>
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos e Projeção */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fluxo Mensal */}
          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-400" />
                Fluxo de Caixa - Janeiro 2026
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Gráfico simplificado de barras */}
                <div className="flex gap-8">
                  <div className="flex-1">
                    <div className="flex items-end gap-2 h-40">
                      {[8500, 12000, 9500, 15000, 11000, 13880].map((value, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className="w-full bg-gradient-to-t from-green-600 to-emerald-400 rounded-t"
                            style={{ height: `${(value / 15000) * 100}%` }}
                          />
                          <span className="text-[10px] text-slate-500">S{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-sm text-slate-400 mt-2">Entradas por Semana</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-end gap-2 h-40">
                      {[5500, 8500, 6000, 9000, 7500, 14000].map((value, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className="w-full bg-gradient-to-t from-red-600 to-rose-400 rounded-t"
                            style={{ height: `${(value / 15000) * 100}%` }}
                          />
                          <span className="text-[10px] text-slate-500">S{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-sm text-slate-400 mt-2">Saídas por Semana</p>
                  </div>
                </div>

                {/* Resultado do mês */}
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-400">Resultado do Mês</p>
                    <p className={cn(
                      "text-xl font-bold",
                      FINANCIAL_SUMMARY.monthIncome - FINANCIAL_SUMMARY.monthExpense >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {FINANCIAL_SUMMARY.monthIncome - FINANCIAL_SUMMARY.monthExpense >= 0 ? '+' : ''}
                      R$ {(FINANCIAL_SUMMARY.monthIncome - FINANCIAL_SUMMARY.monthExpense).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Meta do Mês</p>
                    <p className="text-xl font-bold">R$ 5.000</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projeção */}
          <Card className="bg-gradient-to-br from-violet-950/30 to-purple-950/30 border-violet-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-violet-400" />
                Projeção Fevereiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Saldo Previsto</p>
                <p className="text-2xl font-bold text-violet-400">
                  R$ {PROJECTION.nextMonth.balance.toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">+ Entradas</span>
                  <span>R$ {PROJECTION.nextMonth.income.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">- Saídas</span>
                  <span>R$ {PROJECTION.nextMonth.expense.toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400 mb-2">Distribuição Receitas</p>
                {PROJECTION.categories.income.map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-1">
                    <Progress value={cat.percentage} className="h-1.5 flex-1" />
                    <span className="text-xs text-slate-400 w-20">{cat.name}</span>
                    <span className="text-xs">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transações */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-cyan-400" />
                Transações
              </CardTitle>
              <div className="flex gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-36 bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="income">Entradas</SelectItem>
                    <SelectItem value="expense">Saídas</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="overdue">Atrasados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredTransactions.map(transaction => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-lg",
                        transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                      )}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className={cn("h-5 w-5", transaction.type === 'income' ? 'text-green-400' : 'text-red-400')} />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{transaction.category}</span>
                          <span>•</span>
                          <span>{transaction.date.toLocaleDateString('pt-BR')}</span>
                          {transaction.paymentMethod && (
                            <>
                              <span>•</span>
                              <span>{transaction.paymentMethod}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(transaction.status)}
                      <p className={cn(
                        "text-lg font-bold min-w-[120px] text-right",
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      )}>
                        {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

