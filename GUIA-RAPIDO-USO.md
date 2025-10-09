# 🚀 Guia Rápido de Uso - Sistema Command-D

## 📋 Para Começar Agora

### ⚡ Setup Inicial (5 minutos)

```bash
# 1. Clone e instale
git clone [repo-url]
cd Sistema-Command-D
npm install

# 2. Configure o .env
cp .env.example .env
# Edite .env com suas configurações

# 3. Configure o banco
npx prisma migrate dev
npx prisma db seed

# 4. Inicie o servidor
npm run dev

# 5. Acesse
# http://localhost:8080
```

---

## 👥 Perfis de Usuário

### 🔷 Otávio (Master Admin)
**Acessa:** Master Dashboard  
**Pode:**
- ✅ Gerenciar licenças de todas locadoras
- ✅ Ver heartbeats e status
- ✅ Receber pagamentos
- ✅ Suspender/ativar locadoras
- ✅ Ver estatísticas globais

**NÃO pode:**
- ❌ Acessar dados de locações das locadoras
- ❌ Ver clientes das locadoras
- ❌ Gerenciar produtos das locadoras

---

### 🔷 Admin da Locadora
**Acessa:** Painel Admin da Locadora  
**Pode:**
- ✅ Aprovar/rejeitar cadastros de clientes
- ✅ Gerenciar produtos
- ✅ Criar/editar locações
- ✅ Ver relatórios
- ✅ Gerenciar funcionários
- ✅ Configurar sistema

---

### 🔷 Funcionário da Locadora
**Acessa:** Painel de Funcionário  
**Pode:**
- ✅ Aprovar/rejeitar cadastros de clientes
- ✅ Criar locações
- ✅ Processar devoluções
- ✅ Ver pedidos

**NÃO pode:**
- ❌ Gerenciar produtos (apenas visualizar)
- ❌ Acessar configurações
- ❌ Ver relatórios financeiros completos

---

### 🔷 Cliente
**Acessa:** Site da Locadora  
**Pode:**
- ✅ Fazer cadastro com documentos
- ✅ Navegar produtos
- ✅ Fazer locações (após aprovação)
- ✅ Acompanhar pedidos

---

## 🎯 Fluxos Principais

### 1️⃣ Nova Locadora (Otávio)

```
1. Acesse Master Dashboard
2. Clique em "Nova Licença"
3. Preencha dados da locadora:
   - Nome da empresa
   - Dados do proprietário
   - Tipo de licença (Trial/Mensal/Anual)
   - Plano (usuários, produtos, pedidos)
4. Sistema gera licenseKey
5. Configure servidor da locadora
6. Ative licença com a key
```

📖 **Doc completa:** `SETUP-NOVA-LOCADORA.md`

---

### 2️⃣ Cadastro de Cliente

#### Cliente:
```
1. Acesse /cadastro
2. Preencha dados pessoais
3. Faça upload dos documentos:
   - CPF (PDF oficial)
   - RG ou CNH (com QR Code)
   - Comprovante de Endereço (no seu nome)
4. Revise e envie
5. Aguarde aprovação (1-2 dias)
```

#### Funcionário/Admin:
```
1. Acesse "Aprovações Pendentes"
2. Veja lista de cadastros
3. Para cada um:
   - Clique no card do cliente
   - Baixe e verifique documentos
   - Clique em "Aprovar" ou "Rejeitar"
   - Se rejeitar, informe o motivo
4. Cliente é notificado automaticamente
```

📖 **Doc completa:** `SISTEMA-CADASTRO-APROVACAO.md`

---

### 3️⃣ Criar Locação

```
1. Acesse "Novo Pedido" ou "Nova Locação"
2. Selecione cliente APROVADO
3. Adicione produtos:
   - Sistema verifica disponibilidade automaticamente
   - Escolha período (data início e fim)
   - Preço calculado automaticamente
4. Aplique descontos (se houver)
5. Revise e confirme
6. Sistema:
   - Atualiza inventário
   - Marca produto como RENTED
   - Cria pagamento pendente
```

📖 **Doc completa:** `CORRECOES-LOCACOES.md`

---

### 4️⃣ Processar Devolução

```
1. Acesse "Pedidos Ativos"
2. Encontre o pedido
3. Clique em "Processar Devolução"
4. Informe:
   - Data real de devolução
   - Condição do produto (boa/danificado)
5. Sistema calcula:
   - Dias de atraso (se houver)
   - Multa por atraso
   - Taxa de dano (se aplicável)
6. Confirme devolução
7. Sistema:
   - Atualiza status para RETURNED
   - Devolve produto ao inventário
   - Cria cobrança adicional (se houver multas)
```

📖 **Doc completa:** `CORRECOES-LOCACOES.md`

---

## 🛠️ Funcionalidades por Tela

### Painel Admin (Locadora)

#### Tab "Dashboard"
- 📊 Visão geral de métricas
- 💰 Receita do mês
- 📦 Produtos mais locados
- 👥 Novos clientes

#### Tab "Produtos"
- ➕ Adicionar novo produto
- ✏️ Editar produto existente
- 🗑️ Remover produto
- 📸 Upload de imagens
- 💵 Definir preços (diário/semanal/mensal)
- 📦 Controlar estoque

#### Tab "Clientes"
- 👀 Ver clientes aprovados
- 📋 Histórico de locações por cliente
- 📄 Documentos enviados
- ✉️ Informações de contato

#### Tab "Aprovações" ⭐ NOVO
- 🔔 Cadastros pendentes
- 📄 Ver documentos (download)
- ✅ Aprovar cadastro
- ❌ Rejeitar com motivo
- 📊 Estatísticas de aprovações

#### Tab "Locações"
- 🆕 Nova locação
- 📋 Listar todas locações
- 🔍 Filtrar por status
- ↩️ Processar devoluções
- 🧾 Ver detalhes do pedido

#### Tab "Pagamentos"
- 💳 Registrar pagamento
- 📊 Ver pendências
- 📈 Relatório financeiro

#### Tab "Configurações"
- 🎨 Personalizar cores
- 🖼️ Upload de logo
- ⚙️ Configurações gerais

---

### Master Dashboard (Otávio)

#### Tab "Visão Geral"
- 🏢 Total de locadoras
- 💰 Receita mensal
- ✅ Licenças ativas
- ⚠️ Licenças suspensas

#### Tab "Locadoras"
- 📋 Lista completa
- ➕ Adicionar nova
- ✏️ Editar licença
- 💳 Registrar pagamento
- 🔒 Suspender/ativar

#### Tab "Heartbeats"
- 💓 Status em tempo real
- ⏰ Último ping
- 📊 Uso de recursos
- ⚠️ Alertas

#### Tab "Financeiro"
- 💰 Faturas geradas
- 📊 Receita por locadora
- 📅 Calendário de pagamentos
- ⚠️ Inadimplentes

---

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
npm run dev              # Inicia dev server
npm run typecheck        # Valida TypeScript
npm test                 # Roda testes
```

### Banco de Dados
```bash
npx prisma studio        # Interface visual do banco
npx prisma generate      # Regenera Prisma Client
npx prisma migrate dev   # Nova migration
npx prisma db seed       # Popula dados de exemplo
```

### Produção
```bash
npm run build            # Build para produção
npm start                # Inicia servidor produção
```

### Deploy
```bash
git add .
git commit -m "mensagem"
git push origin main     # GitHub Actions faz deploy automático
```

---

## 📱 APIs Principais

### Autenticação
```typescript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Clientes
```typescript
GET    /api/clients                    # Listar aprovados
GET    /api/clients/pending            # Listar pendentes 🔒
POST   /api/clients/register           # Cadastro público
POST   /api/clients/:id/approve        # Aprovar 🔒
POST   /api/clients/:id/reject         # Rejeitar 🔒
GET    /api/clients/:id/documents/:docId/download  # Download 🔒
```

### Produtos
```typescript
GET    /api/products
GET    /api/products/:id
POST   /api/products                   # Criar 🔒
PUT    /api/products/:id               # Editar 🔒
DELETE /api/products/:id               # Deletar 🔒
```

### Pedidos (Locações)
```typescript
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders                     # Nova locação 🔒
POST   /api/orders/:id/return          # Devolver 🔒
PUT    /api/orders/:id                 # Atualizar 🔒
```

### Master (Otávio)
```typescript
GET    /api/master/licenses            # Listar 🔒
POST   /api/master/licenses            # Criar 🔒
PUT    /api/master/licenses/:id        # Atualizar 🔒
POST   /api/master/licenses/:id/suspend   # Suspender 🔒
POST   /api/master/licenses/:id/activate  # Ativar 🔒
POST   /api/master/heartbeat           # Receber heartbeat
```

🔒 = Requer autenticação

---

## 🆘 Problemas Comuns

### Erro: "Tenant ID obrigatório"
**Causa:** Middleware de tenant não configurado  
**Solução:** Certifique-se de enviar `x-tenant-id` no header

### Erro: "Cliente não aprovado"
**Causa:** Tentando fazer locação com cliente PENDING  
**Solução:** Aprove o cadastro primeiro em "Aprovações Pendentes"

### Erro: "Produto não disponível"
**Causa:** Produto já locado no período  
**Solução:** Escolha outro período ou produto

### Erro: "Licença inválida"
**Causa:** Licença vencida ou suspensa  
**Solução:** Entre em contato com Otávio para regularizar

### Upload falha
**Causa:** Arquivo muito grande ou não é PDF  
**Solução:** Use apenas PDFs com até 10MB

---

## 📊 Métricas e Relatórios

### Dashboard da Locadora
- Total de locações (mês)
- Receita (mês)
- Produtos mais locados
- Taxa de aprovação de clientes
- Locações ativas
- Produtos disponíveis

### Dashboard Master (Otávio)
- Total de locadoras ativas
- Receita mensal total
- Taxa de churn
- Inadimplência
- Status de heartbeats

---

## 🎨 Personalização

### Cores (Locadora)
```
1. Acesse "Configurações"
2. Tab "Aparência"
3. Escolha cores:
   - Cor primária (botões, links)
   - Cor secundária (acentos)
4. Preview em tempo real
5. Salvar
```

### Logo (Locadora)
```
1. Acesse "Configurações"
2. Tab "Branding"
3. Upload logo (PNG/JPG, max 2MB)
4. Salvar
5. Logo aparece em:
   - Header
   - Emails
   - Documentos
```

---

## 📚 Próximos Passos

### Após Setup Inicial
1. ✅ Personalizar cores e logo
2. ✅ Cadastrar produtos
3. ✅ Definir preços de locação
4. ✅ Convidar funcionários
5. ✅ Testar fluxo completo

### Integração Futura
- [ ] ClearSale (validação automática)
- [ ] Gateway de pagamento
- [ ] Email transacional
- [ ] SMS de notificação
- [ ] App mobile

---

## 🔗 Links Rápidos

- **📖 Documentação Completa:** `00-README-PRINCIPAL.md`
- **🏗️ Arquitetura SaaS:** `ARQUITETURA-SAAS-FINAL.md`
- **🔐 Licenciamento:** `SISTEMA-LICENCIAMENTO-COMPLETO.md`
- **📦 Locações:** `CORRECOES-LOCACOES.md`
- **👥 Cadastro:** `SISTEMA-CADASTRO-APROVACAO.md`
- **🗄️ Banco de Dados:** `SCHEMA.md`
- **🔄 Migrations:** `INSTRUCOES-MIGRATION.md`

---

## 💡 Dicas

### Performance
- Use índices no banco para buscas frequentes
- Cache de produtos em memória
- Paginação em listas grandes

### Segurança
- HTTPS obrigatório em produção
- Tokens JWT com expiração curta
- Rate limiting nas APIs
- Validação rigorosa de inputs

### UX
- Feedback visual em todas ações
- Loading states
- Mensagens de erro claras
- Confirmação em ações destrutivas

---

**🚀 Sistema pronto para uso! Qualquer dúvida, consulte a documentação detalhada.**

**Última atualização:** Outubro 2024

