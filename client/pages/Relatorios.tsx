import React, { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  Eye,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  File,
  Search,
  RefreshCw,
  ChevronRight,
  Loader2,
  Share2,
  Mail,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { RequirePermission } from "@/context/PermissionsContext";
import { 
  generateReportHTML, 
  generateNotaFiscalLocacao,
  openPrintWindow, 
  downloadHTML,
  OrderInfo 
} from "@/lib/pdfGenerator";

// Dados mockados com campos de produção
const MOCK_ORDERS: OrderInfo[] = [
  {
    id: 'PED-001',
    date: new Date('2025-01-05'),
    startDate: new Date('2025-01-06'),
    endDate: new Date('2025-01-10'),
    client: { 
      name: 'Globo Filmes Ltda', 
      document: '12.345.678/0001-90', 
      email: 'producao@globofilmes.com.br', 
      phone: '(31) 99999-0001',
      address: 'Av. Afonso Pena, 1500 - Centro, Belo Horizonte - MG'
    },
    items: [
      { name: 'Câmera Canon C300 Mark III', quantity: 2, dailyRate: 350, days: 4, total: 2800 },
      { name: 'Lente Canon 70-200mm f/2.8', quantity: 2, dailyRate: 80, days: 4, total: 640 },
      { name: 'Kit Iluminação ARRI', quantity: 1, dailyRate: 500, days: 4, total: 2000 },
    ],
    subtotal: 5440,
    discount: 440,
    total: 5000,
    status: 'Em andamento',
    projectName: 'Novela "Amor e Destino" - Capítulos 45-50',
    productionDirector: 'Carlos Henrique Silva',
    productionCompany: 'Globo Filmes Ltda',
    shootLocation: 'Praça da Liberdade, BH',
    paymentStatus: 'paid',
    paymentDate: new Date('2025-01-05'),
  },
  {
    id: 'PED-002',
    date: new Date('2025-01-03'),
    startDate: new Date('2025-01-04'),
    endDate: new Date('2025-01-07'),
    client: { 
      name: 'Maria Santos Produções', 
      document: '987.654.321-00', 
      email: 'maria@msproducoes.com', 
      phone: '(31) 99999-0002',
      address: 'Rua da Bahia, 800 - Savassi, Belo Horizonte - MG'
    },
    items: [
      { name: 'Kit Iluminação LED Aputure', quantity: 2, dailyRate: 120, days: 3, total: 720 },
      { name: 'Tripé Profissional Manfrotto', quantity: 2, dailyRate: 30, days: 3, total: 180 },
    ],
    subtotal: 900,
    total: 900,
    status: 'Concluído',
    projectName: 'Documentário "BH em Cores"',
    productionDirector: 'Maria Santos',
    productionCompany: 'Maria Santos Produções ME',
    shootLocation: 'Pampulha e Centro Histórico',
    paymentStatus: 'paid',
    paymentDate: new Date('2025-01-03'),
  },
  {
    id: 'PED-003',
    date: new Date('2025-01-08'),
    startDate: new Date('2025-01-10'),
    endDate: new Date('2025-01-15'),
    client: { 
      name: 'Ana Costa', 
      document: '456.789.123-00', 
      email: 'ana@email.com', 
      phone: '(31) 99999-0003',
      address: 'Rua dos Goitacazes, 200 - Centro, BH'
    },
    items: [
      { name: 'Drone DJI Inspire 2', quantity: 1, dailyRate: 400, days: 5, total: 2000 },
      { name: 'Câmera Sony A7S III', quantity: 1, dailyRate: 200, days: 5, total: 1000 },
    ],
    subtotal: 3000,
    total: 3000,
    status: 'Pendente',
    projectName: 'Clipe Musical "Sertanejo Raiz"',
    productionDirector: 'Pedro Almeida',
    productionCompany: 'Ana Costa Produções',
    shootLocation: 'Fazenda em Sete Lagoas - MG',
    paymentStatus: 'pending',
  },
  {
    id: 'PED-004',
    date: new Date('2024-12-20'),
    startDate: new Date('2024-12-22'),
    endDate: new Date('2024-12-28'),
    client: { 
      name: 'Produtora XYZ Ltda', 
      document: '11.222.333/0001-44', 
      email: 'financeiro@xyz.com', 
      phone: '(31) 99999-0004',
      address: 'Av. Brasil, 500 - Santa Efigênia, BH'
    },
    items: [
      { name: 'Câmera RED Komodo', quantity: 1, dailyRate: 600, days: 6, total: 3600 },
      { name: 'Gimbal DJI Ronin 2', quantity: 1, dailyRate: 150, days: 6, total: 900 },
    ],
    subtotal: 4500,
    total: 4500,
    status: 'Atrasado',
    projectName: 'Comercial TV - Banco Digital',
    productionDirector: 'Roberto Lima',
    productionCompany: 'Produtora XYZ Ltda',
    shootLocation: 'Estúdio Central BH',
    paymentStatus: 'overdue',
  },
  {
    id: 'PED-005',
    date: new Date('2025-01-02'),
    startDate: new Date('2025-01-03'),
    endDate: new Date('2025-01-05'),
    client: { 
      name: 'Festival de Cinema BH', 
      document: '22.333.444/0001-55', 
      email: 'producao@festivalbh.com.br', 
      phone: '(31) 99999-0005',
      address: 'Palácio das Artes, BH'
    },
    items: [
      { name: 'Kit Áudio Sennheiser', quantity: 3, dailyRate: 80, days: 2, total: 480 },
    ],
    subtotal: 480,
    total: 480,
    status: 'Concluído',
    projectName: 'Cobertura Festival de Cinema BH 2025',
    productionDirector: 'Fernanda Oliveira',
    productionCompany: 'Associação Festival BH',
    shootLocation: 'Palácio das Artes',
    paymentStatus: 'partial',
  },
];

// Estatísticas mockadas
const MOCK_STATS = {
  totalRevenue: 45750,
  revenueGrowth: 23.5,
  totalOrders: 127,
  ordersGrowth: 15.2,
  activeRentals: 34,
  pendingReturns: 8,
  topProducts: [
    { name: 'Câmera Canon 5D Mark IV', rentals: 45, revenue: 6750 },
    { name: 'Drone DJI Mavic 3', rentals: 38, revenue: 7600 },
    { name: 'Kit Iluminação LED', rentals: 32, revenue: 3840 },
    { name: 'Gimbal DJI Ronin', rentals: 28, revenue: 4200 },
    { name: 'Lente 70-200mm f/2.8', rentals: 24, revenue: 1920 },
  ],
  monthlyRevenue: [
    { month: 'Jul', value: 32000 },
    { month: 'Ago', value: 35500 },
    { month: 'Set', value: 38000 },
    { month: 'Out', value: 41200 },
    { month: 'Nov', value: 43800 },
    { month: 'Dez', value: 45750 },
  ],
};

export default function Relatorios() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderInfo | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState<'contract' | 'receipt' | 'report' | 'invoice'>('report');
  const [previewHTML, setPreviewHTML] = useState('');
  
  // Filtros
  const [period, setPeriod] = useState('30d');
  const [reportType, setReportType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue' | 'partial'>('all');

  // Filtrar pedidos por status de pagamento
  const filteredOrders = MOCK_ORDERS.filter(order => {
    const matchesSearch = !searchTerm || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.projectName && order.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Contadores por status
  const statusCounts = {
    all: MOCK_ORDERS.length,
    paid: MOCK_ORDERS.filter(o => o.paymentStatus === 'paid').length,
    pending: MOCK_ORDERS.filter(o => o.paymentStatus === 'pending').length,
    overdue: MOCK_ORDERS.filter(o => o.paymentStatus === 'overdue').length,
    partial: MOCK_ORDERS.filter(o => o.paymentStatus === 'partial').length,
  };

  // Gerar e visualizar relatório
  const previewReport = (order: OrderInfo, type: 'contract' | 'receipt' | 'report' | 'invoice') => {
    setSelectedOrder(order);
    setPreviewType(type);
    const html = type === 'invoice' 
      ? generateNotaFiscalLocacao(order)
      : generateReportHTML(type, order);
    setPreviewHTML(html);
    setShowPreview(true);
  };

  // Imprimir
  const handlePrint = () => {
    if (previewHTML) {
      openPrintWindow(previewHTML);
    }
  };

  // Download
  const handleDownload = () => {
    if (previewHTML && selectedOrder) {
      const filename = `${previewType}-${selectedOrder.id}-${new Date().toISOString().split('T')[0]}.html`;
      downloadHTML(previewHTML, filename);
      toast({
        title: "Download iniciado!",
        description: `Arquivo ${filename} baixado`,
      });
    }
  };

  // Enviar por email
  const handleSendEmail = () => {
    toast({
      title: "Email enviado!",
      description: `Relatório enviado para ${selectedOrder?.client.email}`,
    });
    setShowPreview(false);
  };

  // Exportar relatório geral
  const exportGeneralReport = async (format: 'csv' | 'excel') => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (format === 'csv') {
        const csv = [
          ['Pedido', 'Cliente', 'Data', 'Valor', 'Status'].join(';'),
          ...MOCK_ORDERS.map(o => [
            o.id,
            o.client.name,
            o.date.toLocaleDateString('pt-BR'),
            o.total.toFixed(2),
            o.status
          ].join(';'))
        ].join('\n');
        
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-${period}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      toast({
        title: "Relatório exportado!",
        description: `Arquivo ${format.toUpperCase()} gerado com sucesso`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas dos filtrados
  const stats = {
    totalRevenue: filteredOrders.reduce((acc, o) => acc + o.total, 0),
    totalOrders: filteredOrders.length,
    avgTicket: filteredOrders.length > 0 ? filteredOrders.reduce((acc, o) => acc + o.total, 0) / filteredOrders.length : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Relatórios</h1>
                <p className="text-sm text-slate-400">Contratos, recibos e análises</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => exportGeneralReport('csv')}
                disabled={loading}
                className="border-slate-600"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-950/50 to-emerald-950/50 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Receita Total</p>
                  <p className="text-2xl font-bold text-green-400">
                    R$ {MOCK_STATS.totalRevenue.toLocaleString('pt-BR')}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-green-400 mt-1">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>+{MOCK_STATS.revenueGrowth}%</span>
                  </div>
                </div>
                <DollarSign className="h-10 w-10 text-green-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-950/50 to-cyan-950/50 border-blue-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total de Pedidos</p>
                  <p className="text-2xl font-bold text-blue-400">{MOCK_STATS.totalOrders}</p>
                  <div className="flex items-center gap-1 text-sm text-blue-400 mt-1">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>+{MOCK_STATS.ordersGrowth}%</span>
                  </div>
                </div>
                <ShoppingCart className="h-10 w-10 text-blue-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-950/50 to-orange-950/50 border-amber-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Locações Ativas</p>
                  <p className="text-2xl font-bold text-amber-400">{MOCK_STATS.activeRentals}</p>
                  <p className="text-sm text-slate-500 mt-1">Em andamento</p>
                </div>
                <Package className="h-10 w-10 text-amber-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-950/50 to-pink-950/50 border-rose-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Devoluções Pendentes</p>
                  <p className="text-2xl font-bold text-rose-400">{MOCK_STATS.pendingReturns}</p>
                  <p className="text-sm text-slate-500 mt-1">Atenção</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-rose-400/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receita Mensal */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-400" />
                Receita Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-48">
                {MOCK_STATS.monthlyRevenue.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full relative flex-1 flex items-end">
                      <div 
                        className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg transition-all duration-500 hover:from-green-400 hover:to-emerald-300"
                        style={{ 
                          height: `${(item.value / Math.max(...MOCK_STATS.monthlyRevenue.map(m => m.value))) * 100}%`,
                          minHeight: '20px'
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{item.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Produtos */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-400" />
                Produtos Mais Locados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_STATS.topProducts.map((product, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-amber-500 text-black' :
                          idx === 1 ? 'bg-slate-400 text-black' :
                          idx === 2 ? 'bg-amber-700 text-white' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium truncate max-w-[200px]">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-amber-400">
                          R$ {product.revenue.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-xs text-slate-500 block">{product.rentals} locações</span>
                      </div>
                    </div>
                    <Progress 
                      value={(product.rentals / MOCK_STATS.topProducts[0].rentals) * 100} 
                      className="h-1" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Lista com Abas de Status */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-400" />
                Documentos e Contratos
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar pedido ou projeto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-56 bg-slate-700 border-slate-600"
                  />
                </div>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-36 bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Últimos 7 dias</SelectItem>
                    <SelectItem value="30d">Últimos 30 dias</SelectItem>
                    <SelectItem value="90d">Últimos 90 dias</SelectItem>
                    <SelectItem value="year">Este ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Abas de Status de Pagamento */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-slate-600' : 'border-slate-600'}
              >
                Todos ({statusCounts.all})
              </Button>
              <Button
                variant={statusFilter === 'paid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('paid')}
                className={statusFilter === 'paid' ? 'bg-green-600' : 'border-green-500/50 text-green-400 hover:bg-green-500/20'}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Recebidos ({statusCounts.paid})
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
                className={statusFilter === 'pending' ? 'bg-amber-600' : 'border-amber-500/50 text-amber-400 hover:bg-amber-500/20'}
              >
                <Clock className="h-4 w-4 mr-1" />
                Pendentes ({statusCounts.pending})
              </Button>
              <Button
                variant={statusFilter === 'overdue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('overdue')}
                className={statusFilter === 'overdue' ? 'bg-red-600' : 'border-red-500/50 text-red-400 hover:bg-red-500/20'}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Atrasados ({statusCounts.overdue})
              </Button>
              <Button
                variant={statusFilter === 'partial' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('partial')}
                className={statusFilter === 'partial' ? 'bg-blue-600' : 'border-blue-500/50 text-blue-400 hover:bg-blue-500/20'}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Parciais ({statusCounts.partial})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente / Projeto</TableHead>
                  <TableHead>Direção Prod.</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Documentos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-10">
                      Nenhum documento encontrado para este filtro
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map(order => (
                    <TableRow key={order.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="font-medium">
                        <div className="text-sm">{order.id}</div>
                        <div className="text-xs text-slate-500">{order.date.toLocaleDateString('pt-BR')}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.client.name}</div>
                        {order.projectName && (
                          <div className="text-xs text-amber-400 mt-1">🎬 {order.projectName}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-400">
                        {order.productionDirector || '-'}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>{order.startDate.toLocaleDateString('pt-BR')}</div>
                        <div className="text-slate-500">até {order.endDate.toLocaleDateString('pt-BR')}</div>
                      </TableCell>
                      <TableCell className="font-bold text-green-400">
                        R$ {order.total.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            order.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                            order.paymentStatus === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' :
                            order.paymentStatus === 'overdue' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                            'bg-blue-500/20 text-blue-400 border-blue-500/50'
                          }
                        >
                          {order.paymentStatus === 'paid' && '✓ RECEBIDO'}
                          {order.paymentStatus === 'pending' && '⏳ PENDENTE'}
                          {order.paymentStatus === 'overdue' && '⚠️ ATRASADO'}
                          {order.paymentStatus === 'partial' && '◐ PARCIAL'}
                        </Badge>
                        {order.paymentDate && (
                          <div className="text-xs text-slate-500 mt-1">
                            {order.paymentDate.toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => previewReport(order, 'invoice')}
                            title="Nota Fiscal de Locação"
                            className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
                          >
                            <FileSpreadsheet className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => previewReport(order, 'contract')}
                            title="Contrato"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => previewReport(order, 'receipt')}
                            title="Recibo"
                          >
                            <File className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => previewReport(order, 'report')}
                            title="Relatório"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Tipos de Relatório */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-amber-950/50 to-orange-950/50 border-amber-500/50 hover:border-amber-400 transition-colors cursor-pointer group">
            <CardContent className="pt-6 text-center">
              <div className="p-4 bg-amber-500/20 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="font-bold mb-2 text-amber-300">Nota Fiscal de Locação</h3>
              <p className="text-sm text-slate-400">
                Documento padrão brasileiro para locação de bens móveis - BH/MG
              </p>
              <Badge className="mt-2 bg-amber-500/20 text-amber-300">NOVO</Badge>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer group">
            <CardContent className="pt-6 text-center">
              <div className="p-4 bg-purple-500/20 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="font-bold mb-2">Contrato de Locação</h3>
              <p className="text-sm text-slate-400">
                Documento completo com termos, condições e assinaturas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-colors cursor-pointer group">
            <CardContent className="pt-6 text-center">
              <div className="p-4 bg-green-500/20 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="font-bold mb-2">Recibo de Pagamento</h3>
              <p className="text-sm text-slate-400">
                Comprovante de pagamento com valor por extenso
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer group">
            <CardContent className="pt-6 text-center">
              <div className="p-4 bg-blue-500/20 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-bold mb-2">Relatório Detalhado</h3>
              <p className="text-sm text-slate-400">
                Visão completa do pedido com todos os detalhes
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal de Preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewType === 'invoice' ? (
                <FileSpreadsheet className="h-5 w-5 text-amber-400" />
              ) : (
                <FileText className="h-5 w-5 text-purple-400" />
              )}
              {previewType === 'invoice' && 'Nota Fiscal de Locação de Bens'}
              {previewType === 'contract' && 'Contrato de Locação'}
              {previewType === 'receipt' && 'Recibo de Pagamento'}
              {previewType === 'report' && 'Relatório de Locação'}
              <Badge variant="outline">{selectedOrder?.id}</Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-end gap-2 mb-4">
            <Button variant="outline" onClick={handlePrint} className="border-slate-600">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" onClick={handleDownload} className="border-slate-600">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleSendEmail} className="bg-purple-600 hover:bg-purple-700">
              <Mail className="h-4 w-4 mr-2" />
              Enviar por Email
            </Button>
          </div>

          <ScrollArea className="h-[60vh] border border-slate-700 rounded-lg">
            <iframe
              srcDoc={previewHTML}
              className="w-full h-[800px] bg-white"
              title="Preview do documento"
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

