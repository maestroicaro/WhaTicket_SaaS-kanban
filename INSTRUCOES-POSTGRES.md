# 🐘 Como Iniciar PostgreSQL para o WhatsApp Ticketing

## 🚀 Método 1: Docker (Recomendado)

### Passo 1: Abrir Docker Desktop
1. Pressione `Win + R`
2. Digite: `"C:\Program Files\Docker\Docker\Docker Desktop.exe"`
3. Aguarde 1-2 minutos para inicializar

### Passo 2: Executar PostgreSQL
Abra um terminal (CMD ou PowerShell) e execute:

```bash
# Parar containers existentes (se houver)
docker stop whaticket-postgres
docker rm whaticket-postgres

# Iniciar PostgreSQL
docker run -d \
  --name whaticket-postgres \
  -e POSTGRES_USER=whaticket \
  -e POSTGRES_PASSWORD=whaticket123 \
  -e POSTGRES_DB=whaticket \
  -p 5432:5432 \
  postgres:13

# Aguardar 30 segundos para inicializar
timeout /t 30

# Testar conexão
cd backend
npm run db:diagnose
```

## 🔧 Método 2: PostgreSQL Nativo (Alternativo)

### Opção A: Instalar PostgreSQL
1. Baixe: https://www.postgresql.org/download/windows/
2. Instale com usuário `postgres` e senha `123456`
3. Crie usuário `whaticket`:

```sql
CREATE USER whaticket WITH PASSWORD 'whaticket123';
CREATE DATABASE whaticket OWNER whaticket;
GRANT ALL PRIVILEGES ON DATABASE whaticket TO whaticket;
```

### Opção B: PostgreSQL Portable
Execute o script que criamos:
```bash
.\start-postgres-portable.bat
```

## ✅ Verificar se Funcionou

Execute o diagnóstico:
```bash
cd backend
npm run db:diagnose
```

**Resultado esperado:** 6/6 testes passando ✅

## 🚀 Iniciar Sistema Completo

Depois que o PostgreSQL estiver funcionando:

```bash
# Executar migrações (primeira vez)
cd backend
npm run db:migrate
npm run db:seed

# Iniciar sistema completo
cd ..
.\restart-local.bat
```

## 🎯 URLs Finais

- **Frontend:** http://localhost:3001
- **Backend:** http://localhost:8080
- **Login:** admin@admin.com / 123456

## 🛑 Para Parar Tudo

```bash
# Parar aplicação
.\stop-local.bat

# Parar PostgreSQL (Docker)
docker stop whaticket-postgres
```

---

**💡 Dica:** Se o Docker não funcionar, use o PostgreSQL nativo ou portable. O importante é ter PostgreSQL rodando na porta 5432.