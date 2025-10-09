# 🗄️ Database Setup - Sistema Command-D

## 📋 Visão Geral

O banco de dados foi implementado usando **PostgreSQL** com **Prisma ORM** para uma solução robusta e escalável. O sistema suporta multi-tenancy completo com isolamento de dados por empresa.

## 🛠️ Tecnologias

- **PostgreSQL** - Banco de dados principal
- **Prisma ORM** - ORM para TypeScript
- **bcryptjs** - Hash de senhas
- **jsonwebtoken** - Autenticação JWT

## 📊 Schema do Banco

### 🏢 Multi-Tenant
- **Tenant** - Empresas/tenants
- **TenantSettings** - Configurações por tenant

### 👥 Gestão de Usuários
- **User** - Usuários do sistema (ADMIN, CLIENT, EMPLOYEE, MASTER_ADMIN)
- **Client** - Clientes/fornecedores
- **Employee** - Funcionários

### 📦 Produtos e Inventário
- **Product** - Produtos/equipamentos
- **Category** - Categorias de produtos

### 📋 Pedidos e Vendas
- **Order** - Pedidos de locação
- **OrderItem** - Itens dos pedidos
- **Payment** - Pagamentos

### ⏰ Sistema de Ponto
- **Timesheet** - Registros de ponto
- **Activity** - Log de atividades

### 🔔 Notificações
- **Notification** - Sistema de notificações

## 🚀 Configuração

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/command_d_db?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# App Configuration
NODE_ENV="development"
PORT=8080

# Multi-tenant Configuration
DEFAULT_TENANT_ID="default"
```

### 3. Configurar PostgreSQL
```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Instalar PostgreSQL (Windows)
# Baixar de: https://www.postgresql.org/download/windows/

# Instalar PostgreSQL (macOS)
brew install postgresql

# Criar banco de dados
createdb command_d_db
```

### 4. Executar Migrações
```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar migrações
npm run db:push

# Ou usar migrações nomeadas
npm run db:migrate
```

### 5. Popular Banco com Dados de Exemplo
```bash
npm run db:seed
```

## 📝 Scripts Disponíveis

```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar mudanças no schema
npm run db:push

# Criar migração
npm run db:migrate

# Abrir Prisma Studio
npm run db:studio

# Popular banco com dados de exemplo
npm run db:seed
```

## 🔐 Credenciais Padrão

Após executar o seed, você terá acesso com:

### Master Admin
- **Email**: admin@command-d.com
- **Senha**: admin123
- **Role**: MASTER_ADMIN

### Admin
- **Email**: admin@empresa.com
- **Senha**: admin123
- **Role**: ADMIN

### Funcionário
- **Email**: funcionario@empresa.com
- **Role**: EMPLOYEE

## 🏗️ Estrutura das Tabelas

### Tenant (Empresas)
```sql
- id: String (PK)
- name: String
- slug: String (UNIQUE)
- description: String?
- logo: String?
- settings: Json?
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

### User (Usuários)
```sql
- id: String (PK)
- email: String (UNIQUE)
- password: String (hashed)
- name: String
- role: UserRole (ADMIN, CLIENT, EMPLOYEE, MASTER_ADMIN)
- isActive: Boolean
- tenantId: String (FK)
- createdAt: DateTime
- updatedAt: DateTime
```

### Product (Produtos)
```sql
- id: String (PK)
- name: String
- description: String?
- sku: String?
- categoryId: String (FK)
- brand: String?
- model: String?
- dailyPrice: Float
- weeklyPrice: Float?
- monthlyPrice: Float?
- quantity: Int
- minQuantity: Int
- status: ProductStatus (AVAILABLE, RENTED, MAINTENANCE, INACTIVE)
- ownerType: OwnerType (COMPANY, SUPPLIER)
- ownerId: String?
- images: String[]
- tags: String[]
- specifications: Json?
- isActive: Boolean
- tenantId: String (FK)
- createdAt: DateTime
- updatedAt: DateTime
```

### Order (Pedidos)
```sql
- id: String (PK)
- orderNumber: String (UNIQUE)
- status: OrderStatus (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, RETURNED)
- clientId: String (FK)
- startDate: DateTime
- endDate: DateTime?
- returnDate: DateTime?
- subtotal: Float
- discount: Float
- tax: Float
- total: Float
- notes: String?
- deliveryAddress: String?
- pickupAddress: String?
- tenantId: String (FK)
- createdAt: DateTime
- updatedAt: DateTime
```

## 🔒 Segurança

### Autenticação
- Senhas hasheadas com bcryptjs (12 rounds)
- JWT tokens com expiração de 7 dias
- Middleware de autenticação em todas as rotas protegidas

### Autorização
- Controle de acesso baseado em roles
- Isolamento de dados por tenant
- Validação de permissões em cada endpoint

### Multi-Tenancy
- Dados completamente isolados por tenant
- Cada tenant tem suas próprias configurações
- Suporte a múltiplas empresas no mesmo banco

## 📈 Performance

### Índices
- Índices automáticos em chaves estrangeiras
- Índices únicos em campos críticos (email, slug)
- Índices compostos para consultas frequentes

### Otimizações
- Paginação em todas as listagens
- Relacionamentos carregados sob demanda
- Queries otimizadas com Prisma

## 🚨 Troubleshooting

### Erro de Conexão
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar porta
netstat -an | grep 5432
```

### Erro de Permissão
```bash
# Dar permissão ao usuário
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE command_d_db TO postgres;
```

### Reset do Banco
```bash
# Deletar e recriar banco
dropdb command_d_db
createdb command_d_db
npm run db:push
npm run db:seed
```

## 📚 Próximos Passos

1. **Configurar backup automático**
2. **Implementar cache Redis**
3. **Adicionar monitoramento**
4. **Configurar replicação**
5. **Implementar sharding para grandes volumes**

---

**🎉 Banco de dados implementado com sucesso!**

O sistema agora tem persistência completa de dados com suporte multi-tenant, autenticação segura e todas as funcionalidades necessárias para um sistema de locação profissional.
