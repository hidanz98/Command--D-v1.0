import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, MapPin, Phone, Calendar } from "lucide-react";

interface FastDeliverySectionProps {
  isActive: boolean;
}

export default function FastDeliverySection({
  isActive,
}: FastDeliverySectionProps) {
  if (!isActive) return null;

  return (
    <section className="py-16 bg-gradient-to-r from-cinema-yellow/10 via-cinema-dark to-cinema-yellow/10 border-y border-cinema-yellow/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-cinema-yellow/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <Zap className="w-5 h-5 text-cinema-yellow" />
            <Badge
              variant="outline"
              className="bg-transparent border-cinema-yellow text-cinema-yellow"
            >
              Serviço Express
            </Badge>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span className="gradient-text">Entrega Rápida</span> em BH
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Precisando de equipamentos com urgência? Nosso serviço de entrega
            express garante que você tenha o equipamento em mãos no mesmo dia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-cinema-gray/80 backdrop-blur-sm border-cinema-yellow/30 text-center p-6 hover:border-cinema-yellow transition-all duration-300">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-cinema-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-cinema-yellow" />
              </div>
              <h3 className="text-white font-semibold mb-2">2-4 Horas</h3>
              <p className="text-gray-300 text-sm">
                Entrega expressa na região metropolitana de BH
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cinema-gray/80 backdrop-blur-sm border-cinema-yellow/30 text-center p-6 hover:border-cinema-yellow transition-all duration-300">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-cinema-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-cinema-yellow" />
              </div>
              <h3 className="text-white font-semibold mb-2">Raio de 30km</h3>
              <p className="text-gray-300 text-sm">
                Cobertura completa da Grande BH e região
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cinema-gray/80 backdrop-blur-sm border-cinema-yellow/30 text-center p-6 hover:border-cinema-yellow transition-all duration-300">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-cinema-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-cinema-yellow" />
              </div>
              <h3 className="text-white font-semibold mb-2">Fins de Semana</h3>
              <p className="text-gray-300 text-sm">
                Disponível sábados e domingos com agendamento
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cinema-gray/80 backdrop-blur-sm border-cinema-yellow/30 text-center p-6 hover:border-cinema-yellow transition-all duration-300">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-cinema-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-cinema-yellow" />
              </div>
              <h3 className="text-white font-semibold mb-2">Contato Direto</h3>
              <p className="text-gray-300 text-sm">
                Linha direta para pedidos urgentes
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-cinema-dark-lighter/50 backdrop-blur-sm rounded-2xl p-8 border border-cinema-yellow/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Como funciona a entrega expressa?
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cinema-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cinema-dark font-bold text-sm">
                      1
                    </span>
                  </div>
                  <span>
                    Solicite o equipamento até 14h para entrega no mesmo dia
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cinema-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cinema-dark font-bold text-sm">
                      2
                    </span>
                  </div>
                  <span>Confirmamos disponibilidade e agendamos a entrega</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cinema-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cinema-dark font-bold text-sm">
                      3
                    </span>
                  </div>
                  <span>
                    Entregamos o equipamento testado e pronto para uso
                  </span>
                </li>
              </ul>

              <div className="mt-6 p-4 bg-cinema-yellow/10 rounded-lg border border-cinema-yellow/20">
                <p className="text-cinema-yellow font-medium text-sm mb-1">
                  ⚡ Taxa de entrega expressa
                </p>
                <p className="text-gray-300 text-sm">
                  R$ 50,00 para região metropolitana • R$ 80,00 para Grande BH
                </p>
              </div>
            </div>

            <div className="text-center lg:text-right">
              <div className="inline-block bg-cinema-gray/50 backdrop-blur-sm rounded-xl p-6 border border-cinema-gray-light">
                <div className="text-4xl mb-4">🚚⚡</div>
                <h4 className="text-xl font-bold text-white mb-2">
                  Precisa com urgência?
                </h4>
                <p className="text-gray-300 mb-6">
                  Entre em contato agora e garante seu equipamento hoje mesmo!
                </p>
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark font-semibold"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    (31) 98765-4321
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-cinema-yellow text-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                  >
                    Solicitar Orçamento Express
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
