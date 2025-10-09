# 🚀 DEPLOY AUTOMÁTICO AWS + GITHUB - COMMAND-D

## 🎯 O QUE VOCÊ PRECISA

Este guia mostra como configurar deploy automático: quando você fizer `git push`, o sistema atualiza automaticamente na AWS.

---

## 📋 PRÉ-REQUISITOS

### 1. Conta AWS
- ✅ Conta criada em: https://aws.amazon.com
- ✅ Cartão de crédito cadastrado
- ✅ Acesso ao Console AWS

### 2. Servidor EC2 (AWS)
- ✅ Ubuntu 22.04 LTS
- ✅ Tipo: t3.small ou t3.medium
- ✅ IP público estático (Elastic IP)

### 3. GitHub
- ✅ Repositório: https://github.com/hidanz98/Command--D-v1.0
- ✅ Acesso de administrador

---

## 🏗️ ARQUITETURA DO DEPLOY

```
┌─────────────────────────────────────────┐
│  SEU COMPUTADOR                         │
│                                         │
│  1. Você edita código                   │
│  2. git add .                           │
│  3. git commit -m "atualização"         │
│  4. git push origin main                │
└─────────────────────────────────────────┘
              │
              │ Push para GitHub
              ▼
┌─────────────────────────────────────────┐
│  GITHUB                                 │
│  https://github.com/hidanz98/...        │
│                                         │
│  → GitHub Actions detecta push          │
│  → Executa workflow automático          │
└─────────────────────────────────────────┘
              │
              │ SSH + Deploy
              ▼
┌─────────────────────────────────────────┐
│  AWS EC2 (Servidor)                     │
│  IP: SEU_IP_AWS                         │
│                                         │
│  1. Recebe código atualizado            │
│  2. Instala dependências                │
│  3. Compila projeto                     │
│  4. Reinicia servidor                   │
│  5. Sistema atualizado! ✅              │
└─────────────────────────────────────────┘
```

---

## 🔧 PASSO 1: CRIAR SERVIDOR NA AWS

### 1.1 Acessar AWS Console

```
1. Acesse: https://console.aws.amazon.com
2. Login com sua conta
3. Região: US East (Ohio) ou São Paulo
```

### 1.2 Criar Instância EC2

```
1. Vá em: EC2 → Instances → Launch Instance

2. Configuração:
   Nome: command-d-production
   
   OS: Ubuntu Server 22.04 LTS (Free tier eligible)
   
   Tipo de Instância: t3.small
   - 2 vCPU
   - 2 GB RAM
   - Custo: ~US$ 15/mês
   
   Key Pair: 
   - Create new key pair
   - Nome: command-d-key
   - Tipo: RSA
   - Formato: .pem
   - BAIXAR E GUARDAR EM LUGAR SEGURO!
   
   Network Settings:
   ✅ Allow SSH (22) from My IP
   ✅ Allow HTTP (80) from Anywhere
   ✅ Allow HTTPS (443) from Anywhere
   ✅ Allow Custom TCP (8080) from Anywhere
   
   Storage: 20 GB gp3
   
3. Clique em "Launch Instance"
```

### 1.3 Criar IP Fixo (Elastic IP)

```
1. EC2 → Network & Security → Elastic IPs
2. "Allocate Elastic IP address"
3. "Allocate"
4. Selecione o IP criado → Actions → "Associate Elastic IP address"
5. Instance: Selecione sua instância (command-d-production)
6. "Associate"
```

Anote o **IP Público**: `____.____.____.____`

---

## 🔑 PASSO 2: CONFIGURAR ACESSO SSH

### 2.1 Configurar Key Pair no Windows

```powershell
# Mover chave para pasta SSH
New-Item -ItemType Directory -Force -Path ~/.ssh
Move-Item "Downloads\command-d-key.pem" ~/.ssh\

# Dar permissões corretas (Windows)
icacls "$env:USERPROFILE\.ssh\command-d-key.pem" /inheritance:r
icacls "$env:USERPROFILE\.ssh\command-d-key.pem" /grant:r "$($env:USERNAME):(R)"
```

### 2.2 Testar Conexão SSH

```bash
# Testar conexão (substitua SEU_IP_AWS)
ssh -i ~/.ssh/command-d-key.pem ubuntu@SEU_IP_AWS

# Se perguntar "Are you sure?", digite: yes
```

Se conectou com sucesso, você verá:

```
Welcome to Ubuntu 22.04.X LTS
ubuntu@ip-xxx:~$
```

---

## 🛠️ PASSO 3: CONFIGURAR SERVIDOR

### 3.1 Instalar Node.js e Dependências

```bash
# Conectar ao servidor
ssh -i ~/.ssh/command-d-key.pem ubuntu@SEU_IP_AWS

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x
npm --version   # Deve mostrar 10.x

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar Git
sudo apt install -y git
```

### 3.2 Configurar PostgreSQL

```bash
# Conectar ao PostgreSQL
sudo -u postgres psql

# Dentro do PostgreSQL:
CREATE DATABASE commandd_prod;
CREATE USER commandd WITH PASSWORD 'SuaSenhaSegura123!';
GRANT ALL PRIVILEGES ON DATABASE commandd_prod TO commandd;
\q

# Sair do PostgreSQL
```

### 3.3 Criar Diretório do Projeto

```bash
# Criar pasta para o projeto
mkdir -p /home/ubuntu/command-d
cd /home/ubuntu/command-d

# Clonar repositório
git clone https://github.com/hidanz98/Command--D-v1.0.git .

# Instalar dependências
npm install

# Criar arquivo .env
nano .env
```

### 3.4 Configurar .env

```bash
# Copie e cole no arquivo .env:

NODE_ENV=production
PORT=8080

# Database
DATABASE_URL="postgresql://commandd:SuaSenhaSegura123!@localhost:5432/commandd_prod?schema=public"

# JWT
JWT_SECRET="SeuSecretoSuperSeguro123!ChangeMe"

# URLs
APP_URL="http://SEU_IP_AWS:8080"
MASTER_API_URL="https://master.command-d.com.br"

# License (cada locadora terá sua própria)
LICENSE_API_KEY="seu-api-key-aqui"

# Salvar: Ctrl + O, Enter, Ctrl + X
```

### 3.5 Configurar Banco de Dados

```bash
# Rodar migrations
npx prisma migrate deploy

# (Opcional) Seed inicial
npx prisma db seed
```

### 3.6 Build do Projeto

```bash
# Compilar projeto
npm run build
```

### 3.7 Iniciar com PM2

```bash
# Iniciar aplicação
pm2 start npm --name "command-d" -- start

# Configurar para iniciar automaticamente
pm2 startup
# Copie e execute o comando que aparecer

pm2 save

# Ver logs
pm2 logs command-d

# Ver status
pm2 status
```

Pronto! Sistema rodando em: `http://SEU_IP_AWS:8080`

---

## 🤖 PASSO 4: CONFIGURAR GITHUB ACTIONS (DEPLOY AUTOMÁTICO)

### 4.1 Criar Secrets no GitHub

```
1. Acesse: https://github.com/hidanz98/Command--D-v1.0/settings/secrets/actions

2. Clique em "New repository secret"

3. Crie os seguintes secrets:

   Nome: AWS_HOST
   Valor: SEU_IP_AWS
   
   Nome: AWS_USERNAME
   Valor: ubuntu
   
   Nome: AWS_SSH_KEY
   Valor: [Conteúdo do arquivo command-d-key.pem]
   
   Como pegar o conteúdo da key:
   - Windows: Get-Content ~/.ssh/command-d-key.pem | Set-Clipboard
   - Cole tudo no campo Value
```

### 4.2 Workflow já está criado!

O arquivo `.github/workflows/deploy-aws.yml` já existe no seu repositório! 

Ele faz automaticamente:
- ✅ Detecta push na branch main
- ✅ Conecta via SSH ao servidor AWS
- ✅ Faz git pull do código atualizado
- ✅ Instala dependências
- ✅ Roda migrations
- ✅ Faz build
- ✅ Reinicia PM2
- ✅ Sistema atualizado!

---

## 🎯 PASSO 5: TESTAR DEPLOY AUTOMÁTICO

### 5.1 Fazer uma alteração

```bash
# No seu computador
cd Command--D-v1.0

# Editar um arquivo (exemplo: README.md)
echo "# Sistema atualizado via GitHub Actions!" >> README.md

# Commit e Push
git add .
git commit -m "Teste de deploy automático"
git push origin main
```

### 5.2 Acompanhar Deploy

```
1. Vá em: https://github.com/hidanz98/Command--D-v1.0/actions

2. Você verá o workflow rodando em tempo real!

3. Acompanhe os logs:
   - Connect to AWS
   - Pull latest code
   - Install dependencies
   - Run migrations
   - Build project
   - Restart PM2
   
4. Se tudo der certo: ✅ Green check

5. Se der erro: ❌ Red X (clique para ver logs)
```

### 5.3 Verificar Atualização

```bash
# Acessar servidor
ssh -i ~/.ssh/command-d-key.pem ubuntu@SEU_IP_AWS

# Ver logs do PM2
pm2 logs command-d

# Verificar se atualizou
cd /home/ubuntu/command-d
git log --oneline -5
```

---

## 🔒 PASSO 6: CONFIGURAR DOMÍNIO (OPCIONAL)

### 6.1 Comprar Domínio

```
1. Registro.br (para .com.br)
2. GoDaddy / Namecheap (para .com)
3. Cloudflare (registrar + DNS + CDN)
```

### 6.2 Configurar DNS

```
Adicionar registros DNS:

Tipo: A
Nome: @
Valor: SEU_IP_AWS
TTL: 3600

Tipo: A
Nome: www
Valor: SEU_IP_AWS
TTL: 3600

Tipo: CNAME
Nome: api
Valor: command-d.com.br
TTL: 3600
```

### 6.3 Instalar NGINX

```bash
# Conectar ao servidor
ssh -i ~/.ssh/command-d-key.pem ubuntu@SEU_IP_AWS

# Instalar NGINX
sudo apt install -y nginx

# Criar configuração
sudo nano /etc/nginx/sites-available/command-d
```

Adicionar:

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br www.seu-dominio.com.br;

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

# Testar configuração
sudo nginx -t

# Reiniciar NGINX
sudo systemctl restart nginx
```

### 6.4 Instalar SSL (HTTPS)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL (gratuito)
sudo certbot --nginx -d seu-dominio.com.br -d www.seu-dominio.com.br

# Renovação automática já está configurada!
```

Pronto! Sistema acessível em: `https://seu-dominio.com.br`

---

## 📊 CUSTOS MENSAIS ESTIMADOS

### Opção Básica (IP Fixo + HTTP)
```
EC2 t3.small:        ~US$ 15/mês
Elastic IP:          US$ 0 (enquanto associado)
Transfer (100GB):    US$ 0 (free tier)
Total:               ~US$ 15/mês (~R$ 75/mês)
```

### Opção Completa (com domínio + SSL)
```
EC2 t3.small:        ~US$ 15/mês
Elastic IP:          US$ 0
Domínio .com.br:     R$ 40/ano
SSL (Let's Encrypt): Grátis
Total:               ~US$ 15/mês + R$ 40/ano
```

---

## 🎯 FLUXO COMPLETO DE TRABALHO

### Desenvolvimento Local
```bash
# 1. Fazer alterações no código
code .

# 2. Testar localmente
npm run dev
# Acessar: http://localhost:8080

# 3. Commit
git add .
git commit -m "Adiciona nova feature X"

# 4. Push (deploy automático!)
git push origin main
```

### O que acontece automaticamente:
```
1. GitHub Actions detecta push
2. Conecta ao servidor AWS via SSH
3. Atualiza código (git pull)
4. Instala novas dependências
5. Roda migrations do banco
6. Compila projeto
7. Reinicia servidor
8. Sistema atualizado em ~2-3 minutos!
```

### Monitorar Deploy
```
1. GitHub Actions: https://github.com/hidanz98/Command--D-v1.0/actions
2. Logs do servidor: pm2 logs command-d
3. Status: pm2 status
```

---

## 🚨 COMANDOS ÚTEIS

### Conectar ao Servidor
```bash
ssh -i ~/.ssh/command-d-key.pem ubuntu@SEU_IP_AWS
```

### Ver Logs
```bash
pm2 logs command-d        # Logs em tempo real
pm2 logs command-d --lines 100  # Últimas 100 linhas
```

### Reiniciar Aplicação
```bash
pm2 restart command-d
```

### Ver Status
```bash
pm2 status
pm2 monit  # Monitor interativo
```

### Atualizar Manualmente
```bash
cd /home/ubuntu/command-d
git pull origin main
npm install
npm run build
pm2 restart command-d
```

### Ver Processos
```bash
pm2 list
pm2 info command-d
```

### Banco de Dados
```bash
# Conectar ao PostgreSQL
sudo -u postgres psql commandd_prod

# Backup
pg_dump -U commandd commandd_prod > backup.sql

# Restore
psql -U commandd commandd_prod < backup.sql
```

---

## 🔧 TROUBLESHOOTING

### Deploy falhou no GitHub Actions

**Erro: "Permission denied (publickey)"**
```
Solução:
1. Verifique se o secret AWS_SSH_KEY está correto
2. Copie TODO conteúdo do arquivo .pem
3. Inclua as linhas:
   -----BEGIN RSA PRIVATE KEY-----
   ...
   -----END RSA PRIVATE KEY-----
```

**Erro: "npm install failed"**
```
Solução:
1. SSH no servidor
2. Verificar espaço em disco: df -h
3. Limpar cache: npm cache clean --force
4. Tentar manualmente: npm install
```

### Sistema não inicia

**Erro: "EADDRINUSE: Port 8080 already in use"**
```bash
# Ver o que está usando a porta
sudo lsof -i :8080

# Matar processo
pm2 kill
pm2 start npm --name "command-d" -- start
```

**Erro: "Database connection failed"**
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Testar conexão
psql -U commandd -d commandd_prod -h localhost
```

### Site fora do ar

```bash
# 1. Verificar PM2
pm2 status
pm2 restart command-d

# 2. Verificar NGINX (se usando)
sudo systemctl status nginx
sudo systemctl restart nginx

# 3. Ver logs
pm2 logs command-d --lines 50

# 4. Verificar disco
df -h

# 5. Verificar memória
free -h
```

---

## 📋 CHECKLIST DE DEPLOY

### Antes do Primeiro Deploy
- [ ] Conta AWS criada
- [ ] EC2 criado (t3.small)
- [ ] Elastic IP associado
- [ ] SSH funcionando
- [ ] Node.js instalado
- [ ] PostgreSQL configurado
- [ ] PM2 instalado
- [ ] Repositório clonado
- [ ] .env configurado
- [ ] Banco migrado
- [ ] Sistema funcionando (http://IP:8080)
- [ ] PM2 configurado para startup
- [ ] Secrets no GitHub configurados
- [ ] GitHub Actions testado

### Antes de cada Deploy
- [ ] Código testado localmente
- [ ] Migrations criadas (se necessário)
- [ ] .env atualizado (se necessário)
- [ ] Commit com mensagem descritiva
- [ ] Push para main

### Após Deploy
- [ ] GitHub Actions passou ✅
- [ ] Site acessível
- [ ] Funcionalidades testadas
- [ ] Logs sem erros
- [ ] Performance OK

---

## 🎓 PRÓXIMOS PASSOS

### 1. Monitoramento
```bash
# Instalar monitoring
pm2 install pm2-logrotate  # Rotacionar logs
pm2 set pm2-logrotate:max_size 10M
```

### 2. Backups Automáticos
```bash
# Criar script de backup
nano ~/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U commandd commandd_prod > /home/ubuntu/backups/backup_$DATE.sql
find /home/ubuntu/backups -name "backup_*.sql" -mtime +7 -delete
```

```bash
# Dar permissão
chmod +x ~/backup.sh

# Agendar (diário às 3h)
crontab -e
# Adicionar: 0 3 * * * /home/ubuntu/backup.sh
```

### 3. Monitoring Externo
- ✅ UptimeRobot (grátis): https://uptimerobot.com
- ✅ Pingdom (grátis 1 site)
- ✅ StatusCake (grátis)

---

## 🎉 CONCLUSÃO

Agora você tem:
- ✅ Sistema rodando na AWS
- ✅ Deploy automático via Git
- ✅ Backup do banco
- ✅ Monitoring
- ✅ SSL/HTTPS (opcional)
- ✅ Domínio próprio (opcional)

**Fluxo de trabalho:**
```
1. Editar código localmente
2. git push origin main
3. GitHub Actions faz deploy automático
4. Sistema atualizado em ~2-3 minutos!
```

**Pronto para produção! 🚀**

---

## 📞 SUPORTE

Se tiver dúvidas ou problemas:
1. Verifique logs: `pm2 logs command-d`
2. GitHub Actions logs
3. Consulte este documento
4. Entre em contato com suporte

**Sucesso com seu deploy! 🎊**

