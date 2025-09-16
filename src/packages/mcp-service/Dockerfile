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
RUN npm run build --workspace=@personal-context-router/mcp-service

# Clean up dev dependencies for smaller image
RUN npm ci --omit=dev --workspaces --include-workspace-root

# Expose MCP service port
EXPOSE 3003

# Start the application
CMD ["npm", "run", "start", "--workspace=@personal-context-router/mcp-service"]