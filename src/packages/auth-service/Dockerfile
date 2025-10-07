FROM node:22-alpine

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY packages/auth-service/package*.json ./packages/auth-service/

# Install dependencies
RUN npm ci --workspaces --include-workspace-root

# Copy source code
COPY packages/auth-service ./packages/auth-service
COPY tsconfig.json ./

# Build the auth service
RUN npm run build --workspace=@personal-context-router/auth-service

# Expose port
EXPOSE 3004

# Start the application
CMD ["npm", "start", "--workspace=@personal-context-router/auth-service"]