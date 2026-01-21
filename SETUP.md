# Linear Clone - Setup Guide

## Quick Start (Docker - Recommended)

1. **Prerequisites**
   - Docker and Docker Compose installed
   - OpenAI API key

2. **Setup**
   ```bash
   # Clone and navigate to project
   cd linear-clone

   # Create environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local

   # Edit backend/.env and add your OpenAI API key
   OPENAI_API_KEY=sk-your-api-key-here

   # Start all services
   docker-compose up -d

   # Wait for services to be ready (30-60 seconds)

   # Run database migrations
   docker exec linear-backend npm run prisma:migrate:dev

   # Seed the database with sample data
   docker exec linear-backend npm run seed
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - API Documentation: http://localhost:4000/api

4. **Demo Credentials**
   - Email: `john@example.com`
   - Password: `password123`

## Manual Setup (Without Docker)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/linear_clone
# OPENAI_API_KEY=sk-your-api-key

# Ensure PostgreSQL is running with pgvector extension
createdb linear_clone
psql linear_clone -c "CREATE EXTENSION vector;"

# Run migrations
npm run prisma:migrate:dev

# Generate Prisma client
npm run prisma:generate

# Seed database
npm run seed

# Start backend
npm run start:dev
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_URL=http://localhost:4000
# NEXT_PUBLIC_WS_URL=ws://localhost:4000

# Start frontend
npm run dev
```

## Database Setup

### Installing pgvector

**macOS (Homebrew):**
```bash
brew install pgvector
```

**Ubuntu/Debian:**
```bash
sudo apt install postgresql-15-pgvector
```

**From Source:**
```bash
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

### Enable Extension
```sql
CREATE EXTENSION vector;
```

## Environment Variables

### Backend (.env)

Required:
- `DATABASE_URL` - PostgreSQL connection string with pgvector
- `JWT_SECRET` - Secret for JWT token generation
- `OPENAI_API_KEY` - OpenAI API key for AI features

Optional:
- `AWS_S3_BUCKET` - S3 bucket for attachments
- `SMTP_HOST` - Email server for notifications
- `SLACK_CLIENT_ID` - Slack integration
- `GITHUB_CLIENT_ID` - GitHub integration

### Frontend (.env.local)

Required:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL
- `NEXTAUTH_SECRET` - NextAuth secret

## Features Overview

### Core Features
✅ Authentication & Authorization
✅ Workspaces & Teams
✅ Projects
✅ Issues (full CRUD)
✅ Comments & Attachments
✅ Labels & Custom Fields
✅ Cycles (Sprints)
✅ Real-time updates (Socket.io)
✅ Advanced Search

### AI Features
✅ AI-powered issue generation from brief title
✅ Smart categorization (priority, labels, estimates)
✅ Semantic search with pgvector
✅ Duplicate detection
✅ Natural language query parsing

## Development

### Running Tests

**Backend:**
```bash
cd backend
npm run test
npm run test:e2e
npm run test:cov
```

**Frontend:**
```bash
cd frontend
npm run test
```

### Database Management

```bash
# View database in Prisma Studio
cd backend
npm run prisma:studio

# Create new migration
npm run prisma:migrate:dev

# Reset database (WARNING: deletes all data)
npm run prisma:migrate:reset

# Re-seed database
npm run seed
```

### API Documentation

After starting the backend, visit:
- Swagger UI: http://localhost:4000/api
- OpenAPI JSON: http://localhost:4000/api-json

## Deployment

### Vercel (Frontend)

```bash
cd frontend
vercel deploy --prod
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`
- `NEXTAUTH_SECRET`

### Railway/Render (Backend + Database)

1. Create PostgreSQL database with pgvector
2. Deploy backend from GitHub
3. Set environment variables
4. Run migrations: `npm run prisma:migrate:deploy`
5. Seed database: `npm run seed`

### Environment Variables for Production

Update all URLs to production URLs:
- Backend `FRONTEND_URL`
- Frontend `NEXT_PUBLIC_API_URL`
- Update CORS settings in backend

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Check pgvector extension
psql -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

### OpenAI API Issues
- Verify API key is correct
- Check API rate limits
- Ensure sufficient credits

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 4000
lsof -ti:4000 | xargs kill -9
```

## Architecture

```
linear-clone/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── auth/     # Authentication
│   │   ├── ai/       # AI features (OpenAI)
│   │   ├── issues/   # Issue management
│   │   ├── search/   # Search & semantic search
│   │   └── ...
│   └── prisma/       # Database schema & migrations
├── frontend/         # Next.js app
│   ├── app/          # App router
│   ├── components/   # React components
│   └── lib/          # Utilities & API client
└── docker-compose.yml
```

## Tech Stack

**Backend:**
- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- pgvector for embeddings
- OpenAI GPT-4 & Ada-002
- Socket.io for real-time
- JWT authentication

**Frontend:**
- Next.js 14 (App Router)
- React 18 + TypeScript
- TailwindCSS + shadcn/ui
- React Query (TanStack)
- Socket.io client
- Zustand (state management)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Open an issue on GitHub

## License

MIT License
