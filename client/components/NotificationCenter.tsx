import React, { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  BellRing,
  X,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  RefreshCw,
  ChevronRight,
  Volume2,
  VolumeX,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Tipos
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'client' | 'product' | 'payment';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// Notificações mockadas
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Novo Pedido!',
    message: 'Maria Silva fez um novo pedido de locação',
    timestamp: new Date(Date.now() - 5 * 60000),
    read: false,
    actionUrl: '/pedidos',
    actionLabel: 'Ver pedido'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Devolução Pendente',
    message: 'Equipamento "Câmera Canon 5D" deveria ter sido devolvido hoje',
    timestamp: new Date(Date.now() - 30 * 60000),
    read: false,
    actionUrl: '/pedidos',
    actionLabel: 'Ver detalhes'
  },
  {
    id: '3',
    type: 'success',
    title: 'Pagamento Recebido',
    message: 'R$ 450,00 de João Santos foi confirmado',
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    read: false,
  },
  {
    id: '4',
    type: 'client',
    title: 'Novo Cliente',
    message: 'Ana Costa se cadastrou no sistema',
    timestamp: new Date(Date.now() - 3 * 60 * 60000),
    read: true,
    actionUrl: '/clientes',
    actionLabel: 'Ver perfil'
  },
  {
    id: '5',
    type: 'product',
    title: 'Estoque Baixo',
    message: 'Tripé Profissional tem apenas 2 unidades disponíveis',
    timestamp: new Date(Date.now() - 5 * 60 * 60000),
    read: true,
  },
  {
    id: '6',
    type: 'info',
    title: 'Backup Concluído',
    message: 'Backup automático realizado com sucesso',
    timestamp: new Date(Date.now() - 24 * 60 * 60000),
    read: true,
  },
];

// Hook para gerenciar notificações
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [settings, setSettings] = useState({
    sound: true,
    push: false,
    email: true,
    desktop: true,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Adicionar nova notificação
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Tocar som se habilitado
    if (settings.sound) {
      // Em produção, tocar som de notificação
      console.log('🔔 Som de notificação');
    }
    
    // Mostrar notificação desktop se habilitado
    if (settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.png'
      });
    }
  };

  // Solicitar permissão para notificações
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setSettings(prev => ({ ...prev, push: true, desktop: true }));
        return true;
      }
    }
    return false;
  };

  return {
    notifications,
    unreadCount,
    settings,
    setSettings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
    requestPermission,
  };
}

// Componente do Centro de Notificações
export function NotificationCenter() {
  const { toast } = useToast();
  const {
    notifications,
    unreadCount,
    settings,
    setSettings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    requestPermission,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Ícone por tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4 text-blue-400" />;
      case 'client': return <Users className="h-4 w-4 text-purple-400" />;
      case 'product': return <Package className="h-4 w-4 text-amber-400" />;
      case 'payment': return <DollarSign className="h-4 w-4 text-green-400" />;
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
      default: return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  // Cor de fundo por tipo
  const getTypeBg = (type: string) => {
    switch (type) {
      case 'order': return 'bg-blue-500/20';
      case 'client': return 'bg-purple-500/20';
      case 'product': return 'bg-amber-500/20';
      case 'payment': return 'bg-green-500/20';
      case 'success': return 'bg-green-500/20';
      case 'warning': return 'bg-amber-500/20';
      case 'error': return 'bg-red-500/20';
      default: return 'bg-blue-500/20';
    }
  };

  // Formatar tempo relativo
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  // Habilitar notificações push
  const enablePush = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast({
        title: "Notificações ativadas!",
        description: "Você receberá alertas importantes",
      });
    } else {
      toast({
        title: "Permissão negada",
        description: "Ative nas configurações do navegador",
        variant: "destructive"
      });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 animate-pulse text-amber-400" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0 bg-slate-900 border-slate-700" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">
                  {unreadCount} novas
                </Badge>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Marcar todas
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Configurações */}
        {showSettings ? (
          <div className="p-4 space-y-4">
            <h4 className="font-medium text-sm text-slate-400">Configurações de Notificações</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  <span className="text-sm">Som</span>
                </div>
                <Switch
                  checked={settings.sound}
                  onCheckedChange={(checked) => setSettings({ ...settings, sound: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm">Push (navegador)</span>
                </div>
                <Switch
                  checked={settings.push}
                  onCheckedChange={async (checked) => {
                    if (checked) {
                      await enablePush();
                    } else {
                      setSettings({ ...settings, push: false });
                    }
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="text-sm">Desktop</span>
                </div>
                <Switch
                  checked={settings.desktop}
                  onCheckedChange={(checked) => setSettings({ ...settings, desktop: checked })}
                />
              </div>
            </div>
            
            <Button
              variant="ghost"
              className="w-full text-slate-400"
              onClick={() => setShowSettings(false)}
            >
              ← Voltar
            </Button>
          </div>
        ) : (
          /* Lista de Notificações */
          <>
            <ScrollArea className="h-[400px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <BellOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-slate-800/50 transition-colors ${
                        !notification.read ? 'bg-slate-800/30' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${getTypeBg(notification.type)}`}>
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`font-medium text-sm ${!notification.read ? 'text-white' : 'text-slate-300'}`}>
                              {notification.title}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notification.read && (
                                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                              )}
                              <span className="text-xs text-slate-500">
                                {formatTime(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          {notification.actionUrl && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-amber-400 mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = notification.actionUrl!;
                              }}
                            >
                              {notification.actionLabel || 'Ver mais'}
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-red-950/30 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2 border-t border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-slate-400"
                  onClick={clearAll}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar todas
                </Button>
              </div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default NotificationCenter;

