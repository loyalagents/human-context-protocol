# GraphQL Gateway - Quick Start

## TL;DR

```bash
cd src/packages/graphql-gateway
npm install
npm run dev
```

Open http://localhost:4000/ → Start querying!

---

## Prerequisites Running

Make sure these are running FIRST:

```bash
# 1. MongoDB
mongod

# 2. User Service (Port 3001)
cd src/packages/user-service && npm run dev

# 3. Preference Service (Port 3002)
cd src/packages/preference-service && npm run dev

# 4. REST Gateway (Port 3000)
cd src/packages/gateway && npm run dev

# 5. NOW start GraphQL Gateway
cd src/packages/graphql-gateway && npm run dev
```

---

## Your First Query

Open http://localhost:4000/ and paste this:

```graphql
{
  __schema {
    queryType {
      name
    }
  }
}
```

Click "Run" → You should see: `{"data": {"__schema": {"queryType": {"name": "Query"}}}}`

**If this works, GraphQL Gateway is ready!** ✅

---

## Example Queries

### Get User

```graphql
query {
  user(id: "YOUR_USER_ID_HERE") {
    email
    firstName
    lastName
  }
}
```

### Get User + Preferences + Locations (The Magic!)

```graphql
query {
  user(id: "YOUR_USER_ID_HERE") {
    email
    firstName
    preferences {
      key
      data
    }
    locations {
      nickname
      address
    }
  }
}
```

This single query replaces **3 separate REST calls**! 🚀

---

## Create Something

### Create Preference

```graphql
mutation {
  createPreference(
    userId: "YOUR_USER_ID_HERE"
    key: "theme"
    data: { color: "dark" }
  ) {
    id
    key
    data
  }
}
```

---

## Common Issues

### "Connection refused"
→ REST Gateway not running. Start it: `cd src/packages/gateway && npm run dev`

### "Unauthorized"
→ Add auth header in Apollo Sandbox:
```json
{
  "Authorization": "Basic bG95YWwtYmlyZHM6YzAwbC1jQHRz"
}
```

### "User not found"
→ Create a user first via REST:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'loyal-birds:c00l-c@ts' | base64)" \
  -d '{"email": "test@example.com", "firstName": "Test"}'
```

---

## What's Next?

1. ✅ Phase 0 Complete: GraphQL Gateway works
2. → Phase 1: Update MCP Service to use this gateway (31 tools → 3 tools!)
3. → Phase 2: Validate with AI agents
4. → Phase 3+: Migrate to federation

---

## Need More Info?

- **Full docs**: [README.md](README.md)
- **Testing guide**: [TESTING.md](TESTING.md)
- **Migration plan**: [/GRAPHQL_MIGRATION_PLAN.md](/GRAPHQL_MIGRATION_PLAN.md)

---

**Happy querying!** 🎉
