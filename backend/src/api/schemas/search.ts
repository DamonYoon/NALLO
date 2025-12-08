/**
 * Search API Schemas
 * Zod validation schemas for search operations
 */

import { z } from 'zod';

/**
 * Search query parameters
 */
export const SearchQuerySchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  version_id: z.string().uuid().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

/**
 * Search result item
 */
export const SearchResultItemSchema = z.object({
  page_id: z.string().uuid().nullable(),
  document_id: z.string().uuid(),
  title: z.string(),
  summary: z.string().nullable(),
  relevance_score: z.number(),
  matched_fields: z.array(z.string()),
  type: z.string(),
});

export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;

/**
 * Search response
 */
export const SearchResponseSchema = z.object({
  results: z.array(SearchResultItemSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

