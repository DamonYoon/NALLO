/**
 * Version API Routes
 * REST endpoints for version management
 * Per Constitution Principle I: API routes separated from business logic
 */

import { Router, Request, Response, NextFunction } from 'express';
import { versionService } from '../../services/versionService';
import {
  createVersionSchema,
  updateVersionSchema,
  versionQuerySchema,
  versionIdParamSchema,
} from '../schemas/version';
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
 * POST /api/v1/versions
 * Create a new version
 */
router.post(
  '/',
  validate(createVersionSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createVersionSchema.parse(req.body);
      const version = await versionService.createVersion(input);

      logger.info('Version created via API', { versionId: version.id });

      res.status(201).json(version);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/versions
 * List versions with optional filters
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = versionQuerySchema.parse(req.query);
    const result = await versionService.listVersions(query);

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
 * GET /api/v1/versions/:id
 * Get version by ID
 */
router.get(
  '/:id',
  validate(versionIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = versionIdParamSchema.parse(req.params);
      const version = await versionService.getVersion(id);

      if (!version) {
        throw new AppError(ErrorCode.NOT_FOUND, `Version not found: ${id}`, 404);
      }

      res.status(200).json(version);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/versions/:id
 * Update version by ID
 */
router.put(
  '/:id',
  validate(versionIdParamSchema, 'params'),
  validate(updateVersionSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = versionIdParamSchema.parse(req.params);
      const input = updateVersionSchema.parse(req.body);
      const version = await versionService.updateVersion(id, input);

      if (!version) {
        throw new AppError(ErrorCode.NOT_FOUND, `Version not found: ${id}`, 404);
      }

      logger.info('Version updated via API', { versionId: id });

      res.status(200).json(version);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/versions/:id
 * Delete version by ID
 */
router.delete(
  '/:id',
  validate(versionIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = versionIdParamSchema.parse(req.params);
      const deleted = await versionService.deleteVersion(id);

      if (!deleted) {
        throw new AppError(ErrorCode.NOT_FOUND, `Version not found: ${id}`, 404);
      }

      logger.info('Version deleted via API', { versionId: id });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/versions/:id/navigation
 * Get navigation tree for version
 */
router.get(
  '/:id/navigation',
  validate(versionIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = versionIdParamSchema.parse(req.params);
      const navigation = await versionService.getVersionNavigation(id);

      if (!navigation) {
        throw new AppError(ErrorCode.NOT_FOUND, `Version not found: ${id}`, 404);
      }

      res.status(200).json(navigation);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
