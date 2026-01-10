import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  Bell,
  Settings,
  ChevronRight,
  Star,
  Eye,
  RefreshCw,
  Download,
  Filter,
  MoreHorizontal,
  Sparkles,
  Crown,
  Shield,
  Flame,
  Award
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggleSimple } from "@/components/ui/theme-toggle";
import { useNavigate } from "react-router-dom";

// Dados mockados para demonstração
const MOCK_DATA = {
  revenue: {
    current: 45750,
    previous: 38200,
    growth: 19.8
  },
  orders: {
    current: 127,
    previous: 98,
    growth: 29.6
  },
  clients: {
    current: 342,
    previous: 315,
    growth: 8.6
  },
  products: {
    total: 89,
    available: 67,
    rented: 22
  },
  recentOrders: [
    { id: 1, client: 'Maria Silva', product: 'Câmera Canon 5D', value: 450, status: 'active', date: '2h atrás' },
    { id: 2, client: 'João Santos', product: 'Kit Iluminação', value: 280, status: 'pending', date: '4h atrás' },
    { id: 3, client: 'Ana Costa', product: 'Drone DJI Mavic', value: 350, status: 'active', date: '6h atrás' },
    { id: 4, client: 'Pedro Lima', product: 'Tripé Profissional', value: 80, status: 'returned', date: '1d atrás' },
    { id: 5, client: 'Carla Souza', product: 'Lente 70-200mm', value: 180, status: 'active', date: '1d atrás' },
  ],
  topProducts: [
    { name: 'Câmera Canon 5D Mark IV', rentals: 45, revenue: 6750, trend: 12 },
    { name: 'Drone DJI Mavic Pro', rentals: 38, revenue: 5700, trend: 8 },
    { name: 'Kit Iluminação LED', rentals: 32, revenue: 2880, trend: -3 },
    { name: 'Lente 70-200mm f/2.8', rentals: 28, revenue: 2520, trend: 15 },
    { name: 'Gimbal DJI Ronin', rentals: 24, revenue: 3600, trend: 5 },
  ],
  alerts: [
    { type: 'warning', message: '3 equipamentos com manutenção vencida', time: '10min' },
    { type: 'info', message: '5 devoluções previstas para hoje', time: '30min' },
    { type: 'success', message: 'Backup automático concluído', time: '1h' },
  ],
  chartData: {
    daily: [
      { day: 'Seg', value: 4200 },
      { day: 'Ter', value: 5100 },
      { day: 'Qua', value: 3800 },
      { day: 'Qui', value: 6200 },
      { day: 'Sex', value: 7500 },
      { day: 'Sáb', value: 8900 },
      { day: 'Dom', value: 5500 },
    ]
  }
};

// Componente de Gráfico de Barras Simples
function SimpleBarChart({ data }: { data: { day: string; value: number }[] }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="flex items-end justify-between gap-2 h-40">
      {data.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center gap-2 flex-1">
          <div className="w-full relative flex-1 flex items-end">
            <div 
              className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all duration-500 hover:from-amber-400 hover:to-amber-300"
              style={{ 
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: '8px'
              }}
            />
          </div>
          <span className="text-xs text-slate-400">{item.day}</span>
        </div>
      ))}
    </div>
  );
}

// Componente de Gráfico de Pizza Simples
function SimplePieChart({ available, rented }: { available: number; rented: number }) {
  const total = available + rented;
  const rentedPercent = (rented / total) * 100;
  
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="56"
          className="fill-none stroke-slate-700"
          strokeWidth="12"
        />
        <circle
          cx="64"
          cy="64"
          r="56"
          className="fill-none stroke-amber-500"
          strokeWidth="12"
          strokeDasharray={`${rentedPercent * 3.52} 352`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-2xl font-bold">{rented}</span>
        <span className="text-xs text-slate-400">Alugados</span>
      </div>
    </div>
  );
}

// Componente de Métrica
function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  prefix = '',
  suffix = '',
  color = 'amber'
}: { 
  title: string; 
  value: number | string; 
  change?: number; 
  icon: any;
  prefix?: string;
  suffix?: string;
  color?: 'amber' | 'green' | 'blue' | 'purple' | 'rose';
}) {
  const colorClasses = {
    amber: 'from-amber-500 to-orange-600',
    green: 'from-emerald-500 to-green-600',
    blue: 'from-blue-500 to-cyan-600',
    purple: 'from-purple-500 to-violet-600',
    rose: 'from-rose-500 to-pink-600',
  };
  
  const bgClasses = {
    amber: 'bg-amber-500/20',
    green: 'bg-emerald-500/20',
    blue: 'bg-blue-500/20',
    purple: 'bg-purple-500/20',
    rose: 'bg-rose-500/20',
  };

  return (
    <Card className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white border-slate-700 dark:border-slate-700 light:border-slate-200 overflow-hidden group hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-400 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold tracking-tight">
              {prefix}{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}{suffix}
            </p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>{Math.abs(change).toFixed(1)}%</span>
                <span className="text-slate-500">vs mês anterior</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${bgClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-6 w-6 bg-gradient-to-br ${colorClasses[color]} bg-clip-text text-transparent`} style={{ color: color === 'amber' ? '#f59e0b' : color === 'green' ? '#10b981' : color === 'blue' ? '#3b82f6' : color === 'purple' ? '#8b5cf6' : '#f43f5e' }} />
          </div>
        </div>
        
        {/* Linha de tendência decorativa */}
        <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-1000`}
            style={{ width: `${Math.min(100, Math.max(20, (change || 50) + 50))}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPremium() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => setIsLoading(false), 1000);
    
    // Atualizar relógio
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(clockTimer);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'returned': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'pending': return 'Pendente';
      case 'returned': return 'Devolvido';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-amber-500/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-amber-500 rounded-full animate-spin" />
            <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-amber-500" />
          </div>
          <p className="text-slate-300 text-lg">Carregando Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-100">
      {/* Header Premium */}
      <header className="sticky top-0 z-50 bg-slate-900/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/25">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Dashboard Premium
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-xs">
                    PRO
                  </Badge>
                </h1>
                <p className="text-sm text-slate-400">
                  {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  {' • '}
                  {currentTime.toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Período */}
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Últimas 24h</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Toggle de Tema */}
              <ThemeToggleSimple />
              
              {/* Notificações */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              
              {/* Configurações */}
              <Button variant="ghost" size="icon" onClick={() => navigate('/configuracoes')}>
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Receita do Mês"
            value={MOCK_DATA.revenue.current}
            change={MOCK_DATA.revenue.growth}
            icon={DollarSign}
            prefix="R$ "
            color="amber"
          />
          <MetricCard
            title="Pedidos"
            value={MOCK_DATA.orders.current}
            change={MOCK_DATA.orders.growth}
            icon={ShoppingCart}
            color="green"
          />
          <MetricCard
            title="Clientes"
            value={MOCK_DATA.clients.current}
            change={MOCK_DATA.clients.growth}
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Equipamentos"
            value={MOCK_DATA.products.total}
            icon={Package}
            suffix={` (${MOCK_DATA.products.rented} alugados)`}
            color="purple"
          />
        </div>

        {/* Gráficos e Detalhes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de Receita */}
          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-amber-400" />
                    Receita Semanal
                  </CardTitle>
                  <CardDescription>Faturamento dos últimos 7 dias</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={MOCK_DATA.chartData.daily} />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                <div>
                  <p className="text-sm text-slate-400">Total da semana</p>
                  <p className="text-2xl font-bold text-amber-400">
                    R$ {MOCK_DATA.chartData.daily.reduce((acc, d) => acc + d.value, 0).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">+23% vs semana anterior</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status de Equipamentos */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-400" />
                Status dos Equipamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimplePieChart 
                available={MOCK_DATA.products.available} 
                rented={MOCK_DATA.products.rented} 
              />
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                    <span>Alugados</span>
                  </div>
                  <span className="font-bold">{MOCK_DATA.products.rented}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-500 rounded-full" />
                    <span>Disponíveis</span>
                  </div>
                  <span className="font-bold">{MOCK_DATA.products.available}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pedidos Recentes e Top Produtos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pedidos Recentes */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  Pedidos Recentes
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/pedidos')}>
                  Ver todos
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {MOCK_DATA.recentOrders.map(order => (
                    <div 
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-slate-600">
                            {order.client.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{order.client}</p>
                          <p className="text-sm text-slate-400">{order.product}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-400">R$ {order.value}</p>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Top Produtos */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-400" />
                  Top Produtos
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/equipamentos')}>
                  Ver todos
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_DATA.topProducts.map((product, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-amber-500 text-black' :
                          idx === 1 ? 'bg-slate-400 text-black' :
                          idx === 2 ? 'bg-amber-700 text-white' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${product.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {product.trend >= 0 ? '+' : ''}{product.trend}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>{product.rentals} locações</span>
                      <span>•</span>
                      <span className="text-amber-400 font-medium">R$ {product.revenue.toLocaleString('pt-BR')}</span>
                    </div>
                    <Progress value={(product.rentals / MOCK_DATA.topProducts[0].rentals) * 100} className="h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas e Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alertas */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-400" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_DATA.alerts.map((alert, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      alert.type === 'warning' ? 'bg-amber-950/30 border-amber-500/30' :
                      alert.type === 'success' ? 'bg-green-950/30 border-green-500/30' :
                      'bg-blue-950/30 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />}
                      {alert.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />}
                      {alert.type === 'info' && <Activity className="h-5 w-5 text-blue-400 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{alert.time} atrás</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-amber-950/30 to-orange-950/30 border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2 border-slate-600 hover:bg-slate-700 hover:border-amber-500/50"
                  onClick={() => navigate('/pedidos?action=new')}
                >
                  <ShoppingCart className="h-6 w-6 text-amber-400" />
                  <span>Novo Pedido</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2 border-slate-600 hover:bg-slate-700 hover:border-green-500/50"
                  onClick={() => navigate('/clientes')}
                >
                  <Users className="h-6 w-6 text-green-400" />
                  <span>Clientes</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2 border-slate-600 hover:bg-slate-700 hover:border-blue-500/50"
                  onClick={() => navigate('/equipamentos')}
                >
                  <Package className="h-6 w-6 text-blue-400" />
                  <span>Equipamentos</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2 border-slate-600 hover:bg-slate-700 hover:border-purple-500/50"
                  onClick={() => navigate('/importacao')}
                >
                  <Download className="h-6 w-6 text-purple-400" />
                  <span>Importar</span>
                </Button>
              </div>
              
              <Separator className="my-4 bg-slate-700" />
              
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-amber-400" />
                  <div>
                    <p className="font-medium">Parabéns! 🎉</p>
                    <p className="text-sm text-slate-400">Você atingiu 127 pedidos este mês!</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600">
                  Recorde!
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

