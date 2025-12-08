/**
 * Page API Routes
 * REST endpoints for page management
 * Per Constitution Principle I: API routes separated from business logic
 */

import { Router, Request, Response, NextFunction } from 'express';
import { pageService } from '../../services/pageService';
import {
  createPageSchema,
  updatePageSchema,
  pageQuerySchema,
  pageIdParamSchema,
  linkPageDocumentSchema,
} from '../schemas/page';
import { AppError, ErrorCode } from '../../utils/errors';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * Validation middleware factory
 */
function validate<T>(schema: { parse: (data: unknown) => T }, source: 'body' | 'query' | 'params') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req[source]);
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
 * POST /api/v1/pages
 * Create a new page
 */
router.post(
  '/',
  validate(createPageSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createPageSchema.parse(req.body);
      const page = await pageService.createPage(input);

      logger.info('Page created via API', { pageId: page.id });

      res.status(201).json(page);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/pages
 * List pages with optional filters
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = pageQuerySchema.parse(req.query);
    const result = await pageService.listPages(query);

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
 * GET /api/v1/pages/:id
 * Get page by ID
 */
router.get(
  '/:id',
  validate(pageIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = pageIdParamSchema.parse(req.params);
      const page = await pageService.getPage(id);

      if (!page) {
        throw new AppError(ErrorCode.NOT_FOUND, `Page not found: ${id}`, 404);
      }

      res.status(200).json(page);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/pages/:id
 * Update page by ID
 */
router.put(
  '/:id',
  validate(pageIdParamSchema, 'params'),
  validate(updatePageSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = pageIdParamSchema.parse(req.params);
      const input = updatePageSchema.parse(req.body);
      const page = await pageService.updatePage(id, input);

      if (!page) {
        throw new AppError(ErrorCode.NOT_FOUND, `Page not found: ${id}`, 404);
      }

      logger.info('Page updated via API', { pageId: id });

      res.status(200).json(page);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/pages/:id
 * Delete page by ID
 */
router.delete(
  '/:id',
  validate(pageIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = pageIdParamSchema.parse(req.params);
      const deleted = await pageService.deletePage(id);

      if (!deleted) {
        throw new AppError(ErrorCode.NOT_FOUND, `Page not found: ${id}`, 404);
      }

      logger.info('Page deleted via API', { pageId: id });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/pages/:id/documents
 * Link page to document
 */
router.post(
  '/:id/documents',
  validate(pageIdParamSchema, 'params'),
  validate(linkPageDocumentSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = pageIdParamSchema.parse(req.params);
      const { document_id } = linkPageDocumentSchema.parse(req.body);

      const result = await pageService.linkToDocument(id, document_id);

      if (!result) {
        throw new AppError(ErrorCode.NOT_FOUND, `Page not found: ${id}`, 404);
      }

      logger.info('Page linked to document via API', { pageId: id, documentId: document_id });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
