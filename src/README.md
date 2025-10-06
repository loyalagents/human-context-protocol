# Human Context Protocol

**NestJS microservices platform enabling Claude AI to access and manage user preferences and GitHub data via Model Context Protocol (MCP).**

## What This Does

This system allows Claude Desktop to:
- Manage user accounts and authentication
- Store and retrieve user preferences across sessions
- **Manage user locations** (home, work, custom places) for context-aware recommendations
- Access GitHub repository and user data
- Maintain persistent context for personalized interactions

## Architecture

**5 interconnected NestJS services:**

- **Gateway** (`packages/gateway`): API router with rate limiting and validation
- **Preference Service** (`packages/preference-service`): MongoDB-backed preference storage (HTTP + TCP)  
- **GitHub Import Service** (`packages/github-import-service`): GitHub API integration via Octokit
- **MCP Service** (`packages/mcp-service`): Claude integration via Model Context Protocol
- **Shared** (`packages/shared`): Common types, DTOs, and utilities

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
- Gateway: http://localhost:3000 (entry point for all API calls)
- Preference Service: http://localhost:3001 (direct access for development)
- MCP Service: http://localhost:3003/mcp (HTTP bridge for Claude integration)
- MongoDB: localhost:27017

**Note**: GitHub Import Service is only accessible via the Gateway at `/api/github/*` routes for consistent architecture.

### Local Development (Alternative)

If you prefer to run without Docker:

1. **Prerequisites:** Node.js 22+, MongoDB running locally
2. **Install:** `npm install`
3. **Build:** `npm run build`
4. **Run:** `npm run dev` (starts all services including MCP)

Changes you make to code on your host are picked up immediately in this local (non-Docker) flow.

### Services

**Gateway Service**: `http://localhost:3000` (Main API Entry Point)
- Health check: `GET /health`
- Swagger docs: `GET /api/docs`
- API routes: `GET /api/preferences/*` (communicates with preference microservice via TCP)
- Location API routes: `GET /api/locations/*` (proxies to Preference Service HTTP API)
- GitHub API routes: `GET /api/github/*` (proxies to GitHub Import Service via HTTP)

**Preference Service**: `http://localhost:3001`  
- Health check: `GET /health`
- Swagger docs: `GET /api/docs`
- HTTP API + TCP microservice (port 3002 for inter-service communication)
- Create preference: `POST /preferences`
- Get user preferences: `GET /preferences/user/:userId`
- Get specific preference: `GET /preferences/user/:userId/:key`
- Update preference: `PUT /preferences/user/:userId/:key`
- Delete preference: `DELETE /preferences/user/:userId/:key`

**GitHub Import Service**: Internal service (no direct access)
- **Access via Gateway**: All GitHub endpoints available at `/api/github/*` routes
- Health check via Gateway: `GET /api/github/health`
- Service status via Gateway: `GET /api/github/test`
- Get repository via Gateway: `GET /api/github/repo/:owner/:repo`
- Get user repositories via Gateway: `GET /api/github/user/:username/repos`
- GitHub API integration using Octokit
- Environment variable: `GITHUB_TOKEN` (optional for public repos)
- **Note**: Service runs internally - all access must go through Gateway

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

**GitHub Import Service Examples (via Gateway):**

Test the service:
```bash
curl http://localhost:3000/api/github/health
curl http://localhost:3000/api/github/test
```

Get a public repository:
```bash
curl "http://localhost:3000/api/github/repo/octocat/Hello-World"
```

Get a user's repositories:
```bash
curl "http://localhost:3000/api/github/user/octocat/repos"
```

### Location Management

The system includes comprehensive location management for context-aware features. Users can manage both system locations (home, work, gym, school) and custom locations.

**Get all locations for a user:**
```bash
curl "http://localhost:3000/api/locations?userId=507f1f77bcf86cd799439011"
```

**Create a system location (home):**
```bash
curl -X POST "http://localhost:3000/api/locations/system?userId=507f1f77bcf86cd799439011" \
  -H "Content-Type: application/json" \
  -d '{
    "locationType": "home",
    "address": "123 Main Street, Anytown, ST 12345",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "nickname": "My Home"
  }'
```

**Create a custom location:**
```bash
curl -X POST "http://localhost:3000/api/locations/custom?userId=507f1f77bcf86cd799439011" \
  -H "Content-Type: application/json" \
  -d '{
    "locationName": "moms_house",
    "address": "456 Family Street, Hometown, ST 67890",
    "coordinates": {
      "lat": 41.1234,
      "lng": -75.5678
    },
    "nickname": "Mom'\''s House",
    "category": "residence",
    "features": ["food_preferences", "delivery_support"]
  }'
```

**Get available system location types:**
```bash
curl "http://localhost:3000/api/locations/available-system?userId=507f1f77bcf86cd799439011"
```

**Update a location (when you move):**
```bash
curl -X PUT "http://localhost:3000/api/locations/home?userId=507f1f77bcf86cd799439011" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "789 New Street, Different City, ST 98765",
    "coordinates": {
      "lat": 42.3601,
      "lng": -71.0589
    }
  }'
```

**Note**: User IDs must be valid MongoDB ObjectId format (24 hex characters). All location preferences automatically work with the new address when you update a location.

## Food Preference Management

**Context-aware food preferences with default + location-specific overrides.**

### Overview

The food preference system enables users to:
- Set **default food preferences** (global across all locations)
- Override preferences **per location** (e.g., healthy food at work, comfort food at home)
- Get **effective preferences** that automatically merge defaults + location overrides
- Support **17 food categories** with **5 preference levels** each

**Food Categories**: italian, chinese, mexican, american, indian, japanese, thai, mediterranean, fast_food, healthy, vegetarian, vegan, pizza, seafood, bbq, coffee, dessert

**Preference Levels**: love (5), like (4), neutral (3), dislike (2), hate (1)

### Key Features

- **Per-user defaults**: Each user has their own default preferences (not global)
- **Location overrides**: Different preferences when at specific locations
- **Smart merging**: Effective preferences combine defaults + location overrides
- **Auto-initialization**: New users get neutral defaults for all categories
- **Persistent storage**: Preferences persist across sessions once set

### API Examples

**Set default food preferences (global):**
```bash
curl -X PUT "http://localhost:3000/api/locations/food-preferences/default?userId=507f1f77bcf86cd799439011" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": [
      {"category": "italian", "level": "love"},
      {"category": "fast_food", "level": "dislike"},
      {"category": "healthy", "level": "like"}
    ]
  }'
```

**Override preferences for work location:**
```bash
curl -X PUT "http://localhost:3000/api/locations/work/food-preferences?userId=507f1f77bcf86cd799439011" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": [
      {"category": "healthy", "level": "love"},
      {"category": "fast_food", "level": "hate"}
    ]
  }'
```

**Get effective preferences at work (merges defaults + work overrides):**
```bash
curl "http://localhost:3000/api/locations/food-preferences/effective?userId=507f1f77bcf86cd799439011&locationKey=work"
```

**Update a single preference:**
```bash
curl -X PATCH "http://localhost:3000/api/locations/food-preferences/default?userId=507f1f77bcf86cd799439011" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "pizza",
    "level": "love"
  }'
```

**Get default preferences:**
```bash
curl "http://localhost:3000/api/locations/food-preferences/default?userId=507f1f77bcf86cd799439011"
```

### MCP Tools for Claude

The food preference system includes 7 MCP tools for Claude AI integration:

- `get_default_food_preferences` - Get user's global food preferences
- `set_default_food_preferences` - Set multiple global preferences
- `update_default_food_preference` - Update single global preference
- `get_location_food_preferences` - Get location-specific overrides
- `set_location_food_preferences` - Set location-specific overrides
- `update_location_food_preference` - Update single location preference
- `get_effective_food_preferences` - Get merged final preferences (with optional location)

**Example Claude usage:**
```
"Set my default food preferences to love Italian and hate fast food"
"When I'm at work, I prefer healthy food and want to avoid fast food even more"
"What are my effective food preferences when I'm at home?"
```

### Use Cases

- **Context-aware recommendations**: Claude can suggest restaurants based on location + preferences
- **Dietary tracking**: Different eating habits at different locations
- **Smart ordering**: Automatic preference application based on current location
- **Personal insights**: Understanding food preference patterns across locations

### Claude Integration

To use the MCP service with Claude Desktop:

1. **Start the services**: `docker compose up --build` (or `npm run dev` for local development)

2. **Add to Claude Desktop config**: Copy the configuration from `claude-desktop-config-example.json` to your Claude Desktop config file:

   **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   **Linux**: `~/.config/Claude/claude_desktop_config.json`

3. **Restart Claude Desktop** - The MCP server will be available automatically

4. **Available MCP Tools**:

   **Preference Tools:**
   - `get_user_preferences(userId)` - Get all preferences for a user
   - `get_preference(userId, key)` - Get specific preference
   - `set_preference(userId, key, value, type)` - Create/update preference
   - `update_preference(userId, key, value)` - Update existing preference
   - `delete_preference(userId, key)` - Delete preference
   - `list_preference_keys(userId)` - List all preference keys

   **Location Tools:**
   - `get_user_locations(userId, type?)` - Get all/filtered locations for a user
   - `get_location(userId, locationKey)` - Get specific location details
   - `create_system_location(userId, locationType, address, coordinates, nickname?, notes?)` - Create home/work/gym/school
   - `create_custom_location(userId, locationName, address, coordinates, nickname, category, features)` - Create custom location
   - `update_location(userId, locationKey, address?, coordinates?, nickname?, notes?)` - Update location details
   - `delete_location(userId, locationKey)` - Remove a location
   - `get_available_system_locations(userId)` - Get system location types not yet created
   - `mark_location_as_used(userId, locationKey)` - Update last used timestamp

   **GitHub Tools:**
   - `get_github_repo(owner, repo)` - Get detailed information about a specific GitHub repository
   - `get_user_repos(username)` - Get all repositories for a GitHub user or organization

**Version Note**: Using `mcp-remote@0.1.18` for consistent behavior across team members. To upgrade: update version in `claude-desktop-config-example.json` and test thoroughly.

### MCP Architecture Evolution

**Phase 1 (Current): Local Development**
```
Claude Desktop → mcp-remote → localhost:3003/mcp → MCP Service → Gateway
```
- ✅ Working local setup for development and testing
- ✅ Simple to debug with direct MCP service access
- ✅ Secure for localhost-only usage

**Phase 2 (Future): Internet Deployment**
```
Internet → Claude → mcp-remote → your-domain.com/mcp → Gateway → MCP Service (internal)
```

When internet access is needed, implement Phase 2:

1. **Add `/mcp` endpoint to Gateway** - Proxy MCP JSON-RPC requests to internal MCP service
2. **Make MCP service internal-only** - Remove port 3003 from external exposure
3. **Update Claude configuration** - Point to `your-domain.com/mcp` instead of `localhost:3003`
4. **Add authentication to Gateway** - Enforce API keys/JWT for MCP endpoint security
5. **Apply rate limiting** - Use Gateway's existing throttling for MCP traffic

This staged approach provides a working local system now while enabling secure internet deployment later.

## Development

### Commands

- `npm run build` - Build all packages
- `npm run dev` - Start all services in development mode
- `npm run dev:gateway` - Start only gateway service
- `npm run dev:preference` - Start only preference service
- `npm run dev:github` - Start only GitHub import service
- `npm run dev:mcp` - Start only MCP service
- `npm run lint` - Lint all packages
- `npm run test` - Run tests for all packages
- `npm run clean` - Clean build artifacts and node_modules

### Package Structure

```
packages/
├── gateway/             # API Gateway service
├── preference-service/  # User preference management
├── github-import-service/ # GitHub data import service
├── mcp-service/         # Model Context Protocol server for Claude
└── shared/              # Shared types and utilities
```

### Adding New Services

When creating a new service, follow these steps to ensure proper integration:

#### 1. Create Service Directory Structure
```bash
mkdir packages/your-service-name
cd packages/your-service-name

# Create basic NestJS structure
mkdir src src/controllers src/services src/schemas src/dto
touch src/main.ts src/app.module.ts
```

#### 2. Create package.json
Create `packages/your-service-name/package.json`:
```json
{
  "name": "@personal-context-router/your-service-name",
  "version": "1.0.0",
  "description": "Description of your service",
  "main": "dist/main.js",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@personal-context-router/shared": "*",
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/microservices": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/config": "^3.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/jest": "^29.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "supertest": "^6.3.0",
    "@types/supertest": "^6.0.0"
  }
}
```

#### 3. Create TypeScript Configuration
Create `packages/your-service-name/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
```

Create `packages/your-service-name/tsconfig.build.json`:
```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts", "**/*test.ts"]
}
```

#### 4. Create Dockerfile
Create `packages/your-service-name/Dockerfile`:
```dockerfile
FROM node:22.19-bookworm-slim

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY packages/your-service-name/package*.json ./packages/your-service-name/
COPY packages/shared/package*.json ./packages/shared/

# Install all dependencies for workspaces
RUN npm ci --workspaces --include-workspace-root

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/your-service-name ./packages/your-service-name
COPY tsconfig.json ./

# Build shared package first
RUN npx tsc -b packages/shared/tsconfig.json --clean && \
    npm run build --workspace=@personal-context-router/shared -- --force

# Build the service
RUN npx tsc -b packages/your-service-name/tsconfig.build.json --clean && \
    npx tsc -b packages/your-service-name/tsconfig.build.json

# Expose ports (HTTP + microservice if needed)
EXPOSE 3XXX 3XXY

# Start the service
CMD ["npm", "run", "start:prod", "--workspace=@personal-context-router/your-service-name"]
```

#### 5. Update Root Configuration Files

**Update `tsconfig.json` - Add to references array:**
```json
{
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/gateway" },
    { "path": "./packages/preference-service" },
    { "path": "./packages/user-service" },
    { "path": "./packages/mcp-service" },
    { "path": "./packages/your-service-name" }
  ]
}
```

**Update `package.json` - Add development script:**
```json
{
  "scripts": {
    "dev:your-service": "npm run dev --workspace=@personal-context-router/your-service-name"
  }
}
```

#### 6. Update Docker Compose
Add your service to `docker-compose.yml`:
```yaml
services:
  your-service-name:
    build:
      context: .
      dockerfile: packages/your-service-name/Dockerfile
    container_name: your-service-name
    restart: unless-stopped
    ports:
      - "3XXX:3XXX"  # HTTP port
      - "3XXY:3XXY"  # Microservice port (if needed)
    command: npm run start:prod --workspace=@personal-context-router/your-service-name
    environment:
      - PORT=3XXX
      - MICROSERVICE_PORT=3XXY  # If needed
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongodb:27017/personal-context-router  # If using MongoDB
    depends_on:
      - mongodb  # Add other dependencies as needed
```

#### 7. Update Gateway Configuration
If your service needs to be accessible via the gateway:

1. **Add environment variables** to gateway service in `docker-compose.yml`:
```yaml
gateway:
  environment:
    - YOUR_SERVICE_HOST=your-service-name
    - YOUR_SERVICE_PORT=3XXY
```

2. **Update gateway dependencies:**
```yaml
gateway:
  depends_on:
    - your-service-name
```

3. **Add proxy routes** in gateway service code

#### 8. Create Basic Service Implementation
Create `packages/your-service-name/src/main.ts`:
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3XXX);
}
bootstrap();
```

Create `packages/your-service-name/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

#### 9. Install Dependencies
```bash
# Install dependencies for the new service
npm install

# Install any additional dependencies needed
npm install --workspace=@personal-context-router/your-service-name package-name
```

#### 10. Update Documentation and Configuration
- Update this README if the service adds new functionality
- Update `architecture.md` with service details
- Add Swagger documentation for API endpoints
- Ensure the service is only accessible via the gateway (unless it's MCP service)
- Update `CLAUDE.md` conventions file if needed

#### 11. Test the Service
```bash
# Build and test
npm run build
npm run test

# Test with Docker
docker-compose up --build your-service-name

# Verify the service is accessible
curl http://localhost:3XXX/health
```

#### Port Allocation Guidelines
Current port assignments:
- Gateway: 3000
- Preference Service: 3001 (HTTP), 3002 (microservice)
- MCP Service: 3003
- GitHub Import Service: 3004 (internal only)
- User Service: 3015 (HTTP), 3016 (microservice)

**Choose available ports in the 3000-3999 range for new services.**

#### Important Notes
- All services except MCP service should only be accessible via the gateway
- Follow existing code patterns and conventions in other services
- Use the shared package for common utilities and types
- Update Swagger documentation for any new API endpoints
- Ensure proper error handling and logging
- Add health check endpoints for monitoring

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
  - Gateway HTTP: 3000 (external access)
  - Preference Service HTTP: 3001 (external access for development)
  - Preference Service TCP: 3002 (internal gateway communication)
  - GitHub Import Service HTTP: 3004 (internal only - access via gateway)
  - MCP Service HTTP: 3003 (external access for Claude)

## Deployment

Each service can be deployed independently as Docker containers. The NestJS applications are production-ready with:
- Health checks
- Graceful shutdown
- Environment-based configuration
- Request validation
- Error handling
