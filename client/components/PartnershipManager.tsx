import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Building,
  Users,
  Package,
  MapPin,
  Settings,
  Plus,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Share2,
  Link,
  Unlink,
  Bell,
  Shield,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface Partnership {
  id: string;
  partnerCompanyId: string;
  partnerCompanyName: string;
  partnerAddress: string;
  status: "active" | "pending" | "inactive";
  sharedInventory: boolean;
  allowCrossBooking: boolean;
  createdAt: string;
  permissions: {
    viewInventory: boolean;
    bookEquipment: boolean;
    manageOrders: boolean;
    accessReports: boolean;
  };
}

interface Company {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  specialties: string[];
  inventoryCount: number;
  status: "active" | "inactive";
}

const PartnershipManager: React.FC = () => {
  const [partnerships, setPartnerships] = useState<Partnership[]>([
    {
      id: "1",
      partnerCompanyId: "bils-cinema",
      partnerCompanyName: "Bil's Cinema e Vídeo",
      partnerAddress: "Rua das Câmeras, 123 - São Paulo",
      status: "active",
      sharedInventory: true,
      allowCrossBooking: true,
      createdAt: "2024-01-15",
      permissions: {
        viewInventory: true,
        bookEquipment: true,
        manageOrders: false,
        accessReports: true,
      },
    },
  ]);

  const [availableCompanies] = useState<Company[]>([
    {
      id: "bils-cinema",
      name: "Bil's Cinema e Vídeo",
      slug: "bils-cinema",
      address: "Rua das Câmeras, 123 - São Paulo",
      phone: "(11) 99999-9999",
      email: "contato@bilscinema.com",
      specialties: ["Câmeras", "Lentes", "Iluminação", "Áudio"],
      inventoryCount: 150,
      status: "active",
    },
    {
      id: "provideo",
      name: "ProVideo Equipamentos",
      slug: "provideo",
      address: "Av. Paulista, 456 - São Paulo",
      phone: "(11) 88888-8888",
      email: "contato@provideo.com",
      specialties: ["Drones", "Gimbal", "Monitores", "Gravadores"],
      inventoryCount: 85,
      status: "active",
    },
    {
      id: "cinemax",
      name: "CineMax Locações",
      slug: "cinemax",
      address: "Rua do Cinema, 789 - Rio de Janeiro",
      phone: "(21) 77777-7777",
      email: "contato@cinemax.com",
      specialties: ["Câmeras Cinema", "Lentes Anamórficas", "Gruas"],
      inventoryCount: 120,
      status: "active",
    },
  ]);

  const [showNewPartnershipModal, setShowNewPartnershipModal] = useState(false);
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  const [newPartnershipData, setNewPartnershipData] = useState({
    partnerCompanyId: "",
    sharedInventory: true,
    allowCrossBooking: true,
    permissions: {
      viewInventory: true,
      bookEquipment: true,
      manageOrders: false,
      accessReports: false,
    },
  });

  const handleCreatePartnership = () => {
    const selectedCompany = availableCompanies.find(
      (c) => c.id === newPartnershipData.partnerCompanyId
    );
    
    if (!selectedCompany) {
      toast.error("Selecione uma empresa para criar a parceria");
      return;
    }

    const newPartnership: Partnership = {
      id: Date.now().toString(),
      partnerCompanyId: selectedCompany.id,
      partnerCompanyName: selectedCompany.name,
      partnerAddress: selectedCompany.address,
      status: "pending",
      sharedInventory: newPartnershipData.sharedInventory,
      allowCrossBooking: newPartnershipData.allowCrossBooking,
      createdAt: new Date().toISOString().split('T')[0],
      permissions: newPartnershipData.permissions,
    };

    setPartnerships([...partnerships, newPartnership]);
    setShowNewPartnershipModal(false);
    toast.success(`Parceria com ${selectedCompany.name} criada com sucesso!`);
  };

  const togglePartnershipStatus = (partnershipId: string) => {
    setPartnerships(partnerships.map(p => 
      p.id === partnershipId 
        ? { ...p, status: p.status === "active" ? "inactive" : "active" }
        : p
    ));
  };

  const updatePartnershipPermissions = (partnershipId: string, permissions: any) => {
    setPartnerships(partnerships.map(p => 
      p.id === partnershipId 
        ? { ...p, permissions }
        : p
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-600 text-white";
      case "pending": return "bg-yellow-600 text-white";
      case "inactive": return "bg-gray-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Ativa";
      case "pending": return "Pendente";
      case "inactive": return "Inativa";
      default: return "Desconhecido";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <Share2 className="w-6 h-6 mr-2 text-cinema-yellow" />
            Parcerias e Estoque Compartilhado
          </h2>
          <p className="text-gray-400">
            Gerencie parcerias entre locadoras e compartilhamento de inventário
          </p>
        </div>
        <Button 
          onClick={() => setShowNewPartnershipModal(true)}
          className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Parceria
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Parcerias Ativas</p>
                <p className="text-2xl font-bold text-white">
                  {partnerships.filter(p => p.status === "active").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Parcerias Pendentes</p>
                <p className="text-2xl font-bold text-white">
                  {partnerships.filter(p => p.status === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Estoque Compartilhado</p>
                <p className="text-2xl font-bold text-white">
                  {partnerships.filter(p => p.sharedInventory).length}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Reservas Cruzadas</p>
                <p className="text-2xl font-bold text-white">
                  {partnerships.filter(p => p.allowCrossBooking).length}
                </p>
              </div>
              <Link className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Parcerias */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Parcerias Ativas</h3>
        
        {partnerships.length === 0 ? (
          <Card className="bg-cinema-gray border-cinema-gray-light">
            <CardContent className="p-8 text-center">
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">Nenhuma parceria configurada</p>
              <Button 
                onClick={() => setShowNewPartnershipModal(true)}
                className="mt-4 bg-cinema-yellow text-cinema-dark"
              >
                Criar Primeira Parceria
              </Button>
            </CardContent>
          </Card>
        ) : (
          partnerships.map((partnership) => (
            <Card key={partnership.id} className="bg-cinema-gray border-cinema-gray-light">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Building className="w-6 h-6 text-cinema-yellow" />
                      <h4 className="text-lg font-semibold text-white">
                        {partnership.partnerCompanyName}
                      </h4>
                      <Badge className={getStatusColor(partnership.status)}>
                        {getStatusText(partnership.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {partnership.partnerAddress}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Parceria desde: {partnership.createdAt}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-white">
                            Estoque Compartilhado: 
                          </span>
                          <Badge variant={partnership.sharedInventory ? "default" : "secondary"}>
                            {partnership.sharedInventory ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-white">
                            Reservas Cruzadas: 
                          </span>
                          <Badge variant={partnership.allowCrossBooking ? "default" : "secondary"}>
                            {partnership.allowCrossBooking ? "Permitido" : "Bloqueado"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Permissões */}
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-white mb-2">Permissões:</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="flex items-center space-x-2">
                          <Eye className={`w-3 h-3 ${partnership.permissions.viewInventory ? 'text-green-400' : 'text-gray-400'}`} />
                          <span className="text-xs text-gray-400">Ver Estoque</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Package className={`w-3 h-3 ${partnership.permissions.bookEquipment ? 'text-green-400' : 'text-gray-400'}`} />
                          <span className="text-xs text-gray-400">Reservar</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Settings className={`w-3 h-3 ${partnership.permissions.manageOrders ? 'text-green-400' : 'text-gray-400'}`} />
                          <span className="text-xs text-gray-400">Gerenciar</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Bell className={`w-3 h-3 ${partnership.permissions.accessReports ? 'text-green-400' : 'text-gray-400'}`} />
                          <span className="text-xs text-gray-400">Relatórios</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedPartnership(partnership)}
                      className="border-cinema-yellow text-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Configurar
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePartnershipStatus(partnership.id)}
                      className={partnership.status === "active" 
                        ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                      }
                    >
                      {partnership.status === "active" ? (
                        <>
                          <Unlink className="w-4 h-4 mr-1" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Link className="w-4 h-4 mr-1" />
                          Ativar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal Nova Parceria */}
      {showNewPartnershipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-cinema-gray border-cinema-gray-light w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Nova Parceria
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewPartnershipModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-white">Selecionar Empresa Parceira</Label>
                <select
                  value={newPartnershipData.partnerCompanyId}
                  onChange={(e) => setNewPartnershipData({
                    ...newPartnershipData,
                    partnerCompanyId: e.target.value
                  })}
                  className="w-full mt-2 p-2 bg-cinema-dark-lighter border border-cinema-gray-light rounded text-white"
                >
                  <option value="">Selecione uma empresa...</option>
                  {availableCompanies
                    .filter(company => !partnerships.some(p => p.partnerCompanyId === company.id))
                    .map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name} - {company.specialties.join(", ")}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white">Configurações de Compartilhamento</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded">
                      <div>
                        <p className="text-white text-sm">Estoque Compartilhado</p>
                        <p className="text-gray-400 text-xs">Permitir visualização do inventário</p>
                      </div>
                      <Switch
                        checked={newPartnershipData.sharedInventory}
                        onCheckedChange={(checked) => setNewPartnershipData({
                          ...newPartnershipData,
                          sharedInventory: checked
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded">
                      <div>
                        <p className="text-white text-sm">Reservas Cruzadas</p>
                        <p className="text-gray-400 text-xs">Permitir reservas entre empresas</p>
                      </div>
                      <Switch
                        checked={newPartnershipData.allowCrossBooking}
                        onCheckedChange={(checked) => setNewPartnershipData({
                          ...newPartnershipData,
                          allowCrossBooking: checked
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-white">Permissões de Acesso</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded">
                      <div>
                        <p className="text-white text-sm">Ver Inventário</p>
                        <p className="text-gray-400 text-xs">Visualizar produtos disponíveis</p>
                      </div>
                      <Switch
                        checked={newPartnershipData.permissions.viewInventory}
                        onCheckedChange={(checked) => setNewPartnershipData({
                          ...newPartnershipData,
                          permissions: { ...newPartnershipData.permissions, viewInventory: checked }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded">
                      <div>
                        <p className="text-white text-sm">Reservar Equipamentos</p>
                        <p className="text-gray-400 text-xs">Fazer reservas de produtos</p>
                      </div>
                      <Switch
                        checked={newPartnershipData.permissions.bookEquipment}
                        onCheckedChange={(checked) => setNewPartnershipData({
                          ...newPartnershipData,
                          permissions: { ...newPartnershipData.permissions, bookEquipment: checked }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded">
                      <div>
                        <p className="text-white text-sm">Acessar Relatórios</p>
                        <p className="text-gray-400 text-xs">Ver relatórios de parcerias</p>
                      </div>
                      <Switch
                        checked={newPartnershipData.permissions.accessReports}
                        onCheckedChange={(checked) => setNewPartnershipData({
                          ...newPartnershipData,
                          permissions: { ...newPartnershipData.permissions, accessReports: checked }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-cinema-gray-light">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                  onClick={() => setShowNewPartnershipModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  onClick={handleCreatePartnership}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Parceria
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Configuração */}
      {selectedPartnership && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-cinema-gray border-cinema-gray-light w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configurar Parceria - {selectedPartnership.partnerCompanyName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPartnership(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-4 bg-cinema-yellow/10 border border-cinema-yellow/30 rounded-lg">
                <h4 className="text-cinema-yellow font-semibold mb-2">
                  🤝 Configurações de Parceria
                </h4>
                <p className="text-gray-300 text-sm">
                  Ajuste as permissões e configurações desta parceria
                </p>
              </div>

              <div className="space-y-4">
                <h5 className="text-white font-semibold">Permissões Detalhadas</h5>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-4 bg-cinema-dark-lighter rounded">
                    <div>
                      <p className="text-white font-medium">Visualizar Inventário</p>
                      <p className="text-gray-400 text-sm">Permite ver produtos disponíveis da parceira</p>
                    </div>
                    <Switch
                      checked={selectedPartnership.permissions.viewInventory}
                      onCheckedChange={(checked) => {
                        const updatedPermissions = { ...selectedPartnership.permissions, viewInventory: checked };
                        updatePartnershipPermissions(selectedPartnership.id, updatedPermissions);
                        setSelectedPartnership({ ...selectedPartnership, permissions: updatedPermissions });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-cinema-dark-lighter rounded">
                    <div>
                      <p className="text-white font-medium">Reservar Equipamentos</p>
                      <p className="text-gray-400 text-sm">Permite fazer reservas de produtos da parceira</p>
                    </div>
                    <Switch
                      checked={selectedPartnership.permissions.bookEquipment}
                      onCheckedChange={(checked) => {
                        const updatedPermissions = { ...selectedPartnership.permissions, bookEquipment: checked };
                        updatePartnershipPermissions(selectedPartnership.id, updatedPermissions);
                        setSelectedPartnership({ ...selectedPartnership, permissions: updatedPermissions });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-cinema-dark-lighter rounded">
                    <div>
                      <p className="text-white font-medium">Gerenciar Pedidos</p>
                      <p className="text-gray-400 text-sm">Permite editar e cancelar pedidos cruzados</p>
                    </div>
                    <Switch
                      checked={selectedPartnership.permissions.manageOrders}
                      onCheckedChange={(checked) => {
                        const updatedPermissions = { ...selectedPartnership.permissions, manageOrders: checked };
                        updatePartnershipPermissions(selectedPartnership.id, updatedPermissions);
                        setSelectedPartnership({ ...selectedPartnership, permissions: updatedPermissions });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-cinema-dark-lighter rounded">
                    <div>
                      <p className="text-white font-medium">Acessar Relatórios</p>
                      <p className="text-gray-400 text-sm">Permite visualizar relatórios de parcerias</p>
                    </div>
                    <Switch
                      checked={selectedPartnership.permissions.accessReports}
                      onCheckedChange={(checked) => {
                        const updatedPermissions = { ...selectedPartnership.permissions, accessReports: checked };
                        updatePartnershipPermissions(selectedPartnership.id, updatedPermissions);
                        setSelectedPartnership({ ...selectedPartnership, permissions: updatedPermissions });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-cinema-gray-light">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                  onClick={() => setSelectedPartnership(null)}
                >
                  Fechar
                </Button>
                <Button
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  onClick={() => {
                    toast.success("Configurações salvas com sucesso!");
                    setSelectedPartnership(null);
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
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

export default PartnershipManager;
