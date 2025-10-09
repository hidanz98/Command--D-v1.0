# 🔄 Instruções para Atualizar o Banco de Dados

## 📋 Alterações Necessárias no Schema

Para implementar o **Sistema de Cadastro com Aprovação Manual**, precisamos atualizar o `prisma/schema.prisma`.

---

## 🛠️ Passo a Passo

### 1️⃣ Adicionar Modelo `Document`

Adicione este modelo ao final do arquivo `prisma/schema.prisma`:

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
  client           Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  tenant           Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@index([clientId])
  @@index([tenantId])
  @@map("documents")
}
```

---

### 2️⃣ Atualizar Modelo `Client`

Adicione estes campos ao modelo `Client` existente:

```prisma
model Client {
  id              String    @id @default(uuid())
  tenantId        String
  name            String
  email           String
  phone           String?
  cpfCnpj         String
  personType      String    @default("FISICA") // FISICA | JURIDICA
  address         String?
  city            String?
  state           String?
  zipCode         String?
  
  // ⭐ NOVOS CAMPOS DE APROVAÇÃO
  status          String    @default("PENDING") // PENDING | APPROVED | REJECTED
  rejectionReason String?
  approvedAt      DateTime?
  approvedBy      String?   // userId do aprovador
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relacionamentos
  tenant          Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  orders          Order[]
  documents       Document[] // ⭐ NOVO RELACIONAMENTO
  
  @@index([tenantId])
  @@index([status])        // ⭐ NOVO ÍNDICE
  @@map("clients")
}
```

---

### 3️⃣ Atualizar Modelo `Order`

Adicione campos de taxas ao modelo `Order`:

```prisma
model Order {
  id              String      @id @default(uuid())
  tenantId        String
  clientId        String
  orderNumber     String      @unique
  status          String      @default("PENDING")
  
  startDate       DateTime
  endDate         DateTime
  returnDate      DateTime?
  
  subtotal        Float
  discount        Float       @default(0)
  tax             Float       @default(0)
  lateFee         Float       @default(0)   // ⭐ NOVO
  damageFee       Float       @default(0)   // ⭐ NOVO
  total           Float
  
  notes           String?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  tenant          Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  client          Client      @relation(fields: [clientId], references: [id])
  items           OrderItem[]
  payments        Payment[]
  
  @@index([tenantId])
  @@index([clientId])
  @@index([status])
  @@index([startDate, endDate])
  @@map("orders")
}
```

---

### 4️⃣ Atualizar Modelo `OrderItem`

Adicione campos de informações de locação:

```prisma
model OrderItem {
  id              String   @id @default(uuid())
  orderId         String
  productId       String
  
  quantity        Int      @default(1)
  unitPrice       Float
  totalPrice      Float
  
  // ⭐ NOVOS CAMPOS DE LOCAÇÃO
  rentalDays      Int      @default(1)
  priceType       String   @default("DAILY") // DAILY | WEEKLY | MONTHLY
  
  createdAt       DateTime @default(now())
  
  order           Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product         Product  @relation(fields: [productId], references: [id])
  
  @@index([orderId])
  @@index([productId])
  @@map("order_items")
}
```

---

### 5️⃣ Adicionar Relacionamento ao `Tenant`

Se o modelo `Tenant` ainda não tem o relacionamento com `Document`, adicione:

```prisma
model Tenant {
  id              String   @id @default(uuid())
  name            String
  slug            String   @unique
  // ... outros campos existentes ...
  
  // Relacionamentos
  users           User[]
  products        Product[]
  clients         Client[]
  orders          Order[]
  documents       Document[]  // ⭐ ADICIONE ESTA LINHA
  // ... outros relacionamentos ...
  
  @@map("tenants")
}
```

---

## 🚀 Executar Migration

Após fazer as alterações acima, execute:

### Desenvolvimento
```bash
npx prisma migrate dev --name add_documents_and_client_approval
```

Este comando irá:
1. Criar a migration SQL
2. Aplicar no banco de desenvolvimento
3. Gerar o Prisma Client atualizado

### Produção
```bash
npx prisma migrate deploy
```

---

## ✅ Verificar Alterações

### Ver schema gerado
```bash
npx prisma format
```

### Ver status das migrations
```bash
npx prisma migrate status
```

### Reset (apenas desenvolvimento)
```bash
npx prisma migrate reset
```
⚠️ **ATENÇÃO:** Isso vai **deletar todos os dados**!

---

## 📊 SQL Gerado (Referência)

A migration deve gerar SQL semelhante a:

```sql
-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileHash" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isValid" BOOLEAN NOT NULL,
    "validationResult" TEXT NOT NULL,
    "validatedAt" DATETIME NOT NULL,
    CONSTRAINT "documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE CASCADE,
    CONSTRAINT "documents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE
);

-- AlterTable
ALTER TABLE "clients" ADD COLUMN "status" TEXT DEFAULT 'PENDING';
ALTER TABLE "clients" ADD COLUMN "rejectionReason" TEXT;
ALTER TABLE "clients" ADD COLUMN "approvedAt" DATETIME;
ALTER TABLE "clients" ADD COLUMN "approvedBy" TEXT;
ALTER TABLE "clients" ADD COLUMN "personType" TEXT DEFAULT 'FISICA';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "lateFee" REAL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "damageFee" REAL DEFAULT 0;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN "rentalDays" INTEGER DEFAULT 1;
ALTER TABLE "order_items" ADD COLUMN "priceType" TEXT DEFAULT 'DAILY';

-- CreateIndex
CREATE INDEX "documents_clientId_idx" ON "documents"("clientId");
CREATE INDEX "documents_tenantId_idx" ON "documents"("tenantId");
CREATE INDEX "clients_status_idx" ON "clients"("status");
```

---

## 🔄 Migration Segura (Produção)

### Opção 1: Migration Automática
```bash
npx prisma migrate deploy
```

### Opção 2: Migration Manual (Recomendado para produção)

1. Gere o SQL sem aplicar:
```bash
npx prisma migrate diff --from-url "DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script > migration.sql
```

2. Revise o SQL gerado

3. Aplique manualmente:
```bash
psql -d sua_database -f migration.sql
```

4. Marque como aplicada:
```bash
npx prisma migrate resolve --applied MIGRATION_NAME
```

---

## 🧪 Testar Alterações

Após a migration, teste:

### 1. Criar cliente com documento
```typescript
const client = await prisma.client.create({
  data: {
    tenantId: 'xxx',
    name: 'João Silva',
    email: 'joao@example.com',
    cpfCnpj: '123.456.789-00',
    personType: 'FISICA',
    status: 'PENDING',
    documents: {
      create: {
        tenantId: 'xxx',
        type: 'CPF',
        fileName: 'cpf.pdf',
        filePath: '/uploads/xxx.pdf',
        fileSize: 12345,
        fileHash: 'abc123',
        mimeType: 'application/pdf',
        isValid: true,
        validationResult: {},
        validatedAt: new Date()
      }
    }
  }
});
```

### 2. Aprovar cliente
```typescript
const approved = await prisma.client.update({
  where: { id: 'client-id' },
  data: {
    status: 'APPROVED',
    approvedAt: new Date(),
    approvedBy: 'user-id'
  }
});
```

### 3. Criar pedido com taxas
```typescript
const order = await prisma.order.create({
  data: {
    tenantId: 'xxx',
    clientId: 'yyy',
    orderNumber: 'ORD-001',
    startDate: new Date(),
    endDate: new Date(),
    subtotal: 100,
    lateFee: 10,
    damageFee: 0,
    total: 110,
    items: {
      create: {
        productId: 'zzz',
        quantity: 1,
        unitPrice: 100,
        totalPrice: 100,
        rentalDays: 5,
        priceType: 'DAILY'
      }
    }
  }
});
```

---

## 📝 Rollback (Se necessário)

Se algo der errado:

### Ver histórico de migrations
```bash
npx prisma migrate status
```

### Reverter última migration (desenvolvimento)
```bash
npx prisma migrate reset
```

### Reverter em produção (manual)
Você precisará criar um script SQL inverso manualmente.

---

## ✅ Checklist de Validação

Após migration:
- [ ] Schema foi atualizado corretamente
- [ ] Prisma Client foi regenerado
- [ ] Tipos TypeScript estão corretos
- [ ] Não há erros de compilação
- [ ] Testes básicos passam
- [ ] Backup do banco foi feito (produção)

---

## 🆘 Problemas Comuns

### Erro: "Foreign key constraint failed"
**Solução:** Certifique-se de que não há dados órfãos nas tabelas.

### Erro: "Column already exists"
**Solução:** A migration já foi aplicada. Use `npx prisma migrate status`.

### Erro: "Schema out of sync"
**Solução:** Execute `npx prisma generate` para regenerar o client.

---

## 📚 Recursos

- **Prisma Migrate:** https://www.prisma.io/docs/concepts/components/prisma-migrate
- **Schema Reference:** https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- **Migration Troubleshooting:** https://www.prisma.io/docs/guides/database/troubleshooting-orm

---

**Última atualização:** Outubro 2024

