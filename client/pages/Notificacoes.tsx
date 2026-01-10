import React, { useState } from "react";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Clock,
  DollarSign,
  Package,
  Calendar,
  AlertTriangle,
  MessageCircle,
  FileText,
  User,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Search,
  MoreVertical,
  Mail,
  Smartphone,
  Send,
  X,
  ChevronRight,
  Star,
  Zap,
  TrendingUp,
  Camera,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Tipos
interface Notification {
  id: string;
  type: 'payment' | 'order' | 'return' | 'message' | 'maintenance' | 'system' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  data?: Record<string, any>;
}

// Dados mockados
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Pagamento Recebido!',
    description: 'Globo Filmes confirmou pagamento de R$ 5.000,00 - Pedido #PED-001',
    timestamp: new Date(2026, 0, 10, 14, 30),
    read: false,
    priority: 'high',
    data: { orderId: 'PED-001', amount: 5000 }
  },
  {
    id: '2',
    type: 'order',
    title: 'Nova Reserva',
    description: 'Maria Santos fez uma reserva para 08/01 - Kit Iluminação LED',
    timestamp: new Date(2026, 0, 10, 12, 0),
    read: false,
    priority: 'medium',
    data: { orderId: 'PED-002' }
  },
  {
    id: '3',
    type: 'return',
    title: 'Devolução Hoje',
    description: 'Produtora XYZ deve devolver equipamentos hoje às 18h',
    timestamp: new Date(2026, 0, 10, 9, 0),
    read: false,
    priority: 'high',
    data: { orderId: 'PED-004' }
  },
  {
    id: '4',
    type: 'message',
    title: 'Nova Mensagem',
    description: 'Carlos Henrique enviou uma mensagem sobre a reserva',
    timestamp: new Date(2026, 0, 10, 8, 30),
    read: true,
    priority: 'medium',
  },
  {
    id: '5',
    type: 'alert',
    title: 'Pagamento Atrasado',
    description: 'Produtora XYZ com pagamento em atraso há 5 dias - R$ 4.500,00',
    timestamp: new Date(2026, 0, 9, 10, 0),
    read: true,
    priority: 'high',
    data: { orderId: 'PED-004', amount: 4500 }
  },
  {
    id: '6',
    type: 'maintenance',
    title: 'Manutenção Preventiva',
    description: 'Canon C300 Mark III (#CAM-001) precisa de revisão',
    timestamp: new Date(2026, 0, 8, 14, 0),
    read: true,
    priority: 'medium',
  },
  {
    id: '7',
    type: 'system',
    title: 'Backup Concluído',
    description: 'Backup automático realizado com sucesso',
    timestamp: new Date(2026, 0, 8, 3, 0),
    read: true,
    priority: 'low',
  },
  {
    id: '8',
    type: 'order',
    title: 'Retirada Confirmada',
    description: 'Festival BH retirou os equipamentos - Kit Áudio Sennheiser',
    timestamp: new Date(2026, 0, 7, 10, 0),
    read: true,
    priority: 'medium',
  },
];

// Configurações de notificação
const NOTIFICATION_SETTINGS = [
  { id: 'payment', label: 'Pagamentos', description: 'Receber alertas de pagamentos', email: true, push: true, whatsapp: true },
  { id: 'order', label: 'Pedidos', description: 'Novas reservas e alterações', email: true, push: true, whatsapp: false },
  { id: 'return', label: 'Devoluções', description: 'Lembretes de devolução', email: true, push: true, whatsapp: true },
  { id: 'message', label: 'Mensagens', description: 'Novas mensagens de clientes', email: false, push: true, whatsapp: false },
  { id: 'maintenance', label: 'Manutenção', description: 'Alertas de manutenção', email: true, push: true, whatsapp: false },
  { id: 'alert', label: 'Alertas', description: 'Inadimplência e urgências', email: true, push: true, whatsapp: true },
];

export default function Notificacoes() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [settings, setSettings] = useState(NOTIFICATION_SETTINGS);

  // Filtrar notificações
  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = !searchTerm || 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !n.read) ||
      n.type === filter;
    return matchesSearch && matchesFilter;
  });

  // Contadores
  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.read).length;

  // Marcar como lida
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Excluir notificação
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Ícone por tipo
  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment': return <DollarSign className="h-5 w-5" />;
      case 'order': return <Package className="h-5 w-5" />;
      case 'return': return <Calendar className="h-5 w-5" />;
      case 'message': return <MessageCircle className="h-5 w-5" />;
      case 'maintenance': return <Wrench className="h-5 w-5" />;
      case 'alert': return <AlertTriangle className="h-5 w-5" />;
      case 'system': return <Settings className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  // Cor por tipo
  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'payment': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'order': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'return': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'message': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'maintenance': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'alert': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'system': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Formatar tempo
  const formatTime = (date: Date) => {
    const now = new Date(2026, 0, 10, 15, 0);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl relative">
                <Bell className="h-6 w-6 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Central de Notificações</h1>
                <p className="text-sm text-slate-400">
                  {unreadCount} não lidas • {highPriorityCount} urgentes
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="border-slate-600"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas
              </Button>
              <Button
                onClick={() => setShowSendModal(true)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Notificação
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-700">
              <BellRing className="h-4 w-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar notificações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Filtrar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="unread">Não lidas</SelectItem>
                  <SelectItem value="payment">Pagamentos</SelectItem>
                  <SelectItem value="order">Pedidos</SelectItem>
                  <SelectItem value="return">Devoluções</SelectItem>
                  <SelectItem value="message">Mensagens</SelectItem>
                  <SelectItem value="alert">Alertas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-red-950/50 to-rose-950/50 border-red-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                    <div>
                      <p className="text-2xl font-bold text-red-400">{highPriorityCount}</p>
                      <p className="text-xs text-slate-400">Urgentes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-950/50 to-emerald-950/50 border-green-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-green-400" />
                    <div>
                      <p className="text-2xl font-bold text-green-400">
                        {notifications.filter(n => n.type === 'payment').length}
                      </p>
                      <p className="text-xs text-slate-400">Pagamentos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-950/50 to-cyan-950/50 border-blue-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-blue-400" />
                    <div>
                      <p className="text-2xl font-bold text-blue-400">
                        {notifications.filter(n => n.type === 'order').length}
                      </p>
                      <p className="text-xs text-slate-400">Pedidos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-950/50 to-violet-950/50 border-purple-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-purple-400" />
                    <div>
                      <p className="text-2xl font-bold text-purple-400">
                        {notifications.filter(n => n.type === 'return').length}
                      </p>
                      <p className="text-xs text-slate-400">Devoluções</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Notificações */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                      <Bell className="h-12 w-12 mb-4 opacity-50" />
                      <p>Nenhuma notificação encontrada</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification, idx) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "flex items-start gap-4 p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer",
                          !notification.read && "bg-slate-800/50"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className={cn(
                          "p-2 rounded-lg border",
                          getTypeColor(notification.type)
                        )}>
                          {getTypeIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className={cn(
                                  "font-medium",
                                  !notification.read && "text-white"
                                )}>
                                  {notification.title}
                                </h3>
                                {notification.priority === 'high' && (
                                  <Badge className="bg-red-500/20 text-red-400 text-xs">Urgente</Badge>
                                )}
                                {!notification.read && (
                                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                                )}
                              </div>
                              <p className="text-sm text-slate-400 mt-1">{notification.description}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-slate-500">{formatTime(notification.timestamp)}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-red-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>Configure como deseja receber cada tipo de notificação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Cabeçalho */}
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium text-slate-400 pb-2 border-b border-slate-700">
                    <div>Tipo</div>
                    <div className="text-center flex items-center justify-center gap-1">
                      <Mail className="h-4 w-4" /> Email
                    </div>
                    <div className="text-center flex items-center justify-center gap-1">
                      <Bell className="h-4 w-4" /> Push
                    </div>
                    <div className="text-center flex items-center justify-center gap-1">
                      <Smartphone className="h-4 w-4" /> WhatsApp
                    </div>
                  </div>

                  {/* Configurações */}
                  {settings.map(setting => (
                    <div key={setting.id} className="grid grid-cols-4 gap-4 items-center py-3 border-b border-slate-800">
                      <div>
                        <p className="font-medium">{setting.label}</p>
                        <p className="text-xs text-slate-500">{setting.description}</p>
                      </div>
                      <div className="flex justify-center">
                        <Switch 
                          checked={setting.email}
                          onCheckedChange={(checked) => {
                            setSettings(prev => prev.map(s => 
                              s.id === setting.id ? { ...s, email: checked } : s
                            ));
                          }}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Switch 
                          checked={setting.push}
                          onCheckedChange={(checked) => {
                            setSettings(prev => prev.map(s => 
                              s.id === setting.id ? { ...s, push: checked } : s
                            ));
                          }}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Switch 
                          checked={setting.whatsapp}
                          onCheckedChange={(checked) => {
                            setSettings(prev => prev.map(s => 
                              s.id === setting.id ? { ...s, whatsapp: checked } : s
                            ));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal Enviar Notificação */}
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle>Enviar Notificação</DialogTitle>
            <DialogDescription>Envie uma notificação para clientes ou equipe</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Destinatário</Label>
              <Select defaultValue="all">
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  <SelectItem value="active">Clientes com locação ativa</SelectItem>
                  <SelectItem value="overdue">Clientes inadimplentes</SelectItem>
                  <SelectItem value="team">Equipe interna</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Título</Label>
              <Input className="bg-slate-800 border-slate-700" placeholder="Ex: Promoção de fim de ano!" />
            </div>

            <div>
              <Label>Mensagem</Label>
              <Textarea className="bg-slate-800 border-slate-700 min-h-[100px]" placeholder="Digite sua mensagem..." />
            </div>

            <div>
              <Label>Enviar via</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <Mail className="h-4 w-4" /> Email
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <Bell className="h-4 w-4" /> Push
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <Smartphone className="h-4 w-4" /> WhatsApp
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendModal(false)} className="border-slate-600">
              Cancelar
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

