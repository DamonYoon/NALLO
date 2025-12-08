/**
 * Document API Routes
 * REST endpoints for document management
 * Per Constitution Principle I: API routes separated from business logic
 */

import { Router, Request, Response, NextFunction } from 'express';
import { documentService } from '../../services/documentService';
import {
  createDocumentSchema,
  updateDocumentSchema,
  documentQuerySchema,
  documentIdParamSchema,
} from '../schemas/document';
import { AppError, ErrorCode } from '../../utils/errors';
import { logger } from '../../utils/logger';

const router = Router();

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
router.post('/', validate(createDocumentSchema, 'body'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createDocumentSchema.parse(req.body);
    const document = await documentService.createDocument(input);

    logger.info('Document created via API', { documentId: document.id });

    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
});

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
router.get('/:id', validate(documentIdParamSchema, 'params'), async (req: Request, res: Response, next: NextFunction) => {
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
});

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
router.delete('/:id', validate(documentIdParamSchema, 'params'), async (req: Request, res: Response, next: NextFunction) => {
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
});

export default router;

