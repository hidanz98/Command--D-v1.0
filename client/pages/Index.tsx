import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Headphones, Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useDeviceDetection, getResponsiveSpacing } from "@/hooks/use-device-detection";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  dailyPrice: number;
  quantity: number;
  images: string[];
  tags: string[];
  available: boolean;
  featured: boolean;
  description: string;
}

export function Index() {
  const device = useDeviceDetection();
  const spacing = getResponsiveSpacing(device.deviceType);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/public/products');
        const data = await response.json();
        
        if (data.success) {
          // Filter only featured products and limit to 4
          const featured = data.data
            .filter((p: any) => p.featured)
            .slice(0, device.isMobile ? 2 : device.isTablet ? 3 : 4);
          
          setFeaturedProducts(featured);
        }
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        toast.error('Erro ao carregar produtos em destaque');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [device.isMobile, device.isTablet]);

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className={`${device.isMobile ? 'py-12' : 'py-16'} bg-cinema-dark-lighter`}>
        <div className={`container mx-auto ${spacing}`}>
          <div className={`grid ${device.isMobile ? 'grid-cols-1 gap-4' : device.isTablet ? 'grid-cols-2 gap-6' : 'grid-cols-2 gap-8'} ${device.isDesktop ? 'max-w-4xl' : 'max-w-2xl'} mx-auto`}>
            <Card className={`bg-cinema-gray border-cinema-gray-light text-center ${device.isMobile ? 'p-4' : 'p-6'}`}>
              <CardContent className="p-0">
                <div className={`${device.isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-cinema-yellow/20 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <Shield className={`${device.isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-cinema-yellow`} />
                </div>
                <h3 className={`text-white font-semibold mb-2 ${device.isMobile ? 'text-sm' : 'text-base'}`}>
                  Equipamentos Testados
                </h3>
                <p className={`text-gray-400 ${device.isMobile ? 'text-xs' : 'text-sm'}`}>
                  {device.isMobile
                    ? "Equipamentos testados e certificados"
                    : "Todos os equipamentos passam por rigorosos testes de qualidade"
                  }
                </p>
              </CardContent>
            </Card>

            <Card className={`bg-cinema-gray border-cinema-gray-light text-center ${device.isMobile ? 'p-4' : 'p-6'}`}>
              <CardContent className="p-0">
                <div className={`${device.isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-cinema-yellow/20 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <Headphones className={`${device.isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-cinema-yellow`} />
                </div>
                <h3 className={`text-white font-semibold mb-2 ${device.isMobile ? 'text-sm' : 'text-base'}`}>
                  Suporte Online
                </h3>
                <p className={`text-gray-400 ${device.isMobile ? 'text-xs' : 'text-sm'}`}>
                  {device.isMobile
                    ? "Suporte técnico especializado 24/7"
                    : "Equipe técnica especializada disponível sempre que precisar"
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={`${device.isMobile ? 'py-12' : 'py-16'} bg-cinema-dark`}>
        <div className={`container mx-auto ${spacing}`}>
          <div className={`text-center ${device.isMobile ? 'mb-8' : 'mb-12'}`}>
            <h2 className={`${device.isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold text-white mb-4`}>
              Equipamentos em Destaque
            </h2>
            <p className={`text-gray-400 ${device.isMobile ? 'text-sm max-w-sm' : 'max-w-2xl'} mx-auto`}>
              {device.isMobile
                ? "Os melhores equipamentos disponíveis"
                : "Equipamentos profissionais de alta qualidade para seus projetos de cinema e fotografia"
              }
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Carregando produtos...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Nenhum produto em destaque no momento.</p>
            </div>
          ) : (
            <div className={`grid ${
              device.isMobile ? 'grid-cols-1 gap-4' :
              device.isTablet ? 'grid-cols-2 gap-6' :
              'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
            }`}>
              {featuredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="bg-cinema-gray border-cinema-gray-light hover:border-cinema-yellow/50 transition-all duration-300 hover:shadow-lg hover:shadow-cinema-yellow/10 group"
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-lg bg-cinema-dark"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Se a imagem falhar, usar placeholder
                          if (!target.src.includes('placeholder')) {
                            target.src = '/placeholder.svg';
                          }
                        }}
                        loading="lazy"
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
                    </div>

                    <div className="p-4">
                      <div className="mb-2">
                        <Badge
                          variant="outline"
                          className="text-cinema-yellow border-cinema-yellow text-xs"
                        >
                          {product.category}
                        </Badge>
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cinema-yellow transition-colors line-clamp-1">
                        {product.name}
                      </h3>

                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="mb-4">
                        <span className="text-xl font-bold text-cinema-yellow">
                          R$ {product.dailyPrice}
                        </span>
                        <span className="text-gray-400 text-sm">/dia</span>
                      </div>

                      <Link to={`/produto/${product.id}`} className="w-full block">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-cinema-yellow text-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                          disabled={!product.available}
                        >
                          Ver mais
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

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

      {/* Categories Section */}
      <section className={`${device.isMobile ? 'py-12' : 'py-16'} bg-cinema-dark-lighter`}>
        <div className={`container mx-auto ${spacing}`}>
          <div className={`text-center ${device.isMobile ? 'mb-8' : 'mb-12'}`}>
            <h2 className={`${device.isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold text-white mb-4`}>
              Explore por Categoria
            </h2>
            <p className={`text-gray-400 ${device.isMobile ? 'text-sm max-w-sm' : 'max-w-2xl'} mx-auto`}>
              {device.isMobile
                ? "Encontre o equipamento ideal"
                : "Encontre exatamente o que precisa para seu projeto"
              }
            </p>
          </div>

          <div className={`grid ${
            device.isMobile ? 'grid-cols-2 gap-3' :
            device.isTablet ? 'grid-cols-3 gap-4' :
            'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'
          }`}>
            {[
              { name: "Câmeras", icon: "📹", path: "/equipamentos", count: "120+" },
              { name: "Lentes", icon: "🔍", path: "/equipamentos", count: "200+" },
              { name: "Monitores", icon: "📺", path: "/equipamentos", count: "80+" },
              { name: "Eletrônicos", icon: "⚡", path: "/equipamentos", count: "150+" },
              { name: "Acessórios", icon: "🎛️", path: "/equipamentos", count: "300+" },
            ].slice(0, device.isMobile ? 4 : 5).map((category) => (
              <Link key={category.name} to={category.path}>
                <Card
                  className={`bg-cinema-gray border-cinema-gray-light hover:border-cinema-yellow/50 transition-all duration-300 ${
                    device.touchSupport ? '' : 'hover:shadow-lg hover:shadow-cinema-yellow/10 hover:scale-105'
                  } cursor-pointer group touch-target`}
                >
                  <CardContent className={`${device.isMobile ? 'p-3' : 'p-6'} text-center flex flex-col items-center`}>
                    <div className={`${device.isMobile ? 'w-12 h-12' : 'w-16 h-16'} mx-auto mb-4 flex items-center justify-center`}>
                      <span className={`${device.isMobile ? 'text-2xl' : 'text-4xl'} leading-none`}>
                        {category.icon}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className={`text-white font-semibold ${device.isMobile ? 'text-xs' : 'text-base'} leading-tight group-hover:text-cinema-yellow transition-colors`}>
                        {category.name}
                      </h3>
                      <p className={`text-gray-400 ${device.isMobile ? 'text-xs' : 'text-sm'} leading-tight`}>
                        {category.count} itens
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {device.isMobile && (
            <div className="text-center mt-6">
              <Link to="/equipamentos">
                <Button variant="outline" className="text-cinema-yellow border-cinema-yellow">
                  Ver Todas as Categorias
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={`${device.isMobile ? 'py-12' : 'py-16'} bg-gradient-to-r from-cinema-dark via-cinema-gray to-cinema-dark`}>
        <div className={`container mx-auto ${spacing} text-center`}>
          <h2 className={`${device.isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold text-white mb-4`}>
            {device.isMobile
              ? "Pronto para seu projeto?"
              : "Pronto para começar seu projeto?"
            }
          </h2>
          <p className={`text-gray-400 ${device.isMobile ? 'text-sm mb-6 max-w-sm' : 'text-lg mb-8 max-w-2xl'} mx-auto`}>
            {device.isMobile
              ? "Entre em contato e transforme sua visão em realidade"
              : "Entre em contato conosco e descubra como podemos transformar sua visão em realidade"
            }
          </p>
          <div className={`flex ${device.isMobile ? 'flex-col gap-3' : 'flex-col sm:flex-row gap-4'} justify-center ${device.isMobile ? 'max-w-xs mx-auto' : ''}`}>
            <Link to="/login" className={device.isMobile ? 'w-full' : ''}>
              <Button
                size={device.isMobile ? "default" : "lg"}
                className={`bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark font-semibold ${device.isMobile ? 'px-6 w-full' : 'px-8'}`}
              >
                {device.isMobile ? "Solicitar Orçamento" : "Solicitar Orçamento"}
              </Button>
            </Link>
            <Button
              variant="outline"
              size={device.isMobile ? "default" : "lg"}
              className={`border-cinema-yellow text-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark ${device.isMobile ? 'px-6 w-full' : 'px-8'}`}
              onClick={() => {
                const whatsappNumber = "5531999908485";
                const message = encodeURIComponent("Gostaria de falar com um especialista sobre locação de equipamentos");
                const url = `https://wa.me/${whatsappNumber}?text=${message}`;
                window.open(url, "_blank");
              }}
            >
              {device.isMobile ? "Falar no WhatsApp" : "Falar com Especialista"}
            </Button>
          </div>

          {device.isMobile && (
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-cinema-yellow font-bold text-lg">500+</div>
                <div className="text-gray-400 text-xs">Equipamentos</div>
              </div>
              <div>
                <div className="text-cinema-yellow font-bold text-lg">15</div>
                <div className="text-gray-400 text-xs">Anos no mercado</div>
              </div>
              <div>
                <div className="text-cinema-yellow font-bold text-lg">5000+</div>
                <div className="text-gray-400 text-xs">Jobs realizados</div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
