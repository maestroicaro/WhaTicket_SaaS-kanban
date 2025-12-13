# Dockerfile simplificado para Frontend React - Easypanel
FROM node:18-alpine as builder

# Instalar dependências do sistema
RUN apk add --no-cache bash

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install && npm cache clean --force

# Copiar código fonte
COPY . .

# Build da aplicação React (com fix para Node.js 18)
RUN NODE_OPTIONS="--openssl-legacy-provider" npm run build

# Estágio de produção com Nginx
FROM nginx:alpine

# Copiar build para nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Usar configuração padrão do nginx com SPA support
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    client_max_body_size 100M; \
    \
    # Enable gzip \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
    \
    # SPA support - redirect all to index.html \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Cache static assets \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]