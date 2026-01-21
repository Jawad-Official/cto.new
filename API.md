# Linear Clone API Documentation

Base URL: `http://localhost:4000`

All endpoints (except auth) require Bearer token authentication:
```
Authorization: Bearer <token>
```

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "token": "eyJhbGc..."
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "token": "eyJhbGc..."
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "...",
  "email": "john@example.com",
  "name": "John Doe",
  ...
}
```

## Workspaces

### Get All Workspaces
```http
GET /workspaces
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "...",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "description": "...",
    ...
  }
]
```

### Create Workspace
```http
POST /workspaces
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Workspace",
  "slug": "my-workspace"
}
```

### Get Workspace
```http
GET /workspaces/:id
Authorization: Bearer <token>
```

### Add Member
```http
POST /workspaces/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "user@example.com",
  "role": "MEMBER"
}
```

## Projects

### Get All Projects
```http
GET /projects?workspaceId=<workspace-id>
Authorization: Bearer <token>
```

### Create Project
```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Development",
  "key": "PROD",
  "description": "Main product project",
  "workspaceId": "...",
  "color": "#6366F1"
}
```

### Get Project
```http
GET /projects/:id
Authorization: Bearer <token>
```

## Issues

### Get All Issues
```http
GET /issues?projectId=<project-id>&status=TODO&priority=HIGH
Authorization: Bearer <token>

Query Parameters:
- projectId: Filter by project
- status: BACKLOG | TODO | IN_PROGRESS | IN_REVIEW | DONE | CANCELLED
- priority: URGENT | HIGH | MEDIUM | LOW | NONE
- assigneeId: Filter by assignee
- search: Full-text search
- limit: Results limit (default: 50)
- offset: Pagination offset
```

### Create Issue
```http
POST /issues
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Fix login bug",
  "description": "Users can't login with SSO",
  "projectId": "...",
  "status": "TODO",
  "priority": "HIGH",
  "assigneeId": "...",
  "estimate": 3,
  "dueDate": "2024-02-01T00:00:00Z"
}

Response: 201 Created
{
  "id": "...",
  "title": "Fix login bug",
  "number": 123,
  "project": { "key": "PROD" },
  ...
}
```

### Get Issue
```http
GET /issues/:id
Authorization: Bearer <token>

Response includes:
- Full issue details
- Comments with replies
- Attachments
- Labels
- Activity log
- Relations
- Sub-issues
```

### Update Issue
```http
PATCH /issues/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "priority": "URGENT",
  "assigneeId": "..."
}
```

### Add Comment
```http
POST /issues/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Working on this now",
  "parentId": "..." // Optional, for replies
}
```

### Add Label
```http
POST /issues/:id/labels/:labelId
Authorization: Bearer <token>
```

### Remove Label
```http
DELETE /issues/:id/labels/:labelId
Authorization: Bearer <token>
```

## AI Features

### Generate Issue Details
```http
POST /ai/generate-issue
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Add user authentication",
  "workspaceId": "..."
}

Response: 200 OK
{
  "description": "## Description\n\nImplement comprehensive...",
  "acceptanceCriteria": ["...", "..."],
  "priority": "HIGH",
  "labels": ["backend", "security"],
  "estimate": 8,
  "subtasks": ["...", "..."],
  "aiGenerated": true,
  "confidence": 0.85
}
```

### Auto-Categorize Issue
```http
POST /ai/categorize
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Fix critical bug in payment flow",
  "description": "Users can't complete checkout",
  "workspaceId": "..."
}

Response: 200 OK
{
  "priority": "URGENT",
  "labels": ["bug", "payment"],
  "estimate": 5,
  "confidence": 0.92
}
```

### Detect Duplicates
```http
POST /ai/detect-duplicates
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Login page not responsive",
  "description": "Mobile users can't see login button",
  "projectId": "..."
}

Response: 200 OK
[
  {
    "id": "...",
    "title": "Mobile login issues",
    "similarity": 0.87
  }
]
```

## Search

### Full-Text Search
```http
GET /search?q=authentication&workspaceId=<workspace-id>
Authorization: Bearer <token>

Response: 200 OK
{
  "results": [...],
  "count": 5
}
```

### Semantic Search
```http
GET /search/semantic?q=login+problems&projectId=<project-id>
Authorization: Bearer <token>

Uses AI embeddings for similarity-based search
```

### Natural Language Query
```http
GET /search/natural-language?q=show%20me%20urgent%20bugs%20from%20last%20week&workspaceId=<workspace-id>
Authorization: Bearer <token>

Parses natural language into structured filters
```

## Teams

### Get All Teams
```http
GET /teams?workspaceId=<workspace-id>
Authorization: Bearer <token>
```

### Create Team
```http
POST /teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Engineering",
  "description": "Software development team",
  "workspaceId": "..."
}
```

### Add Team Member
```http
POST /teams/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "...",
  "role": "MEMBER"
}
```

## Labels

### Get All Labels
```http
GET /labels?workspaceId=<workspace-id>
Authorization: Bearer <token>
```

### Create Label
```http
POST /labels
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "bug",
  "color": "#EF4444",
  "description": "Bug reports",
  "workspaceId": "..."
}
```

## WebSocket Events

Connect to: `ws://localhost:4000`

### Join Workspace
```javascript
socket.emit('joinWorkspace', workspaceId);
```

### Join Issue
```javascript
socket.emit('joinIssue', issueId);
```

### Listen for Updates
```javascript
socket.on('issue:updated', (data) => {
  // Handle issue update
});

socket.on('issue:commented', (data) => {
  // Handle new comment
});

socket.on('notification', (data) => {
  // Handle notification
});
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [...]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Rate Limiting

- 100 requests per minute per IP
- 429 Too Many Requests response when exceeded

## Interactive API Documentation

Visit `http://localhost:4000/api` for Swagger UI with interactive API testing.
