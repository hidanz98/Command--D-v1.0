# 🗄️ Schema do Banco de Dados - Sistema Command-D

## 📋 Visão Geral

O sistema possui **2 bancos de dados separados**:

1. **Banco Master** - Gerenciado por Otávio (licenciamento)
2. **Bancos Tenant** - Um por locadora (operação)

---

## 🔵 Banco Master (Otávio)

**Conexão:** `MASTER_DATABASE_URL`  
**Cliente Prisma:** `masterPrisma` (`server/lib/masterPrisma.ts`)

### Modelos

#### `LicenseHolder`
```prisma
model LicenseHolder {
  id                String    @id @default(uuid())
  companyName       String
  ownerName         String
  ownerEmail        String    @unique
  ownerPhone        String?
  
  // Licença
  licenseKey        String    @unique
  licenseType       String    // TRIAL | MONTHLY | ANNUAL
  status            String    @default("ACTIVE") // ACTIVE | SUSPENDED | EXPIRED | CANCELLED
  
  // Servidor
  serverUrl         String?
  serverIp          String?
  lastHeartbeat     DateTime?
  
  // Plano
  maxUsers          Int       @default(5)
  maxProducts       Int       @default(100)
  maxOrders         Int       @default(1000)
  
  // Financeiro
  monthlyFee        Float     @default(299.00)
  billingDay        Int       @default(1) // Dia do mês para cobrança
  lastPaymentDate   DateTime?
  nextPaymentDate   DateTime?
  isOverdue         Boolean   @default(false)
  
  // Datas
  trialEndsAt       DateTime?
  activatedAt       DateTime?
  suspendedAt       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relacionamentos
  partnerships      Partnership[] @relation("LicensePartner")
}
```

#### `Partnership`
```prisma
model Partnership {
  id              String   @id @default(uuid())
  requesterTenant String
  partnerTenant   String
  status          String   // PENDING | APPROVED | REJECTED
  shareClients    Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  partner         LicenseHolder @relation("LicensePartner", fields: [partnerTenant], references: [id])
}
```

#### `SystemUpdate`
```prisma
model SystemUpdate {
  id          String   @id @default(uuid())
  version     String
  description String
  releaseDate DateTime
  isRequired  Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

---

## 🟢 Banco Tenant (Locadoras)

**Conexão:** `DATABASE_URL` (cada locadora tem o seu)  
**Cliente Prisma:** `prisma` (`@prisma/client`)

### Modelos Principais

#### `Tenant`
```prisma
model Tenant {
  id              String   @id @default(uuid())
  name            String
  slug            String   @unique
  domain          String?  @unique
  logo            String?
  primaryColor    String   @default("#3B82F6")
  secondaryColor  String   @default("#10B981")
  
  // Licenciamento
  licenseKey      String?
  licenseStatus   String   @default("ACTIVE")
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relacionamentos
  users           User[]
  products        Product[]
  clients         Client[]
  orders          Order[]
  // ... outros
}
```

#### `User`
```prisma
model User {
  id              String   @id @default(uuid())
  tenantId        String
  email           String   @unique
  password        String
  name            String
  role            String   @default("CLIENT") // ADMIN | CLIENT | EMPLOYEE | MASTER_ADMIN
  profileImage    String?
  facialSignature String?
  isActive        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  // ... outros relacionamentos
}
```

#### `Client` ⭐ (ATUALIZADO)
```prisma
model Client {
  id              String    @id @default(uuid())
  tenantId        String
  
  // Dados Pessoais
  name            String
  email           String
  phone           String?
  cpfCnpj         String
  personType      String    // FISICA | JURIDICA
  
  // Endereço
  address         String?
  city            String?
  state           String?
  zipCode         String?
  
  // Aprovação ⭐ NOVO
  status          String    @default("PENDING") // PENDING | APPROVED | REJECTED
  rejectionReason String?
  approvedAt      DateTime?
  approvedBy      String?   // userId do aprovador
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relacionamentos
  tenant          Tenant    @relation(fields: [tenantId], references: [id])
  documents       Document[] ⭐ NOVO
  orders          Order[]
}
```

#### `Document` ⭐ (NOVO)
```prisma
model Document {
  id               String   @id @default(uuid())
  clientId         String
  tenantId         String
  
  // Arquivo
  type             String   // CPF | RG | CNH | CNPJ | PROOF_OF_ADDRESS | SOCIAL_CONTRACT | OTHER
  fileName         String
  filePath         String
  fileSize         Int
  fileHash         String   // SHA-256 para integridade
  mimeType         String
  
  // Validação
  uploadedAt       DateTime @default(now())
  isValid          Boolean
  validationResult Json     // Resultado completo da validação
  validatedAt      DateTime
  
  // Relacionamentos
  client           Client   @relation(fields: [clientId], references: [id])
  tenant           Tenant   @relation(fields: [tenantId], references: [id])
  
  @@index([clientId])
  @@index([tenantId])
}
```

#### `Product`
```prisma
model Product {
  id              String   @id @default(uuid())
  tenantId        String
  name            String
  description     String?
  category        String?
  sku             String?  @unique
  
  // Inventário
  quantity        Int      @default(1)
  status          String   @default("AVAILABLE") // AVAILABLE | RENTED | MAINTENANCE | UNAVAILABLE
  
  // Preços de Locação
  dailyPrice      Float
  weeklyPrice     Float?
  monthlyPrice    Float?
  
  // Outros
  images          String[]
  specifications  Json?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  orderItems      OrderItem[]
}
```

#### `Order` ⭐ (ATUALIZADO)
```prisma
model Order {
  id              String      @id @default(uuid())
  tenantId        String
  clientId        String
  orderNumber     String      @unique
  
  // Status
  status          String      @default("PENDING") // PENDING | CONFIRMED | RENTED | RETURNED | CANCELLED
  
  // Datas de Locação
  startDate       DateTime
  endDate         DateTime
  returnDate      DateTime?   // Data real de devolução
  
  // Valores
  subtotal        Float
  discount        Float       @default(0)
  tax             Float       @default(0)
  lateFee         Float       @default(0) ⭐ NOVO
  damageFee       Float       @default(0) ⭐ NOVO
  total           Float
  
  // Outros
  notes           String?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  // Relacionamentos
  tenant          Tenant      @relation(fields: [tenantId], references: [id])
  client          Client      @relation(fields: [clientId], references: [id])
  items           OrderItem[]
  payments        Payment[]
}
```

#### `OrderItem`
```prisma
model OrderItem {
  id              String   @id @default(uuid())
  orderId         String
  productId       String
  
  quantity        Int      @default(1)
  unitPrice       Float    // Preço no momento do pedido
  totalPrice      Float
  
  // Locação específica
  rentalDays      Int      ⭐ NOVO
  priceType       String   ⭐ NOVO // DAILY | WEEKLY | MONTHLY
  
  createdAt       DateTime @default(now())
  
  order           Order    @relation(fields: [orderId], references: [id])
  product         Product  @relation(fields: [productId], references: [id])
}
```

#### `Payment`
```prisma
model Payment {
  id              String   @id @default(uuid())
  tenantId        String
  orderId         String
  
  amount          Float
  paymentMethod   String   // CREDIT_CARD | DEBIT_CARD | PIX | CASH | BANK_TRANSFER
  status          String   @default("PENDING") // PENDING | PAID | FAILED | REFUNDED
  
  transactionId   String?
  paymentDate     DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  order           Order    @relation(fields: [orderId], references: [id])
}
```

#### `Notification`
```prisma
model Notification {
  id              String   @id @default(uuid())
  tenantId        String
  userId          String?  // null = para todos os admins/funcionários
  
  type            String   // CLIENT_REGISTRATION | CLIENT_APPROVED | CLIENT_REJECTED | ORDER_CREATED | etc
  title           String
  message         String
  data            Json?    // Dados adicionais
  
  read            Boolean  @default(false)
  readAt          DateTime?
  
  createdAt       DateTime @default(now())
  
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
}
```

---

## 🔄 Relacionamentos Principais

### Cliente → Documentos → Aprovação
```
Client (PENDING)
  └─> Document[] (validados automaticamente)
       └─> Aprovação Manual
            ├─> APPROVED → Pode fazer locações
            └─> REJECTED → Não pode fazer locações
```

### Locação Completa
```
Client (APPROVED)
  └─> Order
       ├─> OrderItem[] (produtos)
       │    └─> Product (inventory atualizado)
       └─> Payment[] (inicial + taxas)
            ├─> Payment inicial (PENDING)
            └─> Payment adicional (late/damage fees)
```

### Locadora → Master
```
Tenant (com licenseKey)
  └─> Heartbeat → Master
       └─> LicenseHolder
            ├─> Validação de licença
            └─> Cobrança mensal
```

---

## 📊 Índices Importantes

```prisma
// Para performance em buscas frequentes

@@index([tenantId])           // Todas tabelas multi-tenant
@@index([clientId])            // Documentos, Orders
@@index([orderId])             // OrderItems, Payments
@@index([status])              // Clients (PENDING), Orders, Payments
@@index([startDate, endDate])  // Orders (verificar disponibilidade)
```

---

## 🔒 Segurança e Isolamento

### Multi-Tenant
- Todas as queries filtram por `tenantId`
- Middleware `requireTenant` valida acesso
- Prisma não compartilha dados entre tenants

### Documentos
- Armazenados fora do webroot
- Hash SHA-256 para integridade
- Path traversal prevention
- Download apenas para admins/funcionários

### Licenças
- Validação em tempo real
- Heartbeat automático
- Suspensão automática por inadimplência

---

## 🚀 Migrations

### Criar nova migration
```bash
npx prisma migrate dev --name nome_da_migration
```

### Aplicar em produção
```bash
npx prisma migrate deploy
```

### Reset (desenvolvimento)
```bash
npx prisma migrate reset
```

---

## 📦 Seed Data

```bash
npx prisma db seed
```

Cria:
- Tenant exemplo
- Admin padrão
- Produtos de exemplo
- Categorias

---

## 🔍 Consultas Comuns

### Listar clientes pendentes de aprovação
```typescript
const pending = await prisma.client.findMany({
  where: {
    tenantId: 'xxx',
    status: 'PENDING'
  },
  include: {
    documents: true
  }
});
```

### Verificar disponibilidade de produto
```typescript
const conflicts = await prisma.order.findMany({
  where: {
    tenantId: 'xxx',
    status: { in: ['CONFIRMED', 'RENTED'] },
    items: {
      some: { productId: 'yyy' }
    },
    OR: [
      {
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } }
        ]
      }
    ]
  }
});
```

### Buscar licença no master
```typescript
const license = await masterPrisma.licenseHolder.findUnique({
  where: { licenseKey: 'xxx' }
});
```

---

## 📝 Alterações Recentes

### v1.0.0 - Sistema de Cadastro com Aprovação
- ✅ Adicionado modelo `Document`
- ✅ Campos de aprovação em `Client` (status, approvedAt, approvedBy, rejectionReason)
- ✅ Campos de taxa em `Order` (lateFee, damageFee)
- ✅ Campos de locação em `OrderItem` (rentalDays, priceType)

### v0.9.0 - Sistema de Licenciamento
- ✅ Schema master separado
- ✅ Modelo `LicenseHolder`
- ✅ Modelo `Partnership`
- ✅ Heartbeat fields

---

## 🎯 Próximos Passos

1. ✅ **Adicionar full-text search** em produtos
2. ⏳ **Soft delete** (deletedAt) para auditoria
3. ⏳ **Tabela de Activity Log** para rastreamento
4. ⏳ **Tabela de Settings** para configurações dinâmicas

---

## 📚 Referências

- **Prisma Docs:** https://www.prisma.io/docs
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Multi-Tenant Patterns:** https://www.prisma.io/docs/guides/deployment/multi-tenant

---

**Última atualização:** Outubro 2024  
**Schema version:** 1.0.0

