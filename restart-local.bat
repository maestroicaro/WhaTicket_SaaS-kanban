@echo off
title WhatsApp Ticketing System - Restart Local
color 0A

echo ============================================
echo  WhatsApp Ticketing System - Restart Local
echo ============================================
echo.

echo [INFO] Parando processos existentes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo [INFO] Verificando backend...
cd backend

if not exist node_modules (
    echo [INFO] Instalando dependencias do backend...
    npm install
)

echo [INFO] Executando diagnostico do banco de dados...
npm run db:diagnose
if errorlevel 1 (
    echo [WARN] Problemas no banco detectados, executando migracoes...
    npm run db:migrate
    npm run db:seed
)

cd ..

echo [INFO] Verificando frontend...
cd frontend

if not exist node_modules (
    echo [INFO] Instalando dependencias do frontend...
    npm install
)

if not exist .env (
    echo [INFO] Criando arquivo .env do frontend...
    echo REACT_APP_BACKEND_URL=http://localhost:8080 > .env
    echo REACT_APP_HOURS_CLOSE_TICKETS_AUTO=24 >> .env
    echo REACT_APP_FACEBOOK_APP_ID= >> .env
    echo GENERATE_SOURCEMAP=false >> .env
    echo PORT=3001 >> .env
    echo NODE_OPTIONS=--openssl-legacy-provider >> .env
)

echo [INFO] Testando comunicacao API...
npm run test:api

cd ..

echo [INFO] Iniciando backend na porta 8080...
cd backend
start "Backend Server" cmd /k "npm run dev:server"
cd ..

echo [INFO] Aguardando backend inicializar...
timeout /t 10 >nul

echo [INFO] Iniciando frontend na porta 3001...
cd frontend
start "Frontend Server" cmd /k "set NODE_OPTIONS=--openssl-legacy-provider && npm start"
cd ..

echo.
echo ============================================
echo  Sistema iniciado!
echo ============================================
echo.
echo URLs do sistema:
echo   Frontend: http://localhost:3001
echo   Backend:  http://localhost:8080
echo.
echo Credenciais padrao:
echo   Email:    admin@admin.com
echo   Senha:    123456
echo.
echo Diagnosticos disponiveis:
echo   Backend:  cd backend ^&^& npm run db:diagnose
echo   Frontend: cd frontend ^&^& npm run test:api
echo.
echo Para parar os servicos, feche as janelas do terminal
echo ou execute stop-local.bat
echo.

pause