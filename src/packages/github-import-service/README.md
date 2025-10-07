# GitHub Import Service

NestJS service for importing GitHub repository data and user information via Octokit.

## Purpose

- **Repository Data**: Fetch detailed GitHub repository information
- **User Analytics**: Retrieve user/organization repository listings
- **GitHub API Integration**: Official Octokit SDK with optional token authentication
- **Data Normalization**: Structured response format for downstream consumers

## API Operations

**All routes require authentication via Gateway:**

- `GET /api/github/repo/:owner/:repo` → Repository details **[Auth Required]**
- `GET /api/github/user/:username/repos` → User's repository list **[Auth Required]**
- `GET /api/github/health` → Service status **[Auth Required]**
- `GET /api/github/test` → Connection test **[Auth Required]**

## Access & Authentication

- **Via Gateway Only**: All access through `http://localhost:3000/api/github/*`
- **Authentication Required**: Use Basic Auth credentials
- **No Direct Access**: Internal service port 3004 not exposed externally

**Usage Examples:**
```bash
# Repository details (requires auth)
curl -u admin:your-password "http://localhost:3000/api/github/repo/octocat/Hello-World"

# User repositories (requires auth)
curl -u admin:your-password "http://localhost:3000/api/github/user/octocat/repos"

# Health check (requires auth)
curl -u admin:your-password http://localhost:3000/api/github/health
```

## Architecture

- **Internal Service**: No direct external access (port 3004)
- **Gateway Routing**: All access via `/api/github/*` routes with authentication
- **GitHub Token**: Supports optional GITHUB_TOKEN for higher rate limits