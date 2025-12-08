import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@/config/settings';
import { logger } from '@/utils/logger';
import { requestLogger } from '@/api/middleware/logging';
import { errorHandler, notFoundHandler } from '@/api/middleware/errorHandler';
import { initializePostgres, closePostgres } from '@/db/postgres/connection';
import { initializeGraphDB, closeGraphDB } from '@/db/graphdb/connection';
import { initializeStorage, closeStorage } from '@/db/storage/connection';
import healthRouter from '@/api/routes/health';
import documentsRouter from '@/api/routes/documents';
import attachmentsRouter from '@/api/routes/attachments';
import conceptsRouter from '@/api/routes/concepts';
import versionsRouter from '@/api/routes/versions';
import pagesRouter from '@/api/routes/pages';
import tagsRouter, {
  documentTagsRouter,
  conceptTagsRouter,
  pageTagsRouter,
} from '@/api/routes/tags';
import { searchRouter } from '@/api/routes/search';

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

  // API v1 routes
  app.use(`${config.API_V1_PREFIX}/documents`, documentsRouter);
  app.use(`${config.API_V1_PREFIX}/attachments`, attachmentsRouter);
  app.use(`${config.API_V1_PREFIX}/concepts`, conceptsRouter);
  app.use(`${config.API_V1_PREFIX}/versions`, versionsRouter);
  app.use(`${config.API_V1_PREFIX}/pages`, pagesRouter);
  app.use(`${config.API_V1_PREFIX}/tags`, tagsRouter);
  app.use(`${config.API_V1_PREFIX}/search`, searchRouter);

  // HAS_TAG relationship routes (nested under resources)
  app.use(`${config.API_V1_PREFIX}/documents/:documentId/tags`, documentTagsRouter);
  app.use(`${config.API_V1_PREFIX}/concepts/:conceptId/tags`, conceptTagsRouter);
  app.use(`${config.API_V1_PREFIX}/pages/:pageId/tags`, pageTagsRouter);

  // API root info
  app.get(config.API_V1_PREFIX, (_req, res) => {
    res.json({
      name: 'NALLO API',
      version: '1.0.0',
      endpoints: {
        documents: `${config.API_V1_PREFIX}/documents`,
        attachments: `${config.API_V1_PREFIX}/attachments`,
        concepts: `${config.API_V1_PREFIX}/concepts`,
        versions: `${config.API_V1_PREFIX}/versions`,
        pages: `${config.API_V1_PREFIX}/pages`,
        tags: `${config.API_V1_PREFIX}/tags`,
        search: `${config.API_V1_PREFIX}/search`,
        health: '/health',
      },
    });
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

    // Initialize storage (MinIO) - optional, may not be available in all environments
    try {
      await initializeStorage();
    } catch (storageError) {
      logger.warn('MinIO storage not available - file uploads will be disabled', {
        error: storageError,
      });
    }

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
    await closeStorage();
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
    .catch(error => {
      logger.error('Failed to start application', error);
      process.exit(1);
    });
}
