# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/graphql-gateway/package*.json ./packages/graphql-gateway/

# Install all dependencies (including devDependencies for build)
RUN npm ci --workspace=@personal-context-router/graphql-gateway --include-workspace-root

# Copy source code
COPY packages/graphql-gateway/ ./packages/graphql-gateway/
COPY tsconfig.json ./

# Build GraphQL Gateway
WORKDIR /app/packages/graphql-gateway
RUN npm run build

# Verify build succeeded
RUN ls -la dist || (echo "❌ Build failed - dist directory not found" && exit 1)
RUN test -f dist/main.js || (echo "❌ Build failed - main.js not found" && exit 1)

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/graphql-gateway/package*.json ./packages/graphql-gateway/

# Install only production dependencies
RUN npm ci --workspace=@personal-context-router/graphql-gateway --include-workspace-root --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/packages/graphql-gateway/dist ./packages/graphql-gateway/dist

WORKDIR /app/packages/graphql-gateway

EXPOSE 4000

CMD ["npm", "start"]
