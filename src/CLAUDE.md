# Conventions
Make sure to always update:
- README.md
- architecture.md (if exists)
- any tsconfig.json
- any appropriate swagger documentation. this includes calls and schemas. Each non mcp-service should only be accessible via the gateway
- Auth service documentation when adding new services or routes

## Architecture Notes
- All API endpoints are protected by Basic Authentication (except health/docs)
- Auth service validates credentials for gateway access
- Use `admin:password123` for development (customizable via environment variables)
- All curl examples must include `-u admin:password123` for protected routes

In addition the README.md contains information about making new services and updating files. Please make sure that information is correct and update it if that information is incorrect.