#!/bin/bash
# 🚀 Script de Setup Automático do Servidor AWS
# Execute este script no servidor EC2 Ubuntu

set -e  # Parar se houver erro

echo "========================================="
echo "🚀 SETUP SERVIDOR AWS - COMMAND-D"
echo "========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para printar com cor
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then 
    print_error "Não execute como root. Use: bash setup-aws-server.sh"
    exit 1
fi

# 1. Atualizar sistema
print_info "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y
print_success "Sistema atualizado"

# 2. Instalar Node.js 18
print_info "Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
print_success "Node.js instalado: $(node --version)"

# 3. Instalar PostgreSQL
print_info "Instalando PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
print_success "PostgreSQL instalado"

# 4. Configurar PostgreSQL
print_info "Configurando banco de dados..."
read -p "Digite a senha do banco de dados: " DB_PASSWORD

sudo -u postgres psql << EOF
CREATE DATABASE command_d_db;
CREATE USER command_d_user WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE command_d_db TO command_d_user;
ALTER DATABASE command_d_db OWNER TO command_d_user;
\q
EOF
print_success "Banco de dados configurado"

# 5. Instalar PM2
print_info "Instalando PM2..."
sudo npm install -g pm2
pm2 startup | tail -1 | sudo bash
print_success "PM2 instalado"

# 6. Instalar nginx
print_info "Instalando nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
print_success "nginx instalado"

# 7. Configurar nginx
print_info "Configurando nginx..."
read -p "Digite seu domínio (ex: meusite.com.br): " DOMAIN

sudo tee /etc/nginx/sites-available/command-d > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        client_max_body_size 50M;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/command-d /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
print_success "nginx configurado"

# 8. Instalar Certbot (SSL)
print_info "Instalando Certbot..."
sudo apt install -y certbot python3-certbot-nginx
print_success "Certbot instalado"

echo ""
print_info "Para configurar SSL, execute:"
echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""

# 9. Criar estrutura de diretórios
print_info "Criando diretórios..."
mkdir -p /home/ubuntu/app
mkdir -p /home/ubuntu/backups
mkdir -p /home/ubuntu/app/logs
print_success "Diretórios criados"

# 10. Criar arquivo .env
print_info "Criando arquivo .env..."
read -p "Digite o JWT_SECRET (deixe vazio para gerar): " JWT_SECRET

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -hex 32)
fi

cat > /home/ubuntu/app/.env << EOF
# Database
DATABASE_URL="postgresql://command_d_user:$DB_PASSWORD@localhost:5432/command_d_db"

# JWT
JWT_SECRET="$JWT_SECRET"

# App
NODE_ENV="production"
PORT=8080

# Licenciamento (configurar depois)
# LICENSE_API_KEY=""
# MASTER_API_URL=""
EOF
print_success "Arquivo .env criado"

# 11. Criar ecosystem.config.js
print_info "Criando ecosystem.config.js..."
cat > /home/ubuntu/app/ecosystem.config.js << 'EOF'
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
    time: true,
    max_memory_restart: '1G',
    exp_backoff_restart_delay: 100
  }]
};
EOF
print_success "ecosystem.config.js criado"

# 12. Configurar Firewall
print_info "Configurando Firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable
print_success "Firewall configurado"

# 13. Instalar fail2ban
print_info "Instalando fail2ban..."
sudo apt install -y fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
print_success "fail2ban instalado"

# 14. Criar script de backup
print_info "Criando script de backup..."
cat > /home/ubuntu/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"

# Backup do banco
pg_dump -U command_d_user command_d_db > $BACKUP_DIR/db_$DATE.sql

# Backup dos arquivos (exceto node_modules)
tar --exclude='node_modules' --exclude='dist' \
    -czf $BACKUP_DIR/app_$DATE.tar.gz /home/ubuntu/app

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup concluído: $DATE"
EOF

chmod +x /home/ubuntu/backup.sh

# Adicionar ao cron
(crontab -l 2>/dev/null; echo "0 3 * * * /home/ubuntu/backup.sh") | crontab -
print_success "Script de backup criado e agendado (3h diariamente)"

# 15. Finalizar
echo ""
echo "========================================="
echo "✅ SETUP CONCLUÍDO COM SUCESSO!"
echo "========================================="
echo ""
echo "📋 INFORMAÇÕES IMPORTANTES:"
echo ""
echo "🔐 Credenciais do Banco:"
echo "   Database: command_d_db"
echo "   User: command_d_user"
echo "   Password: $DB_PASSWORD"
echo ""
echo "🔑 JWT Secret:"
echo "   $JWT_SECRET"
echo ""
echo "📁 Diretórios:"
echo "   App: /home/ubuntu/app"
echo "   Logs: /home/ubuntu/app/logs"
echo "   Backups: /home/ubuntu/backups"
echo ""
echo "🌐 Domínio: $DOMAIN"
echo ""
echo "📝 PRÓXIMOS PASSOS:"
echo ""
echo "1. Configurar SSL:"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "2. Fazer primeiro deploy:"
echo "   cd /home/ubuntu/app"
echo "   git clone SEU_REPOSITORIO ."
echo "   npm install"
echo "   npm run build"
echo "   npx prisma migrate deploy"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo ""
echo "3. Ver logs:"
echo "   pm2 logs command-d"
echo ""
echo "========================================="

