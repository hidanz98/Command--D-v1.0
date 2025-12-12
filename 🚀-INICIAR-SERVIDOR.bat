@echo off
echo ========================================
echo    INICIANDO SERVIDOR - COMMAND-D
echo ========================================
echo.
echo Porta: 8080
echo URL: http://localhost:8080
echo.
echo Aguarde o servidor iniciar...
echo.

cd /d "%~dp0"
npm run dev

pause

