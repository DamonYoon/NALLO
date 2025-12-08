import { checkHealth } from '@/services/healthService';
import { getPostgresStatus } from '@/db/postgres/connection';
import { getGraphDBStatus } from '@/db/graphdb/connection';

// Mock database connections
jest.mock('@/db/postgres/connection');
jest.mock('@/db/graphdb/connection');

const mockGetPostgresStatus = getPostgresStatus as jest.MockedFunction<
  typeof getPostgresStatus
>;
const mockGetGraphDBStatus = getGraphDBStatus as jest.MockedFunction<
  typeof getGraphDBStatus
>;

describe('HealthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkHealth', () => {
    it('should return healthy status when both databases are connected', async () => {
      mockGetPostgresStatus.mockReturnValue({ connected: true });
      mockGetGraphDBStatus.mockResolvedValue({ connected: true });

      const result = await checkHealth();

      expect(result.status).toBe('healthy');
      expect(result.postgresql.status).toBe('connected');
      expect(result.graphdb.status).toBe('connected');
    });

    it('should return unhealthy status when PostgreSQL is disconnected', async () => {
      mockGetPostgresStatus.mockReturnValue({
        connected: false,
        error: 'Connection failed',
      });
      mockGetGraphDBStatus.mockResolvedValue({ connected: true });

      const result = await checkHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.postgresql.status).toBe('disconnected');
      expect(result.postgresql.error).toBe('Connection failed');
      expect(result.graphdb.status).toBe('connected');
    });

    it('should return unhealthy status when GraphDB is disconnected', async () => {
      mockGetPostgresStatus.mockReturnValue({ connected: true });
      mockGetGraphDBStatus.mockResolvedValue({
        connected: false,
        error: 'Connection timeout',
      });

      const result = await checkHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.postgresql.status).toBe('connected');
      expect(result.graphdb.status).toBe('disconnected');
      expect(result.graphdb.error).toBe('Connection timeout');
    });

    it('should return unhealthy status when both databases are disconnected', async () => {
      mockGetPostgresStatus.mockReturnValue({
        connected: false,
        error: 'PostgreSQL error',
      });
      mockGetGraphDBStatus.mockResolvedValue({
        connected: false,
        error: 'GraphDB error',
      });

      const result = await checkHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.postgresql.status).toBe('disconnected');
      expect(result.graphdb.status).toBe('disconnected');
    });
  });
});

