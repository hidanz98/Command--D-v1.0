import React, { useState } from "react";
import {
  Users,
  UserPlus,
  UserCog,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Crown,
  Briefcase,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Unlock,
  Key,
  Settings,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Info,
  Loader2,
  Copy,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  usePermissions,
  RequirePermission,
  UserRole,
  Permission,
  ROLE_LABELS,
  ROLE_COLORS,
  ROLE_DESCRIPTIONS,
} from "@/context/PermissionsContext";

// Tipos
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  lastLogin?: Date;
  createdAt: Date;
  twoFactorEnabled: boolean;
  customPermissions?: Permission[];
}

// Usuários mockados
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Felipe Souza',
    email: 'felipe@empresa.com',
    phone: '(11) 99999-0001',
    role: 'OWNER',
    status: 'active',
    lastLogin: new Date(Date.now() - 5 * 60000),
    createdAt: new Date('2024-01-01'),
    twoFactorEnabled: true,
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@empresa.com',
    phone: '(11) 99999-0002',
    role: 'MANAGER',
    status: 'active',
    lastLogin: new Date(Date.now() - 2 * 60 * 60000),
    createdAt: new Date('2024-03-15'),
    twoFactorEnabled: true,
  },
  {
    id: '3',
    name: 'João Silva',
    email: 'joao@empresa.com',
    phone: '(11) 99999-0003',
    role: 'OPERATOR',
    status: 'active',
    lastLogin: new Date(Date.now() - 24 * 60 * 60000),
    createdAt: new Date('2024-06-01'),
    twoFactorEnabled: false,
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@empresa.com',
    role: 'VIEWER',
    status: 'inactive',
    createdAt: new Date('2024-08-01'),
    twoFactorEnabled: false,
  },
  {
    id: '5',
    name: 'Pedro Lima',
    email: 'pedro@empresa.com',
    role: 'OPERATOR',
    status: 'pending',
    createdAt: new Date('2024-12-01'),
    twoFactorEnabled: false,
  },
];

// Grupos de permissões para exibição
const PERMISSION_GROUPS = {
  'Produtos': [
    { key: 'products.view', label: 'Visualizar produtos' },
    { key: 'products.create', label: 'Criar produtos' },
    { key: 'products.edit', label: 'Editar produtos' },
    { key: 'products.delete', label: 'Excluir produtos' },
    { key: 'products.import', label: 'Importar produtos' },
    { key: 'products.export', label: 'Exportar produtos' },
  ],
  'Clientes': [
    { key: 'clients.view', label: 'Visualizar clientes' },
    { key: 'clients.create', label: 'Criar clientes' },
    { key: 'clients.edit', label: 'Editar clientes' },
    { key: 'clients.delete', label: 'Excluir clientes' },
    { key: 'clients.export', label: 'Exportar clientes' },
  ],
  'Pedidos': [
    { key: 'orders.view', label: 'Visualizar pedidos' },
    { key: 'orders.create', label: 'Criar pedidos' },
    { key: 'orders.edit', label: 'Editar pedidos' },
    { key: 'orders.cancel', label: 'Cancelar pedidos' },
    { key: 'orders.return', label: 'Registrar devoluções' },
    { key: 'orders.export', label: 'Exportar pedidos' },
  ],
  'Financeiro': [
    { key: 'finance.view', label: 'Visualizar financeiro' },
    { key: 'finance.reports', label: 'Ver relatórios' },
    { key: 'finance.payments', label: 'Gerenciar pagamentos' },
    { key: 'finance.refunds', label: 'Processar reembolsos' },
  ],
  'Usuários': [
    { key: 'users.view', label: 'Visualizar usuários' },
    { key: 'users.create', label: 'Criar usuários' },
    { key: 'users.edit', label: 'Editar usuários' },
    { key: 'users.delete', label: 'Excluir usuários' },
    { key: 'users.permissions', label: 'Gerenciar permissões' },
  ],
  'Configurações': [
    { key: 'settings.view', label: 'Ver configurações' },
    { key: 'settings.edit', label: 'Editar configurações' },
    { key: 'settings.security', label: 'Config. de segurança' },
    { key: 'settings.backup', label: 'Gerenciar backups' },
  ],
  'Sistema': [
    { key: 'system.audit', label: 'Ver auditoria' },
    { key: 'system.diagnostics', label: 'Diagnóstico do sistema' },
    { key: 'system.import', label: 'Importar dados' },
    { key: 'system.export', label: 'Exportar dados' },
  ],
  'Dashboard': [
    { key: 'dashboard.view', label: 'Ver dashboard básico' },
    { key: 'dashboard.premium', label: 'Dashboard premium' },
    { key: 'dashboard.reports', label: 'Relatórios avançados' },
  ],
};

export default function Usuarios() {
  const { toast } = useToast();
  const { hasPermission, isAtLeast, role: currentUserRole, getRolePermissions } = usePermissions();
  
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'OPERATOR' as UserRole,
    sendInvite: true,
  });

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Inativo</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pendente</Badge>;
      default:
        return null;
    }
  };

  // Role icon
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'MASTER_ADMIN': return <Crown className="h-4 w-4 text-purple-400" />;
      case 'OWNER': return <Crown className="h-4 w-4 text-amber-400" />;
      case 'MANAGER': return <Briefcase className="h-4 w-4 text-blue-400" />;
      case 'OPERATOR': return <UserCog className="h-4 w-4 text-green-400" />;
      case 'VIEWER': return <Eye className="h-4 w-4 text-slate-400" />;
    }
  };

  // Formatar última atividade
  const formatLastActivity = (date?: Date) => {
    if (!date) return 'Nunca';
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

  // Abrir dialog de criar/editar
  const openUserDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        sendInvite: false,
      });
      setIsEditing(true);
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'OPERATOR',
        sendInvite: true,
      });
      setIsEditing(false);
    }
    setShowUserDialog(true);
  };

  // Salvar usuário
  const handleSaveUser = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome e e-mail",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isEditing && selectedUser) {
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id 
            ? { ...u, ...formData }
            : u
        ));
        toast({
          title: "Usuário atualizado!",
          description: `${formData.name} foi atualizado com sucesso`,
        });
      } else {
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          status: formData.sendInvite ? 'pending' : 'active',
          createdAt: new Date(),
          twoFactorEnabled: false,
        };
        setUsers(prev => [...prev, newUser]);
        toast({
          title: "Usuário criado!",
          description: formData.sendInvite 
            ? `Convite enviado para ${formData.email}`
            : `${formData.name} foi adicionado`,
        });
      }

      setShowUserDialog(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o usuário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Excluir usuário
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      toast({
        title: "Usuário removido",
        description: `${selectedUser.name} foi removido do sistema`,
      });
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o usuário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle status
  const toggleUserStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers(prev => prev.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
    toast({
      title: newStatus === 'active' ? "Usuário ativado" : "Usuário desativado",
      description: `${user.name} foi ${newStatus === 'active' ? 'ativado' : 'desativado'}`,
    });
  };

  // Resetar senha
  const resetPassword = (user: User) => {
    toast({
      title: "Link enviado!",
      description: `E-mail de redefinição enviado para ${user.email}`,
    });
  };

  // Verificar se pode editar um usuário
  const canEditUser = (user: User): boolean => {
    // Não pode editar usuário com papel maior que o seu
    const roleHierarchy: Record<UserRole, number> = {
      VIEWER: 1, OPERATOR: 2, MANAGER: 3, OWNER: 4, MASTER_ADMIN: 5
    };
    return roleHierarchy[currentUserRole] >= roleHierarchy[user.role];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Usuários e Permissões</h1>
                <p className="text-sm text-slate-400">Gerencie quem acessa o sistema</p>
              </div>
            </div>
            
            <RequirePermission permission="users.create">
              <Button
                onClick={() => openUserDialog()}
                className="bg-gradient-to-r from-blue-500 to-cyan-600"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </RequirePermission>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-950/30 border-green-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Ativos</p>
                  <p className="text-2xl font-bold text-green-400">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-950/30 border-amber-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Pendentes</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {users.filter(u => u.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Com 2FA</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.twoFactorEnabled).length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-slate-400" />
              </div>
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
                  placeholder="Buscar por nome ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os papéis</SelectItem>
                  <SelectItem value="OWNER">Dono</SelectItem>
                  <SelectItem value="MANAGER">Gerente</SelectItem>
                  <SelectItem value="OPERATOR">Operador</SelectItem>
                  <SelectItem value="VIEWER">Visualizador</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Usuários */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className={`${ROLE_COLORS[user.role]} text-white`}>
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{user.name}</p>
                        {user.twoFactorEnabled && (
                          <ShieldCheck className="h-4 w-4 text-green-400" title="2FA ativo" />
                        )}
                      </div>
                      <p className="text-sm text-slate-400 truncate">{user.email}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          <span className="text-xs text-slate-400">{ROLE_LABELS[user.role]}</span>
                        </div>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-500">
                          Último acesso: {formatLastActivity(user.lastLogin)}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0">
                      {getStatusBadge(user.status)}
                    </div>

                    {/* Ações */}
                    <RequirePermission permission="users.edit">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={!canEditUser(user)}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openUserDialog(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setShowPermissionsDialog(true);
                          }}>
                            <Shield className="h-4 w-4 mr-2" />
                            Permissões
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => resetPassword(user)}>
                            <Key className="h-4 w-4 mr-2" />
                            Resetar Senha
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleUserStatus(user)}>
                            {user.status === 'active' ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <RequirePermission permission="users.delete">
                            <DropdownMenuItem 
                              className="text-red-400"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </RequirePermission>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </RequirePermission>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Legenda de Papéis */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-slate-400" />
              Níveis de Acesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['OWNER', 'MANAGER', 'OPERATOR', 'VIEWER'] as UserRole[]).map(role => (
                <div key={role} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getRoleIcon(role)}
                    <span className="font-medium">{ROLE_LABELS[role]}</span>
                  </div>
                  <p className="text-sm text-slate-400">{ROLE_DESCRIPTIONS[role]}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Dialog: Criar/Editar Usuário */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Atualize as informações do usuário' : 'Adicione um novo usuário ao sistema'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome completo *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800 border-slate-600"
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="space-y-2">
              <Label>E-mail *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-800 border-slate-600"
                placeholder="email@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-slate-800 border-slate-600"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label>Papel / Nível de Acesso</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isAtLeast('OWNER') && <SelectItem value="OWNER">Dono</SelectItem>}
                  {isAtLeast('MANAGER') && <SelectItem value="MANAGER">Gerente</SelectItem>}
                  <SelectItem value="OPERATOR">Operador</SelectItem>
                  <SelectItem value="VIEWER">Visualizador</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {ROLE_DESCRIPTIONS[formData.role]}
              </p>
            </div>

            {!isEditing && (
              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div>
                  <p className="font-medium">Enviar convite por e-mail</p>
                  <p className="text-sm text-slate-400">O usuário receberá um link para criar a senha</p>
                </div>
                <Switch
                  checked={formData.sendInvite}
                  onCheckedChange={(checked) => setFormData({ ...formData, sendInvite: checked })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveUser}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                isEditing ? 'Salvar Alterações' : 'Criar Usuário'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Permissões */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-400" />
              Permissões de {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Papel atual: {selectedUser && ROLE_LABELS[selectedUser.role]}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <Accordion type="multiple" className="space-y-2">
              {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => {
                const rolePermissions = selectedUser ? getRolePermissions(selectedUser.role) : [];
                const hasAllInGroup = permissions.every(p => rolePermissions.includes(p.key as Permission));
                const hasSomeInGroup = permissions.some(p => rolePermissions.includes(p.key as Permission));

                return (
                  <AccordionItem key={group} value={group} className="border border-slate-700 rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{group}</span>
                        {hasAllInGroup ? (
                          <Badge className="bg-green-500/20 text-green-400">Acesso total</Badge>
                        ) : hasSomeInGroup ? (
                          <Badge className="bg-amber-500/20 text-amber-400">Parcial</Badge>
                        ) : (
                          <Badge className="bg-slate-500/20 text-slate-400">Sem acesso</Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {permissions.map(permission => {
                          const hasPermission = rolePermissions.includes(permission.key as Permission);
                          return (
                            <div key={permission.key} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                              <span className="text-sm">{permission.label}</span>
                              {hasPermission ? (
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </ScrollArea>

          <Alert className="bg-slate-800/50 border-slate-700">
            <Info className="h-4 w-4" />
            <AlertTitle>Permissões baseadas em papel</AlertTitle>
            <AlertDescription>
              As permissões são definidas pelo papel do usuário. Para alterar, mude o papel na edição do usuário.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar Exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Excluir Usuário
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <strong>{selectedUser?.name}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

