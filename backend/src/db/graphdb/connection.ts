import neo4j, { Driver, Session } from 'neo4j-driver';
import { config } from '@/config/settings';
import { logger } from '@/utils/logger';
import { retry } from '@/utils/retry';

let driver: Driver | null = null;

/**
 * Initialize Neo4j driver with connection pooling
 */
export async function initializeGraphDB(): Promise<void> {
  try {
    if (driver) {
      logger.debug('GraphDB driver already initialized');
      return;
    }

    driver = neo4j.driver(
      config.GRAPHDB_URI,
      neo4j.auth.basic(config.GRAPHDB_USER, config.GRAPHDB_PASSWORD),
      {
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 30000, // 30 seconds
        connectionTimeout: 30000, // 30 seconds
        disableLosslessIntegers: true, // Use Number instead of Integer for better JSON compatibility
      }
    );

    // Verify connectivity
    await retry(
      async () => {
        const session = driver!.session();
        try {
          await session.run('RETURN 1 as test');
          logger.info('GraphDB connection established', {
            uri: config.GRAPHDB_URI,
            user: config.GRAPHDB_USER,
          });
        } finally {
          await session.close();
        }
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        retryableErrors: ['ECONNREFUSED', 'ETIMEDOUT'],
      }
    );
  } catch (error) {
    logger.error('Failed to initialize GraphDB connection', error);
    if (driver) {
      await driver.close();
      driver = null;
    }
    throw error;
  }
}

/**
 * Close Neo4j driver
 */
export async function closeGraphDB(): Promise<void> {
  try {
    if (driver) {
      await driver.close();
      driver = null;
      logger.info('GraphDB connection closed');
    }
  } catch (error) {
    logger.error('Error closing GraphDB connection', error);
    throw error;
  }
}

/**
 * Get a Neo4j session
 */
export function getSession(): Session {
  if (!driver) {
    throw new Error('GraphDB driver not initialized. Call initializeGraphDB() first.');
  }
  return driver.session();
}

/**
 * Get GraphDB connection status
 */
export async function getGraphDBStatus(): Promise<{ connected: boolean; error?: string }> {
  try {
    if (!driver) {
      return {
        connected: false,
        error: 'Driver not initialized',
      };
    }

    const session = getSession();
    try {
      await session.run('RETURN 1 as test');
      return {
        connected: true,
      };
    } finally {
      await session.close();
    }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Execute a read transaction
 */
export async function executeRead<T>(
  query: string,
  parameters?: Record<string, unknown>
): Promise<T[]> {
  const session = getSession();
  try {
    const result = await session.executeRead((tx) => tx.run(query, parameters));
    return result.records.map((record) => record.toObject() as T);
  } finally {
    await session.close();
  }
}

/**
 * Execute a write transaction
 */
export async function executeWrite<T>(
  query: string,
  parameters?: Record<string, unknown>
): Promise<T[]> {
  const session = getSession();
  try {
    const result = await session.executeWrite((tx) => tx.run(query, parameters));
    return result.records.map((record) => record.toObject() as T);
  } finally {
    await session.close();
  }
}

