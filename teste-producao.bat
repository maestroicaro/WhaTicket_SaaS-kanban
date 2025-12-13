@echo off
title Diagnóstico de Produção - WhatsApp Ticketing
color 0A

echo ============================================
echo  Diagnóstico de Produção - Login Issues
echo ============================================
echo.

set FRONTEND_URL=https://automatizai-whaticket-kanban.ynbvqv.easypanel.host
set BACKEND_URL=https://automatizai-api-whaticket.ynbvqv.easypanel.host

echo Frontend: %FRONTEND_URL%
echo Backend:  %BACKEND_URL%
echo.

echo [1/5] Testando se backend responde...
curl -s -o nul -w "Status: %%{http_code} | Tempo: %%{time_total}s" %BACKEND_URL%
echo.
echo.

echo [2/5] Testando endpoint de login com credenciais inválidas...
curl -s -X POST %BACKEND_URL%/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"teste@invalido.com\",\"password\":\"senha_invalida\"}" ^
  -w "Status: %%{http_code} | Tempo: %%{time_total}s"
echo.
echo.

echo [3/5] Testando credenciais padrão (admin@admin.com / 123456)...
curl -s -X POST %BACKEND_URL%/auth/login ^
  -H "Content-Type: application/json" ^
  -H "Origin: %FRONTEND_URL%" ^
  -d "{\"email\":\"admin@admin.com\",\"password\":\"123456\"}" ^
  -w "Status: %%{http_code} | Tempo: %%{time_total}s" ^
  -c cookies.txt
echo.
echo.

echo [4/5] Testando CORS (preflight)...
curl -s -X OPTIONS %BACKEND_URL%/auth/login ^
  -H "Origin: %FRONTEND_URL%" ^
  -H "Access-Control-Request-Method: POST" ^
  -H "Access-Control-Request-Headers: Content-Type" ^
  -w "Status: %%{http_code} | Tempo: %%{time_total}s" ^
  -D headers.txt
echo.
echo.

echo [5/5] Verificando headers CORS...
if exist headers.txt (
  echo Headers de resposta:
  findstr /i "access-control" headers.txt
  del headers.txt
)
echo.

if exist cookies.txt (
  echo Cookies recebidos:
  type cookies.txt
  del cookies.txt
)

echo.
echo ============================================
echo  Diagnóstico Completo
echo ============================================
echo.
echo Se todos os testes retornaram:
echo - Teste 1: Status 200 ou 404 = Backend funcionando
echo - Teste 2: Status 401 = Endpoint de login OK
echo - Teste 3: Status 200 = Credenciais funcionam
echo - Teste 3: Status 401 = Problema no banco/seeding
echo - Teste 4: Status 200 = CORS OK
echo.
echo Próximos passos baseados nos resultados:
echo.
echo Se Teste 3 = Status 401:
echo   - Problema: Usuário admin não existe ou senha incorreta
echo   - Solução: Executar migrações e seeding no Easypanel
echo.
echo Se Teste 3 = Status 200 mas login no site falha:
echo   - Problema: Frontend não consegue se comunicar
echo   - Solução: Verificar REACT_APP_BACKEND_URL no frontend
echo.
echo Se Teste 1 falha:
echo   - Problema: Backend não está rodando
echo   - Solução: Verificar logs do container no Easypanel
echo.

pause