/**
 * Page API Schemas
 * Zod schemas for page request/response validation
 * Per OpenAPI specification in contracts/openapi.yaml
 */
import { z } from 'zod';

// UUID validation
const uuidSchema = z.string().uuid('Invalid UUID format');

// Slug pattern (lowercase alphanumeric with hyphens)
const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only');

/**
 * Create Page Request Schema
 * Per OpenAPI CreatePageRequest
 */
export const createPageSchema = z.object({
  slug: slugSchema.min(1, 'Slug is required').max(255, 'Slug must be less than 255 characters'),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  version_id: uuidSchema,
  parent_page_id: uuidSchema.optional().nullable(),
  order: z.number().int().min(0).default(0),
  visible: z.boolean().default(false),
});
export type CreatePageRequest = z.infer<typeof createPageSchema>;

/**
 * Update Page Request Schema
 */
export const updatePageSchema = z.object({
  slug: slugSchema.min(1).max(255).optional(),
  title: z.string().min(1).max(255).optional(),
  order: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});
export type UpdatePageRequest = z.infer<typeof updatePageSchema>;

/**
 * Page Response Schema
 * Per OpenAPI PageResponse
 */
export const pageResponseSchema = z.object({
  id: uuidSchema,
  slug: z.string(),
  title: z.string(),
  order: z.number().int(),
  visible: z.boolean(),
  version_id: uuidSchema.optional(),
  parent_page_id: uuidSchema.nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type PageResponse = z.infer<typeof pageResponseSchema>;

/**
 * Page List Response Schema
 */
export const pageListResponseSchema = z.object({
  items: z.array(pageResponseSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});
export type PageListResponse = z.infer<typeof pageListResponseSchema>;

/**
 * Page Query Parameters Schema
 */
export const pageQuerySchema = z.object({
  version_id: uuidSchema.optional(),
  visible: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type PageQuery = z.infer<typeof pageQuerySchema>;

/**
 * Page ID Param Schema
 */
export const pageIdParamSchema = z.object({
  id: uuidSchema,
});
export type PageIdParam = z.infer<typeof pageIdParamSchema>;

/**
 * Link Page to Document Request Schema
 * Per OpenAPI LinkPageDocumentRequest
 */
export const linkPageDocumentSchema = z.object({
  document_id: uuidSchema,
});
export type LinkPageDocumentRequest = z.infer<typeof linkPageDocumentSchema>;

/**
 * Link Response Schema
 */
export const linkResponseSchema = z.object({
  relation_id: z.string().optional(),
  page_id: uuidSchema,
  document_id: uuidSchema,
});
export type LinkResponse = z.infer<typeof linkResponseSchema>;
