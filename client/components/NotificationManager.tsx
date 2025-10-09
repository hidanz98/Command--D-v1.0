import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Send,
  Mail,
  MessageSquare,
  Phone,
  Settings,
  Users,
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  X,
  Save,
  CreditCard,
  Receipt,
  FileText,
  DollarSign,
  Calendar,
  Target,
  Smartphone,
  AtSign,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cnpj: string;
  type: "individual" | "company";
  status: "active" | "inactive";
  notificationSettings: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    autoInvoiceEmail: boolean;
    autoPaymentReminder: boolean;
    autoOverdueNotification: boolean;
    autoReceiptEmail: boolean;
    reminderDaysBefore: number;
    overdueFrequency: "daily" | "weekly" | "monthly";
  };
  lastNotificationSent: string | null;
  totalDebt: number;
  lastInteraction: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: "email" | "sms";
  category: "invoice" | "payment_reminder" | "overdue" | "receipt" | "custom";
  subject: string;
  content: string;
  isDefault: boolean;
  variables: string[];
  createdAt: string;
}

interface NotificationHistory {
  id: string;
  clientId: string;
  type: "email" | "sms";
  category: string;
  subject: string;
  content: string;
  status: "sent" | "delivered" | "failed" | "pending";
  sentAt: string;
  deliveredAt: string | null;
  cost: number;
}

const MOCK_CLIENTS: Client[] = [
  {
    id: "1",
    name: "Maria Silva Santos",
    email: "maria.silva@gmail.com",
    phone: "(31) 99999-1111",
    cpf: "123.456.789-00",
    cnpj: "",
    type: "individual",
    status: "active",
    notificationSettings: {
      emailEnabled: true,
      smsEnabled: true,
      autoInvoiceEmail: true,
      autoPaymentReminder: true,
      autoOverdueNotification: true,
      autoReceiptEmail: true,
      reminderDaysBefore: 3,
      overdueFrequency: "weekly",
    },
    lastNotificationSent: "2025-01-15T10:30:00Z",
    totalDebt: 2400.0,
    lastInteraction: "2025-01-14",
  },
  {
    id: "2",
    name: "Produtora Comercial Ltda",
    email: "financeiro@produtoracomercial.com",
    phone: "(31) 3333-4444",
    cpf: "",
    cnpj: "12.345.678/0001-90",
    type: "company",
    status: "active",
    notificationSettings: {
      emailEnabled: true,
      smsEnabled: false,
      autoInvoiceEmail: true,
      autoPaymentReminder: true,
      autoOverdueNotification: true,
      autoReceiptEmail: true,
      reminderDaysBefore: 5,
      overdueFrequency: "daily",
    },
    lastNotificationSent: "2025-01-15T14:20:00Z",
    totalDebt: 0,
    lastInteraction: "2025-01-15",
  },
  {
    id: "3",
    name: "João Carlos Oliveira",
    email: "joao.carlos@outlook.com",
    phone: "(31) 98888-7777",
    cpf: "987.654.321-00",
    cnpj: "",
    type: "individual",
    status: "active",
    notificationSettings: {
      emailEnabled: true,
      smsEnabled: true,
      autoInvoiceEmail: true,
      autoPaymentReminder: true,
      autoOverdueNotification: true,
      autoReceiptEmail: false,
      reminderDaysBefore: 1,
      overdueFrequency: "daily",
    },
    lastNotificationSent: null,
    totalDebt: 850.0,
    lastInteraction: "2025-01-12",
  },
];

const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: "template_invoice_email",
    name: "Nota Fiscal - Email",
    type: "email",
    category: "invoice",
    subject: "Nova Nota Fiscal #{{invoiceNumber}} - {{companyName}}",
    content: `Olá {{clientName}},

Sua nota fiscal foi emitida com sucesso!

Detalhes da Nota Fiscal:
• Número: {{invoiceNumber}}
• Valor: R$ {{amount}}
• Vencimento: {{dueDate}}
• Descrição: {{description}}

Para visualizar ou baixar sua nota fiscal, acesse: {{invoiceLink}}

Formas de pagamento disponíveis:
• PIX: {{pixKey}}
• Boleto: {{boletoLink}}
• Cartão: {{cardLink}}

Atenciosamente,
Equipe {{companyName}}`,
    isDefault: true,
    variables: [
      "clientName",
      "invoiceNumber",
      "amount",
      "dueDate",
      "description",
      "companyName",
      "invoiceLink",
      "pixKey",
      "boletoLink",
      "cardLink",
    ],
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "template_payment_reminder_email",
    name: "Lembrete de Pagamento - Email",
    type: "email",
    category: "payment_reminder",
    subject:
      "Lembrete: Pagamento vence em {{daysRemaining}} dias - NF #{{invoiceNumber}}",
    content: `Olá {{clientName}},

Este é um lembrete amigável de que sua fatura vence em {{daysRemaining}} dias.

Detalhes da Fatura:
• Número: {{invoiceNumber}}
• Valor: R$ {{amount}}
• Vencimento: {{dueDate}}

Para evitar juros e multas, efetue o pagamento até a data de vencimento.

Pagar agora: {{paymentLink}}

Em caso de dúvidas, entre em contato conosco.

Atenciosamente,
{{companyName}}`,
    isDefault: true,
    variables: [
      "clientName",
      "daysRemaining",
      "invoiceNumber",
      "amount",
      "dueDate",
      "paymentLink",
      "companyName",
    ],
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "template_overdue_sms",
    name: "Cobrança em Atraso - SMS",
    type: "sms",
    category: "overdue",
    subject: "",
    content:
      "{{clientName}}, sua fatura NF #{{invoiceNumber}} de R$ {{amount}} está vencida. Evite negativação: {{paymentLink}} - {{companyName}}",
    isDefault: true,
    variables: [
      "clientName",
      "invoiceNumber",
      "amount",
      "paymentLink",
      "companyName",
    ],
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "template_receipt_email",
    name: "Comprovante de Pagamento - Email",
    type: "email",
    category: "receipt",
    subject: "Pagamento Confirmado - NF #{{invoiceNumber}} - {{companyName}}",
    content: `Olá {{clientName}},

Confirmamos o recebimento do seu pagamento!

Detalhes do Pagamento:
• Nota Fiscal: {{invoiceNumber}}
• Valor Pago: R$ {{amount}}
• Data do Pagamento: {{paymentDate}}
• Método: {{paymentMethod}}

Seu comprovante está anexo a este email.

Obrigado pela sua preferência!

{{companyName}}`,
    isDefault: true,
    variables: [
      "clientName",
      "invoiceNumber",
      "amount",
      "paymentDate",
      "paymentMethod",
      "companyName",
    ],
    createdAt: "2025-01-01T00:00:00Z",
  },
];

export const NotificationManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [templates, setTemplates] =
    useState<NotificationTemplate[]>(DEFAULT_TEMPLATES);
  const [notificationHistory, setNotificationHistory] = useState<
    NotificationHistory[]
  >([]);

  const [showClientModal, setShowClientModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingTemplate, setEditingTemplate] =
    useState<NotificationTemplate | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  // New client form
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    cnpj: "",
    type: "individual",
    status: "active",
    notificationSettings: {
      emailEnabled: true,
      smsEnabled: true,
      autoInvoiceEmail: true,
      autoPaymentReminder: true,
      autoOverdueNotification: true,
      autoReceiptEmail: true,
      reminderDaysBefore: 3,
      overdueFrequency: "weekly",
    },
    totalDebt: 0,
  });

  // New template form
  const [newTemplate, setNewTemplate] = useState<Partial<NotificationTemplate>>(
    {
      name: "",
      type: "email",
      category: "custom",
      subject: "",
      content: "",
      isDefault: false,
      variables: [],
    },
  );

  // Statistics
  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter((c) => c.status === "active").length,
    clientsWithDebt: clients.filter((c) => c.totalDebt > 0).length,
    totalDebt: clients.reduce((sum, c) => sum + c.totalDebt, 0),
    emailEnabled: clients.filter((c) => c.notificationSettings.emailEnabled)
      .length,
    smsEnabled: clients.filter((c) => c.notificationSettings.smsEnabled).length,
    autoNotifications: clients.filter(
      (c) =>
        c.notificationSettings.autoInvoiceEmail ||
        c.notificationSettings.autoPaymentReminder ||
        c.notificationSettings.autoOverdueNotification,
    ).length,
  };

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    const matchesStatus =
      filterStatus === "all" || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Send notification function
  const sendNotification = async (
    clientIds: string[],
    templateId: string,
    customData?: any,
  ) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    for (const clientId of clientIds) {
      const client = clients.find((c) => c.id === clientId);
      if (!client) continue;

      // Simulate sending notification
      const notification: NotificationHistory = {
        id: `notif_${Date.now()}_${clientId}`,
        clientId,
        type: template.type,
        category: template.category,
        subject: template.subject,
        content: template.content,
        status: "sent",
        sentAt: new Date().toISOString(),
        deliveredAt: null,
        cost: template.type === "sms" ? 0.15 : 0.05, // Custo simulado
      };

      setNotificationHistory((prev) => [notification, ...prev]);

      // Update client's last notification
      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId
            ? { ...c, lastNotificationSent: new Date().toISOString() }
            : c,
        ),
      );

      // Simulate delivery after 2-5 seconds
      setTimeout(
        () => {
          setNotificationHistory((prev) =>
            prev.map((n) =>
              n.id === notification.id
                ? {
                    ...n,
                    status: "delivered",
                    deliveredAt: new Date().toISOString(),
                  }
                : n,
            ),
          );
        },
        Math.random() * 3000 + 2000,
      );
    }
  };

  // Handle client creation/update
  const handleSaveClient = () => {
    if (!newClient.name || !newClient.email) return;

    if (editingClient) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === editingClient.id
            ? ({ ...editingClient, ...newClient } as Client)
            : c,
        ),
      );
      setEditingClient(null);
    } else {
      const client: Client = {
        id: `client_${Date.now()}`,
        ...newClient,
        lastNotificationSent: null,
        lastInteraction: new Date().toISOString().split("T")[0],
      } as Client;
      setClients((prev) => [client, ...prev]);
    }

    setNewClient({
      name: "",
      email: "",
      phone: "",
      cpf: "",
      cnpj: "",
      type: "individual",
      status: "active",
      notificationSettings: {
        emailEnabled: true,
        smsEnabled: true,
        autoInvoiceEmail: true,
        autoPaymentReminder: true,
        autoOverdueNotification: true,
        autoReceiptEmail: true,
        reminderDaysBefore: 3,
        overdueFrequency: "weekly",
      },
      totalDebt: 0,
    });
    setShowClientModal(false);
  };

  // Handle template creation/update
  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) return;

    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? ({ ...editingTemplate, ...newTemplate } as NotificationTemplate)
            : t,
        ),
      );
      setEditingTemplate(null);
    } else {
      const template: NotificationTemplate = {
        id: `template_${Date.now()}`,
        ...newTemplate,
        variables: extractVariables(newTemplate.content || ""),
        createdAt: new Date().toISOString(),
      } as NotificationTemplate;
      setTemplates((prev) => [template, ...prev]);
    }

    setNewTemplate({
      name: "",
      type: "email",
      category: "custom",
      subject: "",
      content: "",
      isDefault: false,
      variables: [],
    });
    setShowTemplateModal(false);
  };

  // Extract variables from template content
  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{(\w+)\}\}/g);
    return matches ? matches.map((match) => match.slice(2, -2)) : [];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "inactive":
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getNotificationStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-400 bg-green-400/20";
      case "sent":
        return "text-blue-400 bg-blue-400/20";
      case "failed":
        return "text-red-400 bg-red-400/20";
      case "pending":
        return "text-yellow-400 bg-yellow-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  return (
    <div className="h-full bg-cinema-dark-lighter">
      {/* Header */}
      <div className="p-4 border-b border-cinema-gray-light">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">
              Central de Notificações
            </h2>
            <p className="text-gray-400 text-sm">
              Gestão completa de comunicação com clientes via Email e SMS
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowSendModal(true)}
              className="bg-cinema-yellow text-cinema-dark"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Notificação
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "dashboard", name: "Dashboard", icon: Bell },
            { id: "clients", name: "Clientes", icon: Users },
            { id: "templates", name: "Templates", icon: FileText },
            { id: "history", name: "Histórico", icon: Clock },
            { id: "settings", name: "Configurações", icon: Settings },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={
                activeTab === tab.id
                  ? "bg-cinema-yellow text-cinema-dark"
                  : "text-gray-300 border-cinema-gray-light hover:border-cinema-yellow hover:text-cinema-yellow"
              }
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        className="p-4 overflow-y-auto"
        style={{ height: "calc(100% - 140px)" }}
      >
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total de Clientes</p>
                      <p className="text-2xl font-bold text-white">
                        {stats.totalClients}
                      </p>
                      <p className="text-xs text-green-400">
                        {stats.activeClients} ativos
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-cinema-yellow" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">
                        Notificações Email
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {stats.emailEnabled}
                      </p>
                      <p className="text-xs text-blue-400">
                        clientes habilitados
                      </p>
                    </div>
                    <Mail className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Notificações SMS</p>
                      <p className="text-2xl font-bold text-white">
                        {stats.smsEnabled}
                      </p>
                      <p className="text-xs text-green-400">
                        clientes habilitados
                      </p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Auto. Ativadas</p>
                      <p className="text-2xl font-bold text-white">
                        {stats.autoNotifications}
                      </p>
                      <p className="text-xs text-cinema-yellow">
                        notificações automáticas
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-cinema-yellow" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                    Clientes com Pendências
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total em Débito:</span>
                      <span className="text-red-400 font-medium">
                        R$ {stats.totalDebt.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Clientes:</span>
                      <span className="text-white font-medium">
                        {stats.clientsWithDebt}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-red-500 text-white hover:bg-red-600"
                      onClick={() => {
                        const clientsWithDebt = clients
                          .filter((c) => c.totalDebt > 0)
                          .map((c) => c.id);
                        setSelectedClients(clientsWithDebt);
                        setShowSendModal(true);
                      }}
                    >
                      Enviar Cobrança
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                    Configurações Automáticas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Email Automático:</span>
                      <span className="text-green-400 font-medium">
                        {
                          clients.filter(
                            (c) => c.notificationSettings.autoInvoiceEmail,
                          ).length
                        }{" "}
                        clientes
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">
                        Lembrete de Vencimento:
                      </span>
                      <span className="text-blue-400 font-medium">
                        {
                          clients.filter(
                            (c) => c.notificationSettings.autoPaymentReminder,
                          ).length
                        }{" "}
                        clientes
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">
                        Cobrança Automática:
                      </span>
                      <span className="text-orange-400 font-medium">
                        {
                          clients.filter(
                            (c) =>
                              c.notificationSettings.autoOverdueNotification,
                          ).length
                        }{" "}
                        clientes
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-cinema-yellow text-cinema-dark"
                      onClick={() => setActiveTab("settings")}
                    >
                      Configurar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Notifications */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white">
                  Notificações Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notificationHistory.slice(0, 5).map((notification) => {
                    const client = clients.find(
                      (c) => c.id === notification.clientId,
                    );
                    return (
                      <div
                        key={notification.id}
                        className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg ${
                              notification.type === "email"
                                ? "bg-blue-400/20"
                                : "bg-green-400/20"
                            }`}
                          >
                            {notification.type === "email" ? (
                              <Mail className="w-4 h-4 text-blue-400" />
                            ) : (
                              <MessageSquare className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">
                              {notification.category === "invoice"
                                ? "Nota Fiscal"
                                : notification.category === "payment_reminder"
                                  ? "Lembrete"
                                  : notification.category === "overdue"
                                    ? "Cobrança"
                                    : "Comprovante"}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {client?.name || "Cliente não encontrado"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getNotificationStatusColor(notification.status)}`}
                          >
                            {notification.status === "delivered"
                              ? "Entregue"
                              : notification.status === "sent"
                                ? "Enviado"
                                : notification.status === "failed"
                                  ? "Falhou"
                                  : "Pendente"}
                          </span>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(notification.sentAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === "clients" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                Gestão de Clientes
              </h3>
              <Button
                onClick={() => setShowClientModal(true)}
                className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-cinema-dark border-cinema-gray-light text-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-cinema-dark border border-cinema-gray-light text-white rounded-md px-3 py-2"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>

            {/* Clients Table */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-cinema-gray-light">
                      <tr>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Cliente
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Contato
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Notificações
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Pendências
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client) => (
                        <tr
                          key={client.id}
                          className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-white font-medium">
                                {client.name}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {client.type === "individual"
                                  ? `CPF: ${client.cpf}`
                                  : `CNPJ: ${client.cnpj}`}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Mail className="w-3 h-3 mr-1 text-blue-400" />
                                <span className="text-white">
                                  {client.email}
                                </span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Phone className="w-3 h-3 mr-1 text-green-400" />
                                <span className="text-gray-400">
                                  {client.phone}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-1">
                              {client.notificationSettings.emailEnabled && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-400/20 text-blue-400">
                                  <AtSign className="w-3 h-3 mr-1" />
                                  Email
                                </span>
                              )}
                              {client.notificationSettings.smsEnabled && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-400/20 text-green-400">
                                  <Smartphone className="w-3 h-3 mr-1" />
                                  SMS
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {client.notificationSettings.autoInvoiceEmail &&
                                "Auto-NF "}
                              {client.notificationSettings
                                .autoPaymentReminder && "Auto-Lembrete "}
                              {client.notificationSettings
                                .autoOverdueNotification && "Auto-Cobrança"}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            {client.totalDebt > 0 ? (
                              <span className="text-red-400 font-medium">
                                R$ {client.totalDebt.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-green-400 text-sm">
                                Em dia
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                client.status === "active"
                                  ? "text-green-400 bg-green-400/20"
                                  : "text-red-400 bg-red-400/20"
                              }`}
                            >
                              {getStatusIcon(client.status)}
                              <span className="ml-1 capitalize">
                                {client.status === "active"
                                  ? "Ativo"
                                  : "Inativo"}
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-cinema-yellow border-cinema-yellow"
                                onClick={() => {
                                  setSelectedClients([client.id]);
                                  setShowSendModal(true);
                                }}
                              >
                                <Send className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-400 border-blue-400"
                                onClick={() => {
                                  setEditingClient(client);
                                  setNewClient(client);
                                  setShowClientModal(true);
                                }}
                              >
                                <Edit className="w-3 h-3" />
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
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                Templates de Notificação
              </h3>
              <Button
                onClick={() => setShowTemplateModal(true)}
                className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="bg-cinema-dark border-cinema-gray-light"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-lg">
                          {template.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              template.type === "email"
                                ? "bg-blue-400/20 text-blue-400"
                                : "bg-green-400/20 text-green-400"
                            }`}
                          >
                            {template.type === "email" ? (
                              <Mail className="w-3 h-3 mr-1" />
                            ) : (
                              <MessageSquare className="w-3 h-3 mr-1" />
                            )}
                            {template.type.toUpperCase()}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              template.category === "invoice"
                                ? "bg-cinema-yellow/20 text-cinema-yellow"
                                : template.category === "payment_reminder"
                                  ? "bg-blue-400/20 text-blue-400"
                                  : template.category === "overdue"
                                    ? "bg-red-400/20 text-red-400"
                                    : template.category === "receipt"
                                      ? "bg-green-400/20 text-green-400"
                                      : "bg-purple-400/20 text-purple-400"
                            }`}
                          >
                            {template.category === "invoice"
                              ? "Nota Fiscal"
                              : template.category === "payment_reminder"
                                ? "Lembrete"
                                : template.category === "overdue"
                                  ? "Cobrança"
                                  : template.category === "receipt"
                                    ? "Comprovante"
                                    : "Personalizado"}
                          </span>
                          {template.isDefault && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-400/20 text-orange-400">
                              Padrão
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-400 border-blue-400"
                          onClick={() => {
                            setEditingTemplate(template);
                            setNewTemplate(template);
                            setShowTemplateModal(true);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        {!template.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-400 border-red-400"
                            onClick={() => {
                              setTemplates((prev) =>
                                prev.filter((t) => t.id !== template.id),
                              );
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {template.subject && (
                      <div className="mb-3">
                        <Label className="text-gray-400 text-xs">
                          Assunto:
                        </Label>
                        <p className="text-white text-sm">{template.subject}</p>
                      </div>
                    )}
                    <div className="mb-3">
                      <Label className="text-gray-400 text-xs">Conteúdo:</Label>
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {template.content}
                      </p>
                    </div>
                    {template.variables.length > 0 && (
                      <div>
                        <Label className="text-gray-400 text-xs">
                          Variáveis:
                        </Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.variables.slice(0, 4).map((variable) => (
                            <span
                              key={variable}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-cinema-gray text-gray-300"
                            >
                              {`{{${variable}}}`}
                            </span>
                          ))}
                          {template.variables.length > 4 && (
                            <span className="text-xs text-gray-500">
                              +{template.variables.length - 4} mais
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">
              Histórico de Notificações
            </h3>

            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-cinema-gray-light">
                      <tr>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Cliente
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Categoria
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Enviado
                        </th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">
                          Custo
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {notificationHistory.map((notification) => {
                        const client = clients.find(
                          (c) => c.id === notification.clientId,
                        );
                        return (
                          <tr
                            key={notification.id}
                            className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter"
                          >
                            <td className="px-4 py-3 text-white">
                              {client?.name || "Cliente não encontrado"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                  notification.type === "email"
                                    ? "bg-blue-400/20 text-blue-400"
                                    : "bg-green-400/20 text-green-400"
                                }`}
                              >
                                {notification.type === "email" ? (
                                  <Mail className="w-3 h-3 mr-1" />
                                ) : (
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                )}
                                {notification.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-sm capitalize">
                              {notification.category}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getNotificationStatusColor(notification.status)}`}
                              >
                                {notification.status === "delivered"
                                  ? "Entregue"
                                  : notification.status === "sent"
                                    ? "Enviado"
                                    : notification.status === "failed"
                                      ? "Falhou"
                                      : "Pendente"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-sm">
                              {new Date(notification.sentAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-cinema-yellow">
                              R$ {notification.cost.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">
              Configurações de Notificação
            </h3>

            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white">
                  Configurações Globais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white text-sm">
                      Configurações Padrão para Novos Clientes
                    </Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                        <span className="text-gray-300 text-sm">
                          Email habilitado por padrão
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                        <span className="text-gray-300 text-sm">
                          SMS habilitado por padrão
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                        <span className="text-gray-300 text-sm">
                          Nota fiscal automática
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                        <span className="text-gray-300 text-sm">
                          Lembrete de vencimento
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                        <span className="text-gray-300 text-sm">
                          Cobrança automática
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                        <span className="text-gray-300 text-sm">
                          Comprovante de pagamento
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white text-sm">
                      Configurações de Envio
                    </Label>
                    <div className="space-y-3 mt-2">
                      <div>
                        <Label className="text-gray-400 text-xs">
                          Dias antes do vencimento para lembrete:
                        </Label>
                        <Input
                          type="number"
                          defaultValue="3"
                          className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-xs">
                          Frequência de cobrança:
                        </Label>
                        <select className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2">
                          <option value="daily">Diária</option>
                          <option value="weekly">Semanal</option>
                          <option value="monthly">Mensal</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-gray-400 text-xs">
                          Horário de envio:
                        </Label>
                        <Input
                          type="time"
                          defaultValue="09:00"
                          className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white">
                  Configurações de API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white text-sm">
                      Configurações de Email (SMTP)
                    </Label>
                    <div className="space-y-3 mt-2">
                      <div>
                        <Label className="text-gray-400 text-xs">
                          Servidor SMTP:
                        </Label>
                        <Input
                          placeholder="smtp.gmail.com"
                          className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-xs">Porta:</Label>
                        <Input
                          placeholder="587"
                          className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-xs">
                          Email do remetente:
                        </Label>
                        <Input
                          placeholder="noreply@empresa.com"
                          className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white text-sm">
                      Configurações de SMS
                    </Label>
                    <div className="space-y-3 mt-2">
                      <div>
                        <Label className="text-gray-400 text-xs">
                          Provedor SMS:
                        </Label>
                        <select className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2">
                          <option value="twilio">Twilio</option>
                          <option value="aws">AWS SNS</option>
                          <option value="zenvia">Zenvia</option>
                          <option value="totalvoice">TotalVoice</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-gray-400 text-xs">
                          API Key:
                        </Label>
                        <Input
                          type="password"
                          placeholder="****************"
                          className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-xs">
                          Número do remetente:
                        </Label>
                        <Input
                          placeholder="+5531999999999"
                          className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button className="bg-cinema-yellow text-cinema-dark">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </Button>
                  <Button
                    variant="outline"
                    className="text-cinema-yellow border-cinema-yellow"
                  >
                    Testar Conexão
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Enviar Notificação
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSendModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white">Template</Label>
                <select className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2">
                  <option value="">Selecionar Template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-white">Clientes Selecionados</Label>
                <div className="bg-cinema-dark-lighter border border-cinema-gray-light rounded-md p-3 max-h-32 overflow-y-auto">
                  {selectedClients.length > 0 ? (
                    selectedClients.map((clientId) => {
                      const client = clients.find((c) => c.id === clientId);
                      return client ? (
                        <div
                          key={clientId}
                          className="flex items-center justify-between py-1"
                        >
                          <span className="text-white text-sm">
                            {client.name}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setSelectedClients((prev) =>
                                prev.filter((id) => id !== clientId),
                              )
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : null;
                    })
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Nenhum cliente selecionado
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => {
                    // Simulate sending notification
                    sendNotification(selectedClients, templates[0]?.id || "");
                    setShowSendModal(false);
                    setSelectedClients([]);
                  }}
                  disabled={selectedClients.length === 0}
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Notificação
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 text-gray-400 border-gray-400 hover:text-white hover:border-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingClient ? "Editar Cliente" : "Novo Cliente"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowClientModal(false);
                  setEditingClient(null);
                  setNewClient({
                    name: "",
                    email: "",
                    phone: "",
                    cpf: "",
                    cnpj: "",
                    type: "individual",
                    status: "active",
                    notificationSettings: {
                      emailEnabled: true,
                      smsEnabled: true,
                      autoInvoiceEmail: true,
                      autoPaymentReminder: true,
                      autoOverdueNotification: true,
                      autoReceiptEmail: true,
                      reminderDaysBefore: 3,
                      overdueFrequency: "weekly",
                    },
                    totalDebt: 0,
                  });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-white font-semibold mb-3">
                  Informações Básicas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Nome/Razão Social *</Label>
                    <Input
                      value={newClient.name || ""}
                      onChange={(e) =>
                        setNewClient({ ...newClient, name: e.target.value })
                      }
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="Nome completo ou razão social"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-white">Tipo de Cliente</Label>
                    <select
                      value={newClient.type || "individual"}
                      onChange={(e) =>
                        setNewClient({
                          ...newClient,
                          type: e.target.value as "individual" | "company",
                        })
                      }
                      className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                    >
                      <option value="individual">Pessoa Física</option>
                      <option value="company">Pessoa Jurídica</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="text-white">Email *</Label>
                    <Input
                      type="email"
                      value={newClient.email || ""}
                      onChange={(e) =>
                        setNewClient({ ...newClient, email: e.target.value })
                      }
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-white">Telefone</Label>
                    <Input
                      value={newClient.phone || ""}
                      onChange={(e) =>
                        setNewClient({ ...newClient, phone: e.target.value })
                      }
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="(31) 99999-9999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {newClient.type === "individual" ? (
                    <div>
                      <Label className="text-white">CPF</Label>
                      <Input
                        value={newClient.cpf || ""}
                        onChange={(e) =>
                          setNewClient({ ...newClient, cpf: e.target.value })
                        }
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        placeholder="123.456.789-00"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label className="text-white">CNPJ</Label>
                      <Input
                        value={newClient.cnpj || ""}
                        onChange={(e) =>
                          setNewClient({ ...newClient, cnpj: e.target.value })
                        }
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        placeholder="12.345.678/0001-90"
                      />
                    </div>
                  )}
                  <div>
                    <Label className="text-white">Status</Label>
                    <select
                      value={newClient.status || "active"}
                      onChange={(e) =>
                        setNewClient({
                          ...newClient,
                          status: e.target.value as "active" | "inactive",
                        })
                      }
                      className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div>
                <h4 className="text-white font-semibold mb-3">
                  Configurações de Notificação
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white text-sm">
                      Canais de Comunicação
                    </Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={
                            newClient.notificationSettings?.emailEnabled ||
                            false
                          }
                          onChange={(e) =>
                            setNewClient({
                              ...newClient,
                              notificationSettings: {
                                ...newClient.notificationSettings!,
                                emailEnabled: e.target.checked,
                              },
                            })
                          }
                          className="rounded"
                        />
                        <span className="text-gray-300 text-sm">
                          Notificações por Email
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={
                            newClient.notificationSettings?.smsEnabled || false
                          }
                          onChange={(e) =>
                            setNewClient({
                              ...newClient,
                              notificationSettings: {
                                ...newClient.notificationSettings!,
                                smsEnabled: e.target.checked,
                              },
                            })
                          }
                          className="rounded"
                        />
                        <span className="text-gray-300 text-sm">
                          Notificações por SMS
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white text-sm">
                      Notificações Automáticas
                    </Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={
                            newClient.notificationSettings?.autoInvoiceEmail ||
                            false
                          }
                          onChange={(e) =>
                            setNewClient({
                              ...newClient,
                              notificationSettings: {
                                ...newClient.notificationSettings!,
                                autoInvoiceEmail: e.target.checked,
                              },
                            })
                          }
                          className="rounded"
                        />
                        <span className="text-gray-300 text-sm">
                          Nota fiscal automática
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={
                            newClient.notificationSettings
                              ?.autoPaymentReminder || false
                          }
                          onChange={(e) =>
                            setNewClient({
                              ...newClient,
                              notificationSettings: {
                                ...newClient.notificationSettings!,
                                autoPaymentReminder: e.target.checked,
                              },
                            })
                          }
                          className="rounded"
                        />
                        <span className="text-gray-300 text-sm">
                          Lembrete de vencimento
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={
                            newClient.notificationSettings
                              ?.autoOverdueNotification || false
                          }
                          onChange={(e) =>
                            setNewClient({
                              ...newClient,
                              notificationSettings: {
                                ...newClient.notificationSettings!,
                                autoOverdueNotification: e.target.checked,
                              },
                            })
                          }
                          className="rounded"
                        />
                        <span className="text-gray-300 text-sm">
                          Cobrança automática
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={
                            newClient.notificationSettings?.autoReceiptEmail ||
                            false
                          }
                          onChange={(e) =>
                            setNewClient({
                              ...newClient,
                              notificationSettings: {
                                ...newClient.notificationSettings!,
                                autoReceiptEmail: e.target.checked,
                              },
                            })
                          }
                          className="rounded"
                        />
                        <span className="text-gray-300 text-sm">
                          Comprovante de pagamento
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="text-white text-sm">
                      Dias antes do vencimento para lembrete
                    </Label>
                    <Input
                      type="number"
                      value={
                        newClient.notificationSettings?.reminderDaysBefore || 3
                      }
                      onChange={(e) =>
                        setNewClient({
                          ...newClient,
                          notificationSettings: {
                            ...newClient.notificationSettings!,
                            reminderDaysBefore: parseInt(e.target.value) || 3,
                          },
                        })
                      }
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white text-sm">
                      Frequência de cobrança
                    </Label>
                    <select
                      value={
                        newClient.notificationSettings?.overdueFrequency ||
                        "weekly"
                      }
                      onChange={(e) =>
                        setNewClient({
                          ...newClient,
                          notificationSettings: {
                            ...newClient.notificationSettings!,
                            overdueFrequency: e.target.value as
                              | "daily"
                              | "weekly"
                              | "monthly",
                          },
                        })
                      }
                      className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                    >
                      <option value="daily">Diária</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleSaveClient}
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingClient ? "Atualizar Cliente" : "Cadastrar Cliente"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowClientModal(false);
                    setEditingClient(null);
                  }}
                  className="flex-1 text-gray-400 border-gray-400 hover:text-white hover:border-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingTemplate ? "Editar Template" : "Novo Template"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTemplateModal(false);
                  setEditingTemplate(null);
                  setNewTemplate({
                    name: "",
                    type: "email",
                    category: "custom",
                    subject: "",
                    content: "",
                    isDefault: false,
                    variables: [],
                  });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Nome do Template *</Label>
                  <Input
                    value={newTemplate.name || ""}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, name: e.target.value })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="Nome do template"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Tipo</Label>
                  <select
                    value={newTemplate.type || "email"}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        type: e.target.value as "email" | "sms",
                      })
                    }
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                <div>
                  <Label className="text-white">Categoria</Label>
                  <select
                    value={newTemplate.category || "custom"}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  >
                    <option value="invoice">Nota Fiscal</option>
                    <option value="payment_reminder">
                      Lembrete de Pagamento
                    </option>
                    <option value="overdue">Cobrança</option>
                    <option value="receipt">Comprovante</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>
              </div>

              {newTemplate.type === "email" && (
                <div>
                  <Label className="text-white">Assunto</Label>
                  <Input
                    value={newTemplate.subject || ""}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        subject: e.target.value,
                      })
                    }
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="Assunto do email"
                  />
                </div>
              )}

              <div>
                <Label className="text-white">Conteúdo *</Label>
                <textarea
                  value={newTemplate.content || ""}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, content: e.target.value })
                  }
                  className="w-full h-40 bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 resize-none"
                  placeholder="Conteúdo da mensagem. Use {{variavel}} para inserir dados dinâmicos."
                  required
                />
                <p className="text-gray-400 text-xs mt-1">
                  Variáveis disponíveis:{" "}
                  {`{{clientName}}, {{amount}}, {{invoiceNumber}}, {{dueDate}}, {{companyName}}`}
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleSaveTemplate}
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingTemplate ? "Atualizar Template" : "Criar Template"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTemplateModal(false);
                    setEditingTemplate(null);
                  }}
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
