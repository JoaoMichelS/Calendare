# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Instalar OpenSSL para Prisma
RUN apk add --no-cache openssl

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3001

# Comando para desenvolvimento (com hot reload)
CMD ["sh", "-c", "npm run prisma:generate && npm run start:dev"]


# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npm run prisma:generate

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3001

# Comando para produção
CMD ["npm", "run", "start:prod"]
