import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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

// Dados de faturamento mensal
const revenueData = [
  { month: "Jan", value: 35000, equipment: 25000, services: 10000 },
  { month: "Fev", value: 42000, equipment: 30000, services: 12000 },
  { month: "Mar", value: 38000, equipment: 28000, services: 10000 },
  { month: "Abr", value: 45000, equipment: 32000, services: 13000 },
  { month: "Mai", value: 52000, equipment: 38000, services: 14000 },
  { month: "Jun", value: 48000, equipment: 35000, services: 13000 },
  { month: "Jul", value: 55000, equipment: 40000, services: 15000 },
  { month: "Ago", value: 50000, equipment: 36000, services: 14000 },
  { month: "Set", value: 58000, equipment: 42000, services: 16000 },
  { month: "Out", value: 62000, equipment: 45000, services: 17000 },
  { month: "Nov", value: 59000, equipment: 43000, services: 16000 },
  { month: "Dez", value: 65000, equipment: 47000, services: 18000 },
];

// Dados de equipamentos mais alugados
const equipmentData = [
  { name: "Sony FX6", value: 35, color: "#F5D533" },
  { name: "Canon R5C", value: 28, color: "#4F8AC7" },
  { name: "Blackmagic URSA", value: 22, color: "#82ca9d" },
  { name: "DJI Ronin 4D", value: 15, color: "#ff6b6b" },
];

// Dados de pedidos por status
const ordersStatusData = [
  { name: "Ativos", value: 12 },
  { name: "Em Locação", value: 8 },
  { name: "Concluídos", value: 45 },
  { name: "Atrasados", value: 2 },
];

// Dados de desempenho semanal
const weeklyPerformanceData = [
  { day: "Seg", orders: 4, revenue: 8500 },
  { day: "Ter", orders: 6, revenue: 12000 },
  { day: "Qua", orders: 8, revenue: 15000 },
  { day: "Qui", orders: 5, revenue: 9800 },
  { day: "Sex", orders: 12, revenue: 22000 },
  { day: "Sáb", orders: 15, revenue: 28000 },
  { day: "Dom", orders: 7, revenue: 13500 },
];

const COLORS = ["#F5D533", "#4F8AC7", "#82ca9d", "#ff6b6b", "#8884d8"];

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-edit-id="charts.container">
      {/* Gráfico de Faturamento Mensal */}
      <Card className="bg-cinema-gray border-cinema-gray-light lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-white" data-edit-id="chart.revenue-title">Faturamento x Período</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F5D533" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#F5D533" stopOpacity={0.1} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="value"
                stroke="#F5D533"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Equipamentos Mais Alugados */}
      <Card className="bg-cinema-gray border-cinema-gray-light" data-edit-id="chart.equipment-card">
        <CardHeader>
          <CardTitle className="text-white" data-edit-id="chart.equipment-title">
            Equipamentos Mais Alugados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
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
        </CardContent>
      </Card>

      {/* Gráfico de Pedidos por Status */}
      <Card className="bg-cinema-gray border-cinema-gray-light" data-edit-id="chart.orders-card">
        <CardHeader>
          <CardTitle className="text-white" data-edit-id="chart.orders-title">Pedidos por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
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
        </CardContent>
      </Card>

      {/* Gráfico de Performance Semanal */}
      <Card className="bg-cinema-gray border-cinema-gray-light lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-white" data-edit-id="chart.performance-title">Performance Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
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
        </CardContent>
      </Card>
    </div>
  );
}
