/**
 * Search API Routes
 * REST API endpoints for document search
 */

import { Router, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { SearchQuerySchema, SearchResponse } from '../schemas/search';
import { searchService } from '../../services/searchService';
import { AppError, ErrorCode } from '../../utils/errors';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * GET /api/v1/search
 * Search documents by query, version, and tags
 */
router.get(
  '/',
  async (req: Request, res: Response<SearchResponse | { error: unknown }>, next: NextFunction) => {
    try {
      // Validate query parameters
      const validationResult = SearchQuerySchema.safeParse(req.query);

      if (!validationResult.success) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid search parameters', 400, {
          details: JSON.stringify(validationResult.error.errors),
        });
      }

      const params = validationResult.data;

      logger.info('Search request', {
        query: params.query,
        version_id: params.version_id,
        tags: params.tags,
        limit: params.limit,
        offset: params.offset,
      });

      // Execute search
      const result = await searchService.search(params);

      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid search parameters', 400, {
            details: JSON.stringify(error.errors),
          })
        );
      }
      next(error);
    }
  }
);

export { router as searchRouter };
