import { z } from 'zod';
import { AttachmentType, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '../../models/rdb/attachment';

// UUID validation
const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Attachment Response Schema
 */
export const attachmentResponseSchema = z.object({
  id: uuidSchema,
  document_id: uuidSchema.nullable(),
  filename: z.string(),
  storage_path: z.string(),
  mime_type: z.string(),
  attachment_type: z.enum([
    AttachmentType.IMAGE,
    AttachmentType.DOCUMENT,
    AttachmentType.OAS,
    AttachmentType.MARKDOWN,
    AttachmentType.OTHER,
  ]),
  size_bytes: z.number().int().nonnegative(),
  checksum: z.string().nullable(),
  download_url: z.string().url().optional(), // Presigned URL for download
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type AttachmentResponse = z.infer<typeof attachmentResponseSchema>;

/**
 * Upload Attachment Request Schema (metadata)
 */
export const uploadAttachmentSchema = z.object({
  document_id: uuidSchema.optional(),
});
export type UploadAttachmentRequest = z.infer<typeof uploadAttachmentSchema>;

/**
 * Attachment List Response Schema
 */
export const attachmentListResponseSchema = z.object({
  items: z.array(attachmentResponseSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});
export type AttachmentListResponse = z.infer<typeof attachmentListResponseSchema>;

/**
 * Attachment Query Parameters Schema
 */
export const attachmentQuerySchema = z.object({
  document_id: uuidSchema.optional(),
  attachment_type: z
    .enum([
      AttachmentType.IMAGE,
      AttachmentType.DOCUMENT,
      AttachmentType.OAS,
      AttachmentType.MARKDOWN,
      AttachmentType.OTHER,
    ])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type AttachmentQuery = z.infer<typeof attachmentQuerySchema>;

/**
 * Attachment ID Param Schema
 */
export const attachmentIdParamSchema = z.object({
  id: uuidSchema,
});
export type AttachmentIdParam = z.infer<typeof attachmentIdParamSchema>;

/**
 * File validation constants for client-side validation
 */
export const FILE_VALIDATION = {
  allowedMimeTypes: ALLOWED_MIME_TYPES,
  maxFileSize: MAX_FILE_SIZE,
  maxFileSizeMB: MAX_FILE_SIZE / 1024 / 1024,
} as const;
