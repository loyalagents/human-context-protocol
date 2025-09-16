// NestJS DTOs
export * from './dto/preference.dto';

// Interfaces
export * from './interfaces/api-response.interface';
export * from './interfaces/preference.interface';

// Decorators
export * from './decorators/api-response.decorator';

// Utils
export * from './utils/logger';

// Schemas (Zod - keeping for validation)
export * from './schemas/preference';

// Legacy types (re-exported with explicit names to avoid conflicts)
export { HttpMethod } from './types/common';
export { 
  CreatePreferenceRequest, 
  UpdatePreferenceRequest 
} from './types/preference';