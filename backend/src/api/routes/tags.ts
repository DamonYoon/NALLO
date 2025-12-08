/**
 * Tags API Routes
 *
 * REST API endpoints for Tag management and HAS_TAG relationships
 *
 * Endpoints:
 * - POST   /api/v1/tags - Create tag
 * - GET    /api/v1/tags - List tags
 * - GET    /api/v1/tags/:id - Get tag by ID
 * - PUT    /api/v1/tags/:id - Update tag
 * - DELETE /api/v1/tags/:id - Delete tag
 * - GET    /api/v1/tags/:id/entities - Get entities with tag
 *
 * HAS_TAG relationship endpoints on other resources:
 * - POST   /api/v1/documents/:id/tags - Add tag to document
 * - DELETE /api/v1/documents/:id/tags/:tagId - Remove tag from document
 * - GET    /api/v1/documents/:id/tags - Get tags for document
 * - (Similar for concepts and pages)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { tagService } from '../../services/tagService';
import { CreateTagRequest, UpdateTagRequest, TagQuery } from '../schemas/tag';
import { AppError, ErrorCode } from '../../utils/errors';

const router = Router();

/**
 * POST /api/v1/tags
 * Create a new tag
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = CreateTagRequest.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        `Validation failed: ${parseResult.error.errors.map(e => e.message).join(', ')}`,
        400
      );
    }

    const tag = await tagService.createTag(parseResult.data);

    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tags
 * List tags with pagination and search
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = TagQuery.safeParse(req.query);
    if (!parseResult.success) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        `Validation failed: ${parseResult.error.errors.map(e => e.message).join(', ')}`,
        400
      );
    }

    const result = await tagService.listTags(parseResult.data);

    res.status(200).json({
      items: result.items,
      total: result.total,
      limit: parseResult.data.limit,
      offset: parseResult.data.offset,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tags/:id
 * Get tag by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const tag = await tagService.getTag(id);

    res.status(200).json(tag);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/tags/:id
 * Update tag
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const parseResult = UpdateTagRequest.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        `Validation failed: ${parseResult.error.errors.map(e => e.message).join(', ')}`,
        400
      );
    }

    const tag = await tagService.updateTag(id, parseResult.data);

    res.status(200).json(tag);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/tags/:id
 * Delete tag
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await tagService.deleteTag(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tags/:id/entities
 * Get all entities (documents, concepts, pages) with this tag
 */
router.get('/:id/entities', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const entities = await tagService.getEntitiesWithTag(id);

    res.status(200).json({
      items: entities,
      total: entities.length,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// HAS_TAG RELATIONSHIP ROUTES FOR DOCUMENTS
// These are mounted at /api/v1/documents/:documentId/tags
// ============================================================================

export const documentTagsRouter = Router({ mergeParams: true });

/**
 * POST /api/v1/documents/:documentId/tags
 * Add tag to document
 */
documentTagsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId } = req.params;
    const { tag_id } = req.body;

    if (!tag_id) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'tag_id is required', 400);
    }

    await tagService.linkDocumentToTag(documentId, tag_id);

    res.status(201).json({ message: 'Tag added to document' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/documents/:documentId/tags
 * Get tags for document
 */
documentTagsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId } = req.params;

    const tags = await tagService.getTagsForDocument(documentId);

    res.status(200).json({
      items: tags,
      total: tags.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/documents/:documentId/tags/:tagId
 * Remove tag from document
 */
documentTagsRouter.delete('/:tagId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId, tagId } = req.params;

    await tagService.unlinkDocumentFromTag(documentId, tagId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// HAS_TAG RELATIONSHIP ROUTES FOR CONCEPTS
// These are mounted at /api/v1/concepts/:conceptId/tags
// ============================================================================

export const conceptTagsRouter = Router({ mergeParams: true });

/**
 * POST /api/v1/concepts/:conceptId/tags
 * Add tag to concept
 */
conceptTagsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conceptId } = req.params;
    const { tag_id } = req.body;

    if (!tag_id) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'tag_id is required', 400);
    }

    await tagService.linkConceptToTag(conceptId, tag_id);

    res.status(201).json({ message: 'Tag added to concept' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/concepts/:conceptId/tags
 * Get tags for concept
 */
conceptTagsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conceptId } = req.params;

    const tags = await tagService.getTagsForConcept(conceptId);

    res.status(200).json({
      items: tags,
      total: tags.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/concepts/:conceptId/tags/:tagId
 * Remove tag from concept
 */
conceptTagsRouter.delete('/:tagId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conceptId, tagId } = req.params;

    await tagService.unlinkConceptFromTag(conceptId, tagId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// HAS_TAG RELATIONSHIP ROUTES FOR PAGES
// These are mounted at /api/v1/pages/:pageId/tags
// ============================================================================

export const pageTagsRouter = Router({ mergeParams: true });

/**
 * POST /api/v1/pages/:pageId/tags
 * Add tag to page
 */
pageTagsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageId } = req.params;
    const { tag_id } = req.body;

    if (!tag_id) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'tag_id is required', 400);
    }

    await tagService.linkPageToTag(pageId, tag_id);

    res.status(201).json({ message: 'Tag added to page' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/pages/:pageId/tags
 * Get tags for page
 */
pageTagsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageId } = req.params;

    const tags = await tagService.getTagsForPage(pageId);

    res.status(200).json({
      items: tags,
      total: tags.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/pages/:pageId/tags/:tagId
 * Remove tag from page
 */
pageTagsRouter.delete('/:tagId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageId, tagId } = req.params;

    await tagService.unlinkPageFromTag(pageId, tagId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
