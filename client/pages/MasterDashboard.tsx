/**
 * DASHBOARD MASTER - Painel do Otávio
 * 
 * Este dashboard é APENAS para o Otávio ver:
 * - Todas as licenças ativas/inativas
 * - Pagamentos recebidos
 * - Sistemas online/offline
 * - Estatísticas gerais
 * 
 * NÃO mostra dados operacionais das locadoras (locações, clientes, etc)
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Server,
  Plus,
  Search,
  Eye,
  Edit,
  Ban,
  PlayCircle
} from "lucide-react";

interface License {
  id: string;
  companyName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  subdomain: string;
  plan: string;
  licenseStatus: string;
  isActive: boolean;
  monthlyFee: number;
  totalRevenue: number;
  lastHeartbeat: string | null;
  createdAt: string;
  nextPayment: string | null;
  paymentStatus: string;
}

interface DashboardStats {
  overview: {
    totalLicenses: number;
    activeLicenses: number;
    trialLicenses: number;
    suspendedLicenses: number;
    offlineSystems: number;
  };
  revenue: {
    total: number;
    monthly: number;
    pending: number;
    byPlan: Array<{
      plan: string;
      _count: number;
      _sum: { totalRevenue: number | null };
    }>;
  };
  recentLicenses: Array<{
    id: string;
    companyName: string;
    plan: string;
    licenseStatus: string;
    createdAt: string;
    lastHeartbeat: string | null;
  }>;
}

export default function MasterDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);

  // Carregar dashboard
  useEffect(() => {
    loadDashboard();
    loadLicenses();

    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      loadDashboard();
      loadLicenses();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch("/api/master/dashboard");
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    }
  };

  const loadLicenses = async () => {
    try {
      const response = await fetch("/api/master/licenses");
      const data = await response.json();
      if (data.success) {
        setLicenses(data.data.licenses);
      }
    } catch (error) {
      console.error("Erro ao carregar licenças:", error);
    } finally {
      setLoading(false);
    }
  };

  const suspendLicense = async (licenseId: string) => {
    if (!confirm("Tem certeza que deseja suspender esta licença?")) return;

    try {
      const response = await fetch(`/api/master/licenses/${licenseId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Manual suspension" })
      });

      if (response.ok) {
        alert("Licença suspensa com sucesso!");
        loadLicenses();
        loadDashboard();
      }
    } catch (error) {
      console.error("Erro ao suspender licença:", error);
      alert("Erro ao suspender licença");
    }
  };

  const activateLicense = async (licenseId: string) => {
    try {
      const response = await fetch(`/api/master/licenses/${licenseId}/activate`, {
        method: "POST"
      });

      if (response.ok) {
        alert("Licença ativada com sucesso!");
        loadLicenses();
        loadDashboard();
      }
    } catch (error) {
      console.error("Erro ao ativar licença:", error);
      alert("Erro ao ativar licença");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      ACTIVE: { color: "bg-green-500", label: "Ativo" },
      TRIAL: { color: "bg-blue-500", label: "Trial" },
      SUSPENDED: { color: "bg-red-500", label: "Suspenso" },
      EXPIRED: { color: "bg-gray-500", label: "Expirado" },
      CANCELLED: { color: "bg-gray-400", label: "Cancelado" }
    };

    const variant = variants[status] || { color: "bg-gray-500", label: status };

    return (
      <Badge className={`${variant.color} text-white`}>
        {variant.label}
      </Badge>
    );
  };

  const getOnlineStatus = (lastHeartbeat: string | null) => {
    if (!lastHeartbeat) return <Badge variant="outline">Nunca conectou</Badge>;

    const lastSeen = new Date(lastHeartbeat);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);

    if (diffMinutes < 10) {
      return <Badge className="bg-green-500 text-white">Online</Badge>;
    } else if (diffMinutes < 60) {
      return <Badge className="bg-yellow-500 text-white">Ocioso ({Math.floor(diffMinutes)}min)</Badge>;
    } else {
      return <Badge className="bg-red-500 text-white">Offline ({Math.floor(diffMinutes / 60)}h)</Badge>;
    }
  };

  const filteredLicenses = licenses.filter((license) => {
    const matchesSearch =
      license.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || license.licenseStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Master</h1>
          <p className="text-muted-foreground">
            Gerenciamento de licenças - Command D
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Licença
        </Button>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Licenças</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalLicenses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.activeLicenses} ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.revenue.total)}
              </div>
              <p className="text-xs text-muted-foreground">
                Este mês: {formatCurrency(stats.revenue.monthly)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sistemas Online</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.overview.totalLicenses - stats.overview.offlineSystems}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.offlineSystems} offline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.overview.suspendedLicenses + stats.overview.offlineSystems}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.suspendedLicenses} suspensas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empresa, email ou subdomain..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {["all", "ACTIVE", "TRIAL", "SUSPENDED", "EXPIRED"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status === "all" ? "Todos" : status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Licenças */}
      <Card>
        <CardHeader>
          <CardTitle>Licenças ({filteredLicenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLicenses.map((license) => (
              <div
                key={license.id}
                className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/50 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{license.companyName}</h3>
                    {getStatusBadge(license.licenseStatus)}
                    {getOnlineStatus(license.lastHeartbeat)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Subdomain:</span> {license.subdomain}
                    </div>
                    <div>
                      <span className="font-medium">Plano:</span> {license.plan}
                    </div>
                    <div>
                      <span className="font-medium">Mensalidade:</span> {formatCurrency(license.monthlyFee)}
                    </div>
                    <div>
                      <span className="font-medium">Receita Total:</span> {formatCurrency(license.totalRevenue)}
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium">Contato:</span> {license.ownerName} ({license.ownerEmail})
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {license.licenseStatus === "ACTIVE" || license.licenseStatus === "TRIAL" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => suspendLicense(license.id)}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => activateLicense(license.id)}
                    >
                      <PlayCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {filteredLicenses.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma licença encontrada
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

