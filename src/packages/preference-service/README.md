# Preference Service

NestJS hybrid service managing user preferences via MongoDB with dual transport support.

## Purpose

- **Preference CRUD**: Create, read, update, delete user preferences
- **Location Management**: Comprehensive location tracking with system + custom locations
- **Food Preferences**: Context-aware food preferences with location-specific overrides
- **Data Persistence**: MongoDB storage with Mongoose schemas and indexing
- **Dual Transport**: HTTP API + TCP microservice for inter-service communication
- **Type Safety**: Strongly typed preference values (string, number, boolean, array, object)

## Transport Architecture

- **HTTP Server**: Port 3001 (direct client access for development)
- **TCP Microservice**: Port 3002 (gateway communication)
- **Database**: MongoDB connection via Mongoose

## Core Operations

### Preference Management
- Store preferences by userId/key pairs
- Support complex value types with validation
- Bulk retrieval and key listing
- Atomic updates and deletions

### Location Management
- **System locations**: home, work, gym, school with predefined features
- **Custom locations**: user-defined places (e.g., moms_house, vacation_home)
- **Semantic keys**: Stable location identifiers that survive address changes
- **Location features**: food_preferences, delivery_support, scheduling, etc.
- **Smart indexing**: Efficient queries by location, category, and type

### Food Preference System
- **Default preferences**: Global food category preferences per user
- **Location overrides**: Different preferences at specific locations
- **Effective preferences**: Automatic merging of defaults + location overrides
- **17 food categories**: italian, chinese, mexican, healthy, fast_food, etc.
- **5 preference levels**: love, like, neutral, dislike, hate
- **Per-user personalization**: Each user has unique default preferences