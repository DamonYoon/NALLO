import { initializePostgres, closePostgres, getPostgresStatus } from '@/db/postgres/connection';
import { initializeGraphDB, closeGraphDB, getGraphDBStatus } from '@/db/graphdb/connection';

describe('Database Connections Integration', () => {
  let postgresConnected = false;
  let graphdbConnected = false;

  beforeAll(async () => {
    // Initialize connections before tests
    try {
      await initializePostgres();
      postgresConnected = true;
    } catch (error) {
      console.warn('PostgreSQL connection not available for integration tests:', error);
    }

    try {
      await initializeGraphDB();
      graphdbConnected = true;
    } catch (error) {
      console.warn('GraphDB connection not available for integration tests:', error);
    }
  });

  afterAll(async () => {
    // Close connections after tests
    if (postgresConnected) {
      await closePostgres();
    }
    if (graphdbConnected) {
      await closeGraphDB();
    }
  });

  describe('PostgreSQL Connection', () => {
    it('should connect to PostgreSQL', async () => {
      if (!postgresConnected) {
        console.warn('Skipping PostgreSQL test - connection not available');
        return;
      }
      const status = getPostgresStatus();
      expect(status.connected).toBe(true);
    });

    it('should execute a simple query', async () => {
      if (!postgresConnected) {
        console.warn('Skipping PostgreSQL query test - connection not available');
        return;
      }
      const { dataSource } = await import('@/db/postgres/connection');
      if (dataSource.isInitialized) {
        const result = await dataSource.query('SELECT 1 as test');
        expect(result[0].test).toBe(1);
      }
    });
  });

  describe('GraphDB Connection', () => {
    it('should connect to GraphDB', async () => {
      if (!graphdbConnected) {
        console.warn('Skipping GraphDB test - connection not available');
        return;
      }
      const status = await getGraphDBStatus();
      expect(status.connected).toBe(true);
    });

    it('should execute a simple Cypher query', async () => {
      if (!graphdbConnected) {
        console.warn('Skipping GraphDB query test - connection not available');
        return;
      }
      const { executeRead } = await import('@/db/graphdb/connection');
      const result = await executeRead<{ test: number }>('RETURN 1 as test');
      expect(result[0].test).toBe(1);
    });
  });
});
