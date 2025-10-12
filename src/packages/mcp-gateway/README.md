# MCP Gateway

Enterprise-grade gateway for Model Context Protocol (MCP) traffic with authentication, rate limiting, and comprehensive logging.

## Architecture Overview

The MCP Gateway sits between Claude Desktop and the MCP Service, providing:
- **Authentication & Authorization** - Validates credentials before forwarding
- **Rate Limiting** - Per-IP request limits to prevent abuse
- **Enhanced Logging** - Detailed request/response tracking with metrics
- **Request Validation** - JSON-RPC structure validation
- **Error Handling** - Proper error responses and upstream error handling

```
Claude Desktop → mcp-gateway → mcp-service → other services
```

## Key Features

### 🔐 Authentication
- Basic HTTP authentication with configurable credentials
- Automatic credential validation before request forwarding
- Proper JSON-RPC error responses for auth failures

### 🚦 Rate Limiting
- **Limit**: 100 requests per minute per IP address
- **Cleanup**: Automatic cleanup of rate limit data every 5 minutes
- **Response**: HTTP 429 with JSON-RPC error for violations

### 📊 Enhanced Logging
- **Request Details**: Client IP, User Agent, timestamp, method
- **Response Metrics**: Response time tracking and success/failure rates
- **Authentication Status**: Clear indication of auth success/failure
- **Error Tracking**: Detailed error logging with categorization

### 🛡️ Request Validation
- JSON-RPC structure validation (jsonrpc, method fields)
- Request timeout protection (30 second timeout)
- Proper error codes following JSON-RPC 2.0 specification

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3005` | Port for the gateway to listen on |
| `MCP_SERVICE_URL` | `http://mcp-service:3003` | URL of the upstream MCP service |
| `AUTH_USERNAME` | `loyal-birds` | Username for Basic authentication |
| `AUTH_PASSWORD` | `c00l-c@ts` | Password for Basic authentication |

## API Endpoints

### `POST /mcp`
Main MCP endpoint that forwards JSON-RPC requests to the upstream service.

**Headers:**
- `Content-Type: application/json` (required)
- `Authorization: Basic <base64-credentials>` (required)

**Request Body:** Valid JSON-RPC 2.0 request

**Response:** JSON-RPC 2.0 response or error

### `GET /health`
Health check endpoint with basic statistics.

**Response:**
```json
{
  "status": "healthy",
  "service": "mcp-gateway",
  "timestamp": "2025-10-12T05:59:43.590Z",
  "upstreamService": "http://mcp-service:3003",
  "stats": {
    "totalRequests": 42,
    "recentRequests": 10,
    "avgResponseTime": 15,
    "activeIPs": 3
  }
}
```

### `GET /stats`
Detailed statistics endpoint for monitoring and debugging.

**Response:**
```json
{
  "recentRequests": [...],
  "activeSessions": 3,
  "rateLimits": [
    {"ip": "172.18.0.4", "requestCount": 15}
  ]
}
```

## Error Codes

The gateway returns standard JSON-RPC 2.0 error codes:

| Code | Message | Description |
|------|---------|-------------|
| `-32600` | Invalid Request | Missing jsonrpc or method fields |
| `-32001` | Authentication required | Invalid or missing credentials |
| `-32000` | Rate limit exceeded | Too many requests (>100/min) |
| `-32603` | Internal error | Gateway or upstream service error |

## Local vs Cloud Architecture

### Local Development (Simplified)
```
Claude Desktop → http://localhost:3003/mcp → mcp-gateway → mcp-service
```

**Local Configuration:**
- **URL**: `http://localhost:3003/mcp`
- **Protocol**: HTTP (bypasses SSL certificate issues)
- **Access**: Direct port access to mcp-gateway
- **Purpose**: Zero-setup development experience

### Cloud Production (Full Routing)
```
Claude Desktop → https://mcp.hcp.loyalagents.org/mcp → Traefik → mcp-gateway → mcp-service
```

**Cloud Configuration:**
- **URL**: `https://mcp.hcp.loyalagents.org/mcp`
- **Protocol**: HTTPS with Let's Encrypt certificates
- **Access**: Through Traefik reverse proxy
- **Purpose**: Production-grade routing with proper SSL

## Why This Split?

### Local Development Benefits
- ✅ **Zero Setup**: Works immediately after `docker compose up`
- ✅ **No SSL Issues**: Avoids self-signed certificate problems
- ✅ **Easy Debugging**: Direct connection simplifies troubleshooting
- ✅ **Platform Agnostic**: Same setup on macOS/Linux/Windows

### Cloud Production Benefits
- ✅ **Proper SSL**: Let's Encrypt certificates with automatic renewal
- ✅ **Subdomain Separation**: Clean `mcp.` vs `api.` domain separation
- ✅ **Centralized Routing**: All traffic through Traefik for monitoring
- ✅ **Load Balancing**: Can distribute across multiple gateway instances

## Development

### Building
```bash
npm run build --workspace=@personal-context-router/mcp-gateway
```

### Running Locally
```bash
npm run start:dev --workspace=@personal-context-router/mcp-gateway
```

### Docker
```bash
docker compose build mcp-gateway
docker compose up mcp-gateway
```

## Monitoring

### Log Patterns
```bash
# Successful request
📥 [2025-10-12T05:59:16.589Z] POST /mcp
🌐 Client: 172.18.0.4 | Agent: curl/8.7.1
🔑 Auth: Present
🚀 Forwarding MCP request: tools/list from 172.18.0.4
✅ tools/list | 12ms | Auth: true

# Authentication failure
📥 [2025-10-12T05:59:32.856Z] POST /mcp
🌐 Client: 172.18.0.4 | Agent: curl/8.7.1
🔑 Auth: Missing
❌ tools/list | 0ms | Auth: false
💥 Error: Authentication failed
🔒 Authentication failed for 172.18.0.4
```

### Health Monitoring
- Monitor `/health` endpoint for uptime and basic stats
- Monitor `/stats` endpoint for detailed request patterns
- Watch logs for authentication failures and rate limit violations
- Track response times and error rates

## Security Considerations

- **Authentication**: Always use strong passwords in production
- **Rate Limiting**: Adjust limits based on expected usage patterns
- **Logging**: Be mindful of logging sensitive information
- **Network**: In production, ensure mcp-service is not directly accessible
- **SSL**: Always use HTTPS in production environments

## Future Enhancements

- User-specific rate limiting
- Request/response caching
- Metrics export (Prometheus)
- Request filtering and validation
- Circuit breaker pattern for upstream failures
- WebSocket support for streaming MCP protocols