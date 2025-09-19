// NestJS DTOs
export * from './dto/preference.dto';
export * from './dto/user.dto';

// Interfaces
export * from './interfaces/api-response.interface';
export * from './interfaces/preference.interface';
export * from './interfaces/user.interface';

// Decorators
export * from './decorators/api-response.decorator';

// Utils
export * from './utils/logger';
export * from './utils/transform';

// Schemas (Zod - keeping for validation)
export * from './schemas/preference';

// Branded types
export * from './branded-types';

// Common types
export * from './types/common';

// Legacy types (re-exported with explicit names to avoid conflicts)
export {
  CreatePreferenceRequest,
  UpdatePreferenceRequest
} from './types/preference';