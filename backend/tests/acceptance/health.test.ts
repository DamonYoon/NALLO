import request from 'supertest';
import { createApp, initializeApp, shutdownApp } from '@/app';

describe('Health Check Acceptance Tests', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    app = createApp();
    try {
      await initializeApp();
    } catch (error) {
      console.warn('Database connections not available for acceptance tests:', error);
    }
  });

  afterAll(async () => {
    await shutdownApp();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      // Accept both 200 and 503 depending on database connection
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('graphdb');
      expect(response.body).toHaveProperty('postgresql');
      expect(['healthy', 'unhealthy']).toContain(response.body.status);
    });

    it('should return 200 when system is healthy', async () => {
      const response = await request(app).get('/health');

      if (response.body.status === 'healthy') {
        expect(response.status).toBe(200);
        expect(response.body.graphdb.status).toBe('connected');
        expect(response.body.postgresql.status).toBe('connected');
      }
    });

    it('should return 503 when system is unhealthy', async () => {
      const response = await request(app).get('/health');

      if (response.body.status === 'unhealthy') {
        expect(response.status).toBe(503);
      }
    });

    it('should include database connection status', async () => {
      const response = await request(app).get('/health');

      // Accept both 200 and 503 depending on database connection
      expect([200, 503]).toContain(response.status);
      expect(response.body.graphdb).toHaveProperty('status');
      expect(['connected', 'disconnected']).toContain(response.body.graphdb.status);

      expect(response.body.postgresql).toHaveProperty('status');
      expect(['connected', 'disconnected']).toContain(response.body.postgresql.status);
    });
  });
});
