import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Calendar,
  Clock,
  Target,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  Eye,
  PieChart,
  Activity,
  Percent,
  Star,
  AlertTriangle,
  CheckCircle2,
  Camera,
  Lightbulb,
  Mic,
  Video
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
import { cn } from "@/lib/utils";

// Dados mockados para análise
const REVENUE_DATA = {
  current: 87500,
  previous: 72000,
  growth: 21.5,
  target: 100000,
  achieved: 87.5,
};

const MONTHLY_DATA = [
  { month: 'Jul', revenue: 52000, orders: 28, avg: 1857 },
  { month: 'Ago', revenue: 58000, orders: 32, avg: 1813 },
  { month: 'Set', revenue: 63000, orders: 35, avg: 1800 },
  { month: 'Out', revenue: 68000, orders: 38, avg: 1789 },
  { month: 'Nov', revenue: 72000, orders: 42, avg: 1714 },
  { month: 'Dez', revenue: 87500, orders: 48, avg: 1823 },
];

const EQUIPMENT_PROFITABILITY = [
  { name: 'Canon C300 Mark III', category: 'camera', revenue: 18500, rentals: 45, avgDays: 4, roi: 156, utilization: 78 },
  { name: 'RED Komodo', category: 'camera', revenue: 15200, rentals: 28, avgDays: 5, roi: 142, utilization: 72 },
  { name: 'DJI Inspire 2', category: 'drone', revenue: 12800, rentals: 32, avgDays: 3, roi: 168, utilization: 65 },
  { name: 'Kit ARRI SkyPanel', category: 'lighting', revenue: 11500, rentals: 38, avgDays: 4, roi: 135, utilization: 82 },
  { name: 'Sony FX6', category: 'camera', revenue: 9800, rentals: 35, avgDays: 3, roi: 128, utilization: 68 },
  { name: 'Kit Áudio Sennheiser', category: 'audio', revenue: 6200, rentals: 52, avgDays: 2, roi: 195, utilization: 55 },
  { name: 'Gimbal DJI Ronin 2', category: 'grip', revenue: 5800, rentals: 42, avgDays: 3, roi: 112, utilization: 48 },
  { name: 'Kit LED Aputure', category: 'lighting', revenue: 4500, rentals: 38, avgDays: 3, roi: 125, utilization: 52 },
];

const CLIENT_ANALYTICS = [
  { name: 'Globo Filmes', revenue: 28500, orders: 12, avgTicket: 2375, frequency: 2.4, churn: false },
  { name: 'Produtora XYZ', revenue: 18200, orders: 8, avgTicket: 2275, frequency: 1.6, churn: true },
  { name: 'MS Produções', revenue: 15800, orders: 15, avgTicket: 1053, frequency: 3.0, churn: false },
  { name: 'Festival BH', revenue: 8500, orders: 5, avgTicket: 1700, frequency: 1.0, churn: false },
  { name: 'Ana Costa', revenue: 6200, orders: 4, avgTicket: 1550, frequency: 0.8, churn: false },
];

const PREDICTIONS = {
  nextMonth: 95000,
  growth: 8.6,
  confidence: 85,
  risks: ['Sazonalidade pós-festas', 'Cliente XYZ inadimplente'],
  opportunities: ['Festival de Verão BH', 'Carnaval 2026'],
};

const CATEGORIES_DISTRIBUTION = [
  { category: 'Câmeras', percentage: 42, color: 'bg-blue-500' },
  { category: 'Iluminação', percentage: 25, color: 'bg-amber-500' },
  { category: 'Drones', percentage: 15, color: 'bg-rose-500' },
  { category: 'Áudio', percentage: 12, color: 'bg-green-500' },
  { category: 'Grip', percentage: 6, color: 'bg-purple-500' },
];

export default function Analytics() {
  const [period, setPeriod] = useState('6m');
  const [view, setView] = useState('overview');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'camera': return <Camera className="h-4 w-4" />;
      case 'lighting': return <Lightbulb className="h-4 w-4" />;
      case 'drone': return <Video className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Analytics & BI</h1>
                <p className="text-sm text-slate-400">Inteligência de negócio e previsões</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="3m">3 meses</SelectItem>
                  <SelectItem value="6m">6 meses</SelectItem>
                  <SelectItem value="1y">1 ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-slate-600">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-950/50 to-emerald-950/50 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">Receita Total</p>
                  <p className="text-3xl font-bold text-green-400">
                    R$ {REVENUE_DATA.current.toLocaleString('pt-BR')}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-green-400">+{REVENUE_DATA.growth}%</span>
                    <span className="text-xs text-slate-500">vs mês anterior</span>
                  </div>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Meta: R$ {REVENUE_DATA.target.toLocaleString('pt-BR')}</span>
                  <span className="text-green-400">{REVENUE_DATA.achieved}%</span>
                </div>
                <Progress value={REVENUE_DATA.achieved} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-950/50 to-cyan-950/50 border-blue-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total de Locações</p>
                  <p className="text-3xl font-bold text-blue-400">48</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-blue-400">+14.3%</span>
                    <span className="text-xs text-slate-500">vs mês anterior</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Package className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-950/50 to-orange-950/50 border-amber-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">Ticket Médio</p>
                  <p className="text-3xl font-bold text-amber-400">
                    R$ {(REVENUE_DATA.current / 48).toFixed(0)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-amber-400">+6.2%</span>
                    <span className="text-xs text-slate-500">vs mês anterior</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <Target className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-950/50 to-violet-950/50 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">Taxa de Utilização</p>
                  <p className="text-3xl font-bold text-purple-400">68%</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-purple-400">+5%</span>
                    <span className="text-xs text-slate-500">vs mês anterior</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Activity className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Receita Mensal */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Evolução da Receita
                </CardTitle>
                <CardDescription>Comparativo mensal de faturamento</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-4 h-64">
              {MONTHLY_DATA.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <div className="text-xs text-slate-400">
                    R$ {(item.revenue / 1000).toFixed(0)}k
                  </div>
                  <div className="w-full relative flex-1 flex items-end">
                    <div 
                      className="w-full bg-gradient-to-t from-green-600 to-emerald-400 rounded-t-lg transition-all duration-500 hover:from-green-500 hover:to-emerald-300 cursor-pointer"
                      style={{ 
                        height: `${(item.revenue / Math.max(...MONTHLY_DATA.map(m => m.revenue))) * 100}%`,
                        minHeight: '20px'
                      }}
                    />
                  </div>
                  <div className="text-xs text-slate-400">{item.month}</div>
                  <div className="text-[10px] text-slate-500">{item.orders} loc.</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Previsão */}
          <Card className="bg-gradient-to-br from-violet-950/30 to-purple-950/30 border-violet-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-violet-400" />
                Previsão Próximo Mês
              </CardTitle>
              <CardDescription>Projeção baseada em tendências</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-violet-400">
                    R$ {PREDICTIONS.nextMonth.toLocaleString('pt-BR')}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-green-400">+{PREDICTIONS.growth}% crescimento esperado</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-400">{PREDICTIONS.confidence}%</div>
                  <div className="text-xs text-slate-400">Confiança</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                  <p className="text-xs text-red-400 font-medium mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Riscos
                  </p>
                  {PREDICTIONS.risks.map((risk, idx) => (
                    <p key={idx} className="text-xs text-slate-400">• {risk}</p>
                  ))}
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <p className="text-xs text-green-400 font-medium mb-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Oportunidades
                  </p>
                  {PREDICTIONS.opportunities.map((opp, idx) => (
                    <p key={idx} className="text-xs text-slate-400">• {opp}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Categoria */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-cyan-400" />
                Distribuição por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-8">
                {/* Gráfico de Pizza Simplificado */}
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {CATEGORIES_DISTRIBUTION.reduce((acc, cat, idx) => {
                      const offset = acc.offset;
                      const dash = cat.percentage;
                      acc.elements.push(
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={cat.color.replace('bg-', '')}
                          strokeWidth="20"
                          strokeDasharray={`${dash} ${100 - dash}`}
                          strokeDashoffset={-offset}
                          className={cat.color.replace('bg-', 'stroke-')}
                        />
                      );
                      acc.offset += dash;
                      return acc;
                    }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold">100%</p>
                      <p className="text-xs text-slate-400">Total</p>
                    </div>
                  </div>
                </div>

                {/* Legenda */}
                <div className="space-y-2">
                  {CATEGORIES_DISTRIBUTION.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded", cat.color)} />
                      <span className="text-sm">{cat.category}</span>
                      <span className="text-sm text-slate-400">{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rentabilidade por Equipamento */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Rentabilidade por Equipamento
            </CardTitle>
            <CardDescription>Análise de ROI e utilização do inventário</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">Equipamento</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-slate-400">Receita</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-slate-400">Locações</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-slate-400">Média Dias</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-slate-400">ROI</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-slate-400">Utilização</th>
                  </tr>
                </thead>
                <tbody>
                  {EQUIPMENT_PROFITABILITY.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-800 hover:bg-slate-700/30">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-1.5 rounded",
                            item.category === 'camera' ? 'bg-blue-500/20 text-blue-400' :
                            item.category === 'lighting' ? 'bg-amber-500/20 text-amber-400' :
                            item.category === 'drone' ? 'bg-rose-500/20 text-rose-400' :
                            item.category === 'audio' ? 'bg-green-500/20 text-green-400' :
                            'bg-purple-500/20 text-purple-400'
                          )}>
                            {getCategoryIcon(item.category)}
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2 font-medium text-green-400">
                        R$ {item.revenue.toLocaleString('pt-BR')}
                      </td>
                      <td className="text-center py-3 px-2">{item.rentals}</td>
                      <td className="text-center py-3 px-2">{item.avgDays} dias</td>
                      <td className="text-center py-3 px-2">
                        <Badge className={cn(
                          "min-w-[50px]",
                          item.roi >= 150 ? 'bg-green-500/20 text-green-400' :
                          item.roi >= 120 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        )}>
                          {item.roi}%
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Progress value={item.utilization} className="h-2 w-20" />
                          <span className="text-xs text-slate-400">{item.utilization}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Clientes */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Análise de Clientes
            </CardTitle>
            <CardDescription>Principais clientes e métricas de comportamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CLIENT_ANALYTICS.map((client, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full text-white font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{client.name}</span>
                      {client.churn && (
                        <Badge className="bg-red-500/20 text-red-400">Risco de Churn</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                      <span>{client.orders} pedidos</span>
                      <span>•</span>
                      <span>Freq: {client.frequency}x/mês</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">R$ {client.revenue.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-slate-400">Ticket: R$ {client.avgTicket.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

