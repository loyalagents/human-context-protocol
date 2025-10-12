FROM node:22-alpine

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY packages/mcp-gateway/package*.json ./packages/mcp-gateway/

# Install dependencies
RUN npm ci --workspaces --include-workspace-root

# Copy source code
COPY packages/mcp-gateway/ ./packages/mcp-gateway/
COPY tsconfig.json ./

# Build the project
RUN npm run build --workspace=@personal-context-router/mcp-gateway

# Install only production dependencies
RUN npm ci --omit=dev --workspaces --include-workspace-root

# Set working directory to the service
WORKDIR /app/packages/mcp-gateway

# Expose port
EXPOSE 3005

# Start the service
CMD ["npm", "start"]