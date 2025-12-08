import { v4 as uuidv4 } from 'uuid';

/**
 * Document type enum - matches GraphDB and OpenAPI spec
 */
export const DocumentType = {
  API: 'api',
  GENERAL: 'general',
  TUTORIAL: 'tutorial',
} as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

/**
 * Document status enum - workflow states
 * State transitions:
 * - draft → in_review (review requested)
 * - in_review → done (all reviewers approve)
 * - in_review → draft (review rejected)
 * - done → publish (deployed)
 * - publish → draft (via working copy)
 */
export const DocumentStatus = {
  DRAFT: 'draft',
  IN_REVIEW: 'in_review',
  DONE: 'done',
  PUBLISH: 'publish',
} as const;
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

/**
 * Document Node interface - represents Document node in GraphDB (Neo4j)
 */
export interface DocumentNode {
  id: string; // UUID
  type: DocumentType;
  status: DocumentStatus;
  title: string;
  lang: string; // ISO 639-1 language code
  storage_key: string; // Reference to content in PostgreSQL
  summary?: string | null; // AI-generated summary (Layer 2)
  created_at: Date;
  updated_at: Date;
}

/**
 * Document Node with content - includes PostgreSQL content
 */
export interface DocumentNodeWithContent extends DocumentNode {
  content: string;
}

/**
 * Create Document Node input
 */
export interface CreateDocumentNodeInput {
  title: string;
  type: DocumentType;
  lang: string;
  content: string;
  tags?: string[];
}

/**
 * Update Document Node input
 */
export interface UpdateDocumentNodeInput {
  title?: string;
  content?: string;
  status?: DocumentStatus;
}

/**
 * Factory function to create a new DocumentNode
 */
export function createDocumentNode(
  input: CreateDocumentNodeInput
): Omit<DocumentNode, 'storage_key'> & { content: string } {
  const now = new Date();
  return {
    id: uuidv4(),
    type: input.type,
    status: DocumentStatus.DRAFT,
    title: input.title,
    lang: input.lang,
    content: input.content,
    summary: null,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Validate document status transition
 * @returns true if transition is valid, false otherwise
 */
export function isValidStatusTransition(
  currentStatus: DocumentStatus,
  newStatus: DocumentStatus
): boolean {
  const validTransitions: Record<DocumentStatus, DocumentStatus[]> = {
    [DocumentStatus.DRAFT]: [DocumentStatus.IN_REVIEW],
    [DocumentStatus.IN_REVIEW]: [DocumentStatus.DONE, DocumentStatus.DRAFT],
    [DocumentStatus.DONE]: [DocumentStatus.PUBLISH],
    [DocumentStatus.PUBLISH]: [DocumentStatus.DRAFT],
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Convert Neo4j record to DocumentNode
 */
export function toDocumentNode(record: Record<string, unknown>): DocumentNode {
  return {
    id: String(record.id),
    type: String(record.type) as DocumentType,
    status: String(record.status) as DocumentStatus,
    title: String(record.title),
    lang: String(record.lang),
    storage_key: String(record.storage_key),
    summary: record.summary ? String(record.summary) : null,
    created_at:
      record.created_at instanceof Date ? record.created_at : new Date(String(record.created_at)),
    updated_at:
      record.updated_at instanceof Date ? record.updated_at : new Date(String(record.updated_at)),
  };
}
