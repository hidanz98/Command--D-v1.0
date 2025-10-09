import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, ShoppingCart, Calendar, ArrowLeft, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

// Mock product data - in a real app, this would come from an API
const products = [
  {
    id: "1",
    name: "Sony FX6 Full Frame",
    category: "Câmeras",
    pricePerDay: 350,
    image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='50' y='100' width='300' height='100' rx='10' fill='%23555'/><circle cx='200' cy='150' r='30' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>Sony FX6</text></svg>",
    rating: 4.9,
    reviews: 124,
    available: true,
    description: "Câmera cinematográfica full frame de alta qualidade",
    fullDescription: "A Sony FX6 é uma câmera cinematográfica profissional que combina a versatilidade de uma câmera mirrorless com a qualidade de imagem de cinema. Equipada com sensor Full Frame de 10.2MP, oferece gravação 4K com baixo ruído e ampla faixa dinâmica, perfeita para produções cinematográficas de alta qualidade.",
    specifications: {
      sensor: "Full Frame Sensor R CMOS 10.2MP",
      recording: "4K UHD (3840x2160) até 120fps",
      iso: "800-12800 (expandido: 100-409600)",
      stabilization: "Eletrônica ativa com 5 eixos",
      connectivity: "HDMI, USB-C, XLR, Timecode",
      storage: "Dual CFexpress Type A / SD",
      weight: "890g (apenas corpo)"
    },
    
    includedAccessories: [
      "Bateria extra",
      "Cartão CFexpress 128GB", 
      "Manual",
      "Carregador",
      "Cabo HDMI"
    ],
    stock: 3
  },
  {
    id: "2",
    name: "Zeiss CP.3 85mm T2.1",
    category: "Lentes",
    pricePerDay: 120,
    image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='150' y='120' width='100' height='60' rx='5' fill='%23555'/><circle cx='200' cy='150' r='20' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='14'>Zeiss CP.3</text></svg>",
    rating: 4.5,
    reviews: 32,
    available: true,
    description: "Lente cinematográfica de alta qualidade",
    fullDescription: "A Zeiss CP.3 85mm T2.1 é uma lente cinematográfica premium que oferece excelente qualidade óptica e construção robusta. Ideal para retratos e close-ups, proporciona bokeh suave e nitidez excepcional.",
    specifications: {
      focalLength: "85mm",
      aperture: "T2.1 - T22",
      mount: "PL, EF, E, F, MFT",
      weight: "1.2kg",
      filterSize: "95mm",
      coverage: "Full Frame"
    },
    
    includedAccessories: [
      "Capa frontal",
      "Capa traseira",
      "Manual",
      "Certificado de calibração"
    ],
    stock: 2
  },
  {
    id: "3",
    name: "Canon EOS R5C",
    category: "Câmeras",
    pricePerDay: 380,
    image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='50' y='100' width='300' height='100' rx='10' fill='%23555'/><circle cx='200' cy='150' r='30' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='16'>Canon R5C</text></svg>",
    rating: 4.8,
    reviews: 89,
    available: true,
    description: "Câmera mirrorless com gravação 8K para cinema",
    fullDescription: "A Canon EOS R5C combina a versatilidade de uma câmera mirrorless com capacidades de gravação 8K para cinema. Equipada com sensor Full Frame de 45MP, oferece qualidade de imagem excepcional para produções profissionais.",
    specifications: {
      sensor: "Full Frame CMOS 45MP",
      recording: "8K RAW, 4K até 120fps",
      iso: "100-51200 (expandido: 50-102400)",
      stabilization: "IBIS 5 eixos",
      connectivity: "HDMI, USB-C, Wi-Fi, Bluetooth",
      storage: "Dual CFexpress / SD",
      weight: "770g"
    },
    
    includedAccessories: [
      "Bateria LP-E6NH",
      "Carregador",
      "Cabo USB-C",
      "Manual",
      "Capa"
    ],
    stock: 1
  },
  {
    id: "4",
    name: "Atomos Ninja V 5\"",
    category: "Monitores",
    pricePerDay: 85,
    image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23333'/><rect x='100' y='80' width='200' height='140' rx='10' fill='%23555'/><rect x='120' y='100' width='160' height='100' fill='%23FFD700'/><text x='200' y='250' text-anchor='middle' fill='%23FFD700' font-size='14'>Atomos Ninja</text></svg>",
    rating: 4.7,
    reviews: 67,
    available: false,
    description: "Monitor externo para gravação profissional",
    fullDescription: "O Atomos Ninja V é um monitor externo de 5 polegadas que oferece gravação ProRes RAW e monitoramento profissional. Ideal para câmeras que não possuem monitor interno ou para quem precisa de recursos avançados de monitoramento.",
    specifications: {
      screen: "5\" 1920x1080 IPS",
      recording: "ProRes RAW, ProRes 422",
      inputs: "HDMI, SDI",
      storage: "SSD SATA",
      battery: "L-mount (opcional)",
      weight: "400g"
    },
    
    includedAccessories: [
      "Cabo HDMI",
      "Suporte articulado",
      "Manual",
      "Capa protetora"
    ],
    stock: 0
  }
];

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  
  const [pickupDate, setPickupDate] = useState("2025-04-02");
  const [returnDate, setReturnDate] = useState("2025-09-03");
  const [pickupTime, setPickupTime] = useState("09:00");
  const [returnTime, setReturnTime] = useState("18:00");
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Produto não encontrado</h1>
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const calculateDays = () => {
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const totalPrice = product.pricePerDay * calculateDays();

  const handleAddToCart = () => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        category: product.category,
        pricePerDay: product.pricePerDay,
        image: product.image,
        days: calculateDays(),
      },
    });
    console.log(`${product.name} adicionado ao carrinho!`);
  };

  const handleRent = () => {
    console.log(`Iniciando processo de locação de ${product.name}`);
    // In a real app, this would redirect to checkout
  };

  const toggleAccessory = (accessory: string) => {
    setSelectedAccessories(prev => 
      prev.includes(accessory) 
        ? prev.filter(a => a !== accessory)
        : [...prev, accessory]
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="mb-4">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg bg-gray-800"
              />
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <img 
                  key={i}
                  src={product.image} 
                  alt={`${product.name} ${i}`}
                  className="w-20 h-20 object-cover rounded bg-gray-800 border-2 border-gray-600"
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-400"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-300">
                {product.rating} ({product.reviews} avaliações)
              </span>
            </div>

            <div className="text-3xl font-bold text-blue-400 mb-4">
              R$ {product.pricePerDay}/dia
            </div>

            <p className="text-gray-300 mb-6">{product.description}</p>

            {/* Availability */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Disponibilidade</h3>
              <p className="text-green-400">
                {product.stock} unidade(s) disponível(is)
              </p>
              <p className="text-gray-400 text-sm">
                Estoque total: {product.stock} unidade(s)
              </p>
            </div>

            {/* Rental Dates */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="pickup-date" className="text-white">Data de Retirada</Label>
                <Input
                  id="pickup-date"
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="return-date" className="text-white">Data de Devolução</Label>
                <Input
                  id="return-date"
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="pickup-time" className="text-white">Horário de Retirada</Label>
                <Input
                  id="pickup-time"
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="return-time" className="text-white">Horário de Devolução</Label>
                <Input
                  id="return-time"
                  type="time"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Rental Summary */}
            <Card className="bg-gray-800 border-gray-600 mb-6">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Período:</span>
                    <span>{calculateDays()} dia(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preço por dia:</span>
                    <span>R$ {product.pricePerDay}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>R$ {totalPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <Button 
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
              <Button 
                onClick={handleRent}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Alugar
              </Button>
            </div>

            
          </div>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
          {/* Description */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Descrição Completa</h2>
            <p className="text-gray-300 mb-6">{product.fullDescription}</p>

            <h3 className="text-xl font-semibold mb-4">Acessórios Inclusos</h3>
            <div className="space-y-2">
              {product.includedAccessories.map((accessory, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">{accessory}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Especificações Técnicas</h2>
            <div className="space-y-3">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="font-medium capitalize">{key}:</span>
                  <span className="text-gray-300">{value}</span>
                </div>
              ))}
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}
