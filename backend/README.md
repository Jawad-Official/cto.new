# Appo Backend API

Backend API for Appo task management application built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- RESTful API with full CRUD operations
- JWT-based authentication
- Real-time updates with Socket.io
- PostgreSQL database with proper relationships
- Comprehensive error handling
- Input validation
- AI-powered features (priority suggestions, auto-assignment)
- Test coverage with Jest

## Tech Stack

- Node.js 18+
- Express
- TypeScript
- PostgreSQL
- Socket.io
- JWT + bcrypt
- Jest + Supertest

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Database Setup

```bash
# Create database
createdb appo

# Run migrations
npm run migrate

# Seed data (optional)
npm run seed
```

### Running

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Tests
npm test

# Type checking
npm run typecheck
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update current user profile

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/members` - Get project members
- `POST /api/projects/:id/members` - Add member
- `DELETE /api/projects/:id/members/:userId` - Remove member

### Tasks
- `GET /api/tasks` - Get tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/:id/assignees` - Get task assignees
- `POST /api/tasks/:id/assignees` - Assign user to task
- `DELETE /api/tasks/:id/assignees/:userId` - Unassign user

### Comments
- `GET /api/comments/task/:taskId` - Get task comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### AI Features
- `POST /api/ai/suggest-priority` - Get priority suggestion
- `POST /api/ai/auto-assign` - Get auto-assign suggestion
- `POST /api/ai/analyze-complexity` - Analyze task complexity
- `POST /api/ai/suggest-due-date` - Get due date suggestion

## WebSocket Events

### Client → Server
- `join_project` - Join project room for real-time updates
- `leave_project` - Leave project room

### Server → Client
- `task_created` - New task created
- `task_updated` - Task updated
- `task_deleted` - Task deleted
- `comment_added` - New comment added
- `notification` - New notification

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── socket/          # Socket.io handlers
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── index.ts         # Entry point
├── tests/               # Test files
└── package.json
```

## Environment Variables

See `.env.example` for required environment variables.

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

## License

MIT
