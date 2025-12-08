import { z } from 'zod';

// Document type enum
export const DocumentType = {
  API: 'api',
  GENERAL: 'general',
  TUTORIAL: 'tutorial',
} as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

// Document status enum
export const DocumentStatus = {
  DRAFT: 'draft',
  IN_REVIEW: 'in_review',
  DONE: 'done',
  PUBLISH: 'publish',
} as const;
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

// ISO 639-1 language code pattern (2 lowercase letters)
const langCodeSchema = z
  .string()
  .regex(/^[a-z]{2}$/, 'Invalid language code. Must be ISO 639-1 format (e.g., "en", "ko")');

// UUID validation
const uuidSchema = z.string().uuid('Invalid UUID format');

// Create Document Request Schema
export const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  type: z.enum([DocumentType.API, DocumentType.GENERAL, DocumentType.TUTORIAL], {
    errorMap: () => ({ message: 'Type must be one of: api, general, tutorial' }),
  }),
  content: z.string().min(1, 'Content is required'),
  lang: langCodeSchema,
  tags: z.array(z.string()).optional(),
});
export type CreateDocumentRequest = z.infer<typeof createDocumentSchema>;

// Update Document Request Schema
export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  status: z
    .enum(
      [DocumentStatus.DRAFT, DocumentStatus.IN_REVIEW, DocumentStatus.DONE, DocumentStatus.PUBLISH],
      {
        errorMap: () => ({ message: 'Status must be one of: draft, in_review, done, publish' }),
      }
    )
    .optional(),
});
export type UpdateDocumentRequest = z.infer<typeof updateDocumentSchema>;

// Document Response Schema (for validation and typing)
export const documentResponseSchema = z.object({
  id: uuidSchema,
  type: z.enum([DocumentType.API, DocumentType.GENERAL, DocumentType.TUTORIAL]),
  status: z.enum([
    DocumentStatus.DRAFT,
    DocumentStatus.IN_REVIEW,
    DocumentStatus.DONE,
    DocumentStatus.PUBLISH,
  ]),
  title: z.string(),
  lang: z.string(),
  content: z.string(),
  summary: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type DocumentResponse = z.infer<typeof documentResponseSchema>;

// Document List Response Schema
export const documentListResponseSchema = z.object({
  items: z.array(documentResponseSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});
export type DocumentListResponse = z.infer<typeof documentListResponseSchema>;

// Query Parameters Schema
export const documentQuerySchema = z.object({
  status: z
    .enum([
      DocumentStatus.DRAFT,
      DocumentStatus.IN_REVIEW,
      DocumentStatus.DONE,
      DocumentStatus.PUBLISH,
    ])
    .optional(),
  type: z.enum([DocumentType.API, DocumentType.GENERAL, DocumentType.TUTORIAL]).optional(),
  lang: langCodeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type DocumentQuery = z.infer<typeof documentQuerySchema>;

// Document ID Param Schema
export const documentIdParamSchema = z.object({
  id: uuidSchema,
});
export type DocumentIdParam = z.infer<typeof documentIdParamSchema>;
