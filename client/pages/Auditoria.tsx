import React, { useState, useEffect } from "react";
import {
  Shield,
  Eye,
  Clock,
  User,
  Activity,
  Filter,
  Search,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Plus,
  LogIn,
  LogOut,
  Settings,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Database,
  Key,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

// Tipos
interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import' | 'config';
  resource: string;
  resourceId?: string;
  resourceName?: string;
  details?: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress: string;
  userAgent: string;
  device: 'desktop' | 'mobile' | 'tablet';
  location?: string;
  status: 'success' | 'failure' | 'warning';
}

// Dados mockados
const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 5 * 60000),
    userId: 'user1',
    userName: 'Felipe Admin',
    userRole: 'ADMIN',
    action: 'update',
    resource: 'Produto',
    resourceId: 'prod123',
    resourceName: 'Câmera Canon 5D',
    details: 'Atualizou preço de locação',
    changes: [
      { field: 'dailyRate', oldValue: 150, newValue: 180 },
      { field: 'weeklyRate', oldValue: 750, newValue: 900 }
    ],
    ipAddress: '192.168.1.10',
    userAgent: 'Chrome/120.0.0.0',
    device: 'desktop',
    location: 'São Paulo, SP',
    status: 'success'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 15 * 60000),
    userId: 'user2',
    userName: 'Maria Operadora',
    userRole: 'OPERATOR',
    action: 'create',
    resource: 'Pedido',
    resourceId: 'ord456',
    resourceName: 'Pedido #456',
    details: 'Criou novo pedido de locação',
    ipAddress: '192.168.1.25',
    userAgent: 'Safari/17.0',
    device: 'mobile',
    location: 'São Paulo, SP',
    status: 'success'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 30 * 60000),
    userId: 'user1',
    userName: 'Felipe Admin',
    userRole: 'ADMIN',
    action: 'login',
    resource: 'Sistema',
    details: 'Login realizado com sucesso',
    ipAddress: '192.168.1.10',
    userAgent: 'Chrome/120.0.0.0',
    device: 'desktop',
    location: 'São Paulo, SP',
    status: 'success'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 45 * 60000),
    userId: 'user3',
    userName: 'João Tentativa',
    userRole: 'USER',
    action: 'login',
    resource: 'Sistema',
    details: 'Tentativa de login com senha incorreta',
    ipAddress: '45.67.89.123',
    userAgent: 'Firefox/121.0',
    device: 'desktop',
    location: 'Rio de Janeiro, RJ',
    status: 'failure'
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 60 * 60000),
    userId: 'user1',
    userName: 'Felipe Admin',
    userRole: 'ADMIN',
    action: 'delete',
    resource: 'Cliente',
    resourceId: 'cli789',
    resourceName: 'Cliente Teste',
    details: 'Removeu cliente inativo',
    ipAddress: '192.168.1.10',
    userAgent: 'Chrome/120.0.0.0',
    device: 'desktop',
    status: 'success'
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    userId: 'user1',
    userName: 'Felipe Admin',
    userRole: 'ADMIN',
    action: 'config',
    resource: 'Configurações',
    details: 'Alterou configurações de backup',
    changes: [
      { field: 'backupFrequency', oldValue: 'daily', newValue: 'hourly' },
      { field: 'backupRetention', oldValue: 7, newValue: 30 }
    ],
    ipAddress: '192.168.1.10',
    userAgent: 'Chrome/120.0.0.0',
    device: 'desktop',
    status: 'success'
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 3 * 60 * 60000),
    userId: 'user2',
    userName: 'Maria Operadora',
    userRole: 'OPERATOR',
    action: 'export',
    resource: 'Relatório',
    details: 'Exportou relatório de vendas do mês',
    ipAddress: '192.168.1.25',
    userAgent: 'Safari/17.0',
    device: 'tablet',
    status: 'success'
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 5 * 60 * 60000),
    userId: 'user1',
    userName: 'Felipe Admin',
    userRole: 'ADMIN',
    action: 'import',
    resource: 'Produtos',
    details: 'Importou 45 produtos via planilha Excel',
    ipAddress: '192.168.1.10',
    userAgent: 'Chrome/120.0.0.0',
    device: 'desktop',
    status: 'success'
  },
];

export default function Auditoria() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  // Filtrar logs
  useEffect(() => {
    let filtered = logs;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.userName.toLowerCase().includes(term) ||
        log.resource.toLowerCase().includes(term) ||
        log.resourceName?.toLowerCase().includes(term) ||
        log.details?.toLowerCase().includes(term)
      );
    }
    
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }
    
    setFilteredLogs(filtered);
  }, [logs, searchTerm, actionFilter, statusFilter]);

  // Ícone de ação
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus className="h-4 w-4 text-green-400" />;
      case 'read': return <Eye className="h-4 w-4 text-blue-400" />;
      case 'update': return <Edit className="h-4 w-4 text-amber-400" />;
      case 'delete': return <Trash2 className="h-4 w-4 text-red-400" />;
      case 'login': return <LogIn className="h-4 w-4 text-cyan-400" />;
      case 'logout': return <LogOut className="h-4 w-4 text-slate-400" />;
      case 'export': return <Download className="h-4 w-4 text-purple-400" />;
      case 'import': return <Database className="h-4 w-4 text-emerald-400" />;
      case 'config': return <Settings className="h-4 w-4 text-orange-400" />;
      default: return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  // Label de ação
  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'Criou',
      read: 'Visualizou',
      update: 'Atualizou',
      delete: 'Removeu',
      login: 'Login',
      logout: 'Logout',
      export: 'Exportou',
      import: 'Importou',
      config: 'Configurou'
    };
    return labels[action] || action;
  };

  // Cor de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Sucesso</Badge>;
      case 'failure':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Falha</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Aviso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Ícone de dispositivo
  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Monitor className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  // Formatar data relativa
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  // Toggle expandido
  const toggleExpanded = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  // Exportar logs
  const exportLogs = () => {
    const csv = [
      ['Data/Hora', 'Usuário', 'Ação', 'Recurso', 'Detalhes', 'IP', 'Status'].join(';'),
      ...filteredLogs.map(log => [
        log.timestamp.toLocaleString('pt-BR'),
        log.userName,
        getActionLabel(log.action),
        log.resourceName || log.resource,
        log.details || '',
        log.ipAddress,
        log.status
      ].join(';'))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Logs exportados!",
      description: `${filteredLogs.length} registros exportados`,
    });
  };

  // Estatísticas
  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    failure: logs.filter(l => l.status === 'failure').length,
    logins: logs.filter(l => l.action === 'login').length,
    changes: logs.filter(l => ['create', 'update', 'delete'].includes(l.action)).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Auditoria de Segurança</h1>
                <p className="text-sm text-slate-400">Rastreie todas as ações do sistema</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogs([...MOCK_AUDIT_LOGS])}
                className="border-slate-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportLogs}
                className="border-slate-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4 text-center">
              <Activity className="h-6 w-6 mx-auto mb-2 text-slate-400" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-slate-400">Total de Logs</p>
            </CardContent>
          </Card>
          <Card className="bg-green-950/30 border-green-500/30">
            <CardContent className="pt-4 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-400" />
              <p className="text-2xl font-bold text-green-400">{stats.success}</p>
              <p className="text-xs text-slate-400">Sucesso</p>
            </CardContent>
          </Card>
          <Card className="bg-red-950/30 border-red-500/30">
            <CardContent className="pt-4 text-center">
              <XCircle className="h-6 w-6 mx-auto mb-2 text-red-400" />
              <p className="text-2xl font-bold text-red-400">{stats.failure}</p>
              <p className="text-xs text-slate-400">Falhas</p>
            </CardContent>
          </Card>
          <Card className="bg-cyan-950/30 border-cyan-500/30">
            <CardContent className="pt-4 text-center">
              <LogIn className="h-6 w-6 mx-auto mb-2 text-cyan-400" />
              <p className="text-2xl font-bold text-cyan-400">{stats.logins}</p>
              <p className="text-xs text-slate-400">Logins</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-950/30 border-amber-500/30">
            <CardContent className="pt-4 text-center">
              <Edit className="h-6 w-6 mx-auto mb-2 text-amber-400" />
              <p className="text-2xl font-bold text-amber-400">{stats.changes}</p>
              <p className="text-xs text-slate-400">Alterações</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por usuário, recurso ou detalhe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Ações</SelectItem>
                  <SelectItem value="create">Criação</SelectItem>
                  <SelectItem value="update">Atualização</SelectItem>
                  <SelectItem value="delete">Exclusão</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="export">Exportação</SelectItem>
                  <SelectItem value="import">Importação</SelectItem>
                  <SelectItem value="config">Configuração</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="failure">Falha</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Logs */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle>Registro de Atividades</CardTitle>
            <CardDescription>
              {filteredLogs.length} de {logs.length} registros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredLogs.map(log => (
                  <Collapsible
                    key={log.id}
                    open={expandedLogs.has(log.id)}
                    onOpenChange={() => toggleExpanded(log.id)}
                  >
                    <div className={`p-4 rounded-lg border transition-all ${
                      log.status === 'failure' 
                        ? 'bg-red-950/20 border-red-500/30' 
                        : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                    }`}>
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center gap-4">
                          {/* Ícone e Usuário */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className={`${
                                log.userRole === 'ADMIN' ? 'bg-amber-500/20 text-amber-400' :
                                log.userRole === 'OPERATOR' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-slate-600 text-slate-300'
                              }`}>
                                {log.userName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                              <p className="font-medium flex items-center gap-2">
                                {log.userName}
                                {log.userRole === 'ADMIN' && (
                                  <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                                    Admin
                                  </Badge>
                                )}
                              </p>
                              <p className="text-xs text-slate-400">{log.ipAddress}</p>
                            </div>
                          </div>
                          
                          {/* Ação */}
                          <div className="flex-1 flex items-center gap-3">
                            <div className="p-2 bg-slate-700 rounded-lg">
                              {getActionIcon(log.action)}
                            </div>
                            <div className="text-left">
                              <p className="font-medium">
                                {getActionLabel(log.action)} {log.resourceName || log.resource}
                              </p>
                              {log.details && (
                                <p className="text-sm text-slate-400 truncate max-w-[300px]">
                                  {log.details}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Status e Tempo */}
                          <div className="flex items-center gap-4 flex-shrink-0">
                            {getStatusBadge(log.status)}
                            <div className="flex items-center gap-1 text-slate-400">
                              {getDeviceIcon(log.device)}
                            </div>
                            <span className="text-sm text-slate-400 w-20 text-right">
                              {formatRelativeTime(log.timestamp)}
                            </span>
                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${
                              expandedLogs.has(log.id) ? 'rotate-180' : ''
                            }`} />
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="mt-4 pt-4 border-t border-slate-600 space-y-4">
                          {/* Detalhes */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400">Data/Hora</p>
                              <p>{log.timestamp.toLocaleString('pt-BR')}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Dispositivo</p>
                              <p className="capitalize">{log.device}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Navegador</p>
                              <p>{log.userAgent}</p>
                            </div>
                            {log.location && (
                              <div>
                                <p className="text-slate-400">Localização</p>
                                <p className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {log.location}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {/* Alterações */}
                          {log.changes && log.changes.length > 0 && (
                            <div>
                              <p className="text-sm text-slate-400 mb-2">Alterações:</p>
                              <div className="bg-slate-800 rounded-lg p-3 space-y-2">
                                {log.changes.map((change, idx) => (
                                  <div key={idx} className="flex items-center gap-4 text-sm">
                                    <span className="text-slate-400 font-mono">{change.field}</span>
                                    <span className="text-red-400 line-through">{JSON.stringify(change.oldValue)}</span>
                                    <span>→</span>
                                    <span className="text-green-400">{JSON.stringify(change.newValue)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
                
                {filteredLogs.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum log encontrado com os filtros atuais</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Log</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              {/* Conteúdo detalhado */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

