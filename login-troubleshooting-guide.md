# 🔧 Guia de Solução de Problemas de Login - WhatsApp Ticketing System

## 📋 Resumo do Problema Resolvido

**Problema:** Não conseguia fazer login com as credenciais padrão (admin@admin.com / 123456)

**Causa Raiz:** Arquivo `.env` ausente no frontend, resultando em `REACT_APP_BACKEND_URL` indefinida

**Solução:** Criação do arquivo `frontend/.env` com a configuração correta da URL do backend

## 🎯 Credenciais Padrão do Sistema

- **Email:** `admin@admin.com`
- **Senha:** `123456`

## 🛠️ Ferramentas de Diagnóstico Criadas

### 1. Diagnóstico do Backend
```bash
cd backend
npm run db:diagnose
```

**O que verifica:**
- ✅ Variáveis de ambiente
- ✅ Conexão com banco de dados
- ✅ Schema e tabelas
- ✅ Status das migrações
- ✅ Usuário padrão existe
- ✅ Teste de autenticação

### 2. Teste de Comunicação API
```bash
cd frontend
npm run test:api
```

**O que verifica:**
- ✅ Configuração do frontend
- ✅ Conectividade com backend
- ✅ Endpoint de login funcional
- ✅ Configuração CORS
- ✅ Login com credenciais padrão

## 🔍 Processo de Diagnóstico Passo a Passo

### Passo 1: Verificar Backend
```bash
cd backend
npm run db:diagnose
```

**Resultados esperados:**
- Todas as 6 verificações devem passar
- Usuário admin deve existir com senha válida
- Banco de dados deve estar conectado

### Passo 2: Verificar Frontend
```bash
cd frontend
npm run test:api
```

**Resultados esperados:**
- Todas as 5 verificações devem passar
- Backend deve ser acessível
- Login deve funcionar

### Passo 3: Verificar Arquivos de Configuração

#### Backend (.env)
```bash
# Localização: backend/.env
DB_HOST=localhost
DB_PORT=5432
DB_USER=whaticket
DB_PASS=whaticket123
DB_NAME=whaticket
JWT_SECRET=kZaOTd+YZpjRUyyuQUpigJaEMk4vcW4YOymKPZX0Ts8=
JWT_REFRESH_SECRET=dBSXqFg9TaNUEDXVp6fhMTRLBysP+j2DSqf7+raxD3A=
```

#### Frontend (.env)
```bash
# Localização: frontend/.env
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=24
REACT_APP_FACEBOOK_APP_ID=
GENERATE_SOURCEMAP=false
```

## 🚨 Problemas Comuns e Soluções

### 1. "Cannot POST /sessions"
**Problema:** Frontend tentando usar endpoint incorreto
**Solução:** O endpoint correto é `/auth/login`, não `/sessions`

### 2. "REACT_APP_BACKEND_URL is undefined"
**Problema:** Arquivo `.env` ausente no frontend
**Solução:** Criar `frontend/.env` com `REACT_APP_BACKEND_URL=http://localhost:8080`

### 3. "Database connection failed"
**Problema:** PostgreSQL não está rodando ou configuração incorreta
**Solução:** 
- Verificar se PostgreSQL está rodando
- Conferir credenciais no `backend/.env`
- Executar `npm run db:migrate` e `npm run db:seed`

### 4. "Default admin user not found"
**Problema:** Banco não foi populado com dados iniciais
**Solução:** 
```bash
cd backend
npm run db:seed
```

### 5. "ERR_INVALID_CREDENTIALS"
**Problema:** Senha do usuário admin foi alterada ou corrompida
**Solução:** 
```bash
cd backend
npm run db:seed  # Re-executa o seeding
```

## 📊 Arquitetura do Sistema de Login

```
Frontend (React)          Backend (Express.js)         Database (PostgreSQL)
     |                           |                            |
     | POST /auth/login          |                            |
     |-------------------------->|                            |
     |                           | SELECT * FROM Users        |
     |                           |--------------------------->|
     |                           |                            |
     |                           | bcrypt.compare(password)   |
     |                           |<---------------------------|
     |                           |                            |
     | JWT Token + User Data     |                            |
     |<--------------------------|                            |
```

## 🔧 Comandos Úteis

### Reiniciar Sistema Completo
```bash
# Backend
cd backend
npm run db:migrate
npm run db:seed
npm run dev:server

# Frontend (novo terminal)
cd frontend
npm start
```

### Verificar Logs
```bash
# Backend logs
cd backend
npm run dev:server

# Frontend logs
cd frontend
npm start
```

### Reset Completo do Banco
```bash
cd backend
# Cuidado: isso apaga todos os dados!
npx sequelize db:migrate:undo:all
npm run db:migrate
npm run db:seed
```

## 📝 Checklist de Verificação

- [ ] PostgreSQL está rodando
- [ ] Arquivo `backend/.env` existe e está configurado
- [ ] Arquivo `frontend/.env` existe com `REACT_APP_BACKEND_URL`
- [ ] Backend roda sem erros (`npm run dev:server`)
- [ ] Diagnóstico do backend passa (6/6 testes)
- [ ] Teste de API passa (5/5 testes)
- [ ] Frontend carrega sem erros (`npm start`)
- [ ] Login funciona com admin@admin.com / 123456

## 🎯 Próximos Passos

1. **Desenvolvimento Local:** Sistema está funcionando
2. **Deploy em Produção:** Atualizar variáveis de ambiente para URLs de produção
3. **Segurança:** Alterar credenciais padrão em produção
4. **Monitoramento:** Implementar logs de autenticação

## 📞 Suporte

Se ainda houver problemas:

1. Execute os diagnósticos: `npm run db:diagnose` e `npm run test:api`
2. Verifique os logs do backend e frontend
3. Confirme que todos os serviços estão rodando
4. Verifique as configurações de rede/firewall

---

**Status:** ✅ Problema Resolvido
**Data:** $(date)
**Credenciais Funcionais:** admin@admin.com / 123456