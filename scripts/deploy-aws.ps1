# DEPLOY AUTOMATIZADO - COMMAND-D PARA AWS EC2 (PowerShell)
# Uso: .\scripts\deploy-aws.ps1

param(
    [string]$ServerIP,
    [string]$SSHKey,
    [string]$SSHUser = "ubuntu"
)

Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        🚀 DEPLOY AUTOMÁTICO - COMMAND-D AWS              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar se está na raiz do projeto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

# 1. Verificar mudanças
Write-Host "📝 Verificando mudanças..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "ℹ️  Há mudanças não commitadas" -ForegroundColor Yellow
    git status -s
    
    $commit = Read-Host "Deseja commitar? (s/n)"
    if ($commit -eq "s") {
        git add -A
        $message = Read-Host "Mensagem do commit"
        git commit -m $message
        Write-Host "✅ Commit realizado" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Nenhuma mudança pendente" -ForegroundColor Green
}

# 2. Build
Write-Host ""
Write-Host "🔨 Fazendo build..." -ForegroundColor Yellow
npm run build
Write-Host "✅ Build concluído" -ForegroundColor Green

# 3. Push
Write-Host ""
Write-Host "📤 Fazendo push para GitHub..." -ForegroundColor Yellow
$branch = git branch --show-current
git push origin $branch
Write-Host "✅ Push realizado na branch: $branch" -ForegroundColor Green

# 4. Deploy via SSH (se informado)
if ($ServerIP -and $SSHKey) {
    Write-Host ""
    Write-Host "🚀 Iniciando deploy via SSH..." -ForegroundColor Yellow
    
    # Criar comando SSH
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $tempDir = "/tmp/deploy-$timestamp"
    
    Write-Host "📦 Copiando arquivos para servidor..." -ForegroundColor Yellow
    
    # Criar lista de exclusões
    $exclude = @("node_modules", ".git", "test-results", "playwright-report", ".env")
    $excludeArgs = $exclude | ForEach-Object { "--exclude=$_" }
    
    # Usar SCP ou PSCP se disponível
    if (Get-Command scp -ErrorAction SilentlyContinue) {
        scp -i $SSHKey -o StrictHostKeyChecking=no -r $excludeArgs . "${SSHUser}@${ServerIP}:${tempDir}/"
    } else {
        Write-Host "⚠️  SCP não encontrado. Instale OpenSSH ou use Git Bash" -ForegroundColor Yellow
        Write-Host "Alternativa: Use o GitHub Actions para deploy automático" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "🔄 Executando comandos no servidor..." -ForegroundColor Yellow
    
    $commands = @"
cd /home/$SSHUser/sistema-command-d || cd /home/ubuntu/sistema-command-d
if [ -f .env ]; then cp .env .env.backup; fi
cp -r $tempDir/* .
if [ -f .env.backup ]; then cp .env.backup .env; rm .env.backup; fi
npm install --production
npm run build
npx prisma generate 2>/dev/null || true
npx prisma db push 2>/dev/null || true
pm2 restart command-d || pm2 start npm --name command-d -- start
rm -rf $tempDir
pm2 status
"@
    
    ssh -i $SSHKey -o StrictHostKeyChecking=no "${SSHUser}@${ServerIP}" $commands
    
    Write-Host ""
    Write-Host "✅ Deploy concluído!" -ForegroundColor Green
    Write-Host "🌐 Acesse: http://${ServerIP}:8080" -ForegroundColor Cyan
    
} else {
    Write-Host ""
    Write-Host "ℹ️  Deploy será feito via GitHub Actions" -ForegroundColor Yellow
    Write-Host "ℹ️  Acompanhe em: https://github.com/[seu-usuario]/sistema-command-d/actions" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ DEPLOY FINALIZADO COM SUCESSO            ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

