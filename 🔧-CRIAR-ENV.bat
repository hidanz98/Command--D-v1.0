@echo off
echo ========================================
echo   CRIAR ARQUIVO .env - COMMAND-D
echo ========================================
echo.
echo Criando arquivo .env com configuracoes de desenvolvimento...
echo.

(
echo # ==================================================
echo # CONFIGURACAO DO SISTEMA COMMAND-D - DESENVOLVIMENTO
echo # ==================================================
echo.
echo # ----- BANCO DE DADOS DA LOCADORA ^(Local^) -----
echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/commandd?schema=public"
echo.
echo # ----- LICENCIAMENTO ^(Opcional em desenvolvimento^) -----
echo LICENSE_API_KEY="dev_mode"
echo LICENSE_API_SECRET="dev_mode"
echo MASTER_API_URL="http://localhost:8080"
echo.
echo # ----- APLICACAO -----
echo NODE_ENV="development"
echo PORT=8080
echo APP_VERSION="1.0.0"
echo.
echo # ----- JWT ^(Autenticacao^) -----
echo JWT_SECRET="desenvolvimento_chave_secreta_super_segura_123456"
echo.
echo # ----- FEATURES -----
echo ENABLE_PARTNERSHIPS="false"
echo ENABLE_HEARTBEAT="false"
echo ENABLE_AUTO_UPDATES="false"
echo ENABLE_TELEMETRY="false"
echo.
echo # ----- DESENVOLVIMENTO -----
echo DEBUG_MODE="true"
echo LOG_LEVEL="debug"
) > .env

echo.
echo ========================================
echo   ARQUIVO .env CRIADO COM SUCESSO!
echo ========================================
echo.
echo IMPORTANTE: Configure o PostgreSQL
echo.
echo 1. Instale o PostgreSQL:
echo    https://www.postgresql.org/download/
echo.
echo 2. Crie o banco de dados:
echo    psql -U postgres
echo    CREATE DATABASE commandd;
echo.
echo 3. Execute as migracoes:
echo    npm run db:push
echo.
echo 4. Adicione dados de teste:
echo    npm run db:seed
echo.
pause

