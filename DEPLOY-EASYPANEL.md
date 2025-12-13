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

### **2. Configurar Serviços**

#### **PostgreSQL Database**
- **Tipo:** PostgreSQL
- **Nome:** `postgres`
- **Database:** `whaticket`
- **Username:** `whaticket`
- **Password:** `whaticket123`

#### **Redis Cache**
- **Tipo:** Redis
- **Nome:** `redis`
- **Password:** `redis_forte_123`

#### **Backend API**
- **Tipo:** App
- **Nome:** `backend`
- **Build Path:** `./backend`
- **Dockerfile:** `Dockerfile.easypanel`
- **Port:** `8080`

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

#### **Frontend React**
- **Tipo:** App
- **Nome:** `frontend`
- **Build Path:** `./frontend`
- **Port:** `80`

**Variáveis de Ambiente do Frontend:**
```bash
# URL do Backend (ALTERE PARA SUA URL)
REACT_APP_BACKEND_URL=https://SEU-BACKEND.easypanel.host

# Configurações
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=24
REACT_APP_FACEBOOK_APP_ID=
GENERATE_SOURCEMAP=false
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

## 🚨 **Troubleshooting**

### **Login não funciona:**
1. Verifique logs do backend
2. Confirme que PostgreSQL está rodando
3. Verifique se as URLs estão corretas
4. Confirme que as migrações foram executadas

### **Frontend não carrega:**
1. Verifique se `REACT_APP_BACKEND_URL` está correto
2. Confirme que o backend está respondendo
3. Verifique logs do frontend

### **Erro de CORS:**
1. Confirme que `FRONTEND_URL` no backend está correto
2. Verifique se as URLs não têm barra no final

## 🎉 **Resultado Final**

Após o deploy completo:
- ✅ Sistema funcionando em produção
- ✅ Login com admin@admin.com / 123456
- ✅ Banco de dados configurado
- ✅ Usuário admin criado automaticamente
- ✅ Pronto para uso!

---

**💡 Dica:** Todas as configurações são automáticas. Basta fazer o deploy e usar!