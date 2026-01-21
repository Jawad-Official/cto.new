# Contributing to Linear Clone

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/linear-clone.git
   cd linear-clone
   ```
3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original-owner/linear-clone.git
   ```
4. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

## Development Setup

### Prerequisites

- Node.js 18+
- Docker Desktop
- PostgreSQL 15+ with pgvector
- OpenRouter.ai API key

### Local Development

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Add your environment variables

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev

# Start dev server
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local
# Add your environment variables

# Start dev server
npm run dev
```

## Project Structure

```
linear-clone/
├── backend/                # NestJS API
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── issues/        # Issues module
│   │   ├── ai/            # AI features
│   │   └── ...
│   └── prisma/            # Database schema
├── frontend/              # Next.js app
│   ├── app/              # App router pages
│   ├── components/       # React components
│   └── lib/              # Utilities
└── docs/                 # Documentation
```

## Coding Guidelines

### TypeScript

- Use TypeScript strict mode
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Use enums for constant values

**Example:**
```typescript
interface CreateIssueDto {
  title: string;
  description?: string;
  projectId: string;
  priority: IssuePriority;
}

enum IssuePriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  NONE = 'NONE',
}
```

### Backend (NestJS)

- Use decorators for controllers and services
- Implement DTOs for request validation
- Use Prisma for database operations
- Add Swagger documentation
- Handle errors properly

**Example Controller:**
```typescript
@Controller('issues')
@UseGuards(JwtAuthGuard)
@ApiTags('issues')
export class IssuesController {
  constructor(private issuesService: IssuesService) {}

  @Post()
  @ApiOperation({ summary: 'Create issue' })
  create(@Body() dto: CreateIssueDto, @Request() req) {
    return this.issuesService.create(dto, req.user.userId);
  }
}
```

### Frontend (Next.js)

- Use functional components
- Prefer server components when possible
- Use TailwindCSS for styling
- Use shadcn/ui for UI components
- Implement proper error handling

**Example Component:**
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CreateIssueButton() {
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createIssue(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCreate} disabled={loading}>
      Create Issue
    </Button>
  );
}
```

### Database

- Use Prisma schema for models
- Create migrations for schema changes
- Add indexes for frequently queried fields
- Use transactions for related operations

**Example Migration:**
```bash
npm run prisma:migrate:dev --name add_issue_embedding
```

## Commit Messages

Use conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(issues): add AI-powered duplicate detection

Implement vector similarity search to detect potential
duplicate issues before creation.

Closes #123
```

```
fix(auth): handle expired JWT tokens

Previously, expired tokens caused uncaught errors.
Now properly redirects to login page.

Fixes #456
```

## Pull Request Process

1. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**
   ```bash
   cd backend && npm run test
   cd frontend && npm run test
   ```

3. **Run linters**
   ```bash
   npm run lint
   npm run format
   ```

4. **Create PR**
   - Use a descriptive title
   - Reference related issues
   - Describe changes made
   - Include screenshots for UI changes
   - Add tests if applicable

5. **PR Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] E2E tests added/updated
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings
   - [ ] Tests pass

   ## Related Issues
   Closes #123
   ```

## Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

**Example Test:**
```typescript
describe('IssuesService', () => {
  let service: IssuesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [IssuesService, PrismaService],
    }).compile();

    service = module.get<IssuesService>(IssuesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create an issue', async () => {
    const dto = { title: 'Test', projectId: '123' };
    const result = await service.create(dto, 'user-id');
    expect(result.title).toBe('Test');
  });
});
```

### Frontend Tests

```bash
cd frontend

# Jest tests
npm run test

# E2E tests (Playwright)
npm run test:e2e
```

## Areas for Contribution

### High Priority

- [ ] Kanban board view
- [ ] Timeline/Gantt view
- [ ] Roadmap view
- [ ] File upload to Cloudflare R2
- [ ] Email notifications
- [ ] Slack integration
- [ ] GitHub integration

### AI Enhancements

- [ ] Comment summarization
- [ ] Smart reply suggestions
- [ ] Predictive completion times
- [ ] Auto-assign based on expertise
- [ ] Sentiment analysis

### Performance

- [ ] Optimize database queries
- [ ] Add Redis caching
- [ ] Implement pagination
- [ ] Add lazy loading
- [ ] Optimize bundle size

### Documentation

- [ ] Video tutorials
- [ ] API examples
- [ ] Architecture diagrams
- [ ] Deployment guides
- [ ] Troubleshooting guides

## Development Tips

### Debugging

**Backend:**
```bash
npm run start:debug
```
Then attach debugger on port 9229.

**Frontend:**
```typescript
// Use React DevTools
// Add breakpoints in browser
console.log('Debug:', data);
```

### Database

**View data:**
```bash
npm run prisma:studio
```

**Reset database:**
```bash
npm run prisma:migrate:reset
```

**Generate types:**
```bash
npm run prisma:generate
```

### AI Features

Test AI features with:
```bash
curl -X POST http://localhost:4000/ai/generate-issue \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Add feature", "workspaceId": "..."}'
```

## Code Review

Reviewers will check:
- Code quality and style
- Test coverage
- Documentation
- Performance impact
- Security implications
- Breaking changes

## Questions?

- Open an issue for bugs
- Start a discussion for features
- Join our Discord (if available)
- Email maintainers

## Recognition

Contributors will be:
- Listed in README
- Mentioned in release notes
- Given credit in commits

Thank you for contributing! 🎉
