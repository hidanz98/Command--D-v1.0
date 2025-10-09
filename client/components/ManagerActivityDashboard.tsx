import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Activity,
  MapPin,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building,
  Home,
  ShoppingCart,
  Settings,
  User,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Bell,
  Download,
} from "lucide-react";
import { useManagerActivityView } from "@/hooks/use-activity-tracker";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface EmployeeStatus {
  id: string;
  name: string;
  status: "online" | "offline" | "working" | "break";
  location: "company" | "remote" | "unknown";
  lastActivity: Date;
  hoursToday: number;
  overtimeHours: number;
  activities: number;
}

export function ManagerActivityDashboard() {
  const { isAdmin } = useAuth();
  const { getAllActivities, getOnlineUsers, getManagerNotifications, markNotificationAsRead } = useManagerActivityView();
  
  const [activities, setActivities] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [searchTerm, setSearchTerm] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Carregar dados
  const loadData = () => {
    if (!isAdmin) return;

    setActivities(getAllActivities());
    setOnlineUsers(getOnlineUsers());
    setNotifications(getManagerNotifications());
  };

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    loadData();
    
    if (autoRefresh) {
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, autoRefresh]);

  // Filtrar atividades
  const filteredActivities = activities.filter(activity => {
    // Filtro por usuário
    if (selectedUser !== "all" && activity.userId !== selectedUser) return false;
    
    // Filtro por tipo
    if (activityFilter !== "all" && activity.type !== activityFilter) return false;
    
    // Filtro por data
    const activityDate = new Date(activity.timestamp);
    const today = new Date();
    
    switch (dateFilter) {
      case "today":
        return activityDate.toDateString() === today.toDateString();
      case "week":
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return activityDate >= weekAgo;
      case "month":
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return activityDate >= monthAgo;
      default:
        return true;
    }
  }).filter(activity => {
    // Filtro por busca
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      activity.userName.toLowerCase().includes(searchLower) ||
      activity.description.toLowerCase().includes(searchLower) ||
      activity.page?.toLowerCase().includes(searchLower)
    );
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <User className="w-4 h-4 text-green-400" />;
      case 'logout': return <User className="w-4 h-4 text-red-400" />;
      case 'page_visit': return <Eye className="w-4 h-4 text-blue-400" />;
      case 'cart_add': return <ShoppingCart className="w-4 h-4 text-green-400" />;
      case 'cart_remove': return <ShoppingCart className="w-4 h-4 text-red-400" />;
      case 'order_create': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'settings_change': return <Settings className="w-4 h-4 text-purple-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLocationBadge = (location: any) => {
    if (!location) return <Badge variant="outline" className="text-gray-400">Sem GPS</Badge>;
    
    if (location.isInCompany) {
      return <Badge className="bg-green-600 text-white">Na Empresa</Badge>;
    } else {
      return <Badge className="bg-yellow-600 text-white">Remoto</Badge>;
    }
  };

  const exportActivities = () => {
    const data = filteredActivities.map(activity => ({
      Usuario: activity.userName,
      Atividade: activity.description,
      Tipo: activity.type,
      Pagina: activity.page,
      Localizacao: activity.location?.isInCompany ? 'Empresa' : 'Remoto',
      Data: new Date(activity.timestamp).toLocaleString('pt-BR'),
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atividades_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success("📊 Relatório exportado com sucesso!");
  };

  if (!isAdmin) {
    return (
      <Card className="bg-red-900/20 border-red-500/50">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-red-400 font-semibold mb-2">Acesso Negado</h3>
          <p className="text-red-300">Apenas administradores podem acessar este painel.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{onlineUsers.length}</div>
                <div className="text-gray-400 text-sm">Usuários Online</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{filteredActivities.length}</div>
                <div className="text-gray-400 text-sm">Atividades Hoje</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Building className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {onlineUsers.filter(u => u.location?.isInCompany).length}
                </div>
                <div className="text-gray-400 text-sm">Na Empresa</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Bell className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {notifications.filter(n => !n.read).length}
                </div>
                <div className="text-gray-400 text-sm">Notificações</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usuários Online */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Funcionários Online
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onlineUsers.map((user) => (
              <div key={user.userId} className="p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-white">{user.userName}</div>
                  <div className="flex items-center space-x-2">
                    {getLocationBadge(user.location)}
                    <Badge className="bg-green-600 text-white">Online</Badge>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">
                  Última atividade: {new Date(user.timestamp).toLocaleTimeString('pt-BR')}
                </div>
                <div className="text-gray-400 text-sm">
                  Página: {user.page || 'Desconhecida'}
                </div>
              </div>
            ))}
          </div>
          
          {onlineUsers.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Nenhum funcionário online no momento
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Filter className="w-5 h-5 mr-2" />
            Filtros de Atividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-white text-sm mb-2 block">Funcionário</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Selecionar usuário" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-600">
                    Todos os Funcionários
                  </SelectItem>
                  {[...new Set(activities.map(a => a.userId))].map(userId => {
                    const userName = activities.find(a => a.userId === userId)?.userName;
                    return (
                      <SelectItem key={userId} value={userId} className="text-white hover:bg-gray-600">
                        {userName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Tipo de Atividade</label>
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-600">Todas</SelectItem>
                  <SelectItem value="login" className="text-white hover:bg-gray-600">Login/Logout</SelectItem>
                  <SelectItem value="page_visit" className="text-white hover:bg-gray-600">Navegação</SelectItem>
                  <SelectItem value="cart_add" className="text-white hover:bg-gray-600">Carrinho</SelectItem>
                  <SelectItem value="order_create" className="text-white hover:bg-gray-600">Pedidos</SelectItem>
                  <SelectItem value="settings_change" className="text-white hover:bg-gray-600">Configurações</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Período</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="today" className="text-white hover:bg-gray-600">Hoje</SelectItem>
                  <SelectItem value="week" className="text-white hover:bg-gray-600">Última Semana</SelectItem>
                  <SelectItem value="month" className="text-white hover:bg-gray-600">Último Mês</SelectItem>
                  <SelectItem value="all" className="text-white hover:bg-gray-600">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar atividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUser("all");
                  setActivityFilter("all");
                  setDateFilter("today");
                  setSearchTerm("");
                }}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Limpar Filtros
              </Button>
              
              <label className="flex items-center space-x-2 text-white text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span>Auto-atualizar (30s)</span>
              </label>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={exportActivities}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Atividades */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Log de Atividades
              <Badge className="ml-2">{filteredActivities.length}</Badge>
            </span>
            <div className="text-sm text-gray-400">
              Atualizando a cada 30s
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-white">{activity.userName}</span>
                    {getLocationBadge(activity.location)}
                    <span className="text-gray-400 text-xs">
                      {new Date(activity.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="text-gray-300 text-sm">{activity.description}</div>
                  {activity.page && (
                    <div className="text-gray-500 text-xs">📄 {activity.page}</div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {activity.location && (
                    <MapPin className={`w-4 h-4 ${
                      activity.location.isInCompany ? 'text-green-400' : 'text-yellow-400'
                    }`} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <div>Nenhuma atividade encontrada</div>
              <div className="text-sm">Ajuste os filtros para ver mais resultados</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notificações Pendentes */}
      {notifications.filter(n => !n.read).length > 0 && (
        <Card className="bg-yellow-900/20 border-yellow-500/50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-400">
              <Bell className="w-5 h-5 mr-2" />
              Notificações Pendentes
              <Badge className="ml-2 bg-yellow-600 text-white">
                {notifications.filter(n => !n.read).length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.filter(n => !n.read).slice(0, 5).map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 bg-yellow-900/30 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{notification.message}</div>
                    <div className="text-yellow-300 text-sm">
                      {new Date(notification.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markNotificationAsRead(notification.id)}
                    className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                  >
                    Marcar como Lida
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
