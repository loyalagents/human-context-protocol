# GraphQL Migration Plan

## Executive Summary

**Goal**: Reduce MCP tools from 31 to 3-5 by introducing GraphQL, enabling flexible querying for AI agents.

**Approach**: Validate GraphQL for MCP first (2 weeks), then migrate to proper federation architecture (4-6 weeks).

**Primary Driver**: MCP tool explosion - 31 individual REST-based tools is too many. GraphQL allows AI agents to compose flexible queries instead of needing separate tools for every operation.

---

## Current Architecture

```
┌─────────────────────┐
│   MCP Client        │  (Claude Desktop, AI agents)
└─────────────────────┘
          ↓
   (HTTP/JSON-RPC)
          ↓
┌─────────────────────┐
│   MCP Gateway       │  (Port 3005) - Auth/Rate limiting
└─────────────────────┘
          ↓
┌─────────────────────┐
│   MCP Service       │  (Port 3003) - 31 tools ❌
│   - PreferenceTools │  (6 tools)
│   - UserTools       │  (7 tools)
│   - LocationTools   │  (16 tools)
│   - GitHubTools     │  (2 tools)
└─────────────────────┘
          ↓
     (HTTP/REST)
          ↓
┌─────────────────────┐
│   REST Gateway      │  (Port 3000)
│   - NestJS          │
│   - ClientProxy     │
└─────────────────────┘
          ↓
   (Microservices)
          ↓
┌─────────────────────┐
│   Backend Services  │
│   - User Service    │
│   - Preference Svc  │
│   - GitHub Svc      │
└─────────────────────┘
```

---

## Target Architecture (End State)

```
┌─────────────────────┐
│   MCP Client        │
└─────────────────────┘
          ↓
┌─────────────────────┐
│   MCP Gateway       │  (Port 3005) - Auth/Rate limiting (unchanged)
└─────────────────────┘
          ↓
┌─────────────────────┐
│   MCP Service       │  (Port 3003) - 3 tools ✅
│   - query_user_context
│   - mutate_user_context
│   - get_schema
└─────────────────────┘
          ↓
     (GraphQL)
          ↓
┌─────────────────────┐
│ GraphQL Gateway     │  (Port 4000) - NEW!
│ - Apollo Federation │
└─────────────────────┘
          ↓
   (Federation)
          ↓
┌─────────────────────┐
│ Backend Services    │
│ - User Service      │  (GraphQL subgraph)
│ - Preference Svc    │  (GraphQL subgraph)
│ - GitHub Svc        │  (GraphQL subgraph)
└─────────────────────┘
```

**Note**: REST Gateway (Port 3000) can optionally be updated to call GraphQL Gateway too, creating a single data layer.

---

## Migration Strategy: Validate First, Then Perfect

### Why This Approach?

**Problem**: Federation is a 5+ week investment. What if GraphQL doesn't solve the MCP problem?

**Solution**:
1. **Weeks 1-2**: Quick validation - GraphQL Gateway wrapping REST
2. **Week 3**: Test and validate with real AI agents
3. **Weeks 4-8**: If successful, migrate to proper federation

**Key Insight**: The main goal is MCP simplification. Validate this works before investing in full federation.

---

## Detailed Migration Plan

### **Phase 0: GraphQL Gateway Setup (Week 1)**

**Goal**: Create GraphQL Gateway that wraps existing REST Gateway (temporary architecture)

**Why temporary?**: Allows MCP to use GraphQL immediately while backend services are still REST-only.

**Architecture**:
```
MCP Service → GraphQL Gateway → REST Gateway → Services
                  (NEW)           (Existing)    (Unchanged)
```

**Work Items**:
1. Create new package: `graphql-gateway`
2. Setup Apollo Server (not federation yet)
3. Define GraphQL schema manually
4. Write resolvers that call REST Gateway endpoints
5. Handle authentication pass-through
6. Test with basic queries

**Deliverable**: GraphQL API at `http://localhost:4000` that works

**Files to Create**:
- `src/packages/graphql-gateway/package.json`
- `src/packages/graphql-gateway/src/main.ts`
- `src/packages/graphql-gateway/src/schema/types.graphql` (or code-first)
- `src/packages/graphql-gateway/src/resolvers/*`
- `src/packages/graphql-gateway/.env`
- `src/packages/graphql-gateway/tsconfig.json`

**Success Criteria**:
- ✅ GraphQL Gateway starts successfully
- ✅ Can query user data: `{ user(id: "123") { email } }`
- ✅ Can query preferences: `{ user(id: "123") { preferences { key } } }`
- ✅ Mutations work: `createPreference(...)`

---

### **Phase 1: MCP Service Simplification (Week 2)**

**Goal**: Update MCP Service to use GraphQL Gateway, reducing 31 tools to 3

**Work Items**:
1. Install `graphql-request` in MCP Service
2. Create new `QueryTools` class with 3 tools:
   - `query_user_context` - Execute GraphQL queries
   - `mutate_user_context` - Execute GraphQL mutations
   - `get_schema` - Introspect schema for AI agent discovery
3. Update `main.ts` to use QueryTools
4. Remove old tool files:
   - `tools/preference.tools.ts` (6 tools)
   - `tools/user.tools.ts` (7 tools)
   - `tools/location.tools.ts` (16 tools)
   - `tools/github.tools.ts` (2 tools)
5. Remove `services/gateway-client.service.ts`
6. Test MCP calls through gateway

**Tool Examples**:

**Before** (31 tools):
```json
{
  "tools": [
    "get_user_preferences",
    "get_preference",
    "set_preference",
    "update_preference",
    "delete_preference",
    "list_preference_keys",
    "create_user",
    "get_user",
    // ... 23 more tools
  ]
}
```

**After** (3 tools):
```json
{
  "tools": [
    {
      "name": "query_user_context",
      "description": "Query user data with GraphQL",
      "inputSchema": {
        "properties": {
          "query": { "type": "string" },
          "variables": { "type": "object" }
        }
      }
    },
    {
      "name": "mutate_user_context",
      "description": "Modify user data with GraphQL mutations"
    },
    {
      "name": "get_schema",
      "description": "Get GraphQL schema for discovery"
    }
  ]
}
```

**Example Usage**:
```json
// Instead of calling get_user + get_user_preferences + get_user_locations (3 tools)
{
  "tool": "query_user_context",
  "query": "{ user(id: \"123\") { email preferences { key } locations { nickname } } }"
}
```

**Deliverable**: MCP Service with 3 tools that work

**Success Criteria**:
- ✅ `tools/list` returns 3 tools
- ✅ AI agents can execute complex queries
- ✅ Can get user + preferences + locations in one call
- ✅ Mutations work through `mutate_user_context`

---

### **Phase 2: Validation & Decision (Week 3)**

**Goal**: Test with real AI agents and decide if GraphQL solves the problem

**Work Items**:
1. Test MCP with Claude Desktop or other MCP clients
2. Measure AI agent success rate
3. Compare: 3 flexible tools vs 31 specific tools
4. Collect team feedback
5. Performance testing
6. Document learnings

**Questions to Answer**:
- ❓ Do AI agents handle GraphQL query syntax well?
- ❓ Is schema introspection useful for discovery?
- ❓ Are 3 tools actually easier than 31?
- ❓ Performance acceptable? (temporary extra hop is okay)
- ❓ Team comfortable with GraphQL?

**Decision Point**:

✅ **If YES** - GraphQL improves MCP:
   - Proceed to Phase 3 (Federation)
   - Commit to full migration

❌ **If NO** - GraphQL doesn't help:
   - Try alternative schema designs
   - Consider hybrid approach (some GraphQL, some specific tools)
   - OR rollback (only 2 weeks wasted)

---

### **Phase 3: User Service GraphQL Migration (Weeks 4-5)**

**Goal**: Migrate User Service to expose GraphQL subgraph (federation-ready)

**Work Items**:
1. Install NestJS GraphQL dependencies
2. Create GraphQL module with federation support
3. Define `UserType` with `@key` directive
4. Create `UserResolver`
5. Keep REST endpoints (dual mode during migration)
6. Update GraphQL Gateway to use federation
7. Test federated queries

**Key Concepts**:
- **Federation**: User Service becomes a "subgraph"
- **@key directive**: Marks User as federatable entity
- **Dual mode**: Both REST and GraphQL work during transition

**Success Criteria**:
- ✅ User Service exposes GraphQL at `/graphql`
- ✅ GraphQL Gateway federates User Service
- ✅ Queries work through federation
- ✅ REST endpoints still work (unchanged)

---

### **Phase 4: Preference Service GraphQL Migration (Weeks 6-7)**

**Goal**: Migrate Preference Service + enable cross-service queries

**Work Items**:
1. Install GraphQL dependencies
2. Create `PreferenceType` and `LocationType`
3. Create resolvers
4. **Extend User type** with preferences and locations fields
5. Update GraphQL Gateway federation config
6. Test cross-service queries

**Federation Magic**:
```graphql
# User Service defines:
type User @key(fields: "id") {
  id: ID!
  email: String!
}

# Preference Service extends:
type User @key(fields: "id") @extends {
  id: ID! @external
  preferences: [Preference!]!  # NEW - automatically resolved
  locations: [Location!]!       # NEW - automatically resolved
}
```

**Success Criteria**:
- ✅ Preference Service federated
- ✅ Cross-service query works: `{ user(id: "123") { email preferences { key } } }`
- ✅ MCP Service still works (no changes needed!)

---

### **Phase 5: REST Gateway Update (Week 8)**

**Goal**: Make REST Gateway call GraphQL Gateway (single data layer)

**Work Items**:
1. Install `graphql-request` in REST Gateway
2. Create `GraphQLClientService`
3. Update service classes to call GraphQL instead of ClientProxy
4. Controllers unchanged (same interface)
5. Remove NestJS microservices dependencies
6. Test all REST endpoints still work

**Before**:
```typescript
// REST Gateway calls services via NestJS microservices
@Inject('USER_SERVICE') private userClient: ClientProxy
return this.userClient.send('getUserById', { id });
```

**After**:
```typescript
// REST Gateway calls GraphQL Gateway
constructor(private graphqlClient: GraphQLClient) {}
return this.graphqlClient.request(GET_USER_QUERY, { id });
```

**Success Criteria**:
- ✅ All REST endpoints work (external clients unaffected)
- ✅ REST and MCP use same data layer
- ✅ No microservices code left in Gateway

---

### **Phase 6: Cleanup & Optimization (Week 9)**

**Goal**: Remove temporary code, optimize, add monitoring

**Work Items**:
1. Remove old microservices controllers from services
2. Add caching to GraphQL Gateway
3. Add monitoring/logging
4. Performance optimization (DataLoader if needed)
5. Update documentation
6. Remove temporary wrapper code

**Deliverable**: Clean, production-ready federated GraphQL architecture

---

## Key Technical Decisions

### 1. **Schema-First vs Code-First?**

**Recommendation**: Code-First (NestJS decorators)

**Why**:
- Tight TypeScript integration
- Easier to maintain with existing NestJS services
- Type safety across the board

**Example**:
```typescript
@ObjectType()
@Directive('@key(fields: "id")')
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;
}
```

### 2. **Apollo Federation vs GraphQL Mesh?**

**Recommendation**: Apollo Federation

**Why**:
- Industry standard
- Better documentation
- More mature ecosystem
- Easier to find examples

### 3. **Keep MCP Gateway Separate?**

**Recommendation**: YES

**Why**:
- Security layer (auth, rate limiting)
- Logging and monitoring
- Clear separation: MCP Gateway = security, MCP Service = protocol translation

### 4. **Authentication Strategy?**

**Current**: Basic auth at MCP Gateway
**New**: Service-to-service tokens for internal GraphQL calls

```
MCP Client → [Basic Auth] → MCP Gateway → MCP Service
                                            ↓
                                    [Service Token]
                                            ↓
                                      GraphQL Gateway
```

---

## Risk Mitigation

### Risk 1: GraphQL Doesn't Help MCP

**Likelihood**: Low-Medium
**Impact**: High
**Mitigation**: Phase 0-1 validation (2 weeks) before major investment

### Risk 2: AI Agents Struggle with GraphQL Syntax

**Likelihood**: Medium
**Impact**: Medium
**Mitigation**:
- Provide clear schema documentation
- Include query examples in tool descriptions
- Schema introspection helps agents discover capabilities

### Risk 3: Performance Degradation

**Likelihood**: Low
**Impact**: Medium
**Mitigation**:
- Phase 0-1: Acceptable extra hop (temporary)
- Phase 3+: Federation removes hop
- Add caching in Phase 6

### Risk 4: Team Learning Curve

**Likelihood**: Medium
**Impact**: Low
**Mitigation**:
- Gradual introduction
- Code-first approach (familiar TypeScript)
- Good documentation
- Pair programming during migration

---

## Rollback Plan

### Phase 0-1 Rollback (Weeks 1-2)
- **Time**: 30 minutes
- **Process**: Remove GraphQL Gateway, revert MCP Service
- **Data Loss**: None
- **Impact**: Low (MCP Gateway and services unchanged)

### Phase 3+ Rollback (After Week 4)
- **Time**: 2-4 hours
- **Process**: Services keep REST endpoints during migration (dual mode)
- **Data Loss**: None
- **Impact**: Medium (some code to revert)

---

## Success Metrics

### Phase 0-1 Success (Weeks 1-2)
- ✅ MCP tools reduced: 31 → 3
- ✅ Complex queries work in single call
- ✅ AI agents can compose queries
- ✅ Performance acceptable (<500ms for typical queries)

### Phase 3+ Success (Weeks 4+)
- ✅ All services federated
- ✅ Cross-service queries automatic
- ✅ No microservices code remaining
- ✅ Performance improved (direct federation)
- ✅ REST Gateway also uses GraphQL (single data layer)

---

## Timeline Summary

| Phase | Duration | Key Deliverable | Rollback Risk |
|-------|----------|----------------|---------------|
| Phase 0 | Week 1 | GraphQL Gateway (wrapping REST) | Low |
| Phase 1 | Week 2 | MCP with 3 tools | Low |
| Phase 2 | Week 3 | Validation & decision | N/A |
| Phase 3 | Weeks 4-5 | User Service federated | Medium |
| Phase 4 | Weeks 6-7 | Preference Service federated | Medium |
| Phase 5 | Week 8 | REST Gateway uses GraphQL | Medium |
| Phase 6 | Week 9 | Cleanup & optimization | Low |
| **Total** | **9 weeks** | **Full GraphQL architecture** | |

**Critical Path**: Phases 0-2 (3 weeks) validate the approach before major investment.

---

## Environment Variables

### GraphQL Gateway
```bash
PORT=4000
SERVICE_TOKEN=your-secure-service-token
REST_GATEWAY_URL=http://localhost:3000
NODE_ENV=development
```

### MCP Service
```bash
PORT=3003
GRAPHQL_GATEWAY_URL=http://localhost:4000
SERVICE_TOKEN=your-secure-service-token
```

### REST Gateway
```bash
PORT=3000
GRAPHQL_GATEWAY_URL=http://localhost:4000  # Added in Phase 5
SERVICE_TOKEN=your-secure-service-token    # Added in Phase 5
```

---

## Testing Strategy

### Unit Tests
- GraphQL resolvers
- Service methods
- Tool handlers

### Integration Tests
- MCP tool calls end-to-end
- Cross-service GraphQL queries
- REST endpoints (ensure backwards compatibility)

### E2E Tests
```bash
# Test MCP flow
curl -X POST http://localhost:3005/mcp \
  -H "Authorization: Basic $(echo -n 'user:pass' | base64)" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Should return 3 tools

# Test query execution
curl -X POST http://localhost:3005/mcp \
  -H "Authorization: Basic $(echo -n 'user:pass' | base64)" \
  -d '{
    "jsonrpc":"2.0",
    "id":2,
    "method":"tools/call",
    "params":{
      "name":"query_user_context",
      "arguments":{
        "query":"{ user(id: \"123\") { email preferences { key } } }"
      }
    }
  }'
```

---

## Common Pitfalls & Solutions

### Pitfall 1: N+1 Query Problem

**Problem**: Each nested field triggers separate REST call
```graphql
{
  users {        # 1 call
    preferences  # N calls (one per user)
  }
}
```

**Solution**:
- Phase 0-2: Acceptable (temporary)
- Phase 3+: Federation + DataLoader solves this

### Pitfall 2: Schema Type Mismatches

**Problem**: REST returns `data.user.id` as string, GraphQL expects ID

**Solution**: Type coercion in resolvers
```typescript
User: {
  id: (user) => String(user.id),  // Ensure string
}
```

### Pitfall 3: Auth Header Pass-through

**Problem**: GraphQL Gateway needs to pass auth to REST Gateway

**Solution**: Context propagation
```typescript
context: async ({ req }) => ({
  authHeader: req.headers.authorization,
})

// In resolver:
axios.get(url, {
  headers: { Authorization: context.authHeader }
})
```

### Pitfall 4: Error Handling

**Problem**: REST errors don't map well to GraphQL errors

**Solution**: Consistent error format
```typescript
try {
  const response = await axios.get(...);
  return response.data;
} catch (error) {
  throw new GraphQLError('Failed to fetch user', {
    extensions: {
      code: 'USER_NOT_FOUND',
      originalError: error.message,
    }
  });
}
```

---

## Documentation Links

- [Apollo Federation](https://www.apollographql.com/docs/federation/)
- [NestJS GraphQL](https://docs.nestjs.com/graphql/quick-start)
- [MCP Specification](https://modelcontextprotocol.io/)
- [graphql-request](https://github.com/jasonkuhrt/graphql-request)

---

## Questions & Decisions Log

### Q1: Should we migrate GitHub Service?
**Decision**: Not in initial scope. Focus on User + Preference first. GitHub can come later.

### Q2: What about real-time updates (subscriptions)?
**Decision**: Out of scope for initial migration. Add in future if needed.

### Q3: Should we remove REST endpoints entirely?
**Decision**: No. Keep REST for backwards compatibility. Some clients may prefer REST.

### Q4: Use Apollo Studio?
**Decision**: Start without it (self-hosted). Can add later for production monitoring.

---

## Next Steps

1. **Review this plan** with team
2. **Get stakeholder buy-in** for 9-week timeline
3. **Set up development environment**
4. **Begin Phase 0** (Week 1) - GraphQL Gateway setup

---

## Contact & Questions

For questions about this migration plan, contact the development team.

**Last Updated**: 2025-10-28
**Version**: 1.0
**Status**: Ready to Begin Phase 0
