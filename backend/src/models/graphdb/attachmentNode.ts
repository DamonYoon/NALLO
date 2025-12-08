import { v4 as uuidv4 } from 'uuid';

/**
 * Attachment file type enum
 */
export const AttachmentFileType = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  OTHER: 'other',
} as const;
export type AttachmentFileType = (typeof AttachmentFileType)[keyof typeof AttachmentFileType];

/**
 * Allowed MIME types for attachments
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
  // API specs (for standalone upload)
  'application/json',
  'application/x-yaml',
  'text/yaml',
  'application/yaml',
  // Markdown (for standalone upload)
  'text/markdown',
  'text/x-markdown',
] as const;

/**
 * Maximum file size (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Get file type from MIME type
 */
export function getFileType(mimeType: string): AttachmentFileType {
  if (mimeType.startsWith('image/')) {
    return AttachmentFileType.IMAGE;
  }
  if (mimeType === 'application/pdf') {
    return AttachmentFileType.DOCUMENT;
  }
  return AttachmentFileType.OTHER;
}

/**
 * Attachment Node interface - represents Attachment node in GraphDB (Neo4j)
 */
export interface AttachmentNode {
  id: string; // UUID
  filename: string; // Original filename
  storage_key: string; // MinIO storage path
  mime_type: string; // MIME type
  file_type: AttachmentFileType; // Categorized file type
  size_bytes: number; // File size in bytes
  checksum: string | null; // MD5 checksum
  alt_text: string | null; // Alternative text for images
  created_at: Date;
  updated_at: Date;
}

/**
 * HAS_ATTACHMENT relationship properties
 */
export interface HasAttachmentRelationship {
  order?: number; // Display order
  caption?: string; // Caption for the attachment
}

/**
 * Attachment with document relationship info
 */
export interface AttachmentWithDocument extends AttachmentNode {
  document_id: string | null;
  relationship?: HasAttachmentRelationship;
}

/**
 * Create Attachment Node input
 */
export interface CreateAttachmentNodeInput {
  filename: string;
  mime_type: string;
  size_bytes: number;
  checksum?: string;
  alt_text?: string;
}

/**
 * Factory function to create a new AttachmentNode
 */
export function createAttachmentNode(input: CreateAttachmentNodeInput): AttachmentNode {
  const now = new Date();
  const id = uuidv4();
  const fileType = getFileType(input.mime_type);

  // Generate storage path: attachments/{id}/{sanitized_filename}
  const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageKey = `attachments/${id}/${sanitizedFilename}`;

  return {
    id,
    filename: input.filename,
    storage_key: storageKey,
    mime_type: input.mime_type,
    file_type: fileType,
    size_bytes: input.size_bytes,
    checksum: input.checksum ?? null,
    alt_text: input.alt_text ?? null,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Validate file for upload
 */
export function validateFile(mimeType: string, size: number): { valid: boolean; error?: string } {
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
