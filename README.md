# Calendare

Aplicação de calendário desenvolvida com React, NestJS e PostgreSQL, totalmente containerizada com Docker.

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: NestJS + TypeScript
- **Banco de Dados**: PostgreSQL 16
- **ORM**: Prisma
- **Containerização**: Docker + Docker Compose

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **PostgreSQL**: localhost:5432

## Estrutura dos Serviços

### PostgreSQL
- Imagem: `postgres:16-alpine`
- Porta: 5432
- Database: `calendare_db`
- User: `calendare`
- Password: `calendare123`

## Variáveis de Ambiente

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://calendare:calendare123@postgres:5432/calendare_db?schema=public
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```


Front: 3000
Back: 3001
Prisma: 5555
Exec prima: docker-compose exec backend npm run prisma:studio
