import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Eye, Camera, Monitor, Zap, Aperture, ArrowUp, Edit3, Lightbulb, Mic, User, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useInlineEditor, EditorOverlay, EditPanel } from "@/components/InlineEditor";
import { toast } from "sonner";

interface FeaturedProduct {
  id: string;
  name: string;
  category: string;
  pricePerDay: number;
  image: string;
  rating: number;
  reviews: number;
  available: boolean;
  featured: boolean;
  description: string;
}

// Categories data
const categories = [
  { name: "Câmeras", icon: Camera, count: "120+ itens" },
  { name: "Lentes", icon: Aperture, count: "200+ itens" },
  { name: "Monitores", icon: Monitor, count: "80+ itens" },
  { name: "Eletrônicos", icon: Zap, count: "150+ itens" },
  { name: "Iluminação", icon: Lightbulb, count: "90+ itens" },
  { name: "Áudio", icon: Mic, count: "60+ itens" },
  { name: "Suportes", icon: ShoppingCart, count: "180+ itens" },
];

export function CabecaEfeito() {
  const [showNotification, setShowNotification] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const { state: editorState, toggleEditor } = useInlineEditor();
  const navigate = useNavigate();

  // Buscar produtos em destaque da API
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/public/products');
        const result = await response.json();
        
        if (result.success) {
          // Filtrar apenas produtos em destaque e mapear para o formato esperado
          const featured = result.data
            .filter((p: any) => p.featured)
            .slice(0, 4) // Limitar a 4 produtos
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              category: p.category || 'REFLETORES',
              pricePerDay: p.dailyPrice || 0,
              image: p.images?.[0] || '/placeholder.svg',
              rating: 4.5,
              reviews: Math.floor(Math.random() * 50) + 10,
              available: p.available !== false,
              featured: true,
              description: p.description || ''
            }));
          
          setFeaturedProducts(featured);
        }
      } catch (error) {
        console.error('Erro ao carregar produtos em destaque:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = (product: any) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        category: product.category,
        pricePerDay: product.pricePerDay,
        image: product.image,
        days: 1, // Default to 1 day
      },
    });
    console.log(`${product.name} adicionado ao carrinho!`);
  };

  const handleViewDetails = (product: any) => {
    navigate(`/produto/${product.id}`);
  };



  return (
    <Layout>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background Elements - pointer-events-none para não bloquear cliques */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-orange-400/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-blue-400/20 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-yellow-400/20 rounded-full blur-xl"></div>
          
          {/* Floating particles */}
          <div className="absolute top-32 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute top-48 right-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-64 left-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-80 right-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-1500"></div>
        </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-blue-400 mb-6 leading-tight" data-edit-id="hero.title">
            Cabeça de Efeito
          </h1>
          
          <p className="text-xl text-white max-w-4xl mx-auto mb-12 leading-relaxed" data-edit-id="hero.description">
            Locação de equipamentos profissionais para fotografia, cinema e vídeo. São câmeras cinematográficas, fotográficas, lentes, monitores, estabilizadores de câmera, comando de foco, vídeo link, tripés e muitos outros acessórios.
          </p>

          <div className="text-lg text-blue-200 max-w-2xl mx-auto mb-8" data-edit-id="hero.subtitle">
            Mais de 800+ equipamentos disponíveis • Entrega em 24h • Suporte técnico especializado • Equipamentos de última geração
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/equipamentos" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center transition-all hover:scale-105" data-edit-id="hero.button-products">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-edit-id="hero.button-products-icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span data-edit-id="hero.button-products-text">Ver todos os produtos →</span>
            </Link>
            
            <Link to="/carrinho" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center transition-all hover:scale-105" data-edit-id="hero.button-cart">
              <ShoppingCart className="w-6 h-6 mr-2" data-edit-id="hero.button-cart-icon" />
              <span data-edit-id="hero.button-cart-text">Meu Carrinho</span>
              {state.items.length > 0 && (
                <span className="ml-2 bg-white text-orange-500 px-2 py-1 rounded-full text-sm font-bold">
                  {state.items.length}
                </span>
              )}
            </Link>

          </div>

          {/* Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-gray-600 transition-all hover:scale-105" data-edit-id="stats.equipment">
              <div className="text-4xl font-bold text-blue-400 mb-2" data-edit-id="stats.equipment-number">800+</div>
              <div className="text-white text-base" data-edit-id="stats.equipment-text">Equipamentos Disponíveis</div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-gray-600 transition-all hover:scale-105" data-edit-id="stats.projects">
              <div className="text-4xl font-bold text-orange-400 mb-2" data-edit-id="stats.projects-number">1500+</div>
              <div className="text-white text-base" data-edit-id="stats.projects-text">Projetos Realizados</div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-gray-600 transition-all hover:scale-105" data-edit-id="stats.clients">
              <div className="text-4xl font-bold text-green-400 mb-2" data-edit-id="stats.clients-number">300+</div>
              <div className="text-white text-base" data-edit-id="stats.clients-text">Clientes Ativos</div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-gray-600 transition-all hover:scale-105" data-edit-id="stats.satisfaction">
              <div className="text-4xl font-bold text-yellow-400 mb-2" data-edit-id="stats.satisfaction-number">98%</div>
              <div className="text-white text-base" data-edit-id="stats.satisfaction-text">Satisfação Cliente</div>
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4" data-edit-id="featured.title">Equipamentos em Destaque</h2>
            <p className="text-gray-300 text-lg" data-edit-id="featured.subtitle">
              {loading ? 'Carregando...' : `${featuredProducts.length} equipamentos em destaque`}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-cinema-yellow" />
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">Nenhum produto em destaque no momento.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {featuredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="bg-gray-800 border-gray-700 overflow-hidden group hover:scale-105 transition-transform"
                data-edit-id={`product-${product.id}-card`}
              >
                <div className="relative" data-edit-id={`product-${product.id}-image-container`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover bg-gray-700"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                    data-edit-id={`product-${product.id}-image`}
                  />
                  
                  {product.featured && (
                    <Badge 
                      className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-orange-500 text-white hover:from-blue-500 hover:to-orange-500"
                      data-edit-id={`product-${product.id}-featured-badge`}
                    >
                      Popular
                    </Badge>
                  )}

                  {!product.available && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <Badge variant="destructive" data-edit-id={`product-${product.id}-unavailable-badge`}>Alugado</Badge>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 opacity-100 transition-opacity">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-white/90 hover:bg-white"
                      data-edit-id={`product-${product.id}-eye-button`}
                    >
                      <Eye className="w-4 h-4" data-edit-id={`product-${product.id}-eye-icon`} />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4" data-edit-id={`product-${product.id}-content`}>
                  <div className="mb-2" data-edit-id={`product-${product.id}-category-container`}>
                    <span className="text-xs text-gray-400" data-edit-id={`product-${product.id}-category`}>{product.category}</span>
                  </div>
                  
                  <h3 className="font-semibold text-white mb-2" data-edit-id={`product-${product.id}-name`}>{product.name}</h3>
                  
                  <div className="flex items-center mb-2" data-edit-id={`product-${product.id}-stars`}>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-400"
                          }`}
                          data-edit-id={`product-${product.id}-star-${i}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400 ml-2" data-edit-id={`product-${product.id}-reviews`}>({product.reviews})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${product.available ? "text-green-400" : "text-red-400"}`} data-edit-id={`product-${product.id}-availability`}>
                      {product.available ? "Disponível" : "Alugado"}
                    </span>
                    <span className="text-blue-400 font-semibold" data-edit-id={`product-${product.id}-price`}>R$ {product.pricePerDay}/dia</span>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0" data-edit-id={`product-${product.id}-footer`}>
                  <div className="flex gap-2 w-full" data-edit-id={`product-${product.id}-buttons-container`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      onClick={(e) => {
                        // Only handle click if not in editor mode
                        if (!document.querySelector('.nasa-editor-panel')) {
                          handleViewDetails(product);
                        }
                      }}
                      data-edit-id={`product-${product.id}-details-button`}
                    >
                      <div 
                        className="w-4 h-4 mr-1 cursor-pointer" 
                        data-edit-id={`product-${product.id}-details-icon`}
                      >
                        <Eye className="w-4 h-4 text-current fill-current" />
                      </div>
                      <span data-edit-id={`product-${product.id}-details-text`}>Detalhes</span>
                    </Button>
                    {product.available && (
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600"
                        onClick={(e) => {
                          // Only handle click if not in editor mode
                          if (!document.querySelector('.nasa-editor-panel')) {
                            handleAddToCart(product);
                          }
                        }}
                        data-edit-id={`product-${product.id}-add-button`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" data-edit-id={`product-${product.id}-add-icon`} />
                        <span data-edit-id={`product-${product.id}-add-text`}>Adicionar</span>
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          )}
        </div>

        {/* Categories Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4" data-edit-id="categories.title">Explorar por categoria</h2>
            <p className="text-gray-300 text-lg" data-edit-id="categories.description">Encontre exatamente o que precisa para seu projeto</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Link key={index} to={`/equipamentos?category=${encodeURIComponent(category.name)}`}>
                  <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer group hover:scale-105" data-edit-id={`category-${index}`}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                        <IconComponent className="w-8 h-8 text-blue-400" />
                      </div>
                      <h3 className="text-white font-semibold mb-2" data-edit-id={`category-${index}.name`}>{category.name}</h3>
                      <p className="text-gray-400 text-sm" data-edit-id={`category-${index}.count`}>{category.count}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* How it Works Section */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Como funciona?</h2>
            <p className="text-gray-300 text-lg">Processo simples em 4 passos para alugar seus equipamentos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Explore</h3>
              <p className="text-gray-400">Navegue pelo catálogo e encontre os equipamentos ideais para seu projeto</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Adicione</h3>
              <p className="text-gray-400">Adicione múltiplos equipamentos ao carrinho e monte seu kit completo</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Configure</h3>
              <p className="text-gray-400">Defina datas, quantidades e revise seu pedido no carrinho</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Finalize</h3>
              <p className="text-gray-400">Entre em contato para finalizar e receba em 24h</p>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Monte seu kit perfeito!</h2>
          <p className="text-gray-300 text-lg mb-8">
            Selecione múltiplos equipamentos, compare preços e monte o kit ideal para seu projeto
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/equipamentos"
              className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:scale-105"
            >
              <ShoppingCart className="w-6 h-6 mr-2 inline" />
              Explorar Equipamentos
            </Link>
            <Link
              to="/carrinho"
              className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:scale-105"
            >
              <Eye className="w-6 h-6 mr-2 inline" />
              Ver Meu Carrinho
              {state.items.length > 0 && (
                <span className="ml-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-sm font-bold">
                  {state.items.length}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="text-center pb-16">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao Início
          </Link>
        </div>
      </div>

      {/* Notification - Only for authenticated admins */}
      {false && showNotification && isAuthenticated && isAdmin && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-pink-500 max-w-sm z-50">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-gray-900">Ponto em Falta</span>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-700 mb-3">
              Maria Santos Oliveira não registrou ponto ontem (28/08/2025)
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">20:09</span>
              <Link to="/painel-admin" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center transition-colors">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ver Ponto
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      </div>

      {/* Support Chat - Removido conforme solicitado */}

      {/* Inline Editor */}
      <EditorOverlay />
      <EditPanel />
      </div>
    </Layout>
  );
}
