# 🚀 Guia de Instalação: WhaTicket SaaS no EasyPanel

Este guia foi desenhado para ser o mais simples possível. Se você seguiu os passos do repositório, o deploy deve ser quase "clique-e-pronto".

---

## ✅ Pré-requisitos

1. Uma conta no **GitHub** com este repositório clonado/forkado.
2. Um servidor com **EasyPanel** instalado e configurado.

---

## 🛠️ Passo a Passo

### 1. Preparando o EasyPanel

1. Acesse seu painel EasyPanel.
2. Crie um novo **Projeto** (Ex: `whaticket-homolog`).
3. Clique em **"Deploy Service"** ou **"Service"** -> **"App"** -> **"GitHub"**.

### 2. Conectando o Repositório

1. Selecione o repositório **`WhaTicket_SaaS-kanban`**.
2. **IMPORTANTE:** O EasyPanel deve detectar automaticamente o arquivo `docker-compose.yml`.
   - Se ele perguntar o "Build Type", escolha **Docker Compose**.
   - Se ele pedir "Path", mantenha `./` (raiz).

### 3. Configurações Finais

Na tela de configuração do serviço (antes de clicar em Create/Deploy):

1. **Domains**: O `docker-compose` já tenta configurar, mas você pode precisar confirmar:

   - Para o serviço `frontend`: Vá na aba Domains e adicione seu domínio (ex: `app.seudominio.com`). Porta: `80`.
   - Para o serviço `backend`: Vá na aba Domains e adicione seu domínio (ex: `api.seudominio.com`). Porta: `8080`.

2. **Environment Variables**:
   O sistema já vai com senhas padrão seguras para o banco, mas se quiser mudar, vá na aba "Environment" e altere.

### 4. 🚀 Taca-le Pau (Deploy)

1. Clique em **"Deploy"** ou **"Create"**.
2. Aguarde... O primeiro deploy demora uns 3 a 5 minutos (ele vai baixar o Docker, compilar o Backend, preparar o Banco).

---

## 🚦 Tabela de Status (Troubleshooting)

| Sintoma                      | Causa Provável                        | Solução                                                                                                           |
| :--------------------------- | :------------------------------------ | :---------------------------------------------------------------------------------------------------------------- |
| **Status Cinza/Unreachable** | O EasyPanel é chato com Healthchecks. | **Ignore.** Se o site abre e você faz login, o sistema está online. O status cinza é apenas cosmético nesse caso. |
| **Erro 401 no Login**        | Login incorreto.                      | Use `admin@admin.com` / `123456`. Se não for, cadastre um novo usuário.                                           |
| **Planos não aparecem**      | Banco de dados novo.                  | O sistema cria os planos automaticamente no primeiro deploy. Se não aparecer, dê um "Redeploy" no Backend.        |
| **Erro de WebSocket**        | Domínio errado.                       | Verifique se o domínio da API (`api...`) está apontando para o serviço `backend` na porta `8080`.                 |

---

## 👤 Acesso Padrão

- **URL**: `https://seu-dominio-frontend.com`
- **Email**: `admin@admin.com`
- **Senha**: `123456`

Sucesso! 🚀
