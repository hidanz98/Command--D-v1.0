# 🔑 SISTEMA DE LICENCIAMENTO COMMAND-D

## 📋 VISÃO GERAL

O Command-D é um sistema **SaaS Multi-Tenant Isolado** onde:

- **Otávio** (você): Dono do sistema, gerencia licenças e recebe mensalidades
- **Locadoras**: Clientes que alugam o sistema, cada uma com servidor AWS próprio
- **Isolamento total**: Cada locadora tem banco de dados separado e privado
- **Sem acesso aos dados**: Você não vê locações, clientes ou financeiro das locadoras

---

## 🏗️ ARQUITETURA

```
┌─────────────────────────────────────────────┐
│  SERVIDOR MASTER (Otávio)                   │
│  https://master.command-d.com.br            │
│                                             │
│  ✅ Banco Master (PostgreSQL)               │
│  ✅ API de Licenciamento                    │
│  ✅ Dashboard de Administração              │
│  ✅ Sistema de Billing                      │
│  ✅ Monitoramento (Heartbeat)               │
└─────────────────────────────────────────────┘
              │
              │ Validação de Licença
              │ Heartbeat (5min)
              │ Billing mensal
              ↓
  ┌───────────┴───────────┬────────────────┐
  │                       │                │
  ▼                       ▼                ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ LOCADORA A     │  │ LOCADORA B     │  │ LOCADORA C     │
│ servidor A.aws │  │ servidor B.aws │  │ servidor C.aws │
│                │  │                │  │                │
│ Banco isolado  │  │ Banco isolado  │  │ Banco isolado  │
│ Dados privados │  │ Dados privados │  │ Dados privados │
└────────────────┘  └────────────────┘  └────────────────┘
```

---

## 🎯 FLUXO DE CONTRATAÇÃO

### 1. Nova Locadora Contrata

1. Locadora entra em contato com você (Otávio)
2. Você coleta informações:
   - Nome da empresa
   - CNPJ
   - Nome do dono
   - Email e telefone
   - Plano escolhido (Trial/Basic/Pro/Enterprise)

### 2. Você Cria a Licença

```bash
# No seu servidor master
curl -X POST https://master.command-d.com.br/api/master/licenses \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Bil'\''s Cinema",
    "cnpj": "12.345.678/0001-90",
    "ownerName": "Bil Silva",
    "ownerEmail": "bil@bilscinema.com",
    "ownerPhone": "(31) 99999-9999",
    "plan": "TRIAL",
    "subdomain": "bilscinema"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "license": { ... },
    "credentials": {
      "apiKey": "cmd_a1b2c3d4e5f6g7h8i9j0",
      "apiSecret": "secret_xxxxxxxxxxxxxxxxxx",
      "licenseKey": "LICENSE-ABCD1234EFGH5678"
    }
  }
}
```

⚠️ **IMPORTANTE**: As credenciais aparecem apenas 1 vez! Copie e envie para o cliente.

### 3. Provisionar Servidor AWS

```bash
# Criar EC2 para a locadora
# Tipo: t3.medium (2 vCPU, 4GB RAM)
# OS: Ubuntu 22.04
# Storage: 30GB SSD

# Conectar no servidor
ssh -i key.pem ubuntu@IP_DO_SERVIDOR

# Baixar script de instalação
wget https://raw.githubusercontent.com/seu-usuario/comando-d/main/scripts/setup-locadora.sh

# Executar instalação
bash setup-locadora.sh
```

O script irá pedir:
- API Key (fornecida no passo 2)
- API Secret (fornecida no passo 2)
- Senha do banco de dados
- Outras configurações

### 4. Sistema Pronto!

A locadora já pode acessar:
```
https://bilscinema.command-d.com.br
```

---

## 💰 PLANOS E PREÇOS

### Trial (30 dias grátis)
- **Preço**: R$ 0/mês
- **Usuários**: 3
- **Produtos**: 50
- **Features**: Todas exceto parcerias
- **Duração**: 30 dias

### Basic
- **Preço**: R$ 200/mês
- **Usuários**: 3
- **Produtos**: 100
- **Features**: Completo
- **Suporte**: Email

### Pro
- **Preço**: R$ 500/mês
- **Usuários**: 10
- **Produtos**: 500
- **Features**: Completo + Parcerias
- **Suporte**: Email + WhatsApp

### Enterprise
- **Preço**: R$ 1.000/mês
- **Usuários**: Ilimitado
- **Produtos**: Ilimitado
- **Features**: Tudo + Customizações
- **Suporte**: Prioritário + Consultoria

---

## 🔒 VALIDAÇÃO DE LICENÇA

Toda request da locadora passa por validação:

```typescript
// middleware/licenseValidation.ts

1. Extrai LICENSE_API_KEY do .env da locadora
2. Faz request no servidor master
3. Verifica status da licença:
   - ACTIVE ✅ → Permite acesso
   - TRIAL ⏳ → Permite, mas avisa se próximo de expirar
   - SUSPENDED ❌ → Bloqueia (pagamento atrasado)
   - EXPIRED ❌ → Bloqueia (trial ou licença expirou)
   - CANCELLED ❌ → Bloqueia (cancelado)
4. Atualiza heartbeat (última vez online)
```

### Heartbeat Automático

A cada 5 minutos, cada locadora envia:

```json
{
  "version": "1.0.0",
  "uptime": 3600,
  "memory": { "rss": 150, "heapUsed": 80 },
  "stats": {
    "totalProducts": 45,
    "totalActiveUsers": 3,
    "totalOrders": 128
  }
}
```

**O que você (Otávio) consegue ver:**
- ✅ Sistema está online
- ✅ Versão instalada
- ✅ Quantidade de produtos/usuários (para verificar limites do plano)
- ✅ Performance geral

**O que você NÃO vê:**
- ❌ Dados de clientes
- ❌ Valores de locações
- ❌ Informações financeiras
- ❌ Nada operacional

---

## 🤖 AUTOMAÇÕES

### Job: License Checker (roda no servidor master)

**Executa a cada 1 hora:**

1. **Expirar trials**
   - Busca trials com `trialEndsAt < hoje`
   - Muda status para `EXPIRED`
   - Envia email para a locadora

2. **Suspender por falta de pagamento**
   - Busca licenças com pagamento atrasado >7 dias
   - Muda status para `SUSPENDED`
   - Sistema da locadora é bloqueado
   - Envia email

3. **Detectar sistemas offline**
   - Busca licenças sem heartbeat há >24h
   - Envia alerta para você

4. **Gerar faturas** (dia 1º de cada mês)
   - Gera fatura para cada licença ativa
   - Cria payment pendente
   - Envia email com boleto

---

## 💳 BILLING (COBRANÇAS)

### Fluxo de Pagamento

1. **Dia 1º do mês**: Sistema gera fatura automática
2. **Vencimento**: Dia 10 de cada mês
3. **Tolerância**: 7 dias após vencimento
4. **Ação**: Se não pagar em 7 dias → Suspender

### Registrar Pagamento

```bash
# Quando a locadora pagar
curl -X POST https://master.command-d.com.br/api/master/payments \
  -H "Content-Type: application/json" \
  -d '{
    "licenseHolderId": "clic123",
    "amount": 500,
    "referenceMonth": "2024-01-01",
    "paymentMethod": "PIX",
    "transactionId": "PIX123456"
  }'
```

Sistema automaticamente:
- ✅ Marca payment como `PAID`
- ✅ Atualiza `licenseStatus` para `ACTIVE`
- ✅ Define próximo pagamento (mês seguinte)
- ✅ Incrementa `totalRevenue`
- ✅ Reativa sistema da locadora

---

## 📊 DASHBOARD MASTER (Seu Painel)

Acesse: `https://master.command-d.com.br/master`

### Visão Geral

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Total Licenças  │ Receita Total   │ Sistemas Online │ Alertas         │
│      42         │  R$ 18.500/mês  │      39         │      3          │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### Lista de Licenças

Para cada locadora, você vê:
- Nome da empresa
- Plano contratado
- Status (Ativo/Trial/Suspenso)
- Online/Offline
- Último pagamento
- Próximo vencimento
- Receita total gerada
- Ações (suspender, ativar, editar)

### Filtros

- Por status (Ativo, Trial, Suspenso, Expirado)
- Por plano (Basic, Pro, Enterprise)
- Busca por nome/email/subdomain

---

## 🤝 SISTEMA DE PARCERIAS (OPCIONAL)

Permite que 2 locadoras compartilhem **apenas cadastro básico de clientes**.

### Como Funciona

1. Locadora A solicita parceria com Locadora B
2. Você (Otávio) aprova a parceria
3. Ambas podem buscar clientes cadastrados na outra
4. Podem importar dados básicos (nome, CPF, telefone, email)
5. **NUNCA** compartilha histórico de locações ou valores

### Exemplo

**Bil's Cinema** tem cliente "João Producer".  
**Cabeça de Efeito** faz parceria.  
Cabeça pode ver: "João Producer - CPF 123.456.789-10 - Tel (31) 99999-9999"  
Cabeça **NÃO** vê: Quanto João gastou, o que alugou, quando alugou.

### Habilitar Parcerias

No servidor master:
```bash
curl -X POST https://master.command-d.com.br/api/master/partnerships \
  -H "Content-Type: application/json" \
  -d '{
    "partnerFromId": "licenseIdA",
    "partnerToId": "licenseIdB",
    "status": "ACTIVE",
    "shareClientData": true,
    "allowCrossRental": false
  }'
```

---

## 🚀 DEPLOY E ATUALIZAÇÕES

### Deploy Automático (GitHub Actions)

Quando você faz push no repositório:

1. GitHub Actions detecta
2. Faz build do sistema
3. Envia para **todas** as locadoras ativas
4. Reinicia aplicações
5. Envia notificação

### Atualização Manual

```bash
# Em cada servidor da locadora
cd /home/ubuntu/app
git pull origin main
npm install
npm run build
npx prisma migrate deploy
pm2 restart command-d
```

---

## 📞 SUPORTE

### Para Locadoras

**Email**: suporte@command-d.com.br  
**WhatsApp**: (31) 99999-9999  
**Horário**: Seg-Sex 9h-18h

### Sistema de Tickets

Locadoras podem abrir tickets pelo sistema:

```bash
POST /api/support/tickets
{
  "subject": "Erro ao gerar relatório",
  "description": "...",
  "priority": "HIGH"
}
```

Você recebe notificação e pode responder pelo dashboard.

---

## 🔐 SEGURANÇA

### Variáveis Sensíveis

- `LICENSE_API_KEY`: Pública, identifica a instalação
- `LICENSE_API_SECRET`: Privada, NUNCA expor
- `MASTER_DATABASE_URL`: Apenas no seu servidor master
- `DATABASE_URL`: Cada locadora tem a sua

### Criptografia

- Senhas: bcrypt (10 rounds)
- JWT: HS256
- API Secret: SHA-256
- HTTPS: Obrigatório em produção

### Auditoria

Todas as ações são logadas:
- Criação de licença
- Suspensões/ativações
- Pagamentos recebidos
- Mudanças de plano
- Acesso ao dashboard

---

## 💡 COMANDOS ÚTEIS

### Ver Status de uma Licença

```bash
curl https://master.command-d.com.br/api/master/licenses?search=bilscinema
```

### Suspender Licença

```bash
curl -X POST https://master.command-d.com.br/api/master/licenses/{id}/suspend \
  -d '{"reason": "Pagamento atrasado"}'
```

### Ativar Licença

```bash
curl -X POST https://master.command-d.com.br/api/master/licenses/{id}/activate
```

### Ver Dashboard

```bash
curl https://master.command-d.com.br/api/master/dashboard
```

---

## 📈 RELATÓRIOS

### Receita Mensal

```sql
SELECT 
  DATE_TRUNC('month', "paidAt") as mes,
  SUM(amount) as total
FROM payments
WHERE status = 'PAID'
GROUP BY mes
ORDER BY mes DESC;
```

### Taxa de Conversão (Trial → Pago)

```sql
SELECT 
  COUNT(CASE WHEN "licenseStatus" = 'ACTIVE' THEN 1 END) as convertidos,
  COUNT(CASE WHEN "licenseStatus" = 'EXPIRED' THEN 1 END) as nao_convertidos,
  ROUND(
    COUNT(CASE WHEN "licenseStatus" = 'ACTIVE' THEN 1 END)::numeric / 
    COUNT(*)::numeric * 100, 
    2
  ) as taxa_conversao
FROM license_holders
WHERE plan = 'TRIAL';
```

---

## ❓ FAQ

### Como adicionar uma nova locadora?
Ver seção "Fluxo de Contratação" acima.

### O que fazer se uma locadora não pagar?
Sistema suspende automaticamente após 7 dias de atraso.

### Posso ver os dados das locadoras?
NÃO. Cada locadora tem banco isolado. Você só vê status de licença e pagamentos.

### Como fazer backup?
Cada locadora é responsável pelo próprio backup. Você pode oferecer backup automático como serviço adicional.

### E se o servidor master cair?
As locadoras continuam funcionando (failsafe). Mas não conseguem validar licença até o master voltar.

---

## 🎉 PRONTO!

Agora você tem um sistema SaaS completo de licenciamento!

**Próximos passos:**
1. ✅ Configurar servidor master
2. ✅ Adicionar primeira locadora (trial)
3. ✅ Testar fluxo completo
4. ✅ Configurar gateway de pagamento
5. ✅ Configurar emails automáticos
6. ✅ Começar a crescer! 🚀

