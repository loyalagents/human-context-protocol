# Gateway Service

NestJS API Gateway providing centralized routing, authentication, rate limiting, and microservice orchestration.

## Purpose

- **Authentication**: Basic Auth protection for all endpoints (except health/docs)
- **Request Router**: Proxies HTTP requests to internal microservices
- **Rate Limiting**: Built-in throttling via @nestjs/throttler
- **API Documentation**: Auto-generated Swagger docs at `/api/docs`
- **Validation**: Global request/response validation pipeline

## Transport Architecture

- **HTTP API**: Port 3000 (external client access)
- **TCP Client**: Communicates with preference service on port 3002
- **HTTP Proxy**: Routes GitHub requests to internal service on port 3004

## Key Routes

- `/api/preferences/*` → Preference Service (TCP) **[Auth Required]**
- `/api/locations/*` → Location Management via Preference Service (TCP) **[Auth Required]**
- `/api/users/*` → User Service (HTTP) **[Auth Required]**
- `/api/github/*` → GitHub Import Service (HTTP) **[Auth Required]**
- `/health` → Service health check **[Public]**
- `/api/docs` → Swagger API documentation **[Public]**

## Authentication

The Gateway enforces **Basic Authentication** on all API endpoints for cloud deployment protection.

### Public Routes (No Auth Required)
- `/health` - Service health check
- `/api/docs` - Swagger API documentation
- `/api/status` - Service status endpoints

### Protected Routes (Auth Required)
- All `/api/*` routes except those listed above
- Requires HTTP Basic Auth header: `Authorization: Basic <base64(username:password)>`

### Default Credentials
- **Username**: `admin`
- **Password**: `password123`
- **Environment Variables**: `AUTH_USERNAME`, `AUTH_PASSWORD`

### Usage Examples

**With authentication:**
```bash
curl -u admin:password123 http://localhost:3000/api/users
```

**Without authentication (fails):**
```bash
curl http://localhost:3000/api/users
# Returns: {"error":"Authentication required","message":"Please provide Basic Auth credentials (username:password)"}
```

### Architecture Integration
- **Auth Service**: Validates credentials via `http://auth-service:3004/validate`
- **User Context**: Successful auth adds `x-user-id` header for downstream services
- **Error Handling**: Returns proper HTTP status codes (401, 500) with error details