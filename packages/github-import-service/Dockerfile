FROM node:22-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy all packages (for workspace dependencies)
COPY packages/ ./packages/

# Install dependencies
RUN npm ci

# Build the specific service
RUN npm run build --workspace=@personal-context-router/github-import-service

# Expose port
EXPOSE 3004

# Start the service
CMD ["npm", "run", "start:prod", "--workspace=@personal-context-router/github-import-service"]