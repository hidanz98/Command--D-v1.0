import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDeviceDetection, getResponsiveColumns, getResponsiveSpacing } from "@/hooks/use-device-detection";
import { 
  Camera, 
  Eye, 
  Star, 
  MapPin, 
  Clock, 
  ShoppingCart, 
  Zap, 
  Award,
  TrendingUp,
  Filter,
  Grid3X3,
  List,
  Search
} from "lucide-react";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  pricePerDay: number;
  image: string;
  rating: number;
  reviewCount: number;
  availability: "available" | "rented" | "maintenance";
  isPopular?: boolean;
  isNew?: boolean;
  brand?: string;
  description?: string;
  features?: string[];
}

interface ResponsiveProductGridProps {
  products: Product[];
  title?: string;
  showFilters?: boolean;
  maxItems?: number;
  category?: string;
}

export function ResponsiveProductGrid({ 
  products, 
  title = "Equipamentos Disponíveis",
  showFilters = true,
  maxItems,
  category 
}: ResponsiveProductGridProps) {
  const device = useDeviceDetection();
  const columns = getResponsiveColumns(device.deviceType);
  const spacing = getResponsiveSpacing(device.deviceType);

  const [viewMode, setViewMode] = useState<"grid" | "list">(device.isMobile ? "list" : "grid");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "rating" | "popularity">("popularity");

  // Update view mode based on device changes
  useEffect(() => {
    if (device.isMobile && viewMode === "grid") {
      setViewMode("list");
    }
  }, [device.isMobile, viewMode]);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesCategory = filterCategory === "all" || product.category === filterCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.pricePerDay - b.pricePerDay;
        case "rating":
          return b.rating - a.rating;
        case "popularity":
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
        default:
          return 0;
      }
    })
    .slice(0, maxItems);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const getAvailabilityColor = (availability: Product["availability"]) => {
    switch (availability) {
      case "available":
        return "bg-green-500";
      case "rented":
        return "bg-red-500";
      case "maintenance":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getAvailabilityText = (availability: Product["availability"]) => {
    switch (availability) {
      case "available":
        return "Disponível";
      case "rented":
        return "Alugado";
      case "maintenance":
        return "Manutenção";
      default:
        return "Indisponível";
    }
  };

  return (
    <section className={`${spacing} bg-cinema-dark`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 className={`${device.isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'} font-bold text-white mb-2`} data-edit-id="responsive-product-grid.title">
              {title}
            </h2>
            <p className="text-gray-400" data-edit-id="responsive-product-grid.count">
              {filteredProducts.length} equipamentos encontrados
            </p>
          </div>

          {/* View Mode Toggle (Desktop/Tablet only) */}
          {!device.isMobile && (
            <div className="flex items-center gap-2 mt-4 lg:mt-0">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="text-cinema-yellow border-cinema-yellow"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="text-cinema-yellow border-cinema-yellow"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className={`${device.isMobile ? 'space-y-4' : 'flex flex-wrap items-center gap-4'} mb-8`}>
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar equipamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-cinema-gray border border-cinema-gray-light rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cinema-yellow"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-cinema-gray border border-cinema-gray-light text-white rounded-lg px-3 py-2 focus:outline-none focus:border-cinema-yellow"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-cinema-gray border border-cinema-gray-light text-white rounded-lg px-3 py-2 focus:outline-none focus:border-cinema-yellow"
            >
              <option value="popularity">Mais Populares</option>
              <option value="name">Nome A-Z</option>
              <option value="price">Menor Preço</option>
              <option value="rating">Melhor Avaliação</option>
            </select>
          </div>
        )}

        {/* Products Grid/List */}
        <div className={
          viewMode === "grid" 
            ? `grid ${columns} gap-6`
            : "space-y-4"
        }>
          {filteredProducts.map((product) => (
            <Card 
              key={product.id}
              className={`bg-cinema-gray border-cinema-gray-light hover:border-cinema-yellow/50 transition-all duration-300 group ${
                viewMode === "list" ? "flex flex-row" : ""
              } ${device.touchSupport ? "" : "hover:scale-105"}`}
            >
              <div className={viewMode === "list" ? "flex-shrink-0" : ""}>
                <div className={`relative overflow-hidden ${
                  viewMode === "list" 
                    ? device.isMobile ? "w-24 h-24" : "w-32 h-32"
                    : "aspect-square"
                } bg-cinema-dark-lighter`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(product.availability)}`} />
                  </div>

                  {/* Popular/New Badges */}
                  <div className="absolute top-2 right-2 space-y-1">
                    {product.isNew && (
                      <Badge className="bg-blue-500 text-white text-xs">
                        Novo
                      </Badge>
                    )}
                    {product.isPopular && (
                      <Badge className="bg-cinema-yellow text-cinema-dark text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>

                  {/* Quick View Button (Desktop only) */}
                  {!device.isMobile && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button size="sm" variant="outline" className="text-white border-white">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <CardContent className={`${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""} p-4`}>
                <div className="space-y-2">
                  {/* Category and Brand */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cinema-yellow">{product.category}</span>
                    {product.brand && (
                      <span className="text-gray-400">{product.brand}</span>
                    )}
                  </div>

                  {/* Product Name */}
                  <h3 className={`font-semibold text-white group-hover:text-cinema-yellow transition-colors ${
                    device.isMobile ? "text-sm" : "text-base"
                  }`}>
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? "text-cinema-yellow fill-cinema-yellow"
                              : "text-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">
                      ({product.reviewCount})
                    </span>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(product.availability)}`} />
                    <span className={`text-sm ${
                      product.availability === "available" ? "text-green-400" : 
                      product.availability === "rented" ? "text-red-400" : "text-yellow-400"
                    }`}>
                      {getAvailabilityText(product.availability)}
                    </span>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className={`${viewMode === "list" ? "flex items-center justify-between mt-4" : "mt-4 space-y-3"}`}>
                  <div>
                    <span className="text-cinema-yellow font-bold text-lg">
                      R$ {product.pricePerDay}
                    </span>
                    <span className="text-gray-400 text-sm">/dia</span>
                  </div>

                  <div className={`${viewMode === "list" ? "flex gap-2" : "space-y-2"}`}>
                    <Link to={`/produto/${product.id}`}>
                      <Button 
                        size={device.isMobile ? "sm" : "default"}
                        variant="outline" 
                        className="text-cinema-yellow border-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark w-full"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {device.isMobile ? "Ver" : "Detalhes"}
                      </Button>
                    </Link>
                    
                    {product.availability === "available" && (
                      <Button 
                        size={device.isMobile ? "sm" : "default"}
                        className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark w-full"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {device.isMobile ? "+" : "Adicionar"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum equipamento encontrado
            </h3>
            <p className="text-gray-400 mb-4">
              Tente ajustar os filtros ou termos de busca
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setFilterCategory("all");
                setSortBy("popularity");
              }}
              variant="outline"
              className="text-cinema-yellow border-cinema-yellow"
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
