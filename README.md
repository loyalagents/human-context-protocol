# Personal Context Router

A microservices monorepo built with **NestJS** and TypeScript for managing personal context and preferences.

## Architecture

This monorepo contains multiple microservices built with NestJS:

- **Gateway Service** (`packages/gateway`): NestJS API Gateway with built-in rate limiting, validation, and microservice communication
- **Preference Service** (`packages/preference-service`): NestJS microservice for managing user preferences (HTTP + TCP transport)
- **MCP Service** (`packages/mcp-service`): Model Context Protocol server for Claude integration, exposing preference management tools
- **Shared Package** (`packages/shared`): Common DTOs, interfaces, decorators, and validation schemas

## Quick Start

### Prerequisites

- Docker & Docker Compose

### Quick Start with Docker (Recommended)

**Just one command to run everything:**

```bash
docker compose up --build
```

That's it! This will:
- ✅ Start MongoDB automatically
- ✅ Build and run all services (production mode)
- ✅ Set up networking between services
- ✅ MCP service available for Claude integration

Note: in this default configuration, containers run compiled code (no live reload). See "Live Reload Options" below if you want auto-rebuild on file changes.

**Services will be available at:**
- Gateway: http://localhost:3000
- Preference Service: http://localhost:3001
- MCP Service: http://localhost:3003/mcp (HTTP bridge for Claude integration)
- MongoDB: localhost:27017

### Local Development (Alternative)

If you prefer to run without Docker:

1. **Prerequisites:** Node.js 22+, MongoDB running locally
2. **Install:** `npm install`
3. **Build:** `npm run build`
4. **Run:** `npm run dev` (starts all services including MCP)

Changes you make to code on your host are picked up immediately in this local (non-Docker) flow.

### Services

**Gateway Service**: `http://localhost:3000`
- Health check: `GET /health`
- Swagger docs: `GET /api/docs`  
- API routes: `GET /api/preferences/*` (communicates with preference microservice via TCP)

**Preference Service**: `http://localhost:3001`  
- Health check: `GET /health`
- Swagger docs: `GET /api/docs`
- HTTP API + TCP microservice (port 3002 for inter-service communication)
- Create preference: `POST /preferences`
- Get user preferences: `GET /preferences/user/:userId`
- Get specific preference: `GET /preferences/user/:userId/:key`
- Update preference: `PUT /preferences/user/:userId/:key`
- Delete preference: `DELETE /preferences/user/:userId/:key`

**MCP Service**: `http://localhost:3003/mcp` (HTTP bridge)
- Model Context Protocol server for Claude integration via HTTP bridge
- Provides tools: `get_user_preferences`, `get_preference`, `set_preference`, `update_preference`, `delete_preference`, `list_preference_keys`
- Connects to Gateway via HTTP for all operations
- **HTTP endpoint**: `/mcp` handles JSON-RPC requests
- **Health check**: `/health` for service monitoring
- **Claude setup**: Use `claude-desktop-config-example.json` configuration

### API Examples

Create a preference:
```bash
curl -X POST http://localhost:3000/api/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "key": "theme",
    "value": "dark",
    "type": "string"
  }'
```

Get user preferences:
```bash
curl http://localhost:3000/api/preferences/user/user123
```

### Claude Integration

To use the MCP service with Claude Desktop:

1. **Start the services**: `docker compose up --build` (or `npm run dev` for local development)

2. **Add to Claude Desktop config**: Copy the configuration from `claude-desktop-config-example.json` to your Claude Desktop config file:

   **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   **Linux**: `~/.config/Claude/claude_desktop_config.json`

3. **Restart Claude Desktop** - The MCP server will be available automatically

4. **Available MCP Tools**:
   - `get_user_preferences(userId)` - Get all preferences for a user
   - `get_preference(userId, key)` - Get specific preference
   - `set_preference(userId, key, value, type)` - Create/update preference
   - `update_preference(userId, key, value)` - Update existing preference
   - `delete_preference(userId, key)` - Delete preference
   - `list_preference_keys(userId)` - List all preference keys

**Version Note**: Using `mcp-remote@0.1.18` for consistent behavior across team members. To upgrade: update version in `claude-desktop-config-example.json` and test thoroughly.

## Development

### Commands

- `npm run build` - Build all packages
- `npm run dev` - Start all services in development mode
- `npm run lint` - Lint all packages
- `npm run test` - Run tests for all packages
- `npm run clean` - Clean build artifacts and node_modules

### Package Structure

```
packages/
├── gateway/           # API Gateway service
├── preference-service/  # User preference management
├── mcp-service/       # Model Context Protocol server for Claude
└── shared/            # Shared types and utilities
```

### Adding New Services

1. Create new package directory under `packages/`
2. Add package.json with workspace reference
3. Create TypeScript config extending root config
4. Add service reference to root tsconfig.json
5. Update gateway proxy routes if needed

## Live Reload Options

By default, `docker compose up --build` runs services in production mode without live reload. To pick up code changes you must rebuild:

- Rebuild and run: `docker compose up --build`
- Or rebuild images only: `docker compose build` then `docker compose up`

If you want live reload inside Docker, there are two common approaches we can add later:

- Dev profile with bind mounts + explicit build-then-watch per service
  - Mount `packages/<service>` into the container.
  - Run from the service directory: `npm run build` once, then `tsc --watch` to emit `dist`, and run `node dist/main.js` with a watcher (e.g., nodemon) that restarts on `dist/**` changes.
  - This avoids issues with workspace CWD and ensures a first emit exists before starting the app.

- Hybrid: run services locally, keep only MongoDB in Docker
  - `docker compose up mongodb`
  - In another terminal, run `npm run dev` locally. This gives the fastest iteration loop.

If you want, we can add a `docker-compose.dev.yml` that enables bind mounts and a reliable watch flow for both services, while keeping the current file as a stable production profile.

## NestJS Features

This architecture leverages NestJS's powerful features:

- **Dependency Injection**: Clean separation of concerns with injectable services
- **Decorators**: Route definitions, validation, and API documentation via decorators
- **Microservices**: TCP transport between gateway and services for efficient communication
- **Validation**: Automatic request validation using class-validator and DTOs
- **Swagger Integration**: Auto-generated API documentation
- **Rate Limiting**: Built-in throttling with @nestjs/throttler
- **Modular Architecture**: Feature-based modules for scalability

## Transport Architecture

- **HTTP**: Gateway exposes REST API to external clients
- **TCP**: Internal service-to-service communication via NestJS microservices
- **Ports**:
  - Gateway HTTP: 3000  
  - Preference Service HTTP: 3001
  - Preference Service TCP: 3002

## Deployment

Each service can be deployed independently as Docker containers. The NestJS applications are production-ready with:
- Health checks
- Graceful shutdown
- Environment-based configuration
- Request validation
- Error handling
