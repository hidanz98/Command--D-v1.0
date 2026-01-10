import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Dados de faturamento mensal - ZERADO (locadora iniciando)
const revenueData = [
  { month: "Jan", value: 0, equipment: 0, services: 0 },
  { month: "Fev", value: 0, equipment: 0, services: 0 },
  { month: "Mar", value: 0, equipment: 0, services: 0 },
  { month: "Abr", value: 0, equipment: 0, services: 0 },
  { month: "Mai", value: 0, equipment: 0, services: 0 },
  { month: "Jun", value: 0, equipment: 0, services: 0 },
  { month: "Jul", value: 0, equipment: 0, services: 0 },
  { month: "Ago", value: 0, equipment: 0, services: 0 },
  { month: "Set", value: 0, equipment: 0, services: 0 },
  { month: "Out", value: 0, equipment: 0, services: 0 },
  { month: "Nov", value: 0, equipment: 0, services: 0 },
  { month: "Dez", value: 0, equipment: 0, services: 0 },
];

// Dados de equipamentos mais alugados - ZERADO
const equipmentData: any[] = [];

// Dados de pedidos por status - ZERADO
const ordersStatusData = [
  { name: "Ativos", value: 0 },
  { name: "Em Locação", value: 0 },
  { name: "Concluídos", value: 0 },
  { name: "Atrasados", value: 0 },
];

// Dados de desempenho semanal - ZERADO
const weeklyPerformanceData = [
  { day: "Seg", orders: 0, revenue: 0 },
  { day: "Ter", orders: 0, revenue: 0 },
  { day: "Qua", orders: 0, revenue: 0 },
  { day: "Qui", orders: 0, revenue: 0 },
  { day: "Sex", orders: 0, revenue: 0 },
  { day: "Sáb", orders: 0, revenue: 0 },
  { day: "Dom", orders: 0, revenue: 0 },
];

const COLORS = ["#F5D533", "#4F8AC7", "#82ca9d", "#ff6b6b", "#8884d8"];

export function DashboardCharts() {
  // Verificar se há dados
  const hasRevenueData = revenueData.some(d => d.value > 0);
  const hasEquipmentData = equipmentData.length > 0;
  const hasOrdersData = ordersStatusData.some(d => d.value > 0);
  const hasWeeklyData = weeklyPerformanceData.some(d => d.orders > 0 || d.revenue > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-edit-id="charts.container">
      {/* Gráfico de Faturamento Mensal */}
      <Card className="bg-cinema-gray border-cinema-gray-light lg:col-span-2 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-white" data-edit-id="chart.revenue-title">Faturamento x Período</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          {hasRevenueData ? (
            <div style={{ width: '100%', height: 300, overflow: 'hidden', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => [
                      `R$ ${value.toLocaleString()}`,
                      "Faturamento",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#F5D533"
                    strokeWidth={3}
                    dot={{ fill: '#F5D533', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#F5D533' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-zinc-500">
              <div className="text-center">
                <p className="text-lg">Sem dados de faturamento ainda</p>
                <p className="text-sm mt-2">Os dados aparecerão conforme os pedidos forem concluídos</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Equipamentos Mais Alugados */}
      <Card className="bg-cinema-gray border-cinema-gray-light overflow-hidden" data-edit-id="chart.equipment-card">
        <CardHeader>
          <CardTitle className="text-white" data-edit-id="chart.equipment-title">
            Equipamentos Mais Alugados
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          {hasEquipmentData ? (
            <div style={{ width: '100%', height: 250, overflow: 'hidden', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                  data={equipmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {equipmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-zinc-500">
              <div className="text-center">
                <p className="text-lg">Nenhum aluguel registrado</p>
                <p className="text-sm mt-2">Os equipamentos mais alugados aparecerão aqui</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Pedidos por Status */}
      <Card className="bg-cinema-gray border-cinema-gray-light overflow-hidden" data-edit-id="chart.orders-card">
        <CardHeader>
          <CardTitle className="text-white" data-edit-id="chart.orders-title">Pedidos por Status</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          {hasOrdersData ? (
            <div style={{ width: '100%', height: 250, overflow: 'hidden', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="value" fill="#F5D533" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-zinc-500">
              <div className="text-center">
                <p className="text-lg">Nenhum pedido ainda</p>
                <p className="text-sm mt-2">Os pedidos aparecerão aqui por status</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Performance Semanal */}
      <Card className="bg-cinema-gray border-cinema-gray-light lg:col-span-2 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-white" data-edit-id="chart.performance-title">Performance Semanal</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          {hasWeeklyData ? (
            <div style={{ width: '100%', height: 250, overflow: 'hidden', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={weeklyPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis yAxisId="left" stroke="#9ca3af" />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number, name: string) => [
                      name === "revenue" ? `R$ ${value.toLocaleString()}` : value,
                      name === "revenue" ? "Faturamento" : "Pedidos",
                    ]}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="orders"
                    fill="#4F8AC7"
                    name="Pedidos"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#F5D533"
                    strokeWidth={3}
                    name="Faturamento"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-zinc-500">
              <div className="text-center">
                <p className="text-lg">Sem dados de performance</p>
                <p className="text-sm mt-2">A performance semanal aparecerá conforme os pedidos forem realizados</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
