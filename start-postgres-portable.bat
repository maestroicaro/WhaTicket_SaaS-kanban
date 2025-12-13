@echo off
title PostgreSQL Portable - WhatsApp Ticketing
color 0A

echo ============================================
echo  PostgreSQL Portable para WhatsApp Ticketing
echo ============================================
echo.

echo [INFO] Verificando se PostgreSQL está rodando...
netstat -ano | findstr :5432 >nul
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL já está rodando na porta 5432!
    goto test_connection
)

echo [INFO] PostgreSQL não encontrado. Vamos configurar...
echo.

REM Verificar se já existe uma instalação portable
if exist "postgres-portable" (
    echo [INFO] Encontrada instalação PostgreSQL portable existente
    goto start_existing
)

echo [INFO] Baixando PostgreSQL Portable...
echo [AVISO] Isso pode demorar alguns minutos na primeira vez...
echo.

REM Criar diretório
mkdir postgres-portable 2>nul
cd postgres-portable

REM Baixar PostgreSQL portable (versão 13)
echo [INFO] Baixando PostgreSQL 13 Portable...
powershell -Command "& {Invoke-WebRequest -Uri 'https://get.enterprisedb.com/postgresql/postgresql-13.13-1-windows-x64-binaries.zip' -OutFile 'postgresql.zip'}"

if not exist postgresql.zip (
    echo [ERRO] Falha no download. Tentando método alternativo...
    echo [INFO] Por favor, baixe manualmente PostgreSQL portable de:
    echo https://www.enterprisedb.com/download-postgresql-binaries
    echo.
    echo Ou use Docker Desktop se disponível.
    pause
    exit /b 1
)

echo [INFO] Extraindo PostgreSQL...
powershell -Command "& {Expand-Archive -Path 'postgresql.zip' -DestinationPath '.' -Force}"

REM Inicializar banco de dados
echo [INFO] Inicializando banco de dados...
pgsql\bin\initdb.exe -D data -U postgres --auth-local=trust --auth-host=md5

:start_existing
echo [INFO] Iniciando PostgreSQL...
cd postgres-portable
start /b pgsql\bin\pg_ctl.exe -D data -l logfile start

echo [INFO] Aguardando PostgreSQL inicializar...
timeout /t 5 >nul

echo [INFO] Criando usuário e banco de dados...
pgsql\bin\createuser.exe -U postgres -s whaticket 2>nul
pgsql\bin\createdb.exe -U postgres -O whaticket whaticket 2>nul
pgsql\bin\psql.exe -U postgres -c "ALTER USER whaticket PASSWORD 'whaticket123';" 2>nul

cd ..

:test_connection
echo.
echo [INFO] Testando conexão...
cd backend
npm run db:diagnose

if %errorlevel% equ 0 (
    echo.
    echo [OK] PostgreSQL configurado com sucesso!
    echo.
    echo Credenciais:
    echo   Host: localhost
    echo   Port: 5432
    echo   Database: whaticket
    echo   User: whaticket
    echo   Password: whaticket123
    echo.
    echo Agora você pode executar:
    echo   .\restart-local.bat
) else (
    echo.
    echo [ERRO] Problemas na configuração do PostgreSQL
    echo Tente executar manualmente:
    echo   cd backend
    echo   npm run db:migrate
    echo   npm run db:seed
)

echo.
pause