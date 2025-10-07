# User Service

NestJS service for comprehensive user account management with MongoDB persistence.

## Purpose

- **User Management**: Create, read, update, and deactivate user accounts
- **Email-based Lookup**: Find users by email address
- **Activity Tracking**: Record user login events and track activity
- **Data Validation**: Robust input validation and error handling

## API Operations

**All routes require authentication via Gateway:**

- `POST /api/users` → Create new user **[Auth Required]**
- `GET /api/users` → List all users **[Auth Required]**
- `GET /api/users/:id` → Get user by ID **[Auth Required]**
- `GET /api/users/by-email/:email` → Get user by email **[Auth Required]**
- `PUT /api/users/:id` → Update user details **[Auth Required]**
- `PUT /api/users/:id/login` → Record user login **[Auth Required]**
- `PUT /api/users/:id/deactivate` → Deactivate user **[Auth Required]**
- `DELETE /api/users/:id` → Delete user **[Auth Required]**

## Usage Examples

### Create User
```bash
curl -u admin:your-password -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Get All Users
```bash
curl -u admin:your-password http://localhost:3000/api/users
```

### Find User by Email
```bash
curl -u admin:your-password "http://localhost:3000/api/users/by-email/user@example.com"
```

### Update User
```bash
curl -u admin:your-password -X PUT http://localhost:3000/api/users/68cc81757ece8690e78e6ec4 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

### Record Login
```bash
curl -u admin:your-password -X PUT http://localhost:3000/api/users/68cc81757ece8690e78e6ec4/login
```

## Access & Authentication

- **Via Gateway Only**: All access through `http://localhost:3000/api/users/*`
- **Authentication Required**: Use Basic Auth credentials
- **No Direct Access**: Internal service port 3015 not exposed externally

## Data Model

### User Schema
- `id`: Unique identifier (MongoDB ObjectId)
- `email`: User email address (required, unique)
- `firstName`: User's first name (optional)
- `lastName`: User's last name (optional)
- `isActive`: Account status (default: true)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last modification timestamp
- `lastLoginAt`: Last login timestamp (optional)

## Architecture

- **Internal Service**: HTTP on port 3015, microservice on port 3016
- **Gateway Routing**: All access via `/api/users/*` routes with authentication
- **MongoDB Storage**: Persistent user data with proper indexing
- **Input Validation**: Comprehensive request validation and sanitization
- **Error Handling**: Structured error responses with proper HTTP status codes

## Integration

The User Service integrates with other services through:
- **Preference Service**: Users can have multiple preferences
- **Location Service**: Users can have multiple locations
- **MCP Service**: Exposes user management tools to Claude
- **Gateway**: Protected by authentication middleware