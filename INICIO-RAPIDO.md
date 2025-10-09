# 🚀 Início Rápido - Sistema Command-D

## ⚡ 5 Minutos para Começar

### 1️⃣ Instale (1 min)
```bash
git clone [url-do-repo]
cd Sistema-Command-D
npm install
```

### 2️⃣ Configure (2 min)
```bash
# Copie o exemplo
cp .env.example .env

# Edite .env com:
# DATABASE_URL="postgresql://..."
# JWT_SECRET="seu-secret"
# LICENSE_API_KEY="sua-key"
```

### 3️⃣ Banco de Dados (1 min)
```bash
npx prisma migrate dev
npx prisma db seed
```

### 4️⃣ Inicie (1 min)
```bash
npm run dev
```

### 5️⃣ Acesse
```
🌐 http://localhost:8080

Login padrão:
Email: admin@example.com
Senha: admin123
```

---

## 🎯 Primeiros Passos

### Se você é Otávio (Master):
```
1. Acesse Master Dashboard
2. Crie sua primeira licença de teste
3. Leia: RESUMO-EXECUTIVO-OTAVIO.md
```

### Se você é Admin de Locadora:
```
1. Faça login no painel
2. Configure sua locadora (cores, logo)
3. Adicione seus primeiros produtos
4. Leia: GUIA-RAPIDO-USO.md
```

### Se você é Desenvolvedor:
```
1. Explore o código em client/ e server/
2. Leia: ARQUITETURA-SAAS-FINAL.md
3. Leia: SCHEMA.md
4. Faça sua primeira modificação
```

---

## 📚 Documentação Essencial

### 🏆 Top 5 Documentos

1. **[GUIA-RAPIDO-USO.md](GUIA-RAPIDO-USO.md)**  
   Como usar o sistema na prática

2. **[RESUMO-EXECUTIVO-OTAVIO.md](RESUMO-EXECUTIVO-OTAVIO.md)**  
   Visão executiva para o proprietário

3. **[SISTEMA-CADASTRO-APROVACAO.md](SISTEMA-CADASTRO-APROVACAO.md)**  
   Como aprovar cadastros de clientes

4. **[CORRECOES-LOCACOES.md](CORRECOES-LOCACOES.md)**  
   Sistema de locações completo

5. **[IMPLEMENTACAO-FINALIZADA.md](IMPLEMENTACAO-FINALIZADA.md)**  
   Tudo que foi implementado

### 📖 Índices Navegáveis

- **[INDICE-COMPLETO.md](INDICE-COMPLETO.md)** - Índice de toda documentação
- **[00-README-PRINCIPAL.md](00-README-PRINCIPAL.md)** - Índice organizado por categoria

---

## 🎨 Funcionalidades Principais

### ✅ O Que o Sistema Faz

#### Para Otávio (Master)
```
✅ Cria e gerencia licenças de locadoras
✅ Monitora heartbeats em tempo real
✅ Cobra mensalidades automaticamente
✅ Suspende inadimplentes automaticamente
✅ Dashboard com visão geral de todas locadoras
✅ NÃO tem acesso aos dados das locadoras
```

#### Para Locadoras
```
✅ Cadastra produtos para locação
✅ Recebe cadastros de clientes com documentos
✅ Aprova/rejeita cadastros manualmente
✅ Cria locações com verificação de disponibilidade
✅ Calcula preços automaticamente (diário/semanal/mensal)
✅ Processa devoluções com multas de atraso
✅ Gerencia pagamentos
✅ Emite NFSe (Belo Horizonte)
✅ Gera relatórios
```

#### Para Clientes
```
✅ Faz cadastro com upload de documentos PDF
✅ Aguarda aprovação (1-2 dias)
✅ Navega produtos disponíveis
✅ Faz locações online
✅ Acompanha status dos pedidos
```

---

## 🔐 Usuários e Senhas Padrão

### Após `npm run seed`:

```
Admin da Locadora:
📧 admin@example.com
🔑 admin123

Funcionário:
📧 employee@example.com
🔑 employee123

Cliente de Teste:
📧 client@example.com
🔑 client123
```

⚠️ **IMPORTANTE:** Altere estas senhas em produção!

---

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
npm run dev              # Servidor dev (hot reload)
npm run typecheck        # Validar TypeScript
npm test                 # Rodar testes
```

### Banco de Dados
```bash
npx prisma studio        # Interface visual
npx prisma generate      # Regenerar cliente
npx prisma migrate dev   # Nova migration
npx prisma db seed       # Dados de exemplo
```

### Produção
```bash
npm run build            # Build otimizado
npm start                # Servidor produção
```

---

## 📊 Estrutura do Projeto

```
Sistema-Command-D/
├── client/              Frontend React
│   ├── components/      Componentes UI
│   ├── pages/           Páginas/rotas
│   ├── context/         Contexts (Auth, Tenant, etc)
│   └── hooks/           Custom hooks
│
├── server/              Backend Express
│   ├── routes/          Endpoints da API
│   ├── lib/             Lógica de negócio
│   ├── middleware/      Middlewares
│   └── jobs/            Background jobs
│
├── prisma/              Banco de dados
│   ├── schema.prisma    Schema tenants
│   └── schema-master... Schema master
│
├── uploads/             Documentos (PDFs)
└── docs/                Docs técnicas
```

---

## 🎯 Fluxos Rápidos

### Criar Nova Locadora
```
1. Acesse Master Dashboard
2. Nova Licença → Preencha dados
3. Copie License Key gerada
4. Configure servidor da locadora
5. Ative com a key
```

### Aprovar Cadastro de Cliente
```
1. Painel Admin → Tab "Aprovações"
2. Veja cadastros pendentes
3. Baixe e verifique documentos
4. Clique "Aprovar" ou "Rejeitar"
```

### Criar Locação
```
1. Painel Admin → "Nova Locação"
2. Selecione cliente aprovado
3. Adicione produtos
4. Escolha período
5. Confirme
```

### Processar Devolução
```
1. Painel Admin → "Pedidos Ativos"
2. Selecione pedido
3. "Processar Devolução"
4. Informe data e condição
5. Sistema calcula multas automaticamente
6. Confirme
```

---

## 📱 Acessos Rápidos

### URLs Principais
```
Frontend:           http://localhost:8080
API:                http://localhost:8080/api
Prisma Studio:      npx prisma studio
```

### Principais Endpoints
```
POST /api/auth/login
GET  /api/products
POST /api/orders
GET  /api/clients/pending
POST /api/clients/:id/approve
```

---

## 🆘 Problemas Comuns

### "Cannot connect to database"
```bash
# Verifique DATABASE_URL no .env
# Certifique-se que PostgreSQL está rodando
```

### "License invalid"
```bash
# Verifique LICENSE_API_KEY no .env
# Certifique-se que MASTER_API_URL está correto
```

### "Upload failed"
```bash
# Verifique permissões da pasta uploads/
chmod 755 uploads/
```

### "Cannot find module"
```bash
npm install
npx prisma generate
```

---

## 📚 Documentação Completa

### Por Perfil
- **Otávio:** [RESUMO-EXECUTIVO-OTAVIO.md](RESUMO-EXECUTIVO-OTAVIO.md)
- **Admin:** [GUIA-RAPIDO-USO.md](GUIA-RAPIDO-USO.md)
- **Dev:** [ARQUITETURA-SAAS-FINAL.md](ARQUITETURA-SAAS-FINAL.md)

### Por Funcionalidade
- **Licenciamento:** [SISTEMA-LICENCIAMENTO-COMPLETO.md](SISTEMA-LICENCIAMENTO-COMPLETO.md)
- **Locações:** [CORRECOES-LOCACOES.md](CORRECOES-LOCACOES.md)
- **Cadastros:** [SISTEMA-CADASTRO-APROVACAO.md](SISTEMA-CADASTRO-APROVACAO.md)

### Por Tarefa
- **Deploy:** [GUIA-DEPLOY-AWS.md](GUIA-DEPLOY-AWS.md)
- **Migrations:** [INSTRUCOES-MIGRATION.md](INSTRUCOES-MIGRATION.md)
- **Schema:** [SCHEMA.md](SCHEMA.md)

### Índice Completo
- **[INDICE-COMPLETO.md](INDICE-COMPLETO.md)** - Todos os docs organizados

---

## ✅ Checklist Inicial

### Setup Básico
- [ ] Instalei dependências (`npm install`)
- [ ] Configurei .env
- [ ] Rodei migrations (`npx prisma migrate dev`)
- [ ] Rodei seed (`npx prisma db seed`)
- [ ] Iniciei servidor (`npm run dev`)
- [ ] Acessei em http://localhost:8080
- [ ] Fiz login com admin@example.com

### Primeira Configuração
- [ ] Alterei senha padrão
- [ ] Personalizei cores
- [ ] Upload de logo
- [ ] Cadastrei primeiro produto
- [ ] Testei cadastro de cliente
- [ ] Testei aprovação de cadastro
- [ ] Testei criação de locação

### Documentação
- [ ] Li GUIA-RAPIDO-USO.md
- [ ] Li documento específico para meu perfil
- [ ] Explorei INDICE-COMPLETO.md
- [ ] Salvei documentos importantes como favoritos

---

## 🚀 Próximos Passos

### Depois do Setup
1. ✅ Personalize sua locadora (cores, logo)
2. ✅ Cadastre seus produtos
3. ✅ Teste o fluxo completo
4. ✅ Convide funcionários
5. ✅ Leia docs específicas para seu caso

### Para Produção
1. ✅ Leia [GUIA-DEPLOY-AWS.md](GUIA-DEPLOY-AWS.md)
2. ✅ Configure servidor AWS
3. ✅ Configure domínio
4. ✅ Configure HTTPS
5. ✅ Faça backup do banco
6. ✅ Teste tudo em staging
7. ✅ Deploy em produção

---

## 💡 Dicas

### Performance
- Use índices no banco para buscas frequentes
- Cache produtos populares em memória
- Pagine listas grandes

### Segurança
- Sempre use HTTPS em produção
- Troque senhas padrão
- Configure firewall no servidor
- Faça backup regular

### UX
- Dê feedback visual em todas ações
- Mostre loading states
- Escreva mensagens de erro claras
- Confirme ações destrutivas

---

## 🎉 Está Pronto!

O sistema está **100% funcional**!

**Próximo passo:** Comece a usar e explorar todas as funcionalidades!

---

**📖 Precisa de ajuda? Consulte [INDICE-COMPLETO.md](INDICE-COMPLETO.md)**

**Última atualização:** Outubro 2024

