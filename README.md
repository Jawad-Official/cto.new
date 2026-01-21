# Linear.app Clone - Full-Featured Project Management with AI

A complete, production-ready Linear.app clone with advanced AI capabilities for issue management, smart categorization, and semantic search.

## 🚀 Features

### Core Features
- **Authentication & Authorization**: Multi-workspace user management with role-based access control
- **Workspaces & Teams**: Hierarchical team structures with customizable settings
- **Projects**: Full project lifecycle management with access control
- **Issues**: Comprehensive issue tracking with rich text, relationships, and custom fields
- **Views**: List, Kanban, Calendar, Timeline, Roadmap, and Table views
- **Cycles**: Sprint management with performance tracking
- **Automation**: Workflow automation with conditional logic
- **Search**: Advanced filtering and full-text search
- **Notifications**: Real-time updates with customizable preferences
- **Integrations**: Webhooks, Slack, GitHub, and OAuth2 support
- **Analytics**: Team performance metrics and insights

### AI Features
- **Auto-Generation**: AI-powered issue creation from brief descriptions
- **Smart Categorization**: Automatic priority, label, and assignee suggestions
- **Semantic Search**: Natural language queries with vector similarity
- **Duplicate Detection**: ML-powered duplicate issue identification
- **Context-Aware Suggestions**: Intelligent recommendations based on workspace patterns
- **Powered by OpenRouter.ai**: Access to multiple AI models through a single API

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io
- **AI**: OpenRouter.ai (access to multiple AI models including GPT-4), pgvector for embeddings
- **Auth**: NextAuth.js
- **Storage**: S3-compatible storage for attachments (Cloudflare R2 compatible)

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+ with pgvector extension
- Docker & Docker Compose (optional)
- OpenRouter.ai API key

## 🏗 Project Structure

```
linear-clone/
├── frontend/              # Next.js application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and config
│   └── hooks/            # Custom React hooks
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── workspaces/  # Workspace management
│   │   ├── teams/       # Team management
│   │   ├── projects/    # Project management
│   │   ├── issues/      # Issue tracking
│   │   ├── ai/          # AI integration
│   │   ├── search/      # Search functionality
│   │   └── common/      # Shared utilities
│   └── prisma/          # Database schema
├── docker-compose.yml    # Local development setup
└── README.md
```

## 🚦 Getting Started

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd linear-clone

# Set up environment variables
cp .env.example .env
# Edit .env and add your OpenRouter API key and other credentials

# Start all services
docker-compose up -d

# Run database migrations
cd backend
npm run prisma:migrate:dev

# Seed the database
npm run seed

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# API Docs: http://localhost:4000/api
```

### Option 2: Manual Setup

#### 1. Set up PostgreSQL with pgvector

```bash
# Install PostgreSQL and pgvector extension
# See: https://github.com/pgvector/pgvector#installation

# Create database
createdb linear_clone

# Enable pgvector extension
psql linear_clone -c "CREATE EXTENSION vector;"
```

#### 2. Set up Backend

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run migrations
npm run prisma:migrate:dev

# Generate Prisma client
npm run prisma:generate

# Seed database
npm run seed

# Start development server
npm run start:dev
```

#### 3. Set up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with backend URL

# Start development server
npm run dev
```

## 🔐 Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/linear_clone"
JWT_SECRET="your-jwt-secret"
OPENROUTER_API_KEY="sk-or-..."
AWS_S3_BUCKET="linear-attachments"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-password"
SLACK_CLIENT_ID="your-slack-client-id"
SLACK_CLIENT_SECRET="your-slack-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-secret"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_WS_URL="ws://localhost:4000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test              # Unit tests
npm run test:e2e          # Integration tests
npm run test:cov          # Coverage report

# Frontend tests
cd frontend
npm run test              # Jest tests
npm run test:e2e          # Playwright E2E tests
```

## 📚 API Documentation

After starting the backend, visit:
- Swagger UI: http://localhost:4000/api
- OpenAPI JSON: http://localhost:4000/api-json

## 🎨 Key Features Implementation

### AI-Powered Issue Creation

```typescript
// When user creates issue with brief title:
// "Add user authentication"

// AI generates:
{
  title: "Add user authentication",
  description: `
    Implement comprehensive user authentication system with the following:
    
    **Requirements:**
    - Email/password authentication
    - Social OAuth (Google, GitHub)
    - JWT token management
    - Password reset functionality
    
    **Acceptance Criteria:**
    - [ ] Users can register with email/password
    - [ ] Users can login with social providers
    - [ ] Secure token storage and refresh
    - [ ] Password reset via email
  `,
  priority: "HIGH",
  labels: ["backend", "security"],
  estimate: 8
}
```

### Semantic Search

```typescript
// Natural language query:
"Show me all critical bugs assigned to me from last week"

// Automatically converts to:
{
  filters: {
    priority: "URGENT",
    assignee: currentUser.id,
    createdAt: { gte: lastWeek },
    labels: { some: { name: "bug" } }
  }
}
```

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel deploy --prod
```

### Backend (Railway/Render)

```bash
cd backend
# Configure via Railway/Render dashboard
# Set environment variables
# Deploy from GitHub
```

### Database (Supabase/Railway)

- Use managed PostgreSQL with pgvector support
- Run migrations: `npm run prisma:migrate:deploy`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Inspired by [Linear.app](https://linear.app)
- Built with modern web technologies
- AI powered by OpenRouter.ai

## 📧 Support

For support, email support@linear-clone.com or open an issue.

## 🔗 Links

- [Documentation](https://docs.linear-clone.com)
- [API Reference](https://api.linear-clone.com)
- [Roadmap](https://github.com/your-org/linear-clone/projects/1)
