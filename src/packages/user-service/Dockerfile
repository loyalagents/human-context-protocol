FROM node:22.19-bookworm-slim

WORKDIR /app

# Copy package files for dependency installation (deterministic installs)
COPY package*.json ./
COPY packages/user-service/package*.json ./packages/user-service/
COPY packages/shared/package*.json ./packages/shared/

# Install all dependencies for workspaces
RUN npm ci --workspaces --include-workspace-root

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/user-service ./packages/user-service
COPY tsconfig.json ./

# Build shared package first
RUN npx tsc -b packages/shared/tsconfig.json --clean && \
    npm run build --workspace=@personal-context-router/shared -- --force

# Build the user service directly with tsc (force clean then emit)
RUN npx tsc -b packages/user-service/tsconfig.build.json --clean && npx tsc -b packages/user-service/tsconfig.build.json && \
    ls -la packages/user-service/dist && \
    node -e "console.log('user dist/main.js exists?', require('fs').existsSync('packages/user-service/dist/main.js'))"

# Expose ports (HTTP + TCP microservice)
EXPOSE 3015 3016

# Start the user service (prod by default; compose may override)
CMD ["npm", "run", "start:prod", "--workspace=@personal-context-router/user-service"]