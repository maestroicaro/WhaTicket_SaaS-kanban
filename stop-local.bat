@echo off
title WhatsApp Ticketing System - Stop Local
color 0C

echo ============================================
echo  WhatsApp Ticketing System - Stop Local
echo ============================================
echo.

echo [INFO] Parando todos os processos Node.js...
taskkill /f /im node.exe >nul 2>&1

echo [INFO] Parando processos nas portas 8080 e 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1

timeout /t 2 >nul

echo.
echo [OK] Todos os servicos foram finalizados!
echo.
echo Para reiniciar o sistema, execute:
echo   restart-local.bat
echo.

pause