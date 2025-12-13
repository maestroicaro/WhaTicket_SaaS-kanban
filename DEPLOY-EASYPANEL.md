# 🚀 Deploy Automático no Easypanel

## ✅ **Repositório 100% Funcional**

Este repositório está configurado para deploy automático no Easypanel com:
- ✅ Migrações automáticas do banco de dados
- ✅ Criação automática do usuário admin
- ✅ Configuração completa de produção
- ✅ Docker otimizado para Easypanel

## 🎯 **Credenciais Padrão**
- **Email:** `admin@admin.com`
- **Senha:** `123456`

## 📋 **Passo a Passo no Easypanel**

### **1. Criar Novo Projeto**
1. Acesse seu painel Easypanel
2. Clique em "New Project"
3. Escolha "From Git Repository"
4. Cole a URL: `https://github.com/maestroicaro/WhaTicket_SaaS-kanban`
5. Branch: `desenvolvimento-local`

### **2. Configurar Serviços (ORDEM IMPORTANTE!)**

#### **PASSO 1: PostgreSQL Database**
- **Tipo:** PostgreSQL
- **Nome:** `postgres`
- **Database:** `whaticket`
- **Username:** `whaticket`
- **Password:** `whaticket123`

**⚠️ AGUARDE o PostgreSQL estar 100% rodando antes de continuar!**

#### **PASSO 2: Redis Cache**
- **Tipo:** Redis
- **Nome:** `redis`
- **Password:** `redis_forte_123`

**⚠️ AGUARDE o Redis estar 100% rodando antes de continuar!**

#### **PASSO 3: Backend API**
- **Tipo:** App
- **Nome:** `backend`
- **Build Path:** `./backend`
- **Dockerfile:** `Dockerfile.easypanel`
- **Port:** `8080`
- **Health Check Path:** `/api/health`

**Variáveis de Ambiente do Backend:**
```bash
NODE_ENV=production
PORT=8080

# URLs (ALTERE PARA SUAS URLs)
FRONTEND_URL=https://SEU-FRONTEND.easypanel.host
BACKEND_URL=https://SEU-BACKEND.easypanel.host

# Banco de Dados
DB_DIALECT=postgres
DB_HOST=postgres
DB_PORT=5432
DB_USER=whaticket
DB_PASS=whaticket123
DB_NAME=whaticket

# PostgreSQL
POSTGRES_USER=whaticket
POSTGRES_PASSWORD=whaticket123
POSTGRES_DB=whaticket

# Redis
REDIS_URI=redis://redis:6379
REDIS_PASSWORD=redis_forte_123
REDIS_OPT_LIMITER_MAX=1
REDIS_OPT_LIMITER_DURATION=3000

# JWT (ALTERE EM PRODUÇÃO!)
JWT_SECRET=segredo_jwt_super_seguro_9999_ALTERE_EM_PRODUCAO
JWT_REFRESH_SECRET=segredo_refresh_super_seguro_8888_ALTERE_EM_PRODUCAO

# Limites
USER_LIMIT=10000
CONNECTIONS_LIMIT=100000
CLOSED_SEND_BY_ME=true
HOURS_CLOSE_TICKETS_AUTO=24

# Webhook
VERIFY_TOKEN=whaticket_production

# SSL
DB_SSL=false
```

#### **PASSO 4: Frontend React**
- **Tipo:** App
- **Nome:** `frontend`
- **Build Path:** `./frontend`
- **Port:** `80`

**⚠️ SÓ CRIE O FRONTEND DEPOIS QUE O BACKEND ESTIVER FUNCIONANDO!**

**Variáveis de Ambiente do Frontend:**
```bash
# URL do Backend (ALTERE PARA SUA URL)
REACT_APP_BACKEND_URL=https://SEU-BACKEND.easypanel.host

# Configurações
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=24
REACT_APP_FACEBOOK_APP_ID=
GENERATE_SOURCEMAP=false
NODE_OPTIONS=--openssl-legacy-provider
```

### **3. Ordem de Deploy**
1. **PostgreSQL** (primeiro)
2. **Redis** (segundo)
3. **Backend** (terceiro - aguardar PostgreSQL estar rodando)
4. **Frontend** (último - aguardar Backend estar rodando)

### **4. Verificação Pós-Deploy**

#### **Verificar Backend:**
- Acesse: `https://SEU-BACKEND.easypanel.host`
- Deve retornar erro 404 (normal)

#### **Verificar Frontend:**
- Acesse: `https://SEU-FRONTEND.easypanel.host`
- Deve mostrar tela de login

#### **Testar Login:**
- Email: `admin@admin.com`
- Senha: `123456`

## 🔧 **Recursos Automáticos**

### **Migrações Automáticas**
O backend executa automaticamente:
1. Migrações do banco de dados
2. Criação do usuário admin
3. Configuração inicial do sistema

### **Self-Healing**
O sistema se auto-corrige:
- Cria usuário admin se não existir
- Configura planos padrão
- Corrige associações quebradas

### **Logs Úteis**
No painel do Easypanel, verifique os logs do backend:
```
🔄 Executando migrações automáticas...
✅ Migrações executadas com sucesso!
✅ Seeding executado com sucesso!
🔍 [Self-Healing] Admin user exists.
✅ [Self-Healing] Plan 'Plano Individual' exists.
Server started on port 8080
```

## 🚨 **Troubleshooting Completo**

### **🔍 PASSO 1: Verificar se Backend está rodando**
1. Acesse: `https://SEU-BACKEND.easypanel.host/api/health`
2. **Se retornar 404 do Easypanel:** Backend não está rodando
3. **Se retornar JSON com "healthy":** Backend funcionando ✅

### **🔧 PASSO 2: Se Backend não está rodando**
1. Vá no painel Easypanel → Seu projeto → Backend
2. Clique em "Logs" e verifique erros
3. Problemas comuns:
   - **Erro de build:** Verifique se o Dockerfile está correto
   - **Erro de conexão DB:** PostgreSQL não está rodando
   - **Erro de variáveis:** Verifique as variáveis de ambiente

### **🔍 PASSO 3: Testar Login**
1. Acesse: `https://SEU-BACKEND.easypanel.host/auth/login` (POST)
2. **Se retornar 404:** Rotas não carregaram - problema no backend
3. **Se retornar 401:** Backend funcionando, teste credenciais

### **🔧 PASSO 4: Problemas Específicos**

#### **Backend retorna 404 do Easypanel:**
- Backend não deployou corretamente
- Verifique logs do build no Easypanel
- Confirme que o Dockerfile.easypanel existe
- Verifique se a porta 8080 está exposta

#### **Backend não conecta no PostgreSQL:**
```bash
# Logs típicos de erro:
ECONNREFUSED postgres:5432
Unable to connect to database
```
**Solução:** Aguarde PostgreSQL estar 100% rodando

#### **Migrações não executam:**
```bash
# Logs típicos:
npx sequelize db:migrate failed
```
**Solução:** Problema de conexão com banco ou tabelas já existem

#### **Login retorna 401:**
```bash
# Teste manual no terminal:
curl -X POST https://SEU-BACKEND.easypanel.host/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"123456"}'
```

#### **Frontend não carrega:**
1. Verifique se `REACT_APP_BACKEND_URL` está correto
2. Confirme que o backend está respondendo
3. Verifique logs do frontend no Easypanel

#### **Erro de CORS:**
1. Confirme que `FRONTEND_URL` no backend está correto
2. Verifique se as URLs não têm barra no final
3. URLs devem ser exatamente como no Easypanel

## 🎉 **Resultado Final**

Após o deploy completo:
- ✅ Sistema funcionando em produção
- ✅ Login com admin@admin.com / 123456
- ✅ Banco de dados configurado
- ✅ Usuário admin criado automaticamente
- ✅ Pronto para uso!

---

**💡 Dica:** Todas as configurações são automáticas. Basta fazer o deploy e usar!