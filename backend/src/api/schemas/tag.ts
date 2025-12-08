/**
 * Tag API Schemas
 *
 * Zod schemas for Tag API request/response validation
 */

import { z } from 'zod';

/**
 * Schema for creating a new tag
 */
export const CreateTagRequest = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be 50 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Tag name must be lowercase alphanumeric with hyphens only'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a valid hex color code')
    .optional(),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
});

export type CreateTagRequest = z.infer<typeof CreateTagRequest>;

/**
 * Schema for updating an existing tag
 */
export const UpdateTagRequest = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be 50 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Tag name must be lowercase alphanumeric with hyphens only')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a valid hex color code')
    .optional()
    .nullable(),
  description: z.string().max(500, 'Description must be 500 characters or less').optional().nullable(),
});

export type UpdateTagRequest = z.infer<typeof UpdateTagRequest>;

/**
 * Schema for tag query parameters
 */
export const TagQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  search: z.string().optional(),
});

export type TagQuery = z.infer<typeof TagQuery>;

/**
 * Schema for tag response
 */
export const TagResponse = z.object({
  id: z.string().uuid(),
  name: z.string(),
  color: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type TagResponse = z.infer<typeof TagResponse>;

/**
 * Schema for tag list response
 */
export const TagListResponse = z.object({
  items: z.array(TagResponse),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type TagListResponse = z.infer<typeof TagListResponse>;

