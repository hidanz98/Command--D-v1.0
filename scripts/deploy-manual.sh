#!/bin/bash
# 🚀 Script de Deploy Manual Rápido
# Execute no seu computador local

set -e

echo "========================================="
echo "🚀 DEPLOY MANUAL - COMMAND-D"
echo "========================================="
echo ""

# Verificar se tem argumentos
if [ -z "$1" ]; then
    echo "Uso: ./deploy-manual.sh SERVIDOR"
    echo "Exemplo: ./deploy-manual.sh ubuntu@54.123.45.67"
    exit 1
fi

SERVER=$1
APP_DIR="/home/ubuntu/app"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# 1. Build local
print_info "Fazendo build local..."
npm run build
print_success "Build concluído"

# 2. Criar pacote
print_info "Criando pacote de deploy..."
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.env.local' \
    -czf deploy.tar.gz \
    dist/ \
    package.json \
    package-lock.json \
    server/ \
    prisma/ \
    client/
print_success "Pacote criado"

# 3. Enviar para servidor
print_info "Enviando para servidor..."
scp -o StrictHostKeyChecking=no deploy.tar.gz $SERVER:$APP_DIR/
print_success "Arquivos enviados"

# 4. Deploy no servidor
print_info "Executando deploy no servidor..."
ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
    cd /home/ubuntu/app
    
    # Fazer backup da versão atual
    if [ -d "dist" ]; then
        tar -czf ../backup-$(date +%Y%m%d-%H%M%S).tar.gz dist/ server/
        echo "✓ Backup criado"
    fi
    
    # Extrair novo deploy
    tar -xzf deploy.tar.gz
    echo "✓ Arquivos extraídos"
    
    # Instalar dependências
    npm install --production
    echo "✓ Dependências instaladas"
    
    # Rodar migrações
    npx prisma migrate deploy
    echo "✓ Migrações executadas"
    
    # Reiniciar aplicação
    pm2 restart command-d 2>/dev/null || pm2 start ecosystem.config.js
    pm2 save
    echo "✓ Aplicação reiniciada"
    
    # Limpar
    rm -f deploy.tar.gz
    
    echo ""
    echo "========================================="
    echo "✅ DEPLOY CONCLUÍDO!"
    echo "========================================="
ENDSSH

# 5. Limpar local
rm -f deploy.tar.gz
print_success "Limpeza local concluída"

# 6. Ver logs
echo ""
print_info "Verificando logs..."
ssh $SERVER "pm2 logs command-d --lines 20 --nostream"

echo ""
print_success "Deploy concluído com sucesso!"
echo ""
echo "Para ver logs em tempo real:"
echo "ssh $SERVER \"pm2 logs command-d\""

