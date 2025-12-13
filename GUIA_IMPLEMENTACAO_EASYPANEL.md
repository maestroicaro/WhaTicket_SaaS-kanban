# Guia de Implementação: WhaTicket SaaS no EasyPanel

Este guia detalha o processo de deploy utilizando a branch `desenvolvimento-local` e o novo **Dockerfile otimizado**.

## Pré-requisitos

- Conta no EasyPanel.
- Repositório GitHub conectado (ou URL pública se for open).
- Branch: `desenvolvimento-local` (Onde está o Dockerfile novo).

---

## Passo 1: Configurar Banco de Dados e Cache

Primeiro, suba os serviços de infraestrutura. Eles precisam estar rodando antes do Backend.

### 1. PostgreSQL (Banco de Dados)

- **Tipo:** Database (No EasyPanel, clique em "Add Service" -> "Database" -> "Postgres").
- **Nome do Serviço:** `postgres` (Importante manter este nome para facilitar a conexão interna).
- **Versão:** 13 ou superior.
- **Configurações Internas (Anote para usar no backend):**
  - Host: `postgres`
  - Port: `5432`
  - User: `postgres` (ou `whaticket` se você personalizar)
  - Password: `whaticket123` (Exemplo - use uma senha forte em produção!)
  - Database Name: `whaticket`

### 2. Redis (Cache)

- **Tipo:** Database (Clique em "Add Service" -> "Database" -> "Redis").
- **Nome do Serviço:** `redis`
- **Configurações Internas:**
  - Host: `redis`
  - Port: `6379`
  - Password: `redis_forte_123` (Exemplo)

> [!IMPORTANT]
> Aguarde ambos os serviços ficarem "verdes" (Running) antes de prosseguir.

---

## Passo 2: Configurar o Backend (API)

Agora vamos subir a API usando o Dockerfile otimizado que criamos.

- **Tipo:** App (Clique em "Add Service" -> "App" -> "From GitHub").
- **Repositório:** `maestroicaro/WhaTicket_SaaS-kanban`
- **Branch:** `desenvolvimento-local`

### Configurações de Build (Build Source)

- **Build Path (Context):** `./backend`
  - _Isso diz para o EasyPanel olhar dentro da pasta backend._
- **Dockerfile Path:** `Dockerfile`
  - _Como substituímos o arquivo principal, basta usar o padrão `Dockerfile`._

### Variáveis de Ambiente (Environment)

Copie e cole, ajustando as URLs:

```env
NODE_ENV=production
PORT=8080

# URLs da Aplicação (Seus domínios no EasyPanel)
BACKEND_URL=https://api.seudominio.com
FRONTEND_URL=https://app.seudominio.com

# Banco de Dados (Postgres)
DB_DIALECT=postgres
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASS=whaticket123
DB_NAME=whaticket

# Redis
REDIS_URI=redis://:redis_forte_123@redis:6379
REDIS_OPT_LIMITER_MAX=1
REDIS_OPT_LIMITER_DURATION=3000

# Segredos (Gere códigos aleatórios fortes)
JWT_SECRET=troque_isso_por_algo_seguro_e_aleatorio_32chars
JWT_REFRESH_SECRET=troque_isso_por_algo_seguro_e_aleatorio_32chars

# Configurações do App
USER_LIMIT=9999
CONNECTIONS_LIMIT=9999
CLOSED_SEND_BY_ME=true
HOURS_CLOSE_TICKETS_AUTO=24
VERIFY_TOKEN=whaticket_production
```

- **Porta do Container:** `8080`
- **Deploy:** Clique em "Deploy" ou "Save & Deploy".

> [!NOTE]
> O backend irá rodar as migrações automaticamente na primeira inicialização. Acompanhe os logs. Se ver `Server started on port: 8080`, está tudo certo!

---

## Passo 3: Configurar o Frontend (Interface)

Por último, a interface do usuário.

- **Tipo:** App (Clique em "Add Service" -> "App" -> "From GitHub").
- **Nome do Serviço:** `frontend`
- **Repositório:** `maestroicaro/WhaTicket_SaaS-kanban`
- **Branch:** `desenvolvimento-local`

### Configurações de Build

- **Build Path (Context):** `./frontend`
- **Dockerfile Path:** `Dockerfile`

### Variáveis de Ambiente

```env
# URL do Backend (A mesma configurada no passo anterior)
REACT_APP_BACKEND_URL=https://api.seudominio.com

# Outras configs
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=24
```

- **Porta do Container:** `80` (O frontend roda um Nginx na porta 80).
- **Deploy:** Clique em "Save & Deploy".

---

## Resumo e Verificação

1. Acesse a URL do **Backend** (`/api/health` ou `/`): Deve responder algo ou dar 404 (mas o servidor deve estar de pé).
2. Acesse a URL do **Frontend**: Deve carregar a tela de login.
3. **Login Padrão:**
   - Email: `admin@admin.com`
   - Senha: `123456`

Se precisar reiniciar o banco ou limpar tudo, lembre-se de que os volumes do Docker (dados) persistem a menos que você os delete explicitamente no EasyPanel.
