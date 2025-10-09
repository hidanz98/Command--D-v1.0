import React, { useState } from "react";
import { useMasterAdmin } from "../context/MasterAdminContext";
import { useTenant } from "../context/TenantContext";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Building2,
  ChevronDown,
  Check,
  Plus,
  Settings,
  Users,
  ShoppingCart,
  Activity,
  DollarSign,
} from "lucide-react";

export function TenantSelector() {
  const { companies } = useMasterAdmin();
  const { currentTenant, switchTenant, getTenantStats } = useTenant();
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const activeCompanies = companies.filter((company) => company.isActive);
  const stats = currentTenant ? getTenantStats() : null;

  const handleTenantSwitch = (company: any) => {
    switchTenant(company);
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "demo":
        return "bg-yellow-500/20 text-yellow-400";
      case "basic":
        return "bg-blue-500/20 text-blue-400";
      case "premium":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-cinema-gray border-cinema-gray-light text-white hover:bg-cinema-gray-light min-w-[200px] justify-between"
          >
            <div className="flex items-center gap-2">
              {currentTenant ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: currentTenant.primaryColor }}
                  />
                  <span className="truncate">{currentTenant.name}</span>
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  <span>Selecionar Locadora</span>
                </>
              )}
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="bg-cinema-gray border-cinema-gray-light text-white min-w-[300px]">
          <div className="p-2">
            <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
              Locadoras Ativas
            </div>

            {activeCompanies.map((company) => (
              <DropdownMenuItem
                key={company.id}
                onClick={() => handleTenantSwitch(company)}
                className="flex items-center justify-between p-3 rounded cursor-pointer hover:bg-cinema-gray-light group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: company.primaryColor }}
                  >
                    {company.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {company.name}
                      </span>
                      {currentTenant?.id === company.id && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getPlanColor(company.plan)}`}
                      >
                        {company.plan}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {company.totalOrders} pedidos
                      </span>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}

            {activeCompanies.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma locadora ativa</p>
              </div>
            )}
          </div>

          <DropdownMenuSeparator className="bg-cinema-gray-light" />

          <div className="p-2">
            {currentTenant && (
              <DropdownMenuItem
                onClick={() => setIsStatsModalOpen(true)}
                className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-cinema-gray-light"
              >
                <Activity className="w-4 h-4 text-cinema-gold" />
                <span>Ver Estatísticas</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-cinema-gray-light">
              <Settings className="w-4 h-4 text-gray-400" />
              <span>Configurações</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-cinema-gray-light">
              <Plus className="w-4 h-4 text-cinema-gold" />
              <span>Nova Locadora</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Stats Modal */}
      <Dialog open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen}>
        <DialogContent className="bg-cinema-gray border-cinema-gray-light text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: currentTenant?.primaryColor }}
              >
                {currentTenant?.name.charAt(0)}
              </div>
              Estatísticas - {currentTenant?.name}
            </DialogTitle>
          </DialogHeader>

          {stats && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-cinema-gray-light rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <ShoppingCart className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">Produtos Ativos</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats.totalProducts}
                </div>
              </div>

              <div className="bg-cinema-gray-light rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-400">Pedidos Ativos</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats.activeOrders}
                </div>
              </div>

              <div className="bg-cinema-gray-light rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-400">Total Clientes</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats.totalCustomers}
                </div>
              </div>

              <div className="bg-cinema-gray-light rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-cinema-gold" />
                  <span className="text-sm text-gray-400">Receita Mensal</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  R$ {stats.monthlyRevenue.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-cinema-gray-light rounded-lg">
            <h4 className="font-medium text-white mb-2">
              Informações da Locadora
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Plano:</span>
                <Badge className={getPlanColor(currentTenant?.plan || "")}>
                  {currentTenant?.plan}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <Badge
                  variant={currentTenant?.isActive ? "default" : "secondary"}
                >
                  {currentTenant?.isActive ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Responsável:</span>
                <span className="text-white">{currentTenant?.owner.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{currentTenant?.owner.email}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
