/**
 * Storage Service
 * Handles file upload/download operations with MinIO and PostgreSQL metadata
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
  createAttachment as createAttachmentRecord,
  getAttachment as getAttachmentRecord,
  listAttachments as listAttachmentsRecord,
  deleteAttachment as deleteAttachmentRecord,
  getAttachmentsByDocumentId,
  deleteAttachmentsByDocumentId,
} from '../db/postgres/queries';
import {
  Attachment,
  createAttachment,
  validateFile,
  AttachmentType,
} from '../models/rdb/attachment';
import {
  AttachmentResponse,
  AttachmentListResponse,
  AttachmentQuery,
} from '../api/schemas/attachment';
import { AppError, ErrorCode } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Storage Service class
 * Orchestrates file operations between MinIO (files) and PostgreSQL (metadata)
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

    // Create attachment metadata
    const attachment = createAttachment({
      document_id: documentId ?? null,
      filename: file.originalname,
      mime_type: file.mimetype,
      size_bytes: file.size,
      checksum,
    });

    logger.info('Uploading file', {
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      storagePath: attachment.storage_path,
    });

    try {
      // Upload to MinIO
      await uploadFile(attachment.storage_path, file.buffer, file.mimetype);

      // Save metadata to PostgreSQL
      await createAttachmentRecord(
        attachment.id,
        attachment.document_id,
        attachment.filename,
        attachment.storage_path,
        attachment.mime_type,
        attachment.attachment_type,
        attachment.size_bytes,
        attachment.checksum
      );

      logger.info('File uploaded successfully', { attachmentId: attachment.id });

      return this.toResponseDTO(attachment);
    } catch (error) {
      logger.error('Failed to upload file', { error });

      // Attempt cleanup: delete from MinIO if PostgreSQL failed
      try {
        await deleteFile(attachment.storage_path);
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
    const record = await getAttachmentRecord(id);

    if (!record) {
      return null;
    }

    const response = this.recordToResponseDTO(record);

    if (includeDownloadUrl) {
      response.download_url = await getPresignedUrl(record.storage_path, 3600);
    }

    return response;
  }

  /**
   * Download file content
   */
  async downloadFile(
    id: string
  ): Promise<{ buffer: Buffer; attachment: AttachmentResponse } | null> {
    const record = await getAttachmentRecord(id);

    if (!record) {
      return null;
    }

    // Check if file exists in MinIO
    const exists = await fileExists(record.storage_path);
    if (!exists) {
      logger.warn('File not found in storage', { id, storagePath: record.storage_path });
      throw new AppError(ErrorCode.NOT_FOUND, 'File not found in storage', 404);
    }

    const buffer = await downloadFile(record.storage_path);
    const attachment = this.recordToResponseDTO(record);

    return { buffer, attachment };
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(id: string): Promise<boolean> {
    const record = await getAttachmentRecord(id);

    if (!record) {
      return false;
    }

    logger.info('Deleting attachment', { id, storagePath: record.storage_path });

    try {
      // Delete from MinIO
      await deleteFile(record.storage_path);

      // Delete metadata from PostgreSQL
      await deleteAttachmentRecord(id);

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
    const { items, total } = await listAttachmentsRecord({
      documentId: query.document_id,
      attachmentType: query.attachment_type,
      limit: query.limit,
      offset: query.offset,
    });

    return {
      items: items.map(record => this.recordToResponseDTO(record)),
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }

  /**
   * Get attachments for a document
   */
  async getAttachmentsByDocument(documentId: string): Promise<AttachmentResponse[]> {
    const records = await getAttachmentsByDocumentId(documentId);
    return records.map(record => this.recordToResponseDTO(record));
  }

  /**
   * Delete all attachments for a document
   */
  async deleteAttachmentsByDocument(documentId: string): Promise<number> {
    const storagePaths = await deleteAttachmentsByDocumentId(documentId);

    // Delete files from MinIO
    let deletedCount = 0;
    for (const storagePath of storagePaths) {
      try {
        await deleteFile(storagePath);
        deletedCount++;
      } catch (error) {
        logger.error('Failed to delete file from storage', { storagePath, error });
      }
    }

    logger.info('Deleted attachments for document', { documentId, count: deletedCount });
    return deletedCount;
  }

  /**
   * Convert Attachment model to response DTO
   */
  private toResponseDTO(attachment: Attachment): AttachmentResponse {
    return {
      id: attachment.id,
      document_id: attachment.document_id,
      filename: attachment.filename,
      storage_path: attachment.storage_path,
      mime_type: attachment.mime_type,
      attachment_type: attachment.attachment_type,
      size_bytes: attachment.size_bytes,
      checksum: attachment.checksum,
      created_at: attachment.created_at.toISOString(),
      updated_at: attachment.updated_at.toISOString(),
    };
  }

  /**
   * Convert database record to response DTO
   */
  private recordToResponseDTO(record: {
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
  }): AttachmentResponse {
    return {
      id: record.id,
      document_id: record.document_id,
      filename: record.filename,
      storage_path: record.storage_path,
      mime_type: record.mime_type,
      attachment_type: record.attachment_type as AttachmentType,
      size_bytes: record.size_bytes,
      checksum: record.checksum,
      created_at: record.created_at.toISOString(),
      updated_at: record.updated_at.toISOString(),
    };
  }
}

// Export singleton instance
export const storageService = new StorageService();
