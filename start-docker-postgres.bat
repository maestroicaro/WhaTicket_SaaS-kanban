@echo off
title PostgreSQL via Docker - WhatsApp Ticketing
color 0A

echo ============================================
echo  Iniciando PostgreSQL via Docker
echo ============================================
echo.

echo [INFO] Verificando Docker...
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Docker Desktop não está rodando. Tentando iniciar...
    
    REM Tentar encontrar Docker Desktop
    if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
        echo [INFO] Iniciando Docker Desktop...
        start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
    ) else if exist "%LOCALAPPDATA%\Programs\Docker\Docker Desktop.exe" (
        echo [INFO] Iniciando Docker Desktop...
        start "" "%LOCALAPPDATA%\Programs\Docker\Docker Desktop.exe"
    ) else (
        echo [ERRO] Docker Desktop não encontrado!
        echo Por favor, inicie o Docker Desktop manualmente e execute este script novamente.
        pause
        exit /b 1
    )
    
    echo [INFO] Aguardando Docker Desktop inicializar...
    echo [INFO] Isso pode demorar 1-2 minutos...
    
    :wait_docker
    timeout /t 10 >nul
    docker version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [INFO] Ainda aguardando Docker...
        goto wait_docker
    )
)

echo [OK] Docker está rodando!
echo.

echo [INFO] Verificando se PostgreSQL já está rodando...
docker ps | findstr whaticket-postgres >nul
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL já está rodando!
    goto test_connection
)

echo [INFO] Parando containers PostgreSQL existentes...
docker stop whaticket-postgres >nul 2>&1
docker rm whaticket-postgres >nul 2>&1

echo [INFO] Iniciando PostgreSQL via Docker Compose...
docker-compose -f docker-compose-postgres.yml up -d

if %errorlevel% neq 0 (
    echo [ERRO] Falha ao iniciar PostgreSQL via Docker Compose
    echo [INFO] Tentando método alternativo...
    
    docker run -d ^
        --name whaticket-postgres ^
        -e POSTGRES_USER=whaticket ^
        -e POSTGRES_PASSWORD=whaticket123 ^
        -e POSTGRES_DB=whaticket ^
        -p 5432:5432 ^
        postgres:13
)

echo [INFO] Aguardando PostgreSQL inicializar...
timeout /t 15 >nul

:test_connection
echo [INFO] Testando conexão com banco de dados...
cd backend
npm run db:diagnose

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo  PostgreSQL configurado com sucesso!
    echo ============================================
    echo.
    echo [OK] Banco de dados funcionando!
    echo.
    echo Próximos passos:
    echo   1. Execute: .\restart-local.bat
    echo   2. Ou execute manualmente:
    echo      - Backend: cd backend ^&^& npm run dev:server
    echo      - Frontend: cd frontend ^&^& npm start
    echo.
) else (
    echo.
    echo [AVISO] Conexão com banco ainda não está funcionando
    echo [INFO] Executando migrações...
    npm run db:migrate
    npm run db:seed
    
    echo.
    echo [INFO] Testando novamente...
    npm run db:diagnose
)

echo.
echo Para parar o PostgreSQL:
echo   docker stop whaticket-postgres
echo.
pause