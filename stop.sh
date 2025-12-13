#!/bin/bash

# ============================================
# WhatsApp Ticketing System - Stop Script
# ============================================

echo "🛑 Parando WhatsApp Ticketing System..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Função para matar processos nas portas
kill_port() {
    local port=$1
    print_status "Parando serviços na porta $port..."
    
    # Para Linux/Mac
    if command -v lsof &> /dev/null; then
        local pids=$(lsof -ti:$port)
        if [ ! -z "$pids" ]; then
            echo "$pids" | xargs kill -9 2>/dev/null || true
            print_status "Processos na porta $port foram finalizados"
        else
            print_status "Nenhum processo encontrado na porta $port"
        fi
    fi
    
    # Para Windows (se executado no Git Bash)
    if command -v netstat &> /dev/null; then
        local pids=$(netstat -ano | grep ":$port " | awk '{print $5}')
        if [ ! -z "$pids" ]; then
            echo "$pids" | xargs -I {} taskkill //PID {} //F 2>/dev/null || true
            print_status "Processos na porta $port foram finalizados"
        else
            print_status "Nenhum processo encontrado na porta $port"
        fi
    fi
}

# Ler PIDs salvos se existirem
if [ -f ".pids" ]; then
    print_status "Lendo PIDs salvos..."
    source .pids
    
    if [ ! -z "$BACKEND_PID" ]; then
        print_status "Parando backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        print_status "Parando frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    rm .pids
fi

# Matar processos nas portas conhecidas
kill_port 8080  # Backend
kill_port 3000  # Frontend
kill_port 3001  # Frontend alternativo

# Matar processos Node.js relacionados ao projeto
print_status "Finalizando processos Node.js do projeto..."

# Para Linux/Mac
if command -v pkill &> /dev/null; then
    pkill -f "react-scripts" 2>/dev/null || true
    pkill -f "ts-node-dev" 2>/dev/null || true
    pkill -f "whaticketsaas24" 2>/dev/null || true
fi

# Para Windows
if command -v taskkill &> /dev/null; then
    taskkill //F //IM node.exe 2>/dev/null || true
fi

sleep 2

echo ""
echo "✅ Todos os serviços foram finalizados!"
echo ""
echo "Para reiniciar o sistema, execute:"
echo "   ./restart.sh"
echo ""