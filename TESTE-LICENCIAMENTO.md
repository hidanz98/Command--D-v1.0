# 🧪 TESTE DO SISTEMA DE LICENCIAMENTO

Este documento contém todos os testes para validar o sistema de licenciamento.

---

## ✅ PRÉ-REQUISITOS

Antes de começar os testes:

```bash
# 1. Servidor Master rodando
# Com MASTER_DATABASE_URL configurada

# 2. Instalar dependências
npm install

# 3. Gerar cliente Prisma Master
npx prisma generate --schema=prisma/schema-master.prisma

# 4. Rodar migrações do Master
npx prisma migrate deploy --schema=prisma/schema-master.prisma

# 5. Rodar migrações do sistema normal
npx prisma migrate deploy

# 6. Iniciar servidor
npm run dev
```

---

## 🧪 TESTE 1: CRIAR LICENÇA

### Objetivo
Criar uma nova licença no sistema master

### Passos

```bash
curl -X POST http://localhost:8080/api/master/licenses \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Locadora Teste LTDA",
    "cnpj": "12.345.678/0001-90",
    "ownerName": "João Teste",
    "ownerEmail": "joao@locadorateste.com",
    "ownerPhone": "(11) 99999-9999",
    "plan": "TRIAL",
    "subdomain": "locadorateste"
  }'
```

### Resultado Esperado

```json
{
  "success": true,
  "data": {
    "license": {
      "id": "...",
      "companyName": "Locadora Teste LTDA",
      "licenseStatus": "TRIAL",
      "plan": "TRIAL",
      ...
    },
    "credentials": {
      "apiKey": "cmd_xxxxxxxxxxxxxxxx",
      "apiSecret": "secret_xxxxxxxxxxxxxxxx",
      "licenseKey": "LICENSE-XXXXXXXX"
    }
  }
}
```

✅ **Verificações:**
- [ ] Status code 201
- [ ] Recebeu apiKey, apiSecret e licenseKey
- [ ] licenseStatus = "TRIAL"
- [ ] trialEndsAt = hoje + 30 dias
- [ ] isActive = true

---

## 🧪 TESTE 2: VALIDAR LICENÇA ATIVA

### Objetivo
Verificar se uma licença ativa passa na validação

### Passos

1. Copiar o `apiKey` do teste anterior
2. Adicionar no `.env`:
   ```
   LICENSE_API_KEY="cmd_xxxxxxxxxxxxxxxx"
   MASTER_API_URL="http://localhost:8080"
   ```
3. Reiniciar servidor
4. Fazer request em rota protegida:

```bash
curl http://localhost:8080/api/products \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

### Resultado Esperado

✅ **Verificações:**
- [ ] Request passa sem erro
- [ ] Não retorna erro de licença
- [ ] Headers incluem `X-Trial-Days-Left` (se trial)
- [ ] Console mostra "✅ Heartbeat enviado com sucesso"

---

## 🧪 TESTE 3: HEARTBEAT AUTOMÁTICO

### Objetivo
Verificar se o sistema envia heartbeat automaticamente

### Passos

1. Servidor rodando com LICENSE_API_KEY configurada
2. Aguardar 5 minutos (ou forçar chamada)
3. Verificar logs:

```bash
pm2 logs command-d | grep heartbeat
```

### Resultado Esperado

```
✅ Heartbeat enviado com sucesso
```

✅ **Verificações:**
- [ ] Heartbeat enviado a cada 5 minutos
- [ ] `lastHeartbeat` atualizado no banco master
- [ ] Métricas são enviadas (uptime, memory, stats)

---

## 🧪 TESTE 4: SUSPENDER LICENÇA

### Objetivo
Verificar se suspensão bloqueia o sistema

### Passos

```bash
# 1. Suspender licença
curl -X POST http://localhost:8080/api/master/licenses/{ID}/suspend \
  -H "Content-Type: application/json" \
  -d '{"reason": "Teste de suspensão"}'

# 2. Tentar acessar sistema da locadora
curl http://localhost:8080/api/products \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

### Resultado Esperado

```json
{
  "error": "Sistema suspenso por falta de pagamento. Entre em contato com o fornecedor.",
  "code": "LICENSE_SUSPENDED",
  "supportEmail": "suporte@command-d.com.br"
}
```

✅ **Verificações:**
- [ ] Status code 403
- [ ] Acesso bloqueado
- [ ] Mensagem clara para o usuário
- [ ] isActive = false no banco

---

## 🧪 TESTE 5: REATIVAR LICENÇA

### Objetivo
Verificar se reativação restaura o acesso

### Passos

```bash
# 1. Reativar licença
curl -X POST http://localhost:8080/api/master/licenses/{ID}/activate

# 2. Tentar acessar novamente
curl http://localhost:8080/api/products \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

### Resultado Esperado

✅ **Verificações:**
- [ ] Acesso funciona novamente
- [ ] licenseStatus = "ACTIVE"
- [ ] isActive = true
- [ ] Sem erros

---

## 🧪 TESTE 6: EXPIRAÇÃO DE TRIAL

### Objetivo
Verificar se trial expirado bloqueia o sistema

### Passos

```bash
# 1. Atualizar licença para expirar
# (diretamente no banco para teste)
UPDATE license_holders 
SET "trialEndsAt" = NOW() - INTERVAL '1 day'
WHERE subdomain = 'locadorateste';

# 2. Fazer request
curl http://localhost:8080/api/products \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

### Resultado Esperado

```json
{
  "error": "Período de trial expirado. Assine um plano para continuar.",
  "code": "TRIAL_EXPIRED",
  "trialEndsAt": "2024-XX-XX"
}
```

✅ **Verificações:**
- [ ] Status code 403
- [ ] Acesso bloqueado
- [ ] licenseStatus mudou para "EXPIRED"

---

## 🧪 TESTE 7: DASHBOARD MASTER

### Objetivo
Verificar se dashboard retorna estatísticas corretas

### Passos

```bash
curl http://localhost:8080/api/master/dashboard
```

### Resultado Esperado

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalLicenses": 1,
      "activeLicenses": 0,
      "trialLicenses": 1,
      "suspendedLicenses": 0,
      "offlineSystems": 0
    },
    "revenue": {
      "total": 0,
      "monthly": 0,
      "pending": 1,
      "byPlan": [...]
    },
    "recentLicenses": [...]
  }
}
```

✅ **Verificações:**
- [ ] Todas as estatísticas corretas
- [ ] Revenue calculada corretamente
- [ ] Licenças recentes aparecem

---

## 🧪 TESTE 8: REGISTRAR PAGAMENTO

### Objetivo
Verificar se pagamento ativa a licença

### Passos

```bash
curl -X POST http://localhost:8080/api/master/payments \
  -H "Content-Type: application/json" \
  -d '{
    "licenseHolderId": "{ID_DA_LICENCA}",
    "amount": 200,
    "referenceMonth": "2024-01-01",
    "paymentMethod": "PIX",
    "transactionId": "PIX123456"
  }'
```

### Resultado Esperado

✅ **Verificações:**
- [ ] Payment criado com status "PAID"
- [ ] licenseStatus = "ACTIVE"
- [ ] totalRevenue incrementado
- [ ] nextPayment = mês seguinte
- [ ] Sistema desbloqueado

---

## 🧪 TESTE 9: PARCERIAS

### Objetivo
Verificar sistema de parcerias entre locadoras

### Passos

```bash
# 1. Criar segunda licença
curl -X POST http://localhost:8080/api/master/licenses \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Segunda Locadora",
    "ownerEmail": "contato@segunda.com",
    "plan": "BASIC",
    "subdomain": "segunda"
  }'

# 2. Solicitar parceria (da primeira locadora)
curl -X POST http://localhost:8080/api/partnerships/request \
  -H "Authorization: Bearer TOKEN_LOCADORA_1" \
  -H "Content-Type: application/json" \
  -d '{
    "targetSubdomain": "segunda",
    "allowCrossRental": false
  }'

# 3. Aprovar parceria (no master)
UPDATE partnerships 
SET status = 'ACTIVE' 
WHERE id = '{ID_DA_PARCERIA}';

# 4. Buscar clientes compartilhados
curl http://localhost:8080/api/partnerships/shared-clients \
  -H "Authorization: Bearer TOKEN_LOCADORA_1"
```

### Resultado Esperado

✅ **Verificações:**
- [ ] Parceria criada com status "PENDING"
- [ ] Após aprovação, status = "ACTIVE"
- [ ] Consegue buscar clientes da outra locadora
- [ ] Dados retornados são apenas básicos (sem histórico)

---

## 🧪 TESTE 10: JOB DE VERIFICAÇÃO

### Objetivo
Verificar se job automático funciona corretamente

### Passos

```bash
# 1. Executar manualmente
node -e "require('./server/jobs/licenseChecker').runLicenseChecks()"

# 2. Ver logs
```

### Resultado Esperado

```
🔍 Iniciando verificação de licenças...
✅ Verificação de trials: 0 expirados
✅ Verificação de pagamentos: 0 suspensos, 0 alertas
✅ Verificação de sistemas offline: 0 encontrados
✅ Verificação de licenças concluída
```

✅ **Verificações:**
- [ ] Job roda sem erros
- [ ] Trials expirados são marcados como EXPIRED
- [ ] Pagamentos atrasados são suspensos
- [ ] Sistemas offline são detectados

---

## 🧪 TESTE 11: LIMITES DO PLANO

### Objetivo
Verificar se sistema respeita limites do plano

### Passos

```bash
# 1. Criar licença BASIC (limite: 3 usuários, 100 produtos)
# 2. Tentar criar 4º usuário
curl -X POST http://localhost:8080/api/employees \
  -H "Authorization: Bearer TOKEN" \
  -d '{...}'
```

### Resultado Esperado (Futuro)

```json
{
  "error": "Limite de usuários atingido (3/3). Faça upgrade para adicionar mais.",
  "code": "PLAN_LIMIT_REACHED",
  "currentPlan": "BASIC",
  "upgradeUrl": "https://command-d.com.br/upgrade"
}
```

✅ **Verificações:**
- [ ] Limite é verificado antes de criar
- [ ] Erro amigável
- [ ] Sugere upgrade

---

## 🧪 TESTE 12: FALHA DO SERVIDOR MASTER

### Objetivo
Verificar failsafe quando master está offline

### Passos

```bash
# 1. Desligar servidor master
# 2. Tentar acessar sistema da locadora
curl http://localhost:8080/api/products \
  -H "Authorization: Bearer TOKEN"
```

### Resultado Esperado

✅ **Verificações:**
- [ ] Sistema continua funcionando (failsafe)
- [ ] Log mostra aviso: "Erro ao validar licença, permitindo acesso temporário"
- [ ] Quando master volta, validação volta a funcionar

---

## 📊 RESUMO DOS TESTES

```
┌─────────────────────────────────────┬────────┐
│ Teste                               │ Status │
├─────────────────────────────────────┼────────┤
│ 1.  Criar licença                   │   [ ]  │
│ 2.  Validar licença ativa           │   [ ]  │
│ 3.  Heartbeat automático            │   [ ]  │
│ 4.  Suspender licença               │   [ ]  │
│ 5.  Reativar licença                │   [ ]  │
│ 6.  Expiração de trial              │   [ ]  │
│ 7.  Dashboard master                │   [ ]  │
│ 8.  Registrar pagamento             │   [ ]  │
│ 9.  Parcerias                       │   [ ]  │
│ 10. Job de verificação              │   [ ]  │
│ 11. Limites do plano                │   [ ]  │
│ 12. Falha do servidor master        │   [ ]  │
└─────────────────────────────────────┴────────┘
```

---

## 🐛 TROUBLESHOOTING

### Erro: "prisma client not found"

```bash
npx prisma generate --schema=prisma/schema-master.prisma
```

### Erro: "Master database not configured"

```bash
# Adicionar no .env
MASTER_DATABASE_URL="postgresql://..."
```

### Heartbeat não funciona

```bash
# Verificar se LICENSE_API_KEY está configurada
echo $LICENSE_API_KEY

# Ver logs
pm2 logs | grep heartbeat
```

---

## ✅ CHECKLIST FINAL

Antes de colocar em produção:

```
[ ] Todos os 12 testes passando
[ ] Servidor master rodando estável
[ ] Banco master configurado e migrado
[ ] Jobs automáticos funcionando
[ ] Dashboard acessível
[ ] Documentação completa
[ ] Backup automático configurado
[ ] Monitoramento ativo
[ ] Sistema de alertas configurado
```

---

## 🎉 SISTEMA PRONTO!

Se todos os testes passaram, seu sistema de licenciamento SaaS está funcionando perfeitamente!

**Próximos passos:**
1. Deploy em produção
2. Adicionar primeira locadora real
3. Configurar gateway de pagamento
4. Configurar emails automáticos
5. Começar a crescer! 🚀

