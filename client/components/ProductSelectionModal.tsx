import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  X,
  Plus,
  Package,
  Filter,
  ShoppingCart,
  CheckCircle,
  Eye,
  Minus,
  ArrowLeft,
  Grid3X3,
  List,
  Tag,
} from "lucide-react";

interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  available: number;
  total: number;
  type: "individual" | "kit";
  isKit: boolean;
  kitItems?: string[];
  image?: string;
  description?: string;
}

interface SelectedProduct extends Product {
  quantity: number;
  days: number;
  discount: number;
}

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProducts: (products: SelectedProduct[]) => void;
  existingProducts?: SelectedProduct[];
}

export function ProductSelectionModal({
  isOpen,
  onClose,
  onSelectProducts,
  existingProducts = [],
}: ProductSelectionModalProps) {
  // Mock product data - in real app this would come from API
  const [allProducts] = useState<Product[]>([
    {
      id: 1,
      code: "SFX6-001",
      name: "Sony FX6 Full Frame",
      category: "Câmeras",
      subcategory: "Cinema",
      brand: "Sony",
      price: 450.0,
      available: 3,
      total: 5,
      type: "individual",
      isKit: false,
    },
    {
      id: 2,
      code: "CER5-001",
      name: "Canon EOS R5C",
      category: "Câmeras",
      subcategory: "DSLR",
      brand: "Canon",
      price: 380.0,
      available: 2,
      total: 4,
      type: "individual",
      isKit: false,
    },
    {
      id: 3,
      code: "ZCP3-85",
      name: "Zeiss CP.3 85mm T2.1",
      category: "Lentes",
      subcategory: "Prime",
      brand: "Zeiss",
      price: 120.0,
      available: 1,
      total: 3,
      type: "individual",
      isKit: false,
    },
    {
      id: 4,
      code: "ZCP3-50",
      name: "Zeiss CP.3 50mm T2.1",
      category: "Lentes",
      subcategory: "Prime",
      brand: "Zeiss",
      price: 110.0,
      available: 2,
      total: 3,
      type: "individual",
      isKit: false,
    },
    {
      id: 5,
      code: "ANV5-001",
      name: 'Atomos Ninja V 5"',
      category: "Monitores",
      subcategory: "Externa",
      brand: "Atomos",
      price: 85.0,
      available: 4,
      total: 6,
      type: "individual",
      isKit: false,
    },
    {
      id: 6,
      code: "SHD7-001",
      name: "SmallHD 702 Touch",
      category: "Monitores",
      subcategory: "Touch",
      brand: "SmallHD",
      price: 95.0,
      available: 3,
      total: 5,
      type: "individual",
      isKit: false,
    },
    {
      id: 7,
      code: "DR4D-001",
      name: "DJI Ronin 4D",
      category: "Estabilizadores",
      subcategory: "Gimbal",
      brand: "DJI",
      price: 280.0,
      available: 0,
      total: 2,
      type: "individual",
      isKit: false,
    },
    {
      id: 8,
      code: "MAIR2-001",
      name: "Moza Air 2",
      category: "Estabilizadores",
      subcategory: "Gimbal",
      brand: "Moza",
      price: 180.0,
      available: 2,
      total: 3,
      type: "individual",
      isKit: false,
    },
    {
      id: 9,
      code: "BUMP-001",
      name: "Blackmagic URSA Mini Pro 12K",
      category: "Câmeras",
      subcategory: "Cinema",
      brand: "Blackmagic",
      price: 520.0,
      available: 1,
      total: 2,
      type: "individual",
      isKit: false,
    },
    {
      id: 10,
      code: "ARRI-S30",
      name: "ARRI SkyPanel S30-C",
      category: "Iluminação",
      subcategory: "LED Panel",
      brand: "ARRI",
      price: 350.0,
      available: 2,
      total: 4,
      type: "individual",
      isKit: false,
    },
    {
      id: 11,
      code: "APU-300X",
      name: "Aputure 300X",
      category: "Iluminação",
      subcategory: "LED",
      brand: "Aputure",
      price: 280.0,
      available: 3,
      total: 5,
      type: "individual",
      isKit: false,
    },
    {
      id: 15,
      code: "ZCP3-35",
      name: "Zeiss CP.3 35mm T2.1",
      category: "Lentes",
      subcategory: "Prime",
      brand: "Zeiss",
      price: 115.0,
      available: 2,
      total: 3,
      type: "individual",
      isKit: false,
    },
    {
      id: 16,
      code: "ZCP3-25",
      name: "Zeiss CP.3 25mm T2.1",
      category: "Lentes",
      subcategory: "Prime",
      brand: "Zeiss",
      price: 125.0,
      available: 1,
      total: 2,
      type: "individual",
      isKit: false,
    },
    {
      id: 17,
      code: "RED-KOMD",
      name: "Red Komodo 6K",
      category: "Câmeras",
      subcategory: "Cinema",
      brand: "Red",
      price: 680.0,
      available: 1,
      total: 2,
      type: "individual",
      isKit: false,
    },
    {
      id: 18,
      code: "ARRI-MINI",
      name: "Arri Alexa Mini LF",
      category: "Câmeras",
      subcategory: "Cinema",
      brand: "Arri",
      price: 1200.0,
      available: 1,
      total: 1,
      type: "individual",
      isKit: false,
    },
    {
      id: 19,
      code: "TILT-NM",
      name: "Tilta Nucleus-M",
      category: "Acessórios",
      subcategory: "Follow Focus",
      brand: "Tilta",
      price: 95.0,
      available: 3,
      total: 4,
      type: "individual",
      isKit: false,
    },
    {
      id: 20,
      code: "TERA-4K",
      name: "Teradek Bolt 4K LT",
      category: "Transmissão",
      subcategory: "Wireless",
      brand: "Teradek",
      price: 180.0,
      available: 2,
      total: 3,
      type: "individual",
      isKit: false,
    },
    {
      id: 12,
      code: "KIT-001",
      name: "Kit Filmagem Completo",
      category: "Kits",
      subcategory: "Profissional",
      brand: "Diversos",
      price: 850.0,
      available: 2,
      total: 3,
      type: "kit",
      isKit: true,
      kitItems: ["Sony FX6", "Zeiss 85mm", "Atomos Ninja V", "DJI Ronin 4D"],
    },
    {
      id: 13,
      code: "KIT-002",
      name: "Kit Iniciante",
      category: "Kits",
      subcategory: "Básico",
      brand: "Diversos",
      price: 420.0,
      available: 3,
      total: 4,
      type: "kit",
      isKit: true,
      kitItems: ["Canon R5C", "SmallHD Monitor"],
    },
    {
      id: 14,
      code: "KIT-003",
      name: "Kit Documentário",
      category: "Kits",
      subcategory: "Documentário",
      brand: "Diversos",
      price: 680.0,
      available: 1,
      total: 2,
      type: "kit",
      isKit: true,
      kitItems: ["Blackmagic URSA", "Zeiss 50mm", "SmallHD Monitor"],
    },
  ]);

  // State
  const [selectedProducts, setSelectedProducts] =
    useState<SelectedProduct[]>(existingProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [subcategoryFilter, setSubcategoryFilter] = useState("Todas");
  const [brandFilter, setBrandFilter] = useState("Todas");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [view, setView] = useState<"grid" | "list">("list");
  const [showCart, setShowCart] = useState(false);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Get unique filter options
  const categories = ["Todas", ...new Set(allProducts.map((p) => p.category))];
  const subcategories = [
    "Todas",
    ...new Set(allProducts.map((p) => p.subcategory)),
  ];
  const brands = ["Todas", ...new Set(allProducts.map((p) => p.brand))];

  // Filter products
  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "Todas" || product.category === categoryFilter;
    const matchesSubcategory =
      subcategoryFilter === "Todas" ||
      product.subcategory === subcategoryFilter;
    const matchesBrand =
      brandFilter === "Todas" || product.brand === brandFilter;
    const matchesType =
      typeFilter === "Todos" ||
      (typeFilter === "Individual" && !product.isKit) ||
      (typeFilter === "Kit" && product.isKit);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSubcategory &&
      matchesBrand &&
      matchesType
    );
  });

  const addToSelection = (product: Product) => {
    const existingIndex = selectedProducts.findIndex(
      (p) => p.id === product.id,
    );

    if (existingIndex >= 0) {
      // Increase quantity if already selected
      const updated = [...selectedProducts];
      updated[existingIndex].quantity += 1;
      setSelectedProducts(updated);
    } else {
      // Add new product
      const newProduct: SelectedProduct = {
        ...product,
        quantity: 1,
        days: 1,
        discount: 0,
      };
      setSelectedProducts([...selectedProducts, newProduct]);
    }
  };

  const removeFromSelection = (productId: number) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const updateProductQuantity = (productId: number, quantity: number) => {
    const updated = selectedProducts.map((p) =>
      p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p,
    );
    setSelectedProducts(updated);
  };

  const updateProductDays = (productId: number, days: number) => {
    const updated = selectedProducts.map((p) =>
      p.id === productId ? { ...p, days: Math.max(1, days) } : p,
    );
    setSelectedProducts(updated);
  };

  const updateProductDiscount = (productId: number, discount: number) => {
    const updated = selectedProducts.map((p) =>
      p.id === productId
        ? { ...p, discount: Math.max(0, Math.min(100, discount)) }
        : p,
    );
    setSelectedProducts(updated);
  };

  const getTotalValue = () => {
    return selectedProducts.reduce((total, product) => {
      const itemTotal =
        product.price *
        product.quantity *
        product.days *
        (1 - product.discount / 100);
      return total + itemTotal;
    }, 0);
  };

  const handleConfirmSelection = () => {
    onSelectProducts(selectedProducts);
    onClose();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("Todas");
    setSubcategoryFilter("Todas");
    setBrandFilter("Todas");
    setTypeFilter("Todos");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg w-full max-w-7xl mx-4 max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-cinema-gray-light">
          <div>
            <h3 className="text-xl font-bold text-white">
              Selecionar Produtos e Equipamentos
            </h3>
            <p className="text-gray-400 text-sm">
              Escolha os itens para adicionar à locação
              <span className="text-gray-500 text-xs ml-2">
                • Pressione ESC para fechar
              </span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCart(!showCart)}
              className="text-cinema-yellow border-cinema-yellow"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Carrinho ({selectedProducts.length})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-400/50 transition-all"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Left Panel - Filters and Products */}
          <div
            className={`${showCart ? "w-2/3" : "w-full"} border-r border-cinema-gray-light overflow-hidden flex flex-col`}
          >
            {/* Filters */}
            <div className="p-6 border-b border-cinema-gray-light">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <Label className="text-white text-sm">Buscar Produtos</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Nome, código, marca..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label className="text-white text-sm">Categoria</Label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div>
                  <Label className="text-white text-sm">Sub-Categoria</Label>
                  <select
                    value={subcategoryFilter}
                    onChange={(e) => setSubcategoryFilter(e.target.value)}
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 text-sm"
                  >
                    {subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <Label className="text-white text-sm">Marca</Label>
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 text-sm"
                  >
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <Label className="text-white text-sm">Tipo</Label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="Todos">Todos</option>
                    <option value="Individual">Individual</option>
                    <option value="Kit">Kit</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-gray-400 text-sm">
                  {filteredProducts.length} produtos encontrados
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearFilters}
                    className="text-gray-400 border-gray-400"
                  >
                    Limpar Filtros
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setView(view === "grid" ? "list" : "grid")}
                    className="text-cinema-yellow border-cinema-yellow"
                  >
                    {view === "grid" ? (
                      <List className="w-4 h-4" />
                    ) : (
                      <Grid3X3 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto p-6">
              {view === "list" ? (
                /* List View - Matching first image */
                <div className="space-y-3">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProducts.some(
                      (p) => p.id === product.id,
                    );
                    const selectedProduct = selectedProducts.find(
                      (p) => p.id === product.id,
                    );

                    return (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-cinema-yellow/10 border-cinema-yellow"
                            : "bg-cinema-dark-lighter border-cinema-gray-light hover:border-cinema-yellow/50"
                        }`}
                      >
                        {/* Product Icon */}
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-cinema-gray rounded-lg flex items-center justify-center">
                            {product.isKit ? (
                              <Package className="w-5 h-5 text-purple-400" />
                            ) : (
                              <Tag className="w-5 h-5 text-cinema-yellow" />
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-white font-medium text-sm">
                                {product.name}
                              </h4>
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              )}
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                              <span className="font-mono">{product.code}</span>
                              <span>{product.brand}</span>
                              <span>{product.category}</span>
                              <span
                                className={`${product.available > 0 ? "text-green-400" : "text-red-400"}`}
                              >
                                {product.available} disponível
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price and Add Button */}
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-cinema-yellow font-bold text-lg">
                              R$ {product.price.toFixed(2)}
                            </div>
                            <div className="text-gray-400 text-xs">por dia</div>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => addToSelection(product)}
                            disabled={product.available === 0}
                            className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark px-4 py-2 text-sm"
                          >
                            {isSelected ? (
                              <>
                                <Plus className="w-4 h-4 mr-1" />
                                Adicionar Mais
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-1" />
                                Adicionar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProducts.some(
                      (p) => p.id === product.id,
                    );

                    return (
                      <Card
                        key={product.id}
                        className={`${isSelected ? "border-cinema-yellow bg-cinema-yellow/5" : "bg-cinema-dark-lighter border-cinema-gray-light"}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-white font-medium text-sm">
                                  {product.name}
                                </h4>
                                {product.isKit && (
                                  <span className="bg-purple-400/20 text-purple-400 text-xs px-2 py-1 rounded">
                                    KIT
                                  </span>
                                )}
                                {isSelected && (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                )}
                              </div>
                              <p className="text-gray-400 text-xs font-mono">
                                {product.code}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {product.brand} • {product.category}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-cinema-yellow font-bold">
                                R$ {product.price.toFixed(2)}
                              </p>
                              <p className="text-gray-400 text-xs">por dia</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span
                              className={`text-sm ${product.available > 0 ? "text-green-400" : "text-red-400"}`}
                            >
                              {product.available} disponível
                            </span>
                            <Button
                              size="sm"
                              onClick={() => addToSelection(product)}
                              disabled={product.available === 0}
                              className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark h-8"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Shopping Cart */}
          {showCart && (
            <div className="w-1/3 overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-white font-semibold">
                    Produtos Selecionados
                  </h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCart(false)}
                    className="text-gray-400 hover:text-white hover:bg-red-500/20 transition-all"
                    title="Fechar carrinho"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">Nenhum produto selecionado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="bg-cinema-dark border-cinema-gray-light"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h5 className="text-white font-medium text-sm">
                                {product.name}
                              </h5>
                              <p className="text-gray-400 text-xs">
                                {product.code}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromSelection(product.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-6 w-6 p-0 transition-all"
                              title="Remover produto"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-white text-xs">
                                Quantidade
                              </Label>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateProductQuantity(
                                      product.id,
                                      product.quantity - 1,
                                    )
                                  }
                                  disabled={product.quantity <= 1}
                                  className="h-6 w-6 p-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="text-white text-sm w-8 text-center">
                                  {product.quantity}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateProductQuantity(
                                      product.id,
                                      product.quantity + 1,
                                    )
                                  }
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <Label className="text-white text-xs">Dias</Label>
                              <Input
                                type="number"
                                value={product.days}
                                onChange={(e) =>
                                  updateProductDays(
                                    product.id,
                                    parseInt(e.target.value) || 1,
                                  )
                                }
                                min="1"
                                className="w-16 h-6 text-xs bg-cinema-gray border-cinema-gray-light text-white"
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label className="text-white text-xs">
                                Desconto %
                              </Label>
                              <Input
                                type="number"
                                value={product.discount}
                                onChange={(e) =>
                                  updateProductDiscount(
                                    product.id,
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                min="0"
                                max="100"
                                className="w-16 h-6 text-xs bg-cinema-gray border-cinema-gray-light text-white"
                              />
                            </div>

                            <Separator className="bg-cinema-gray-light" />

                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-xs">
                                Subtotal
                              </span>
                              <span className="text-cinema-yellow font-bold text-sm">
                                R${" "}
                                {(
                                  product.price *
                                  product.quantity *
                                  product.days *
                                  (1 - product.discount / 100)
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-cinema-gray-light p-6">
          <div className="flex justify-between items-center">
            <div className="text-white">
              <span className="text-gray-400">Total: </span>
              <span className="text-2xl font-bold text-cinema-yellow">
                R$ {getTotalValue().toFixed(2)}
              </span>
              {selectedProducts.length > 0 && (
                <span className="text-gray-400 text-sm ml-2">
                  ({selectedProducts.length}{" "}
                  {selectedProducts.length === 1 ? "item" : "itens"})
                </span>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="text-gray-400 border-gray-400 hover:text-white hover:border-white hover:bg-gray-500/10 transition-all"
              >
                <X className="w-4 h-4 mr-2" />
                Fechar
              </Button>
              <Button
                onClick={handleConfirmSelection}
                disabled={selectedProducts.length === 0}
                className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
              >
                Confirmar Seleção ({selectedProducts.length})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
