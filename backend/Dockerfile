# Dockerfile ULTRA ROBUSTO - Resolve todos os problemas
FROM node:18-alpine

# Instalar todas as dependências necessárias
RUN apk add --no-cache \
    git \
    bash \
    curl \
    postgresql-client \
    python3 \
    make \
    g++

WORKDIR /app

# Copiar package files primeiro
COPY package*.json ./

# Instalar dependências com configurações robustas
RUN npm config set unsafe-perm true && \
    npm config set fund false && \
    npm config set audit false && \
    npm install --production --no-optional || \
    npm install --production --legacy-peer-deps || \
    npm install --production

# Copiar código fonte
COPY . .

# Build
RUN npm run build

EXPOSE 8080
CMD ["npm", "run", "start:production"]