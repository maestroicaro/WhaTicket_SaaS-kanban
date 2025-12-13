# 🚀 Deploy Automático no Easypanel - Guia Completo

## ✅ **Status do Repositório**
- ✅ Migrações automáticas configuradas
- ✅ Usuário admin criado automaticamente
- ✅ Docker otimizado para produção
- ✅ Self-healing system
- ✅ Scripts de verificação incluídos

## 🎯 **Credenciais Padrão**
```
Email: admin@admin.com
Senha: 123456
```

## 📋 **Deploy Passo a Passo**

### **PASSO 1: Preparar Repositório**
```bash
# Clone o repositório
git clone https://github.com/maestroicaro/WhaTicket_SaaS-kanban.git
cd WhaTicket_SaaS-kanban

# Mude para a branch de desenvolvimento
git checkout desenvolvimento-local

# Verifique se os arquivos estão corretos
ls backend/Dockerfile.easypanel
ls frontend/Dockerfile
ls verificar-deploy.js
```

### **PASSO 2: Criar Projeto no Easypanel**
1. Acesse seu painel Easypanel
2. Clique em **"New Project"**
3. Escolha **"From Git Repository"**
4. Cole a URL: `https://github.com/maestroicaro/WhaTicket_SaaS-kanban`
5. Branch: `desenvolvimento-local`
6. Clique em **"Create Project"**

### **PASSO 3: Configurar Serviços (ORDEM CRÍTICA!)**

#### **3.1 PostgreSQL Database (PRIMEIRO!)**
```yaml
Tipo: PostgreSQL
Nome: postgres
Database: whaticket
Username: whaticket
Password: whaticket123
```

**⚠️ AGUARDE até o PostgreSQL estar 100% rodando (status verde)!**

#### **3.2 Redis Cache (SEGUNDO!)**
```yaml
Tipo: Redis
Nome: redis
Password: redis_forte_123
```

**⚠️ AGUARDE até o Redis estar 100% rodando (status verde)!**

#### **3.3 Backend API (TERCEIRO!)**
```yaml
Tipo: App
Nome: backend
Build Path: ./backend
Dockerfile: Dockerfile.easypanel  # ou Dockerfile.simple se der erro
Port: 8080
Health Check Path: /api/health
```

**🔧 Se der erro de build Docker:** Veja o arquivo `DOCKER_BUILD_FIX.md`

**Variáveis de Ambiente do Backend:**
```bash
# Ambiente
NODE_ENV=production
PORT=8080

# URLs (ALTERE PARA SUAS URLs!)
FRONTEND_URL=https://SEU-FRONTEND.easypanel.host
BACKEND_URL=https://SEU-BACKEND.easypanel.host

# Banco PostgreSQL
DB_DIALECT=postgres
DB_HOST=postgres
DB_PORT=5432
DB_USER=whaticket
DB_PASS=whaticket123
DB_NAME=whaticket

# PostgreSQL Container
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

**⚠️ AGUARDE até o Backend estar 100% rodando e testado!**

#### **3.4 Frontend React (ÚLTIMO!)**
```yaml
Tipo: App
Nome: frontend
Build Path: ./frontend
Port: 80
```

**Variáveis de Ambiente do Frontend:**
```bash
# URL do Backend (ALTERE!)
REACT_APP_BACKEND_URL=https://SEU-BACKEND.easypanel.host

# Configurações
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=24
REACT_APP_FACEBOOK_APP_ID=
GENERATE_SOURCEMAP=false
NODE_OPTIONS=--openssl-legacy-provider
```

## 🔍 **Verificação do Deploy**

### **Método 1: Script Automático**
```bash
# No seu computador local
node verificar-deploy.js https://SEU-FRONTEND.easypanel.host https://SEU-BACKEND.easypanel.host
```

### **Método 2: Verificação Manual**

#### **1. Testar Backend Health**
```bash
curl https://SEU-BACKEND.easypanel.host/api/health
```
**Esperado:** `{"status":"healthy","timestamp":"...","uptime":123}`

#### **2. Testar Login**
```bash
curl -X POST https://SEU-BACKEND.easypanel.host/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"123456"}'
```
**Esperado:** `{"token":"...","user":{"id":1,"email":"admin@admin.com"}}`

#### **3. Testar Frontend**
- Acesse: `https://SEU-FRONTEND.easypanel.host`
- Deve mostrar tela de login
- Faça login com: `admin@admin.com` / `123456`

## 🚨 **Troubleshooting**

### **Backend não inicia (404 do Easypanel)**
```bash
# Verifique logs no Easypanel
# Problemas comuns:
1. PostgreSQL não está rodando
2. Variáveis de ambiente incorretas
3. Erro no build do Docker
4. Porta 8080 não exposta
```

### **Backend inicia mas /api/health retorna 404**
```bash
# Problema: Rotas não carregaram
# Soluções:
1. Verifique logs do backend
2. Confirme conexão com PostgreSQL
3. Verifique se as migrações executaram
```

### **Login retorna 401**
```bash
# Problema: Usuário admin não existe
# Soluções:
1. Verifique logs das migrações automáticas
2. Execute migrações manualmente se necessário
3. Confirme conexão com banco
```

### **Frontend não carrega**
```bash
# Problemas comuns:
1. REACT_APP_BACKEND_URL incorreto
2. Backend não está respondendo
3. Erro no build do React
```

## 📊 **Logs Importantes**

### **Backend - Logs de Sucesso:**
```
🔄 Executando migrações automáticas...
✅ Migrações executadas com sucesso!
✅ Seeding executado com sucesso!
✅ [Self-Healing] Plan 'Plano Individual' created.
✅ [Self-Healing] Default Company (ID 1) created.
✅ [Self-Healing] Admin user created.
Server started on port: 8080
```

### **Backend - Logs de Erro:**
```
❌ Error connecting to database
❌ Migration failed
❌ Port 8080 already in use
```

## 🎉 **Deploy Bem-Sucedido**

Quando tudo estiver funcionando:
1. ✅ `https://SEU-BACKEND.easypanel.host/api/health` retorna `{"status":"healthy"}`
2. ✅ `https://SEU-FRONTEND.easypanel.host` mostra tela de login
3. ✅ Login com `admin@admin.com` / `123456` funciona
4. ✅ Dashboard carrega corretamente

## 📞 **Suporte**

Se ainda tiver problemas:
1. Execute: `node verificar-deploy.js [SUAS_URLS]`
2. Verifique logs no painel Easypanel
3. Confirme que seguiu a ordem correta de deploy
4. Verifique se todas as variáveis de ambiente estão corretas

---

**💡 Lembre-se:** Este repositório está configurado para funcionar automaticamente. Basta seguir os passos na ordem correta!