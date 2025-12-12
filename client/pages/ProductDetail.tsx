import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  ShoppingCart, 
  ArrowLeft, 
  Check, 
  Loader2, 
  Package,
  Tag,
  Ruler,
  Weight,
  Zap,
  Info,
  Camera,
  Settings,
  Box,
  Warehouse,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Shield
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import Layout from "@/components/Layout";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand?: string;
  model?: string;
  dailyPrice: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  images: string[];
  internalImage?: string;
  quantity: number;
  featured: boolean;
  tags?: string[];
  sku?: string;
  serialNumber?: string;
  specifications?: Record<string, any>;
  warehouse?: string;
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/public/products');
        const data = await response.json();
        
        if (data.success) {
          const foundProduct = data.data.find((p: any) => p.id === id);
          if (foundProduct) {
            setProduct(foundProduct);
          } else {
            setError('Produto não encontrado');
          }
        } else {
          setError('Erro ao carregar produto');
        }
      } catch (err) {
        setError('Erro ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const mainImage = product.images?.[0] || product.internalImage || '/placeholder.svg';
    
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        category: product.category,
        pricePerDay: product.dailyPrice,
        image: mainImage,
        days: 1,
      },
    });
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado!');
    }
  };

  const nextImage = () => {
    if (product && allImages.length > 1) {
      setSelectedImage((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = () => {
    if (product && allImages.length > 1) {
      setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-cinema-dark flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-cinema-yellow mx-auto mb-4" />
            <p className="text-white">Carregando equipamento...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="min-h-screen bg-cinema-dark flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h1 className="text-2xl text-white mb-4">{error || 'Equipamento não encontrado'}</h1>
            <Link to="/equipamentos" className="text-cinema-yellow hover:text-yellow-300">
              ← Voltar aos equipamentos
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const allImages = product.images?.length > 0 ? product.images : (product.internalImage ? [product.internalImage] : ['/placeholder.svg']);
  const mainImage = allImages[selectedImage] || allImages[0];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-cinema-dark to-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-cinema-yellow">Início</Link>
            <span>/</span>
            <Link to="/equipamentos" className="hover:text-cinema-yellow">Equipamentos</Link>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </div>

          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-cinema-yellow hover:text-yellow-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images Section */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative group">
                <div className="aspect-square bg-gray-800 rounded-2xl overflow-hidden">
                  <img 
                    src={mainImage} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.featured && (
                    <Badge className="bg-cinema-yellow text-cinema-dark font-semibold">
                      ⭐ Destaque
                    </Badge>
                  )}
                  {product.quantity > 0 ? (
                    <Badge className="bg-green-500 text-white">
                      Disponível
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500 text-white">
                      Indisponível
                    </Badge>
                  )}
                </div>

                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button 
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isFavorite ? 'bg-red-500 text-white' : 'bg-black/50 hover:bg-black/70 text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={handleShare}
                    className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, i) => (
                    <button 
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === i ? 'border-cinema-yellow ring-2 ring-cinema-yellow/50' : 'border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="space-y-6">
              {/* Category & Brand */}
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-cinema-yellow text-cinema-yellow">
                  {product.category}
                </Badge>
                {product.brand && (
                  <Badge variant="outline" className="border-gray-500 text-gray-300">
                    {product.brand}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold">{product.name}</h1>

              {/* SKU & Model */}
              {(product.sku || product.model) && (
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  {product.sku && <span>SKU: {product.sku}</span>}
                  {product.model && <span>Modelo: {product.model}</span>}
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < 4 ? "text-yellow-400 fill-current" : "text-gray-500"}`}
                    />
                  ))}
                </div>
                <span className="text-gray-400">(Avaliações dos clientes)</span>
              </div>

              {/* Description */}
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-lg leading-relaxed">
                  {product.description || 'Equipamento profissional de alta qualidade para produções audiovisuais.'}
                </p>
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Estoque</p>
                      <p className="font-semibold text-white">{product.quantity} unidade(s)</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Warehouse className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Localização</p>
                      <p className="font-semibold text-white">{product.warehouse || 'Principal'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {product.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Price Card */}
              <Card className="bg-gradient-to-r from-cinema-yellow/10 to-yellow-500/5 border-cinema-yellow/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Valores de Locação</h3>
                    <DollarSign className="w-5 h-5 text-cinema-yellow" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-black/20 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Diária</p>
                      <p className="text-2xl font-bold text-cinema-yellow">
                        R$ {product.dailyPrice?.toFixed(0)}
                      </p>
                    </div>
                    {product.weeklyPrice && product.weeklyPrice > 0 && (
                      <div className="text-center p-3 bg-black/20 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Semanal</p>
                        <p className="text-2xl font-bold text-white">
                          R$ {product.weeklyPrice?.toFixed(0)}
                        </p>
                      </div>
                    )}
                    {product.monthlyPrice && product.monthlyPrice > 0 && (
                      <div className="text-center p-3 bg-black/20 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Mensal</p>
                        <p className="text-2xl font-bold text-white">
                          R$ {product.monthlyPrice?.toFixed(0)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 h-14 text-lg bg-cinema-yellow text-cinema-dark hover:bg-yellow-400 font-semibold"
                  disabled={product.quantity <= 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Adicionar ao Carrinho
                </Button>
                <Button 
                  onClick={() => {
                    handleAddToCart();
                    navigate('/carrinho');
                  }}
                  variant="outline"
                  className="flex-1 h-14 text-lg border-cinema-yellow text-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark font-semibold"
                  disabled={product.quantity <= 0}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Alugar Agora
                </Button>
              </div>
            </div>
          </div>

          {/* Detailed Information Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Specifications */}
            <Card className="lg:col-span-2 bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="w-5 h-5 text-cinema-yellow" />
                  Especificações Técnicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                        <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-white font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-gray-400">Categoria</span>
                      <span className="text-white font-medium">{product.category}</span>
                    </div>
                    {product.brand && (
                      <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                        <span className="text-gray-400">Marca</span>
                        <span className="text-white font-medium">{product.brand}</span>
                      </div>
                    )}
                    {product.model && (
                      <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                        <span className="text-gray-400">Modelo</span>
                        <span className="text-white font-medium">{product.model}</span>
                      </div>
                    )}
                    {product.sku && (
                      <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                        <span className="text-gray-400">SKU</span>
                        <span className="text-white font-medium">{product.sku}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-gray-400">Condição</span>
                      <span className="text-white font-medium">Excelente</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-gray-400">Garantia</span>
                      <span className="text-white font-medium">Incluída na locação</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* What's Included */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <Box className="w-5 h-5 text-cinema-yellow" />
                    O que está incluído
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    'Equipamento principal',
                    'Case de transporte',
                    'Cabos necessários',
                    'Manual de uso',
                    'Suporte técnico'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Guarantee */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <Shield className="w-5 h-5 text-cinema-yellow" />
                    Garantias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-1" />
                    <span className="text-gray-300">Equipamento revisado antes de cada locação</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-1" />
                    <span className="text-gray-300">Suporte técnico durante a locação</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-1" />
                    <span className="text-gray-300">Substituição em caso de defeito</span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card className="bg-gradient-to-br from-cinema-yellow/20 to-yellow-500/10 border-cinema-yellow/30">
                <CardContent className="p-6 text-center">
                  <Info className="w-8 h-8 text-cinema-yellow mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Dúvidas sobre este equipamento?</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Nossa equipe está pronta para ajudar você a escolher o equipamento ideal.
                  </p>
                  <Button variant="outline" className="border-cinema-yellow text-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark">
                    Falar com Especialista
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Full Description */}
          <Card className="mt-8 bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Info className="w-5 h-5 text-cinema-yellow" />
                Descrição Completa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  {product.description || `O ${product.name} é um equipamento profissional de alta qualidade, ideal para produções audiovisuais que exigem excelência técnica e confiabilidade.`}
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  Este equipamento passa por rigoroso processo de manutenção e revisão antes de cada locação, garantindo seu perfeito funcionamento durante todo o período de uso. Nossa equipe técnica está disponível para orientação e suporte durante a locação.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  A locação inclui case de transporte adequado, cabos necessários para operação básica e manual de instruções. Acessórios adicionais podem ser locados separadamente conforme a necessidade do projeto.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
