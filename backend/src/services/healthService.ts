import { getPostgresStatus } from '@/db/postgres/connection';
import { getGraphDBStatus } from '@/db/graphdb/connection';
import { logger } from '@/utils/logger';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  graphdb: {
    status: 'connected' | 'disconnected';
    error?: string;
  };
  postgresql: {
    status: 'connected' | 'disconnected';
    error?: string;
  };
}

/**
 * Check system health
 */
export async function checkHealth(): Promise<HealthStatus> {
  const graphdbStatus = await getGraphDBStatus();
  const postgresStatus = getPostgresStatus();

  const isHealthy = graphdbStatus.connected && postgresStatus.connected;

  const healthStatus: HealthStatus = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    graphdb: {
      status: graphdbStatus.connected ? 'connected' : 'disconnected',
      ...(graphdbStatus.error && { error: graphdbStatus.error }),
    },
    postgresql: {
      status: postgresStatus.connected ? 'connected' : 'disconnected',
      ...(postgresStatus.error && { error: postgresStatus.error }),
    },
  };

  if (!isHealthy) {
    logger.warn('Health check failed', healthStatus);
  } else {
    logger.debug('Health check passed', healthStatus);
  }

  return healthStatus;
}
