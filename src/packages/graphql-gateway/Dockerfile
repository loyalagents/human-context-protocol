FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/graphql-gateway/package*.json ./packages/graphql-gateway/

# Install dependencies
RUN npm install --workspace=@personal-context-router/graphql-gateway

# Copy source code
COPY packages/graphql-gateway ./packages/graphql-gateway

# Build
WORKDIR /app/packages/graphql-gateway
RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
