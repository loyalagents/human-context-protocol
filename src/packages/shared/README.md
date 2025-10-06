# Shared Package

Common TypeScript utilities, DTOs, interfaces, and validation schemas for microservices.

## Purpose

- **Type Definitions**: Shared interfaces and type definitions
- **DTOs**: NestJS data transfer objects with validation decorators
- **API Standards**: Consistent response formats and decorators
- **Validation Schemas**: Zod schemas for runtime validation
- **Logging**: Centralized logger utility

## Exports

### DTOs & Validation
- **PreferenceDto**: Core preference validation objects
- **LocationDto**: Location management with system + custom location types
- **FoodPreferenceDto**: Food preference validation with categories and levels
- **UserDto**: User management and authentication data objects

### Type Definitions
- **LocationTypes**: System location types, categories, features, and configuration
- **FoodPreferenceTypes**: 17 food categories, 5 preference levels, merging logic
- **ApiInterfaces**: `ApiResponseInterface`, `PreferenceInterface`
- **BrandedTypes**: Type-safe userId, preferenceId with runtime validation

### Utilities
- **Decorators**: `@ApiResponse` for Swagger documentation
- **Logger**: Centralized logging utility with context support
- **Schemas**: Zod validation schemas for runtime type checking

## Architecture

- **TypeScript Library**: Compiled to `dist/` for consumption
- **Multi-Format**: Supports both NestJS decorators and Zod validation
- **Version Controlled**: Shared dependency across all services