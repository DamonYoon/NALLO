import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@/config/settings';
import { logger } from '@/utils/logger';
import { requestLogger } from '@/api/middleware/logging';
import { errorHandler, notFoundHandler } from '@/api/middleware/errorHandler';
import { initializePostgres, closePostgres } from '@/db/postgres/connection';
import { initializeGraphDB, closeGraphDB } from '@/db/graphdb/connection';
import healthRouter from '@/api/routes/health';

/**
 * Create and configure Express application
 */
export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use(requestLogger);

  // Health check route (no authentication required)
  app.use('/health', healthRouter);

  // API routes
  app.use(config.API_V1_PREFIX, (_req, res) => {
    res.json({ message: 'API v1 - Routes coming soon' });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Initialize application
 */
export async function initializeApp(): Promise<void> {
  try {
    // Initialize database connections
    await initializePostgres();
    await initializeGraphDB();
    logger.info('Application initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize application', error);
    throw error;
  }
}

/**
 * Shutdown application gracefully
 */
export async function shutdownApp(): Promise<void> {
  logger.info('Shutting down application...');
  try {
    await closePostgres();
    await closeGraphDB();
    logger.info('Application shut down successfully');
  } catch (error) {
    logger.error('Error during application shutdown', error);
    throw error;
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const app = createApp();

  initializeApp()
    .then(() => {
      const server = app.listen(config.PORT, () => {
        logger.info(`Server running on port ${config.PORT}`, {
          env: config.NODE_ENV,
          apiPrefix: config.API_V1_PREFIX,
        });
      });

      // Graceful shutdown
      process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down gracefully...');
        server.close(async () => {
          await shutdownApp();
          process.exit(0);
        });
      });

      process.on('SIGINT', async () => {
        logger.info('SIGINT received, shutting down gracefully...');
        server.close(async () => {
          await shutdownApp();
          process.exit(0);
        });
      });
    })
    .catch((error) => {
      logger.error('Failed to start application', error);
      process.exit(1);
    });
}

