# 📍 Onde Encontrar as Funcionalidades

## 🔧 Configurações do Sistema

### Página de Configurações
**URL:** `http://localhost:8080/configuracoes`

**Como acessar:**
1. Faça login como **ADMIN** ou **MASTER_ADMIN**
2. Navegue para `/configuracoes`
3. Você verá:
   - Card "Configurações de Conferência"
   - Switches para habilitar/desabilitar scanner
   - Opções de obrigatoriedade

**Arquivo:** `client/pages/Configuracoes.tsx`

---

## 🏷️ Gerenciamento de QR Code e Etiquetas

### Componente: ProductLabelPrint
**Arquivo:** `client/components/ProductLabelPrint.tsx`

**Uso:**
```tsx
import { ProductLabelPrint } from "@/components/ProductLabelPrint";

<ProductLabelPrint 
  productId="abc123"
  productName="Furadeira Elétrica"
/>
```

**Funcionalidades:**
- Gera QR Code automaticamente
- Gera Código de Barras automaticamente
- Permite escolher tamanho (pequeno/médio/grande)
- Pré-visualização
- Impressão direta

### Onde adicionar:
1. **Painel Admin** - Ao lado de cada produto
2. **Página de Produtos** - Botão de ação
3. **Detalhes do Produto** - Seção de ações

---

## 📱 Scanner de Produtos

### Componente: ProductScanner
**Arquivo:** `client/components/ProductScanner.tsx`

**Uso:**
```tsx
import { ProductScanner } from "@/components/ProductScanner";

// Para saída de equipamento
<ProductScanner 
  mode="checkout"
  onProductScanned={(product) => {
    console.log("Produto escaneado:", product);
  }}
/>

// Para devolução
<ProductScanner 
  mode="checkin"
  onProductScanned={(product) => {
    console.log("Produto devolvido:", product);
  }}
/>

// Modo geral
<ProductScanner 
  mode="general"
  onProductScanned={(product) => {
    console.log("Produto encontrado:", product);
  }}
/>
```

**Funcionalidades:**
- Escaneia QR Code via câmera
- Escaneia Código de Barras via câmera
- Entrada manual de código
- Validação em tempo real
- Feedback visual

### Onde usar:
1. **Página de Pedidos** - Durante criação de pedido
2. **Página de Locações** - Na saída de equipamentos
3. **Página de Devoluções** - Na devolução
4. **Painel Admin** - Para busca rápida

**Importante:** O componente só aparece se:
- Modo `general`: sempre visível
- Modo `checkout`: precisa estar habilitado em configurações
- Modo `checkin`: precisa estar habilitado em configurações

---

## 🔧 Gerenciamento de Manutenções

### Página de Manutenções
**URL:** `http://localhost:8080/manutencoes`

**Como acessar:**
1. Faça login como **ADMIN** ou **MASTER_ADMIN**
2. Navegue para `/manutencoes`
3. Você verá:
   - Lista de todas as manutenções
   - Filtros por status e tipo
   - Botão "Nova Manutenção"

**Arquivo:** `client/pages/Maintenances.tsx`

**Funcionalidades:**
- Criar manutenção
- Visualizar detalhes
- Filtrar por status/tipo/prioridade
- Ver histórico completo
- Acompanhar custos

---

## 🎨 Estrutura de Navegação Sugerida

### Menu Principal (Painel Admin)

```
Dashboard
├── 📊 Visão Geral
├── 📦 Estoque
│   ├── Listar Produtos
│   ├── Adicionar Produto
│   └── [Botão: Imprimir Etiqueta] ← ADICIONAR ProductLabelPrint
├── 📋 Pedidos
│   ├── Novos Pedidos
│   ├── Em Andamento
│   └── [Botão: Conferir Saída] ← ADICIONAR ProductScanner (checkout)
├── 🔄 Devoluções
│   └── [Botão: Conferir Devolução] ← ADICIONAR ProductScanner (checkin)
├── 🔧 Manutenções ← JÁ EXISTE (/manutencoes)
├── 👥 Clientes
├── ⚙️ Configurações ← JÁ EXISTE (/configuracoes)
```

---

## 📝 Como Integrar os Componentes

### 1. Adicionar Impressão de Etiquetas no Painel Admin

Localize onde os produtos são listados e adicione:

```tsx
import { ProductLabelPrint } from "@/components/ProductLabelPrint";

// Na listagem de produtos
{products.map((product) => (
  <div key={product.id}>
    <h3>{product.name}</h3>
    
    {/* Adicione aqui */}
    <ProductLabelPrint 
      productId={product.id}
      productName={product.name}
    />
  </div>
))}
```

### 2. Adicionar Scanner na Página de Pedidos

```tsx
import { ProductScanner } from "@/components/ProductScanner";

// Na página de criar pedido
<div className="mb-4">
  <ProductScanner 
    mode="checkout"
    onProductScanned={(product) => {
      // Adiciona produto ao pedido
      addProductToOrder(product);
    }}
  />
</div>
```

### 3. Adicionar Scanner na Página de Devoluções

```tsx
import { ProductScanner } from "@/components/ProductScanner";

// Na página de devoluções
<div className="mb-4">
  <ProductScanner 
    mode="checkin"
    onProductScanned={(product) => {
      // Processa devolução
      processReturn(product);
    }}
  />
</div>
```

---

## 🔍 Testando as Funcionalidades

### 1. Testar Configurações
```
1. Acesse: http://localhost:8080/configuracoes
2. Habilite "Conferência na Saída"
3. Clique em "Salvar Configurações"
4. Verifique que o botão apareceu nas páginas relevantes
```

### 2. Testar Impressão de Etiquetas
```
1. Acesse o painel admin
2. Localize um produto
3. Clique em "Imprimir Etiqueta"
4. Escolha o tamanho
5. Visualize a prévia
6. Clique em "Imprimir"
```

### 3. Testar Scanner
```
1. Certifique-se que a conferência está habilitada
2. Imprima uma etiqueta de teste
3. Acesse a página com o scanner
4. Clique no botão "Conferir Saída" ou "Conferir Devolução"
5. Escolha aba "Escanear" ou "Manual"
6. Teste escaneando ou digitando o código
```

### 4. Testar Manutenções
```
1. Acesse: http://localhost:8080/manutencoes
2. Clique em "Nova Manutenção"
3. Preencha os dados
4. Salve
5. Verifique a listagem
```

---

## 📂 Estrutura de Arquivos

```
Command--D-v1.0/
├── client/
│   ├── components/
│   │   ├── ProductLabelPrint.tsx     ← Impressão de etiquetas
│   │   ├── ProductScanner.tsx        ← Scanner QR/Barcode
│   │   └── ScannerSettingsCard.tsx   ← Card de configurações
│   │
│   └── pages/
│       ├── Configuracoes.tsx         ← Página de configurações
│       ├── Maintenances.tsx          ← Página de manutenções
│       └── PainelAdmin.tsx           ← Onde adicionar componentes
│
├── server/
│   └── routes/
│       ├── product-codes.ts          ← API QR Code/Barcode
│       ├── maintenances.ts           ← API Manutenções
│       └── settings.ts               ← API Configurações
│
└── shared/
    └── api.ts                        ← Tipos TypeScript
```

---

## 🎯 Próximos Passos

### Integração Recomendada:

1. **Adicionar ProductLabelPrint ao Painel Admin**
   - Local: Onde os produtos são listados
   - Ação: Botão "Imprimir Etiqueta" ao lado de cada produto

2. **Adicionar ProductScanner à Página de Pedidos**
   - Local: Formulário de criação de pedido
   - Modo: `checkout`

3. **Adicionar ProductScanner à Página de Devoluções**
   - Local: Página de processar devolução
   - Modo: `checkin`

4. **Adicionar Link de Configurações no Menu**
   - Local: Menu principal do painel
   - Texto: "Configurações"
   - Link: `/configuracoes`

5. **Adicionar Link de Manutenções no Menu**
   - Local: Menu principal do painel
   - Texto: "Manutenções"
   - Link: `/manutencoes`

---

## 🚀 URLs Rápidas

Após o servidor iniciar em `http://localhost:8080`:

- **Configurações:** `/configuracoes`
- **Manutenções:** `/manutencoes`
- **Painel Admin:** `/painel-admin`
- **Login:** `/login`

---

**Última atualização:** 12/11/2025

