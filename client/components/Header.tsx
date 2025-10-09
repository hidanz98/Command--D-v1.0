import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, ShoppingCart, User, ChevronDown, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/context/CategoryContext";
import { useLogo } from "@/context/LogoContext";
import { useCompanySettings } from "@/context/CompanyContext";
import { TenantSelector } from "./TenantSelector";
import { useLocation } from "react-router-dom";
import { useInlineEditor, EditPanel } from "./InlineEditor";

// Simplified product interface for search suggestions
interface ProductSuggestion {
  id: string;
  name: string;
  category: string;
  pricePerDay: number;
  image: string;
  available: boolean;
  description: string;
}

// Sample products for autocomplete (in a real app, this would come from an API)
const sampleProducts: ProductSuggestion[] = [
  {
    id: "1",
    name: "Sony FX6 Full Frame",
    category: "Câmeras",
    pricePerDay: 350,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='50' y='100' width='300' height='100' rx='10' fill='%23555'/><circle cx='200' cy='150' r='30' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>Sony FX6</text></svg>",
    available: true,
    description: "Câmera cinematográfica full frame de alta qualidade",
  },
  {
    id: "2",
    name: "Canon EOS R5C",
    category: "Câmeras",
    pricePerDay: 320,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='50' y='100' width='300' height='100' rx='10' fill='%23555'/><circle cx='200' cy='150' r='30' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>Canon R5C</text></svg>",
    available: true,
    description: "Câmera mirrorless com gravação 8K para cinema",
  },
  {
    id: "3",
    name: "Blackmagic URSA Mini Pro 12K",
    category: "Câmeras",
    pricePerDay: 450,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='50' y='100' width='300' height='100' rx='10' fill='%23555'/><circle cx='200' cy='150' r='30' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='14'>URSA Mini Pro</text></svg>",
    available: true,
    description: "Câmera de cinema profissional com resolução 12K",
  },
  {
    id: "4",
    name: "Zeiss CP.3 85mm T2.1",
    category: "Lentes",
    pricePerDay: 120,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><cylinder x='150' y='120' width='100' height='60' rx='50' fill='%23555'/><circle cx='200' cy='150' r='20' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>Zeiss CP.3</text></svg>",
    available: true,
    description: "Lente prime cinematográfica Zeiss de alta qualidade",
  },
  {
    id: "5",
    name: 'Atomos Ninja V 5"',
    category: "Monitores",
    pricePerDay: 80,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='100' y='110' width='200' height='120' rx='5' fill='%23555'/><rect x='110' y='120' width='180' height='100' fill='%23000'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>Atomos Ninja V</text></svg>",
    available: true,
    description: "Monitor/gravador portátil 5 polegadas 4K HDR",
  },
  {
    id: "6",
    name: "DJI Ronin 4D",
    category: "Eletrônicos",
    pricePerDay: 280,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='150' y='100' width='100' height='120' rx='5' fill='%23555'/><circle cx='200' cy='160' r='25' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>DJI Ronin 4D</text></svg>",
    available: true,
    description: "Gimbal estabilizador de câmera profissional DJI",
  },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [equipmentHoverTimeout, setEquipmentHoverTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);
  const { state } = useCart();
  const { isAuthenticated, isAdmin, isInitialized } = useAuth();
  const { getActiveCategories, getActiveSubcategories } = useCategories();
  const { currentLogo } = useLogo();
  const { companySettings } = useCompanySettings();
  const { state: editorState, toggleEditor } = useInlineEditor();
  const navigate = useNavigate();
  const location = useLocation();

  // Generate search suggestions
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const matchingProducts = sampleProducts
        .filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
        )
        .slice(0, 4); // Limit to 4 suggestions for header

      setSuggestions(matchingProducts);
      setShowSuggestions(matchingProducts.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Handle click outside to close suggestions and mobile search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".header-search-container")) {
        setShowSuggestions(false);
        setMobileSearchExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setMobileSearchExpanded(false);
    if (searchQuery.trim()) {
      navigate(
        `/equipamentos?search=${encodeURIComponent(searchQuery.trim())}`,
      );
    }
  };

  const handleSuggestionClick = (suggestion: ProductSuggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    setMobileSearchExpanded(false);
    navigate(`/produto/${suggestion.id}`);
  };

  const handleSearchFocus = () => {
    if (searchQuery.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Get categories dynamically from context
  const getDynamicCategories = () => {
    const activeCategories = getActiveCategories();
    const categoryMap: {
      [key: string]: Array<{ name: string; description?: string }>;
    } = {};

    activeCategories.forEach((category) => {
      const subcategories = getActiveSubcategories(category.id);
      // Ensure subcategories are sorted by order
      const sortedSubcategories = subcategories.sort(
        (a, b) => a.order - b.order,
      );
      categoryMap[category.name] = sortedSubcategories.map((sub) => ({
        name: sub.name,
        description: sub.description,
      }));
    });

    return categoryMap;
  };

  const equipmentCategories = getDynamicCategories();

  return (
    <header className="bg-cinema-dark-lighter border-b border-cinema-gray sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src={currentLogo}
              alt={companySettings.name}
              className="h-10 w-auto hover:opacity-80 transition-opacity duration-300"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-10 ml-6">
            <Link
              to="/"
              className="text-white hover:text-cinema-yellow transition-colors"
            >
              Início
            </Link>

            <div
              className="relative group"
              onMouseEnter={() => {
                if (equipmentHoverTimeout) {
                  clearTimeout(equipmentHoverTimeout);
                  setEquipmentHoverTimeout(null);
                }
                setIsEquipmentOpen(true);
              }}
              onMouseLeave={() => {
                const timeout = setTimeout(() => {
                  setIsEquipmentOpen(false);
                  setHoveredCategory(null);
                }, 150); // 150ms delay to prevent accidental closing
                setEquipmentHoverTimeout(timeout);
              }}
            >
              <div className="flex items-center space-x-1 text-white hover:text-cinema-yellow transition-colors cursor-pointer">
                <span>Equipamentos</span>
                <ChevronDown className="w-4 h-4" />
              </div>

              {isEquipmentOpen && (
                <div className="absolute top-full left-0 pt-2 z-[100]">
                  <div className="relative flex">
                    {/* Fixed Main Categories Panel */}
                    <div className="w-44 bg-black border border-gray-600 rounded-lg shadow-2xl overflow-hidden">
                      {Object.keys(equipmentCategories).map(
                        (category, index) => (
                          <div
                            key={category}
                            className="relative"
                            onMouseEnter={() => {
                              setHoveredCategory(category);
                            }}
                          >
                            <Link
                              to={`/equipamentos/${category.toLowerCase()}`}
                              className={`block px-3 py-3 text-cinema-yellow hover:bg-cinema-yellow hover:text-black transition-colors ${
                                hoveredCategory === category
                                  ? "bg-cinema-yellow text-black font-semibold"
                                  : ""
                              }`}
                            >
                              {category}
                            </Link>

                            {/* Dynamic Subcategories Panel positioned relative to hovered category */}
                            {hoveredCategory === category &&
                              equipmentCategories[hoveredCategory] && (
                                <div className="absolute left-full top-0 w-64 bg-black border border-gray-600 rounded-lg shadow-2xl overflow-hidden h-fit ml-1 z-[110]">
                                  {equipmentCategories[hoveredCategory].map(
                                    (subcategoryData) => (
                                      <Link
                                        key={subcategoryData.name}
                                        to={`/equipamentos/${hoveredCategory.toLowerCase()}/${subcategoryData.name.toLowerCase().replace(/\s+/g, "-")}`}
                                        className="block px-3 py-3 text-cinema-yellow hover:bg-cinema-yellow hover:text-black transition-colors border-b border-gray-700 last:border-b-0"
                                      >
                                        <div className="text-sm font-medium">
                                          {subcategoryData.name}
                                        </div>
                                        {subcategoryData.description && (
                                          <div className="text-xs opacity-75 mt-1 line-clamp-2">
                                            {subcategoryData.description}
                                          </div>
                                        )}
                                      </Link>
                                    ),
                                  )}
                                </div>
                              )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                const whatsappNumber = "5531999908485";
                const message = encodeURIComponent("Preciso de suporte");
                const url = `https://wa.me/${whatsappNumber}?text=${message}`;
                window.open(url, "_blank");
              }}
              className="text-white hover:text-cinema-yellow transition-colors"
            >
              Suporte
            </button>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-6 header-search-container">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                type="search"
                placeholder="Buscar equipamentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                className="pl-10 bg-cinema-gray border-cinema-gray-light text-white placeholder:text-gray-400 focus:border-cinema-yellow"
              />

              {/* Autocomplete Suggestions */}
              {showSuggestions && (
                <div className="absolute top-full mt-2 w-full bg-cinema-gray border border-cinema-gray-light rounded-lg shadow-lg z-[120] max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-cinema-yellow/20 transition-colors border-b border-cinema-gray-light last:border-b-0 flex items-center space-x-3"
                    >
                      <img
                        src={suggestion.image}
                        alt={suggestion.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">
                          {suggestion.name}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {suggestion.category} • R$ {suggestion.pricePerDay}
                          /dia
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Mobile Actions - Search + Login/User + Cart + Menu */}
            <div className="flex lg:hidden items-center space-x-2">
              {/* Mobile Search Button */}
              <button
                onClick={() => setMobileSearchExpanded(true)}
                className="text-white hover:text-cinema-yellow p-2 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* FORCE LOGIN MOBILE */}
              <Link to="/login">
                <Button
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-2 text-sm"
                >
                  <User className="w-4 h-4 mr-1" />
                  LOGIN MOBILE
                </Button>
              </Link>

              {/* REMOVED - Mobile admin buttons */}

              <Link to="/carrinho">
                <Button
                  size="sm"
                  className="bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark font-semibold relative p-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {state.itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                      {state.itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="text-white p-1 ml-2"
                onClick={() => {
                  setIsMenuOpen(!isMenuOpen);
                  if (!isMenuOpen) {
                    setMobileSearchExpanded(false);
                  }
                }}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Desktop Actions - FORCE LOGIN ONLY */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-cinema-yellow bg-red-500"
                >
                  <User className="w-4 h-4 mr-2" />
                  LOGIN FORÇADO
                </Button>
              </Link>

              <Link to="/carrinho">
                <Button
                  size="sm"
                  className="bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark font-semibold relative"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Carrinho
                  {state.itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {state.itemCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Search - Only when expanded */}
        {mobileSearchExpanded && (
          <div className="md:hidden pb-4 header-search-container">
            <div className="relative">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  type="search"
                  placeholder="Buscar equipamentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  className="pl-10 pr-10 bg-cinema-gray border-cinema-gray-light text-white placeholder:text-gray-400 focus:border-cinema-yellow"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setMobileSearchExpanded(false);
                    setSearchQuery("");
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>

              {/* Mobile Autocomplete Suggestions */}
              {showSuggestions && (
                <div className="absolute top-full mt-2 w-full bg-cinema-gray border border-cinema-gray-light rounded-lg shadow-lg z-[120] max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-cinema-yellow/20 transition-colors border-b border-cinema-gray-light last:border-b-0 flex items-center space-x-3"
                    >
                      <img
                        src={suggestion.image}
                        alt={suggestion.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">
                          {suggestion.name}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {suggestion.category} • R$ {suggestion.pricePerDay}
                          /dia
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu - Full Screen */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 bg-gradient-to-b from-cinema-dark-lighter to-cinema-dark z-[60] overflow-y-auto mobile-menu-scroll">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-cinema-gray/30">
              <h2 className="text-xl font-bold text-white">Menu Principal</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col space-y-4 p-6 pb-20">
              {/* Tenant Selector for Mobile */}
              <div className="pb-4 border-b border-cinema-gray/30">
                <TenantSelector />
              </div>

              {/* Ações principais no topo */}
              <div className="flex flex-col space-y-3 pb-4 border-b border-cinema-gray/30">
                {/* FORCE LOGIN MENU MOBILE */}
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 text-lg rounded-xl">
                    <User className="w-5 h-5 mr-3" />
                    LOGIN MENU FORÇADO
                  </Button>
                </Link>

                {/* REMOVED - Mobile admin buttons */}
              </div>

              {/* Links de navegação */}
              <Link
                to="/"
                className="bg-cinema-gray/20 hover:bg-cinema-gray/40 text-white font-medium py-4 px-6 rounded-xl block transition-colors border border-cinema-gray/30"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🏠</span>
                  <span className="text-lg">Página Inicial</span>
                </div>
              </Link>

              {/* Equipamentos como botão principal destacado */}
              <Link
                to="/equipamentos"
                className="bg-gradient-to-r from-cinema-yellow to-yellow-400 hover:from-cinema-yellow-dark hover:to-yellow-500 text-cinema-dark font-bold py-5 px-6 rounded-xl flex items-center justify-between transition-all shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📹</span>
                  <div>
                    <div className="text-lg">Ver Todos os Equipamentos</div>
                    <div className="text-sm opacity-80">
                      Explore nosso catálogo completo
                    </div>
                  </div>
                </div>
                <span className="text-2xl">→</span>
              </Link>

              {/* Categorias principais como cards */}
              <div className="space-y-3 pt-4">
                <h3 className="text-white text-lg font-semibold">
                  Categorias Populares
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.keys(equipmentCategories)
                    .slice(0, 4)
                    .map((category, index) => {
                      const emojis = ["📸", "🎬", "🎙️", "💡"];
                      return (
                        <Link
                          key={category}
                          to={`/equipamentos/${category.toLowerCase()}`}
                          className="block bg-cinema-gray/20 hover:bg-cinema-gray/40 border border-cinema-gray/30 hover:border-cinema-yellow/50 text-white py-4 px-5 rounded-xl transition-all"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-xl mr-3">
                                {emojis[index] || "📦"}
                              </span>
                              <div>
                                <div className="font-medium">{category}</div>
                                <div className="text-sm text-gray-400">
                                  {equipmentCategories[category].length} tipos
                                  disponíveis
                                </div>
                              </div>
                            </div>
                            <span className="text-cinema-yellow">→</span>
                          </div>
                        </Link>
                      );
                    })}
                </div>

                {Object.keys(equipmentCategories).length > 4 && (
                  <Link
                    to="/equipamentos"
                    className="block text-cinema-yellow hover:text-cinema-yellow-dark py-3 px-5 text-center transition-colors border border-cinema-yellow/30 rounded-xl bg-cinema-yellow/5 hover:bg-cinema-yellow/10"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="font-medium">
                      Ver todas as {Object.keys(equipmentCategories).length}{" "}
                      categorias →
                    </div>
                  </Link>
                )}
              </div>

              {/* Ações rápidas */}
              <div className="space-y-3 pt-6 border-t border-cinema-gray/30">
                <h3 className="text-white text-lg font-semibold">
                  Ações Rápidas
                </h3>

                <Link
                  to="/carrinho"
                  className="block bg-cinema-yellow/10 hover:bg-cinema-yellow/20 border border-cinema-yellow/30 hover:border-cinema-yellow/50 text-cinema-yellow py-4 px-5 rounded-xl transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative mr-3">
                        <ShoppingCart className="w-6 h-6 text-cinema-yellow" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-cinema-yellow rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <div className="font-medium">Meu Carrinho</div>
                        <div className="text-sm text-gray-400">
                          {state.itemCount > 0
                            ? `${state.itemCount} itens`
                            : "Carrinho vazio"}
                        </div>
                      </div>
                    </div>
                    {state.itemCount > 0 && (
                      <span className="bg-cinema-yellow text-cinema-dark px-3 py-1 rounded-full text-sm font-bold">
                        {state.itemCount}
                      </span>
                    )}
                  </div>
                </Link>

                <button
                  onClick={() => {
                    const whatsappNumber = "5531999908485";
                    const message = encodeURIComponent("Preciso de suporte");
                    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
                    window.open(url, "_blank");
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-green-600/10 hover:bg-green-600/20 border border-green-500/30 hover:border-green-500/50 text-green-400 py-4 px-5 rounded-xl transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">💬</span>
                      <div>
                        <div className="font-medium">Suporte via WhatsApp</div>
                        <div className="text-sm text-gray-400">
                          Atendimento rápido e direto
                        </div>
                      </div>
                    </div>
                    <span className="text-xl">↗</span>
                  </div>
                </button>

                <Link
                  to="/sobre"
                  className="block bg-cinema-gray/20 hover:bg-cinema-gray/40 border border-cinema-gray/30 hover:border-cinema-gray/50 text-gray-300 py-4 px-5 rounded-xl transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">ℹ️</span>
                      <div>
                        <div className="font-medium">Sobre a Empresa</div>
                        <div className="text-sm text-gray-400">
                          Nossa história e valores
                        </div>
                      </div>
                    </div>
                    <span className="text-cinema-yellow">→</span>
                  </div>
                </Link>
              </div>

              {/* Footer do menu */}
              <div className="pt-6 mt-6 border-t border-cinema-gray/30 text-center">
                <p className="text-gray-400 text-sm">
                  {companySettings.name} - {companySettings.slogan}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Desde 2010 em Belo Horizonte
                </p>
              </div>
            </nav>
          </div>
        )}
      </div>
      
      {/* Edit Panel */}
      <EditPanel />
    </header>
  );
}
