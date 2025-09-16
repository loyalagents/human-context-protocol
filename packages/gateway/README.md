# Gateway Service

NestJS API Gateway providing centralized routing, rate limiting, and microservice orchestration.

## Purpose

- **Request Router**: Proxies HTTP requests to internal microservices
- **Rate Limiting**: Built-in throttling via @nestjs/throttler
- **API Documentation**: Auto-generated Swagger docs at `/api/docs`
- **Validation**: Global request/response validation pipeline

## Transport Architecture

- **HTTP API**: Port 3000 (external client access)
- **TCP Client**: Communicates with preference service on port 3002
- **HTTP Proxy**: Routes GitHub requests to internal service on port 3004

## Key Routes

- `/api/preferences/*` → Preference Service (TCP)
- `/api/github/*` → GitHub Import Service (HTTP)
- `/health` → Service health check