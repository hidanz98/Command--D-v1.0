# Recursos de QR Code, Código de Barras e Manutenções

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades Implementadas](#funcionalidades-implementadas)
- [Como Usar](#como-usar)
- [API Endpoints](#api-endpoints)
- [Componentes Frontend](#componentes-frontend)
- [Fluxo de Trabalho](#fluxo-de-trabalho)

---

## 🎯 Visão Geral

Este sistema adiciona funcionalidades completas de rastreamento e gerenciamento de equipamentos através de:

1. **QR Code e Código de Barras**: Identificação única para cada produto
2. **Impressão de Etiquetas**: Etiquetas em tamanhos variados para diferentes tipos de equipamentos
3. **Scanner**: Leitura de códigos via câmera ou entrada manual
4. **Gerenciamento de Manutenções**: Histórico completo de manutenções preventivas e corretivas

---

## ✨ Funcionalidades Implementadas

### 1. Geração de Códigos

- **QR Code Automático**: Gerado automaticamente para cada produto
- **Código de Barras**: Formato Code128 compatível com leitores industriais
- **Geração em Lote**: Crie códigos para múltiplos produtos simultaneamente
- **Regeneração**: Possibilidade de regenerar códigos quando necessário

### 2. Impressão de Etiquetas

**Tamanhos Disponíveis:**

| Tamanho | Dimensões | Uso Recomendado |
|---------|-----------|-----------------|
| Pequeno | 60mm x 40mm | Cabos, acessórios, itens pequenos |
| Médio | 80mm x 60mm | Equipamentos padrão |
| Grande | 100mm x 80mm | Equipamentos grandes, máquinas |

**Conteúdo da Etiqueta:**
- Nome do produto
- SKU (se disponível)
- QR Code
- Código de Barras

### 3. Scanner de Produtos

**Métodos de Leitura:**
- **Câmera**: Escaneie QR Code ou código de barras usando a câmera
- **Manual**: Digite o código diretamente

**Modos de Operação:**
- `checkout`: Conferência de saída
- `checkin`: Conferência de devolução
- `general`: Busca geral de produtos

### 4. Gerenciamento de Manutenções

**Tipos de Manutenção:**
- ✓ Preventiva
- ✓ Corretiva
- ✓ Preditiva
- ✓ Emergência
- ✓ Inspeção
- ✓ Calibração
- ✓ Limpeza
- ✓ Atualização/Melhoria

**Status:**
- Agendada
- Pendente
- Em Andamento
- Concluída
- Cancelada
- Em Espera

**Prioridades:**
- Baixa
- Média
- Alta
- Urgente

**Informações Rastreadas:**
- Custos (mão de obra, peças, total)
- Técnico responsável
- Peças substituídas
- Datas (agendamento, início, conclusão)
- Anexos e fotos
- Observações detalhadas
- Próxima manutenção programada

---

## 📖 Como Usar

### Configurando o Sistema de Conferência

**⚠️ IMPORTANTE:** O sistema de conferência é OPCIONAL e deve ser habilitado pelo gestor da locadora.

1. Acesse o menu **Configurações** (`/configuracoes`)
2. Localize o card **"Configurações de Conferência"**
3. Configure conforme necessário:
   - **Conferência na Saída**: Habilita o scanner para conferir equipamentos na saída/locação
     - Pode marcar como obrigatório (todos os produtos devem ser escaneados)
   - **Conferência na Devolução**: Habilita o scanner para conferir equipamentos na devolução
     - Pode marcar como obrigatório (todos os produtos devem ser escaneados)
4. Clique em **"Salvar Configurações"**

**Comportamento:**
- Se desabilitado: O botão de conferência não aparece na interface
- Se habilitado mas não obrigatório: Opcional usar o scanner
- Se habilitado e obrigatório: Sistema exige a conferência

### Gerando QR Code e Código de Barras

1. Acesse o produto no painel administrativo
2. Clique em "Imprimir Etiqueta"
3. O sistema gerará automaticamente:
   - QR Code único baseado no ID do produto
   - Código de barras único
4. Escolha o tamanho da etiqueta
5. Clique em "Imprimir"
6. Cole a etiqueta impressa no equipamento

### Usando o Scanner

**Durante Saída de Equipamento:**

```typescript
<ProductScanner 
  mode="checkout"
  onProductScanned={(product) => {
    // Adicionar produto à lista de saída
    console.log("Produto escaneado:", product);
  }}
/>
```

**Durante Devolução:**

```typescript
<ProductScanner 
  mode="checkin"
  onProductScanned={(product) => {
    // Processar devolução
    console.log("Produto devolvido:", product);
  }}
/>
```

### Gerenciando Manutenções

1. Acesse `/manutencoes` no painel
2. Clique em "Nova Manutenção"
3. Preencha os dados:
   - Produto
   - Tipo e prioridade
   - Descrição do problema
   - Técnico responsável
   - Data de agendamento
   - Custos estimados
4. Acompanhe o progresso
5. Registre a solução ao concluir

---

## 🔌 API Endpoints

### Configurações

#### Buscar Configurações do Tenant
```http
GET /api/settings
Authorization: Bearer {token}

Response:
{
  "id": "...",
  "tenantId": "...",
  "enableCheckoutScanner": false,
  "enableCheckinScanner": false,
  "requireScanOnCheckout": false,
  "requireScanOnCheckin": false,
  // ... outras configurações
}
```

#### Atualizar Configurações de Conferência
```http
PATCH /api/settings/scanner
Authorization: Bearer {token}

Body:
{
  "enableCheckoutScanner": true,
  "enableCheckinScanner": true,
  "requireScanOnCheckout": false,
  "requireScanOnCheckin": false
}

Response:
{
  "enableCheckoutScanner": true,
  "enableCheckinScanner": true,
  "requireScanOnCheckout": false,
  "requireScanOnCheckin": false
}
```

### Códigos de Produto

#### Gerar QR Code
```http
POST /api/products/:id/generate-qrcode
Authorization: Bearer {token}

Body:
{
  "regenerate": false  // opcional
}

Response:
{
  "qrCode": "PROD-abc123",
  "qrCodeImage": "data:image/png;base64,...",
  "product": {...}
}
```

#### Gerar Código de Barras
```http
POST /api/products/:id/generate-barcode
Authorization: Bearer {token}

Body:
{
  "regenerate": false,  // opcional
  "format": "code128"   // opcional
}
```

#### Obter Códigos para Impressão
```http
GET /api/products/:id/print-codes?size=medium
Authorization: Bearer {token}

Sizes: small | medium | large

Response:
{
  "product": {
    "id": "...",
    "name": "...",
    "sku": "..."
  },
  "qrCode": {
    "data": "PROD-abc123",
    "image": "data:image/png;base64,..."
  },
  "barcode": {
    "data": "1234567890",
    "image": "data:image/png;base64,..."
  }
}
```

#### Escanear Produto
```http
GET /api/products/scan/:code
Authorization: Bearer {token}

Response:
{
  "product": {
    // dados completos do produto
    // incluindo histórico de locações
    // e últimas manutenções
  }
}
```

#### Geração em Lote
```http
POST /api/products/batch-generate-codes
Authorization: Bearer {token}

Body:
{
  "productIds": ["id1", "id2", "id3"]
}

Response:
{
  "results": [...],
  "total": 3,
  "success": 3,
  "failed": 0
}
```

### Manutenções

#### Listar Manutenções
```http
GET /api/maintenances?status=SCHEDULED&type=PREVENTIVE
Authorization: Bearer {token}

Query Params:
- productId: string
- status: MaintenanceStatus
- type: MaintenanceType
- priority: MaintenancePriority
```

#### Criar Manutenção
```http
POST /api/maintenances
Authorization: Bearer {token}

Body:
{
  "productId": "...",
  "type": "PREVENTIVE",
  "status": "SCHEDULED",
  "priority": "MEDIUM",
  "title": "Manutenção Preventiva",
  "description": "...",
  "scheduledDate": "2025-01-15T10:00:00",
  "cost": 150.00,
  "technician": "João Silva",
  "tenantId": "..."
}
```

#### Atualizar Manutenção
```http
PUT /api/maintenances/:id
Authorization: Bearer {token}

Body: {
  "status": "COMPLETED",
  "solution": "Problema resolvido...",
  "completedAt": "2025-01-15T14:00:00",
  "cost": 180.00
}
```

#### Manutenções Agendadas
```http
GET /api/maintenances/upcoming?tenantId=...
Authorization: Bearer {token}
```

#### Relatório de Manutenções
```http
GET /api/maintenances/report?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer {token}

Response:
{
  "total": 15,
  "byStatus": {
    "COMPLETED": 10,
    "IN_PROGRESS": 3,
    "SCHEDULED": 2
  },
  "byType": {
    "PREVENTIVE": 8,
    "CORRECTIVE": 7
  },
  "totalCost": 2500.00,
  "avgCost": 166.67,
  "maintenances": [...]
}
```

---

## 🎨 Componentes Frontend

### ProductLabelPrint

Componente para impressão de etiquetas com QR Code e código de barras.

```tsx
import { ProductLabelPrint } from "@/components/ProductLabelPrint";

<ProductLabelPrint 
  productId="abc123"
  productName="Furadeira Elétrica"
/>
```

**Funcionalidades:**
- Seleção de tamanho
- Pré-visualização
- Impressão direta
- Geração automática de códigos

### ProductScanner

Componente para leitura de QR Code e código de barras.

```tsx
import { ProductScanner } from "@/components/ProductScanner";

<ProductScanner
  mode="checkout"
  onProductScanned={(product) => {
    console.log("Produto:", product);
  }}
/>
```

**Funcionalidades:**
- Scanner via câmera
- Entrada manual
- Validação em tempo real
- Feedback visual

### Maintenances Page

Página completa para gerenciamento de manutenções.

**Rota:** `/manutencoes`

**Funcionalidades:**
- Listagem com filtros
- Criação de manutenções
- Visualização detalhada
- Atualização de status
- Relatórios

---

## 🔄 Fluxo de Trabalho Sugerido

### 1. Cadastro de Produto

```
1. Cadastrar produto no sistema
2. Gerar QR Code e Código de Barras
3. Imprimir etiqueta no tamanho apropriado
4. Colar etiqueta no equipamento
```

### 2. Saída de Equipamento

```
1. Cliente faz pedido
2. Separação do estoque:
   - Usar scanner para conferir cada item
   - Sistema valida disponibilidade
   - Registra saída automaticamente
3. Entrega ao cliente
```

### 3. Devolução de Equipamento

```
1. Cliente retorna equipamento
2. Conferência:
   - Escanear código do produto
   - Sistema valida se está realmente alugado
   - Verificar condições
3. Registrar devolução
4. Se necessário, criar manutenção
```

### 4. Manutenção Preventiva

```
1. Sistema notifica manutenção programada
2. Técnico inicia manutenção
3. Produto marcado como "EM MANUTENÇÃO"
4. Registrar:
   - Ações realizadas
   - Peças trocadas
   - Custos
   - Fotos/anexos
5. Concluir manutenção
6. Produto volta para "DISPONÍVEL"
7. Agendar próxima manutenção
```

### 5. Manutenção Corretiva

```
1. Problema identificado (na devolução ou uso interno)
2. Criar manutenção com:
   - Tipo: CORRECTIVE
   - Prioridade: baseada na gravidade
   - Descrição do problema
3. Atribuir técnico
4. Executar reparo
5. Registrar solução
6. Testar equipamento
7. Retornar ao estoque
```

---

## 🎯 Benefícios

### Operacionais
- ✅ Redução de erros na conferência
- ✅ Agilidade na saída e devolução
- ✅ Rastreabilidade completa
- ✅ Histórico detalhado de manutenções

### Financeiros
- ✅ Controle de custos de manutenção
- ✅ Previsibilidade de gastos
- ✅ Redução de perdas por má identificação

### Gerenciais
- ✅ Relatórios de manutenção
- ✅ Indicadores de desempenho
- ✅ Planejamento de manutenções
- ✅ Gestão de estoque eficiente

---

## 🔧 Dependências Instaladas

```json
{
  "qrcode": "^1.5.x",
  "bwip-js": "^4.x.x",
  "html5-qrcode": "^2.x.x"
}
```

---

## 📝 Estrutura do Banco de Dados

### Campos Adicionados em `TenantSettings`

```prisma
model TenantSettings {
  // ... campos existentes ...
  
  // Conferência com QR Code / Barcode
  enableCheckoutScanner Boolean @default(false)  // Conferência na saída
  enableCheckinScanner  Boolean @default(false)  // Conferência na devolução
  requireScanOnCheckout Boolean @default(false)  // Obrigatório escanear na saída
  requireScanOnCheckin  Boolean @default(false)  // Obrigatório escanear na devolução
}
```

### Campos Adicionados em `Product`

```prisma
model Product {
  // ... campos existentes ...
  
  // Identificação e Rastreamento
  qrCode        String?     @unique
  barcode       String?     @unique
  serialNumber  String?
  
  // Informações de Aquisição
  purchaseDate  DateTime?
  purchasePrice Float?
  supplier      String?
  warrantyUntil DateTime?
  
  // Relations
  maintenances  ProductMaintenance[]
}
```

### Nova Tabela `ProductMaintenance`

```prisma
model ProductMaintenance {
  id          String   @id @default(cuid())
  productId   String
  type        MaintenanceType
  status      MaintenanceStatus
  priority    MaintenancePriority
  title       String
  description String?
  issue       String?
  solution    String?
  cost        Float?
  laborCost   Float?
  partsCost   Float?
  technician  String?
  scheduledDate DateTime?
  startedAt   DateTime?
  completedAt DateTime?
  replacedParts Json?
  notes       String?
  attachments String[]
  nextMaintenanceDate DateTime?
  // ... outros campos ...
}
```

---

## 🚀 Próximos Passos Sugeridos

1. **Integração com Sistema de Notificações**
   - Alertas de manutenção próxima
   - Notificação de equipamento em manutenção

2. **Dashboard de Manutenções**
   - Gráficos de custos
   - Indicadores de tempo médio
   - Equipamentos mais problemáticos

3. **Histórico de Localização**
   - Rastrear onde o equipamento está
   - Último cliente que alugou

4. **App Mobile para Scanner**
   - App dedicado para conferência
   - Funciona offline

5. **Relatórios Avançados**
   - Custo total de propriedade (TCO)
   - Análise de vida útil
   - ROI por equipamento

---

## 📞 Suporte

Para dúvidas ou sugestões sobre estas funcionalidades, consulte a documentação completa do sistema ou entre em contato com o suporte técnico.

---

**Última atualização:** 12/11/2025
**Versão:** 1.0.0

