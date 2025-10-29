# GraphQL Gateway Testing Guide

## Prerequisites

1. **Start all services** in order:

```bash
# Terminal 1: Start MongoDB (if not running)
mongod

# Terminal 2: Start User Service (Port 3001)
cd src/packages/user-service && npm run dev

# Terminal 3: Start Preference Service (Port 3002)
cd src/packages/preference-service && npm run dev

# Terminal 4: Start REST Gateway (Port 3000)
cd src/packages/gateway && npm run dev

# Terminal 5: Start GraphQL Gateway (Port 4000)
cd src/packages/graphql-gateway && npm run dev
```

2. **Create a test user** (optional, if database is empty):

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'loyal-birds:c00l-c@ts' | base64)" \
  -d '{"email": "test@example.com", "firstName": "Test", "lastName": "User"}'
```

Save the returned user ID for testing.

## Phase 0 Test Suite

### Test 1: Schema Introspection ✅

Verify GraphQL schema is accessible:

```bash
curl -s -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { queryType { name } mutationType { name } } }"}'
```

**Expected Output**:
```json
{
  "data": {
    "__schema": {
      "queryType": { "name": "Query" },
      "mutationType": { "name": "Mutation" }
    }
  }
}
```

### Test 2: Get User by ID ✅

```bash
export USER_ID="<your-user-id-from-step-2>"

curl -s -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'loyal-birds:c00l-c@ts' | base64)" \
  -d "{\"query\": \"{ user(id: \\\"$USER_ID\\\") { id email firstName lastName isActive } }\"}"
```

**Expected**: User data returned

### Test 3: Get User with Nested Preferences ✅

```bash
curl -s -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'loyal-birds:c00l-c@ts' | base64)" \
  -d "{\"query\": \"{ user(id: \\\"$USER_ID\\\") { email preferences { key data } } }\"}"
```

**This tests the key feature**: Nested field resolution (User → Preferences)

### Test 4: Create Preference via GraphQL ✅

```bash
curl -s -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'loyal-birds:c00l-c@ts' | base64)" \
  -d "{\"query\": \"mutation { createPreference(userId: \\\"$USER_ID\\\", key: \\\"theme\\\", data: {color: \\\"dark\\\"}) { id key data } }\"}"
```

**Expected**: Preference created and returned

### Test 5: Query User + Preferences + Locations (Complex Query) ✅

```bash
curl -s -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'loyal-birds:c00l-c@ts' | base64)" \
  -d "{\"query\": \"{ user(id: \\\"$USER_ID\\\") { email firstName preferences { key data category } locations { key nickname address } } }\"}"
```

**This is the money shot**: Complex nested query across multiple services in one call!

### Test 6: Create and Query Location ✅

```bash
# Create a system location (home)
curl -s -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'loyal-birds:c00l-c@ts' | base64)" \
  -d "{\"query\": \"mutation { createSystemLocation(userId: \\\"$USER_ID\\\", locationType: \\\"home\\\", address: \\\"123 Main St\\\", coordinates: {lat: 40.7128, lng: -74.0060}, nickname: \\\"My Home\\\") { key nickname address } }\"}"

# Query it back
curl -s -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'loyal-birds:c00l-c@ts' | base64)" \
  -d "{\"query\": \"{ location(userId: \\\"$USER_ID\\\", key: \\\"home\\\") { key nickname address coordinates { lat lng } } }\"}"
```

### Test 7: Food Preferences ✅

```bash
# Set default food preferences
curl -s -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'loyal-birds:c00l-c@ts' | base64)" \
  -d "{\"query\": \"mutation { setDefaultFoodPreferences(userId: \\\"$USER_ID\\\", preferences: [{category: \\\"italian\\\", level: love}, {category: \\\"chinese\\\", level: like}]) { category level } }\"}"

# Query them back
curl -s -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'loyal-birds:c00l-c@ts' | base64)" \
  -d "{\"query\": \"{ defaultFoodPreferences(userId: \\\"$USER_ID\\\") { category level } }\"}"
```

## Interactive Testing with Apollo Sandbox

1. Open `http://localhost:4000/` in your browser
2. You'll see Apollo Sandbox
3. Click "Documentation" to explore the schema
4. Try queries interactively

### Example Interactive Query

```graphql
query GetUserContext($userId: ID!) {
  user(id: $userId) {
    id
    email
    firstName
    lastName
    isActive
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

**Variables**:
```json
{
  "userId": "your-user-id-here"
}
```

**Headers**:
```
Authorization: Basic bG95YWwtYmlyZHM6YzAwbC1jQHRz
```

## Performance Testing

### Measure Query Time

```bash
time curl -s -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'loyal-birds:c00l-c@ts' | base64)" \
  -d "{\"query\": \"{ user(id: \\\"$USER_ID\\\") { email preferences { key } locations { nickname } } }\"}" > /dev/null
```

**Expected**: < 500ms for typical queries

### N+1 Query Problem Test

```bash
# This will demonstrate the N+1 problem in Phase 0
# (will be solved in Phase 3 with federation + DataLoader)

curl -s -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'loyal-birds:c00l-c@ts' | base64)" \
  -d '{"query": "{ users { email preferences { key } } }"}'
```

Watch the GraphQL Gateway logs - you'll see separate REST calls for each user's preferences.

## Success Criteria for Phase 0

- ✅ GraphQL Gateway starts without errors
- ✅ Schema introspection works
- ✅ User queries work
- ✅ Preference queries work
- ✅ Location queries work
- ✅ Nested queries work (user → preferences/locations)
- ✅ Mutations work (create/update/delete)
- ✅ Authentication pass-through works
- ✅ Error handling works (try invalid user ID)
- ✅ Food preference queries/mutations work

## Troubleshooting

### Error: "Connection refused"

**Cause**: REST Gateway not running

**Fix**:
```bash
cd src/packages/gateway && npm run dev
```

### Error: "Unauthorized"

**Cause**: Missing or invalid auth header

**Fix**: Include Basic auth header:
```bash
-H "Authorization: Basic $(echo -n 'loyal-birds:c00l-c@ts' | base64)"
```

### Error: "User not found"

**Cause**: Invalid user ID

**Fix**: Create a test user first (see Prerequisites)

### GraphQL Errors

Use Apollo Sandbox for better error messages:
1. Open `http://localhost:4000/`
2. Paste query
3. See formatted errors

## Next Steps

Once Phase 0 tests pass:

1. ✅ **Phase 0 Complete**: GraphQL Gateway validated
2. → **Phase 1**: Update MCP Service to use GraphQL Gateway
3. → **Phase 2**: Validate MCP tool reduction (31 → 3)
4. → **Phase 3**: Migrate to federation

## Quick Test Script

Save this as `test-graphql-gateway.sh`:

```bash
#!/bin/bash

echo "🧪 Testing GraphQL Gateway"
echo "=========================="

# Test 1: Introspection
echo ""
echo "Test 1: Schema Introspection"
curl -s -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { queryType { name } } }"}' | jq .

# Test 2: User query (replace with your user ID)
echo ""
echo "Test 2: User Query"
echo "Replace USER_ID in script with actual ID"

echo ""
echo "✅ Phase 0 basic tests complete!"
echo "Open http://localhost:4000/ for interactive testing"
```

Make it executable:
```bash
chmod +x test-graphql-gateway.sh
./test-graphql-gateway.sh
```
