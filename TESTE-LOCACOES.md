# 🧪 TESTE DO SISTEMA DE LOCAÇÕES

## ❌ PROBLEMAS ENCONTRADOS

### 1. **TenantContext - Frontend Desconectado do Backend**

**Problema:** O `TenantContext` salva pedidos apenas no `localStorage`, não faz requisições para a API.

```typescript
// client/context/TenantContext.tsx
const addOrder = (orderData) => {
  // ❌ Apenas salva no localStorage
  // ❌ Não chama POST /api/orders
  setOrders([...orders, newOrder]);
}
```

**Impacto:**
- Pedidos não são salvos no banco de dados
- Pedidos desaparecem ao limpar cache
- Sem sincronização entre dispositivos

---

### 2. **Falta de Integração com Estoque**

**Problema:** Criar pedido não atualiza o status do produto.

```typescript
// server/routes/orders.ts - linha 159
const order = await prisma.order.create({...});
// ❌ Não atualiza product.status para RENTED
// ❌ Não diminui product.quantity
```

**Impacto:**
- Produtos podem ser alugados múltiplas vezes
- Estoque fica desatualizado
- Produtos indisponíveis aparecem como disponíveis

---

### 3. **Cálculo de Datas/Período de Locação**

**Problema:** Não calcula automaticamente o valor baseado no período.

```typescript
// Falta lógica:
// - Se locação é de 1-3 dias → usar dailyPrice
// - Se locação é de 4-14 dias → usar weeklyPrice
// - Se locação é >14 dias → usar monthlyPrice
```

**Impacto:**
- Cliente pode pagar errado
- Não aproveita preços semanais/mensais

---

### 4. **Validação de Disponibilidade**

**Problema:** Não verifica se o produto já está alugado no período solicitado.

```typescript
// Falta verificar:
// - Produto X está alugado de 01/01 a 05/01
// - Cliente quer alugar de 03/01 a 07/01
// - ❌ Deveria bloquear (conflito de datas)
```

**Impacto:**
- Dupla locação do mesmo produto
- Conflitos de entrega

---

### 5. **Devolução de Produtos**

**Problema:** Não tem endpoint para marcar produto como devolvido.

```typescript
// Falta:
// POST /api/orders/:id/return
// - Atualizar order.returnDate
// - Mudar order.status para RETURNED
// - Liberar product.status para AVAILABLE
// - Aumentar product.quantity
```

**Impacto:**
- Produtos ficam "alugados" para sempre
- Estoque nunca retorna

---

### 6. **Status do Pedido**

**Problema:** Status do pedido não reflete o ciclo de vida real de uma locação.

```typescript
// Status atual:
enum OrderStatus {
  PENDING,     // Aguardando confirmação
  CONFIRMED,   // Confirmado
  IN_PROGRESS, // Em andamento
  COMPLETED,   // Concluído
  CANCELLED,   // Cancelado
  RETURNED     // Devolvido
}

// ❌ Falta:
// - READY_FOR_PICKUP (pronto para retirada)
// - OUT_FOR_DELIVERY (saiu para entrega)
// - DELIVERED (entregue ao cliente)
// - OVERDUE (atrasado - passou da data)
```

---

### 7. **Pagamentos**

**Problema:** Criar pedido não cria pagamento associado.

```typescript
// server/routes/orders.ts
const order = await prisma.order.create({...});
// ❌ Deveria também criar Payment
// ❌ Não verifica se pagamento foi feito
```

**Impacto:**
- Pedidos sem controle de pagamento
- Cliente pode levar sem pagar

---

### 8. **Multas e Taxas**

**Problema:** Não calcula multa por atraso ou taxas adicionais.

```typescript
// Falta:
// - Calcular dias de atraso (returnDate - endDate)
// - Aplicar multa por dia de atraso
// - Cobrar taxa de limpeza/dano
```

---

## ✅ TESTES NECESSÁRIOS

### Teste 1: Criar Locação Completa

**Fluxo esperado:**
```
1. Cliente seleciona produto (Sony FX6)
2. Escolhe período (01/01 a 05/01 - 5 dias)
3. Sistema calcula valor (5 * R$ 350 = R$ 1.750)
4. Cliente confirma
5. Sistema cria pedido no banco ✅
6. Sistema marca produto como RENTED ✅
7. Sistema diminui estoque ✅
8. Sistema cria pagamento ✅
```

**Teste:**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client123",
    "items": [{
      "productId": "prod123",
      "quantity": 1,
      "startDate": "2024-01-01",
      "endDate": "2024-01-05"
    }]
  }'
```

**Verificações:**
```sql
-- Pedido criado?
SELECT * FROM orders WHERE id = 'xxx';

-- Produto marcado como RENTED?
SELECT status FROM products WHERE id = 'prod123';

-- Estoque diminuiu?
SELECT quantity FROM products WHERE id = 'prod123';

-- Pagamento criado?
SELECT * FROM payments WHERE "orderId" = 'xxx';
```

---

### Teste 2: Validar Conflito de Datas

**Cenário:**
```
- Produto X já alugado de 01/01 a 05/01
- Cliente tenta alugar de 03/01 a 07/01
- ❌ Deveria bloquear
```

**Teste:**
```bash
# Primeiro pedido
curl -X POST .../api/orders -d '{
  "productId": "prod123",
  "startDate": "2024-01-01",
  "endDate": "2024-01-05"
}'

# Segundo pedido (conflito)
curl -X POST .../api/orders -d '{
  "productId": "prod123",
  "startDate": "2024-01-03",
  "endDate": "2024-01-07"
}'

# Esperado:
# {
#   "error": "Product not available in the requested period",
#   "conflicts": [{...}]
# }
```

---

### Teste 3: Devolver Produto

**Fluxo:**
```
1. Cliente devolve produto
2. POST /api/orders/:id/return
3. Sistema marca order como RETURNED
4. Sistema libera product.status para AVAILABLE
5. Sistema aumenta quantity
6. Sistema calcula multa se atrasado
```

**Teste:**
```bash
curl -X POST http://localhost:8080/api/orders/order123/return \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actualReturnDate": "2024-01-06",
    "condition": "good",
    "notes": "Devolvido em perfeito estado"
  }'

# Se atrasado (endDate era 05/01):
# {
#   "success": true,
#   "lateFee": 350, // 1 dia * dailyPrice
#   "totalDue": 350
# }
```

---

### Teste 4: Cálculo Automático de Preço

**Testes:**
```javascript
// 1 dia
calcularPreco(1) // → 1 * dailyPrice

// 5 dias
calcularPreco(5) // → 5 * dailyPrice

// 7 dias (semana)
calcularPreco(7) // → weeklyPrice (mais barato)

// 30 dias (mês)
calcularPreco(30) // → monthlyPrice (muito mais barato)
```

---

### Teste 5: Status do Pedido

**Fluxo completo:**
```
PENDING → Cliente cria pedido
  ↓
CONFIRMED → Admin aprova
  ↓
READY_FOR_PICKUP → Produto separado
  ↓
OUT_FOR_DELIVERY → Saiu para entrega
  ↓
DELIVERED → Cliente recebeu
  ↓
IN_PROGRESS → Cliente está usando
  ↓
RETURNED → Cliente devolveu
  ↓
COMPLETED → Tudo finalizado
```

---

## 🔧 CORREÇÕES NECESSÁRIAS

### 1. Integrar Frontend com Backend

```typescript
// client/context/TenantContext.tsx
const addOrder = async (orderData) => {
  try {
    // ✅ Chamar API
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();
    
    if (data.success) {
      // ✅ Atualizar estado local
      setOrders([...orders, data.data]);
      return data.data.id;
    }
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
  }
};
```

---

### 2. Atualizar Estoque ao Criar Pedido

```typescript
// server/routes/orders.ts
export const createOrder: RequestHandler = async (req, res) => {
  // ... código existente ...
  
  // ✅ Atualizar produtos
  for (const item of orderItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        status: 'RENTED',
        quantity: {
          decrement: item.quantity
        }
      }
    });
  }
  
  // ✅ Criar pagamento
  await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: total,
      method: 'PENDING',
      status: 'PENDING',
      tenantId
    }
  });
  
  res.status(201).json({...});
};
```

---

### 3. Validar Disponibilidade

```typescript
// server/routes/orders.ts - Nova função
async function checkAvailability(
  productId: string,
  startDate: Date,
  endDate: Date,
  tenantId: string
) {
  // Buscar pedidos que conflitam
  const conflicts = await prisma.order.findMany({
    where: {
      tenantId,
      items: {
        some: {
          productId,
          OR: [
            {
              AND: [
                { startDate: { lte: startDate } },
                { endDate: { gte: startDate } }
              ]
            },
            {
              AND: [
                { startDate: { lte: endDate } },
                { endDate: { gte: endDate } }
              ]
            }
          ]
        }
      },
      status: {
        notIn: ['CANCELLED', 'RETURNED', 'COMPLETED']
      }
    }
  });
  
  return conflicts.length === 0;
}
```

---

### 4. Endpoint de Devolução

```typescript
// server/routes/orders.ts - Novo endpoint
export const returnOrder: RequestHandler = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;
    const { actualReturnDate, condition, notes } = req.body;

    const order = await prisma.order.findFirst({
      where: { id, tenantId },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Calcular multa por atraso
    let lateFee = 0;
    if (order.endDate && new Date(actualReturnDate) > order.endDate) {
      const daysLate = Math.ceil(
        (new Date(actualReturnDate).getTime() - order.endDate.getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      
      // Multa: dailyPrice * dias de atraso
      for (const item of order.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        lateFee += (product?.dailyPrice || 0) * daysLate * item.quantity;
      }
    }

    // Atualizar pedido
    await prisma.order.update({
      where: { id },
      data: {
        status: 'RETURNED',
        returnDate: new Date(actualReturnDate),
        notes: notes || order.notes
      }
    });

    // Liberar produtos
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          status: 'AVAILABLE',
          quantity: {
            increment: item.quantity
          }
        }
      });
    }

    // Se tem multa, criar pagamento adicional
    if (lateFee > 0) {
      await prisma.payment.create({
        data: {
          orderId: id,
          amount: lateFee,
          method: 'PENDING',
          status: 'PENDING',
          tenantId,
          notes: `Multa por atraso (${Math.ceil(lateFee / order.items[0].unitPrice)} dias)`
        }
      });
    }

    res.json({
      success: true,
      lateFee,
      message: lateFee > 0 ? 'Returned with late fee' : 'Returned on time'
    });
  } catch (error) {
    console.error('Return order error:', error);
    res.status(500).json({ error: 'Failed to return order' });
  }
};
```

---

### 5. Calcular Preço por Período

```typescript
// server/lib/pricingCalculator.ts - Novo arquivo
export function calculateRentalPrice(
  dailyPrice: number,
  weeklyPrice: number | null,
  monthlyPrice: number | null,
  days: number
): number {
  // Mensal (>= 28 dias)
  if (days >= 28 && monthlyPrice) {
    const months = Math.ceil(days / 30);
    return months * monthlyPrice;
  }
  
  // Semanal (>= 7 dias)
  if (days >= 7 && weeklyPrice) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    return (weeks * weeklyPrice) + (remainingDays * dailyPrice);
  }
  
  // Diário
  return days * dailyPrice;
}
```

---

## 📝 CHECKLIST DE CORREÇÕES

```
[ ] 1. Integrar TenantContext com API backend
[ ] 2. Atualizar estoque ao criar pedido
[ ] 3. Marcar produto como RENTED
[ ] 4. Criar pagamento ao criar pedido
[ ] 5. Validar disponibilidade do produto
[ ] 6. Implementar endpoint de devolução
[ ] 7. Calcular multas por atraso
[ ] 8. Calcular preço por período (dia/semana/mês)
[ ] 9. Adicionar mais status ao pedido
[ ] 10. Sincronizar localStorage com API
```

---

## 🎯 PRIORIDADES

### Alta (Crítico)
1. ✅ Integrar frontend com backend
2. ✅ Atualizar estoque
3. ✅ Validar disponibilidade

### Média (Importante)
4. ✅ Endpoint de devolução
5. ✅ Calcular preço por período
6. ✅ Criar pagamento automático

### Baixa (Desejável)
7. Multas por atraso
8. Status adicionais
9. Relatórios de locação

---

Quer que eu implemente as correções agora?

