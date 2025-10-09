# ⚡ CONFIGURAR DEPLOY AUTOMÁTICO - GITHUB → AWS

**Sua instância AWS:** `3.144.136.170` (us-east-2)  
**Objetivo:** Push no GitHub → Deploy automático na AWS  
**Tempo:** 10-15 minutos

---

## 🎯 PASSO 1: CONFIGURAR SECRETS NO GITHUB (5 min)

### 1.1 Ir para Configurações do Repositório

```
1. Abrir seu repositório no GitHub
2. Ir em: Settings (Configurações)
3. No menu lateral: Secrets and variables > Actions
4. Clicar em: New repository secret
```

### 1.2 Adicionar 3 Secrets

#### Secret 1: `EC2_SSH_KEY`

```
Name: EC2_SSH_KEY
Value: [COLE TODO O CONTEÚDO DO SEU ARQUIVO .pem AQUI]
```

**Como pegar o conteúdo do .pem:**
- Abrir o arquivo `.pem` que você baixou da AWS no Notepad
- Copiar TODO o conteúdo (desde `-----BEGIN RSA PRIVATE KEY-----` até `-----END RSA PRIVATE KEY-----`)
- Colar no campo Value

#### Secret 2: `EC2_HOST`

```
Name: EC2_HOST
Value: 3.144.136.170
```

#### Secret 3: `EC2_USER`

```
Name: EC2_USER
Value: ubuntu
```

**Resultado:** Você terá 3 secrets configurados ✅

---

## 🎯 PASSO 2: PREPARAR O SERVIDOR AWS (10 min)

### 2.1 Conectar no Servidor

```powershell
# No PowerShell (Windows)
ssh -i "C:\caminho\para\sua-chave.pem" ubuntu@3.144.136.170
```

### 2.2 Instalar Dependências (se ainda não instalou)

```bash
# Copie e cole tudo de uma vez:

# 1. Atualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Instalar PM2
sudo npm install -g pm2

# 4. Instalar PostgreSQL (se precisar)
sudo apt install -y postgresql postgresql-contrib

# 5. Criar banco
sudo -u postgres psql -c "CREATE DATABASE command_d;"
sudo -u postgres psql -c "CREATE USER command_admin WITH PASSWORD 'sua_senha_forte_123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE command_d TO command_admin;"

# 6. Criar diretório da aplicação
mkdir -p /home/ubuntu/sistema-command-d
cd /home/ubuntu/sistema-command-d

# 7. Criar arquivo .env
nano .env
```

### 2.3 Configurar .env no Servidor

```env
# Cole isto no arquivo .env:
NODE_ENV=production
PORT=8080

# Database
DATABASE_URL="postgresql://command_admin:sua_senha_forte_123@localhost:5432/command_d?schema=public"

# JWT Secret (gere um aleatório forte)
JWT_SECRET="seu_segredo_super_forte_aqui_123456_abc"

# URLs
APP_URL=http://3.144.136.170:8080
```

```bash
# Salvar: Ctrl+X, depois Y, depois Enter

# Verificar se salvou
cat .env
```

### 2.4 Garantir PM2 Inicia com o Sistema

```bash
pm2 startup
# Copie e execute o comando que aparecer (começando com sudo)

pm2 save
```

**Pronto! Servidor configurado** ✅

---

## 🎯 PASSO 3: LIBERAR PORTAS NO AWS SECURITY GROUP (2 min)

### 3.1 Ir para AWS Console

```
1. AWS Console > EC2 > Instances
2. Clicar na sua instância (i-075667c92da583acf)
3. Aba "Security" (Segurança)
4. Clicar no Security Group (sg-0429db3f5f1a3c8eb)
5. Aba "Inbound rules" (Regras de entrada)
6. Clicar "Edit inbound rules"
```

### 3.2 Adicionar Regras

Adicione estas regras se ainda não existem:

```
1. SSH (22)
   - Type: SSH
   - Port: 22
   - Source: My IP (seu IP)

2. HTTP (80)
   - Type: HTTP
   - Port: 80
   - Source: 0.0.0.0/0, ::/0

3. HTTPS (443)
   - Type: HTTPS
   - Port: 443
   - Source: 0.0.0.0/0, ::/0

4. Custom TCP (8080) ← IMPORTANTE!
   - Type: Custom TCP
   - Port: 8080
   - Source: 0.0.0.0/0, ::/0
   - Description: Node.js App
```

**Salvar regras** ✅

---

## 🎯 PASSO 4: TESTAR DEPLOY MANUAL (5 min)

### 4.1 Fazer Push no GitHub

```powershell
# No seu computador (PowerShell)
cd "C:\Users\fnune\OneDrive\Documentos\GitHub\Locadora-multi-tenant--main\Sistema-Command-D"

# Commit das mudanças
git add .
git commit -m "feat: Configurar deploy automatico para AWS"

# Push para main
git checkout main
git push origin main
```

### 4.2 Acompanhar Deploy

```
1. Ir no GitHub
2. Seu repositório > Actions
3. Ver o workflow "Deploy to AWS" rodando
4. Acompanhar os logs em tempo real
```

**Deve levar ~3-5 minutos** ⏱️

### 4.3 Verificar se Funcionou

```bash
# Conectar no servidor AWS
ssh -i "sua-chave.pem" ubuntu@3.144.136.170

# Ver status
pm2 status

# Ver logs
pm2 logs command-d --lines 50

# Testar
curl http://localhost:8080
```

No navegador:
```
http://3.144.136.170:8080
```

**Se aparecer a página:** ✅ Funcionou!

---

## 🎯 PASSO 5: USAR O DEPLOY AUTOMÁTICO

### Agora é Automático! 🎉

Toda vez que você fizer push na branch `main`:

```powershell
# Fazer mudanças no código...

# Commit
git add .
git commit -m "feat: Nova funcionalidade"

# Push (dispara deploy automático)
git push origin main

# Aguardar ~3-5 minutos
# Deploy acontece automaticamente!
```

### Acompanhar Deployment

```
GitHub > Actions > Ver workflow rodando
```

### Deploy Manual (se precisar)

```
GitHub > Actions > Deploy to AWS > Run workflow > Run
```

---

## 📊 CHECKLIST COMPLETO

```bash
# Secrets no GitHub
[ ] EC2_SSH_KEY (conteúdo do .pem)
[ ] EC2_HOST (3.144.136.170)
[ ] EC2_USER (ubuntu)

# Servidor AWS
[ ] Node.js 20 instalado
[ ] PM2 instalado e configurado
[ ] PostgreSQL instalado
[ ] Banco de dados criado
[ ] Diretório /home/ubuntu/sistema-command-d criado
[ ] Arquivo .env configurado
[ ] PM2 startup configurado

# Security Group AWS
[ ] Porta 22 (SSH) liberada
[ ] Porta 80 (HTTP) liberada
[ ] Porta 443 (HTTPS) liberada
[ ] Porta 8080 (App) liberada ← IMPORTANTE!

# GitHub
[ ] Workflow configurado (.github/workflows/deploy-aws.yml)
[ ] Push na branch main
[ ] Workflow executado com sucesso
```

---

## 🔧 TROUBLESHOOTING

### Erro: "Permission denied (publickey)"

**Solução:** Verificar se o secret `EC2_SSH_KEY` está correto

```
1. GitHub > Settings > Secrets > EC2_SSH_KEY
2. Editar
3. Copiar TODO o conteúdo do .pem novamente
4. Salvar
5. Rodar workflow novamente
```

### Erro: "Connection refused"

**Solução:** Liberar porta 8080 no Security Group

```
AWS > EC2 > Security Groups > Editar Inbound Rules
Adicionar: Custom TCP, Port 8080, Source 0.0.0.0/0
```

### Erro: "pm2: command not found"

**Solução:** Instalar PM2

```bash
# Conectar no servidor
ssh -i "sua-chave.pem" ubuntu@3.144.136.170

# Instalar PM2
sudo npm install -g pm2

# Configurar startup
pm2 startup
pm2 save
```

### Aplicação não inicia

```bash
# Ver logs
pm2 logs command-d --err

# Reiniciar
pm2 restart command-d

# Se precisar recriar
pm2 delete command-d
cd /home/ubuntu/sistema-command-d
pm2 start npm --name command-d -- start
```

### Erro no banco de dados

```bash
# Conectar no servidor
ssh -i "sua-chave.pem" ubuntu@3.144.136.170

# Verificar PostgreSQL
sudo systemctl status postgresql

# Recriar banco
sudo -u postgres psql
DROP DATABASE IF EXISTS command_d;
CREATE DATABASE command_d;
GRANT ALL PRIVILEGES ON DATABASE command_d TO command_admin;
\q

# Rodar migrations
cd /home/ubuntu/sistema-command-d
npx prisma generate
npx prisma db push
```

---

## 🎉 TESTANDO O SISTEMA

### URLs para Testar

```
Homepage:
http://3.144.136.170:8080/

Login:
http://3.144.136.170:8080/login
Email: cabecadeefeitocine@gmail.com
Senha: admin123

Equipamentos:
http://3.144.136.170:8080/equipamentos

Painel Admin:
http://3.144.136.170:8080/painel-admin

API:
http://3.144.136.170:8080/api/ping
```

### Rodar QA E2E Apontando para Produção

```powershell
# No seu computador
APP_URL=http://3.144.136.170:8080 npm run qa3

# Ver relatório
npm run test:e2e:report
```

---

## 📈 PRÓXIMOS PASSOS

### 1. Configurar Domínio (Opcional)

```
Registrar: seudominio.com.br
Apontar: A Record → 3.144.136.170
Aguardar: 1-48 horas (propagação DNS)
```

### 2. Instalar SSL (HTTPS)

```bash
# Conectar no servidor
ssh -i "sua-chave.pem" ubuntu@3.144.136.170

# Instalar Nginx + Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Configurar Nginx (proxy reverso)
sudo nano /etc/nginx/sites-available/command-d

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

### 3. Monitoramento

```bash
# Ver métricas
pm2 monit

# Dashboard web
pm2 plus
```

### 4. Backup Automático

```bash
# Criar script de backup
crontab -e

# Adicionar (backup diário às 3h)
0 3 * * * pg_dump -U command_admin command_d > /home/ubuntu/backups/db-$(date +\%Y\%m\%d).sql
```

---

## ✅ COMANDOS ÚTEIS

### Ver Status da Aplicação

```bash
# Conectar
ssh -i "sua-chave.pem" ubuntu@3.144.136.170

# Status
pm2 status

# Logs
pm2 logs command-d

# Métricas
pm2 monit

# Reiniciar
pm2 restart command-d

# Parar
pm2 stop command-d

# Ver uso do servidor
htop
df -h
free -h
```

### Atualizar Manualmente (se precisar)

```bash
cd /home/ubuntu/sistema-command-d
git pull  # Se tiver git configurado
npm install
npm run build
pm2 restart command-d
```

---

## 🎯 RESUMO

**Agora você tem:**

✅ Deploy automático funcionando  
✅ Toda vez que fizer `git push` na main  
✅ GitHub Actions faz build e deploy  
✅ Aplicação atualiza automaticamente na AWS  
✅ PM2 mantém rodando 24/7  
✅ Logs e monitoramento disponíveis  

**Tempo de deploy:** 3-5 minutos  
**Custo:** R$ 0 (Free Tier) ou ~R$ 40/mês depois  

**Sistema pronto para produção!** 🚀

---

**URL do Sistema:** http://3.144.136.170:8080  
**Acompanhar Deploys:** https://github.com/SEU_USUARIO/SEU_REPO/actions  
**Documentação Completa:** Ver `DEPLOY-PASSO-A-PASSO.md`

