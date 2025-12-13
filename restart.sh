#!/bin/bash

# ============================================
# WhatsApp Ticketing System - Restart Script
# ============================================

echo "🚀 Iniciando WhatsApp Ticketing System..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] && [ ! -d "backend" ] && [ ! -d "frontend" ]; then
    print_error "Execute este script no diretório raiz do projeto!"
    exit 1
fi

# Função para matar processos nas portas
kill_port() {
    local port=$1
    print_status "Verificando porta $port..."
    
    # Para Linux/Mac
    if command -v lsof &> /dev/null; then
        local pid=$(lsof -ti:$port)
        if [ ! -z "$pid" ]; then
            print_warning "Matando processo na porta $port (PID: $pid)"
            kill -9 $pid 2>/dev/null || true
        fi
    fi
    
    # Para Windows (se executado no Git Bash)
    if command -v netstat &> /dev/null; then
        local pid=$(netstat -ano | grep ":$port " | awk '{print $5}' | head -1)
        if [ ! -z "$pid" ]; then
            print_warning "Matando processo na porta $port (PID: $pid)"
            taskkill //PID $pid //F 2>/dev/null || true
        fi
    fi
}

# Parar processos existentes
print_step "1. Parando processos existentes..."
kill_port 8080  # Backend
kill_port 3000  # Frontend
kill_port 3001  # Frontend alternativo
sleep 2

# Verificar dependências do backend
print_step "2. Verificando backend..."
cd backend

if [ ! -d "node_modules" ]; then
    print_status "Instalando dependências do backend..."
    npm install
fi

# Verificar banco de dados
print_status "Executando diagnóstico do banco de dados..."
npm run db:diagnose

if [ $? -ne 0 ]; then
    print_error "Problemas no banco de dados detectados!"
    print_status "Tentando executar migrações e seeding..."
    npm run db:migrate
    npm run db:seed
fi

cd ..

# Verificar dependências do frontend
print_step "3. Verificando frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    print_status "Instalando dependências do frontend..."
    npm install
fi

# Verificar arquivo .env do frontend
if [ ! -f ".env" ]; then
    print_status "Criando arquivo .env do frontend..."
    cat > .env << EOF
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=24
REACT_APP_FACEBOOK_APP_ID=
GENERATE_SOURCEMAP=false
PORT=3001
NODE_OPTIONS=--openssl-legacy-provider
EOF
fi

cd ..

# Testar comunicação API
print_step "4. Testando comunicação API..."
cd frontend
npm run test:api
cd ..

# Iniciar serviços
print_step "5. Iniciando serviços..."

# Iniciar backend em background
print_status "Iniciando backend na porta 8080..."
cd backend
npm run dev:server &
BACKEND_PID=$!
cd ..

# Aguardar backend inicializar
print_status "Aguardando backend inicializar..."
sleep 10

# Verificar se backend está rodando
if ! curl -s http://localhost:8080 > /dev/null; then
    print_warning "Backend pode não ter iniciado corretamente. Aguardando mais..."
    sleep 10
fi

# Iniciar frontend
print_status "Iniciando frontend na porta 3001..."
cd frontend

# Tentar diferentes métodos para iniciar o frontend
if command -v yarn &> /dev/null; then
    print_status "Usando Yarn para iniciar frontend..."
    NODE_OPTIONS=--openssl-legacy-provider yarn start &
else
    print_status "Usando NPM para iniciar frontend..."
    NODE_OPTIONS=--openssl-legacy-provider npm start &
fi

FRONTEND_PID=$!
cd ..

# Aguardar frontend inicializar
print_status "Aguardando frontend inicializar..."
sleep 15

# Verificar se os serviços estão rodando
print_step "6. Verificando serviços..."

# Verificar backend
if curl -s http://localhost:8080 > /dev/null; then
    print_status "✅ Backend rodando em http://localhost:8080"
else
    print_error "❌ Backend não está respondendo"
fi

# Verificar frontend
if curl -s http://localhost:3001 > /dev/null; then
    print_status "✅ Frontend rodando em http://localhost:3001"
else
    print_warning "⚠️ Frontend pode ainda estar carregando..."
fi

# Informações finais
echo ""
echo "============================================"
echo "🎉 Sistema iniciado!"
echo "============================================"
echo ""
echo "📊 URLs do sistema:"
echo "   Frontend: http://localhost:3001"
echo "   Backend:  http://localhost:8080"
echo ""
echo "🔐 Credenciais padrão:"
echo "   Email:    admin@admin.com"
echo "   Senha:    123456"
echo ""
echo "📝 Logs:"
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "🛑 Para parar os serviços:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   ou execute: ./stop.sh"
echo ""
echo "🔧 Diagnósticos disponíveis:"
echo "   Backend:  cd backend && npm run db:diagnose"
echo "   Frontend: cd frontend && npm run test:api"
echo ""

# Salvar PIDs para script de parada
echo "BACKEND_PID=$BACKEND_PID" > .pids
echo "FRONTEND_PID=$FRONTEND_PID" >> .pids

print_status "Sistema pronto! Acesse http://localhost:3001 para fazer login."

# Manter o script rodando para mostrar logs
echo "Pressione Ctrl+C para parar todos os serviços..."
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT

# Aguardar indefinidamente
wait