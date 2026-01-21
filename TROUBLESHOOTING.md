# Troubleshooting Guide

Common issues and their solutions for Linear Clone.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Database Issues](#database-issues)
- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [Docker Issues](#docker-issues)
- [AI Features Issues](#ai-features-issues)
- [Performance Issues](#performance-issues)
- [Deployment Issues](#deployment-issues)

---

## Installation Issues

### Cannot find module errors

**Problem**: `Cannot find module '@nestjs/common'` or similar

**Solution**:
```bash
# Delete node_modules and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors during build

**Problem**: Type errors when running `npm run build`

**Solution**:
```bash
# Regenerate Prisma client
cd backend
npm run prisma:generate

# Check TypeScript configuration
npx tsc --noEmit
```

### Permission denied on scripts

**Problem**: `Permission denied` when running `./start.sh`

**Solution**:
```bash
chmod +x start.sh dev.sh
```

---

## Database Issues

### Cannot connect to database

**Problem**: `Error: P1001: Can't reach database server`

**Solution**:
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# If using Docker:
docker-compose up -d postgres

# Wait for it to be ready
docker exec linear-postgres pg_isready

# Check connection string
cat backend/.env | grep DATABASE_URL
```

### pgvector extension not found

**Problem**: `extension "vector" does not exist`

**Solution**:
```bash
# Install pgvector
# For Docker (already included):
docker exec linear-postgres psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS vector;"

# For local PostgreSQL:
# macOS:
brew install pgvector

# Ubuntu:
sudo apt install postgresql-15-pgvector

# Then enable:
psql -d linear_clone -c "CREATE EXTENSION vector;"
```

### Migration failed

**Problem**: `Migration failed to apply cleanly`

**Solution**:
```bash
cd backend

# Check migration status
npm run prisma:migrate:status

# Reset if needed (WARNING: deletes data)
npm run prisma:migrate:reset

# Or create a new migration
npm run prisma:migrate:dev
```

### Seed script fails

**Problem**: `Error seeding database`

**Solution**:
```bash
cd backend

# Check for errors
npm run seed 2>&1 | tee seed.log

# Common fix: ensure migrations are applied first
npm run prisma:migrate:deploy
npm run seed
```

### Prisma Client out of sync

**Problem**: `Prisma Client is not ready for queries`

**Solution**:
```bash
cd backend
npm run prisma:generate
npm run build
npm run start:dev
```

---

## Backend Issues

### Port already in use

**Problem**: `Error: listen EADDRINUSE: address already in use :::4000`

**Solution**:
```bash
# Find process using port 4000
lsof -ti:4000 | xargs kill -9

# Or change port in backend/.env
PORT=4001
```

### JWT token invalid

**Problem**: `401 Unauthorized` on protected routes

**Solution**:
```bash
# Check JWT_SECRET is set
cat backend/.env | grep JWT_SECRET

# Generate new secret if needed
JWT_SECRET=$(openssl rand -base64 32)

# Clear old tokens from localStorage
# In browser console:
localStorage.clear()
```

### Validation errors

**Problem**: `400 Bad Request: Validation failed`

**Solution**:
- Check request body matches DTO requirements
- Ensure all required fields are present
- Check field types (string vs number, etc.)
- Look at API documentation: http://localhost:4000/api

### Module not found errors

**Problem**: `Cannot resolve module path`

**Solution**:
```bash
cd backend

# Check tsconfig.json paths
cat tsconfig.json

# Rebuild
npm run build
```

---

## Frontend Issues

### Page not found

**Problem**: `404 | This page could not be found`

**Solution**:
```bash
# Check Next.js is running
curl http://localhost:3000

# Restart with clear cache
cd frontend
rm -rf .next
npm run dev
```

### API connection refused

**Problem**: `Network Error` or `ERR_CONNECTION_REFUSED`

**Solution**:
```bash
# Check backend is running
curl http://localhost:4000/auth/me

# Check NEXT_PUBLIC_API_URL
cat frontend/.env.local | grep NEXT_PUBLIC_API_URL

# Should be:
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Environment variables not loading

**Problem**: `process.env.NEXT_PUBLIC_API_URL` is undefined

**Solution**:
```bash
# Ensure file is named correctly
ls frontend/.env.local

# Restart Next.js (required for env changes)
# Stop with Ctrl+C, then:
npm run dev

# Verify in browser console:
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### Build errors

**Problem**: `Error: Build failed`

**Solution**:
```bash
cd frontend

# Clear cache
rm -rf .next

# Check for TypeScript errors
npm run type-check

# Reinstall dependencies
rm -rf node_modules
npm install

# Try build again
npm run build
```

### Hydration errors

**Problem**: `Hydration failed because the initial UI...`

**Solution**:
- Ensure server and client render the same HTML
- Don't use browser APIs in server components
- Check for date formatting differences
- Use `suppressHydrationWarning` as last resort

---

## Docker Issues

### Services won't start

**Problem**: `docker-compose up` fails

**Solution**:
```bash
# Check Docker is running
docker ps

# Check docker-compose.yml syntax
docker-compose config

# Pull latest images
docker-compose pull

# Rebuild containers
docker-compose up -d --build
```

### Container exits immediately

**Problem**: Container starts then stops

**Solution**:
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check for port conflicts
docker-compose ps

# Restart specific service
docker-compose restart backend
```

### Volume permission errors

**Problem**: `Permission denied` in container

**Solution**:
```bash
# Fix permissions
sudo chown -R $USER:$USER backend frontend

# Restart containers
docker-compose restart
```

### Out of disk space

**Problem**: `no space left on device`

**Solution**:
```bash
# Remove unused images
docker system prune -a

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Check disk usage
docker system df
```

---

## AI Features Issues

### OpenRouter.ai API key invalid

**Problem**: `401: Incorrect API key provided`

**Solution**:
```bash
# Check key is set
cat backend/.env | grep OPENROUTER_API_KEY

# Verify key at: https://openrouter.ai/keys

# Update .env and restart
docker-compose restart backend
```

### Rate limit exceeded

**Problem**: `429: Rate limit reached`

**Solution**:
- Wait a moment before retrying
- Check usage: https://openrouter.ai/usage
- Check provider rate limits (varies by provider)
- Implement request queueing

### Embedding generation slow

**Problem**: Semantic search is very slow

**Solution**:
```bash
# Check if embeddings are generated
cd backend
npm run prisma:studio
# Look at Issue table, check embedding column

# Generate embeddings for all issues
# Add to backend/src/ai/embeddings.service.ts:
async generateAllEmbeddings() {
  const issues = await this.prisma.issue.findMany();
  for (const issue of issues) {
    await this.generateAndStoreEmbedding(issue.id);
  }
}
```

### Vector similarity search not working

**Problem**: Semantic search returns no results

**Solution**:
```sql
-- Check pgvector extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check embeddings exist
SELECT COUNT(*) FROM "Issue" WHERE embedding IS NOT NULL;

-- Check index
SELECT * FROM pg_indexes WHERE tablename = 'Issue';

-- Create index if missing
CREATE INDEX ON "Issue" USING ivfflat (embedding vector_cosine_ops);
```

### AI responses are poor quality

**Problem**: Generated content is not relevant

**Solution**:
- Ensure workspace has recent issues for context
- Check prompt engineering in `ai.service.ts`
- Verify OpenRouter.ai model is configured correctly (e.g., `openai/gpt-4`)
- Try different models available on OpenRouter.ai
- Increase temperature for more creative responses
- Add more context to prompts
- Check OpenRouter.ai documentation: https://openrouter.ai/docs

---

## Performance Issues

### Slow API responses

**Problem**: Requests take >1 second

**Solution**:
```bash
# Check database query performance
cd backend
npm run prisma:studio

# Enable query logging in backend/prisma/schema.prisma:
generator client {
  provider = "prisma-client-js"
  log = ["query"]
}

# Add indexes for slow queries
# Example:
CREATE INDEX ON "Issue" (projectId, status, priority);
```

### High memory usage

**Problem**: Node.js using too much RAM

**Solution**:
```bash
# Limit Node.js memory
NODE_OPTIONS="--max-old-space-size=2048" npm run start:dev

# Check for memory leaks
node --inspect npm run start:dev
# Open chrome://inspect
```

### Slow page loads

**Problem**: Frontend pages load slowly

**Solution**:
```bash
# Analyze bundle size
cd frontend
npm run build
# Check .next/analyze

# Enable production mode
npm run build
npm run start

# Use Next.js Image optimization
# Replace <img> with <Image from="next/image">
```

---

## Deployment Issues

### Vercel deployment fails

**Problem**: Build fails on Vercel

**Solution**:
```bash
# Test build locally
cd frontend
npm run build

# Check environment variables in Vercel dashboard
# Ensure NEXT_PUBLIC_API_URL points to production API

# Check build logs in Vercel dashboard
```

### Railway/Render backend fails

**Problem**: Backend won't start in production

**Solution**:
- Check environment variables are set
- Ensure DATABASE_URL is correct
- Run migrations: `npm run prisma:migrate:deploy`
- Check logs in dashboard
- Verify Node.js version matches local

### Database connection timeout

**Problem**: Can't connect to production database

**Solution**:
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check IP allowlist (if using managed DB)
# Add deployment server IP

# Increase connection pool
# In prisma/schema.prisma:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connection_limit = 10
}
```

### CORS errors in production

**Problem**: `blocked by CORS policy`

**Solution**:
```typescript
// backend/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});

// Ensure FRONTEND_URL env var is set to production URL
```

---

## General Debug Commands

```bash
# Check all services
docker-compose ps

# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Restart all services
docker-compose restart

# Rebuild and restart
docker-compose up -d --build

# Check Docker resources
docker stats

# Clean everything
docker-compose down -v
docker system prune -a
```

## Getting More Help

1. **Check logs** first - they usually contain the error details
2. **Search issues** on GitHub
3. **Read documentation**:
   - [README.md](./README.md)
   - [SETUP.md](./SETUP.md)
   - [API.md](./API.md)
4. **Open an issue** with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Relevant logs

## Common Error Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Bug in server code |
| 503 | Service Unavailable | Database down |

## Debug Checklist

When something doesn't work:

- [ ] Check logs (`docker-compose logs`)
- [ ] Verify environment variables
- [ ] Ensure services are running (`docker-compose ps`)
- [ ] Check database connection
- [ ] Clear cache and rebuild
- [ ] Try in incognito/private mode
- [ ] Check browser console for errors
- [ ] Verify API endpoint exists
- [ ] Check network tab in DevTools
- [ ] Try with curl to isolate frontend/backend

---

**Still stuck?** Open an issue with full details and we'll help!
