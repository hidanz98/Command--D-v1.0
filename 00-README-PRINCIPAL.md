# 🚀 Sistema Command-D - Locadora Multi-Tenant SaaS

## 📖 Índice de Documentação

### 🎯 Comece por Aqui
- **[00-COMECE-AQUI.md](00-COMECE-AQUI.md)** - Visão geral do projeto completo
- **Este arquivo** - Índice navegável de toda documentação

---

## 📚 Documentação por Categoria

### 1️⃣ Arquitetura e Licenciamento

#### **Sistema Multi-Tenant SaaS**
- **[ARQUITETURA-SAAS-FINAL.md](ARQUITETURA-SAAS-FINAL.md)** ⭐
  - Arquitetura completa do SaaS
  - Separação Otávio (Master) vs Locadoras
  - Servidores e bancos independentes
  - Sistema de licenciamento

#### **Licenciamento Completo**
- **[SISTEMA-LICENCIAMENTO-COMPLETO.md](SISTEMA-LICENCIAMENTO-COMPLETO.md)** ⭐
  - Guia técnico completo do licenciamento
  - Heartbeat automático
  - Validação de licenças
  - Billing automático

- **[README-LICENCIAMENTO.md](README-LICENCIAMENTO.md)**
  - Resumo executivo do licenciamento

- **[LICENCIAMENTO.md](LICENCIAMENTO.md)**
  - Documentação técnica detalhada

- **[INDICE-LICENCIAMENTO.md](INDICE-LICENCIAMENTO.md)**
  - Navegação pelos docs de licenciamento

#### **Setup e Deploy**
- **[SETUP-NOVA-LOCADORA.md](SETUP-NOVA-LOCADORA.md)**
  - Passo a passo para criar nova locadora
  - Provisionamento de servidor
  - Ativação de licença

- **[GUIA-DEPLOY-AWS.md](GUIA-DEPLOY-AWS.md)**
  - Deploy em AWS EC2
  - Configuração de servidor
  - Ambiente de produção

- **[SETUP-RAPIDO-GIT-AWS.md](SETUP-RAPIDO-GIT-AWS.md)**
  - Setup rápido Git + AWS
  - GitHub Actions
  - CI/CD automatizado

- **[CONFIGURAR-GIT-SEGURO.md](CONFIGURAR-GIT-SEGURO.md)**
  - Configuração segura do Git
  - Proteção de branches
  - Boas práticas

---

### 2️⃣ Funcionalidades Principais

#### **Sistema de Locações (Rentals)** ⭐
- **[CORRECOES-LOCACOES.md](CORRECOES-LOCACOES.md)**
  - Sistema de locações **COMPLETO E FUNCIONAL**
  - Verificação de disponibilidade
  - Gestão de inventário
  - Cálculo dinâmico de preços
  - Sistema de devolução com multas
  - Transações atômicas

- **[TESTE-LOCACOES.md](TESTE-LOCACOES.md)**
  - Plano de testes das locações
  - Problemas identificados e corrigidos

#### **Sistema de Cadastro com Aprovação** ⭐
- **[SISTEMA-CADASTRO-APROVACAO.md](SISTEMA-CADASTRO-APROVACAO.md)**
  - Cadastro de clientes com documentos PDF
  - Validação de documentos oficiais
  - Aprovação manual por funcionários
  - Dashboard de aprovação
  - Preparado para ClearSale (fase 2)

#### **NFSe - Nota Fiscal de Serviço**
- **[docs/NFSe-PBH-Integracao.md](docs/NFSe-PBH-Integracao.md)**
  - Integração com NFSe Belo Horizonte
  - API SOAP
  - Geração de XML

- **[docs/NFSe-Sistema-Resiliente.md](docs/NFSe-Sistema-Resiliente.md)**
  - Sistema resiliente de emissão
  - Fila de processamento
  - Auto-atualização

- **[docs/Codigos-Servico-NFSe.md](docs/Codigos-Servico-NFSe.md)**
  - Códigos de serviço NFSe

---

### 3️⃣ Banco de Dados

- **[README-DATABASE.md](README-DATABASE.md)**
  - Estrutura do banco de dados
  - Schema Prisma
  - Modelos principais
  - Relacionamentos

---

### 4️⃣ Planejamento e Análise

- **[PLANO-IMPLEMENTACAO-IMEDIATO.md](PLANO-IMPLEMENTACAO-IMEDIATO.md)**
  - Plano de ação imediato
  - Prioridades

- **[ANALISE-COMPLETA-SISTEMA.md](ANALISE-COMPLETA-SISTEMA.md)**
  - Análise completa do sistema
  - Funcionalidades existentes

- **[ARQUITETURA-DISTRIBUIDA.md](ARQUITETURA-DISTRIBUIDA.md)**
  - Arquitetura distribuída
  - Escalabilidade

---

### 5️⃣ Testes

- **[TESTE-LICENCIAMENTO.md](TESTE-LICENCIAMENTO.md)**
  - Plano de testes completo do licenciamento
  - Cenários de teste
  - Casos de uso

- **[TESTE-LOCACOES.md](TESTE-LOCACOES.md)**
  - Testes do sistema de locações

---

### 6️⃣ Documentação Técnica

- **[README.md](README.md)**
  - README principal do projeto Fusion Starter
  - Stack tecnológica
  - Comandos de desenvolvimento

- **[AGENTS.md](AGENTS.md)**
  - Documentação de agentes (se aplicável)

- **[IMPLEMENTACAO-CONCLUIDA.md](IMPLEMENTACAO-CONCLUIDA.md)**
  - Resumo das implementações concluídas

---

## 🎯 Fluxos Principais

### Para Otávio (Master Admin)
```
1. Acessa Master Dashboard
2. Gerencia licenças das locadoras
3. Monitora heartbeats
4. Recebe pagamentos
5. Suspende/ativa licenças
```
📖 Documentação: `ARQUITETURA-SAAS-FINAL.md`, `SISTEMA-LICENCIAMENTO-COMPLETO.md`

---

### Para Locadora (Tenant)
```
1. Servidor próprio instalado
2. Licença ativada e validada
3. Heartbeat automático para master
4. Sistema operacional:
   - Gestão de produtos
   - Cadastro de clientes (com aprovação)
   - Locações (rentals)
   - Pagamentos
   - Relatórios
   - NFSe
```
📖 Documentação: `SETUP-NOVA-LOCADORA.md`, `CORRECOES-LOCACOES.md`, `SISTEMA-CADASTRO-APROVACAO.md`

---

### Para Cliente Final
```
1. Acessa site da locadora
2. Faz cadastro com documentos PDF
3. Aguarda aprovação (1-2 dias)
4. Navega e faz locações
5. Acompanha pedidos
```
📖 Documentação: `SISTEMA-CADASTRO-APROVACAO.md`

---

### Para Funcionário da Locadora
```
1. Login no painel admin
2. Dashboard de aprovações pendentes
3. Analisa documentos dos clientes
4. Aprova ou rejeita cadastros
5. Gerencia produtos e locações
6. Gera relatórios
```
📖 Documentação: `SISTEMA-CADASTRO-APROVACAO.md`, `CORRECOES-LOCACOES.md`

---

## 🛠️ Stack Tecnológica

### Backend
- **Node.js** + **Express.js**
- **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **JWT** para autenticação
- **Multer** para upload de arquivos

### Frontend
- **React 18** + **TypeScript**
- **Vite** (dev/build)
- **React Router 6** (SPA mode)
- **TailwindCSS 3**
- **Radix UI** (componentes)
- **Lucide React** (ícones)

### Infraestrutura
- **AWS EC2** (servidores)
- **GitHub Actions** (CI/CD)
- **PostgreSQL** (bancos separados)
- **Git** (controle de versão)

---

## 🚀 Começando

### 1. Clone o Repositório
```bash
git clone [url-do-repo]
cd Sistema-Command-D
```

### 2. Instale Dependências
```bash
npm install
```

### 3. Configure Variáveis de Ambiente
```bash
cp .env.example .env
# Edite .env com suas configurações
```

### 4. Configure o Banco de Dados
```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Inicie o Servidor de Desenvolvimento
```bash
npm run dev
```

### 6. Acesse
```
http://localhost:8080
```

---

## 📦 Estrutura do Projeto

```
Sistema-Command-D/
├── client/                    # Frontend React
│   ├── components/            # Componentes React
│   ├── context/               # Contexts (Auth, Tenant, etc)
│   ├── hooks/                 # Custom hooks
│   ├── pages/                 # Páginas/rotas
│   └── lib/                   # Utilitários
│
├── server/                    # Backend Express
│   ├── routes/                # Endpoints da API
│   ├── lib/                   # Lógica de negócio
│   ├── middleware/            # Middlewares
│   └── jobs/                  # Background jobs
│
├── prisma/                    # Banco de dados
│   ├── schema.prisma          # Schema principal (tenants)
│   ├── schema-master.prisma   # Schema do master (Otávio)
│   └── seed.ts                # Dados iniciais
│
├── docs/                      # Documentação técnica
├── scripts/                   # Scripts de deploy
└── [documentação].md          # Arquivos de documentação
```

---

## ✅ Status das Funcionalidades

### ✅ Completo e Funcional
- [x] **Licenciamento Multi-Tenant SaaS**
- [x] **Sistema de Locações (Rentals)**
- [x] **Cadastro de Clientes com Aprovação**
- [x] **Gestão de Produtos**
- [x] **Gestão de Pedidos**
- [x] **Sistema de Pagamentos**
- [x] **Autenticação e Autorização (RBAC)**
- [x] **Dashboard Admin**
- [x] **Dashboard Master (Otávio)**
- [x] **Notificações**
- [x] **Upload de Documentos PDF**
- [x] **Validação de PDFs Oficiais**

### ⏳ Em Desenvolvimento / Futuro
- [ ] Integração ClearSale (fase 2)
- [ ] OCR para extrair dados de PDFs
- [ ] Verificação automática de QR Codes
- [ ] Dashboard de estatísticas avançado
- [ ] App mobile

---

## 🔐 Segurança

### Implementada
- ✅ JWT para autenticação
- ✅ Role-based access control (RBAC)
- ✅ Validação de licenças em tempo real
- ✅ Upload seguro de arquivos
- ✅ Validação de PDFs oficiais
- ✅ Hash SHA-256 de documentos
- ✅ Proteção contra path traversal
- ✅ Tenant isolation (multi-tenant)
- ✅ Transações atômicas no banco

---

## 📊 Ambientes

### Desenvolvimento
```bash
npm run dev
```
- Hot reload frontend/backend
- Porta: 8080

### Produção
```bash
npm run build
npm start
```
- Build otimizado
- Servidor Express standalone

---

## 🆘 Suporte

### Problemas Comuns
1. **Erro de conexão com banco**: Verifique `DATABASE_URL` no `.env`
2. **Licença inválida**: Verifique `LICENSE_API_KEY` e `MASTER_API_URL`
3. **Upload de arquivo falha**: Verifique permissões da pasta `uploads/`
4. **Erro de build**: Execute `npm install` novamente

### Documentação Relevante
- Problemas com licenciamento → `SISTEMA-LICENCIAMENTO-COMPLETO.md`
- Problemas com locações → `CORRECOES-LOCACOES.md`
- Problemas com cadastro → `SISTEMA-CADASTRO-APROVACAO.md`
- Problemas com deploy → `GUIA-DEPLOY-AWS.md`

---

## 🎓 Documentação para Novos Desenvolvedores

### Ordem de Leitura Recomendada

1. **[00-COMECE-AQUI.md](00-COMECE-AQUI.md)** - Visão geral
2. **[README.md](README.md)** - Tech stack e comandos
3. **[ARQUITETURA-SAAS-FINAL.md](ARQUITETURA-SAAS-FINAL.md)** - Arquitetura multi-tenant
4. **[SISTEMA-LICENCIAMENTO-COMPLETO.md](SISTEMA-LICENCIAMENTO-COMPLETO.md)** - Sistema de licenças
5. **[CORRECOES-LOCACOES.md](CORRECOES-LOCACOES.md)** - Sistema de locações
6. **[SISTEMA-CADASTRO-APROVACAO.md](SISTEMA-CADASTRO-APROVACAO.md)** - Cadastro de clientes
7. **[README-DATABASE.md](README-DATABASE.md)** - Estrutura do banco

---

## 📞 Contatos

**Proprietário do Sistema:** Otávio  
**Produto:** Command-D - Sistema de Locação Multi-Tenant

---

## 📝 Changelog

### v1.0.0 (Atual)
- ✅ Sistema multi-tenant SaaS completo
- ✅ Licenciamento automático
- ✅ Sistema de locações funcional
- ✅ Cadastro com aprovação manual
- ✅ Validação de documentos PDF
- ✅ Dashboard de aprovações
- ✅ Deploy automatizado

---

## 🎯 Roadmap

### Q1 2024
- [ ] Integração ClearSale
- [ ] App mobile (React Native)
- [ ] OCR de documentos

### Q2 2024
- [ ] Analytics avançado
- [ ] Relatórios customizáveis
- [ ] API pública para integrações

---

## 📄 Licença

Proprietário: Otávio  
Todos os direitos reservados.

---

**Última atualização:** Outubro 2024  
**Versão da documentação:** 1.0.0

