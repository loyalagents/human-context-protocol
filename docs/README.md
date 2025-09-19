# Documentation

Simple documentation for the Human Context Protocol platform.

## Getting Started

- [Quick Start Guide](./quick-start.md) - Get up and running in 5 minutes
- [Architecture Overview](./architecture.md) - How the services work together
- [API Reference](./api.md) - Available endpoints and tools

## Development

- [Development Setup](./development.md) - Local development workflow
- [Docker Guide](./docker.md) - Container deployment and management

## Integration

- [Claude Integration](./claude.md) - Setting up MCP with Claude Desktop

## Adding a New Service

When adding a new microservice to the platform, follow these steps to ensure proper integration:

### 1. Create Service Directory Structure
```
src/packages/your-service-name/
├── src/
│   ├── modules/
│   ├── services/
│   ├── repositories/
│   ├── schemas/
│   └── main.ts
├── Dockerfile
├── package.json
├── tsconfig.json
├── tsconfig.build.json (if needed)
└── README.md (if needed)
```

### 2. Update Root Configuration Files

#### TypeScript Configuration (`src/tsconfig.json`)
Add your service to the `references` array:
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

#### Root Package.json (`src/package.json`)
Add dev scripts for your service:
```json
{
  "scripts": {
    "dev:your-service": "npm run dev --workspace=@personal-context-router/your-service-name"
  }
}
```

### 3. Docker Configuration

#### Update Docker Compose (`src/docker-compose.yml`)
Add your service configuration:
```yaml
your-service-name:
  build:
    context: .
    dockerfile: packages/your-service-name/Dockerfile
  container_name: your-service-name
  restart: unless-stopped
  ports:
    - "XXXX:XXXX"  # Choose appropriate port numbers
    - "YYYY:YYYY"  # Microservice port if needed
  command: npm run start:prod --workspace=@personal-context-router/your-service-name
  environment:
    - PORT=XXXX
    - MICROSERVICE_PORT=YYYY  # If using microservice pattern
    - NODE_ENV=development
    - MONGODB_URI=mongodb://mongodb:27017/personal-context-router
    # Add other environment variables as needed
  depends_on:
    - mongodb
    # Add other dependencies as needed
```

#### Create Dockerfile (`src/packages/your-service-name/Dockerfile`)
Follow the existing pattern:
```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/your-service-name/package*.json ./packages/your-service-name/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/your-service-name ./packages/your-service-name

# Build the service
RUN npm run build --workspace=@personal-context-router/shared
RUN npm run build --workspace=@personal-context-router/your-service-name

EXPOSE XXXX

CMD ["npm", "run", "start:prod", "--workspace=@personal-context-router/your-service-name"]
```

### 4. Gateway Integration

If your service needs HTTP endpoints, update the gateway:

#### Update Gateway Environment Variables
Add service connection details to `docker-compose.yml` gateway section:
```yaml
environment:
  - YOUR_SERVICE_HOST=your-service-name
  - YOUR_SERVICE_PORT=YYYY
```

#### Add Gateway Module
Create a new controller and service in the gateway to proxy requests to your service.

### 5. Service Package Configuration

#### Package.json (`src/packages/your-service-name/package.json`)
```json
{
  "name": "@personal-context-router/your-service-name",
  "version": "1.0.0",
  "main": "dist/main.js",
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "dev": "nest start --watch",
    "start": "node dist/main.js",
    "start:prod": "node dist/main.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@personal-context-router/shared": "workspace:*",
    // Add your service-specific dependencies
  }
}
```

#### TypeScript Config (`src/packages/your-service-name/tsconfig.json`)
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../shared" }
  ]
}
```

### 6. Update Documentation

- Add API endpoints to relevant documentation
- Update architecture diagrams if needed
- Document any new environment variables
- Add service-specific setup instructions

### 7. Port Allocation

Follow the existing port pattern:
- Gateway: 3000
- Preference Service: 3001 (HTTP), 3002 (Microservice)
- MCP Service: 3003
- GitHub Service: 3004
- User Service: 3015 (HTTP), 3016 (Microservice)

Choose the next available port range for your service.

### 8. Testing

- Ensure your service starts correctly in Docker
- Test service communication through the gateway
- Verify microservice communication if applicable
- Run the full test suite: `npm test`
- Check linting: `npm run lint`
- Verify TypeScript compilation: `npm run typecheck`

### 9. Environment Variables

Document any new environment variables in:
- Docker compose files
- Service documentation
- Local development setup instructions