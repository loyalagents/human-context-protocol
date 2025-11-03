import { z } from 'zod';

export const PreferenceTypeSchema = z.enum(['string', 'number', 'boolean', 'object', 'array']);

export const CreatePreferenceSchema = z.object({
  userId: z.string().min(1),
  key: z.string().min(1),
  data: z.unknown(),
  type: PreferenceTypeSchema.optional(),
  category: z.string().optional()
});

export const UpdatePreferenceSchema = z.object({
  data: z.unknown(),
  type: PreferenceTypeSchema.optional()
});

export const PreferenceFilterSchema = z.object({
  userId: z.string().optional(),
  key: z.string().optional(),
  type: PreferenceTypeSchema.optional()
});

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
});