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
- **Gateway Client**: Proxies requests to Gateway service
- **Tool Router**: Dispatches calls to appropriate tool handlers