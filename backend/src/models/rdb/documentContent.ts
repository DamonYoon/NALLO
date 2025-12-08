import { v4 as uuidv4 } from 'uuid';

/**
 * Document Content interface - represents row in PostgreSQL documents table
 * Stores the actual document content while metadata is in GraphDB
 */
export interface DocumentContent {
  id: string; // UUID - Primary key
  document_id: string; // UUID - References GraphDB Document node id
  content: string; // Document content (markdown or YAML)
  storage_key: string; // File storage location (S3 path, etc.)
  created_at: Date;
  updated_at: Date;
}

/**
 * Create Document Content input
 */
export interface CreateDocumentContentInput {
  document_id: string;
  content: string;
}

/**
 * Update Document Content input
 */
export interface UpdateDocumentContentInput {
  content?: string;
}

/**
 * Factory function to create a new DocumentContent record
 */
export function createDocumentContent(input: CreateDocumentContentInput): DocumentContent {
  const now = new Date();
  const id = uuidv4();

  return {
    id,
    document_id: input.document_id,
    content: input.content,
    storage_key: `documents/${input.document_id}`, // Default storage key pattern
    created_at: now,
    updated_at: now,
  };
}

/**
 * Generate storage key for document content
 * @param documentId - The document UUID
 * @returns Storage key path
 */
export function generateStorageKey(documentId: string): string {
  return `documents/${documentId}`;
}
