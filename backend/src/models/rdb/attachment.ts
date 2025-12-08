import { v4 as uuidv4 } from 'uuid';

/**
 * Supported file types for attachments
 */
export const AttachmentType = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  OAS: 'oas',
  MARKDOWN: 'markdown',
  OTHER: 'other',
} as const;
export type AttachmentType = (typeof AttachmentType)[keyof typeof AttachmentType];

/**
 * MIME type to AttachmentType mapping
 */
export function getAttachmentType(mimeType: string): AttachmentType {
  if (mimeType.startsWith('image/')) {
    return AttachmentType.IMAGE;
  }
  if (mimeType === 'application/json' || mimeType === 'application/x-yaml' || mimeType === 'text/yaml') {
    return AttachmentType.OAS;
  }
  if (mimeType === 'text/markdown' || mimeType === 'text/x-markdown') {
    return AttachmentType.MARKDOWN;
  }
  if (mimeType.startsWith('application/') || mimeType === 'text/plain') {
    return AttachmentType.DOCUMENT;
  }
  return AttachmentType.OTHER;
}

/**
 * Attachment interface - represents row in PostgreSQL attachments table
 * Stores metadata about files uploaded to MinIO
 */
export interface Attachment {
  id: string; // UUID - Primary key
  document_id: string | null; // UUID - Optional reference to Document (can be null for standalone attachments)
  filename: string; // Original filename
  storage_path: string; // Path in MinIO (e.g., "attachments/uuid/filename.png")
  mime_type: string; // MIME type (e.g., "image/png", "application/json")
  attachment_type: AttachmentType; // Categorized type
  size_bytes: number; // File size in bytes
  checksum: string | null; // MD5 or SHA256 checksum for integrity
  created_at: Date;
  updated_at: Date;
}

/**
 * Create Attachment input
 */
export interface CreateAttachmentInput {
  document_id?: string | null;
  filename: string;
  mime_type: string;
  size_bytes: number;
  checksum?: string;
}

/**
 * Factory function to create a new Attachment record
 */
export function createAttachment(input: CreateAttachmentInput): Attachment {
  const now = new Date();
  const id = uuidv4();
  const attachmentType = getAttachmentType(input.mime_type);

  // Generate storage path: attachments/{id}/{sanitized_filename}
  const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `attachments/${id}/${sanitizedFilename}`;

  return {
    id,
    document_id: input.document_id ?? null,
    filename: input.filename,
    storage_path: storagePath,
    mime_type: input.mime_type,
    attachment_type: attachmentType,
    size_bytes: input.size_bytes,
    checksum: input.checksum ?? null,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Get allowed MIME types for upload
 */
export const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  // OAS/API specs
  'application/json',
  'application/x-yaml',
  'text/yaml',
  'application/yaml',
  // Archives (optional)
  'application/zip',
] as const;

/**
 * Maximum file size (10MB default)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate file for upload
 */
export function validateFile(
  mimeType: string,
  size: number
): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
    return {
      valid: false,
      error: `File type not allowed: ${mimeType}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${size} bytes. Maximum size: ${MAX_FILE_SIZE} bytes (${MAX_FILE_SIZE / 1024 / 1024}MB)`,
    };
  }

  return { valid: true };
}

