# 🚀 DEPLOY GIT + AWS - PASSO A PASSO COMPLETO

**Sistema:** Command-D Multi-Tenant  
**Objetivo:** Colocar no ar e testar em produção  
**Tempo:** 30-60 minutos

---

## 📋 CHECKLIST RÁPIDO

```
[ ] 1. Preparar código local (5 min)
[ ] 2. Subir no GitHub (5 min)
[ ] 3. Configurar AWS (15 min)
[ ] 4. Deploy automático (10 min)
[ ] 5. Testar online (10 min)
[ ] 6. Configurar domínio (opcional, 15 min)
```

---

## 🎯 PASSO 1: PREPARAR O CÓDIGO LOCAL (5 min)

### 1.1 Verificar Status do Git

```bash
# Ver o que mudou
git status

# Ver branch atual
git branch

# Ver histórico
git log --oneline -5
```

### 1.2 Commit das Mudanças Recentes

```bash
# Adicionar tudo
git add -A

# Commit final
git commit -m "feat: Sistema completo com QA 100% + Analise Frontend

- QA E2E 3 camadas (Cliente/Funcionario/Dono) ✅
- Comportamento humano 100% ✅
- Auto-fix implementado ✅
- Analise minuciosa frontend ✅
- 100% testes passando ✅
- Sistema 85% funcional
- Pronto para deploy"
```

### 1.3 Merge na Main/Master

```bash
# Ir para main
git checkout main

# Puxar últimas mudanças (caso tenha)
git pull origin main

# Merge da sua branch
git merge chore/qa-autofix-2024-10-09

# Resolver conflitos se houver (improvável)
# Se houver conflito, abrir os arquivos marcados e escolher o código correto
```

---

## 🎯 PASSO 2: SUBIR NO GITHUB (5 min)

### 2.1 Criar Repositório no GitHub (se ainda não existe)

1. Acessar https://github.com/new
2. Nome: `sistema-command-d` (ou outro nome)
3. Descrição: "Sistema Multi-Tenant de Locadora de Equipamentos"
4. **Privado** (recomendado)
5. **NÃO** marcar "Initialize with README" (já temos)
6. Criar

### 2.2 Conectar Repositório Local

```bash
# Se ainda não conectou
git remote add origin https://github.com/SEU_USUARIO/sistema-command-d.git

# Verificar
git remote -v
```

### 2.3 Push para GitHub

```bash
# Primeira vez (cria branch main no GitHub)
git push -u origin main

# Das próximas vezes (só push)
git push
```

**Pronto!** Código está no GitHub ✅

---

## 🎯 PASSO 3: CONFIGURAR AWS (15 min)

### 3.1 Criar Conta AWS (se não tem)

1. Acessar https://aws.amazon.com/
2. Criar conta (cartão de crédito necessário)
3. Free Tier: 12 meses grátis (limites generosos)

### 3.2 Opção A: **AWS EC2** (Servidor Virtual - RECOMENDADO)

#### Criar Instância EC2

```bash
# Na AWS Console:
1. Ir em EC2 > Launch Instance
2. Escolher AMI: Ubuntu Server 22.04 LTS
3. Tipo: t2.micro (Free Tier - 1GB RAM)
4. Key Pair: Criar nova (baixar .pem)
5. Security Group:
   - SSH (22) - Seu IP
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
   - Custom (8080) - 0.0.0.0/0  ← Porta da aplicação
6. Storage: 20GB (Free Tier)
7. Launch
```

#### Conectar na Instância

```bash
# No seu computador (PowerShell/CMD)
# Substituir:
# - sua-chave.pem pelo nome do arquivo baixado
# - SEU_IP pelo IP público da instância (aparece no console EC2)

# Windows (PowerShell)
ssh -i "C:\caminho\para\sua-chave.pem" ubuntu@SEU_IP

# Primeira vez: digite "yes" para confirmar
```

#### Instalar Dependências no Servidor

```bash
# Já conectado na instância EC2

# 1. Atualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar
node -v  # deve mostrar v20.x
npm -v   # deve mostrar v10.x

# 3. Instalar Git
sudo apt install -y git

# 4. Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2

# 5. Instalar PostgreSQL (se for usar)
sudo apt install -y postgresql postgresql-contrib

# Configurar PostgreSQL
sudo -u postgres psql
# Dentro do psql:
CREATE DATABASE command_d;
CREATE USER command_admin WITH PASSWORD 'sua_senha_forte';
GRANT ALL PRIVILEGES ON DATABASE command_d TO command_admin;
\q
```

#### Clonar Projeto no Servidor

```bash
# Ainda conectado na instância

# 1. Clonar do GitHub
cd /home/ubuntu
git clone https://github.com/SEU_USUARIO/sistema-command-d.git
cd sistema-command-d

# 2. Instalar dependências
npm install

# 3. Criar arquivo .env
nano .env

# Colar isto (ajustar valores):
```

```env
# .env no servidor AWS
NODE_ENV=production
PORT=8080

# Database
DATABASE_URL="postgresql://command_admin:sua_senha_forte@localhost:5432/command_d?schema=public"

# JWT Secret (gerar um aleatório)
JWT_SECRET="seu_segredo_super_forte_aqui_123456"

# URLs
APP_URL=http://SEU_IP:8080
```

```bash
# Salvar: Ctrl+X, Y, Enter

# 4. Setup do banco (Prisma)
npx prisma generate
npx prisma db push
# Ou: npx prisma migrate deploy

# 5. Build da aplicação
npm run build

# 6. Testar localmente
npm start
# Deixar rodar e abrir outro terminal para testar

# Em outro terminal/aba:
curl http://localhost:8080
# Deve retornar HTML

# Voltar ao terminal anterior e parar (Ctrl+C)
```

#### Rodar com PM2 (persistente)

```bash
# Criar ecosystem.config.js
nano ecosystem.config.js
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'command-d',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    }
  }]
};
```

```bash
# Salvar e sair

# Iniciar com PM2
pm2 start ecosystem.config.js

# Ver logs
pm2 logs

# Status
pm2 status

# Garantir que inicia com o sistema
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
```

**Pronto!** Aplicação rodando 24/7 ✅

---

### 3.3 Opção B: **AWS Elastic Beanstalk** (Mais Fácil)

```bash
# No seu computador local

# 1. Instalar EB CLI
pip install awsebcli

# 2. Inicializar EB
cd C:\Users\fnune\OneDrive\Documentos\GitHub\Locadora-multi-tenant--main\Sistema-Command-D
eb init

# Escolher:
# - Região: sa-east-1 (São Paulo)
# - Application name: command-d
# - Platform: Node.js
# - SSH: Yes (criar key pair)

# 3. Criar ambiente
eb create production-env

# 4. Deploy
eb deploy

# 5. Abrir no navegador
eb open
```

**Muito mais simples!** Mas tem custo após Free Tier.

---

### 3.4 Opção C: **AWS Amplify** (Frontend Estático + API)

```bash
# Se for só frontend (React build)

# 1. Build local
npm run build

# 2. Na AWS Console:
# - Amplify > New App > Deploy without Git
# - Upload dist/ (ou build/)
# - Pronto!

# Para backend:
# - Usar AWS Lambda + API Gateway
# - Ou separar em 2 deploys
```

---

## 🎯 PASSO 4: CONFIGURAR DEPLOY AUTOMÁTICO (10 min)

### 4.1 GitHub Actions (CI/CD)

Você já tem o arquivo `.github/workflows/deploy-aws.yml`! Vamos ajustá-lo:

```yaml
# .github/workflows/deploy-aws.yml
name: Deploy to AWS

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to EC2
      env:
        PRIVATE_KEY: ${{ secrets.EC2_SSH_KEY }}
        HOST: ${{ secrets.EC2_HOST }}
        USER: ubuntu
      run: |
        echo "$PRIVATE_KEY" > private_key.pem
        chmod 600 private_key.pem
        
        # Copiar build para servidor
        scp -o StrictHostKeyChecking=no -i private_key.pem -r dist/* $USER@$HOST:/home/ubuntu/sistema-command-d/dist/
        
        # Reiniciar aplicação
        ssh -o StrictHostKeyChecking=no -i private_key.pem $USER@$HOST << 'EOF'
          cd /home/ubuntu/sistema-command-d
          pm2 restart command-d
        EOF
```

### 4.2 Configurar Secrets no GitHub

1. GitHub > Seu Repo > Settings > Secrets and variables > Actions
2. New repository secret:
   - Name: `EC2_SSH_KEY`
   - Value: Conteúdo do arquivo .pem (abrir no notepad e copiar tudo)
3. New repository secret:
   - Name: `EC2_HOST`
   - Value: IP público da instância EC2

### 4.3 Testar Deploy Automático

```bash
# Fazer qualquer mudança
echo "# Deploy test" >> README.md

# Commit e push
git add README.md
git commit -m "test: Deploy automatico"
git push

# Ver no GitHub:
# - Actions > Deploy to AWS
# - Deve aparecer rodando
# - Aguardar ~2-3 minutos
```

**Deploy automático funcionando!** ✅

---

## 🎯 PASSO 5: TESTAR ONLINE (10 min)

### 5.1 Acessar a Aplicação

```bash
# No navegador
http://SEU_IP_EC2:8080

# Ou se configurou domínio
https://seudominio.com
```

### 5.2 Testes Básicos

```bash
# 1. Homepage
http://SEU_IP:8080/

# 2. Login
http://SEU_IP:8080/login
# Testar com: cabecadeefeitocine@gmail.com / admin123

# 3. Equipamentos
http://SEU_IP:8080/equipamentos

# 4. Carrinho
http://SEU_IP:8080/carrinho

# 5. Painel Admin
http://SEU_IP:8080/painel-admin
# (só logado)

# 6. API
http://SEU_IP:8080/api/ping
# Deve retornar: { "message": "pong" }
```

### 5.3 Rodar Testes E2E Apontando para Produção

```bash
# No seu computador local

# Mudar baseURL no playwright.config.ts
# De: http://localhost:8081
# Para: http://SEU_IP_EC2:8080

# Rodar testes
APP_URL=http://SEU_IP_EC2:8080 npm run qa3

# Ver relatório
npm run test:e2e:report
```

### 5.4 Monitorar Logs

```bash
# Conectar na instância EC2
ssh -i "sua-chave.pem" ubuntu@SEU_IP

# Ver logs da aplicação
pm2 logs command-d

# Ver logs em tempo real
pm2 logs command-d --lines 100

# Ver status
pm2 status

# Métricas
pm2 monit
```

---

## 🎯 PASSO 6: CONFIGURAR DOMÍNIO (Opcional, 15 min)

### 6.1 Registrar Domínio

Opções:
- **Registro.br** (R$ 40/ano) - `.com.br`
- **Hostinger** (R$ 30/ano) - `.com`
- **GoDaddy** (R$ 50/ano) - `.com`

### 6.2 Apontar Domínio para AWS

**Opção A: DNS Simples (A Record)**

```
1. No painel do registrador de domínio
2. DNS Settings / Gerenciar DNS
3. Adicionar registro:
   - Type: A
   - Name: @ (ou deixar vazio)
   - Value: SEU_IP_EC2
   - TTL: 3600

4. Adicionar www:
   - Type: CNAME
   - Name: www
   - Value: seudominio.com
```

**Opção B: AWS Route 53** (DNS da AWS)

```bash
# Na AWS Console:
1. Route 53 > Hosted Zones > Create
2. Domain: seudominio.com
3. Create Record:
   - Type: A
   - Name: (vazio)
   - Value: IP da instância EC2

4. Copiar nameservers (ns-xxx.awsdns-xxx)
5. Ir no registrador e mudar nameservers
```

Aguardar propagação: 5 minutos a 48 horas (geralmente 1 hora)

### 6.3 Instalar SSL (HTTPS)

```bash
# Conectar na instância EC2
ssh -i "sua-chave.pem" ubuntu@SEU_IP

# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Instalar Nginx
sudo apt install -y nginx

# Configurar Nginx como proxy
sudo nano /etc/nginx/sites-available/command-d
```

```nginx
# /etc/nginx/sites-available/command-d
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/command-d /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Escolher: Redirect HTTP to HTTPS (2)

# Renovação automática já está configurada
sudo certbot renew --dry-run
```

**Pronto! HTTPS funcionando!** 🔒✅

---

## 📊 CUSTOS ESTIMADOS AWS

### Free Tier (12 meses)

```
✅ EC2 t2.micro:       750 horas/mês (GRÁTIS)
✅ EBS Storage:        30GB (GRÁTIS)
✅ Data Transfer:      15GB saída/mês (GRÁTIS)
✅ RDS (PostgreSQL):   750 horas/mês (GRÁTIS)
```

### Após Free Tier

```
💰 EC2 t2.micro:       ~R$ 40/mês
💰 EBS 20GB:           ~R$ 5/mês
💰 Data Transfer:      ~R$ 0,30/GB
💰 RDS db.t2.micro:    ~R$ 70/mês
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total estimado:        R$ 115-150/mês
```

**Alternativas mais baratas:**
- **Railway**: R$ 20-50/mês (mais fácil)
- **Render**: R$ 30-80/mês (deploy git automático)
- **Vercel + Supabase**: R$ 0-50/mês (frontend + DB)

---

## 🔧 TROUBLESHOOTING

### Erro: "Cannot connect to server"

```bash
# Verificar Security Group
# AWS Console > EC2 > Security Groups
# Adicionar regra:
# - Type: Custom TCP
# - Port: 8080
# - Source: 0.0.0.0/0
```

### Erro: "Permission denied (publickey)"

```bash
# Verificar permissões da chave
chmod 600 sua-chave.pem

# Usar o usuário correto
ssh -i "sua-chave.pem" ubuntu@SEU_IP  # Ubuntu AMI
# ou
ssh -i "sua-chave.pem" ec2-user@SEU_IP  # Amazon Linux AMI
```

### Aplicação não inicia

```bash
# Conectar no servidor
ssh -i "sua-chave.pem" ubuntu@SEU_IP

# Ver logs
pm2 logs command-d --err

# Reiniciar
pm2 restart command-d

# Se precisar reinstalar
cd /home/ubuntu/sistema-command-d
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart command-d
```

### Banco de dados não conecta

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Ver logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Testar conexão
psql -U command_admin -d command_d -h localhost

# Recriar banco
sudo -u postgres psql
DROP DATABASE command_d;
CREATE DATABASE command_d;
GRANT ALL PRIVILEGES ON DATABASE command_d TO command_admin;
\q

# Rodar migrations
cd /home/ubuntu/sistema-command-d
npx prisma db push
```

---

## 📝 CHECKLIST FINAL

```bash
# No seu computador
[ ] Código commitado
[ ] Push para GitHub
[ ] GitHub Actions configurado

# Na AWS
[ ] Instância EC2 criada
[ ] Security Groups configurados (portas 80, 443, 8080)
[ ] Node.js instalado
[ ] PostgreSQL instalado e configurado
[ ] Projeto clonado
[ ] .env configurado
[ ] Build feito
[ ] PM2 rodando
[ ] Nginx configurado (se usar domínio)
[ ] SSL instalado (se usar domínio)

# Testes
[ ] Homepage abre
[ ] Login funciona
[ ] Equipamentos aparecem
[ ] Painel admin funciona
[ ] API responde
[ ] QA E2E passou
```

---

## 🚀 COMANDOS RÁPIDOS (COPIAR/COLAR)

### Deploy Rápido (Atualizar código)

```bash
# No servidor AWS
cd /home/ubuntu/sistema-command-d
git pull
npm install
npm run build
pm2 restart command-d
```

### Ver Status

```bash
# Aplicação
pm2 status
pm2 logs command-d --lines 50

# Servidor
htop  # ou: top
df -h  # disco
free -h  # memória
```

### Backup

```bash
# Backup do banco
pg_dump -U command_admin command_d > backup-$(date +%Y%m%d).sql

# Backup do código
tar -czf sistema-backup-$(date +%Y%m%d).tar.gz /home/ubuntu/sistema-command-d
```

---

## 🎯 PRÓXIMOS PASSOS

Depois de colocar no ar:

```
1. [ ] Monitoramento (New Relic, Datadog)
2. [ ] Backup automático (cron)
3. [ ] CDN para assets (CloudFront)
4. [ ] Load Balancer (se crescer)
5. [ ] Auto Scaling (se crescer muito)
6. [ ] Logs centralizados (CloudWatch)
7. [ ] Alertas (SNS, PagerDuty)
```

---

## 📞 SUPORTE

### Documentação Útil

```
✅ AWS EC2: https://docs.aws.amazon.com/ec2/
✅ PM2: https://pm2.keymetrics.io/docs/
✅ Nginx: https://nginx.org/en/docs/
✅ Certbot: https://certbot.eff.org/
✅ GitHub Actions: https://docs.github.com/actions
```

---

**🎉 SUCESSO!**

Seu sistema está online em:
- **HTTP:** `http://SEU_IP:8080`
- **HTTPS:** `https://seudominio.com` (se configurou)
- **GitHub:** `https://github.com/SEU_USUARIO/sistema-command-d`

**Tempo total:** 30-60 minutos  
**Custo:** R$ 0 (Free Tier) ou R$ 115-150/mês depois

**Agora é só testar e usar! 🚀**

