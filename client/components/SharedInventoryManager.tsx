import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Building,
  MapPin,
  Search,
  Filter,
  Eye,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Share2,
  Info,
  DollarSign,
  Calculator,
} from "lucide-react";
import { toast } from "sonner";
import ProductCommissionCalculator from "./ProductCommissionCalculator";

interface SharedProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  availability: number;
  totalStock: number;
  ownerCompany: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  images: string[];
  specifications: Record<string, string>;
  isAvailable: boolean;
  pickupLocation: string;
  crossBookingEnabled: boolean;
}

interface CartItem {
  productId: string;
  product: SharedProduct;
  quantity: number;
  days: number;
  pickupAddress: string;
  ownerCompany: string;
}

const SharedInventoryManager: React.FC = () => {
  const [products] = useState<SharedProduct[]>([
    {
      id: "1",
      name: "Câmera RED Komodo 6K",
      category: "Câmeras",
      description: "Câmera profissional 6K com sensor Super35",
      dailyPrice: 450,
      weeklyPrice: 2800,
      monthlyPrice: 10000,
      availability: 2,
      totalStock: 3,
      ownerCompany: {
        id: "bils-cinema",
        name: "Bil's Cinema e Vídeo",
        address: "Rua das Câmeras, 123 - São Paulo, SP",
        phone: "(11) 99999-9999",
      },
      images: ["/placeholder.svg"],
      specifications: {
        "Resolução": "6K",
        "Sensor": "Super35",
        "Fps": "120fps",
        "Codec": "REDCODE RAW",
      },
      isAvailable: true,
      pickupLocation: "São Paulo - SP",
      crossBookingEnabled: true,
    },
    {
      id: "2",
      name: "Lente Zeiss CP.3 85mm",
      category: "Lentes",
      description: "Lente cinema profissional com abertura T2.1",
      dailyPrice: 180,
      weeklyPrice: 1100,
      monthlyPrice: 4000,
      availability: 1,
      totalStock: 2,
      ownerCompany: {
        id: "bils-cinema",
        name: "Bil's Cinema e Vídeo",
        address: "Rua das Câmeras, 123 - São Paulo, SP",
        phone: "(11) 99999-9999",
      },
      images: ["/placeholder.svg"],
      specifications: {
        "Distância Focal": "85mm",
        "Abertura": "T2.1",
        "Montura": "PL Mount",
        "Cobertura": "Super35/Full Frame",
      },
      isAvailable: true,
      pickupLocation: "São Paulo - SP",
      crossBookingEnabled: true,
    },
    {
      id: "3",
      name: "Drone DJI Inspire 2",
      category: "Drones",
      description: "Drone profissional com câmera X7 incluída",
      dailyPrice: 320,
      weeklyPrice: 2000,
      monthlyPrice: 7500,
      availability: 0,
      totalStock: 1,
      ownerCompany: {
        id: "provideo",
        name: "ProVideo Equipamentos",
        address: "Av. Paulista, 456 - São Paulo, SP",
        phone: "(11) 88888-8888",
      },
      images: ["/placeholder.svg"],
      specifications: {
        "Câmera": "X7 6K",
        "Gimbal": "3 eixos",
        "Autonomia": "27 minutos",
        "Alcance": "7km",
      },
      isAvailable: false,
      pickupLocation: "São Paulo - SP",
      crossBookingEnabled: true,
    },
    {
      id: "4",
      name: "Kit Iluminação ARRI",
      category: "Iluminação",
      description: "Kit completo com 3 refletores ARRI e tripés",
      dailyPrice: 250,
      weeklyPrice: 1500,
      monthlyPrice: 5500,
      availability: 1,
      totalStock: 1,
      ownerCompany: {
        id: "cinemax",
        name: "CineMax Locações",
        address: "Rua do Cinema, 789 - Rio de Janeiro, RJ",
        phone: "(21) 77777-7777",
      },
      images: ["/placeholder.svg"],
      specifications: {
        "Tipo": "Tungstênio",
        "Potência": "650W + 1000W + 2000W",
        "Temperatura": "3200K",
        "Inclusos": "Tripés e difusores",
      },
      isAvailable: true,
      pickupLocation: "Rio de Janeiro - RJ",
      crossBookingEnabled: true,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showProductDetail, setShowProductDetail] = useState<SharedProduct | null>(null);

  const categories = ["all", "Câmeras", "Lentes", "Drones", "Iluminação", "Áudio"];
  const companies = [
    { id: "all", name: "Todas as Empresas" },
    { id: "bils-cinema", name: "Bil's Cinema e Vídeo" },
    { id: "provideo", name: "ProVideo Equipamentos" },
    { id: "cinemax", name: "CineMax Locações" },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesCompany = selectedCompany === "all" || product.ownerCompany.id === selectedCompany;
    
    return matchesSearch && matchesCategory && matchesCompany;
  });

  const addToCart = (product: SharedProduct, quantity: number = 1, days: number = 1) => {
    // Verificar se o produto é de outra empresa
    const isFromPartner = product.ownerCompany.id !== "current-company"; // Assumindo que "current-company" é a empresa atual
    
    if (isFromPartner) {
      // Mostrar alerta sobre endereço de retirada
      toast.warning(
        `⚠️ ATENÇÃO: Este produto é da ${product.ownerCompany.name}. ` +
        `Endereço de retirada: ${product.ownerCompany.address}`,
        { duration: 8000 }
      );
    }

    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + quantity, days }
          : item
      ));
    } else {
      const newItem: CartItem = {
        productId: product.id,
        product,
        quantity,
        days,
        pickupAddress: product.ownerCompany.address,
        ownerCompany: product.ownerCompany.name,
      };
      setCart([...cart, newItem]);
    }

    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const getPickupAlert = () => {
    const uniqueCompanies = [...new Set(cart.map(item => item.ownerCompany))];
    
    if (uniqueCompanies.length > 1) {
      return {
        type: "warning",
        message: `⚠️ Seu carrinho possui produtos de ${uniqueCompanies.length} empresas diferentes. ` +
                `Entre em contato com o suporte para alinhar a retirada ou considere retirar em endereços separados.`,
        companies: uniqueCompanies,
      };
    } else if (uniqueCompanies.length === 1 && uniqueCompanies[0] !== "Cabeça de Efeito") {
      const company = cart[0]?.ownerCompany;
      const address = cart[0]?.pickupAddress;
      return {
        type: "info",
        message: `📍 Todos os produtos são da ${company}. Endereço de retirada: ${address}`,
        companies: uniqueCompanies,
      };
    }
    
    return null;
  };

  const pickupAlert = getPickupAlert();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <Share2 className="w-6 h-6 mr-2 text-cinema-yellow" />
            Inventário Compartilhado
          </h2>
          <p className="text-gray-400">
            Explore produtos disponíveis de empresas parceiras
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-600 text-white">
            {filteredProducts.length} produtos
          </Badge>
          <Badge className="bg-green-600 text-white">
            {filteredProducts.filter(p => p.isAvailable).length} disponíveis
          </Badge>
        </div>
      </div>

      {/* Alerta de Retirada */}
      {pickupAlert && (
        <Card className={`border-2 ${
          pickupAlert.type === "warning" 
            ? "border-yellow-500 bg-yellow-500/10" 
            : "border-blue-500 bg-blue-500/10"
        }`}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className={`w-6 h-6 mt-0.5 ${
                pickupAlert.type === "warning" ? "text-yellow-500" : "text-blue-500"
              }`} />
              <div className="flex-1">
                <h4 className={`font-semibold ${
                  pickupAlert.type === "warning" ? "text-yellow-500" : "text-blue-500"
                }`}>
                  {pickupAlert.type === "warning" ? "Múltiplos Endereços de Retirada" : "Informações de Retirada"}
                </h4>
                <p className="text-white text-sm mt-1">{pickupAlert.message}</p>
                {pickupAlert.type === "warning" && (
                  <div className="mt-3 space-y-1">
                    {cart.map((item, index) => (
                      <div key={index} className="text-xs text-gray-300">
                        • {item.product.name} - {item.ownerCompany} ({item.pickupAddress})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="bg-cinema-gray border-cinema-gray-light">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-white">Buscar Produtos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-cinema-dark-lighter border-cinema-gray-light text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Categoria</Label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 bg-cinema-dark-lighter border border-cinema-gray-light rounded text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "Todas as Categorias" : category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-white">Empresa</Label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full p-2 bg-cinema-dark-lighter border border-cinema-gray-light rounded text-white"
              >
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedCompany("all");
                }}
                variant="outline"
                className="w-full border-cinema-gray-light text-white hover:bg-cinema-gray-light"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="bg-cinema-gray border-cinema-gray-light">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Imagem do Produto */}
                <div className="aspect-video bg-cinema-dark-lighter rounded-lg flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>

                {/* Informações do Produto */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold text-sm">{product.name}</h3>
                    <Badge 
                      className={product.isAvailable ? "bg-green-600" : "bg-red-600"}
                    >
                      {product.isAvailable ? "Disponível" : "Indisponível"}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Empresa Proprietária */}
                  <div className="flex items-center space-x-2 mb-3 p-2 bg-cinema-dark-lighter rounded">
                    <Building className="w-4 h-4 text-cinema-yellow" />
                    <div className="flex-1 min-w-0">
                      <p className="text-cinema-yellow text-xs font-medium truncate">
                        {product.ownerCompany.name}
                      </p>
                      <p className="text-gray-400 text-xs flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {product.pickupLocation}
                      </p>
                    </div>
                  </div>

                  {/* Preços */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-cinema-dark-lighter rounded">
                      <p className="text-gray-400 text-xs">Diária</p>
                      <p className="text-white text-sm font-semibold">
                        R$ {product.dailyPrice}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-cinema-dark-lighter rounded">
                      <p className="text-gray-400 text-xs">Semanal</p>
                      <p className="text-white text-sm font-semibold">
                        R$ {product.weeklyPrice}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-cinema-dark-lighter rounded">
                      <p className="text-gray-400 text-xs">Mensal</p>
                      <p className="text-white text-sm font-semibold">
                        R$ {product.monthlyPrice}
                      </p>
                    </div>
                  </div>

                  {/* Disponibilidade */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-xs">Disponibilidade:</span>
                    <span className="text-white text-xs">
                      {product.availability}/{product.totalStock} unidades
                    </span>
                  </div>

                  {/* Calculadora de Comissão */}
                  <ProductCommissionCalculator
                    productId={product.id}
                    productName={product.name}
                    dailyPrice={product.dailyPrice}
                    ownerCompany={product.ownerCompany}
                    rentalDays={1}
                    onAddToCart={(productId, commission) => {
                      // Adicionar ao carrinho com informações de comissão
                      addToCart(product, 1, 1);
                      
                      // Log da comissão para o sistema
                      console.log("Comissão calculada:", commission);
                      
                      if (commission.isCommissionApplied) {
                        toast.success(
                          `Produto adicionado! Margem: R$ ${commission.ourAmount.toFixed(2)} (${commission.ourCommission}%)`,
                          { duration: 5000 }
                        );
                      }
                    }}
                  />

                  {/* Ações Adicionais */}
                  <div className="flex space-x-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowProductDetail(product)}
                      className="flex-1 border-cinema-gray-light text-white hover:bg-cinema-gray-light"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400">Nenhum produto encontrado com os filtros aplicados</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalhes do Produto */}
      {showProductDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-cinema-gray border-cinema-gray-light w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  {showProductDetail.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProductDetail(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Imagem */}
              <div className="aspect-video bg-cinema-dark-lighter rounded-lg flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" />
              </div>

              {/* Informações da Empresa */}
              <div className="p-4 bg-cinema-dark-lighter rounded-lg">
                <h4 className="text-cinema-yellow font-semibold mb-2 flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Empresa Proprietária
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-white font-medium">{showProductDetail.ownerCompany.name}</p>
                    <p className="text-gray-400 text-sm flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {showProductDetail.ownerCompany.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Telefone:</p>
                    <p className="text-white">{showProductDetail.ownerCompany.phone}</p>
                  </div>
                </div>
              </div>

              {/* Especificações */}
              <div>
                <h4 className="text-white font-semibold mb-3">Especificações Técnicas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(showProductDetail.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2 bg-cinema-dark-lighter rounded">
                      <span className="text-gray-400 text-sm">{key}:</span>
                      <span className="text-white text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preços e Disponibilidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white font-semibold mb-3">Preços</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-cinema-dark-lighter rounded">
                      <span className="text-gray-400">Diária:</span>
                      <span className="text-white font-semibold">R$ {showProductDetail.dailyPrice}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-cinema-dark-lighter rounded">
                      <span className="text-gray-400">Semanal:</span>
                      <span className="text-white font-semibold">R$ {showProductDetail.weeklyPrice}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-cinema-dark-lighter rounded">
                      <span className="text-gray-400">Mensal:</span>
                      <span className="text-white font-semibold">R$ {showProductDetail.monthlyPrice}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">Disponibilidade</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-cinema-dark-lighter rounded">
                      <span className="text-gray-400">Status:</span>
                      <Badge className={showProductDetail.isAvailable ? "bg-green-600" : "bg-red-600"}>
                        {showProductDetail.isAvailable ? "Disponível" : "Indisponível"}
                      </Badge>
                    </div>
                    <div className="flex justify-between p-2 bg-cinema-dark-lighter rounded">
                      <span className="text-gray-400">Unidades:</span>
                      <span className="text-white">
                        {showProductDetail.availability}/{showProductDetail.totalStock}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex space-x-2 pt-4 border-t border-cinema-gray-light">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                  onClick={() => setShowProductDetail(null)}
                >
                  Fechar
                </Button>
                <Button
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  onClick={() => {
                    addToCart(showProductDetail);
                    setShowProductDetail(null);
                  }}
                  disabled={!showProductDetail.isAvailable || showProductDetail.availability === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SharedInventoryManager;
