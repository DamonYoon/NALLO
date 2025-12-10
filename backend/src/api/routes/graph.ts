/**
 * Graph API Routes
 * REST endpoints for graph visualization data
 * Per Constitution Principle I: API routes separated from business logic
 */

import { Router, Request, Response, NextFunction } from 'express';
import { graphService } from '../../services/graphService';
import {
  graphNodesQuerySchema,
  graphEdgesQuerySchema,
  graphNodeIdParamSchema,
} from '../schemas/graph';
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
 * GET /api/v1/graph/nodes
 * Get all graph nodes with optional type filter
 */
router.get('/nodes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = graphNodesQuerySchema.parse(req.query);
    const result = await graphService.listNodes(query);

    logger.info('Graph nodes fetched', { 
      type: query.type, 
      count: result.items.length,
      total: result.total 
    });

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
 * GET /api/v1/graph/edges
 * Get all graph edges with optional type filter
 */
router.get('/edges', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = graphEdgesQuerySchema.parse(req.query);
    const result = await graphService.listEdges(query);

    logger.info('Graph edges fetched', { 
      type: query.type, 
      count: result.items.length,
      total: result.total 
    });

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
 * GET /api/v1/graph/nodes/:id/neighbors
 * Get node and its 1-hop neighbors
 */
router.get(
  '/nodes/:id/neighbors',
  validate(graphNodeIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = graphNodeIdParamSchema.parse(req.params);
      const result = await graphService.getNeighbors(id);

      if (!result) {
        throw new AppError(ErrorCode.NOT_FOUND, `Node not found: ${id}`, 404);
      }

      logger.info('Node neighbors fetched', { 
        nodeId: id, 
        neighborCount: result.nodes.length,
        edgeCount: result.edges.length 
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/graph/stats
 * Get graph statistics
 */
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await graphService.getStats();

    logger.info('Graph stats fetched', { 
      totalNodes: stats.totalNodes,
      totalEdges: stats.totalEdges 
    });

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;

