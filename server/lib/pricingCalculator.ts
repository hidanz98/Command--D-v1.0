/**
 * CALCULADORA DE PREÇOS DE LOCAÇÃO
 * 
 * Calcula o valor da locação baseado no período:
 * - 1-6 dias: preço diário
 * - 7-27 dias: preço semanal (se disponível)
 * - 28+ dias: preço mensal (se disponível)
 */

export interface PricingOptions {
  dailyPrice: number;
  weeklyPrice?: number | null;
  monthlyPrice?: number | null;
}

export interface PricingResult {
  days: number;
  basePrice: number;
  breakdown: string;
  priceType: 'daily' | 'weekly' | 'monthly' | 'mixed';
}

/**
 * Calcula o preço da locação baseado no número de dias
 */
export function calculateRentalPrice(
  dailyPrice: number,
  weeklyPrice: number | null,
  monthlyPrice: number | null,
  days: number
): PricingResult {
  if (days <= 0) {
    return {
      days: 0,
      basePrice: 0,
      breakdown: 'Período inválido',
      priceType: 'daily'
    };
  }

  // Mensal (>= 28 dias)
  if (days >= 28 && monthlyPrice) {
    const months = Math.ceil(days / 30);
    const remainingDays = days % 30;
    
    if (remainingDays > 0) {
      // Misto: meses + dias extras
      const monthsTotal = months * monthlyPrice;
      const daysTotal = remainingDays * dailyPrice;
      
      return {
        days,
        basePrice: monthsTotal + daysTotal,
        breakdown: `${months} mês(es) + ${remainingDays} dia(s)`,
        priceType: 'mixed'
      };
    }
    
    return {
      days,
      basePrice: months * monthlyPrice,
      breakdown: `${months} mês(es)`,
      priceType: 'monthly'
    };
  }
  
  // Semanal (7-27 dias)
  if (days >= 7 && weeklyPrice) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    
    const weeksTotal = weeks * weeklyPrice;
    const daysTotal = remainingDays * dailyPrice;
    
    if (remainingDays > 0) {
      return {
        days,
        basePrice: weeksTotal + daysTotal,
        breakdown: `${weeks} semana(s) + ${remainingDays} dia(s)`,
        priceType: 'mixed'
      };
    }
    
    return {
      days,
      basePrice: weeksTotal,
      breakdown: `${weeks} semana(s)`,
      priceType: 'weekly'
    };
  }
  
  // Diário (1-6 dias ou sem preço semanal/mensal)
  return {
    days,
    basePrice: days * dailyPrice,
    breakdown: `${days} dia(s)`,
    priceType: 'daily'
  };
}

/**
 * Calcula o número de dias entre duas datas
 */
export function calculateDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(1, diffDays); // Mínimo 1 dia
}

/**
 * Calcula multa por atraso
 */
export function calculateLateFee(
  endDate: Date,
  returnDate: Date,
  dailyPrice: number
): number {
  if (returnDate <= endDate) {
    return 0; // Sem atraso
  }
  
  const daysLate = calculateDays(endDate, returnDate);
  
  // Multa: 100% do preço diário por dia de atraso
  return daysLate * dailyPrice;
}

/**
 * Calcula desconto baseado no período
 */
export function calculateDiscount(
  basePrice: number,
  days: number
): number {
  // Desconto progressivo:
  // - 7-13 dias: 5%
  // - 14-27 dias: 10%
  // - 28+ dias: 15%
  
  if (days >= 28) {
    return basePrice * 0.15; // 15%
  }
  
  if (days >= 14) {
    return basePrice * 0.10; // 10%
  }
  
  if (days >= 7) {
    return basePrice * 0.05; // 5%
  }
  
  return 0; // Sem desconto
}

/**
 * Calcula o total com desconto e taxas
 */
export function calculateTotal(
  basePrice: number,
  discount: number = 0,
  tax: number = 0,
  extraFees: number = 0
): number {
  const afterDiscount = basePrice - discount;
  const afterTax = afterDiscount + tax;
  const total = afterTax + extraFees;
  
  return Math.max(0, total);
}

