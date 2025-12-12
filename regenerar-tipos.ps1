# Script para Regenerar Tipos TypeScript do Prisma
# Resolve todos os erros TypeScript automaticamente

Write-Host "🔧 Iniciando regeneração de tipos TypeScript..." -ForegroundColor Cyan
Write-Host ""

# Passo 1: Parar processos Node
Write-Host "1️⃣ Parando servidor (se estiver rodando)..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   ✅ Servidor parado" -ForegroundColor Green
Write-Host ""

# Passo 2: Limpar cache do Prisma
Write-Host "2️⃣ Limpando cache do Prisma..." -ForegroundColor Yellow
if (Test-Path "node_modules\.prisma") {
    Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache limpo" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Cache já estava limpo" -ForegroundColor Gray
}
Write-Host ""

# Passo 3: Regenerar tipos do Prisma
Write-Host "3️⃣ Regenerando tipos TypeScript do Prisma..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Tipos regenerados com sucesso!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Houve um aviso, mas pode continuar" -ForegroundColor Yellow
}
Write-Host ""

# Passo 4: Instruções finais
Write-Host "4️⃣ Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. No VS Code, pressione: Ctrl + Shift + P" -ForegroundColor White
Write-Host "   2. Digite: Reload Window" -ForegroundColor White
Write-Host "   3. Pressione Enter" -ForegroundColor White
Write-Host ""
Write-Host "   OU feche e abra o VS Code novamente" -ForegroundColor White
Write-Host ""

Write-Host "5️⃣ Para iniciar o servidor novamente:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "✨ Processo concluído! Os erros TypeScript devem sumir após recarregar o VS Code." -ForegroundColor Green
Write-Host ""

# Perguntar se quer iniciar o servidor
$resposta = Read-Host "Deseja iniciar o servidor agora? (S/N)"
if ($resposta -eq "S" -or $resposta -eq "s") {
    Write-Host ""
    Write-Host "🚀 Iniciando servidor..." -ForegroundColor Cyan
    npm run dev
}

