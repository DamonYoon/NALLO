/**
 * Document Service
 * Handles document CRUD operations across GraphDB and PostgreSQL
 * Per Constitution Principle I: Business logic separated from API routes and database access
 */

import { v4 as uuidv4 } from 'uuid';
import {
  DocumentNode,
  DocumentType,
  DocumentStatus,
  isValidStatusTransition,
} from '../models/graphdb/documentNode';
import { generateStorageKey } from '../models/rdb/documentContent';
import {
  createDocumentNode,
  getDocumentNode,
  updateDocumentNode,
  deleteDocumentNode,
  listDocumentNodes,
} from '../db/graphdb/queries';
import {
  createDocumentContent,
  getDocumentContent,
  updateDocumentContent,
  deleteDocumentContent,
} from '../db/postgres/queries';
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
 * Document Service class
 * Orchestrates operations between GraphDB (metadata) and PostgreSQL (content)
 */
export class DocumentService {
  /**
   * Create a new document
   * 1. Create metadata node in GraphDB
   * 2. Store content in PostgreSQL
   * 3. Return combined document
   */
  async createDocument(input: CreateDocumentRequest): Promise<DocumentResponseDTO> {
    const documentId = uuidv4();
    const storageKey = generateStorageKey(documentId);

    logger.info('Creating document', { documentId, title: input.title, type: input.type });

    try {
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

      // Store content in PostgreSQL
      await createDocumentContent(documentId, input.content, storageKey);

      logger.info('Document created successfully', { documentId });

      return this.toResponseDTO(documentNode, input.content);
    } catch (error) {
      logger.error('Failed to create document', { documentId, error });

      // Attempt rollback: delete from GraphDB if PostgreSQL failed
      try {
        await deleteDocumentNode(documentId);
      } catch (rollbackError) {
        logger.error('Rollback failed', { documentId, rollbackError });
      }

      throw error;
    }
  }

  /**
   * Get document by ID
   * Merges metadata from GraphDB with content from PostgreSQL
   */
  async getDocument(id: string): Promise<DocumentResponseDTO | null> {
    logger.debug('Getting document', { id });

    // Get metadata from GraphDB
    const documentNode = await getDocumentNode(id);

    if (!documentNode) {
      logger.debug('Document not found in GraphDB', { id });
      return null;
    }

    // Get content from PostgreSQL
    const content = await getDocumentContent(id);

    if (!content) {
      logger.warn('Document content not found in PostgreSQL (orphaned metadata)', { id });
      // Return metadata with empty content
      return this.toResponseDTO(documentNode, '');
    }

    return this.toResponseDTO(documentNode, content.content);
  }

  /**
   * Update document
   * Updates metadata in GraphDB and/or content in PostgreSQL
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

    // Update content in PostgreSQL if content changed
    if (input.content) {
      await updateDocumentContent(id, input.content);
    }

    // Get final content
    const content = await getDocumentContent(id);

    logger.info('Document updated successfully', { id });

    return this.toResponseDTO(updatedNode, content?.content ?? '');
  }

  /**
   * Delete document
   * Removes from both GraphDB and PostgreSQL
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
      // Delete from PostgreSQL first (content)
      await deleteDocumentContent(id);

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

    // Get content for each document
    const documentsWithContent = await Promise.all(
      items.map(async node => {
        const content = await getDocumentContent(node.id);
        return this.toResponseDTO(node, content?.content ?? '');
      })
    );

    return {
      items: documentsWithContent,
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
