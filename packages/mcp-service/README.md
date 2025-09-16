# MCP Service

Model Context Protocol server exposing preference and GitHub tools to Claude via HTTP bridge.

## Purpose

- **Claude Integration**: MCP-compliant tool server for Claude Desktop
- **HTTP Bridge**: JSON-RPC over HTTP for remote tool execution
- **Gateway Proxy**: Routes all operations through Gateway service
- **Tool Orchestration**: Combines preference and GitHub functionality

## MCP Tools Exposed

### Preference Tools
- `get_user_preferences`, `get_preference`, `set_preference`
- `update_preference`, `delete_preference`, `list_preference_keys`

### GitHub Tools
- `get_github_repo`, `get_user_repos`

## Architecture

- **HTTP Server**: Port 3003 (`/mcp` endpoint)
- **JSON-RPC**: MCP protocol compliance for Claude
- **Gateway Client**: Proxies requests to Gateway service
- **Tool Router**: Dispatches calls to appropriate tool handlers