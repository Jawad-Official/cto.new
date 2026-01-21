# Quick Start Guide

Get the Linear Clone running in under 5 minutes!

## Prerequisites

- Docker Desktop installed and running
- OpenRouter.ai API key ([Get one here](https://openrouter.ai/keys))

## Option 1: Automated Setup (Recommended)

```bash
# 1. Clone the repository
git clone <repo-url>
cd linear-clone

# 2. Copy environment file and add your OpenRouter.ai key
cp .env.example .env
# Edit .env and add: OPENROUTER_API_KEY=sk-or-your-key-here

# 3. Run the start script
./start.sh
```

That's it! The application will be available at http://localhost:3000

## Option 2: Manual Setup

```bash
# 1. Set up environment
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit backend/.env and add your OpenRouter.ai API key
# OPENROUTER_API_KEY=sk-or-your-key-here

# 2. Start services
docker-compose up -d

# 3. Wait for PostgreSQL to start (30 seconds)
sleep 30

# 4. Set up database
docker exec linear-backend npm install
docker exec linear-backend npm run prisma:generate
docker exec linear-backend npm run prisma:migrate:deploy
docker exec linear-backend npm run seed

# 5. Access the app
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
# Swagger Docs: http://localhost:4000/api
```

## Demo Credentials

```
Email: john@example.com
Password: password123

OR

Email: jane@example.com
Password: password123
```

## What You Get

✅ **2 Demo Users** - Try collaborative features
✅ **1 Workspace** - "Acme Corporation"
✅ **1 Team** - "Engineering" team
✅ **1 Project** - "Product Development" (key: PROD)
✅ **4 Sample Issues** - Various statuses and priorities
✅ **Labels** - bug, feature, backend, frontend
✅ **1 Active Cycle** - 2-week sprint
✅ **Comments** - Sample discussions on issues
✅ **Activity Logs** - Complete audit trail

## Key Features to Try

### 1. AI-Powered Issue Generation
- Create a new issue
- Enter a brief title: "Add user authentication"
- Click "Generate with AI"
- Watch as AI creates full description, acceptance criteria, estimates, and subtasks

### 2. Smart Search
- Use the search bar
- Try: "Show me all urgent bugs"
- Try: "High priority features in progress"
- The AI parses natural language into filters

### 3. Semantic Search
- Search: "login problems"
- Finds issues about authentication, SSO, sign-in, etc.
- Uses vector embeddings for meaning-based search

### 4. Duplicate Detection
- Start creating an issue similar to an existing one
- AI automatically suggests potential duplicates
- Prevents redundant work

## Troubleshooting

### Services won't start
```bash
# Check Docker is running
docker ps

# Check logs
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart
```

### Database connection errors
```bash
# Check PostgreSQL is ready
docker exec linear-postgres pg_isready

# Reset database
docker-compose down -v
docker-compose up -d
# Wait 30 seconds, then run migrations again
```

### Frontend can't connect to backend
```bash
# Check backend is running
curl http://localhost:4000/auth/me

# Check frontend environment
cat frontend/.env.local
# Should have: NEXT_PUBLIC_API_URL=http://localhost:4000
```

### AI features not working
1. Check OpenRouter.ai API key in `backend/.env`
2. Verify you have credits: https://openrouter.ai/credits
3. Check backend logs: `docker-compose logs backend`
4. Verify API key at: https://openrouter.ai/keys

## Next Steps

1. **Explore the Dashboard**
   - View all issues
   - Filter by status, priority, assignee
   - Try different views (list, kanban, etc.)

2. **Try AI Features**
   - Generate issues
   - Use semantic search
   - Auto-categorize existing issues

3. **Invite Team Members**
   - Go to workspace settings
   - Add members via email
   - Assign different roles

4. **Create Projects**
   - Set up your own projects
   - Customize project keys
   - Define custom workflows

5. **Set Up Cycles**
   - Plan sprints
   - Track progress
   - View cycle analytics

## Production Deployment

Ready to deploy? See [SETUP.md](./SETUP.md) for:
- Deploying to Vercel (Frontend)
- Deploying to Railway/Render (Backend)
- Setting up production database
- Configuring environment variables
- SSL/HTTPS setup

## API Documentation

Interactive API docs available at: http://localhost:4000/api

Or see [API.md](./API.md) for complete API reference.

## Getting Help

- **Documentation**: See [README.md](./README.md)
- **Setup Issues**: See [SETUP.md](./SETUP.md)
- **AI Features**: See [AI_FEATURES.md](./AI_FEATURES.md)
- **API Reference**: See [API.md](./API.md)

## Clean Up

```bash
# Stop services
docker-compose down

# Remove volumes (deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Development

Want to contribute? See [CONTRIBUTING.md](./CONTRIBUTING.md)

### Run without Docker

**Backend:**
```bash
cd backend
npm install
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Make sure PostgreSQL with pgvector is running locally.

---

**Enjoy building with Linear Clone!** 🚀

If you find this useful, please ⭐ star the repo!
