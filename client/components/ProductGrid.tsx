import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

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
}

// Fallback sample products (real data will come from API)
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Sony FX6 Full Frame",
    category: "Câmeras",
    pricePerDay: 350,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='50' y='100' width='300' height='100' rx='10' fill='%23555'/><circle cx='200' cy='150' r='30' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>Sony FX6</text></svg>",
    rating: 4.9,
    reviews: 124,
    available: true,
    featured: true,
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
  },
  {
    id: "4",
    name: "Zeiss CP.3 85mm T2.1",
    category: "Lentes",
    pricePerDay: 120,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><cylinder x='150' y='120' width='100' height='60' rx='50' fill='%23555'/><circle cx='200' cy='150' r='20' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>Zeiss CP.3</text></svg>",
    rating: 4.9,
    reviews: 156,
    available: true,
  },
  {
    id: "5",
    name: 'Atomos Ninja V 5"',
    category: "Monitores",
    pricePerDay: 80,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='100' y='110' width='200' height='120' rx='5' fill='%23555'/><rect x='110' y='120' width='180' height='100' fill='%23000'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>Atomos Ninja V</text></svg>",
    rating: 4.6,
    reviews: 203,
    available: false,
  },
  {
    id: "6",
    name: "DJI Ronin 4D",
    category: "Eletrônicos",
    pricePerDay: 280,
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='150' y='100' width='100' height='120' rx='5' fill='%23555'/><circle cx='200' cy='160' r='25' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>DJI Ronin 4D</text></svg>",
    rating: 4.8,
    reviews: 92,
    available: true,
    featured: true,
  },
];

interface ProductGridProps {
  title?: string;
  showFeaturedOnly?: boolean;
  maxItems?: number;
}

export default function ProductGrid({
  title = "Equipamentos em Destaque",
  showFeaturedOnly = false,
  maxItems,
}: ProductGridProps) {
  const { dispatch } = useCart();

  const [apiProducts, setApiProducts] = React.useState<Product[] | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/public/products');
        const json = await res.json();
        if (json?.success) {
          const mapped: Product[] = json.data.map((p: any, idx: number) => ({
            id: p.id ?? String(idx + 1),
            name: p.name,
            category: p.category ?? 'REFLETORES',
            pricePerDay: p.dailyPrice ?? 0,
            image: (p.images?.[0]) ?? '/placeholder.svg',
            rating: 4.8,
            reviews: 20,
            available: p.available ?? true,
            featured: p.featured ?? false,
          }));
          setApiProducts(mapped);
        }
      } catch {}
    })();
  }, []);

  let base = apiProducts && apiProducts.length ? apiProducts : [];
  let products = showFeaturedOnly ? base.filter((p) => p.featured) : base;

  if (maxItems) {
    products = products.slice(0, maxItems);
  }

  const handleAddToCart = (product: Product) => {
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

    toast.success(`${product.name} adicionado ao carrinho!`, {
      description: `R$ ${product.pricePerDay}/dia`,
    });
  };

  return (
    <section className="py-16 bg-cinema-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-edit-id="product-grid.title">
            {title}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto" data-edit-id="product-grid.description">
            Equipamentos profissionais de alta qualidade para seus projetos de
            cinema e fotografia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="bg-cinema-gray border-cinema-gray-light hover:border-cinema-yellow/50 transition-all duration-300 hover:shadow-lg hover:shadow-cinema-yellow/10 group"
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />

                  {product.featured && (
                    <Badge className="absolute top-3 left-3 bg-cinema-yellow text-cinema-dark">
                      Destaque
                    </Badge>
                  )}

                  {!product.available && (
                    <div className="absolute inset-0 bg-cinema-dark/80 flex items-center justify-center rounded-t-lg">
                      <Badge variant="destructive">Indisponível</Badge>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-cinema-yellow/20 backdrop-blur-sm"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-2">
                    <Badge
                      variant="outline"
                      className="text-cinema-yellow border-cinema-yellow"
                      data-edit-id={`product-${product.id}.category`}
                    >
                      {product.category}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cinema-yellow transition-colors" data-edit-id={`product-${product.id}.name`}>
                    {product.name}
                  </h3>

                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-cinema-yellow fill-current" />
                      <span className="text-white ml-1">{product.rating}</span>
                    </div>
                    <span className="text-gray-400">
                      ({product.reviews} avaliações)
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-cinema-yellow">
                      R$ {product.pricePerDay}
                    </span>
                    <span className="text-gray-400">/dia</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <div className="flex space-x-2 w-full">
                  <Link to={`/produto/${product.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-cinema-yellow text-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                      disabled={!product.available}
                    >
                      Ver mais
                    </Button>
                  </Link>

                  <Button
                    className="bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark"
                    disabled={!product.available}
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/equipamentos">
            <Button
              size="lg"
              className="bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark font-semibold px-8"
            >
              Ver Todos os Equipamentos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
