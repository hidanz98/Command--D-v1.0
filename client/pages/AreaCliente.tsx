import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useClientArea } from "@/context/ClientAreaContext";
import { useTenant } from "@/context/TenantContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Package,
  FileText,
  Settings,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Bell,
  ArrowLeft,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

// This will be replaced by actual user data from auth context

const mockOrders = [
  {
    id: "ORD-2025-001",
    date: "2025-01-15",
    status: "ativo",
    items: ["Sony FX6 Full Frame", "Zeiss CP.3 85mm"],
    total: 1200.0,
    pickupDate: "2025-01-20",
    returnDate: "2025-01-22",
  },
  {
    id: "ORD-2025-002",
    date: "2025-01-10",
    status: "concluído",
    items: ["Canon EOS R5C", "Monitor Atomos"],
    total: 850.0,
    pickupDate: "2025-01-12",
    returnDate: "2025-01-14",
  },
  {
    id: "ORD-2024-156",
    date: "2024-12-20",
    status: "concluído",
    items: ["Blackmagic URSA Mini Pro"],
    total: 450.0,
    pickupDate: "2024-12-22",
    returnDate: "2024-12-24",
  },
];

const recentEquipment = [
  {
    name: "Sony FX6 Full Frame",
    lastRental: "2025-01-15",
    category: "Câmeras",
  },
  { name: "Canon EOS R5C", lastRental: "2025-01-10", category: "Câmeras" },
  {
    name: "Blackmagic URSA Mini Pro",
    lastRental: "2024-12-20",
    category: "Câmeras",
  },
];

const documentStatus = {
  cpf: { uploaded: true, verified: true },
  rg: { uploaded: true, verified: true },
  comprovante: { uploaded: false, verified: false },
  selfie: { uploaded: true, verified: false },
};

export default function AreaCliente() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showUpload, setShowUpload] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const { user, isAuthenticated, logout } = useAuth();
  const { config, getDashboardAlerts, getLoginAlerts } = useClientArea();
  const { orders: tenantOrders } = useTenant();
  const navigate = useNavigate();

  // Filtrar pedidos do cliente logado baseado no email
  const clientOrders = useMemo(() => {
    console.log("🔍 AreaCliente - Buscando pedidos do cliente");
    console.log("  - Email do usuário:", user?.email);
    console.log("  - Total de pedidos no tenant:", tenantOrders.length);
    
    if (!user?.email) {
      console.log("  ⚠️ Usuário sem email, mostrando apenas mockOrders");
      return mockOrders;
    }
    
    // Combinar pedidos do tenant com os mockOrders
    const realOrders = tenantOrders
      .filter(order => {
        const match = order.customerEmail === user.email;
        console.log(`  - Pedido ${order.id}: ${order.customerEmail} ${match ? '✅' : '❌'}`);
        return match;
      })
      .map(order => ({
        id: order.id,
        date: order.createdAt.toISOString().split('T')[0],
        status: order.status === 'pending' ? 'pendente' : 
                order.status === 'approved' ? 'aprovado' : 
                order.status === 'active' ? 'ativo' : 
                order.status === 'returned' ? 'concluído' : 
                'cancelado',
        items: order.items.map(item => item.productName),
        total: order.totalAmount,
        pickupDate: order.startDate.toISOString().split('T')[0],
        returnDate: order.endDate.toISOString().split('T')[0],
      }));
    
    console.log("  ✅ Pedidos reais encontrados:", realOrders.length);
    console.log("  📦 Total com mockOrders:", realOrders.length + mockOrders.length);
    
    // Combinar com mockOrders para manter exemplos
    return [...realOrders, ...mockOrders];
  }, [tenantOrders, user?.email]);

  // Get alerts for display
  const dashboardAlerts = getDashboardAlerts().filter(
    (alert) => !dismissedAlerts.includes(alert.id),
  );
  const loginAlerts = getLoginAlerts().filter(
    (alert) => !dismissedAlerts.includes(alert.id),
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Function to dismiss alerts
  const dismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => [...prev, alertId]);
  };

  // Get alert icon
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  // Show loading or redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Layout>
        <div className="min-h-screen bg-cinema-dark flex items-center justify-center">
          <div className="text-white text-xl">Carregando...</div>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "text-green-400";
      case "concluído":
        return "text-gray-400";
      case "cancelado":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ativo":
        return <Clock className="w-4 h-4" />;
      case "concluído":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelado":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const activeOrders = clientOrders.filter(
    (order) => order.status === "ativo" || order.status === "aprovado" || order.status === "pendente",
  ).length;
  const totalOrders = clientOrders.length;

  return (
    <Layout>
      <section className="py-8 min-h-screen bg-cinema-dark">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" data-edit-id="area-cliente.title">
              Área do Cliente
            </h1>
            <p className="text-gray-400" data-edit-id="area-cliente.welcome">
              {config.welcomeMessage}, {user.name}
            </p>
          </div>

          {/* Login Alerts */}
          {loginAlerts.length > 0 && (
            <div className="mb-8 space-y-4">
              {loginAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`border-l-4 ${
                    alert.type === "success"
                      ? "border-l-green-400 bg-green-400/10"
                      : alert.type === "warning"
                        ? "border-l-yellow-400 bg-yellow-400/10"
                        : alert.type === "error"
                          ? "border-l-red-400 bg-red-400/10"
                          : "border-l-blue-400 bg-blue-400/10"
                  } bg-cinema-gray border-cinema-gray-light`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getAlertIcon(alert.type)}
                        <div>
                          <h4 className="text-white font-semibold">
                            {alert.title}
                          </h4>
                          <p className="text-gray-300 text-sm mt-1">
                            {alert.message}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Prioridade: {alert.priority}</span>
                            <span>
                              Válido até:{" "}
                              {new Date(alert.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {alert.dismissible && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => dismissAlert(alert.id)}
                          className="text-gray-400 hover:text-white p-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="bg-cinema-gray border-cinema-gray-light sticky top-24">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Button
                      variant={activeTab === "dashboard" ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        activeTab === "dashboard"
                          ? "bg-cinema-yellow text-cinema-dark"
                          : "text-white hover:text-cinema-yellow"
                      }`}
                      onClick={() => setActiveTab("dashboard")}
                      data-edit-id="area-cliente.dashboard-button"
                    >
                      <User className="w-4 h-4 mr-2" />
                      <span data-edit-id="area-cliente.dashboard-text">Dashboard</span>
                    </Button>
                    <Button
                      variant={activeTab === "pedidos" ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        activeTab === "pedidos"
                          ? "bg-cinema-yellow text-cinema-dark"
                          : "text-white hover:text-cinema-yellow"
                      }`}
                      onClick={() => setActiveTab("pedidos")}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Meus Pedidos
                    </Button>
                    <Button
                      variant={activeTab === "documentos" ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        activeTab === "documentos"
                          ? "bg-cinema-yellow text-cinema-dark"
                          : "text-white hover:text-cinema-yellow"
                      }`}
                      onClick={() => setActiveTab("documentos")}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Meus Documentos
                    </Button>
                    <Button
                      variant={
                        activeTab === "configuracoes" ? "default" : "ghost"
                      }
                      className={`w-full justify-start ${
                        activeTab === "configuracoes"
                          ? "bg-cinema-yellow text-cinema-dark"
                          : "text-white hover:text-cinema-yellow"
                      }`}
                      onClick={() => setActiveTab("configuracoes")}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </Button>

                    <div className="pt-4 border-t border-cinema-gray-light">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300"
                        onClick={() => {
                          logout();
                          navigate("/");
                        }}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Sair
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-cinema-gray border-cinema-gray-light">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-cinema-yellow/20 rounded-lg">
                            <Package className="w-6 h-6 text-cinema-yellow" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-white" data-edit-id="area-cliente.active-orders-count">
                              {activeOrders}
                            </p>
                            <p className="text-gray-400 text-sm" data-edit-id="area-cliente.active-orders-label">
                              Pedidos Ativos
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-cinema-gray border-cinema-gray-light">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-cinema-yellow/20 rounded-lg">
                            <Star className="w-6 h-6 text-cinema-yellow" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-white" data-edit-id="area-cliente.total-orders-count">
                              {totalOrders}
                            </p>
                            <p className="text-gray-400 text-sm" data-edit-id="area-cliente.total-orders-label">
                              Total de Pedidos
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Dashboard Alerts */}
                  {dashboardAlerts.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-cinema-yellow" />
                        Avisos e Notificações
                      </h3>
                      {dashboardAlerts.map((alert) => (
                        <Card
                          key={alert.id}
                          className={`border-l-4 ${
                            alert.type === "success"
                              ? "border-l-green-400 bg-green-400/10"
                              : alert.type === "warning"
                                ? "border-l-yellow-400 bg-yellow-400/10"
                                : alert.type === "error"
                                  ? "border-l-red-400 bg-red-400/10"
                                  : "border-l-blue-400 bg-blue-400/10"
                          } bg-cinema-gray border-cinema-gray-light`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                {getAlertIcon(alert.type)}
                                <div>
                                  <h4 className="text-white font-semibold">
                                    {alert.title}
                                  </h4>
                                  <p className="text-gray-300 text-sm mt-1">
                                    {alert.message}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    <span
                                      className={`px-2 py-1 rounded ${
                                        alert.priority === "urgent"
                                          ? "bg-red-400/20 text-red-400"
                                          : alert.priority === "high"
                                            ? "bg-orange-400/20 text-orange-400"
                                            : alert.priority === "medium"
                                              ? "bg-yellow-400/20 text-yellow-400"
                                              : "bg-gray-400/20 text-gray-400"
                                      }`}
                                    >
                                      {alert.priority}
                                    </span>
                                    <span>
                                      Válido até:{" "}
                                      {new Date(
                                        alert.endDate,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {alert.dismissible && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => dismissAlert(alert.id)}
                                  className="text-gray-400 hover:text-white p-1"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <Card className="bg-cinema-gray border-cinema-gray-light">
                      <CardHeader>
                        <CardTitle className="text-white" data-edit-id="area-cliente.recent-orders-title">
                          Pedidos Recentes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {mockOrders.slice(0, 3).map((order) => (
                          <div
                            key={order.id}
                            className="flex justify-between items-center p-3 bg-cinema-dark-lighter rounded-lg"
                          >
                            <div>
                              <p className="text-white font-medium">
                                {order.id}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {order.items.join(", ")}
                              </p>
                            </div>
                            <div className="text-right">
                              <div
                                className={`flex items-center ${getStatusColor(order.status)}`}
                              >
                                {getStatusIcon(order.status)}
                                <span className="ml-1 text-sm capitalize">
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-cinema-yellow text-sm">
                                R$ {order.total.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Recent Equipment */}
                    <Card className="bg-cinema-gray border-cinema-gray-light">
                      <CardHeader>
                        <CardTitle className="text-white" data-edit-id="area-cliente.last-equipment-title">
                          Últimos Equipamentos Alugados
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {recentEquipment.map((equipment, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-cinema-dark-lighter rounded-lg"
                          >
                            <div>
                              <p className="text-white font-medium">
                                {equipment.name}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {equipment.category}
                              </p>
                            </div>
                            <p className="text-cinema-yellow text-sm">
                              {equipment.lastRental}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Pedidos Tab */}
              {activeTab === "pedidos" && (
                <div className="space-y-6">
                  <Card className="bg-cinema-gray border-cinema-gray-light">
                    <CardHeader>
                      <CardTitle className="text-white">Meus Pedidos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {clientOrders.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-400">Você ainda não tem pedidos.</p>
                        </div>
                      ) : (
                        clientOrders.map((order) => (
                        <div
                          key={order.id}
                          className="p-4 bg-cinema-dark-lighter rounded-lg border border-cinema-gray-light"
                        >
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-3 md:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-white font-semibold">
                                  {order.id}
                                </h3>
                                <div
                                  className={`flex items-center ${getStatusColor(order.status)}`}
                                >
                                  {getStatusIcon(order.status)}
                                  <span className="ml-1 text-sm capitalize">
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-400 text-sm mb-2">
                                Data do pedido:{" "}
                                {new Date(order.date).toLocaleDateString(
                                  "pt-BR",
                                )}
                              </p>
                              <p className="text-white text-sm mb-2">
                                <strong>Equipamentos:</strong>{" "}
                                {order.items.join(", ")}
                              </p>
                              <p className="text-gray-400 text-sm">
                                Retirada:{" "}
                                {new Date(order.pickupDate).toLocaleDateString(
                                  "pt-BR",
                                )}{" "}
                                | Devolução:{" "}
                                {new Date(order.returnDate).toLocaleDateString(
                                  "pt-BR",
                                )}
                              </p>
                            </div>
                            <div className="flex flex-col space-y-2 md:items-end">
                              <p className="text-cinema-yellow font-semibold text-lg">
                                R$ {order.total.toFixed(2)}
                              </p>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-cinema-yellow border-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Ver Detalhes
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-cinema-yellow border-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  PDF
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Documentos Tab */}
              {activeTab === "documentos" && (
                <div className="space-y-6">
                  <Card className="bg-cinema-gray border-cinema-gray-light">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Meus Documentos
                      </CardTitle>
                      <p className="text-gray-400 text-sm">
                        Mantenha seus documentos atualizados para agilizar o
                        processo de locação
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* CPF */}
                      <div className="p-4 bg-cinema-dark-lighter rounded-lg border border-cinema-gray-light">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-white font-medium">CPF</h4>
                            <p className="text-gray-400 text-sm">
                              Documento de identidade fiscal
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {documentStatus.cpf.verified ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <Clock className="w-5 h-5 text-yellow-400" />
                            )}
                            <span
                              className={`text-sm ${documentStatus.cpf.verified ? "text-green-400" : "text-yellow-400"}`}
                            >
                              {documentStatus.cpf.verified
                                ? "Verificado"
                                : "Pendente"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* RG */}
                      <div className="p-4 bg-cinema-dark-lighter rounded-lg border border-cinema-gray-light">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-white font-medium">RG</h4>
                            <p className="text-gray-400 text-sm">
                              Registro geral
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {documentStatus.rg.verified ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <Clock className="w-5 h-5 text-yellow-400" />
                            )}
                            <span
                              className={`text-sm ${documentStatus.rg.verified ? "text-green-400" : "text-yellow-400"}`}
                            >
                              {documentStatus.rg.verified
                                ? "Verificado"
                                : "Pendente"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Comprovante de Endereço */}
                      <div className="p-4 bg-cinema-dark-lighter rounded-lg border border-cinema-gray-light">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-white font-medium">
                              Comprovante de Endereço
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Conta de luz, água ou telefone (últimos 3 meses)
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!documentStatus.comprovante.uploaded ? (
                              <Button
                                size="sm"
                                className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Enviar
                              </Button>
                            ) : (
                              <>
                                <Clock className="w-5 h-5 text-yellow-400" />
                                <span className="text-sm text-yellow-400">
                                  Pendente
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Selfie com RG */}
                      <div className="p-4 bg-cinema-dark-lighter rounded-lg border border-cinema-gray-light">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-white font-medium">
                              Selfie com RG
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Foto sua segurando o RG ao lado do rosto
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            <span className="text-sm text-yellow-400">
                              Verificando
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Configurações Tab */}
              {activeTab === "configuracoes" && (
                <div className="space-y-6">
                  {/* Dados Pessoais */}
                  <Card className="bg-cinema-gray border-cinema-gray-light">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Dados Pessoais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-white">
                            Nome Completo
                          </Label>
                          <Input
                            id="name"
                            defaultValue={user.name}
                            className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-white">
                            E-mail
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            defaultValue={user.email}
                            className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-white">
                            Telefone
                          </Label>
                          <Input
                            id="phone"
                            defaultValue={user.phone}
                            className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="document" className="text-white">
                            CPF
                          </Label>
                          <Input
                            id="document"
                            defaultValue={user.document}
                            disabled
                            className="bg-cinema-dark-lighter border-cinema-gray-light text-gray-400"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address" className="text-white">
                          Endereço
                        </Label>
                        <Input
                          id="address"
                          defaultValue={user.address}
                          className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        />
                      </div>
                      <Button className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark">
                        Salvar Alterações
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Segurança */}
                  <Card className="bg-cinema-gray border-cinema-gray-light">
                    <CardHeader>
                      <CardTitle className="text-white">Segurança</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label
                          htmlFor="current-password"
                          className="text-white"
                        >
                          Senha Atual
                        </Label>
                        <Input
                          id="current-password"
                          type="password"
                          className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="new-password" className="text-white">
                            Nova Senha
                          </Label>
                          <Input
                            id="new-password"
                            type="password"
                            className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="confirm-password"
                            className="text-white"
                          >
                            Confirmar Nova Senha
                          </Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                          />
                        </div>
                      </div>
                      <Button className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark">
                        Alterar Senha
                      </Button>

                      <Separator className="bg-cinema-gray-light" />

                      <div className="flex items-center justify-between p-4 bg-cinema-dark-lighter rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Shield className="w-5 h-5 text-cinema-yellow" />
                          <div>
                            <h4 className="text-white font-medium">
                              Autenticação em Duas Etapas
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Adicione uma camada extra de segurança
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="text-cinema-yellow border-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                        >
                          Configurar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notificações */}
                  <Card className="bg-cinema-gray border-cinema-gray-light">
                    <CardHeader>
                      <CardTitle className="text-white">Notificações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-cinema-dark-lighter rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Bell className="w-5 h-5 text-cinema-yellow" />
                          <div>
                            <h4 className="text-white font-medium">
                              E-mail de Pedidos
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Receber atualizações sobre seus pedidos
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="text-cinema-yellow border-cinema-yellow"
                        >
                          Ativo
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-cinema-dark-lighter rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-cinema-yellow" />
                          <div>
                            <h4 className="text-white font-medium">
                              SMS de Lembretes
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Lembretes de retirada e devolução
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="text-cinema-yellow border-cinema-yellow"
                        >
                          Ativo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
