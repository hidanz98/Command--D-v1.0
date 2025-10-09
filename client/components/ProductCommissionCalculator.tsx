import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Calculator,
  Building,
  Info,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface ProductCommissionProps {
  productId: string;
  productName: string;
  dailyPrice: number;
  ownerCompany: {
    id: string;
    name: string;
  };
  rentalDays: number;
  onAddToCart?: (productId: string, commission: CommissionBreakdown) => void;
}

interface CommissionBreakdown {
  totalAmount: number;
  ourCommission: number;
  ourAmount: number;
  partnerCommission: number;
  partnerAmount: number;
  isCommissionApplied: boolean;
}

const ProductCommissionCalculator: React.FC<ProductCommissionProps> = ({
  productId,
  productName,
  dailyPrice,
  ownerCompany,
  rentalDays,
  onAddToCart,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Simulação das regras de comissão (normalmente viria do backend)
  const getCommissionRule = (companyId: string, productName: string) => {
    // Regras baseadas na empresa e tipo de produto
    const rules = {
      "bils-cinema": {
        cameras: { our: 25, partner: 75, minimum: 100 },
        lenses: { our: 30, partner: 70, minimum: 50 },
        default: { our: 25, partner: 75, minimum: 100 },
      },
      "provideo": {
        drones: { our: 20, partner: 80, minimum: 200 },
        default: { our: 20, partner: 80, minimum: 150 },
      },
      "cinemax": {
        lighting: { our: 35, partner: 65, minimum: 75 },
        default: { our: 30, partner: 70, minimum: 100 },
      },
    };

    const companyRules = rules[companyId as keyof typeof rules] || rules["bils-cinema"];
    
    // Determinar categoria baseada no nome do produto
    let category = "default";
    if (productName.toLowerCase().includes("câmera")) category = "cameras";
    else if (productName.toLowerCase().includes("lente")) category = "lenses";
    else if (productName.toLowerCase().includes("drone")) category = "drones";
    else if (productName.toLowerCase().includes("iluminação") || productName.toLowerCase().includes("kit")) category = "lighting";

    return companyRules[category as keyof typeof companyRules] || companyRules.default;
  };

  const calculateCommission = (): CommissionBreakdown => {
    const totalAmount = dailyPrice * rentalDays;
    const rule = getCommissionRule(ownerCompany.id, productName);

    // Verificar se o valor mínimo é atingido
    if (totalAmount < rule.minimum) {
      return {
        totalAmount,
        ourCommission: 0,
        ourAmount: 0,
        partnerCommission: 100,
        partnerAmount: totalAmount,
        isCommissionApplied: false,
      };
    }

    const ourAmount = (totalAmount * rule.our) / 100;
    const partnerAmount = (totalAmount * rule.partner) / 100;

    return {
      totalAmount,
      ourCommission: rule.our,
      ourAmount,
      partnerCommission: rule.partner,
      partnerAmount,
      isCommissionApplied: true,
    };
  };

  const commission = calculateCommission();

  return (
    <div className="space-y-3">
      {/* Resumo Rápido */}
      <div className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded-lg">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-cinema-yellow" />
          <span className="text-white text-sm font-medium">
            Total: R$ {commission.totalAmount.toFixed(2)}
          </span>
          {commission.isCommissionApplied && (
            <Badge className="bg-green-600 text-white text-xs">
              Comissão: {commission.ourCommission}%
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="border-cinema-gray-light text-white hover:bg-cinema-gray-light"
        >
          <Calculator className="w-3 h-3 mr-1" />
          {showBreakdown ? "Ocultar" : "Detalhes"}
        </Button>
      </div>

      {/* Breakdown Detalhado */}
      {showBreakdown && (
        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center">
              <Building className="w-4 h-4 mr-2 text-cinema-yellow" />
              Breakdown Financeiro - {ownerCompany.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cálculo Base */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-cinema-dark-lighter rounded">
                <p className="text-gray-400 text-xs">Preço Diário</p>
                <p className="text-white font-semibold">R$ {dailyPrice.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-cinema-dark-lighter rounded">
                <p className="text-gray-400 text-xs">Dias</p>
                <p className="text-white font-semibold">{rentalDays}</p>
              </div>
              <div className="p-2 bg-cinema-dark-lighter rounded">
                <p className="text-gray-400 text-xs">Total</p>
                <p className="text-cinema-yellow font-bold">R$ {commission.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            {/* Divisão Financeira */}
            {commission.isCommissionApplied ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-600/20 border border-green-600/30 rounded">
                    <div className="text-center">
                      <p className="text-green-400 text-xs font-medium">NOSSA COMISSÃO</p>
                      <p className="text-green-400 text-lg font-bold">{commission.ourCommission}%</p>
                      <p className="text-white font-semibold">R$ {commission.ourAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-600/20 border border-blue-600/30 rounded">
                    <div className="text-center">
                      <p className="text-blue-400 text-xs font-medium">REPASSE PARCEIRO</p>
                      <p className="text-blue-400 text-lg font-bold">{commission.partnerCommission}%</p>
                      <p className="text-white font-semibold">R$ {commission.partnerAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center p-2 bg-cinema-yellow/10 border border-cinema-yellow/30 rounded">
                  <TrendingUp className="w-4 h-4 mr-2 text-cinema-yellow" />
                  <span className="text-cinema-yellow text-xs font-medium">
                    Margem de lucro aplicada com sucesso
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-yellow-600/20 border border-yellow-600/30 rounded text-center">
                <Info className="w-5 h-5 mx-auto mb-2 text-yellow-400" />
                <p className="text-yellow-400 text-sm font-medium">
                  Valor abaixo do mínimo para comissão
                </p>
                <p className="text-gray-300 text-xs">
                  Valor mínimo: R$ {getCommissionRule(ownerCompany.id, productName).minimum.toFixed(2)}
                </p>
                <p className="text-white text-xs mt-1">
                  100% será repassado para {ownerCompany.name}
                </p>
              </div>
            )}

            {/* Informações Adicionais */}
            <div className="pt-3 border-t border-cinema-gray-light">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Empresa Proprietária:</span>
                <span className="text-white">{ownerCompany.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-400">Status da Comissão:</span>
                <Badge className={commission.isCommissionApplied ? "bg-green-600" : "bg-gray-600"}>
                  {commission.isCommissionApplied ? "Aplicada" : "Não Aplicada"}
                </Badge>
              </div>
            </div>

            {/* Botão de Ação */}
            {onAddToCart && (
              <Button
                className="w-full bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                onClick={() => onAddToCart(productId, commission)}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Adicionar ao Carrinho
                {commission.isCommissionApplied && (
                  <span className="ml-2 text-xs">
                    (Lucro: R$ {commission.ourAmount.toFixed(2)})
                  </span>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductCommissionCalculator;
