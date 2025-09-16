# Preference Service

NestJS hybrid service managing user preferences via MongoDB with dual transport support.

## Purpose

- **Preference CRUD**: Create, read, update, delete user preferences
- **Data Persistence**: MongoDB storage with Mongoose schemas
- **Dual Transport**: HTTP API + TCP microservice for inter-service communication
- **Type Safety**: Strongly typed preference values (string, number, boolean, array, object)

## Transport Architecture

- **HTTP Server**: Port 3001 (direct client access for development)
- **TCP Microservice**: Port 3002 (gateway communication)
- **Database**: MongoDB connection via Mongoose

## Core Operations

- Store preferences by userId/key pairs
- Support complex value types with validation
- Bulk retrieval and key listing
- Atomic updates and deletions