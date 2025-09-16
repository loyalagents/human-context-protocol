# Shared Package

Common TypeScript utilities, DTOs, interfaces, and validation schemas for microservices.

## Purpose

- **Type Definitions**: Shared interfaces and type definitions
- **DTOs**: NestJS data transfer objects with validation decorators
- **API Standards**: Consistent response formats and decorators
- **Validation Schemas**: Zod schemas for runtime validation
- **Logging**: Centralized logger utility

## Exports

- **DTOs**: `PreferenceDto`, validation-enabled data transfer objects
- **Interfaces**: `ApiResponseInterface`, `PreferenceInterface`
- **Decorators**: `@ApiResponse` for Swagger documentation
- **Utils**: `Logger` utility for consistent logging
- **Schemas**: Zod validation schemas for runtime checks

## Architecture

- **TypeScript Library**: Compiled to `dist/` for consumption
- **Multi-Format**: Supports both NestJS decorators and Zod validation
- **Version Controlled**: Shared dependency across all services