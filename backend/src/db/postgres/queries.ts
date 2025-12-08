/**
 * PostgreSQL query utilities
 * This file contains reusable SQL query templates
 */

import { dataSource } from './connection';

/**
 * Create document content
 */
export async function createDocumentContent(
  documentId: string,
  content: string,
  storageKey: string
): Promise<void> {
  const query = `
    INSERT INTO documents (document_id, content, storage_key)
    VALUES ($1, $2, $3)
  `;
  await dataSource.query(query, [documentId, content, storageKey]);
}

/**
 * Get document content by document_id
 */
export async function getDocumentContent(documentId: string): Promise<{
  id: string;
  document_id: string;
  content: string;
  storage_key: string;
  created_at: Date;
  updated_at: Date;
} | null> {
  const query = `
    SELECT id, document_id, content, storage_key, created_at, updated_at
    FROM documents
    WHERE document_id = $1
    LIMIT 1
  `;
  const result = await dataSource.query(query, [documentId]);
  return result[0] || null;
}

/**
 * Update document content
 */
export async function updateDocumentContent(documentId: string, content: string): Promise<void> {
  const query = `
    UPDATE documents
    SET content = $1, updated_at = NOW()
    WHERE document_id = $2
  `;
  await dataSource.query(query, [content, documentId]);
}

/**
 * Delete document content
 */
export async function deleteDocumentContent(documentId: string): Promise<void> {
  const query = `
    DELETE FROM documents
    WHERE document_id = $1
  `;
  await dataSource.query(query, [documentId]);
}

// ============================================
// ATTACHMENT QUERIES
// ============================================

/**
 * Create attachment record
 */
export async function createAttachment(
  id: string,
  documentId: string | null,
  filename: string,
  storagePath: string,
  mimeType: string,
  attachmentType: string,
  sizeBytes: number,
  checksum: string | null
): Promise<void> {
  const query = `
    INSERT INTO attachments (id, document_id, filename, storage_path, mime_type, attachment_type, size_bytes, checksum)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  await dataSource.query(query, [
    id,
    documentId,
    filename,
    storagePath,
    mimeType,
    attachmentType,
    sizeBytes,
    checksum,
  ]);
}

/**
 * Get attachment by ID
 */
export async function getAttachment(id: string): Promise<{
  id: string;
  document_id: string | null;
  filename: string;
  storage_path: string;
  mime_type: string;
  attachment_type: string;
  size_bytes: number;
  checksum: string | null;
  created_at: Date;
  updated_at: Date;
} | null> {
  const query = `
    SELECT id, document_id, filename, storage_path, mime_type, attachment_type, size_bytes, checksum, created_at, updated_at
    FROM attachments
    WHERE id = $1
    LIMIT 1
  `;
  const result = await dataSource.query(query, [id]);
  return result[0] || null;
}

/**
 * Get attachments by document ID
 */
export async function getAttachmentsByDocumentId(documentId: string): Promise<
  Array<{
    id: string;
    document_id: string | null;
    filename: string;
    storage_path: string;
    mime_type: string;
    attachment_type: string;
    size_bytes: number;
    checksum: string | null;
    created_at: Date;
    updated_at: Date;
  }>
> {
  const query = `
    SELECT id, document_id, filename, storage_path, mime_type, attachment_type, size_bytes, checksum, created_at, updated_at
    FROM attachments
    WHERE document_id = $1
    ORDER BY created_at DESC
  `;
  return dataSource.query(query, [documentId]);
}

/**
 * List attachments with optional filters
 */
export async function listAttachments(params: {
  documentId?: string | null;
  attachmentType?: string | null;
  limit: number;
  offset: number;
}): Promise<{
  items: Array<{
    id: string;
    document_id: string | null;
    filename: string;
    storage_path: string;
    mime_type: string;
    attachment_type: string;
    size_bytes: number;
    checksum: string | null;
    created_at: Date;
    updated_at: Date;
  }>;
  total: number;
}> {
  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (params.documentId) {
    conditions.push(`document_id = $${paramIndex++}`);
    values.push(params.documentId);
  }

  if (params.attachmentType) {
    conditions.push(`attachment_type = $${paramIndex++}`);
    values.push(params.attachmentType);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countQuery = `SELECT COUNT(*) as total FROM attachments ${whereClause}`;
  const countResult = await dataSource.query(countQuery, values);
  const total = parseInt(countResult[0]?.total || '0', 10);

  const listQuery = `
    SELECT id, document_id, filename, storage_path, mime_type, attachment_type, size_bytes, checksum, created_at, updated_at
    FROM attachments
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex++}
    OFFSET $${paramIndex}
  `;

  const items = await dataSource.query(listQuery, [...values, params.limit, params.offset]);

  return { items, total };
}

/**
 * Delete attachment
 */
export async function deleteAttachment(id: string): Promise<boolean> {
  const query = `
    DELETE FROM attachments
    WHERE id = $1
    RETURNING id
  `;
  const result = await dataSource.query(query, [id]);
  return result.length > 0;
}

/**
 * Delete attachments by document ID
 */
export async function deleteAttachmentsByDocumentId(documentId: string): Promise<string[]> {
  const query = `
    DELETE FROM attachments
    WHERE document_id = $1
    RETURNING storage_path
  `;
  const result = await dataSource.query(query, [documentId]);
  return result.map((row: { storage_path: string }) => row.storage_path);
}
