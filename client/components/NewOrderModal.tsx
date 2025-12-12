import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, Trash2, User, Package, Calendar, DollarSign, FileText, Loader2 } from "lucide-react";

interface Equipment {
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
  days: number;
  discount: number;
  total: number;
}

interface OrderFormData {
  orderNumber: string;
  status: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientCNPJ: string;
  pickupDate: string;
  returnDate: string;
  projectName: string;
  equipment: Equipment[];
  subtotal: number;
  discount: number;
  total: number;
  notes: string;
}

interface NewOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: OrderFormData) => void;
  initialData?: Partial<OrderFormData>;
  generateOrderNumber: () => string;
  products: any[];
  clients: any[];
}

export function NewOrderModal({
  open,
  onClose,
  onSubmit,
  initialData,
  generateOrderNumber,
  products = [],
  clients = [],
}: NewOrderModalProps) {
  const [activeTab, setActiveTab] = useState("info");
  const [formData, setFormData] = useState<OrderFormData>({
    orderNumber: "",
    status: "Orcamento",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    clientCNPJ: "",
    pickupDate: "",
    returnDate: "",
    projectName: "",
    equipment: [],
    subtotal: 0,
    discount: 0,
    total: 0,
    notes: "",
  });
  
  const [clientSearch, setClientSearch] = useState("");
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [loadedProducts, setLoadedProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        orderNumber: initialData?.orderNumber || generateOrderNumber(),
        status: initialData?.status || "Orcamento",
        clientName: initialData?.clientName || "",
        clientPhone: initialData?.clientPhone || "",
        clientEmail: initialData?.clientEmail || "",
        clientCNPJ: initialData?.clientCNPJ || "",
        pickupDate: initialData?.pickupDate || new Date().toISOString().split("T")[0],
        returnDate: initialData?.returnDate || "",
        projectName: initialData?.projectName || "",
        equipment: initialData?.equipment || [],
        subtotal: initialData?.subtotal || 0,
        discount: initialData?.discount || 0,
        total: initialData?.total || 0,
        notes: initialData?.notes || "",
      });
      setActiveTab("info");
      
      // Fetch products from API
      fetchProducts();
    }
  }, [open, initialData, generateOrderNumber]);

  // Fetch products from API
  const fetchProducts = async () => {
    if (loadedProducts.length > 0) return; // Already loaded
    setLoadingProducts(true);
    try {
      const response = await fetch("/api/public/products");
      if (response.ok) {
        const data = await response.json();
        setLoadedProducts(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Calculate totals when equipment changes
  useEffect(() => {
    const subtotal = formData.equipment.reduce((sum, eq) => sum + eq.total, 0);
    const total = subtotal - formData.discount;
    setFormData(prev => ({ ...prev, subtotal, total }));
  }, [formData.equipment, formData.discount]);

  const handleChange = (field: keyof OrderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientSearch = (search: string) => {
    setClientSearch(search);
    setShowClientSuggestions(search.length > 0);
    handleChange("clientName", search);
  };

  const selectClient = (client: any) => {
    setFormData(prev => ({
      ...prev,
      clientName: client.name,
      clientPhone: client.phone || "",
      clientEmail: client.email || "",
      clientCNPJ: client.cnpj || "",
    }));
    setClientSearch(client.name);
    setShowClientSuggestions(false);
  };

  const addProduct = (product: any) => {
    const newEquipment: Equipment = {
      code: product.sku || `PROD-${Date.now()}`,
      description: product.name,
      quantity: 1,
      unitPrice: product.dailyPrice || 0,
      days: 1,
      discount: 0,
      total: product.dailyPrice || 0,
    };
    setFormData(prev => ({
      ...prev,
      equipment: [...prev.equipment, newEquipment],
    }));
    setShowProductSelector(false);
  };

  const updateEquipment = (index: number, field: keyof Equipment, value: number) => {
    setFormData(prev => {
      const equipment = [...prev.equipment];
      equipment[index] = { ...equipment[index], [field]: value };
      // Recalculate total
      const eq = equipment[index];
      eq.total = (eq.unitPrice * eq.quantity * eq.days) * (1 - eq.discount / 100);
      return { ...prev, equipment };
    });
  };

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (!formData.clientName) {
      alert("Por favor, informe o nome do cliente");
      setActiveTab("cliente");
      return;
    }
    if (!formData.pickupDate || !formData.returnDate) {
      alert("Por favor, informe as datas de retirada e devolução");
      setActiveTab("datas");
      return;
    }
    onSubmit(formData);
  };

  const filteredClients = clients.filter((c: any) =>
    c.name?.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-hidden bg-cinema-dark border-cinema-gray-light p-0">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-cinema-gray-light bg-cinema-gray">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cinema-yellow" />
              Novo Pedido
            </h2>
            <p className="text-xs text-gray-400">#{formData.orderNumber}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-4 bg-cinema-gray m-2 rounded-lg">
            <TabsTrigger value="info" className="text-xs data-[state=active]:bg-cinema-yellow data-[state=active]:text-cinema-dark">
              <FileText className="w-3 h-3 mr-1" />
              Info
            </TabsTrigger>
            <TabsTrigger value="cliente" className="text-xs data-[state=active]:bg-cinema-yellow data-[state=active]:text-cinema-dark">
              <User className="w-3 h-3 mr-1" />
              Cliente
            </TabsTrigger>
            <TabsTrigger value="produtos" className="text-xs data-[state=active]:bg-cinema-yellow data-[state=active]:text-cinema-dark">
              <Package className="w-3 h-3 mr-1" />
              Itens
            </TabsTrigger>
            <TabsTrigger value="datas" className="text-xs data-[state=active]:bg-cinema-yellow data-[state=active]:text-cinema-dark">
              <Calendar className="w-3 h-3 mr-1" />
              Datas
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {/* Tab: Info */}
            <TabsContent value="info" className="mt-0 space-y-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-white text-xs">Número do Pedido</Label>
                  <Input
                    value={formData.orderNumber}
                    onChange={(e) => handleChange("orderNumber", e.target.value)}
                    className="bg-cinema-gray border-cinema-gray-light text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-white text-xs">Status</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full bg-cinema-gray border border-cinema-gray-light text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="Orcamento">Orçamento</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Em Locacao">Em Locação</option>
                    <option value="Entregue">Entregue</option>
                    <option value="Devolvido">Devolvido</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <div>
                  <Label className="text-white text-xs">Nome do Projeto</Label>
                  <Input
                    value={formData.projectName}
                    onChange={(e) => handleChange("projectName", e.target.value)}
                    className="bg-cinema-gray border-cinema-gray-light text-white"
                    placeholder="Ex: Filme XYZ, Comercial ABC"
                  />
                </div>

                <div>
                  <Label className="text-white text-xs">Observações</Label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    className="w-full bg-cinema-gray border border-cinema-gray-light text-white rounded-md px-3 py-2 text-sm resize-none"
                    rows={3}
                    placeholder="Observações do pedido..."
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab: Cliente */}
            <TabsContent value="cliente" className="mt-0 space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <Label className="text-white text-xs">Nome do Cliente *</Label>
                  <Input
                    value={clientSearch || formData.clientName}
                    onChange={(e) => handleClientSearch(e.target.value)}
                    onFocus={() => setShowClientSuggestions(clientSearch.length > 0)}
                    className="bg-cinema-gray border-cinema-gray-light text-white"
                    placeholder="Digite para buscar..."
                  />
                  {showClientSuggestions && filteredClients.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-cinema-gray border border-cinema-gray-light rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                      {filteredClients.slice(0, 5).map((client: any, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectClient(client)}
                          className="w-full text-left px-3 py-2 hover:bg-cinema-yellow hover:text-cinema-dark text-white text-sm"
                        >
                          {client.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-white text-xs">Telefone</Label>
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) => handleChange("clientPhone", e.target.value)}
                    className="bg-cinema-gray border-cinema-gray-light text-white"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <Label className="text-white text-xs">E-mail</Label>
                  <Input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => handleChange("clientEmail", e.target.value)}
                    className="bg-cinema-gray border-cinema-gray-light text-white"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <Label className="text-white text-xs">CNPJ/CPF</Label>
                  <Input
                    value={formData.clientCNPJ}
                    onChange={(e) => handleChange("clientCNPJ", e.target.value)}
                    className="bg-cinema-gray border-cinema-gray-light text-white"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab: Produtos */}
            <TabsContent value="produtos" className="mt-0 space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-white text-sm font-semibold">Equipamentos</Label>
                <Button
                  size="sm"
                  onClick={() => setShowProductSelector(true)}
                  className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar
                </Button>
              </div>

              {formData.equipment.length === 0 ? (
                <Card className="bg-cinema-gray border-cinema-gray-light">
                  <CardContent className="p-6 text-center">
                    <Package className="w-10 h-10 mx-auto text-gray-500 mb-2" />
                    <p className="text-gray-400 text-sm">Nenhum item adicionado</p>
                    <Button
                      size="sm"
                      onClick={() => setShowProductSelector(true)}
                      className="mt-3 bg-cinema-yellow text-cinema-dark"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar Produto
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {formData.equipment.map((eq, idx) => (
                    <Card key={idx} className="bg-cinema-gray border-cinema-gray-light">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium truncate">{eq.description}</p>
                            <p className="text-gray-400 text-xs">{eq.code}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEquipment(idx)}
                            className="text-red-400 hover:text-red-300 p-1 h-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <Label className="text-gray-400 text-[10px]">Qtd</Label>
                            <Input
                              type="number"
                              min="1"
                              value={eq.quantity}
                              onChange={(e) => updateEquipment(idx, "quantity", parseInt(e.target.value) || 1)}
                              className="bg-cinema-dark border-cinema-gray-light text-white text-xs h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-400 text-[10px]">Dias</Label>
                            <Input
                              type="number"
                              min="1"
                              value={eq.days}
                              onChange={(e) => updateEquipment(idx, "days", parseInt(e.target.value) || 1)}
                              className="bg-cinema-dark border-cinema-gray-light text-white text-xs h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-400 text-[10px]">Desc %</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={eq.discount}
                              onChange={(e) => updateEquipment(idx, "discount", parseInt(e.target.value) || 0)}
                              className="bg-cinema-dark border-cinema-gray-light text-white text-xs h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-400 text-[10px]">Total</Label>
                            <div className="bg-cinema-dark border border-cinema-gray-light rounded-md px-2 py-1 text-cinema-yellow text-xs h-8 flex items-center">
                              R$ {eq.total.toFixed(0)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Product Selector */}
              {showProductSelector && (
                <Card className="bg-cinema-dark border-cinema-yellow">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-cinema-yellow text-sm">Selecionar Produto</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowProductSelector(false)}
                        className="text-gray-400 p-1 h-auto"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {loadingProducts ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-cinema-yellow" />
                          <span className="ml-2 text-gray-400 text-sm">Carregando...</span>
                        </div>
                      ) : loadedProducts.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4">Nenhum produto encontrado</p>
                      ) : (
                        loadedProducts.slice(0, 15).map((product: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => addProduct(product)}
                            className="w-full text-left px-2 py-2 hover:bg-cinema-yellow hover:text-cinema-dark text-white text-sm rounded transition-colors"
                          >
                            <span className="font-medium">{product.name}</span>
                            <span className="text-gray-400 text-xs ml-2">
                              R$ {product.dailyPrice?.toFixed(2) || "0.00"}/dia
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tab: Datas */}
            <TabsContent value="datas" className="mt-0 space-y-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-white text-xs">Data de Retirada *</Label>
                  <Input
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => handleChange("pickupDate", e.target.value)}
                    className="bg-cinema-gray border-cinema-gray-light text-white"
                    style={{ colorScheme: "dark" }}
                  />
                </div>

                <div>
                  <Label className="text-white text-xs">Data de Devolução *</Label>
                  <Input
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => handleChange("returnDate", e.target.value)}
                    className="bg-cinema-gray border-cinema-gray-light text-white"
                    style={{ colorScheme: "dark" }}
                  />
                </div>

                {/* Summary */}
                <Card className="bg-cinema-gray border-cinema-gray-light mt-4">
                  <CardContent className="p-4">
                    <h4 className="text-cinema-yellow font-semibold text-sm mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Resumo do Pedido
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Itens:</span>
                        <span className="text-white">{formData.equipment.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Subtotal:</span>
                        <span className="text-white">R$ {formData.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Desconto:</span>
                        <Input
                          type="number"
                          min="0"
                          value={formData.discount}
                          onChange={(e) => handleChange("discount", parseFloat(e.target.value) || 0)}
                          className="w-24 bg-cinema-dark border-cinema-gray-light text-white text-xs h-7 text-right"
                        />
                      </div>
                      <div className="flex justify-between border-t border-cinema-gray-light pt-2 mt-2">
                        <span className="text-white font-bold">TOTAL:</span>
                        <span className="text-cinema-yellow font-bold text-lg">
                          R$ {formData.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-cinema-gray-light bg-cinema-gray">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 text-gray-400 border-gray-500"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark font-semibold"
          >
            Salvar Pedido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

