# AI Features Documentation

This document details all AI-powered features in the Linear Clone application.

## Overview

The application integrates OpenAI's GPT-4 and Ada-002 embedding models, along with PostgreSQL's pgvector extension, to provide intelligent assistance throughout the issue management workflow.

## 1. AI-Powered Issue Generation

### Description
Automatically generate comprehensive issue descriptions from a brief title.

### How It Works
1. User provides a simple title (e.g., "Add user authentication")
2. System analyzes recent issues in the workspace for context
3. GPT-4 generates:
   - Detailed description with markdown formatting
   - Acceptance criteria checklist
   - Suggested priority level
   - Relevant labels from workspace label library
   - Story point estimate (1-13)
   - Breakdown of subtasks

### API Endpoint
```http
POST /ai/generate-issue
{
  "title": "Add user authentication",
  "workspaceId": "workspace-id"
}
```

### Response Example
```json
{
  "description": "## Description\n\nImplement comprehensive user authentication system...\n\n## Requirements\n- Email/password authentication\n- Social OAuth...",
  "acceptanceCriteria": [
    "Users can register with email/password",
    "Users can login with social providers",
    "Secure token storage and refresh",
    "Password reset via email"
  ],
  "priority": "HIGH",
  "labels": ["backend", "security"],
  "estimate": 8,
  "subtasks": [
    "Set up JWT authentication",
    "Implement password hashing",
    "Add OAuth providers",
    "Create password reset flow",
    "Add rate limiting"
  ],
  "aiGenerated": true,
  "confidence": 0.85
}
```

### Frontend Integration
```typescript
import { aiApi } from '@/lib/api';

const generateIssue = async (title: string, workspaceId: string) => {
  const result = await aiApi.generateIssue(title, workspaceId);
  
  // Pre-fill issue form with AI suggestions
  setDescription(result.description);
  setPriority(result.priority);
  setLabels(result.labels);
  setEstimate(result.estimate);
};
```

## 2. Smart Categorization

### Description
Automatically categorize issues by analyzing title and description to suggest priority, labels, and estimates.

### How It Works
1. Analyzes issue content using GPT-4
2. Examines patterns in similar workspace issues
3. Suggests appropriate metadata
4. Provides confidence score for each suggestion

### API Endpoint
```http
POST /ai/categorize
{
  "title": "Fix critical bug in payment flow",
  "description": "Users can't complete checkout",
  "workspaceId": "workspace-id"
}
```

### Response Example
```json
{
  "priority": "URGENT",
  "labels": ["bug", "payment"],
  "estimate": 5,
  "confidence": 0.92
}
```

### Use Cases
- **New Issue Creation**: Suggest metadata as user types
- **Bulk Import**: Auto-categorize imported issues
- **Quality Control**: Flag miscategorized issues

## 3. Semantic Search

### Description
Search issues using natural language queries with AI-powered understanding of context and meaning.

### How It Works
1. **Embedding Generation**:
   - Every issue gets a 1536-dimension vector embedding
   - Generated using OpenAI's `text-embedding-ada-002` model
   - Stored in PostgreSQL using pgvector extension

2. **Search Process**:
   - User query converted to embedding
   - Vector similarity search finds relevant issues
   - Results ranked by cosine similarity

### Database Schema
```sql
-- pgvector extension
CREATE EXTENSION vector;

-- Issue table includes embedding column
ALTER TABLE "Issue" ADD COLUMN embedding vector(1536);

-- Create index for fast similarity search
CREATE INDEX ON "Issue" USING ivfflat (embedding vector_cosine_ops);
```

### API Endpoint
```http
GET /search/semantic?q=authentication+problems&projectId=project-id
```

### Example Queries
- "Show me all login issues" → Finds issues about authentication, SSO, OAuth
- "Performance problems in checkout" → Finds slowness, timeout, optimization issues
- "Mobile UI bugs" → Finds responsive, mobile, layout issues

### Implementation
```typescript
// Backend: embeddings.service.ts
async semanticSearch(query: string, projectId: string) {
  const embedding = await this.generateEmbedding(query);
  
  const results = await this.prisma.$queryRaw`
    SELECT
      i.*,
      1 - (i.embedding <=> ${embedding}::vector) as similarity
    FROM "Issue" i
    WHERE i."projectId" = ${projectId}
      AND i.embedding IS NOT NULL
    ORDER BY similarity DESC
    LIMIT 10
  `;
  
  return results.filter(r => r.similarity > 0.7);
}
```

## 4. Duplicate Detection

### Description
Automatically detect potential duplicate issues using vector similarity.

### How It Works
1. New issue content converted to embedding
2. Compare with existing issue embeddings
3. Flag issues with similarity > 0.8
4. Present to user before creation

### API Endpoint
```http
POST /ai/detect-duplicates
{
  "title": "Login page not responsive",
  "description": "Mobile users can't see login button",
  "projectId": "project-id"
}
```

### Response Example
```json
[
  {
    "id": "issue-123",
    "title": "Mobile login issues",
    "description": "Login form doesn't display on small screens",
    "similarity": 0.87,
    "project": { "key": "PROD" },
    "number": 145
  }
]
```

### UI Integration
```typescript
// Show warning before creating issue
const checkDuplicates = async () => {
  const duplicates = await aiApi.detectDuplicates(
    title,
    description,
    projectId
  );
  
  if (duplicates.length > 0) {
    showWarning({
      title: "Possible duplicates found",
      duplicates,
      actions: ["Create anyway", "View similar issues"]
    });
  }
};
```

## 5. Natural Language Query Parsing

### Description
Convert natural language search queries into structured filters.

### How It Works
Uses pattern matching and GPT-4 to parse queries like:
- "Show me all critical bugs assigned to me from last week"
- "High priority features in progress"
- "Urgent issues without assignee"

### API Endpoint
```http
GET /search/natural-language?q=show%20me%20urgent%20bugs&workspaceId=workspace-id
```

### Parsed Output
```json
{
  "filters": {
    "priority": "URGENT",
    "labels": ["bug"],
    "status": null,
    "assigneeId": null,
    "dateRange": null
  }
}
```

### Supported Patterns
- **Priority**: "urgent", "critical", "high priority", "low priority"
- **Status**: "todo", "in progress", "done", "backlog"
- **Assignment**: "assigned to me", "unassigned", "my issues"
- **Labels**: "bugs", "features", "backend", "frontend"
- **Time**: "last week", "this month", "yesterday", "today"

## Performance Considerations

### Embedding Generation
- **Cost**: ~$0.0001 per issue (1000 tokens)
- **Latency**: ~200ms per embedding
- **Strategy**: Generate embeddings asynchronously after issue creation

### Vector Search
- **Performance**: <50ms for typical workspace (1000-10000 issues)
- **Indexing**: Use IVFFlat or HNSW indexes for faster search
- **Scaling**: Embeddings can be cached and reused

### GPT-4 API Usage
- **Rate Limits**: 10,000 requests/min (varies by tier)
- **Cost**: $0.03/1K tokens (input), $0.06/1K tokens (output)
- **Optimization**: 
  - Cache common responses
  - Use context windows efficiently
  - Fallback to simpler models for basic tasks

## Configuration

### Environment Variables
```env
OPENAI_API_KEY=sk-your-api-key-here
```

### Workspace Settings
Each workspace can configure:
```json
{
  "enableAI": true,
  "aiFeatures": {
    "issueGeneration": true,
    "smartCategorization": true,
    "semanticSearch": true,
    "duplicateDetection": true
  }
}
```

## Error Handling

### Fallback Behavior
If AI services fail:
- **Issue Generation**: Return basic template
- **Categorization**: Use rule-based defaults
- **Semantic Search**: Fall back to full-text search
- **Duplicate Detection**: Skip check

### Error Responses
```json
{
  "error": "AI service unavailable",
  "fallback": true,
  "data": { /* fallback data */ }
}
```

## Best Practices

### For Users
1. **Issue Generation**: Provide context-rich titles
2. **Search**: Use descriptive queries (more words = better results)
3. **Categorization**: Review AI suggestions before accepting
4. **Duplicates**: Check suggestions even if confidence is low

### For Developers
1. **Caching**: Cache embeddings and common AI responses
2. **Rate Limiting**: Implement user-level rate limits for AI endpoints
3. **Monitoring**: Track AI service latency and error rates
4. **Cost Control**: Set budget alerts for OpenAI API usage

## Future Enhancements

### Planned Features
- **Comment Summarization**: Summarize long issue threads
- **Smart Replies**: Suggest comment responses
- **Auto-Tagging**: Automatically add labels as issues are updated
- **Predictive Analytics**: Predict issue completion time
- **Sentiment Analysis**: Detect urgent issues from tone
- **Smart Assignment**: Suggest assignees based on expertise

### Advanced Search
- Multi-modal search (text + code + images)
- Cross-workspace search
- Temporal search (find issues similar to past issues)

## Privacy & Security

### Data Handling
- Issue content sent to OpenAI API for processing
- No training on user data (OpenAI policy)
- Embeddings stored encrypted in database
- AI features can be disabled per workspace

### Compliance
- GDPR compliant (user data not retained by OpenAI)
- SOC 2 compliant infrastructure
- Data residency options available

## Troubleshooting

### Common Issues

**Embeddings not generating**
- Check OpenAI API key
- Verify pgvector extension is installed
- Check database permissions

**Poor search results**
- Ensure embeddings are generated for all issues
- Check similarity threshold (default: 0.7)
- Verify embedding index exists

**High API costs**
- Enable response caching
- Use batch embedding generation
- Limit embedding regeneration
- Consider using smaller models for simple tasks

## Monitoring & Analytics

### Metrics to Track
- AI API response time
- Embedding generation success rate
- Search result relevance (user feedback)
- Duplicate detection accuracy
- API cost per user/workspace

### Dashboard
```sql
-- Track AI feature usage
SELECT
  DATE(created_at) as date,
  COUNT(*) as ai_requests,
  AVG(response_time_ms) as avg_response_time,
  SUM(token_count) as total_tokens
FROM ai_request_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Support

For AI feature issues:
1. Check OpenAI service status
2. Review API key permissions
3. Verify pgvector installation
4. Check application logs for detailed errors

For questions or feature requests, open an issue on GitHub.
