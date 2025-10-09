# 🚀 SETUP DE NOVA LOCADORA - PASSO A PASSO

Este guia é para quando uma nova locadora contratar o sistema Command-D.

---

## ✅ CHECKLIST COMPLETO

```
[ ] 1. Coletar informações da locadora
[ ] 2. Criar licença no sistema master
[ ] 3. Provisionar servidor AWS
[ ] 4. Instalar sistema no servidor
[ ] 5. Configurar domínio/DNS
[ ] 6. Testar acesso
[ ] 7. Entregar credenciais
[ ] 8. Fazer onboarding do cliente
```

---

## 📋 PASSO 1: COLETAR INFORMAÇÕES

Preencher formulário com o cliente:

```
Informações da Empresa:
- Nome da empresa: _______________________
- CNPJ (opcional): _______________________
- Endereço completo: _____________________

Dados do Responsável:
- Nome completo: ________________________
- Email: ________________________________
- Telefone/WhatsApp: ____________________

Plano Escolhido:
[ ] Trial (30 dias grátis)
[ ] Basic (R$ 200/mês)
[ ] Pro (R$ 500/mês)
[ ] Enterprise (R$ 1.000/mês)

Subdomain desejado:
- ____________.command-d.com.br
  (somente letras minúsculas e números, sem espaços)

Domínio próprio (opcional):
- www.______________________.com.br
```

---

## 🔑 PASSO 2: CRIAR LICENÇA NO SISTEMA MASTER

### Opção A: Pelo Dashboard (Recomendado)

1. Acesse: `https://master.command-d.com.br/master`
2. Clique em "Nova Licença"
3. Preencha o formulário com os dados coletados
4. Clique em "Criar"
5. **COPIE AS CREDENCIAIS** (aparecem apenas 1 vez!)

### Opção B: Via API

```bash
curl -X POST https://master.command-d.com.br/api/master/licenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_MASTER" \
  -d '{
    "companyName": "Nome da Empresa",
    "cnpj": "12.345.678/0001-90",
    "ownerName": "Nome do Dono",
    "ownerEmail": "email@empresa.com",
    "ownerPhone": "(11) 99999-9999",
    "ownerAddress": "Rua X, 123",
    "plan": "TRIAL",
    "subdomain": "nomedaempresa"
  }'
```

**Resposta (SALVE ISTO!):**
```json
{
  "success": true,
  "data": {
    "credentials": {
      "apiKey": "cmd_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "apiSecret": "secret_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "licenseKey": "LICENSE-ABCD1234EFGH5678"
    }
  }
}
```

⚠️ **IMPORTANTE**: Copie e salve em lugar seguro! Não aparece novamente.

---

## ☁️ PASSO 3: PROVISIONAR SERVIDOR AWS

### 3.1 Criar Instância EC2

1. Acesse AWS Console → EC2 → Launch Instance

2. **Configurações:**
   ```
   Nome: command-d-[nomedaempresa]
   AMI: Ubuntu Server 22.04 LTS (HVM)
   Tipo de instância: t3.medium (2 vCPU, 4GB RAM)
   
   Key pair: Criar nova ou usar existente
   
   Network Settings:
   ✅ Create security group
   ✅ Allow SSH (22) from My IP
   ✅ Allow HTTP (80) from Anywhere (0.0.0.0/0)
   ✅ Allow HTTPS (443) from Anywhere (0.0.0.0/0)
   
   Storage: 30 GB gp3
   ```

3. Launch Instance

4. **Anotar:**
   ```
   IP Público: ________________
   Key pair: ________________.pem
   ```

### 3.2 Conectar no Servidor

```bash
# Windows (PowerShell)
ssh -i "caminho/para/key.pem" ubuntu@IP_PUBLICO

# Linux/Mac
chmod 400 key.pem
ssh -i key.pem ubuntu@IP_PUBLICO
```

---

## 💻 PASSO 4: INSTALAR SISTEMA

### 4.1 Baixar Script de Instalação

```bash
# No servidor EC2
wget https://raw.githubusercontent.com/seu-usuario/command-d/main/scripts/setup-locadora.sh

# Dar permissão de execução
chmod +x setup-locadora.sh

# Executar
sudo ./setup-locadora.sh
```

### 4.2 O Script Vai Pedir

```
1. API Key da licença: [colar do passo 2]
2. API Secret da licença: [colar do passo 2]
3. Senha do banco PostgreSQL: [criar senha forte]
4. Senha do usuário admin: [criar senha]
```

### 4.3 O Script Irá Instalar

- ✅ Node.js 18
- ✅ PostgreSQL 14
- ✅ PM2 (process manager)
- ✅ nginx (reverse proxy)
- ✅ Sistema Command-D
- ✅ Criar banco de dados
- ✅ Rodar migrações
- ✅ Configurar startup automático

**Tempo estimado:** 5-10 minutos

### 4.4 Verificar Instalação

```bash
# Ver se está rodando
pm2 status

# Ver logs
pm2 logs command-d

# Se tudo OK, deve mostrar:
✅ Sistema iniciado na porta 8080
✅ Banco de dados conectado
✅ Heartbeat enviado com sucesso
```

---

## 🌐 PASSO 5: CONFIGURAR DOMÍNIO (OPCIONAL)

Se o cliente quiser domínio próprio (ex: `www.empresa.com.br`):

### 5.1 Apontar DNS

No provedor de DNS do cliente (Registro.br, GoDaddy, etc):

```
Tipo: A
Nome: @
Valor: [IP_DO_SERVIDOR_AWS]
TTL: 3600

Tipo: CNAME
Nome: www
Valor: [SUBDOMINIO].command-d.com.br
TTL: 3600
```

### 5.2 Configurar SSL (Let's Encrypt)

```bash
# No servidor EC2
sudo certbot --nginx -d www.empresa.com.br -d empresa.com.br

# Seguir instruções
# Email: seu-email@dominio.com
# Aceitar termos: Yes
# Compartilhar email: Yes/No
# Redirect HTTP to HTTPS: Yes
```

### 5.3 Testar

```bash
curl https://www.empresa.com.br/api/ping

# Deve retornar:
{"success":true,"message":"pong"}
```

---

## 🧪 PASSO 6: TESTAR SISTEMA

### 6.1 Acessar pelo Navegador

```
http://IP_DO_SERVIDOR:8080
ou
https://www.empresa.com.br
```

### 6.2 Fazer Login Inicial

```
Email: admin@empresa.com (criado na instalação)
Senha: [senha definida no passo 4]
```

### 6.3 Checklist de Testes

```
[ ] Login funciona
[ ] Dashboard carrega
[ ] Consegue criar produto
[ ] Consegue criar cliente
[ ] Consegue criar pedido
[ ] Sistema não mostra erros no console
[ ] Heartbeat está sendo enviado (verificar no master)
```

---

## 📧 PASSO 7: ENTREGAR CREDENCIAIS

### 7.1 Email para o Cliente

**Assunto:** Seu sistema Command-D está pronto! 🎉

```
Olá [Nome do Cliente],

Seu sistema Command-D foi instalado com sucesso e já está pronto para uso!

🔗 ACESSO AO SISTEMA
URL: https://www.sua-empresa.com.br
Email: admin@sua-empresa.com
Senha: [senha temporária]

🔑 INFORMAÇÕES DA LICENÇA
Plano: [Trial/Basic/Pro/Enterprise]
Válido até: [data]
Licença: [LICENSE-KEY]

📚 PRIMEIROS PASSOS
1. Faça login com as credenciais acima
2. Altere sua senha (Configurações → Senha)
3. Cadastre seus produtos (Menu → Produtos)
4. Cadastre seus clientes (Menu → Clientes)
5. Comece a fazer locações!

📖 DOCUMENTAÇÃO
https://docs.command-d.com.br

💬 SUPORTE
Email: suporte@command-d.com.br
WhatsApp: (31) 99999-9999
Horário: Seg-Sex 9h-18h

Estamos à disposição para qualquer dúvida!

Atenciosamente,
Equipe Command-D
```

### 7.2 Guardar Informações Internas

Salve no seu gerenciador (Notion, Trello, Excel):

```
Cliente: [Nome]
Subdomain: [subdomain].command-d.com.br
IP Servidor: [IP]
Data Instalação: [data]
Plano: [plano]
Próximo Pagamento: [data]
Observações: [qualquer coisa relevante]
```

---

## 👨‍🏫 PASSO 8: ONBOARDING DO CLIENTE

### 8.1 Agendar Reunião

```
Duração: 1 hora
Objetivo: Ensinar a usar o sistema

Agenda:
- 10min: Tour pelo sistema
- 15min: Cadastrar produtos
- 15min: Cadastrar clientes
- 15min: Fazer primeira locação
- 5min: Perguntas
```

### 8.2 Materiais de Suporte

Enviar:
- ✅ Manual em PDF
- ✅ Vídeo tutorial (YouTube/Vimeo)
- ✅ FAQ com dúvidas comuns
- ✅ Contatos de suporte

---

## 🔄 MANUTENÇÃO POSTERIOR

### Backups Automáticos

```bash
# Criar script de backup (rodar diariamente)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U command_d_user nome_banco > backup_$DATE.sql
```

### Monitoramento

No dashboard master, verificar:
- ✅ Sistema está enviando heartbeat
- ✅ Sem erros críticos
- ✅ Pagamentos em dia

### Atualizações

```bash
# Quando lançar nova versão
cd /home/ubuntu/app
git pull origin main
npm install
npm run build
npx prisma migrate deploy
pm2 restart command-d
```

---

## ❓ TROUBLESHOOTING

### Sistema não inicia

```bash
# Ver logs
pm2 logs command-d --lines 100

# Verificar banco
psql -U command_d_user -d nome_banco -c "SELECT 1"

# Reiniciar
pm2 restart command-d
```

### Erro de licença

```bash
# Verificar .env
cat /home/ubuntu/app/.env | grep LICENSE

# Testar conexão com master
curl https://master.command-d.com.br/api/ping

# Ver logs de heartbeat
pm2 logs command-d | grep heartbeat
```

### Sistema lento

```bash
# Ver uso de recursos
htop

# Ver espaço em disco
df -h

# Ver memória
free -h

# Considerar upgrade da instância EC2
```

---

## 📞 CONTATOS ÚTEIS

**AWS Suporte:**
- https://console.aws.amazon.com/support

**Suporte Command-D (você):**
- Email: seu-email@dominio.com
- WhatsApp: (XX) XXXXX-XXXX

**Documentação Técnica:**
- GitHub: https://github.com/seu-usuario/command-d
- Docs: https://docs.command-d.com.br

---

## ✅ CHECKLIST FINAL

Antes de considerar a instalação completa:

```
[ ] Servidor AWS provisionado e rodando
[ ] Sistema instalado sem erros
[ ] Banco de dados criado e migrado
[ ] Licença ativa no master
[ ] Heartbeat funcionando
[ ] SSL configurado (se domínio próprio)
[ ] Cliente consegue fazer login
[ ] Todas as features funcionando
[ ] Backup automático configurado
[ ] Credenciais enviadas para o cliente
[ ] Onboarding agendado
[ ] Informações salvas no seu sistema
```

---

## 🎉 PRONTO!

Nova locadora instalada com sucesso! 

**Próximos passos:**
1. Acompanhar primeiros dias de uso
2. Estar disponível para dúvidas
3. Coletar feedback
4. Agendar follow-up em 7 dias

**Parabéns! Mais uma locadora usando o Command-D! 🚀**

