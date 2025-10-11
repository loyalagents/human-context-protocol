# MCP Service

Model Context Protocol server exposing comprehensive user context tools to Claude via HTTP bridge.

## Purpose

- **Claude Integration**: MCP-compliant tool server for Claude Desktop
- **HTTP Bridge**: JSON-RPC over HTTP for remote tool execution
- **Gateway Proxy**: Routes all operations through Gateway service
- **Context Management**: User preferences, locations, food preferences, and GitHub data
- **Tool Orchestration**: 25+ tools for comprehensive user context management

## MCP Tools Exposed

### Preference Tools
- `get_user_preferences`, `get_preference`, `set_preference`
- `update_preference`, `delete_preference`, `list_preference_keys`

### Location Tools (8 tools)
- `get_user_locations`, `get_location`, `get_available_system_locations`
- `create_system_location`, `create_custom_location`, `update_location`
- `delete_location`, `mark_location_as_used`

### Food Preference Tools (7 tools)
- `get_default_food_preferences`, `set_default_food_preferences`
- `update_default_food_preference`, `get_location_food_preferences`
- `set_location_food_preferences`, `update_location_food_preference`
- `get_effective_food_preferences`

### User Tools
- `create_user`, `get_user`, `get_user_by_email`, `update_user`
- `deactivate_user`, `list_users`, `record_user_login`

### GitHub Tools
- `get_github_repo`, `get_user_repos`

## Architecture

- **HTTP Server**: Port 3003 (`/mcp` endpoint)
- **JSON-RPC**: MCP protocol compliance for Claude
- **Gateway Client**: Proxies requests to Gateway service with authentication
- **Tool Router**: Dispatches calls to appropriate tool handlers

## Authentication

Authentication is handled at the **HTTP client level** using `mcp-remote`:
- **HTTP Remote**: Uses `mcp-remote` package to connect to MCP service over HTTP
- **Client Authentication**: Claude Desktop passes Basic Auth header to MCP service
- **Header Forwarding**: MCP service extracts and forwards auth header to Gateway API calls
- **Gateway Integration**: Gateway validates credentials and authorizes all API operations
- **Transparent**: All tool operations work seamlessly with authentication

**Technical Flow**:
1. Claude Desktop sends `Authorization: Basic <token>` header with each MCP request
2. MCP service extracts the header from `req.headers.authorization`
3. Creates authenticated `GatewayClientService` instance with the header
4. All API calls to Gateway include the forwarded authentication
5. Gateway validates credentials and processes the request

**Note**: Authentication is configured in Claude Desktop, not in the MCP service code.

## Known Limitations

⚠️ **Health Endpoint**: The `/health` endpoint is temporarily disabled to simplify Traefik routing for demo purposes. This doesn't affect Claude Desktop functionality, which only uses the JSON-RPC endpoint.

## Claude Desktop Setup

### 1. Update Claude Desktop Configuration
Copy `claude-desktop-config.json` to your Claude Desktop settings:

```json
{
  "mcpServers": {
    "personal-context-router": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@0.1.18",
        "http://localhost:3003/mcp",
        "--mode", "duplex",
        "--allow-http",
        "--header", "Authorization:Basic YWRtaW46eW91ci1wYXNzd29yZC1oZXJl"
      ]
    }
  }
}
```

### 2. Generate Your Auth Header
Create your Base64 encoded credentials:
```bash
# Replace with your actual password from .env
echo -n "admin:your-actual-password" | base64
```

Then replace `YWRtaW46eW91ci1wYXNzd29yZC1oZXJl` with your generated value.

### 3. Restart Claude Desktop
After updating the configuration, restart Claude Desktop to pick up the new settings.

### 4. Test MCP Tools
In Claude, try commands like:
- "Show me my user preferences"
- "Get my locations"
- "Create a new user with email test@example.com"

**Important**: The MCP service must be running (`docker compose up`) for Claude to access your tools.