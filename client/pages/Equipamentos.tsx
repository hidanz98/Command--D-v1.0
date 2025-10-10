import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  ShoppingCart,
  Eye,
  Search,
  Filter,
  Camera,
  Monitor,
  Zap,
  Aperture,
  Lightbulb,
  Mic,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useState, useMemo, useEffect, useCallback } from "react";
import { EditorOverlay, EditPanel } from "@/components/InlineEditor";

interface Product {
  id: string;
  name: string;
  category: string;
  pricePerDay: number;
  image: string;
  rating: number;
  reviews: number;
  available: boolean;
  featured?: boolean;
  description: string;
}

// NOTE: Replaced static catalog by API-driven list (fallback remains if API fails)
let allProducts: Product[] = [
  {
    id: "1",
    name: "Sony FX6 Full Frame",
    category: "Câmeras",
    pricePerDay: 450,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='50' y='100' width='300' height='100' rx='10' fill='%23555'/><circle cx='200' cy='150' r='30' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>Sony FX6</text></svg>",
    rating: 4.9,
    reviews: 124,
    available: true,
    featured: true,
    description: "Câmera cinematográfica full frame de alta qualidade com gravação 4K ProRes",
  },
  {
    id: "2",
    name: "Canon EOS R5C",
    category: "Câmeras",
    pricePerDay: 320,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='50' y='100' width='300' height='100' rx='10' fill='%23555'/><circle cx='200' cy='150' r='30' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>Canon R5C</text></svg>",
    rating: 4.8,
    reviews: 89,
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
    rating: 4.7,
    reviews: 67,
    available: true,
    featured: true,
    description: "Câmera de cinema profissional com resolução 12K",
  },
  {
    id: "4",
    name: "RED Komodo 6K",
    category: "Câmeras",
    pricePerDay: 500,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='50' y='100' width='300' height='100' rx='10' fill='%23555'/><circle cx='200' cy='150' r='30' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>RED Komodo</text></svg>",
    rating: 4.9,
    reviews: 45,
    available: true,
    featured: true,
    description: "Câmera de cinema compacta RED com resolução 6K",
  },
  {
    id: "5",
    name: "Zeiss CP.3 85mm T2.1",
    category: "Lentes",
    pricePerDay: 120,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><cylinder x='150' y='120' width='100' height='60' rx='50' fill='%23555'/><circle cx='200' cy='150' r='20' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>Zeiss CP.3</text></svg>",
    rating: 4.9,
    reviews: 156,
    available: true,
    description: "Lente prime cinematográfica Zeiss de alta qualidade",
  },
  {
    id: "6",
    name: "Canon 24-70mm f/2.8L",
    category: "Lentes",
    pricePerDay: 80,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><cylinder x='150' y='120' width='100' height='60' rx='50' fill='%23555'/><circle cx='200' cy='150' r='20' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='14'>Canon 24-70</text></svg>",
    rating: 4.7,
    reviews: 203,
    available: true,
    description: "Lente zoom profissional Canon L-series",
  },
  {
    id: "7",
    name: "Sigma 50mm f/1.4 Art",
    category: "Lentes",
    pricePerDay: 60,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><cylinder x='150' y='120' width='100' height='60' rx='50' fill='%23555'/><circle cx='200' cy='150' r='20' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='14'>Sigma 50mm</text></svg>",
    rating: 4.8,
    reviews: 178,
    available: false,
    description: "Lente prime Sigma Art com grande abertura",
  },
  {
    id: "8",
    name: 'Atomos Ninja V 5"',
    category: "Monitores",
    pricePerDay: 80,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='100' y='110' width='200' height='120' rx='5' fill='%23555'/><rect x='110' y='120' width='180' height='100' fill='%23000'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>Atomos Ninja V</text></svg>",
    rating: 4.6,
    reviews: 203,
    available: true,
    description: "Monitor/gravador portátil 5 polegadas 4K HDR",
  },
  {
    id: "9",
    name: "SmallHD 703 UltraBright",
    category: "Monitores",
    pricePerDay: 120,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='100' y='110' width='200' height='120' rx='5' fill='%23555'/><rect x='110' y='120' width='180' height='100' fill='%23000'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='14'>SmallHD 703</text></svg>",
    rating: 4.8,
    reviews: 89,
    available: true,
    description: "Monitor profissional 7 polegadas ultra brilhante",
  },
  {
    id: "10",
    name: "DJI Ronin 4D",
    category: "Eletrônicos",
    pricePerDay: 280,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='150' y='100' width='100' height='120' rx='5' fill='%23555'/><circle cx='200' cy='160' r='25' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>DJI Ronin 4D</text></svg>",
    rating: 4.8,
    reviews: 92,
    available: true,
    featured: true,
    description: "Gimbal estabilizador de câmera profissional DJI",
  },
  {
    id: "11",
    name: "Zhiyun Crane 3S",
    category: "Eletrônicos",
    pricePerDay: 180,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='150' y='100' width='100' height='120' rx='5' fill='%23555'/><circle cx='200' cy='160' r='25' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='14'>Zhiyun Crane</text></svg>",
    rating: 4.5,
    reviews: 134,
    available: true,
    description: "Gimbal para câmeras pesadas com alta carga útil",
  },
  {
    id: "12",
    name: "Teradek Bolt 4K LT 750",
    category: "Eletrônicos",
    pricePerDay: 200,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='100' y='130' width='200' height='40' rx='5' fill='%23555'/><circle cx='200' cy='150' r='15' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='14'>Teradek Bolt</text></svg>",
    rating: 4.7,
    reviews: 67,
    available: true,
    description: "Sistema de transmissão wireless 4K sem latência",
  },
  // Novos Produtos Adicionados - 2024
  {
    id: "13",
    name: "ARRI Alexa Mini LF",
    category: "Câmeras",
    pricePerDay: 850,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='50' y='100' width='300' height='100' rx='10' fill='%23555'/><circle cx='200' cy='150' r='30' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='14'>ARRI Alexa Mini</text></svg>",
    rating: 5.0,
    reviews: 89,
    available: true,
    featured: true,
    description: "Câmera de cinema profissional ARRI com sensor Large Format",
  },
  {
    id: "14",
    name: "Canon CN-E 50mm T1.3 L F",
    category: "Lentes",
    pricePerDay: 180,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><cylinder x='150' y='120' width='100' height='60' rx='50' fill='%23555'/><circle cx='200' cy='150' r='20' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='14'>Canon CN-E</text></svg>",
    rating: 4.8,
    reviews: 145,
    available: true,
    description: "Lente prime cinematográfica Canon com abertura T1.3",
  },
  {
    id: "15",
    name: "ARRI SkyPanel S30-C",
    category: "Iluminação",
    pricePerDay: 220,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='100' y='80' width='200' height='140' rx='10' fill='%23555'/><rect x='120' y='100' width='160' height='100' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='14'>ARRI SkyPanel</text></svg>",
    rating: 4.9,
    reviews: 76,
    available: true,
    featured: true,
    description: "Painel LED ARRI com controle de cor completo",
  },
  {
    id: "16",
    name: "Aputure 600D Pro",
    category: "Iluminação",
    pricePerDay: 180,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><circle cx='200' cy='150' r='60' fill='%23555'/><circle cx='200' cy='150' r='40' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='14'>Aputure 600D</text></svg>",
    rating: 4.7,
    reviews: 112,
    available: true,
    description: "LED COB de alta potência com controle wireless",
  },
  {
    id: "17",
    name: "Sound Devices MixPre-6 II",
    category: "Áudio",
    pricePerDay: 150,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='100' y='120' width='200' height='60' rx='5' fill='%23555'/><circle cx='150' cy='150' r='8' fill='%23FFD700'/><circle cx='200' cy='150' r='8' fill='%23FFD700'/><circle cx='250' cy='150' r='8' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='12'>MixPre-6 II</text></svg>",
    rating: 4.8,
    reviews: 134,
    available: true,
    description: "Mixer/gravador de áudio profissional com 6 canais",
  },
  {
    id: "18",
    name: "Rode PodMic USB",
    category: "Áudio",
    pricePerDay: 45,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='190' y='80' width='20' height='140' fill='%23555'/><circle cx='200' cy='90' r='15' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='14'>Rode PodMic</text></svg>",
    rating: 4.6,
    reviews: 89,
    available: true,
    description: "Microfone dinâmico USB para broadcast e podcast",
  },
  {
    id: "19",
    name: "Manfrotto 1004BAC",
    category: "Suportes",
    pricePerDay: 35,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><line x1='200' y1='80' x2='200' y2='220' stroke='%23555' stroke-width='8'/><line x1='160' y1='200' x2='240' y2='200' stroke='%23555' stroke-width='6'/><line x1='170' y1='210' x2='230' y2='210' stroke='%23555' stroke-width='6'/><circle cx='200' cy='80' r='10' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='12'>Manfrotto</text></svg>",
    rating: 4.5,
    reviews: 156,
    available: true,
    description: "Tripé Master Stand de alumínio para iluminação",
  },
  {
    id: "20",
    name: "Sachtler FSB 8",
    category: "Suportes",
    pricePerDay: 120,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='150' y='120' width='100' height='60' rx='10' fill='%23555'/><circle cx='200' cy='150' r='20' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='14'>Sachtler FSB8</text></svg>",
    rating: 4.9,
    reviews: 67,
    available: true,
    description: "Cabeça fluid para tripé com carga até 12kg",
  },
];

async function fetchProductsFromApi(): Promise<Product[]> {
  try {
    const res = await fetch('/api/public/products');
    const json = await res.json();
    if (!json?.success) return [];
    const fromApi: Product[] = json.data.map((p: any, idx: number) => ({
      id: p.id ?? String(idx + 1),
      name: p.name,
      category: p.category ?? 'REFLETORES',
      pricePerDay: p.dailyPrice ?? 0,
      image: (p.images?.[0]) ?? '/placeholder.svg',
      rating: 4.8,
      reviews: 20,
      available: p.available ?? true,
      featured: p.featured ?? false,
      description: p.description ?? '',
    }));
    return fromApi.length ? fromApi : [];
  } catch {
    return [];
  }
}

const categories = ["Todas", "Câmeras", "Lentes", "Monitores", "Eletrônicos", "Iluminação", "Áudio", "Suportes"];

const categoryIcons = {
  Câmeras: Camera,
  Lentes: Aperture,
  Monitores: Monitor,
  Eletrônicos: Zap,
  Iluminação: Lightbulb,
  Áudio: Mic,
  Suportes: Camera,
};

export default function Equipamentos() {
  const { categoria, subcategoria } = useParams();
  const { dispatch } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    categoria || "Todas",
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    subcategoria || "",
  );
  const [sortBy, setSortBy] = useState("name");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof allProducts>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiProducts, setApiProducts] = useState<typeof allProducts>([]);

  // Load from API (public endpoint) and stop showing mock data when available
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/public/products');
        const json = await res.json();
        if (json?.success && Array.isArray(json.data) && json.data.length) {
          const mapped = json.data.map((p: any, idx: number) => ({
            id: p.id ?? String(idx + 1),
            name: p.name,
            category: p.category ?? 'REFLETORES',
            pricePerDay: p.dailyPrice ?? 0,
            image: (p.images?.[0]) ?? '/placeholder.svg',
            rating: 4.8,
            reviews: 20,
            available: p.available ?? true,
            featured: p.featured ?? false,
            description: p.description ?? '',
          }));
          setApiProducts(mapped);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Generate search suggestions
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const matchingProducts = allProducts
        .filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        )
        .slice(0, 6); // Limit to 6 suggestions

      setSuggestions(matchingProducts);
      setShowSuggestions(matchingProducts.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update filters when URL parameters change
  useEffect(() => {
    if (categoria && categoria !== selectedCategory) {
      setSelectedCategory(categoria);
    }
    if (subcategoria !== selectedSubcategory) {
      setSelectedSubcategory(subcategoria || "");
    }
  }, [categoria, subcategoria]);

  const filteredProducts = useMemo(() => {
    let filtered = apiProducts ?? [] as Product[];

    // Filter by category
    if (selectedCategory !== "Todas") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by availability
    if (showAvailableOnly) {
      filtered = filtered.filter((product) => product.available);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.pricePerDay - b.pricePerDay;
        case "price-high":
          return b.pricePerDay - a.pricePerDay;
        case "rating":
          return b.rating - a.rating;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [selectedCategory, searchTerm, sortBy, showAvailableOnly]);

  const handleSuggestionClick = (suggestion: Product) => {
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    // Optionally navigate to the product page
    // or just let the search filter work
  };

  const handleSearchFocus = () => {
    if (searchTerm.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleAddToCart = useCallback((product: Product) => {
    if (!product.available) return;

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        category: product.category,
        pricePerDay: product.pricePerDay,
        image: product.image,
        days: 1,
      },
    });

    console.log(`${product.name} adicionado ao carrinho! - R$ ${product.pricePerDay}/dia`);
  }, [dispatch]);

  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-cinema-dark pt-20 pb-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinema-yellow mx-auto mb-4"></div>
            <p className="text-white text-lg">Carregando equipamentos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-cinema-dark pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              <span className="gradient-text" data-edit-id="equipamentos.title">Catálogo de Equipamentos</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto" data-edit-id="equipamentos.description">
              Explore nosso catálogo completo de equipamentos profissionais para
              cinema e fotografia. Equipamentos de alta qualidade para seus
              projetos criativos.
            </p>
            <div className="w-24 h-1 bg-cinema-yellow mx-auto mt-6"></div>
          </div>

          {/* Filters */}
          <div className="mb-8 bg-cinema-gray/20 backdrop-blur-sm rounded-2xl p-6 border border-cinema-yellow/10">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md search-container">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <Input
                  type="text"
                  placeholder="Buscar equipamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={handleSearchFocus}
                  className="pl-10 bg-cinema-gray border-cinema-gray-light text-white placeholder-gray-400"
                  data-edit-id="equipamentos.search-placeholder"
                />

                {/* Autocomplete Suggestions */}
                {showSuggestions && (
                  <div className="absolute top-full mt-1 w-full bg-cinema-gray border border-cinema-gray-light rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-cinema-yellow/20 transition-colors border-b border-cinema-gray-light last:border-b-0 flex items-center space-x-3"
                      >
                        <img
                          src={suggestion.image}
                          alt={suggestion.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">
                            {suggestion.name}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {suggestion.category} • R$ {suggestion.pricePerDay}
                            /dia
                          </div>
                          <div className="text-gray-500 text-xs mt-1 line-clamp-1">
                            {suggestion.description}
                          </div>
                        </div>
                      </button>
                    ))}

                    {/* Show all results link */}
                    <div className="p-3 border-t border-cinema-gray-light">
                      <button
                        onClick={() => setShowSuggestions(false)}
                        className="w-full text-center text-cinema-yellow hover:text-white transition-colors text-sm"
                      >
                        Ver todos os {filteredProducts.length} resultados para "
                        {searchTerm}"
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px] bg-cinema-gray border-cinema-gray-light text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoria" data-edit-id="equipamentos.category-placeholder" />
                </SelectTrigger>
                <SelectContent className="bg-cinema-gray border-cinema-gray-light">
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="text-white hover:bg-cinema-yellow/20"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-cinema-gray border-cinema-gray-light text-white">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="bg-cinema-gray border-cinema-gray-light">
                  <SelectItem
                    value="name"
                    className="text-white hover:bg-cinema-yellow/20"
                  >
                    Nome
                  </SelectItem>
                  <SelectItem
                    value="price-low"
                    className="text-white hover:bg-cinema-yellow/20"
                  >
                    Menor Preço
                  </SelectItem>
                  <SelectItem
                    value="price-high"
                    className="text-white hover:bg-cinema-yellow/20"
                  >
                    Maior Preço
                  </SelectItem>
                  <SelectItem
                    value="rating"
                    className="text-white hover:bg-cinema-yellow/20"
                  >
                    Avaliação
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Available Only */}
              <label className="flex items-center space-x-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="rounded border-cinema-gray-light"
                />
                <span className="text-sm">Apenas Disponíveis</span>
              </label>
            </div>
          </div>

          {/* Category Quick Filters */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {categories.map((category) => {
              const Icon =
                category !== "Todas"
                  ? categoryIcons[category as keyof typeof categoryIcons]
                  : null;
              return (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  className={`${
                    selectedCategory === category
                      ? "bg-cinema-yellow text-cinema-dark"
                      : "border-cinema-yellow text-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {Icon && <Icon className="w-4 h-4 mr-2" />}
                  {category}
                </Button>
              );
            })}
          </div>

          {/* Results Counter */}
          <div className="text-center mb-8">
            <p className="text-gray-400">
              Mostrando{" "}
              <span className="text-cinema-yellow font-semibold">
                {filteredProducts.length}
              </span>{" "}
              equipamentos
              {selectedCategory !== "Todas" && (
                <span>
                  {" "}
                  na categoria{" "}
                  <span className="text-cinema-yellow font-semibold">
                    {selectedCategory}
                  </span>
                </span>
              )}
              {selectedSubcategory && (
                <span>
                  {" "}
                  -{" "}
                  <span className="text-cinema-yellow font-semibold">
                    {selectedSubcategory}
                  </span>
                </span>
              )}
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="bg-cinema-gray border-cinema-gray-light hover:border-cinema-yellow/50 transition-all duration-300 hover:shadow-lg hover:shadow-cinema-yellow/10 group cursor-pointer"
                data-edit-id={`product-${product.id}-card`}
              >
                <CardContent className="p-0" data-edit-id={`product-${product.id}-content`}>
                  <div className="relative" data-edit-id={`product-${product.id}-image-container`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                      data-edit-id={`product-${product.id}-image`}
                    />

                    {product.featured && (
                      <Badge className="absolute top-3 left-3 bg-cinema-yellow text-cinema-dark" data-edit-id={`product-${product.id}-featured-badge`}>
                        Destaque
                      </Badge>
                    )}

                    {!product.available && (
                      <div className="absolute inset-0 bg-cinema-dark/80 flex items-center justify-center rounded-t-lg">
                        <Badge variant="destructive" data-edit-id={`product-${product.id}-unavailable-badge`}>Indisponível</Badge>
                      </div>
                    )}

                    <div className="absolute top-3 right-3 opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-cinema-yellow/30 backdrop-blur-sm border border-cinema-yellow/50"
                        data-edit-id={`product-${product.id}-eye-button`}
                      >
                        <Eye className="w-4 h-4 text-cinema-yellow" data-edit-id={`product-${product.id}-eye-icon`} />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4" data-edit-id={`product-${product.id}-info`}>
                    <div className="mb-2" data-edit-id={`product-${product.id}-category-container`}>
                      <Badge
                        variant="outline"
                        className="text-cinema-yellow border-cinema-yellow text-xs"
                        data-edit-id={`product-${product.id}-category`}
                      >
                        {product.category}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cinema-yellow transition-colors line-clamp-1" data-edit-id={`product-${product.id}-name`}>
                      {product.name}
                    </h3>

                    <p className="text-gray-400 text-sm mb-3 line-clamp-2" data-edit-id={`product-${product.id}-description`}>
                      {product.description}
                    </p>

                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center" data-edit-id={`product-${product.id}-stars`}>
                        <Star className="w-4 h-4 text-cinema-yellow fill-current" data-edit-id={`product-${product.id}-star-icon`} />
                        <span className="text-white ml-1 text-sm" data-edit-id={`product-${product.id}-rating`}>
                          {product.rating}
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs" data-edit-id={`product-${product.id}-reviews`}>
                        ({product.reviews} avaliações)
                      </span>
                    </div>

                    <div className="mb-4">
                      <span className="text-xl font-bold text-cinema-yellow" data-edit-id={`product-${product.id}-price`}>
                        R$ {product.pricePerDay}
                      </span>
                      <span className="text-gray-400 text-sm" data-edit-id={`product-${product.id}-price-unit`}>/dia</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0" data-edit-id={`product-${product.id}-footer`}>
                  <div className="flex space-x-2 w-full" data-edit-id={`product-${product.id}-buttons-container`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-cinema-yellow text-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                      disabled={!product.available}
                      onClick={() => window.location.href = `/produto/${product.id}`}
                      data-edit-id={`product-${product.id}-details-button`}
                    >
                      <span data-edit-id={`product-${product.id}-details-text`}>Ver mais</span>
                    </Button>

                    <Button
                      size="sm"
                      className="bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark"
                      disabled={!product.available}
                      onClick={() => handleAddToCart(product)}
                      data-edit-id={`product-${product.id}-add-button`}
                    >
                      <ShoppingCart className="w-4 h-4" data-edit-id={`product-${product.id}-add-icon`} />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-cinema-gray/20 backdrop-blur-sm rounded-2xl p-12 border border-cinema-yellow/10 max-w-md mx-auto">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Nenhum equipamento encontrado
                </h3>
                <p className="text-gray-400 mb-4">
                  Tente ajustar os filtros ou buscar por outros termos.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("Todas");
                    setShowAvailableOnly(false);
                  }}
                  className="bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Editor Components */}
      <EditorOverlay />
      <EditPanel />
    </Layout>
  );
}
