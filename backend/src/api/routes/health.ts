import { Router, Request, Response } from 'express';
import { checkHealth } from '@/services/healthService';

const router = Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const health = await checkHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      graphdb: { status: 'disconnected' },
      postgresql: { status: 'disconnected' },
    });
  }
});

export default router;

