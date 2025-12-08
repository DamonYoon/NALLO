/**
 * Storage Service
 * Handles file upload/download operations with MinIO and GraphDB metadata
 *
 * Storage Architecture:
 * - GraphDB: Attachment metadata + Document-Attachment relationships
 * - MinIO: Actual file storage
 */

import crypto from 'crypto';
import {
  uploadFile,
  downloadFile,
  deleteFile,
  getPresignedUrl,
  fileExists,
} from '../db/storage/connection';
import {
  createAttachmentNode,
  getAttachmentNode,
  deleteAttachmentNode,
  listAttachmentNodes,
  linkAttachmentToDocument,
  unlinkAttachmentFromDocument,
  getDocumentAttachments,
} from '../db/graphdb/queries';
import {
  AttachmentNode,
  AttachmentFileType,
  createAttachmentNode as createAttachmentModel,
  validateFile,
} from '../models/graphdb/attachmentNode';
import {
  AttachmentResponse,
  AttachmentListResponse,
  AttachmentQuery,
} from '../api/schemas/attachment';
import { AppError, ErrorCode } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Storage Service class
 * Orchestrates file operations between MinIO (files) and GraphDB (metadata)
 */
export class StorageService {
  /**
   * Upload a file
   */
  async uploadFile(
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
    documentId?: string
  ): Promise<AttachmentResponse> {
    // Validate file
    const validation = validateFile(file.mimetype, file.size);
    if (!validation.valid) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, validation.error!, 400);
    }

    // Calculate checksum
    const checksum = crypto.createHash('md5').update(file.buffer).digest('hex');

    // Create attachment model
    const attachmentModel = createAttachmentModel({
      filename: file.originalname,
      mime_type: file.mimetype,
      size_bytes: file.size,
      checksum,
    });

    logger.info('Uploading file', {
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      storageKey: attachmentModel.storage_key,
    });

    try {
      // Upload to MinIO first
      await uploadFile(attachmentModel.storage_key, file.buffer, file.mimetype);

      // Save metadata to GraphDB
      const attachment = await createAttachmentNode({
        id: attachmentModel.id,
        filename: attachmentModel.filename,
        storage_key: attachmentModel.storage_key,
        mime_type: attachmentModel.mime_type,
        file_type: attachmentModel.file_type,
        size_bytes: attachmentModel.size_bytes,
        checksum: attachmentModel.checksum,
        alt_text: attachmentModel.alt_text,
      });

      // Link to document if provided
      if (documentId) {
        await linkAttachmentToDocument({
          document_id: documentId,
          attachment_id: attachment.id,
        });
      }

      logger.info('File uploaded successfully', { attachmentId: attachment.id, documentId });

      return this.toResponseDTO(attachment, documentId ?? null);
    } catch (error) {
      logger.error('Failed to upload file', { error });

      // Attempt cleanup: delete from MinIO if GraphDB failed
      try {
        await deleteFile(attachmentModel.storage_key);
      } catch (cleanupError) {
        logger.error('Cleanup failed', { cleanupError });
      }

      throw error;
    }
  }

  /**
   * Get attachment metadata by ID
   */
  async getAttachment(id: string, includeDownloadUrl = false): Promise<AttachmentResponse | null> {
    const result = await getAttachmentNode(id);

    if (!result) {
      return null;
    }

    const response = this.toResponseDTO(result.attachment, result.document_id);

    if (includeDownloadUrl) {
      response.download_url = await getPresignedUrl(result.attachment.storage_key, 3600);
    }

    return response;
  }

  /**
   * Download file content
   */
  async downloadFile(
    id: string
  ): Promise<{ buffer: Buffer; attachment: AttachmentResponse } | null> {
    const result = await getAttachmentNode(id);

    if (!result) {
      return null;
    }

    // Check if file exists in MinIO
    const exists = await fileExists(result.attachment.storage_key);
    if (!exists) {
      logger.warn('File not found in storage', {
        id,
        storageKey: result.attachment.storage_key,
      });
      throw new AppError(ErrorCode.NOT_FOUND, 'File not found in storage', 404);
    }

    const buffer = await downloadFile(result.attachment.storage_key);
    const attachment = this.toResponseDTO(result.attachment, result.document_id);

    return { buffer, attachment };
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(id: string): Promise<boolean> {
    const result = await getAttachmentNode(id);

    if (!result) {
      return false;
    }

    logger.info('Deleting attachment', {
      id,
      storageKey: result.attachment.storage_key,
    });

    try {
      // Delete from MinIO first
      try {
        await deleteFile(result.attachment.storage_key);
      } catch (minioError) {
        logger.warn('Failed to delete file from MinIO (may not exist)', { id, error: minioError });
      }

      // Delete metadata from GraphDB (also removes relationships)
      await deleteAttachmentNode(id);

      logger.info('Attachment deleted successfully', { id });
      return true;
    } catch (error) {
      logger.error('Failed to delete attachment', { id, error });
      throw error;
    }
  }

  /**
   * List attachments with optional filters
   */
  async listAttachments(query: AttachmentQuery): Promise<AttachmentListResponse> {
    const { items, total } = await listAttachmentNodes({
      document_id: query.document_id,
      file_type: query.attachment_type as AttachmentFileType | undefined,
      limit: query.limit,
      offset: query.offset,
    });

    return {
      items: items.map(item => this.toResponseDTO(item, item.document_id)),
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }

  /**
   * Get attachments for a document
   */
  async getAttachmentsByDocument(documentId: string): Promise<AttachmentResponse[]> {
    const attachments = await getDocumentAttachments(documentId);
    return attachments.map(att => this.toResponseDTO(att, documentId));
  }

  /**
   * Link existing attachment to a document
   */
  async linkToDocument(
    attachmentId: string,
    documentId: string,
    options?: { order?: number; caption?: string }
  ): Promise<boolean> {
    return linkAttachmentToDocument({
      attachment_id: attachmentId,
      document_id: documentId,
      order: options?.order,
      caption: options?.caption,
    });
  }

  /**
   * Unlink attachment from a document
   */
  async unlinkFromDocument(attachmentId: string, documentId: string): Promise<boolean> {
    return unlinkAttachmentFromDocument(documentId, attachmentId);
  }

  /**
   * Convert AttachmentNode to response DTO
   */
  private toResponseDTO(attachment: AttachmentNode, documentId: string | null): AttachmentResponse {
    return {
      id: attachment.id,
      document_id: documentId,
      filename: attachment.filename,
      storage_path: attachment.storage_key,
      mime_type: attachment.mime_type,
      attachment_type: attachment.file_type,
      size_bytes: attachment.size_bytes,
      checksum: attachment.checksum,
      created_at: attachment.created_at.toISOString(),
      updated_at: attachment.updated_at.toISOString(),
    };
  }
}

// Export singleton instance
export const storageService = new StorageService();
