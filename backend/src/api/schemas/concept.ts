/**
 * Concept API Schemas
 * Zod schemas for concept request/response validation
 * Per OpenAPI specification in contracts/openapi.yaml
 *
 * Note: category field removed - categorization is done via
 * Concept relationships (SUBTYPE_OF, PART_OF, SYNONYM_OF)
 */
import { z } from 'zod';

// ISO 639-1 language code pattern (2 lowercase letters)
const langCodeSchema = z
  .string()
  .regex(/^[a-z]{2}$/, 'Invalid language code. Must be ISO 639-1 format (e.g., "en", "ko")');

// UUID validation
const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Create Concept Request Schema
 * Per OpenAPI CreateConceptRequest
 */
export const createConceptSchema = z.object({
  term: z.string().min(1, 'Term is required').max(255, 'Term must be less than 255 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be less than 5000 characters'),
  lang: langCodeSchema,
});
export type CreateConceptRequest = z.infer<typeof createConceptSchema>;

/**
 * Update Concept Request Schema
 * Per OpenAPI UpdateConceptRequest
 */
export const updateConceptSchema = z.object({
  term: z.string().min(1).max(255).optional(),
  description: z.string().min(1).max(5000).optional(),
});
export type UpdateConceptRequest = z.infer<typeof updateConceptSchema>;

/**
 * Concept Response Schema
 * Per OpenAPI ConceptResponse
 */
export const conceptResponseSchema = z.object({
  id: uuidSchema,
  term: z.string(),
  description: z.string(),
  lang: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type ConceptResponse = z.infer<typeof conceptResponseSchema>;

/**
 * Concept List Response Schema
 */
export const conceptListResponseSchema = z.object({
  items: z.array(conceptResponseSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});
export type ConceptListResponse = z.infer<typeof conceptListResponseSchema>;

/**
 * Concept Query Parameters Schema
 */
export const conceptQuerySchema = z.object({
  lang: langCodeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ConceptQuery = z.infer<typeof conceptQuerySchema>;

/**
 * Concept ID Param Schema
 */
export const conceptIdParamSchema = z.object({
  id: uuidSchema,
});
export type ConceptIdParam = z.infer<typeof conceptIdParamSchema>;
