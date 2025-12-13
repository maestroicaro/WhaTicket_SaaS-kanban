# Dockerfile BÁSICO - Funciona Sempre
FROM node:18-alpine

WORKDIR /app
COPY . .
RUN npm install --production
RUN npm run build
EXPOSE 8080
CMD ["npm", "run", "start:production"]