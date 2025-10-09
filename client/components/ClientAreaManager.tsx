import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useClientArea } from "@/context/ClientAreaContext";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Settings,
  Palette,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  Clock,
  Target,
  MessageSquare,
  Layout,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  X,
  Search,
  Filter,
} from "lucide-react";

export const ClientAreaManager: React.FC = () => {
  const {
    alerts,
    config,
    addAlert,
    updateAlert,
    deleteAlert,
    updateConfig,
    getActiveAlerts,
  } = useClientArea();

  const [activeTab, setActiveTab] = useState("alerts");
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const [newAlert, setNewAlert] = useState({
    title: "",
    message: "",
    type: "info" as const,
    priority: "medium" as const,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    targetAudience: "all" as const,
    isActive: true,
    showOnLogin: true,
    showOnDashboard: true,
    dismissible: true,
    createdBy: "admin",
  });

  const handleAddAlert = () => {
    if (!newAlert.title || !newAlert.message) return;

    addAlert(newAlert);
    setNewAlert({
      title: "",
      message: "",
      type: "info",
      priority: "medium",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      targetAudience: "all",
      isActive: true,
      showOnLogin: true,
      showOnDashboard: true,
      dismissible: true,
      createdBy: "admin",
    });
    setShowAlertModal(false);
  };

  const handleUpdateAlert = (id: string, updates: any) => {
    updateAlert(id, updates);
    setEditingAlert(null);
  };

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-400 bg-red-400/20";
      case "high":
        return "text-orange-400 bg-orange-400/20";
      case "medium":
        return "text-yellow-400 bg-yellow-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">
          Gestão da Área do Cliente
        </h2>
        <div className="flex space-x-2">
          <Button
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode(!previewMode)}
            className={
              previewMode
                ? "bg-cinema-yellow text-cinema-dark"
                : "text-cinema-yellow border-cinema-yellow"
            }
          >
            {previewMode ? (
              <EyeOff className="w-4 h-4 mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            {previewMode ? "Sair da Visualização" : "Visualizar"}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-cinema-gray-light">
        <nav className="flex space-x-8">
          <Button
            variant="ghost"
            className={`pb-3 px-0 rounded-none border-b-2 ${
              activeTab === "alerts"
                ? "border-cinema-yellow text-cinema-yellow"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("alerts")}
          >
            <Bell className="w-4 h-4 mr-2" />
            Avisos e Alertas
          </Button>
          <Button
            variant="ghost"
            className={`pb-3 px-0 rounded-none border-b-2 ${
              activeTab === "layout"
                ? "border-cinema-yellow text-cinema-yellow"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("layout")}
          >
            <Layout className="w-4 h-4 mr-2" />
            Layout e Aparência
          </Button>
          <Button
            variant="ghost"
            className={`pb-3 px-0 rounded-none border-b-2 ${
              activeTab === "config"
                ? "border-cinema-yellow text-cinema-yellow"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("config")}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </nav>
      </div>

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Gestão de Avisos</h3>
            <Button
              onClick={() => setShowAlertModal(true)}
              className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Aviso
            </Button>
          </div>

          {/* Alert Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardContent className="p-4 text-center">
                <Bell className="w-8 h-8 text-cinema-yellow mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{alerts.length}</p>
                <p className="text-gray-400 text-sm">Total de Avisos</p>
              </CardContent>
            </Card>
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {getActiveAlerts().length}
                </p>
                <p className="text-gray-400 text-sm">Avisos Ativos</p>
              </CardContent>
            </Card>
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {alerts.filter((a) => a.showOnLogin).length}
                </p>
                <p className="text-gray-400 text-sm">Avisos de Login</p>
              </CardContent>
            </Card>
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardContent className="p-4 text-center">
                <Monitor className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {alerts.filter((a) => a.showOnDashboard).length}
                </p>
                <p className="text-gray-400 text-sm">Avisos do Dashboard</p>
              </CardContent>
            </Card>
          </div>

          {/* Alerts List */}
          <Card className="bg-cinema-dark border-cinema-gray-light">
            <CardHeader>
              <CardTitle className="text-white">Lista de Avisos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 bg-cinema-dark-lighter rounded-lg border border-cinema-gray-light"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getAlertIcon(alert.type)}
                          <h4 className="text-white font-semibold">
                            {alert.title}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(alert.priority)}`}
                          >
                            {alert.priority}
                          </span>
                          {alert.isActive ? (
                            <span className="px-2 py-1 rounded-full text-xs text-green-400 bg-green-400/20">
                              Ativo
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs text-gray-400 bg-gray-400/20">
                              Inativo
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-3">
                          {alert.message}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                          <div>
                            <span className="text-gray-400">Período:</span>
                            <p>
                              {new Date(alert.startDate).toLocaleDateString()} -{" "}
                              {new Date(alert.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400">Público:</span>
                            <p>
                              {alert.targetAudience === "all"
                                ? "Todos"
                                : alert.targetAudience}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400">Exibir em:</span>
                            <p>
                              {alert.showOnLogin && alert.showOnDashboard
                                ? "Login + Dashboard"
                                : alert.showOnLogin
                                  ? "Login"
                                  : alert.showOnDashboard
                                    ? "Dashboard"
                                    : "Nenhum"}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400">Dispensável:</span>
                            <p>{alert.dismissible ? "Sim" : "Não"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateAlert(alert.id, { isActive: !alert.isActive })
                          }
                          className={
                            alert.isActive
                              ? "text-orange-400 border-orange-400"
                              : "text-green-400 border-green-400"
                          }
                        >
                          {alert.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingAlert(alert)}
                          className="text-cinema-yellow border-cinema-yellow"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteAlert(alert.id)}
                          className="text-red-400 border-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Layout Tab */}
      {activeTab === "layout" && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">
            Personalização da Interface
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Theme Settings */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white">Cores e Tema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Cor Primária</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={config.theme.primaryColor}
                      onChange={(e) =>
                        updateConfig({
                          theme: {
                            ...config.theme,
                            primaryColor: e.target.value,
                          },
                        })
                      }
                      className="w-12 h-10 border-cinema-gray-light"
                    />
                    <Input
                      value={config.theme.primaryColor}
                      onChange={(e) =>
                        updateConfig({
                          theme: {
                            ...config.theme,
                            primaryColor: e.target.value,
                          },
                        })
                      }
                      className="flex-1 bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Cor de Fundo</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={config.theme.backgroundColor}
                      onChange={(e) =>
                        updateConfig({
                          theme: {
                            ...config.theme,
                            backgroundColor: e.target.value,
                          },
                        })
                      }
                      className="w-12 h-10 border-cinema-gray-light"
                    />
                    <Input
                      value={config.theme.backgroundColor}
                      onChange={(e) =>
                        updateConfig({
                          theme: {
                            ...config.theme,
                            backgroundColor: e.target.value,
                          },
                        })
                      }
                      className="flex-1 bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Layout Settings */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white">
                  Layout do Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Estilo do Layout</Label>
                  <select
                    value={config.dashboardLayout}
                    onChange={(e) =>
                      updateConfig({ dashboardLayout: e.target.value as any })
                    }
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  >
                    <option value="default">Padrão</option>
                    <option value="compact">Compacto</option>
                    <option value="detailed">Detalhado</option>
                  </select>
                </div>

                <div>
                  <Label className="text-white">Mensagem de Boas-vindas</Label>
                  <Input
                    value={config.welcomeMessage}
                    onChange={(e) =>
                      updateConfig({ welcomeMessage: e.target.value })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="Bem-vindo à sua Área Cliente"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Toggles */}
          <Card className="bg-cinema-dark border-cinema-gray-light">
            <CardHeader>
              <CardTitle className="text-white">
                Funcionalidades Visíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(config.features).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded-lg"
                  >
                    <span className="text-white">
                      {key === "showRecentOrders"
                        ? "Pedidos Recentes"
                        : key === "showRentedEquipment"
                          ? "Equipamentos Alugados"
                          : key === "showDocuments"
                            ? "Documentos"
                            : key === "showSupport"
                              ? "Suporte"
                              : key}
                    </span>
                    <Button
                      size="sm"
                      variant={value ? "default" : "outline"}
                      onClick={() =>
                        updateConfig({
                          features: { ...config.features, [key]: !value },
                        })
                      }
                      className={
                        value
                          ? "bg-green-500 text-white"
                          : "text-gray-400 border-gray-400"
                      }
                    >
                      {value ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Novo Aviso</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAlertModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Título do Aviso</Label>
                  <Input
                    value={newAlert.title}
                    onChange={(e) =>
                      setNewAlert((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="Digite o título..."
                  />
                </div>
                <div>
                  <Label className="text-white">Tipo</Label>
                  <select
                    value={newAlert.type}
                    onChange={(e) =>
                      setNewAlert((prev) => ({
                        ...prev,
                        type: e.target.value as any,
                      }))
                    }
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  >
                    <option value="info">Informação</option>
                    <option value="success">Sucesso</option>
                    <option value="warning">Atenção</option>
                    <option value="error">Erro</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-white">Mensagem</Label>
                <textarea
                  value={newAlert.message}
                  onChange={(e) =>
                    setNewAlert((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 h-24 resize-none"
                  placeholder="Digite a mensagem do aviso..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Prioridade</Label>
                  <select
                    value={newAlert.priority}
                    onChange={(e) =>
                      setNewAlert((prev) => ({
                        ...prev,
                        priority: e.target.value as any,
                      }))
                    }
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                <div>
                  <Label className="text-white">Data Início</Label>
                  <Input
                    type="date"
                    value={newAlert.startDate}
                    onChange={(e) =>
                      setNewAlert((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                <div>
                  <Label className="text-white">Data Fim</Label>
                  <Input
                    type="date"
                    value={newAlert.endDate}
                    onChange={(e) =>
                      setNewAlert((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Público Alvo</Label>
                  <select
                    value={newAlert.targetAudience}
                    onChange={(e) =>
                      setNewAlert((prev) => ({
                        ...prev,
                        targetAudience: e.target.value as any,
                      }))
                    }
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  >
                    <option value="all">Todos os Clientes</option>
                    <option value="vip">Clientes VIP</option>
                    <option value="regular">Clientes Regulares</option>
                    <option value="new">Novos Clientes</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-white">Configurações de Exibição</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded-lg">
                    <span className="text-white text-sm">Exibir no Login</span>
                    <input
                      type="checkbox"
                      checked={newAlert.showOnLogin}
                      onChange={(e) =>
                        setNewAlert((prev) => ({
                          ...prev,
                          showOnLogin: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded-lg">
                    <span className="text-white text-sm">
                      Exibir no Dashboard
                    </span>
                    <input
                      type="checkbox"
                      checked={newAlert.showOnDashboard}
                      onChange={(e) =>
                        setNewAlert((prev) => ({
                          ...prev,
                          showOnDashboard: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded-lg">
                    <span className="text-white text-sm">
                      Pode ser Dispensado
                    </span>
                    <input
                      type="checkbox"
                      checked={newAlert.dismissible}
                      onChange={(e) =>
                        setNewAlert((prev) => ({
                          ...prev,
                          dismissible: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded-lg">
                    <span className="text-white text-sm">Ativo</span>
                    <input
                      type="checkbox"
                      checked={newAlert.isActive}
                      onChange={(e) =>
                        setNewAlert((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleAddAlert}
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Criar Aviso
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAlertModal(false)}
                  className="flex-1 text-gray-400 border-gray-400 hover:text-white hover:border-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
