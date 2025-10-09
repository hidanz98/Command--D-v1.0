import { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Building,
  Home,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Key,
  UserCheck,
  UserX,
  Search,
  Filter,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Interfaces
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "employee" | "intern";
  department: string;
  position: string;
  hireDate: string;
  status: "active" | "inactive" | "suspended";
  permissions: {
    canViewFinancial: boolean;
    canManageProducts: boolean;
    canManageOrders: boolean;
    canManageEmployees: boolean;
    canViewReports: boolean;
    canEditSettings: boolean;
    canManageClients: boolean;
    canAccessAdmin: boolean;
  };
  workSchedule: {
    monday: { start: string; end: string; enabled: boolean };
    tuesday: { start: string; end: string; enabled: boolean };
    wednesday: { start: string; end: string; enabled: boolean };
    thursday: { start: string; end: string; enabled: boolean };
    friday: { start: string; end: string; enabled: boolean };
    saturday: { start: string; end: string; enabled: boolean };
    sunday: { start: string; end: string; enabled: boolean };
  };
  salary?: {
    amount: number;
    type: "hourly" | "monthly" | "daily";
    currency: "BRL";
  };
  notes?: string;
  createdAt: string;
  lastLogin?: string;
  isOnline: boolean;
}

const ROLE_PERMISSIONS = {
  admin: {
    canViewFinancial: true,
    canManageProducts: true,
    canManageOrders: true,
    canManageEmployees: true,
    canViewReports: true,
    canEditSettings: true,
    canManageClients: true,
    canAccessAdmin: true,
  },
  manager: {
    canViewFinancial: true,
    canManageProducts: true,
    canManageOrders: true,
    canManageEmployees: false,
    canViewReports: true,
    canEditSettings: false,
    canManageClients: true,
    canAccessAdmin: true,
  },
  employee: {
    canViewFinancial: false,
    canManageProducts: false,
    canManageOrders: true,
    canManageEmployees: false,
    canViewReports: false,
    canEditSettings: false,
    canManageClients: true,
    canAccessAdmin: false,
  },
  intern: {
    canViewFinancial: false,
    canManageProducts: false,
    canManageOrders: false,
    canManageEmployees: false,
    canViewReports: false,
    canEditSettings: false,
    canManageClients: false,
    canAccessAdmin: false,
  },
};

const DEFAULT_SCHEDULE = {
  monday: { start: "08:00", end: "17:00", enabled: true },
  tuesday: { start: "08:00", end: "17:00", enabled: true },
  wednesday: { start: "08:00", end: "17:00", enabled: true },
  thursday: { start: "08:00", end: "17:00", enabled: true },
  friday: { start: "08:00", end: "17:00", enabled: true },
  saturday: { start: "08:00", end: "12:00", enabled: false },
  sunday: { start: "08:00", end: "12:00", enabled: false },
};

const EmployeeManagerComponent = () => {
  const { user, isAdmin } = useAuth();
  
  // Verificar se o contexto está disponível
  if (!user) {
    return (
      <Card className="bg-red-900/20 border-red-500/50">
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-red-400 font-semibold mb-2">Erro de Autenticação</h3>
          <p className="text-red-300">Usuário não autenticado. Faça login novamente.</p>
        </CardContent>
      </Card>
    );
  }
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: "",
    email: "",
    phone: "",
    role: "employee",
    department: "",
    position: "",
    status: "active",
    permissions: ROLE_PERMISSIONS.employee,
    workSchedule: DEFAULT_SCHEDULE,
    notes: "",
  });

  // Carregar funcionários salvos
  useEffect(() => {
    const loadEmployees = () => {
      try {
        const savedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
    
    // Adicionar funcionários de exemplo se não houver nenhum
    if (savedEmployees.length === 0) {
      const sampleEmployees: Employee[] = [
        {
          id: "emp_001",
          name: "João Silva Santos",
          email: "joao.silva@cabecaefeito.com",
          phone: "(11) 99999-1234",
          role: "employee",
          department: "Operações",
          position: "Técnico de Equipamentos Sênior",
          hireDate: "2023-01-15",
          status: "active",
          permissions: ROLE_PERMISSIONS.employee,
          workSchedule: DEFAULT_SCHEDULE,
          salary: { amount: 3500, type: "monthly", currency: "BRL" },
          notes: "Especialista em câmeras cinematográficas",
          createdAt: "2023-01-15T08:00:00.000Z",
          lastLogin: "2025-09-19T14:30:00.000Z",
          isOnline: true,
        },
        {
          id: "emp_002",
          name: "Maria Santos Oliveira",
          email: "maria.santos@cabecaefeito.com",
          phone: "(11) 99999-5678",
          role: "manager",
          department: "Financeiro",
          position: "Assistente Financeiro",
          hireDate: "2023-03-10",
          status: "active",
          permissions: ROLE_PERMISSIONS.manager,
          workSchedule: DEFAULT_SCHEDULE,
          salary: { amount: 4500, type: "monthly", currency: "BRL" },
          notes: "Responsável por contas a pagar e receber",
          createdAt: "2023-03-10T08:00:00.000Z",
          lastLogin: "2025-09-18T17:45:00.000Z",
          isOnline: false,
        },
        {
          id: "emp_003",
          name: "Carlos Eduardo Lima",
          email: "carlos.lima@cabecaefeito.com",
          phone: "(11) 99999-9012",
          role: "employee",
          department: "Logística",
          position: "Operador de Equipamentos",
          hireDate: "2024-01-20",
          status: "active",
          permissions: ROLE_PERMISSIONS.employee,
          workSchedule: DEFAULT_SCHEDULE,
          salary: { amount: 2800, type: "monthly", currency: "BRL" },
          notes: "Responsável por entrega e retirada de equipamentos",
          createdAt: "2024-01-20T08:00:00.000Z",
          lastLogin: "2025-09-19T09:15:00.000Z",
          isOnline: true,
        },
      ];
      
        setEmployees(sampleEmployees);
        localStorage.setItem('employees', JSON.stringify(sampleEmployees));
      } else {
        setEmployees(savedEmployees);
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      setEmployees([]);
    }
    };
    
    // Limpar estados modais quando o componente for montado
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
    
    loadEmployees();
    
    // Cleanup function
    return () => {
      // Limpar estados quando o componente for desmontado
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedEmployee(null);
    };
  }, []);

  // Salvar funcionários
  const saveEmployees = useCallback((updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  }, []);

  // Adicionar funcionário
  const addEmployee = () => {
    if (!newEmployee.name || !newEmployee.email) {
      toast.error("❌ Preencha os campos obrigatórios");
      return;
    }

    const employee: Employee = {
      id: `emp_${Date.now()}`,
      name: newEmployee.name!,
      email: newEmployee.email!,
      phone: newEmployee.phone || "",
      role: newEmployee.role as Employee['role'],
      department: newEmployee.department || "",
      position: newEmployee.position || "",
      hireDate: new Date().toISOString().split('T')[0],
      status: "active",
      permissions: ROLE_PERMISSIONS[newEmployee.role as keyof typeof ROLE_PERMISSIONS],
      workSchedule: DEFAULT_SCHEDULE,
      salary: newEmployee.salary,
      notes: newEmployee.notes || "",
      createdAt: new Date().toISOString(),
      isOnline: false,
    };

    const updatedEmployees = [...employees, employee];
    saveEmployees(updatedEmployees);
    
    setIsAddModalOpen(false);
    setNewEmployee({
      name: "",
      email: "",
      phone: "",
      role: "employee",
      department: "",
      position: "",
      status: "active",
      permissions: ROLE_PERMISSIONS.employee,
      workSchedule: DEFAULT_SCHEDULE,
      notes: "",
    });

    toast.success("✅ Funcionário cadastrado com sucesso!", {
      description: `${employee.name} foi adicionado ao sistema`,
    });
  };

  // Editar funcionário
  const editEmployee = () => {
    if (!selectedEmployee) return;

    const updatedEmployees = employees.map(emp => 
      emp.id === selectedEmployee.id ? selectedEmployee : emp
    );
    saveEmployees(updatedEmployees);
    
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
    
    toast.success("✅ Funcionário atualizado com sucesso!");
  };

  // Remover funcionário
  const removeEmployee = (employeeId: string) => {
    const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
    saveEmployees(updatedEmployees);
    
    toast.success("✅ Funcionário removido do sistema");
  };

  // Alterar status do funcionário
  const toggleEmployeeStatus = (employeeId: string) => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === employeeId) {
        const newStatus = emp.status === "active" ? "inactive" : "active";
        return { ...emp, status: newStatus };
      }
      return emp;
    });
    saveEmployees(updatedEmployees as Employee[]);
    
    const employee = employees.find(emp => emp.id === employeeId);
    toast.success(`✅ ${employee?.name} ${employee?.status === "active" ? "desativado" : "ativado"}`);
  };

  // Filtrar funcionários
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
    const matchesRole = roleFilter === "all" || employee.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: "bg-red-600", text: "Administrador" },
      manager: { color: "bg-blue-600", text: "Gerente" },
      employee: { color: "bg-green-600", text: "Funcionário" },
      intern: { color: "bg-purple-600", text: "Estagiário" },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.employee;
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600 text-white">Ativo</Badge>;
      case "inactive":
        return <Badge className="bg-gray-600 text-white">Inativo</Badge>;
      case "suspended":
        return <Badge className="bg-red-600 text-white">Suspenso</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPermissionCount = (permissions: Employee['permissions']): number => {
    return Object.values(permissions).filter(Boolean).length;
  };

  if (!isAdmin) {
    return (
      <Card className="bg-red-900/20 border-red-500/50">
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-red-400 font-semibold mb-2">Acesso Restrito</h3>
          <p className="text-red-300">Apenas administradores podem gerenciar funcionários.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Gestão de Funcionários</h2>
          <p className="text-gray-400">Gerencie funcionários, permissões e controle de acesso</p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Funcionário</DialogTitle>
              <DialogDescription className="text-gray-400">
                Preencha os dados do funcionário e configure suas permissões
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Dados Pessoais */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Nome completo do funcionário"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="email@cabecaefeito.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-white">Telefone</Label>
                  <Input
                    id="phone"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label className="text-white">Cargo/Função</Label>
                  <Select
                    value={newEmployee.role}
                    onValueChange={(value) => setNewEmployee({
                      ...newEmployee, 
                      role: value as Employee['role'],
                      permissions: ROLE_PERMISSIONS[value as keyof typeof ROLE_PERMISSIONS]
                    })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="admin" className="text-white hover:bg-gray-700">
                        👑 Administrador - Acesso Total
                      </SelectItem>
                      <SelectItem value="manager" className="text-white hover:bg-gray-700">
                        👔 Gerente - Acesso Gerencial
                      </SelectItem>
                      <SelectItem value="employee" className="text-white hover:bg-gray-700">
                        👤 Funcionário - Acesso Padrão
                      </SelectItem>
                      <SelectItem value="intern" className="text-white hover:bg-gray-700">
                        🎓 Estagiário - Acesso Limitado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department" className="text-white">Departamento</Label>
                  <Input
                    id="department"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Ex: Operações, Financeiro, Logística"
                  />
                </div>
                <div>
                  <Label htmlFor="position" className="text-white">Posição</Label>
                  <Input
                    id="position"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Ex: Técnico Sênior, Analista"
                  />
                </div>
              </div>

              {/* Salário (Opcional) */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Tipo de Salário</Label>
                  <Select
                    value={newEmployee.salary?.type || "monthly"}
                    onValueChange={(value) => setNewEmployee({
                      ...newEmployee,
                      salary: { ...newEmployee.salary, type: value as "hourly" | "monthly" | "daily", amount: newEmployee.salary?.amount || 0, currency: "BRL" }
                    })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="hourly" className="text-white hover:bg-gray-700">Por Hora</SelectItem>
                      <SelectItem value="daily" className="text-white hover:bg-gray-700">Por Dia</SelectItem>
                      <SelectItem value="monthly" className="text-white hover:bg-gray-700">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="salary" className="text-white">Valor (R$)</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={newEmployee.salary?.amount || ""}
                    onChange={(e) => setNewEmployee({
                      ...newEmployee,
                      salary: { ...newEmployee.salary, amount: parseFloat(e.target.value) || 0, type: newEmployee.salary?.type || "monthly", currency: "BRL" }
                    })}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <div className="text-gray-400 text-sm">
                    {newEmployee.salary?.type === "hourly" && "por hora"}
                    {newEmployee.salary?.type === "daily" && "por dia"}
                    {newEmployee.salary?.type === "monthly" && "por mês"}
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <Label htmlFor="notes" className="text-white">Observações</Label>
                <Textarea
                  id="notes"
                  value={newEmployee.notes}
                  onChange={(e) => setNewEmployee({...newEmployee, notes: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Informações adicionais sobre o funcionário..."
                  rows={3}
                />
              </div>

              {/* Permissões */}
              <div>
                <Label className="text-white">Permissões do Sistema</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-gray-800 rounded">
                  {Object.entries(newEmployee.permissions || {}).map(([key, value]) => {
                    const permissionLabels: { [key: string]: string } = {
                      canViewFinancial: "Ver Financeiro",
                      canManageProducts: "Gerenciar Produtos",
                      canManageOrders: "Gerenciar Pedidos",
                      canManageEmployees: "Gerenciar Funcionários",
                      canViewReports: "Ver Relatórios",
                      canEditSettings: "Editar Configurações",
                      canManageClients: "Gerenciar Clientes",
                      canAccessAdmin: "Acessar Painel Admin",
                    };

                    return (
                      <label key={key} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNewEmployee({
                            ...newEmployee,
                            permissions: {
                              ...newEmployee.permissions!,
                              [key]: e.target.checked
                            }
                          })}
                          className="rounded"
                        />
                        <span className="text-white">{permissionLabels[key]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={addEmployee}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Cadastrar Funcionário
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{employees.length}</div>
                <div className="text-gray-400 text-sm">Total de Funcionários</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {employees.filter(emp => emp.status === "active").length}
                </div>
                <div className="text-gray-400 text-sm">Funcionários Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {employees.filter(emp => emp.isOnline).length}
                </div>
                <div className="text-gray-400 text-sm">Online Agora</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {employees.filter(emp => emp.role === "admin").length}
                </div>
                <div className="text-gray-400 text-sm">Administradores</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar funcionários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all" className="text-white hover:bg-gray-600">Todos os Status</SelectItem>
                <SelectItem value="active" className="text-white hover:bg-gray-600">Ativos</SelectItem>
                <SelectItem value="inactive" className="text-white hover:bg-gray-600">Inativos</SelectItem>
                <SelectItem value="suspended" className="text-white hover:bg-gray-600">Suspensos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Cargo" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all" className="text-white hover:bg-gray-600">Todos os Cargos</SelectItem>
                <SelectItem value="admin" className="text-white hover:bg-gray-600">Administradores</SelectItem>
                <SelectItem value="manager" className="text-white hover:bg-gray-600">Gerentes</SelectItem>
                <SelectItem value="employee" className="text-white hover:bg-gray-600">Funcionários</SelectItem>
                <SelectItem value="intern" className="text-white hover:bg-gray-600">Estagiários</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setRoleFilter("all");
              }}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Funcionários */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Users className="w-5 h-5 mr-2" />
            Funcionários Cadastrados
            <Badge className="ml-2">{filteredEmployees.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-semibold">{employee.name}</h3>
                        {employee.isOnline && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm">{employee.email}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        {getRoleBadge(employee.role)}
                        {getStatusBadge(employee.status)}
                        <Badge variant="outline" className="text-gray-400">
                          {getPermissionCount(employee.permissions)} permissões
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setIsEditModalOpen(true);
                      }}
                      className="border-gray-600 text-white hover:bg-gray-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleEmployeeStatus(employee.id)}
                      className={`border-gray-600 ${
                        employee.status === "active" 
                          ? "text-red-400 hover:bg-red-500 hover:text-white" 
                          : "text-green-400 hover:bg-green-500 hover:text-white"
                      }`}
                    >
                      {employee.status === "active" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-400 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-900 border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Remover Funcionário</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Tem certeza que deseja remover {employee.name}? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeEmployee(employee.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Departamento:</span>
                      <span className="text-white ml-2">{employee.department || "Não informado"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Posição:</span>
                      <span className="text-white ml-2">{employee.position || "Não informada"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Último Login:</span>
                      <span className="text-white ml-2">
                        {employee.lastLogin 
                          ? new Date(employee.lastLogin).toLocaleString('pt-BR')
                          : "Nunca"
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <div>Nenhum funcionário encontrado</div>
              <div className="text-sm">Ajuste os filtros ou cadastre novos funcionários</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      {selectedEmployee && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Funcionário</DialogTitle>
              <DialogDescription className="text-gray-400">
                Edite os dados e permissões de {selectedEmployee.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Formulário similar ao de cadastro, mas para edição */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Nome Completo</Label>
                  <Input
                    value={selectedEmployee.name}
                    onChange={(e) => setSelectedEmployee({...selectedEmployee, name: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">E-mail</Label>
                  <Input
                    value={selectedEmployee.email}
                    onChange={(e) => setSelectedEmployee({...selectedEmployee, email: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Cargo/Função</Label>
                  <Select
                    value={selectedEmployee.role}
                    onValueChange={(value) => setSelectedEmployee({
                      ...selectedEmployee,
                      role: value as Employee['role'],
                      permissions: ROLE_PERMISSIONS[value as keyof typeof ROLE_PERMISSIONS]
                    })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="admin" className="text-white hover:bg-gray-700">Administrador</SelectItem>
                      <SelectItem value="manager" className="text-white hover:bg-gray-700">Gerente</SelectItem>
                      <SelectItem value="employee" className="text-white hover:bg-gray-700">Funcionário</SelectItem>
                      <SelectItem value="intern" className="text-white hover:bg-gray-700">Estagiário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Status</Label>
                  <Select
                    value={selectedEmployee.status}
                    onValueChange={(value) => setSelectedEmployee({...selectedEmployee, status: value as Employee['status']})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="active" className="text-white hover:bg-gray-700">Ativo</SelectItem>
                      <SelectItem value="inactive" className="text-white hover:bg-gray-700">Inativo</SelectItem>
                      <SelectItem value="suspended" className="text-white hover:bg-gray-700">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Permissões Editáveis */}
              <div>
                <Label className="text-white">Permissões do Sistema</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-gray-800 rounded">
                  {Object.entries(selectedEmployee.permissions).map(([key, value]) => {
                    const permissionLabels: { [key: string]: string } = {
                      canViewFinancial: "Ver Financeiro",
                      canManageProducts: "Gerenciar Produtos",
                      canManageOrders: "Gerenciar Pedidos",
                      canManageEmployees: "Gerenciar Funcionários",
                      canViewReports: "Ver Relatórios",
                      canEditSettings: "Editar Configurações",
                      canManageClients: "Gerenciar Clientes",
                      canAccessAdmin: "Acessar Painel Admin",
                    };

                    return (
                      <label key={key} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setSelectedEmployee({
                            ...selectedEmployee,
                            permissions: {
                              ...selectedEmployee.permissions,
                              [key]: e.target.checked
                            }
                          })}
                          className="rounded"
                        />
                        <span className="text-white">{permissionLabels[key]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={editEmployee}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Export com memo para evitar re-renderizações desnecessárias
export const EmployeeManager = memo(EmployeeManagerComponent);
