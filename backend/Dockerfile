# Dockerfile otimizado para Easypanel com suporte a Puppeteer
FROM node:18-alpine

# Instalar dependências do sistema e do Puppeteer
RUN apk add --no-cache \
    git \
    bash \
    curl \
    postgresql-client \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar variáveis de ambiente para o Puppeteer pular o download do Chromium
# e usar o executável instalado pelo apk
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências (apenas produção para imagem final seria ideal, 
# mas precisamos de devDeps para buildar o TS. 
# Aqui instalamos tudo e depois podemos limpar se quisermos otimizar mais,
# mas para manter simples e funcional vamos instalar tudo)
RUN npm install

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Opcional: Remover devDependencies após o build para reduzir imagem
# RUN npm prune --production

# Expor porta
EXPOSE 8080

# Comando de inicialização
CMD ["npm", "run", "start:production"]