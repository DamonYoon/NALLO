import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from '@/config/settings';
import { logger } from '@/utils/logger';

// TypeORM connection options
const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: config.POSTGRES_HOST,
  port: config.POSTGRES_PORT,
  username: config.POSTGRES_USER,
  password: config.POSTGRES_PASSWORD,
  database: config.POSTGRES_DB,
  synchronize: config.TYPEORM_SYNCHRONIZE,
  logging: config.TYPEORM_LOGGING,
  entities: [__dirname + '/../../models/rdb/**/*.ts'],
  migrations: [__dirname + '/migrations/**/*.ts'],
  extra: {
    // Connection pool settings
    max: 20, // Maximum number of connections in the pool
    min: 5, // Minimum number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 30000, // Return an error after 30 seconds if connection could not be established
  },
};

// Create DataSource instance
export const dataSource = new DataSource(dataSourceOptions);

/**
 * Initialize PostgreSQL connection
 */
export async function initializePostgres(): Promise<void> {
  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      logger.info('PostgreSQL connection established', {
        host: config.POSTGRES_HOST,
        port: config.POSTGRES_PORT,
        database: config.POSTGRES_DB,
      });
    }
  } catch (error) {
    logger.error('Failed to initialize PostgreSQL connection', error);
    throw error;
  }
}

/**
 * Close PostgreSQL connection
 */
export async function closePostgres(): Promise<void> {
  try {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      logger.info('PostgreSQL connection closed');
    }
  } catch (error) {
    logger.error('Error closing PostgreSQL connection', error);
    throw error;
  }
}

/**
 * Get PostgreSQL connection status
 */
export function getPostgresStatus(): { connected: boolean; error?: string } {
  try {
    return {
      connected: dataSource.isInitialized,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

