# Auth Service

Simple authentication service providing username/password validation for cloud deployment protection.

## Purpose

- **Cloud Protection**: Prevent unauthorized access to deployed APIs
- **Simple Auth**: Username/password validation via environment variables
- **Future Ready**: Extensible architecture for JWT, OAuth, and user management
- **Microservice Pattern**: Follows existing service architecture

## Current Features

- **Username/Password Validation**: Single admin user via environment variables
- **Secure Storage**: Passwords hashed with bcrypt
- **Health Check**: Service monitoring endpoint
- **Simple Token**: Basic token validation for API access

## API Endpoints

### Authentication
- `POST /validate` - Validate username/password credentials
- `POST /validate-token` - Validate simple token (base64 encoded credentials)

### Monitoring
- `GET /health` - Service health check

## Environment Variables

```bash
PORT=3004                           # Service port (default: 3004)
AUTH_USERNAME=your-secure-username  # Admin username
AUTH_PASSWORD=your-secure-password  # Admin password (will be hashed)
```

## Usage Examples

### Validate Credentials
```bash
curl -X POST http://localhost:3004/validate \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your-secure-username",
    "password": "your-secure-password"
  }'

# Response:
{
  "valid": true,
  "userId": "admin-user-id",
  "message": "Authentication successful"
}
```

### Validate Token
```bash
# Generate token (base64 of username:password)
TOKEN=$(echo -n "your-secure-username:your-secure-password" | base64)

curl -X POST http://localhost:3004/validate-token \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}"

# Response:
{
  "valid": true,
  "userId": "admin-user-id",
  "message": "Token valid"
}
```

### Health Check
```bash
curl http://localhost:3004/health

# Response:
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2025-10-06T15:30:00.000Z"
}
```

## Integration with Gateway

The auth service is designed to be called by the Gateway service for request validation:

```typescript
// Gateway middleware example
const authResult = await fetch('http://auth-service:3004/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

if (authResult.valid) {
  // Add user context to downstream requests
  req.headers['x-user-id'] = authResult.userId;
  next();
} else {
  res.status(401).json({ error: 'Unauthorized' });
}
```

## Security Features

- **Password Hashing**: Passwords stored as bcrypt hashes (cost factor 10)
- **Input Validation**: Required field validation with error messages
- **Error Handling**: Secure error responses without information leakage
- **Request Logging**: Basic request logging for monitoring

## Future Extension Points

The service architecture supports easy extension for:

- **JWT Tokens**: Replace simple tokens with signed JWTs
- **User Database**: Add user registration and management
- **OAuth Integration**: Add Google, GitHub, etc. authentication
- **Role-based Access**: Add roles and permissions
- **Multi-tenant**: Add organization/tenant support

### Extension Examples (commented in code):
```typescript
POST /login      // Return JWT token
POST /register   // User registration
GET /user/:id    // User profile management
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Docker

```bash
# Build image
docker build -t auth-service .

# Run container
docker run -p 3004:3004 \
  -e AUTH_USERNAME=admin \
  -e AUTH_PASSWORD=secure123 \
  auth-service
```