import React, { useState } from "react";
import { useMasterAdmin } from "../context/MasterAdminContext";
import { useTenant } from "../context/TenantContext";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { AddCompanyModal } from "../components/AddCompanyModal";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Eye,
  Settings,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Activity,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  PlayCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function MasterAdminPanel() {
  const {
    companies,
    getTotalStats,
    getCompanyStats,
    selectCompany,
    updateCompany,
  } = useMasterAdmin();
  const { switchTenant } = useTenant();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [filterPlan, setFilterPlan] = useState<
    "all" | "demo" | "basic" | "premium"
  >("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const totalStats = getTotalStats();

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.owner.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && company.isActive) ||
      (filterStatus === "inactive" && !company.isActive);

    const matchesPlan = filterPlan === "all" || company.plan === filterPlan;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case "demo":
        return "secondary";
      case "basic":
        return "default";
      case "premium":
        return "default";
      default:
        return "secondary";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "demo":
        return "text-yellow-400";
      case "basic":
        return "text-blue-400";
      case "premium":
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  const toggleCompanyStatus = (companyId: string, currentStatus: boolean) => {
    updateCompany(companyId, { isActive: !currentStatus });
  };

  return (
    <div className="min-h-screen bg-cinema-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Building2 className="h-8 w-8 text-cinema-gold" />
            Painel Master - Locadoras
          </h1>
          <p className="text-gray-400 mt-1">
            Gerencie todas as locadoras da plataforma
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="bg-cinema-gold text-black hover:bg-yellow-500"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Locadora
          </Button>

          <Button
            className="bg-transparent border border-cinema-gray-light text-white hover:bg-cinema-gray-light"
            onClick={() => {
              // Export companies as CSV
              const headers = [
                "id",
                "name",
                "slug",
                "domain",
                "isActive",
                "plan",
                "createdAt",
                "lastActive",
                "totalRevenue",
                "totalOrders",
                "ownerName",
                "ownerEmail",
                "ownerPhone",
                "primaryColor",
                "secondaryColor",
              ];
              const rows = companies.map((c) =>
                [
                  c.id,
                  `"${c.name.replace(/"/g, '""')}"`,
                  c.slug,
                  c.domain || "",
                  c.isActive ? "true" : "false",
                  c.plan,
                  c.createdAt.toISOString(),
                  c.lastActive.toISOString(),
                  c.totalRevenue.toString(),
                  c.totalOrders.toString(),
                  c.owner.name,
                  c.owner.email,
                  c.owner.phone,
                  c.primaryColor,
                  c.secondaryColor || "",
                ].join(","),
              );

              const csvContent = [headers.join(","), ...rows].join("\n");
              const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "locadoras_export.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Exportar CSV
          </Button>

          <Button
            className="bg-transparent border border-cinema-gray-light text-white hover:bg-cinema-gray-light"
            onClick={() => {
              const data = JSON.stringify(companies, null, 2);
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "locadoras_export.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Exportar JSON
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total de Locadoras
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalStats.totalCompanies}
            </div>
            <p className="text-xs text-green-400">
              {totalStats.activeCompanies} ativas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Faturamento Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {totalStats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-green-400">+12% este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total de Pedidos
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalStats.totalOrders}
            </div>
            <p className="text-xs text-green-400">+8% este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Taxa de Crescimento
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">+15%</div>
            <p className="text-xs text-green-400">últimos 3 meses</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome da locadora ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-cinema-gray border-cinema-gray-light text-white"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-cinema-gray border border-cinema-gray-light rounded-md text-white text-sm"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
          </select>

          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value as any)}
            className="px-3 py-2 bg-cinema-gray border border-cinema-gray-light rounded-md text-white text-sm"
          >
            <option value="all">Todos os Planos</option>
            <option value="demo">Demo</option>
            <option value="basic">Básico</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      {/* Companies List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => {
          const stats = getCompanyStats(company.id);

          return (
            <Card
              key={company.id}
              className="bg-cinema-gray border-cinema-gray-light hover:border-cinema-gold transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: company.primaryColor }}
                    >
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">
                        {company.name}
                      </CardTitle>
                      <p className="text-gray-400 text-sm">
                        {company.owner.name}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-cinema-gray border-cinema-gray-light">
                      <DropdownMenuItem className="text-white hover:bg-cinema-gray-light">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-cinema-gray-light">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-cinema-gray-light">
                        <Settings className="w-4 h-4 mr-2" />
                        Configurações
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400 hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Status and Plan */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={company.isActive ? "default" : "secondary"}
                      className={
                        company.isActive ? "bg-green-600" : "bg-gray-600"
                      }
                    >
                      {company.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                    <Badge
                      variant={getPlanBadgeVariant(company.plan)}
                      className={getPlanColor(company.plan)}
                    >
                      {company.plan.charAt(0).toUpperCase() +
                        company.plan.slice(1)}
                    </Badge>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toggleCompanyStatus(company.id, company.isActive)
                    }
                    className="border-cinema-gray-light text-white hover:bg-cinema-gray-light"
                  >
                    {company.isActive ? "Pausar" : "Ativar"}
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Faturamento</p>
                    <p className="text-white font-semibold">
                      R$ {stats.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Pedidos</p>
                    <p className="text-white font-semibold">{stats.orders}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1 text-sm">
                  <p className="text-gray-400">Contato:</p>
                  <p className="text-white">{company.owner.email}</p>
                  <p className="text-gray-300">{company.owner.phone}</p>
                </div>

                {/* Last Activity */}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Activity className="w-4 h-4" />
                  Último acesso:{" "}
                  {format(company.lastActive, "dd/MM/yyyy", { locale: ptBR })}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-cinema-gold text-black hover:bg-yellow-500"
                    onClick={() => {
                      switchTenant(company);
                      navigate(`/${company.slug}`);
                    }}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Acessar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-cinema-gray-light text-white hover:bg-cinema-gray-light"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Nenhuma locadora encontrada
          </h3>
          <p className="text-gray-500">
            Tente ajustar os filtros ou adicionar uma nova locadora.
          </p>
        </div>
      )}

      <AddCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
