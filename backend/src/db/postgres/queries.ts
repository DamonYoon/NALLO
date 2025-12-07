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
export async function updateDocumentContent(
  documentId: string,
  content: string
): Promise<void> {
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

