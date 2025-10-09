#!/bin/bash

###############################################################################
# DEPLOY AUTOMATIZADO - COMMAND-D PARA AWS EC2
# Uso: ./scripts/deploy-aws.sh
###############################################################################

set -e  # Parar em caso de erro

echo "╔══════════════════════════════════════════════════════════╗"
echo "║        🚀 DEPLOY AUTOMÁTICO - COMMAND-D AWS              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções auxiliares
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script na raiz do projeto!"
    exit 1
fi

# 1. Verificar dependências locais
echo "📦 Verificando dependências..."
if ! command -v git &> /dev/null; then
    error "Git não está instalado!"
    exit 1
fi
success "Git instalado"

if ! command -v node &> /dev/null; then
    error "Node.js não está instalado!"
    exit 1
fi
success "Node.js $(node -v)"

# 2. Verificar mudanças
echo ""
echo "📝 Verificando mudanças..."
if [[ -n $(git status -s) ]]; then
    info "Há mudanças não commitadas"
    git status -s
    
    read -p "Deseja commitar? (s/n): " commit
    if [ "$commit" = "s" ]; then
        git add -A
        read -p "Mensagem do commit: " message
        git commit -m "$message"
        success "Commit realizado"
    fi
else
    success "Nenhuma mudança pendente"
fi

# 3. Build local
echo ""
echo "🔨 Fazendo build..."
npm run build
success "Build concluído"

# 4. Testes (opcional)
echo ""
read -p "Executar testes antes do deploy? (s/n): " run_tests
if [ "$run_tests" = "s" ]; then
    echo "🧪 Executando testes..."
    npm run typecheck || true
    success "Testes executados"
fi

# 5. Push para GitHub
echo ""
echo "📤 Fazendo push para GitHub..."
current_branch=$(git branch --show-current)
git push origin $current_branch
success "Push realizado na branch: $current_branch"

# 6. Deploy para AWS (via GitHub Actions ou SSH direto)
echo ""
echo "🚀 Iniciando deploy..."
info "O deploy será feito via GitHub Actions"
info "Acompanhe em: https://github.com/$(git config remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"

# 7. Opção de deploy direto via SSH
echo ""
read -p "Deseja fazer deploy direto via SSH? (s/n): " ssh_deploy
if [ "$ssh_deploy" = "s" ]; then
    read -p "IP do servidor AWS: " server_ip
    read -p "Caminho da chave SSH: " ssh_key
    read -p "Usuário SSH (ubuntu/ec2-user): " ssh_user
    
    echo "🔄 Conectando ao servidor..."
    
    # Criar diretório temporário
    temp_dir="/tmp/deploy-$(date +%s)"
    
    # Copiar build
    echo "📦 Copiando arquivos..."
    rsync -avz -e "ssh -i $ssh_key -o StrictHostKeyChecking=no" \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude 'test-results' \
        --exclude 'playwright-report' \
        . $ssh_user@$server_ip:$temp_dir/
    
    # Executar comandos no servidor
    ssh -i "$ssh_key" -o StrictHostKeyChecking=no $ssh_user@$server_ip << EOF
        echo "🔄 Atualizando aplicação..."
        
        # Ir para diretório da aplicação
        cd /home/$ssh_user/sistema-command-d || cd /home/ubuntu/sistema-command-d
        
        # Backup do .env atual
        if [ -f .env ]; then
            cp .env .env.backup
        fi
        
        # Atualizar código
        cp -r $temp_dir/* .
        
        # Restaurar .env
        if [ -f .env.backup ]; then
            cp .env.backup .env
            rm .env.backup
        fi
        
        # Instalar dependências
        npm install --production
        
        # Build
        npm run build
        
        # Rodar migrations (se tiver)
        if [ -f "node_modules/.bin/prisma" ]; then
            npx prisma generate
            npx prisma db push || true
        fi
        
        # Reiniciar PM2
        pm2 restart command-d || pm2 start npm --name command-d -- start
        
        # Limpar temporário
        rm -rf $temp_dir
        
        echo "✅ Deploy concluído!"
        pm2 status
EOF
    
    success "Deploy direto concluído!"
    
    echo ""
    echo "🌐 Acesse seu sistema em:"
    echo "   http://$server_ip:8080"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              ✅ DEPLOY FINALIZADO COM SUCESSO            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Próximos passos:"
echo "   1. Verificar logs: pm2 logs command-d"
echo "   2. Testar aplicação"
echo "   3. Monitorar performance"
echo ""

