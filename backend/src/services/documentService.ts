/**
 * Document Service
 * Handles document CRUD operations with GraphDB (metadata) and MinIO (content)
 * Per Constitution Principle I: Business logic separated from API routes and database access
 *
 * 저장 구조:
 * - GraphDB: 메타데이터 + storage_key
 * - MinIO: 실제 콘텐츠 파일 (md, yaml, json 등)
 */

import { v4 as uuidv4 } from 'uuid';
import {
  DocumentNode,
  DocumentType,
  DocumentStatus,
  isValidStatusTransition,
} from '../models/graphdb/documentNode';
import {
  createDocumentNode,
  getDocumentNode,
  updateDocumentNode,
  deleteDocumentNode,
  listDocumentNodes,
} from '../db/graphdb/queries';
import { uploadFile, downloadFile, deleteFile, fileExists } from '../db/storage/connection';
import {
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentQuery,
  DocumentListResponse,
} from '../api/schemas/document';
import { AppError, ErrorCode } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Document response type for API
 */
export interface DocumentResponseDTO {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  title: string;
  lang: string;
  content: string;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Generate storage key for document content in MinIO
 */
function generateStorageKey(documentId: string, type: DocumentType): string {
  const extension = type === DocumentType.API ? 'yaml' : 'md';
  return `documents/${documentId}/content.${extension}`;
}

/**
 * Get MIME type for document type
 */
function getMimeType(type: DocumentType): string {
  return type === DocumentType.API ? 'application/yaml' : 'text/markdown';
}

/**
 * Document Service class
 * Orchestrates operations between GraphDB (metadata) and MinIO (content)
 */
export class DocumentService {
  /**
   * Create a new document
   * 1. Create metadata node in GraphDB
   * 2. Store content in MinIO
   * 3. Return combined document
   */
  async createDocument(input: CreateDocumentRequest): Promise<DocumentResponseDTO> {
    const documentId = uuidv4();
    const storageKey = generateStorageKey(documentId, input.type as DocumentType);
    const mimeType = getMimeType(input.type as DocumentType);

    logger.info('Creating document', { documentId, title: input.title, type: input.type });

    try {
      // Store content in MinIO first
      const contentBuffer = Buffer.from(input.content, 'utf-8');
      await uploadFile(storageKey, contentBuffer, mimeType);

      // Create metadata in GraphDB
      const documentNode = await createDocumentNode({
        id: documentId,
        type: input.type as DocumentType,
        status: DocumentStatus.DRAFT,
        title: input.title,
        lang: input.lang,
        storage_key: storageKey,
        summary: null,
      });

      logger.info('Document created successfully', { documentId, storageKey });

      return this.toResponseDTO(documentNode, input.content);
    } catch (error) {
      logger.error('Failed to create document', { documentId, error });

      // Attempt rollback: delete from MinIO and GraphDB
      try {
        await deleteFile(storageKey);
        await deleteDocumentNode(documentId);
      } catch (rollbackError) {
        logger.error('Rollback failed', { documentId, rollbackError });
      }

      throw error;
    }
  }

  /**
   * Get document by ID
   * Merges metadata from GraphDB with content from MinIO
   */
  async getDocument(id: string): Promise<DocumentResponseDTO | null> {
    logger.debug('Getting document', { id });

    // Get metadata from GraphDB
    const documentNode = await getDocumentNode(id);

    if (!documentNode) {
      logger.debug('Document not found in GraphDB', { id });
      return null;
    }

    // Get content from MinIO
    let content = '';
    try {
      const exists = await fileExists(documentNode.storage_key);
      if (exists) {
        const contentBuffer = await downloadFile(documentNode.storage_key);
        content = contentBuffer.toString('utf-8');
      } else {
        logger.warn('Document content not found in MinIO', {
          id,
          storageKey: documentNode.storage_key,
        });
      }
    } catch (error) {
      logger.error('Failed to get document content from MinIO', { id, error });
      // Return metadata with empty content
    }

    return this.toResponseDTO(documentNode, content);
  }

  /**
   * Update document
   * Updates metadata in GraphDB and/or content in MinIO
   */
  async updateDocument(
    id: string,
    input: UpdateDocumentRequest
  ): Promise<DocumentResponseDTO | null> {
    logger.info('Updating document', { id, fields: Object.keys(input) });

    // Get current document
    const currentNode = await getDocumentNode(id);

    if (!currentNode) {
      logger.debug('Document not found for update', { id });
      return null;
    }

    // Validate status transition if status is being updated
    if (input.status && input.status !== currentNode.status) {
      if (!isValidStatusTransition(currentNode.status, input.status as DocumentStatus)) {
        throw new AppError(
          ErrorCode.INVALID_STATUS_TRANSITION,
          `Invalid status transition from ${currentNode.status} to ${input.status}`,
          400
        );
      }
    }

    // Update metadata in GraphDB if title or status changed
    let updatedNode = currentNode;
    if (input.title || input.status) {
      const updates: Partial<Pick<DocumentNode, 'title' | 'status'>> = {};
      if (input.title) updates.title = input.title;
      if (input.status) updates.status = input.status as DocumentStatus;

      const result = await updateDocumentNode(id, updates);
      if (result) {
        updatedNode = result;
      }
    }

    // Update content in MinIO if content changed
    if (input.content) {
      const mimeType = getMimeType(currentNode.type);
      const contentBuffer = Buffer.from(input.content, 'utf-8');
      await uploadFile(currentNode.storage_key, contentBuffer, mimeType);
    }

    // Get final content from MinIO
    let content = '';
    try {
      const contentBuffer = await downloadFile(updatedNode.storage_key);
      content = contentBuffer.toString('utf-8');
    } catch (error) {
      logger.error('Failed to get updated content', { id, error });
    }

    logger.info('Document updated successfully', { id });

    return this.toResponseDTO(updatedNode, content);
  }

  /**
   * Delete document
   * Removes from both GraphDB and MinIO
   */
  async deleteDocument(id: string): Promise<boolean> {
    logger.info('Deleting document', { id });

    // Check if document exists
    const documentNode = await getDocumentNode(id);

    if (!documentNode) {
      logger.debug('Document not found for deletion', { id });
      return false;
    }

    try {
      // Delete from MinIO first (content)
      try {
        await deleteFile(documentNode.storage_key);
      } catch (minioError) {
        logger.warn('Failed to delete content from MinIO (may not exist)', {
          id,
          error: minioError,
        });
      }

      // Delete from GraphDB (metadata)
      await deleteDocumentNode(id);

      logger.info('Document deleted successfully', { id });
      return true;
    } catch (error) {
      logger.error('Failed to delete document', { id, error });
      throw error;
    }
  }

  /**
   * List documents with optional filters and pagination
   * Note: content is not included in list response for performance
   */
  async listDocuments(query: DocumentQuery): Promise<DocumentListResponse> {
    logger.debug('Listing documents', { query });

    const { items, total } = await listDocumentNodes({
      status: query.status as DocumentStatus | undefined,
      type: query.type as DocumentType | undefined,
      lang: query.lang,
      limit: query.limit,
      offset: query.offset,
    });

    // For list, we don't fetch content from MinIO (performance optimization)
    // Use empty string for content in list view
    const documentsWithoutContent = items.map(node => this.toResponseDTO(node, ''));

    return {
      items: documentsWithoutContent,
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }

  /**
   * Convert DocumentNode to response DTO
   */
  private toResponseDTO(node: DocumentNode, content: string): DocumentResponseDTO {
    return {
      id: node.id,
      type: node.type,
      status: node.status,
      title: node.title,
      lang: node.lang,
      content,
      summary: node.summary ?? null,
      created_at: node.created_at.toISOString(),
      updated_at: node.updated_at.toISOString(),
    };
  }
}

// Export singleton instance
export const documentService = new DocumentService();
