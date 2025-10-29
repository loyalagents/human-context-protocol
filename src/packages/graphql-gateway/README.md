# GraphQL Gateway

**Status**: Phase 0 - Temporary Architecture (Wrapping REST Gateway)

## Overview

This GraphQL Gateway provides a GraphQL API layer on top of the existing REST Gateway. This is a **temporary architecture** used for validation before migrating to full Apollo Federation.

## Architecture

```
GraphQL Gateway (Port 4000)
    ↓ (calls via HTTP)
REST Gateway (Port 3000)
    ↓ (NestJS microservices)
Backend Services
```

**Note**: Once Phase 3+ is complete, this will become an Apollo Federation Gateway that directly federates backend services.

## Getting Started

### Install Dependencies

```bash
npm install
```

### Environment Variables

Copy `.env` and configure:

```bash
PORT=4000
NODE_ENV=development
SERVICE_TOKEN=dev-service-token-change-in-production
REST_GATEWAY_URL=http://localhost:3000
```

### Run Development Server

```bash
npm run dev
```

The server will start at `http://localhost:4000/`

### Build for Production

```bash
npm run build
npm start
```

## Usage

### Apollo Sandbox

Open `http://localhost:4000/` in your browser to access Apollo Sandbox, where you can:
- Explore the schema
- Run queries and mutations
- View documentation

### Example Queries

#### Get User with Preferences and Locations

```graphql
{
  user(id: "507f1f77bcf86cd799439011") {
    email
    firstName
    lastName
    preferences {
      key
      data
      category
    }
    locations {
      key
      nickname
      address
      coordinates {
        lat
        lng
      }
    }
  }
}
```

#### Get User by Email

```graphql
{
  userByEmail(email: "user@example.com") {
    id
    email
    firstName
    isActive
  }
}
```

#### Create Preference

```graphql
mutation {
  createPreference(
    userId: "507f1f77bcf86cd799439011"
    key: "theme"
    data: { color: "dark", mode: "auto" }
    category: "ui"
  ) {
    id
    key
    data
  }
}
```

#### Get Effective Food Preferences

```graphql
{
  effectiveFoodPreferences(
    userId: "507f1f77bcf86cd799439011"
    locationKey: "home"
  ) {
    category
    level
  }
}
```

## Authentication

The GraphQL Gateway passes through authentication headers to the REST Gateway:

```bash
curl -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic <your-credentials>" \
  -d '{"query": "{ user(id: \"123\") { email } }"}'
```

## Features

### Current (Phase 0)

- ✅ GraphQL API wrapping REST endpoints
- ✅ Schema introspection
- ✅ Authentication pass-through
- ✅ Nested queries (user → preferences/locations)
- ✅ All CRUD operations for users, preferences, locations
- ✅ Food preference management

### Future (Phase 3+)

- Apollo Federation Gateway
- Direct service federation
- DataLoader for N+1 query optimization
- Response caching
- Query complexity limits

## Development

### Project Structure

```
src/
├── main.ts                 # Server entry point
├── schema/
│   └── typeDefs.ts        # GraphQL schema definitions
└── resolvers/
    ├── index.ts           # Resolver aggregation
    ├── user.resolvers.ts  # User query/mutation resolvers
    ├── preference.resolvers.ts
    └── location.resolvers.ts
```

### Adding New Resolvers

1. Update `schema/typeDefs.ts` with new types/queries/mutations
2. Create resolver in `resolvers/` directory
3. Add to `resolvers/index.ts`

Example:

```typescript
// resolvers/github.resolvers.ts
export const githubResolvers = {
  Query: {
    githubRepo: async (_: any, { owner, repo }: any, context: any) => {
      const response = await axios.get(
        `${REST_GATEWAY_URL}/api/github/repo/${owner}/${repo}`,
        { headers: { Authorization: context.authHeader } }
      );
      return response.data;
    },
  },
};

// resolvers/index.ts
import { githubResolvers } from './github.resolvers';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...githubResolvers.Query, // Add here
  },
};
```

## Testing

### Test Schema Introspection

```bash
curl -s -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { queryType { name } } }"}'
```

Expected: `{"data":{"__schema":{"queryType":{"name":"Query"}}}}`

### Test User Query

```bash
curl -s -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'user:pass' | base64)" \
  -d '{"query": "{ user(id: \"123\") { email } }"}'
```

## Troubleshooting

### "Connection refused" to REST Gateway

Make sure the REST Gateway is running on port 3000:

```bash
cd ../gateway && npm run dev
```

### Authentication Errors

Ensure you're passing the `Authorization` header:

```bash
-H "Authorization: Basic <base64-encoded-credentials>"
```

### GraphQL Syntax Errors

Use Apollo Sandbox (`http://localhost:4000/`) to validate queries - it provides better error messages and autocomplete.

## Migration Timeline

- ✅ **Phase 0** (Current): GraphQL wrapping REST
- 🔄 **Phase 1**: MCP Service uses this gateway
- 🔄 **Phase 2**: Validation period
- ⏳ **Phase 3**: User Service → GraphQL subgraph
- ⏳ **Phase 4**: Preference Service → GraphQL subgraph
- ⏳ **Phase 5**: Replace manual resolvers with federation

## Related Documentation

- [GraphQL Migration Plan](/GRAPHQL_MIGRATION_PLAN.md)
- [Apollo Server Docs](https://www.apollographql.com/docs/apollo-server/)
- [GraphQL Spec](https://spec.graphql.org/)
