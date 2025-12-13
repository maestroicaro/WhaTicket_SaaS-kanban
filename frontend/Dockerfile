# Dockerfile otimizado para Frontend React
FROM node:18-alpine as builder

# Instalar dependências do sistema
RUN apk add --no-cache bash

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção com Nginx
FROM nginx:alpine

# Copiar build para nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta
EXPOSE 80

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]