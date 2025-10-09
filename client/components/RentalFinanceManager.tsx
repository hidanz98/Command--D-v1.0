import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  FileText,
  Calculator,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  HandCoins,
  FileBarChart,
  Printer,
  Eye,
  Banknote,
  RefreshCw,
  Building,
  Users,
  Package,
} from "lucide-react";

// Interfaces
interface RentalIncome {
  id: string;
  orderId: string;
  clientName: string;
  equipment: string[];
  totalValue: number;
  paid: number;
  pending: number;
  status: "pago" | "parcial" | "pendente" | "atrasado";
  rentalDate: string;
  returnDate: string;
  paymentMethod: string;
  installments?: number;
  currentInstallment?: number;
}

interface Expense {
  id: string;
  category: string;
  description: string;
  value: number;
  date: string;
  status: "pago" | "pendente";
  supplier?: string;
  paymentMethod?: string;
}

interface CashFlowItem {
  date: string;
  type: "receita" | "despesa";
  category: string;
  description: string;
  value: number;
  balance: number;
}

const RentalFinanceManager: React.FC = () => {
  // Estados
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [filterPeriod, setFilterPeriod] = useState("mes");
  const [searchTerm, setSearchTerm] = useState("");

  // Dados de exemplo (em produção, viriam do backend)
  const [rentalsIncome] = useState<RentalIncome[]>([
    {
      id: "1",
      orderId: "005067",
      clientName: "Otávio Almeida de Souza",
      equipment: ["Sony FX6", "KIT COOKE SP3"],
      totalValue: 1200.00,
      paid: 1200.00,
      pending: 0,
      status: "pago",
      rentalDate: "2025-01-15",
      returnDate: "2025-01-17",
      paymentMethod: "PIX",
    },
    {
      id: "2",
      orderId: "005068",
      clientName: "Maria Santos",
      equipment: ["Canon EOS R5C", "Lente 50mm"],
      totalValue: 850.00,
      paid: 425.00,
      pending: 425.00,
      status: "parcial",
      rentalDate: "2025-01-18",
      returnDate: "2025-01-20",
      paymentMethod: "Cartão de Crédito",
      installments: 2,
      currentInstallment: 1,
    },
    {
      id: "3",
      orderId: "005069",
      clientName: "Pedro Costa",
      equipment: ["Blackmagic URSA", "Tripé Profissional"],
      totalValue: 1500.00,
      paid: 0,
      pending: 1500.00,
      status: "pendente",
      rentalDate: "2025-01-20",
      returnDate: "2025-01-22",
      paymentMethod: "Boleto",
    },
    {
      id: "4",
      orderId: "005070",
      clientName: "Ana Oliveira",
      equipment: ["RED Komodo 6K"],
      totalValue: 950.00,
      paid: 0,
      pending: 950.00,
      status: "atrasado",
      rentalDate: "2025-01-10",
      returnDate: "2025-01-12",
      paymentMethod: "Transferência",
    },
  ]);

  const [expenses] = useState<Expense[]>([
    {
      id: "1",
      category: "Manutenção",
      description: "Manutenção preventiva equipamentos",
      value: 450.00,
      date: "2025-01-10",
      status: "pago",
      supplier: "TechService Ltda",
      paymentMethod: "PIX",
    },
    {
      id: "2",
      category: "Compras",
      description: "Bateria Sony NP-FZ100",
      value: 380.00,
      date: "2025-01-12",
      status: "pago",
      supplier: "Loja Foto & Vídeo",
      paymentMethod: "Cartão",
    },
    {
      id: "3",
      category: "Aluguel",
      description: "Aluguel do estabelecimento",
      value: 3500.00,
      date: "2025-01-05",
      status: "pago",
      paymentMethod: "Transferência",
    },
    {
      id: "4",
      category: "Energia",
      description: "Conta de luz",
      value: 450.00,
      date: "2025-01-15",
      status: "pendente",
    },
    {
      id: "5",
      category: "Internet",
      description: "Internet fibra óptica",
      value: 199.90,
      date: "2025-01-20",
      status: "pendente",
    },
  ]);

  // Cálculos
  const financialSummary = useMemo(() => {
    const totalReceitas = rentalsIncome.reduce((sum, item) => sum + item.paid, 0);
    const totalReceitasPendentes = rentalsIncome.reduce((sum, item) => sum + item.pending, 0);
    const totalDespesas = expenses.filter(e => e.status === "pago").reduce((sum, item) => sum + item.value, 0);
    const totalDespesasPendentes = expenses.filter(e => e.status === "pendente").reduce((sum, item) => sum + item.value, 0);
    const saldo = totalReceitas - totalDespesas;
    const lucroLiquido = ((saldo / totalReceitas) * 100) || 0;

    return {
      totalReceitas,
      totalReceitasPendentes,
      totalDespesas,
      totalDespesasPendentes,
      saldo,
      lucroLiquido,
      totalReceitasPrevisao: totalReceitas + totalReceitasPendentes,
      totalDespesasPrevisao: totalDespesas + totalDespesasPendentes,
    };
  }, [rentalsIncome, expenses]);

  // Fluxo de caixa
  const cashFlow = useMemo(() => {
    const items: CashFlowItem[] = [];
    let balance = 0;

    // Adicionar receitas
    rentalsIncome.forEach(rental => {
      if (rental.paid > 0) {
        balance += rental.paid;
        items.push({
          date: rental.rentalDate,
          type: "receita",
          category: "Locação",
          description: `${rental.clientName} - Pedido #${rental.orderId}`,
          value: rental.paid,
          balance,
        });
      }
    });

    // Adicionar despesas
    expenses.filter(e => e.status === "pago").forEach(expense => {
      balance -= expense.value;
      items.push({
        date: expense.date,
        type: "despesa",
        category: expense.category,
        description: expense.description,
        value: expense.value,
        balance,
      });
    });

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [rentalsIncome, expenses]);

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "text-green-400 bg-green-400/10 border-green-400";
      case "parcial":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400";
      case "pendente":
        return "text-blue-400 bg-blue-400/10 border-blue-400";
      case "atrasado":
        return "text-red-400 bg-red-400/10 border-red-400";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Gestão Financeira</h2>
          <p className="text-gray-400 mt-1">Controle completo das finanças da locadora</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-cinema-yellow border-cinema-yellow">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receitas */}
        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Receitas Recebidas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(financialSummary.totalReceitas)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              + {formatCurrency(financialSummary.totalReceitasPendentes)} pendente
            </p>
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Despesas Pagas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(financialSummary.totalDespesas)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              + {formatCurrency(financialSummary.totalDespesasPendentes)} pendente
            </p>
          </CardContent>
        </Card>

        {/* Saldo */}
        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Saldo Atual
            </CardTitle>
            <Wallet className="h-4 w-4 text-cinema-yellow" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialSummary.saldo >= 0 ? "text-green-400" : "text-red-400"}`}>
              {formatCurrency(financialSummary.saldo)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Margem: {financialSummary.lucroLiquido.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        {/* Inadimplência */}
        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Inadimplência
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {rentalsIncome.filter(r => r.status === "atrasado").length}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {formatCurrency(rentalsIncome.filter(r => r.status === "atrasado").reduce((sum, r) => sum + r.pending, 0))} em atraso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-cinema-gray border border-cinema-gray-light">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="fluxo-caixa">Fluxo de Caixa</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="visao-geral" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Receitas Recentes */}
            <Card className="bg-cinema-gray border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Receitas Recentes</span>
                  <HandCoins className="w-5 h-5 text-green-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rentalsIncome.slice(0, 5).map((rental) => (
                    <div key={rental.id} className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded-lg">
                      <div className="flex-1">
                        <p className="text-white font-medium">{rental.clientName}</p>
                        <p className="text-sm text-gray-400">Pedido #{rental.orderId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">{formatCurrency(rental.paid)}</p>
                        <Badge className={getStatusColor(rental.status)}>
                          {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Despesas Recentes */}
            <Card className="bg-cinema-gray border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Despesas Recentes</span>
                  <Receipt className="w-5 h-5 text-red-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded-lg">
                      <div className="flex-1">
                        <p className="text-white font-medium">{expense.description}</p>
                        <p className="text-sm text-gray-400">{expense.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 font-bold">{formatCurrency(expense.value)}</p>
                        <Badge className={getStatusColor(expense.status)}>
                          {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Desempenho */}
          <Card className="bg-cinema-gray border-cinema-gray-light">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Desempenho Mensal</span>
                <FileBarChart className="w-5 h-5 text-cinema-yellow" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-cinema-dark-lighter rounded-lg text-center">
                  <p className="text-gray-400 text-sm mb-2">Total de Locações</p>
                  <p className="text-3xl font-bold text-white">{rentalsIncome.length}</p>
                  <p className="text-xs text-green-400 mt-1">+12% vs mês anterior</p>
                </div>
                <div className="p-4 bg-cinema-dark-lighter rounded-lg text-center">
                  <p className="text-gray-400 text-sm mb-2">Ticket Médio</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(financialSummary.totalReceitas / rentalsIncome.length)}
                  </p>
                  <p className="text-xs text-green-400 mt-1">+8% vs mês anterior</p>
                </div>
                <div className="p-4 bg-cinema-dark-lighter rounded-lg text-center">
                  <p className="text-gray-400 text-sm mb-2">Taxa de Pagamento</p>
                  <p className="text-3xl font-bold text-white">
                    {((rentalsIncome.filter(r => r.status === "pago").length / rentalsIncome.length) * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-red-400 mt-1">-5% vs mês anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receitas */}
        <TabsContent value="receitas" className="space-y-4">
          <Card className="bg-cinema-gray border-cinema-gray-light">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Todas as Receitas</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                  <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="w-[180px] bg-cinema-dark-lighter border-cinema-gray-light text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hoje">Hoje</SelectItem>
                      <SelectItem value="semana">Esta Semana</SelectItem>
                      <SelectItem value="mes">Este Mês</SelectItem>
                      <SelectItem value="ano">Este Ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cinema-gray-light">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Pedido</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Cliente</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Equipamento</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Data</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Valor</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Pago</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Pendente</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentalsIncome.map((rental) => (
                      <tr key={rental.id} className="border-b border-cinema-gray-light/30 hover:bg-cinema-dark-lighter">
                        <td className="py-3 px-4 text-white font-mono">#{rental.orderId}</td>
                        <td className="py-3 px-4 text-white">{rental.clientName}</td>
                        <td className="py-3 px-4 text-gray-400">{rental.equipment.join(", ")}</td>
                        <td className="py-3 px-4 text-gray-400">{formatDate(rental.rentalDate)}</td>
                        <td className="py-3 px-4 text-right text-white font-bold">{formatCurrency(rental.totalValue)}</td>
                        <td className="py-3 px-4 text-right text-green-400">{formatCurrency(rental.paid)}</td>
                        <td className="py-3 px-4 text-right text-yellow-400">{formatCurrency(rental.pending)}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={getStatusColor(rental.status)}>
                            {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button size="sm" variant="ghost" className="text-cinema-yellow">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-cinema-yellow">
                              <Printer className="w-4 h-4" />
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
        </TabsContent>

        {/* Despesas */}
        <TabsContent value="despesas" className="space-y-4">
          <Card className="bg-cinema-gray border-cinema-gray-light">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Todas as Despesas</CardTitle>
                <Button className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Despesa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cinema-gray-light">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Data</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Categoria</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Descrição</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Fornecedor</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Valor</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-cinema-gray-light/30 hover:bg-cinema-dark-lighter">
                        <td className="py-3 px-4 text-gray-400">{formatDate(expense.date)}</td>
                        <td className="py-3 px-4 text-white">{expense.category}</td>
                        <td className="py-3 px-4 text-gray-400">{expense.description}</td>
                        <td className="py-3 px-4 text-gray-400">{expense.supplier || "-"}</td>
                        <td className="py-3 px-4 text-right text-red-400 font-bold">{formatCurrency(expense.value)}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={getStatusColor(expense.status)}>
                            {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button size="sm" variant="ghost" className="text-cinema-yellow">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400">
                              <Trash2 className="w-4 h-4" />
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
        </TabsContent>

        {/* Fluxo de Caixa */}
        <TabsContent value="fluxo-caixa" className="space-y-4">
          <Card className="bg-cinema-gray border-cinema-gray-light">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Fluxo de Caixa Consolidado</span>
                <FileBarChart className="w-5 h-5 text-cinema-yellow" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Resumo do Fluxo */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-green-400/10 border border-green-400/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Entradas</span>
                      <ArrowUpRight className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-green-400">
                      {formatCurrency(cashFlow.filter(item => item.type === "receita").reduce((sum, item) => sum + item.value, 0))}
                    </p>
                  </div>
                  <div className="p-4 bg-red-400/10 border border-red-400/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Saídas</span>
                      <ArrowDownRight className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-2xl font-bold text-red-400">
                      {formatCurrency(cashFlow.filter(item => item.type === "despesa").reduce((sum, item) => sum + item.value, 0))}
                    </p>
                  </div>
                  <div className="p-4 bg-cinema-yellow/10 border border-cinema-yellow/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Saldo Final</span>
                      <Wallet className="w-5 h-5 text-cinema-yellow" />
                    </div>
                    <p className="text-2xl font-bold text-cinema-yellow">
                      {formatCurrency(financialSummary.saldo)}
                    </p>
                  </div>
                </div>

                {/* Timeline do Fluxo */}
                <div className="space-y-3">
                  {cashFlow.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-cinema-dark-lighter rounded-lg">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        item.type === "receita" ? "bg-green-400/20" : "bg-red-400/20"
                      }`}>
                        {item.type === "receita" ? (
                          <ArrowUpRight className="w-6 h-6 text-green-400" />
                        ) : (
                          <ArrowDownRight className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{item.description}</span>
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-400">{formatDate(item.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${item.type === "receita" ? "text-green-400" : "text-red-400"}`}>
                          {item.type === "receita" ? "+" : "-"}{formatCurrency(item.value)}
                        </p>
                        <p className="text-sm text-gray-400">
                          Saldo: {formatCurrency(item.balance)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RentalFinanceManager;

