FROM node:18-alpine

WORKDIR /app

# Copy package files for dependency installation (deterministic installs)
COPY package*.json ./
COPY packages/gateway/package*.json ./packages/gateway/
COPY packages/shared/package*.json ./packages/shared/

# Install all dependencies for workspaces
RUN npm ci --workspaces --include-workspace-root

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/gateway ./packages/gateway
COPY tsconfig.json ./

# Build shared package first
RUN npx tsc -b packages/shared/tsconfig.json --clean && \
    npm run build --workspace=@personal-context-router/shared -- --force

# Build the gateway service directly with tsc (force clean then emit)
RUN npx tsc -b packages/gateway/tsconfig.build.json --clean && npx tsc -b packages/gateway/tsconfig.build.json && \
    ls -la packages/gateway/dist && \
    node -e "console.log('gateway dist/main.js exists?', require('fs').existsSync('packages/gateway/dist/main.js'))"

# Expose port
EXPOSE 3000

# Start the gateway service (prod by default; compose may override)
CMD ["npm", "run", "start:prod", "--workspace=@personal-context-router/gateway"]
