#!/bin/bash
# ==========================================
# SETUP COMPLETO - NOVA INSTÂNCIA AWS
# Sistema Command-D
# ==========================================

echo "🚀 Iniciando setup da nova instância AWS..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ==========================================
# PASSO 1: ATUALIZAR SISTEMA
# ==========================================
echo "${YELLOW}📦 Passo 1/7: Atualizando sistema...${NC}"
sudo apt update && sudo apt upgrade -y
echo "${GREEN}✅ Sistema atualizado${NC}"
echo ""

# ==========================================
# PASSO 2: INSTALAR NODE.JS 20
# ==========================================
echo "${YELLOW}🟢 Passo 2/7: Instalando Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
echo "${GREEN}✅ Node.js instalado: $(node -v)${NC}"
echo ""

# ==========================================
# PASSO 3: INSTALAR PM2
# ==========================================
echo "${YELLOW}⚡ Passo 3/7: Instalando PM2...${NC}"
sudo npm install -g pm2
echo "${GREEN}✅ PM2 instalado: $(pm2 -v)${NC}"
echo ""

# ==========================================
# PASSO 4: INSTALAR E CONFIGURAR POSTGRESQL
# ==========================================
echo "${YELLOW}🐘 Passo 4/7: Instalando PostgreSQL...${NC}"
sudo apt install -y postgresql postgresql-contrib

# Iniciar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar banco e usuário
echo "Criando banco de dados..."
sudo -u postgres psql << EOF
CREATE DATABASE command_d;
CREATE USER command_admin WITH PASSWORD 'CommandD2024!Seguro';
GRANT ALL PRIVILEGES ON DATABASE command_d TO command_admin;
ALTER DATABASE command_d OWNER TO command_admin;
\q
EOF

echo "${GREEN}✅ PostgreSQL configurado${NC}"
echo ""

# ==========================================
# PASSO 5: CLONAR REPOSITÓRIO
# ==========================================
echo "${YELLOW}📥 Passo 5/7: Clonando repositório...${NC}"
cd /home/ubuntu
rm -rf sistema-command-d # Remover se existir

git clone https://github.com/hidanz98/Command--D-v1.0.git sistema-command-d
cd sistema-command-d

echo "${GREEN}✅ Repositório clonado${NC}"
echo ""

# ==========================================
# PASSO 6: CRIAR ARQUIVO .ENV
# ==========================================
echo "${YELLOW}⚙️  Passo 6/7: Criando arquivo .env...${NC}"

# Pegar IP público da instância
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

cat > .env << EOF
# Ambiente
NODE_ENV=production
PORT=8080

# Banco de Dados
DATABASE_URL="postgresql://command_admin:CommandD2024!Seguro@localhost:5432/command_d?schema=public"

# JWT Secret (gerado automaticamente)
JWT_SECRET="$(openssl rand -hex 32)"

# URLs
APP_URL="http://${PUBLIC_IP}:8080"

# Features
ENABLE_HEARTBEAT=false
ENABLE_PARTNERSHIPS=false
ENABLE_AUTO_UPDATES=false
EOF

echo "${GREEN}✅ Arquivo .env criado${NC}"
echo "   IP Público: ${PUBLIC_IP}"
echo ""

# ==========================================
# PASSO 7: INSTALAR, BUILD E INICIAR
# ==========================================
echo "${YELLOW}🔨 Passo 7/7: Instalando dependências e iniciando aplicação...${NC}"

# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Fazer push do schema para o banco
npx prisma db push --accept-data-loss

# Build da aplicação
npm run build

# Parar PM2 se estiver rodando
pm2 stop command-d 2>/dev/null || true
pm2 delete command-d 2>/dev/null || true

# Iniciar com PM2
pm2 start npm --name "command-d" -- start

# Configurar PM2 para iniciar no boot
pm2 startup
pm2 save

echo "${GREEN}✅ Aplicação iniciada${NC}"
echo ""

# ==========================================
# VERIFICAÇÃO FINAL
# ==========================================
echo "${YELLOW}🔍 Verificação final...${NC}"
echo ""

# Aguardar aplicação iniciar
sleep 5

# Verificar PM2
echo "Status PM2:"
pm2 status

echo ""
echo "Logs da aplicação:"
pm2 logs command-d --lines 20 --nostream

echo ""
echo "${GREEN}========================================${NC}"
echo "${GREEN}✅ SETUP COMPLETO!${NC}"
echo "${GREEN}========================================${NC}"
echo ""
echo "🌐 Acesse o sistema em: http://${PUBLIC_IP}:8080"
echo ""
echo "📝 Comandos úteis:"
echo "   pm2 status          - Ver status"
echo "   pm2 logs command-d  - Ver logs"
echo "   pm2 restart command-d - Reiniciar"
echo "   pm2 stop command-d  - Parar"
echo ""
echo "${YELLOW}⚠️  IMPORTANTE: Certifique-se de que a porta 8080 está liberada${NC}"
echo "${YELLOW}   no Security Group da AWS!${NC}"
echo ""

