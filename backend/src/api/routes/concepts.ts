/**
 * Concept API Routes
 * REST endpoints for glossary (concept) management
 * Per Constitution Principle I: API routes separated from business logic
 */

import { Router, Request, Response, NextFunction } from 'express';
import { conceptService } from '../../services/conceptService';
import {
  createConceptSchema,
  updateConceptSchema,
  conceptQuerySchema,
  conceptIdParamSchema,
} from '../schemas/concept';
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
 * POST /api/v1/concepts
 * Create a new concept
 */
router.post(
  '/',
  validate(createConceptSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createConceptSchema.parse(req.body);
      const concept = await conceptService.createConcept(input);

      logger.info('Concept created via API', { conceptId: concept.id });

      res.status(201).json(concept);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/concepts
 * List concepts with optional filters
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = conceptQuerySchema.parse(req.query);
    const result = await conceptService.listConcepts(query);

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
 * GET /api/v1/concepts/:id
 * Get concept by ID
 */
router.get(
  '/:id',
  validate(conceptIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = conceptIdParamSchema.parse(req.params);
      const concept = await conceptService.getConcept(id);

      if (!concept) {
        throw new AppError(ErrorCode.NOT_FOUND, `Concept not found: ${id}`, 404);
      }

      res.status(200).json(concept);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/concepts/:id
 * Update concept by ID
 */
router.put(
  '/:id',
  validate(conceptIdParamSchema, 'params'),
  validate(updateConceptSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = conceptIdParamSchema.parse(req.params);
      const input = updateConceptSchema.parse(req.body);
      const concept = await conceptService.updateConcept(id, input);

      if (!concept) {
        throw new AppError(ErrorCode.NOT_FOUND, `Concept not found: ${id}`, 404);
      }

      logger.info('Concept updated via API', { conceptId: id });

      res.status(200).json(concept);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/concepts/:id
 * Delete concept by ID
 */
router.delete(
  '/:id',
  validate(conceptIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = conceptIdParamSchema.parse(req.params);
      const deleted = await conceptService.deleteConcept(id);

      if (!deleted) {
        throw new AppError(ErrorCode.NOT_FOUND, `Concept not found: ${id}`, 404);
      }

      logger.info('Concept deleted via API', { conceptId: id });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/concepts/:id/documents
 * Get documents using this concept (Impact Analysis)
 */
router.get(
  '/:id/documents',
  validate(conceptIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = conceptIdParamSchema.parse(req.params);
      const result = await conceptService.getConceptImpact(id);

      if (result === null) {
        throw new AppError(ErrorCode.NOT_FOUND, `Concept not found: ${id}`, 404);
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// CONCEPT RELATIONSHIP ENDPOINTS (SUBTYPE_OF, PART_OF, SYNONYM_OF)
// ============================================================================

/**
 * POST /api/v1/concepts/:id/supertypes
 * Link concept as subtype of another concept
 */
router.post(
  '/:id/supertypes',
  validate(conceptIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = conceptIdParamSchema.parse(req.params);
      const { parent_id } = req.body;

      if (!parent_id) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'parent_id is required', 400);
      }

      await conceptService.linkSubtypeOf(id, parent_id);

      res.status(201).json({ message: 'Concept linked as subtype' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/concepts/:id/supertypes
 * Get parent concepts (supertypes)
 */
router.get(
  '/:id/supertypes',
  validate(conceptIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = conceptIdParamSchema.parse(req.params);
      const supertypes = await conceptService.getSupertypes(id);

      res.status(200).json({
        items: supertypes,
        total: supertypes.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/concepts/:id/supertypes/:parentId
 * Unlink concept subtype relationship
 */
router.delete(
  '/:id/supertypes/:parentId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, parentId } = req.params;
      await conceptService.unlinkSubtypeOf(id, parentId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/concepts/:id/subtypes
 * Get child concepts (subtypes)
 */
router.get(
  '/:id/subtypes',
  validate(conceptIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = conceptIdParamSchema.parse(req.params);
      const subtypes = await conceptService.getSubtypes(id);

      res.status(200).json({
        items: subtypes,
        total: subtypes.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/concepts/:id/whole-of
 * Link concept as part of another concept
 */
router.post(
  '/:id/whole-of',
  validate(conceptIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = conceptIdParamSchema.parse(req.params);
      const { whole_id } = req.body;

      if (!whole_id) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'whole_id is required', 400);
      }

      await conceptService.linkPartOf(id, whole_id);

      res.status(201).json({ message: 'Concept linked as part' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/concepts/:id/whole-of
 * Get concepts that this is part of
 */
router.get(
  '/:id/whole-of',
  validate(conceptIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = conceptIdParamSchema.parse(req.params);
      const wholes = await conceptService.getWholeOf(id);

      res.status(200).json({
        items: wholes,
        total: wholes.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/concepts/:id/whole-of/:wholeId
 * Unlink concept part-of relationship
 */
router.delete(
  '/:id/whole-of/:wholeId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, wholeId } = req.params;
      await conceptService.unlinkPartOf(id, wholeId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/concepts/:id/parts
 * Get parts of this concept
 */
router.get(
  '/:id/parts',
  validate(conceptIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = conceptIdParamSchema.parse(req.params);
      const parts = await conceptService.getParts(id);

      res.status(200).json({
        items: parts,
        total: parts.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/concepts/:id/synonyms
 * Link two concepts as synonyms
 */
router.post(
  '/:id/synonyms',
  validate(conceptIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = conceptIdParamSchema.parse(req.params);
      const { synonym_id } = req.body;

      if (!synonym_id) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'synonym_id is required', 400);
      }

      await conceptService.linkSynonymOf(id, synonym_id);

      res.status(201).json({ message: 'Concepts linked as synonyms' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/concepts/:id/synonyms
 * Get synonyms of a concept
 */
router.get(
  '/:id/synonyms',
  validate(conceptIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = conceptIdParamSchema.parse(req.params);
      const synonyms = await conceptService.getSynonyms(id);

      res.status(200).json({
        items: synonyms,
        total: synonyms.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/concepts/:id/synonyms/:synonymId
 * Unlink synonym relationship
 */
router.delete(
  '/:id/synonyms/:synonymId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, synonymId } = req.params;
      await conceptService.unlinkSynonymOf(id, synonymId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
