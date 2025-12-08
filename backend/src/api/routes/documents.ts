/**
 * Document API Routes
 * REST endpoints for document management
 * Per Constitution Principle I: API routes separated from business logic
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { documentService } from '../../services/documentService';
import {
  createDocumentSchema,
  updateDocumentSchema,
  documentQuerySchema,
  documentIdParamSchema,
  importDocumentSchema,
  SUPPORTED_IMPORT_EXTENSIONS,
} from '../schemas/document';
import { AppError, ErrorCode } from '../../utils/errors';
import { logger } from '../../utils/logger';

const router = Router();

// Configure multer for file upload (memory storage for processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const ext = '.' + file.originalname.split('.').pop()?.toLowerCase();
    if (SUPPORTED_IMPORT_EXTENSIONS.includes(ext as (typeof SUPPORTED_IMPORT_EXTENSIONS)[number])) {
      cb(null, true);
    } else {
      // Create error with custom code for handling
      const error = new Error(
        `Unsupported file format: ${ext}. Supported: ${SUPPORTED_IMPORT_EXTENSIONS.join(', ')}`
      );
      (error as Error & { code: string }).code = 'UNSUPPORTED_FILE_FORMAT';
      cb(error);
    }
  },
});

/**
 * Multer error handling middleware wrapper
 */
function handleMulterUpload(fieldName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadMiddleware = upload.single(fieldName);
    uploadMiddleware(req, res, (err: unknown) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(
              new AppError(ErrorCode.VALIDATION_ERROR, 'File size exceeds 10MB limit', 400)
            );
          }
          return next(new AppError(ErrorCode.VALIDATION_ERROR, err.message, 400));
        }
        if (err instanceof Error) {
          return next(new AppError(ErrorCode.VALIDATION_ERROR, err.message, 400));
        }
        return next(err);
      }
      next();
    });
  };
}

/**
 * Validation middleware factory
 */
function validate<T>(schema: { parse: (data: unknown) => T }, source: 'body' | 'query' | 'params') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      schema.parse(data);
      next();
    } catch (error) {
      next(
        new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Validation failed',
          400,
          error instanceof Error ? { details: error.message } : undefined
        )
      );
    }
  };
}

/**
 * POST /api/v1/documents
 * Create a new document
 */
router.post(
  '/',
  validate(createDocumentSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createDocumentSchema.parse(req.body);
      const document = await documentService.createDocument(input);

      logger.info('Document created via API', { documentId: document.id });

      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/documents
 * List documents with optional filters
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = documentQuerySchema.parse(req.query);
    const result = await documentService.listDocuments(query);

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
 * GET /api/v1/documents/:id
 * Get document by ID
 */
router.get(
  '/:id',
  validate(documentIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = documentIdParamSchema.parse(req.params);
      const document = await documentService.getDocument(id);

      if (!document) {
        throw new AppError(ErrorCode.NOT_FOUND, `Document not found: ${id}`, 404);
      }

      res.status(200).json(document);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/documents/:id
 * Update document by ID
 */
router.put(
  '/:id',
  validate(documentIdParamSchema, 'params'),
  validate(updateDocumentSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = documentIdParamSchema.parse(req.params);
      const input = updateDocumentSchema.parse(req.body);
      const document = await documentService.updateDocument(id, input);

      if (!document) {
        throw new AppError(ErrorCode.NOT_FOUND, `Document not found: ${id}`, 404);
      }

      logger.info('Document updated via API', { documentId: id });

      res.status(200).json(document);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/documents/:id
 * Delete document by ID
 */
router.delete(
  '/:id',
  validate(documentIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = documentIdParamSchema.parse(req.params);
      const deleted = await documentService.deleteDocument(id);

      if (!deleted) {
        throw new AppError(ErrorCode.NOT_FOUND, `Document not found: ${id}`, 404);
      }

      logger.info('Document deleted via API', { documentId: id });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/documents/import
 * Import document from markdown or OAS file
 */
router.post(
  '/import',
  handleMulterUpload('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate file presence
      if (!req.file) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'File is required', 400);
      }

      // Validate and parse form fields
      const input = importDocumentSchema.parse({
        type: req.body.type,
        version_id: req.body.version_id || undefined,
      });

      const document = await documentService.importDocument(req.file, input);

      logger.info('Document imported via API', {
        documentId: document.id,
        filename: req.file.originalname,
      });

      res.status(201).json(document);
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        next(new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid import parameters', 400));
        return;
      }
      next(error);
    }
  }
);

// ============================================================================
// DOCUMENT RELATIONSHIP ENDPOINTS (LINKS_TO, WORKING_COPY_OF)
// ============================================================================

/**
 * POST /api/v1/documents/:id/links
 * Link document to another document
 */
router.post(
  '/:id/links',
  validate(documentIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = documentIdParamSchema.parse(req.params);
      const { target_id } = req.body;

      if (!target_id) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'target_id is required', 400);
      }

      await documentService.linkToDocument(id, target_id);

      res.status(201).json({ message: 'Document linked' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/documents/:id/links
 * Get documents that this document links to
 */
router.get(
  '/:id/links',
  validate(documentIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = documentIdParamSchema.parse(req.params);
      const linkedDocs = await documentService.getLinkedDocuments(id);

      res.status(200).json({
        items: linkedDocs,
        total: linkedDocs.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/documents/:id/links/:targetId
 * Unlink document from another document
 */
router.delete('/:id/links/:targetId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, targetId } = req.params;
    await documentService.unlinkFromDocument(id, targetId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/documents/:id/backlinks
 * Get documents that link to this document
 */
router.get(
  '/:id/backlinks',
  validate(documentIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = documentIdParamSchema.parse(req.params);
      const linkingDocs = await documentService.getLinkingDocuments(id);

      res.status(200).json({
        items: linkingDocs,
        total: linkingDocs.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/documents/:id/working-copy
 * Mark this document as a working copy of another document
 */
router.post(
  '/:id/working-copy',
  validate(documentIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = documentIdParamSchema.parse(req.params);
      const { original_id } = req.body;

      if (!original_id) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'original_id is required', 400);
      }

      await documentService.createWorkingCopy(id, original_id);

      res.status(201).json({ message: 'Working copy relationship created' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/documents/:id/original
 * Get the original document of a working copy
 */
router.get(
  '/:id/original',
  validate(documentIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = documentIdParamSchema.parse(req.params);
      const original = await documentService.getOriginalDocument(id);

      if (!original) {
        res.status(200).json({ original: null });
        return;
      }

      res.status(200).json({ original });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/documents/:id/working-copy/:originalId
 * Remove working copy relationship
 */
router.delete(
  '/:id/working-copy/:originalId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, originalId } = req.params;
      await documentService.removeWorkingCopy(id, originalId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/documents/:id/working-copies
 * Get all working copies of this document
 */
router.get(
  '/:id/working-copies',
  validate(documentIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = documentIdParamSchema.parse(req.params);
      const copies = await documentService.getWorkingCopies(id);

      res.status(200).json({
        items: copies,
        total: copies.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
