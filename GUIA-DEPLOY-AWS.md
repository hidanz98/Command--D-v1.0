# 🚀 GUIA DE DEPLOY AUTOMÁTICO - AWS

## 🎯 COMO FUNCIONA

```
1. Você faz alteração no código
   ↓
2. Salva e commita no Git
   ↓
3. Faz push para GitHub
   ↓
4. GitHub Actions detecta push
   ↓
5. Roda build automático
   ↓
6. Deploy automático na AWS
   ↓
7. Aplicação atualizada! ✅
```

---

## 📋 PRÉ-REQUISITOS

### 1. Conta AWS
- Acesso ao EC2
- Security Groups configurados
- Key Pair criada

### 2. Servidor EC2 Configurado
```bash
# Instância recomendada:
- Tipo: t3.medium (2 vCPU, 4GB RAM)
- OS: Ubuntu 22.04 LTS
- Storage: 30GB SSD

# Ou maior para produção:
- Tipo: t3.large (2 vCPU, 8GB RAM)
- Storage: 50GB SSD
```

### 3. Repositório GitHub
- Repositório público ou privado
- GitHub Actions habilitado

---

## 🔧 CONFIGURAÇÃO INICIAL

### PASSO 1: Preparar Servidor EC2

#### 1.1 Conectar no servidor
```bash
ssh -i sua-chave.pem ubuntu@SEU-IP-AWS
```

#### 1.2 Atualizar sistema
```bash
sudo apt update && sudo apt upgrade -y
```

#### 1.3 Instalar Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verificar instalação
```

#### 1.4 Instalar PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar banco de dados
sudo -u postgres psql << EOF
CREATE DATABASE command_d_db;
CREATE USER command_d_user WITH PASSWORD 'SUA_SENHA_AQUI';
GRANT ALL PRIVILEGES ON DATABASE command_d_db TO command_d_user;
\q
EOF
```

#### 1.5 Instalar PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 startup  # Copiar e executar o comando que aparecer
```

#### 1.6 Instalar nginx (Reverse Proxy)
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 1.7 Configurar nginx
```bash
sudo nano /etc/nginx/sites-available/command-d
```

Adicionar:
```nginx
server {
    listen 80;
    server_name SEU_DOMINIO.com www.SEU_DOMINIO.com;

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

Ativar:
```bash
sudo ln -s /etc/nginx/sites-available/command-d /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 1.8 Instalar SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d SEU_DOMINIO.com -d www.SEU_DOMINIO.com
```

#### 1.9 Criar diretório da aplicação
```bash
sudo mkdir -p /home/ubuntu/app
sudo chown -R ubuntu:ubuntu /home/ubuntu/app
cd /home/ubuntu/app
```

---

### PASSO 2: Configurar GitHub

#### 2.1 Adicionar Secrets no GitHub

Vá em: **Repositório → Settings → Secrets and variables → Actions**

Adicionar os seguintes secrets:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `AWS_ACCESS_KEY_ID` | `AKIA...` | Chave de acesso AWS |
| `AWS_SECRET_ACCESS_KEY` | `wJal...` | Chave secreta AWS |
| `EC2_HOST` | `54.123.45.67` | IP público do EC2 |
| `EC2_USER` | `ubuntu` | Usuário SSH |
| `DATABASE_URL` | `postgresql://...` | URL do banco |
| `JWT_SECRET` | `random-string` | Secret para JWT |

#### 2.2 Adicionar SSH Key

```bash
# No seu computador local, gerar chave SSH
ssh-keygen -t rsa -b 4096 -C "deploy@command-d" -f ~/.ssh/aws-deploy

# Copiar conteúdo da chave PÚBLICA
cat ~/.ssh/aws-deploy.pub

# No servidor EC2, adicionar a chave
nano ~/.ssh/authorized_keys
# Colar a chave pública
```

No GitHub Secrets, adicionar:
- Nome: `SSH_PRIVATE_KEY`
- Valor: Conteúdo de `~/.ssh/aws-deploy` (chave PRIVADA)

---

### PASSO 3: Configurar Aplicação

#### 3.1 Criar arquivo .env no servidor
```bash
nano /home/ubuntu/app/.env
```

Adicionar:
```env
# Database
DATABASE_URL="postgresql://command_d_user:SUA_SENHA@localhost:5432/command_d_db"

# JWT
JWT_SECRET="seu-secret-super-seguro-aqui"

# App
NODE_ENV="production"
PORT=8080

# Licenciamento (para depois)
LICENSE_API_KEY="gerar-depois"
MASTER_API_URL="https://master.command-d.com.br"
```

#### 3.2 Criar ecosystem.config.js para PM2
```bash
nano /home/ubuntu/app/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'command-d',
    script: './server/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

---

## 🚀 PRIMEIRO DEPLOY MANUAL

```bash
# No servidor EC2
cd /home/ubuntu/app

# Clonar repositório
git clone https://github.com/SEU_USUARIO/SEU_REPO.git .

# Instalar dependências
npm install

# Build
npm run build

# Rodar migrações
npx prisma migrate deploy

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save

# Ver logs
pm2 logs command-d
```

---

## 🔄 DEPLOY AUTOMÁTICO

### Agora toda vez que você:

```bash
# 1. Fazer alteração no código
# Editar arquivos...

# 2. Commitar
git add .
git commit -m "feat: adicionar nova funcionalidade"

# 3. Push
git push origin main
```

### O GitHub Actions vai:
1. ✅ Detectar o push
2. ✅ Instalar dependências
3. ✅ Fazer build
4. ✅ Rodar testes
5. ✅ Enviar para AWS
6. ✅ Reiniciar aplicação

### Ver progresso:
`GitHub → Actions → Ver workflow rodando`

---

## 📊 MONITORAMENTO

### Ver status da aplicação
```bash
ssh ubuntu@SEU_IP_AWS
pm2 status
pm2 logs command-d
pm2 monit
```

### Ver uso de recursos
```bash
htop
df -h  # Espaço em disco
free -h  # Memória
```

### Ver logs nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔥 COMANDOS ÚTEIS

### Reiniciar aplicação
```bash
pm2 restart command-d
```

### Parar aplicação
```bash
pm2 stop command-d
```

### Ver logs em tempo real
```bash
pm2 logs command-d --lines 100
```

### Limpar logs
```bash
pm2 flush
```

### Rollback (voltar versão anterior)
```bash
cd /home/ubuntu/app
git log --oneline  # Ver commits
git reset --hard COMMIT_HASH
npm install
npm run build
pm2 restart command-d
```

---

## 🔐 SEGURANÇA

### 1. Firewall (Security Groups AWS)
```
Inbound Rules:
- SSH (22): Apenas seu IP
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- PostgreSQL (5432): NEGADO (apenas local)

Outbound Rules:
- All traffic: 0.0.0.0/0
```

### 2. Fail2ban (Proteção contra ataques)
```bash
sudo apt install fail2ban -y
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 3. Firewall UFW
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

### 4. Backup automático
```bash
# Criar script de backup
nano /home/ubuntu/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

# Backup do banco
pg_dump -U command_d_user command_d_db > $BACKUP_DIR/db_$DATE.sql

# Backup dos arquivos
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /home/ubuntu/app

# Manter apenas últimos 7 dias
find $BACKUP_DIR -mtime +7 -delete

echo "Backup concluído: $DATE"
```

```bash
chmod +x /home/ubuntu/backup.sh

# Adicionar ao cron (rodar todo dia às 3h)
crontab -e
# Adicionar linha:
0 3 * * * /home/ubuntu/backup.sh
```

---

## 💰 CUSTOS ESTIMADOS AWS

### EC2 (sob demanda)
- **t3.medium**: ~$30/mês (desenvolvimento)
- **t3.large**: ~$60/mês (produção)
- **t3.xlarge**: ~$120/mês (alta demanda)

### Outros serviços
- **Elastic IP**: Grátis se associado
- **EBS (Storage)**: $0.10/GB/mês
- **Data Transfer**: Primeiros 100GB grátis
- **Backup S3**: $0.023/GB/mês

### Estimativa Total
```
Desenvolvimento: ~$35-50/mês
Produção (1 loja): ~$70-100/mês
Produção (múltiplas lojas): $200-500/mês
```

---

## 🎯 CHECKLIST DE DEPLOY

### Antes do primeiro deploy:
- [ ] Conta AWS criada
- [ ] EC2 configurado
- [ ] PostgreSQL instalado
- [ ] Node.js instalado
- [ ] PM2 instalado
- [ ] nginx configurado
- [ ] SSL configurado
- [ ] GitHub Secrets configurados
- [ ] SSH keys configuradas

### Após cada deploy:
- [ ] Verificar logs (`pm2 logs`)
- [ ] Testar aplicação no navegador
- [ ] Verificar banco de dados
- [ ] Testar funcionalidades críticas

---

## 📞 TROUBLESHOOTING

### Problema: Deploy falhou
```bash
# Ver logs do GitHub Actions
# GitHub → Actions → Ver log do erro

# Verificar no servidor
ssh ubuntu@SEU_IP_AWS
pm2 logs command-d --lines 200
```

### Problema: Aplicação não inicia
```bash
# Verificar .env
cat /home/ubuntu/app/.env

# Verificar banco de dados
psql -U command_d_user -d command_d_db -c "SELECT 1"

# Reiniciar PM2
pm2 kill
pm2 start ecosystem.config.js
```

### Problema: Erro 502 Bad Gateway
```bash
# Verificar se app está rodando
pm2 status

# Verificar nginx
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Configurar servidor AWS** ✅
2. **Primeiro deploy manual** ✅
3. **Configurar GitHub Actions** ✅
4. **Testar deploy automático** ✅
5. **Configurar monitoramento**
6. **Configurar backups**
7. **Adicionar mais locadoras**

---

## 💡 DICAS PROFISSIONAIS

### Use branches para desenvolvimento
```bash
# Criar branch de desenvolvimento
git checkout -b development

# Fazer alterações...
git add .
git commit -m "feat: nova funcionalidade"
git push origin development

# Testar em staging
# Se OK, fazer merge para main
git checkout main
git merge development
git push origin main  # Deploy automático!
```

### Monitoramento em tempo real
```bash
# Instalar ferramentas
npm install -g pm2-logrotate
pm2 install pm2-logrotate

# Ver métricas
pm2 monit
```

---

**PRONTO PARA COMEÇAR! 🎉**

Me diga quando quiser fazer o primeiro deploy!

