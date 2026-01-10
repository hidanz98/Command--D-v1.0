# Monitor de Comandos do iPhone para o Claude/Cursor
# Fica rodando em background e mostra quando chega comando

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MONITOR IPHONE -> CURSOR ATIVO!    " -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Aguardando comandos do iPhone..." -ForegroundColor Yellow
Write-Host "Porta: 8080 | Senha: 050518" -ForegroundColor DarkGray
Write-Host ""

$lastCommandId = ""

while ($true) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/remote-ai/cursor/commands" -Method GET -ErrorAction SilentlyContinue
        
        if ($response.count -gt 0) {
            foreach ($cmd in $response.commands) {
                if ($cmd.id -ne $lastCommandId) {
                    $lastCommandId = $cmd.id
                    
                    Write-Host ""
                    Write-Host "============================================" -ForegroundColor Green
                    Write-Host " COMANDO DO IPHONE RECEBIDO!" -ForegroundColor Green
                    Write-Host "============================================" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "Comando: " -NoNewline -ForegroundColor White
                    Write-Host $cmd.command -ForegroundColor Yellow
                    Write-Host "Hora: " -NoNewline -ForegroundColor White
                    Write-Host $cmd.timestamp -ForegroundColor Gray
                    Write-Host "ID: " -NoNewline -ForegroundColor White
                    Write-Host $cmd.id -ForegroundColor Gray
                    Write-Host ""
                    Write-Host ">>> COLE NO CURSOR: veja iphone" -ForegroundColor Magenta
                    Write-Host ""
                    
                    # Toca um beep para chamar atenção
                    [console]::beep(1000, 300)
                    [console]::beep(1500, 300)
                }
            }
        }
    }
    catch {
        # Silencioso se der erro
    }
    
    Start-Sleep -Seconds 2
}

