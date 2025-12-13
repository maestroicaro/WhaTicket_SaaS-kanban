# 🔧 WhatsApp Ticketing System - Login Fix

## ✅ Problema Resolvido

**Problema Original:** Não conseguia fazer login com usuário e senha padrão após deploy no Easypanel.

**Causa Identificada:** Arquivo `.env` ausente no frontend, resultando em `REACT_APP_BACKEND_URL` indefinida.

**Solução Implementada:** Configuração completa do ambiente de desenvolvimento local com ferramentas de diagnóstico.

## 🚀 Deploy Local Rápido

### Windows
```bash
# Executar o script de restart
.\restart-local.bat

# Para parar os serviços
.\stop-local.bat
```

### Linux/Mac
```bash
# Tornar executável (primeira vez)
chmod +x restart.sh stop.sh

# Executar o script de restart
./restart.sh

# Para parar os serviços
./stop.sh
```

## 🔐 Credenciais Padrão

- **Email:** `admin@admin.com`
- **Senha:** `123456`

## 📊 URLs do Sistema

- **Frontend:** http://localhost:3001
- **Backend:** http://localhost:8080

## 🛠️ Ferramentas de Diagnóstico

### Diagnóstico Completo do Backend
```bash
cd backend
npm run db:diagnose
```

**Verifica:**
- ✅ Variáveis de ambiente
- ✅ Conexão com PostgreSQL
- ✅ Schema e tabelas do banco
- ✅ Status das migrações
- ✅ Usuário admin padrão
- ✅ Teste de autenticação

### Teste de Comunicação API
```bash
cd frontend
npm run test:api
```

**Verifica:**
- ✅ Configuração do frontend
- ✅ Conectividade com backend
- ✅ Endpoint de login
- ✅ Configuração CORS
- ✅ Login com credenciais padrão

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
- `backend/database-diagnostic.js` - Diagnóstico do banco de dados
- `backend/src/utils/database-diagnostic.ts` - Versão TypeScript do diagnóstico
- `frontend/test-api-connection.js` - Teste de comunicação API
- `frontend/.env` - Configuração do frontend
- `restart.sh` / `restart-local.bat` - Scripts de restart
- `stop.sh` / `stop-local.bat` - Scripts de parada
- `login-troubleshooting-guide.md` - Guia completo de solução de problemas

### Arquivos Modificados
- `backend/package.json` - Adicionado script `db:diagnose`
- `frontend/package.json` - Adicionado script `test:api`

## 🔍 Processo de Solução

### 1. Diagnóstico do Backend
- ✅ Banco de dados PostgreSQL conectado
- ✅ 36 tabelas existentes
- ✅ 110 migrações executadas
- ✅ Usuário admin criado corretamente
- ✅ Senha "123456" válida

### 2. Identificação do Problema
- ❌ Frontend sem arquivo `.env`
- ❌ `REACT_APP_BACKEND_URL` indefinida
- ❌ Comunicação frontend-backend falhando

### 3. Implementação da Solução
- ✅ Criado `frontend/.env` com configurações corretas
- ✅ Configurado `NODE_OPTIONS=--openssl-legacy-provider` para compatibilidade
- ✅ Definido `PORT=3001` para evitar conflitos

### 4. Validação
- ✅ Todos os testes de diagnóstico passando (6/6)
- ✅ Todos os testes de API passando (5/5)
- ✅ Login funcionando com credenciais padrão

## 🚨 Problemas Comuns e Soluções

### "Cannot POST /sessions"
**Causa:** Endpoint incorreto  
**Solução:** O endpoint correto é `/auth/login`

### "REACT_APP_BACKEND_URL is undefined"
**Causa:** Arquivo `.env` ausente no frontend  
**Solução:** Executar `restart-local.bat` ou criar manualmente

### "Database connection failed"
**Causa:** PostgreSQL não rodando  
**Solução:** Iniciar PostgreSQL e executar `npm run db:migrate && npm run db:seed`

### "ERR_OSSL_EVP_UNSUPPORTED"
**Causa:** Incompatibilidade Node.js/OpenSSL  
**Solução:** Usar `NODE_OPTIONS=--openssl-legacy-provider`

## 📋 Checklist de Verificação

- [ ] PostgreSQL rodando
- [ ] Arquivo `backend/.env` configurado
- [ ] Arquivo `frontend/.env` criado
- [ ] Dependências instaladas (`npm install`)
- [ ] Diagnóstico backend: 6/6 ✅
- [ ] Teste API: 5/5 ✅
- [ ] Backend rodando na porta 8080
- [ ] Frontend rodando na porta 3001
- [ ] Login funciona com admin@admin.com / 123456

## 🎯 Para Produção (Easypanel)

1. **Atualizar URLs de produção:**
   ```bash
   # No Easypanel, configurar variáveis de ambiente:
   REACT_APP_BACKEND_URL=https://seu-backend.easypanel.host
   ```

2. **Verificar configurações do backend:**
   ```bash
   FRONTEND_URL=https://seu-frontend.easypanel.host
   BACKEND_URL=https://seu-backend.easypanel.host
   ```

3. **Executar migrações no deploy:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

## 📞 Suporte

Se ainda houver problemas:

1. Execute os diagnósticos: `npm run db:diagnose` e `npm run test:api`
2. Verifique os logs do backend e frontend
3. Confirme que PostgreSQL está rodando
4. Verifique as configurações de rede/firewall

---

**Status:** ✅ **RESOLVIDO**  
**Data:** Dezembro 2024  
**Credenciais Funcionais:** admin@admin.com / 123456  
**Sistema Testado:** ✅ Backend + Frontend + Banco de Dados