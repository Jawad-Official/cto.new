# Appo - Collaborative Task Management

A real-time collaborative task management tool for small teams and freelancers.

## Features

- 🔐 **Authentication** - JWT-based secure authentication
- 📊 **Project Management** - Create and manage multiple projects
- ✅ **Task Management** - Comprehensive task tracking with status, priority, and assignments
- 💬 **Real-time Comments** - Discuss tasks with team members
- 🔔 **Notifications** - Stay updated on project activities
- 🤖 **AI Assistance** - Smart task priority suggestions and auto-assignment
- ⚡ **Real-time Updates** - WebSocket-powered live updates
- 👥 **Team Collaboration** - Invite members and manage roles

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- Socket.io
- JWT + bcrypt
- Jest + Supertest

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Socket.io-client
- Vitest

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd appo

# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migrate

# Seed the database
docker-compose exec backend npm run seed
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Manual Setup

#### 1. Database Setup

```bash
# Create PostgreSQL database
createdb appo

# Run migrations
cd database
psql appo < schema.sql
psql appo < seeds.sql
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials

# Run migrations
npm run migrate

# Start development server
npm run dev

# Run tests
npm test
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev

# Run tests
npm test
```

## Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/appo
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add member
- `DELETE /api/projects/:id/members/:userId` - Remove member

### Tasks
- `GET /api/tasks` - List tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/assignees` - Assign user to task
- `DELETE /api/tasks/:id/assignees/:userId` - Unassign user

### Comments
- `GET /api/comments/task/:taskId` - Get task comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### AI
- `POST /api/ai/suggest-priority` - Get priority suggestion for task
- `POST /api/ai/auto-assign` - Auto-assign task based on workload

## WebSocket Events

### Client → Server
- `join_project` - Join project room
- `leave_project` - Leave project room

### Server → Client
- `task_created` - New task created
- `task_updated` - Task updated
- `task_deleted` - Task deleted
- `comment_added` - New comment added
- `notification` - New notification

## Project Structure

```
appo/
├── backend/          # Node.js backend
├── frontend/         # React frontend
├── database/         # SQL schema and seeds
├── docker-compose.yml
└── README.md
```

## Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run typecheck
```

## Deployment

### Backend

1. Set production environment variables
2. Build TypeScript: `npm run build`
3. Start server: `npm start`

### Frontend

1. Set production API URL
2. Build: `npm run build`
3. Serve the `dist` folder

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For issues and questions, please open a GitHub issue.
