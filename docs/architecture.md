# Architecture Overview

How the Human Context Protocol services work together.

## Service Flow

```
Claude Desktop → MCP Service → Gateway → Internal Services
                                    ├─→ User Service ←→ MongoDB
                                    ├─→ Preference Service ←→ MongoDB
                                    └─→ GitHub Service ←→ GitHub API
```

## Core Services

### Gateway (Port 3000)
- **Role**: API router and rate limiter
- **Transports**: HTTP (external), TCP (to users/preferences), HTTP (to GitHub)
- **Routes**: `/api/users/*`, `/api/preferences/*`, `/api/github/*`, `/health`

### User Service (Ports 3005, 3015)
- **Role**: User account management and authentication
- **Database**: MongoDB with Mongoose
- **Transports**: HTTP (port 3005) + TCP microservice (port 3015)

### Preference Service (Ports 3001, 3002)
- **Role**: User preference storage and retrieval  
- **Database**: MongoDB with Mongoose
- **Transports**: HTTP (port 3001) + TCP microservice (port 3002)

### GitHub Import Service (Port 3004)
- **Role**: GitHub API integration
- **API**: Octokit for repository and user data
- **Access**: Internal only (via Gateway `/api/github/*`)

### MCP Service (Port 3003)  
- **Role**: Claude Desktop integration
- **Protocol**: Model Context Protocol over HTTP
- **Tools**: Preference management + GitHub data access

### Shared Package
- **Role**: Common types, DTOs, validation schemas, branded ID types
- **Usage**: Imported by all services for consistency
- **Features**: Type-safe UserId and PreferenceId with ts-brand

## Data Flow Examples

**Create User:**
1. External app → Gateway `/api/users`
2. Gateway → User Service (TCP)
3. User Service → MongoDB

**Store Preference:**
1. Claude calls MCP tool → MCP Service
2. MCP Service → Gateway `/api/preferences`
3. Gateway → Preference Service (TCP)
4. Preference Service → MongoDB
5. Preference Service → User Service (TCP) [validates userId]

**Get GitHub Repo:**
1. Claude calls MCP tool → MCP Service
2. MCP Service → Gateway `/api/github/repo/owner/name`
3. Gateway → GitHub Service (HTTP)
4. GitHub Service → GitHub API (Octokit)