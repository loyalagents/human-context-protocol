# GitHub Import Service

NestJS service for importing GitHub repository data and user information via Octokit.

## Purpose

- **Repository Data**: Fetch detailed GitHub repository information
- **User Analytics**: Retrieve user/organization repository listings
- **GitHub API Integration**: Official Octokit SDK with optional token authentication
- **Data Normalization**: Structured response format for downstream consumers

## API Operations

- `GET /repo/:owner/:repo` → Repository details
- `GET /user/:username/repos` → User's repository list
- `GET /health` → Service status
- `GET /test` → Connection test

## Architecture

- **Internal Service**: No direct external access (port 3004)
- **Gateway Routing**: All access via `/api/github/*` routes
- **Optional Auth**: Supports GITHUB_TOKEN for rate limit improvements