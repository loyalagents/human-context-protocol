FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/mcp-service/package*.json ./packages/mcp-service/
COPY packages/shared/package*.json ./packages/shared/

# Install all dependencies (including dev for build)
RUN npm ci --workspaces --include-workspace-root

# Copy source code
COPY packages/shared/ ./packages/shared/
COPY packages/mcp-service/ ./packages/mcp-service/
COPY tsconfig.json ./

# Build the application
RUN npm run build --workspace=@personal-context-router/shared

# Remove any cached TypeScript build info that may have been copied
RUN rm -f /app/packages/mcp-service/*.tsbuildinfo /app/packages/mcp-service/dist

# Build MCP service with fresh compilation
RUN npm run build --workspace=@personal-context-router/mcp-service

# Verify build output exists
RUN ls -la /app/packages/mcp-service/dist || (echo "❌ Build failed - dist directory not found" && exit 1)
RUN test -f /app/packages/mcp-service/dist/main.js || (echo "❌ Build failed - main.js not found" && exit 1)

# Expose MCP service port
EXPOSE 3003

# Start the application
WORKDIR /app/packages/mcp-service
CMD ["npm", "start"]