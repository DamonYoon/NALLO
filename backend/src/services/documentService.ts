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
  linkDocumentToDocument,
  unlinkDocumentFromDocument,
  getLinkedDocuments,
  getLinkingDocuments,
  createWorkingCopy,
  removeWorkingCopy,
  getOriginalDocument,
  getWorkingCopies,
} from '../db/graphdb/queries';
import { uploadFile, downloadFile, deleteFile, fileExists } from '../db/storage/connection';
import {
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentQuery,
  DocumentListResponse,
  ImportDocumentRequest,
  SUPPORTED_IMPORT_EXTENSIONS,
} from '../api/schemas/document';
import { AppError, ErrorCode } from '../utils/errors';
import { logger } from '../utils/logger';
import path from 'path';

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
   * Import document from file (markdown or OAS)
   * Parses file content and creates document with extracted metadata
   */
  async importDocument(
    file: Express.Multer.File,
    input: ImportDocumentRequest
  ): Promise<DocumentResponseDTO> {
    const ext = path.extname(file.originalname).toLowerCase();

    // Validate file extension
    if (
      !SUPPORTED_IMPORT_EXTENSIONS.includes(ext as (typeof SUPPORTED_IMPORT_EXTENSIONS)[number])
    ) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        `Unsupported file format: ${ext}. Supported formats: ${SUPPORTED_IMPORT_EXTENSIONS.join(', ')}`,
        400
      );
    }

    logger.info('Importing document from file', {
      filename: file.originalname,
      size: file.size,
      type: input.type,
    });

    // Extract content from file
    const content = file.buffer.toString('utf-8');

    // Extract title from content
    const title = this.extractTitleFromContent(content, ext, file.originalname);

    // Detect language (default to 'en' if not detected)
    const lang = this.detectLanguage(content);

    // Create document using extracted data
    return this.createDocument({
      title,
      type: input.type,
      content,
      lang,
    });
  }

  /**
   * Extract title from document content
   */
  private extractTitleFromContent(content: string, extension: string, filename: string): string {
    // For markdown files, try to extract first heading
    if (['.md', '.markdown'].includes(extension)) {
      const headingMatch = content.match(/^#\s+(.+)$/m);
      if (headingMatch) {
        return headingMatch[1].trim();
      }
    }

    // For YAML/JSON (OpenAPI), try to extract info.title
    if (['.yaml', '.yml', '.json'].includes(extension)) {
      // Simple regex for YAML title
      const titleMatch = content.match(/title:\s*['"]?([^'"\n]+)['"]?/);
      if (titleMatch) {
        return titleMatch[1].trim();
      }

      // Simple regex for JSON title
      const jsonTitleMatch = content.match(/"title"\s*:\s*"([^"]+)"/);
      if (jsonTitleMatch) {
        return jsonTitleMatch[1].trim();
      }
    }

    // Fallback to filename without extension
    return path.basename(filename, extension);
  }

  /**
   * Simple language detection from content
   * Returns ISO 639-1 code
   */
  private detectLanguage(content: string): string {
    // Simple heuristic: check for Korean characters
    const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;
    if (koreanRegex.test(content)) {
      return 'ko';
    }

    // Check for Japanese characters
    const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    if (japaneseRegex.test(content)) {
      return 'ja';
    }

    // Check for Chinese characters (simplified)
    const chineseRegex = /[\u4E00-\u9FFF]/;
    if (chineseRegex.test(content) && !japaneseRegex.test(content)) {
      return 'zh';
    }

    // Default to English
    return 'en';
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

  // ============================================================================
  // DOCUMENT RELATIONSHIP METHODS (LINKS_TO, WORKING_COPY_OF)
  // ============================================================================

  /**
   * Link document to another document
   * Creates LINKS_TO relationship
   */
  async linkToDocument(sourceId: string, targetId: string): Promise<void> {
    logger.info('Linking document to document', { sourceId, targetId });

    // Verify source document exists
    const source = await getDocumentNode(sourceId);
    if (!source) {
      throw new AppError(ErrorCode.NOT_FOUND, `Source document with id '${sourceId}' not found`);
    }

    // Verify target document exists
    const target = await getDocumentNode(targetId);
    if (!target) {
      throw new AppError(ErrorCode.NOT_FOUND, `Target document with id '${targetId}' not found`);
    }

    // Prevent self-referencing
    if (sourceId === targetId) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Cannot link document to itself');
    }

    await linkDocumentToDocument(sourceId, targetId);
    logger.info('Document linked to document', { sourceId, targetId });
  }

  /**
   * Unlink document from another document
   * Removes LINKS_TO relationship
   */
  async unlinkFromDocument(sourceId: string, targetId: string): Promise<void> {
    logger.info('Unlinking document from document', { sourceId, targetId });

    const unlinked = await unlinkDocumentFromDocument(sourceId, targetId);
    if (!unlinked) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Link from document '${sourceId}' to '${targetId}' not found`
      );
    }

    logger.info('Document unlinked from document', { sourceId, targetId });
  }

  /**
   * Get documents that this document links to
   */
  async getLinkedDocuments(documentId: string): Promise<DocumentResponseDTO[]> {
    logger.debug('Getting linked documents', { documentId });

    // Verify document exists
    const document = await getDocumentNode(documentId);
    if (!document) {
      throw new AppError(ErrorCode.NOT_FOUND, `Document with id '${documentId}' not found`);
    }

    const linkedDocs = await getLinkedDocuments(documentId);
    // Return documents without content for performance
    return linkedDocs.map(node => this.toResponseDTO(node, ''));
  }

  /**
   * Get documents that link to this document (backlinks)
   */
  async getLinkingDocuments(documentId: string): Promise<DocumentResponseDTO[]> {
    logger.debug('Getting linking documents (backlinks)', { documentId });

    // Verify document exists
    const document = await getDocumentNode(documentId);
    if (!document) {
      throw new AppError(ErrorCode.NOT_FOUND, `Document with id '${documentId}' not found`);
    }

    const linkingDocs = await getLinkingDocuments(documentId);
    // Return documents without content for performance
    return linkingDocs.map(node => this.toResponseDTO(node, ''));
  }

  /**
   * Create working copy relationship
   * Links a copy document to its original
   */
  async createWorkingCopy(copyId: string, originalId: string): Promise<void> {
    logger.info('Creating working copy relationship', { copyId, originalId });

    // Verify copy document exists
    const copy = await getDocumentNode(copyId);
    if (!copy) {
      throw new AppError(ErrorCode.NOT_FOUND, `Copy document with id '${copyId}' not found`);
    }

    // Verify original document exists
    const original = await getDocumentNode(originalId);
    if (!original) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Original document with id '${originalId}' not found`
      );
    }

    // Prevent self-referencing
    if (copyId === originalId) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Cannot create working copy of itself');
    }

    await createWorkingCopy(copyId, originalId);
    logger.info('Working copy relationship created', { copyId, originalId });
  }

  /**
   * Remove working copy relationship
   */
  async removeWorkingCopy(copyId: string, originalId: string): Promise<void> {
    logger.info('Removing working copy relationship', { copyId, originalId });

    const removed = await removeWorkingCopy(copyId, originalId);
    if (!removed) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Working copy relationship from '${copyId}' to '${originalId}' not found`
      );
    }

    logger.info('Working copy relationship removed', { copyId, originalId });
  }

  /**
   * Get original document of a working copy
   */
  async getOriginalDocument(documentId: string): Promise<DocumentResponseDTO | null> {
    logger.debug('Getting original document', { documentId });

    // Verify document exists
    const document = await getDocumentNode(documentId);
    if (!document) {
      throw new AppError(ErrorCode.NOT_FOUND, `Document with id '${documentId}' not found`);
    }

    const original = await getOriginalDocument(documentId);
    if (!original) {
      return null;
    }

    // Return document without content for performance
    return this.toResponseDTO(original, '');
  }

  /**
   * Get working copies of a document
   */
  async getWorkingCopies(documentId: string): Promise<DocumentResponseDTO[]> {
    logger.debug('Getting working copies', { documentId });

    // Verify document exists
    const document = await getDocumentNode(documentId);
    if (!document) {
      throw new AppError(ErrorCode.NOT_FOUND, `Document with id '${documentId}' not found`);
    }

    const copies = await getWorkingCopies(documentId);
    // Return documents without content for performance
    return copies.map(node => this.toResponseDTO(node, ''));
  }
}

// Export singleton instance
export const documentService = new DocumentService();
