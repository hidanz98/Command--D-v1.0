@echo off
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║           🐘 INICIAR POSTGRESQL - DOCKER                      ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo Verificando se Docker está instalado...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Docker não está instalado!
    echo.
    echo 📥 Baixe e instale o Docker Desktop:
    echo    https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)
echo ✅ Docker instalado!
echo.
echo Verificando se já existe container do PostgreSQL...
docker ps -a | findstr commandd-db >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Container já existe, iniciando...
    docker start commandd-db
) else (
    echo ⚙️  Criando novo container PostgreSQL...
    docker run --name commandd-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=commandd -p 5432:5432 -d postgres
)
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo ✅ POSTGRESQL RODANDO!
echo.
echo 📊 Informações de conexão:
echo    Host: localhost
echo    Port: 5432
echo    Database: commandd
echo    User: postgres
echo    Password: postgres
echo.
echo 💡 Comandos úteis:
echo    Ver logs:     docker logs commandd-db
echo    Parar:        docker stop commandd-db
echo    Remover:      docker rm commandd-db
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
pause

