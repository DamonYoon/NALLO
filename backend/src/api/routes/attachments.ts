/**
 * Attachment API Routes
 * REST endpoints for file upload/download management
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { storageService } from '../../services/storageService';
import {
  attachmentQuerySchema,
  attachmentIdParamSchema,
  uploadAttachmentSchema,
  linkAttachmentSchema,
  FILE_VALIDATION,
} from '../schemas/attachment';
import { AppError, ErrorCode } from '../../utils/errors';
import { logger } from '../../utils/logger';

const router = Router();

// Configure multer for file uploads (memory storage for processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: FILE_VALIDATION.maxFileSize,
  },
  fileFilter: (_req, file, cb) => {
    if (
      FILE_VALIDATION.allowedMimeTypes.includes(
        file.mimetype as (typeof FILE_VALIDATION.allowedMimeTypes)[number]
      )
    ) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  },
});

/**
 * POST /api/v1/attachments
 * Upload a new file
 */
router.post('/', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'No file provided', 400);
    }

    // Parse optional metadata
    const metadata = uploadAttachmentSchema.safeParse(req.body);
    const documentId = metadata.success ? metadata.data.document_id : undefined;

    const attachment = await storageService.uploadFile(
      {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      documentId
    );

    logger.info('File uploaded via API', { attachmentId: attachment.id });

    res.status(201).json(attachment);
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        next(
          new AppError(
            ErrorCode.VALIDATION_ERROR,
            `File too large. Maximum size: ${FILE_VALIDATION.maxFileSizeMB}MB`,
            400
          )
        );
      } else {
        next(new AppError(ErrorCode.VALIDATION_ERROR, error.message, 400));
      }
    } else {
      next(error);
    }
  }
});

/**
 * GET /api/v1/attachments
 * List attachments with optional filters
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = attachmentQuerySchema.parse(req.query);
    const result = await storageService.listAttachments(query);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      next(new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid query parameters', 400));
    } else {
      next(error);
    }
  }
});

/**
 * GET /api/v1/attachments/:id
 * Get attachment metadata by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = attachmentIdParamSchema.parse(req.params);
    const includeDownloadUrl = req.query.include_download_url === 'true';

    const attachment = await storageService.getAttachment(id, includeDownloadUrl);

    if (!attachment) {
      throw new AppError(ErrorCode.NOT_FOUND, `Attachment not found: ${id}`, 404);
    }

    res.status(200).json(attachment);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/attachments/:id/download
 * Download file content
 */
router.get('/:id/download', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = attachmentIdParamSchema.parse(req.params);

    const result = await storageService.downloadFile(id);

    if (!result) {
      throw new AppError(ErrorCode.NOT_FOUND, `Attachment not found: ${id}`, 404);
    }

    // Set response headers
    res.setHeader('Content-Type', result.attachment.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${result.attachment.filename}"`);
    res.setHeader('Content-Length', result.buffer.length);

    res.send(result.buffer);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/attachments/:id
 * Delete attachment
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = attachmentIdParamSchema.parse(req.params);

    const deleted = await storageService.deleteAttachment(id);

    if (!deleted) {
      throw new AppError(ErrorCode.NOT_FOUND, `Attachment not found: ${id}`, 404);
    }

    logger.info('Attachment deleted via API', { attachmentId: id });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/attachments/validation-rules
 * Get file validation rules for client-side validation
 */
router.get('/validation-rules', (_req: Request, res: Response) => {
  res.status(200).json({
    allowed_mime_types: FILE_VALIDATION.allowedMimeTypes,
    max_file_size_bytes: FILE_VALIDATION.maxFileSize,
    max_file_size_mb: FILE_VALIDATION.maxFileSizeMB,
  });
});

/**
 * POST /api/v1/attachments/:id/link
 * Link attachment to a document
 */
router.post('/:id/link', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = attachmentIdParamSchema.parse(req.params);
    const { document_id, order, caption } = linkAttachmentSchema.parse(req.body);

    // Check if attachment exists
    const attachment = await storageService.getAttachment(id);
    if (!attachment) {
      throw new AppError(ErrorCode.NOT_FOUND, `Attachment not found: ${id}`, 404);
    }

    const linked = await storageService.linkToDocument(id, document_id, { order, caption });

    if (!linked) {
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 'Failed to link attachment', 500);
    }

    logger.info('Attachment linked to document', { attachmentId: id, documentId: document_id });

    res
      .status(200)
      .json({ message: 'Attachment linked successfully', attachment_id: id, document_id });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/attachments/:id/link/:documentId
 * Unlink attachment from a document
 */
router.delete('/:id/link/:documentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = attachmentIdParamSchema.parse(req.params);
    const documentId = req.params.documentId;

    // Validate document_id format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(documentId)
    ) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid document ID format', 400);
    }

    const unlinked = await storageService.unlinkFromDocument(id, documentId);

    if (!unlinked) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Link not found', 404);
    }

    logger.info('Attachment unlinked from document', { attachmentId: id, documentId });

    res.status(200).json({
      message: 'Attachment unlinked successfully',
      attachment_id: id,
      document_id: documentId,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
