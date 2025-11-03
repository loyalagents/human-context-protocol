# Architecture Overview

How the Human Context Protocol services work together.

## Service Flow (Phase 0+)

**Current Architecture** (as of Phase 0):

```
Claude Desktop → MCP Gateway → MCP Service ──→ GraphQL Gateway ──→ REST Gateway → Internal Services
                               (Port 3003)    (Port 4000)        (Port 3000)    ├─→ User Service ←→ MongoDB
                                              [NEW: Phase 0]                     ├─→ Preference Service ←→ MongoDB
                                                                                 └─→ GitHub Service ←→ GitHub API
```

**Note**: The GraphQL Gateway currently wraps the REST Gateway. This is a temporary architecture (Phase 0) for validation. In Phase 3+, services will expose GraphQL directly via Apollo Federation.

**Future Architecture** (Phase 3+):

```
Claude Desktop → MCP Gateway → MCP Service ──→ GraphQL Gateway (Federation)
                               (Port 3003)    (Port 4000)         ↓
                                                                   ├─→ User Service (GraphQL) ←→ MongoDB
                                                                   ├─→ Preference Service (GraphQL) ←→ MongoDB
                                                                   └─→ GitHub Service (GraphQL) ←→ GitHub API
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
- **Tools**: 31 tools (Phase 0) → 3 tools (Phase 1+)
- **Phase 1+**: Calls GraphQL Gateway instead of REST Gateway

### GraphQL Gateway (Port 4000) **[NEW: Phase 0+]**
- **Role**: GraphQL API layer for flexible querying
- **Phase 0**: Wraps REST Gateway (temporary architecture)
- **Phase 3+**: Apollo Federation Gateway (direct service federation)
- **Benefits**:
  - Single query for user + preferences + locations
  - Reduces MCP from 31 tools → 3 tools
  - Better for AI agent querying
- **Access**: Internal only (MCP Service, future: REST Gateway)

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

**Get User Context (Phase 1+ with GraphQL):**
1. Claude calls MCP tool `query_user_context` → MCP Service
2. MCP Service → GraphQL Gateway (single query)
3. GraphQL Gateway → Multiple services (orchestrated automatically)
   - User Service for user data
   - Preference Service for preferences
   - Preference Service for locations
4. GraphQL Gateway → Returns combined result

## Migration Timeline

### Phase 0 (Current): GraphQL Gateway Setup ✅
- GraphQL Gateway running (port 4000)
- Wraps REST Gateway temporarily
- Schema defined for all operations
- Ready for MCP integration

### Phase 1 (Next): MCP Service Integration
- Update MCP Service to use GraphQL Gateway
- Reduce tools from 31 → 3
- Test with AI agents

### Phase 2: Validation
- Validate GraphQL improves MCP experience
- Measure AI agent success rate
- Decide: continue to federation or stay with wrapper

### Phase 3+: Federation Migration
- Migrate services to expose GraphQL subgraphs
- Replace REST wrapper with Apollo Federation
- Direct service-to-service GraphQL communication

See [GRAPHQL_MIGRATION_PLAN.md](/GRAPHQL_MIGRATION_PLAN.md) for complete details.