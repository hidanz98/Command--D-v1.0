import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Palette,
  Building,
  Settings,
  Save,
  Eye,
  Plus,
  Edit,
  Crown,
  Star,
  Globe,
  Share2,
  Package,
  Users,
  DollarSign,
} from "lucide-react";
import PartnershipManager from "./PartnershipManager";
import SharedInventoryManager from "./SharedInventoryManager";
import CommissionManager from "./CommissionManager";

interface Partner {
  id: string;
  name: string;
  type: string;
  company?: string;
}

interface MultiTenantPlaceholderProps {
  partners?: Partner[];
}

const MultiTenantPlaceholder: React.FC<MultiTenantPlaceholderProps> = ({ partners = [] }) => {
  const [companies] = useState([
    {
      id: "1",
      name: "Bil's Cinema e Vídeo",
      slug: "bils-cinema",
      primaryColor: "#FFD700",
      plan: "premium",
      status: "active",
    },
    {
      id: "2",
      name: "CineMax Locações",
      slug: "cinemax",
      primaryColor: "#e74c3c",
      plan: "basic",
      status: "active",
    },
    {
      id: "3",
      name: "ProVideo Equipamentos",
      slug: "provideo",
      primaryColor: "#3498db",
      plan: "basic",
      status: "active",
    },
  ]);

  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [activeView, setActiveView] = useState<"companies" | "partnerships" | "inventory" | "commissions">("companies");

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "free":
        return <Globe className="w-4 h-4" />;
      case "basic":
        return <Star className="w-4 h-4" />;
      case "premium":
        return <Crown className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "text-gray-400 bg-gray-400/20";
      case "basic":
        return "text-blue-400 bg-blue-400/20";
      case "premium":
        return "text-yellow-400 bg-yellow-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <Building className="w-6 h-6 mr-2 text-cinema-yellow" />
            Sistema Multi-Locadoras
          </h2>
          <p className="text-gray-400">
            Gerencie empresas, parcerias e compartilhamento de inventário
          </p>
        </div>
        <div className="flex space-x-2">
          {activeView === "companies" && (
            <Button 
              onClick={() => setShowNewCompanyModal(true)}
              className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Empresa
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2">
        <Button
          variant={activeView === "companies" ? "default" : "outline"}
          onClick={() => setActiveView("companies")}
          className={activeView === "companies" 
            ? "bg-cinema-yellow text-cinema-dark" 
            : "border-cinema-gray-light text-white hover:bg-cinema-gray-light"
          }
        >
          <Building className="w-4 h-4 mr-2" />
          Empresas
        </Button>
        <Button
          variant={activeView === "partnerships" ? "default" : "outline"}
          onClick={() => setActiveView("partnerships")}
          className={activeView === "partnerships" 
            ? "bg-cinema-yellow text-cinema-dark" 
            : "border-cinema-gray-light text-white hover:bg-cinema-gray-light"
          }
        >
          <Share2 className="w-4 h-4 mr-2" />
          Parcerias
        </Button>
        <Button
          variant={activeView === "inventory" ? "default" : "outline"}
          onClick={() => setActiveView("inventory")}
          className={activeView === "inventory" 
            ? "bg-cinema-yellow text-cinema-dark" 
            : "border-cinema-gray-light text-white hover:bg-cinema-gray-light"
          }
        >
          <Package className="w-4 h-4 mr-2" />
          Inventário Compartilhado
        </Button>
        <Button
          variant={activeView === "commissions" ? "default" : "outline"}
          onClick={() => setActiveView("commissions")}
          className={activeView === "commissions" 
            ? "bg-cinema-yellow text-cinema-dark" 
            : "border-cinema-gray-light text-white hover:bg-cinema-gray-light"
          }
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Comissões e Repasses
        </Button>
      </div>

      {/* Content based on active view */}
      {activeView === "companies" && (
        <>
        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Card
            key={company.id}
            className="bg-cinema-dark border-cinema-gray-light hover:border-cinema-yellow transition-colors cursor-pointer"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: company.primaryColor }}
                  >
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{company.name}</h4>
                    <p className="text-gray-400 text-sm">/{company.slug}</p>
                  </div>
                </div>
                <div
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getPlanColor(company.plan)}`}
                >
                  {getPlanIcon(company.plan)}
                  <span className="ml-1 capitalize">{company.plan}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Cor Principal:</span>
                  <div
                    className="w-4 h-4 rounded border border-gray-600"
                    style={{ backgroundColor: company.primaryColor }}
                  />
                  <span className="text-white">{company.primaryColor}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full ${
                      company.status === "active"
                        ? "text-green-400 bg-green-400/20"
                        : "text-gray-400 bg-gray-400/20"
                    }`}
                  >
                    {company.status === "active" ? "Ativa" : "Inativa"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-cinema-gray-light">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-cinema-yellow border-cinema-yellow"
                    onClick={() => setSelectedCompany(company.id)}
                    title="Editar empresa"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-400 border-blue-400"
                    onClick={() => window.open(`/${company.slug}`, '_blank')}
                    title="Visualizar site"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  onClick={() => setSelectedCompany(company.id)}
                >
                  Configurar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>

        {/* Configuration Panel */}
      <Card className="bg-cinema-dark border-cinema-gray-light">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Configuração Rápida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Nome da Empresa</Label>
              <Input
                placeholder="Ex: Minha Locadora"
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
              />
            </div>

            <div>
              <Label className="text-white">Cor Primária</Label>
              <div className="flex space-x-2">
                <Input
                  type="color"
                  defaultValue="#FFD700"
                  className="w-12 h-10 p-1 bg-cinema-dark-lighter border-cinema-gray-light"
                />
                <Input
                  defaultValue="#FFD700"
                  className="flex-1 bg-cinema-dark-lighter border-cinema-gray-light text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Slug (URL)</Label>
              <Input
                placeholder="minha-locadora"
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" className="text-gray-400 border-gray-600">
              Prévia
            </Button>
            <Button className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark">
              <Save className="w-4 h-4 mr-2" />
              Salvar Configuração
            </Button>
          </div>
        </CardContent>
      </Card>
        </>
      )}

      {/* Partnerships View */}
      {activeView === "partnerships" && (
        <PartnershipManager />
      )}

      {/* Shared Inventory View */}
      {activeView === "inventory" && (
        <SharedInventoryManager />
      )}

      {/* Commissions View */}
      {activeView === "commissions" && (
        <CommissionManager partners={partners} />
      )}

      {/* Modal para Nova Empresa */}
      {showNewCompanyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-cinema-gray border-cinema-gray-light w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Nova Empresa
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewCompanyModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Nome da Empresa</Label>
                <Input 
                  placeholder="Ex: Minha Locadora"
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                />
              </div>
              <div>
                <Label className="text-white">Slug (URL)</Label>
                <Input 
                  placeholder="Ex: minha-locadora"
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                />
              </div>
              <div>
                <Label className="text-white">Cor Principal</Label>
                <div className="flex space-x-2">
                  <Input 
                    type="color"
                    defaultValue="#FFD700"
                    className="w-16 h-10 bg-cinema-dark-lighter border-cinema-gray-light"
                  />
                  <Input 
                    placeholder="#FFD700"
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                  onClick={() => setShowNewCompanyModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  onClick={() => {
                    // Aqui seria implementada a lógica de criação
                    alert("Funcionalidade será implementada em breve!");
                    setShowNewCompanyModal(false);
                  }}
                >
                  Criar Empresa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Edição */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-cinema-gray border-cinema-gray-light w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configurar Empresa
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCompany(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-cinema-yellow font-semibold mb-2">
                  🎨 Editor de Identidade Visual
                </div>
                <p className="text-gray-400 text-sm">
                  Personalize cores, logo e layout da sua locadora
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Logo da Empresa</Label>
                  <div className="mt-2 p-4 border-2 border-dashed border-gray-600 rounded-lg text-center">
                    <div className="text-gray-400 text-sm">
                      Clique para fazer upload
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-white">Cores do Tema</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Input type="color" defaultValue="#FFD700" className="w-12 h-8" />
                      <span className="text-gray-400 text-sm">Cor Principal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input type="color" defaultValue="#1a1a1a" className="w-12 h-8" />
                      <span className="text-gray-400 text-sm">Cor de Fundo</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-cinema-gray-light">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                  onClick={() => setSelectedCompany(null)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  onClick={() => {
                    alert("Configurações salvas com sucesso!");
                    setSelectedCompany(null);
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MultiTenantPlaceholder;
