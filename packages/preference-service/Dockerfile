FROM node:22.19-bookworm-slim

WORKDIR /app

# Copy package files for dependency installation (deterministic installs)
COPY package*.json ./
COPY packages/preference-service/package*.json ./packages/preference-service/
COPY packages/shared/package*.json ./packages/shared/

# Install all dependencies for workspaces
RUN npm ci --workspaces --include-workspace-root

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/preference-service ./packages/preference-service
COPY tsconfig.json ./

# Build shared package first
RUN npx tsc -b packages/shared/tsconfig.json --clean && \
    npm run build --workspace=@personal-context-router/shared -- --force

# Build the preference service directly with tsc (force clean then emit)
RUN npx tsc -b packages/preference-service/tsconfig.build.json --clean && npx tsc -b packages/preference-service/tsconfig.build.json && \
    ls -la packages/preference-service/dist && \
    node -e "console.log('preference dist/main.js exists?', require('fs').existsSync('packages/preference-service/dist/main.js'))"

# Expose ports (HTTP + TCP microservice)
EXPOSE 3001 3002

# Start the preference service (prod by default; compose may override)
CMD ["npm", "run", "start:prod", "--workspace=@personal-context-router/preference-service"]
