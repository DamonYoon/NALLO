/**
 * Version API Schemas
 * Zod schemas for version request/response validation
 * Per OpenAPI specification in contracts/openapi.yaml
 */
import { z } from 'zod';

// UUID validation
const uuidSchema = z.string().uuid('Invalid UUID format');

// Version string pattern (semantic versioning: v1.0.0)
const versionStringSchema = z
  .string()
  .regex(/^v\d+\.\d+\.\d+$/, 'Version must follow semantic versioning (e.g., v1.0.0)');

/**
 * Create Version Request Schema
 * Per OpenAPI CreateVersionRequest
 */
export const createVersionSchema = z.object({
  version: versionStringSchema,
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  description: z.string().max(1000).optional(),
  is_public: z.boolean(),
  is_main: z.boolean(),
});
export type CreateVersionRequest = z.infer<typeof createVersionSchema>;

/**
 * Update Version Request Schema
 */
export const updateVersionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  is_public: z.boolean().optional(),
  is_main: z.boolean().optional(),
});
export type UpdateVersionRequest = z.infer<typeof updateVersionSchema>;

/**
 * Version Response Schema
 * Per OpenAPI VersionResponse
 */
export const versionResponseSchema = z.object({
  id: uuidSchema,
  version: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  is_public: z.boolean(),
  is_main: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type VersionResponse = z.infer<typeof versionResponseSchema>;

/**
 * Version List Response Schema
 */
export const versionListResponseSchema = z.object({
  items: z.array(versionResponseSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});
export type VersionListResponse = z.infer<typeof versionListResponseSchema>;

/**
 * Version Query Parameters Schema
 */
export const versionQuerySchema = z.object({
  is_public: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type VersionQuery = z.infer<typeof versionQuerySchema>;

/**
 * Version ID Param Schema
 */
export const versionIdParamSchema = z.object({
  id: uuidSchema,
});
export type VersionIdParam = z.infer<typeof versionIdParamSchema>;

/**
 * Navigation Tree Response Schema
 * Per OpenAPI NavigationTreeResponse
 */
export const navigationItemSchema: z.ZodType<{
  id: string;
  title: string;
  slug: string;
  order: number;
  visible: boolean;
  document_id?: string | null;
  children: unknown[];
}> = z.lazy(() =>
  z.object({
    id: uuidSchema,
    title: z.string(),
    slug: z.string(),
    order: z.number().int(),
    visible: z.boolean(),
    document_id: uuidSchema.nullable().optional(),
    children: z.array(navigationItemSchema),
  })
);

export const navigationTreeResponseSchema = z.object({
  pages: z.array(navigationItemSchema),
});
export type NavigationTreeResponse = z.infer<typeof navigationTreeResponseSchema>;
