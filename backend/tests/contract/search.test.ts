/**
 * Contract Tests for Search API
 * Tests API request/response schema compliance with OpenAPI specification
 * Per Constitution Principle II: Tests MUST be independent, repeatable, and fast (< 1 second per test)
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import { SearchResponseSchema } from '../../src/api/schemas/search';

// Mock GraphDB queries
jest.mock('../../src/db/graphdb/queries', () => ({
  ...jest.requireActual('../../src/db/graphdb/queries'),
  searchDocuments: jest.fn(),
  searchDocumentsByTag: jest.fn(),
  searchDocumentsByVersion: jest.fn(),
  getDocumentNode: jest.fn(),
}));

import * as queries from '../../src/db/graphdb/queries';

const app = createApp();

describe('Search API - Contract Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/search', () => {
    const mockSearchResults = [
      {
        document_id: '00000000-0000-4000-a000-000000000001',
        page_id: null,
        title: 'Getting Started Guide',
        summary: 'Introduction to NALLO documentation system',
        relevance_score: 0.95,
        matched_fields: ['title', 'content'],
        type: 'tutorial',
      },
      {
        document_id: '00000000-0000-4000-a000-000000000002',
        page_id: '00000000-0000-4000-a000-000000000010',
        title: 'API Reference',
        summary: 'Complete API documentation',
        relevance_score: 0.85,
        matched_fields: ['content'],
        type: 'api',
      },
    ];

    it('should return search results with valid query', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: mockSearchResults,
        total: 2,
      });

      const response = await request(app)
        .get('/api/v1/search')
        .query({ query: 'getting started' })
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('offset');

      // Validate response schema
      const parseResult = SearchResponseSchema.safeParse(response.body);
      expect(parseResult.success).toBe(true);
    });

    it('should return results matching the query term', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: [mockSearchResults[0]],
        total: 1,
      });

      const response = await request(app)
        .get('/api/v1/search')
        .query({ query: 'getting started' })
        .expect(200);

      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0].title).toBe('Getting Started Guide');
      expect(response.body.total).toBe(1);
    });

    it('should return empty results when no matches found', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: [],
        total: 0,
      });

      const response = await request(app)
        .get('/api/v1/search')
        .query({ query: 'nonexistent term xyz123' })
        .expect(200);

      expect(response.body.results).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should support pagination with limit and offset', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: [mockSearchResults[1]],
        total: 2,
      });

      const response = await request(app)
        .get('/api/v1/search')
        .query({ query: 'documentation', limit: 1, offset: 1 })
        .expect(200);

      expect(response.body.results).toHaveLength(1);
      expect(response.body.limit).toBe(1);
      expect(response.body.offset).toBe(1);
      expect(response.body.total).toBe(2);
    });

    it('should filter by version_id when provided', async () => {
      const versionId = '00000000-0000-4000-a000-000000000100';
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: [mockSearchResults[0]],
        total: 1,
      });

      await request(app)
        .get('/api/v1/search')
        .query({ query: 'guide', version_id: versionId })
        .expect(200);

      expect(queries.searchDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'guide',
          versionId: versionId,
        })
      );
    });

    it('should filter by tags when provided', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: [mockSearchResults[0]],
        total: 1,
      });

      await request(app)
        .get('/api/v1/search')
        .query({ query: 'guide', tags: 'tutorial' })
        .expect(200);

      expect(queries.searchDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'guide',
          tags: ['tutorial'],
        })
      );
    });

    it('should support multiple tags filter', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: mockSearchResults,
        total: 2,
      });

      await request(app)
        .get('/api/v1/search')
        .query({ query: 'documentation', tags: ['tutorial', 'api'] })
        .expect(200);

      expect(queries.searchDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['tutorial', 'api'],
        })
      );
    });

    it('should include relevance score in results', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: mockSearchResults,
        total: 2,
      });

      const response = await request(app)
        .get('/api/v1/search')
        .query({ query: 'documentation' })
        .expect(200);

      expect(response.body.results[0]).toHaveProperty('relevance_score');
      expect(typeof response.body.results[0].relevance_score).toBe('number');
      // Results should be sorted by relevance (highest first)
      expect(response.body.results[0].relevance_score).toBeGreaterThanOrEqual(
        response.body.results[1].relevance_score
      );
    });

    it('should include matched_fields in results', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: [mockSearchResults[0]],
        total: 1,
      });

      const response = await request(app)
        .get('/api/v1/search')
        .query({ query: 'getting started' })
        .expect(200);

      expect(response.body.results[0]).toHaveProperty('matched_fields');
      expect(Array.isArray(response.body.results[0].matched_fields)).toBe(true);
    });

    // Error cases
    it('should return 400 when query is missing', async () => {
      const response = await request(app).get('/api/v1/search').expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when query is empty string', async () => {
      const response = await request(app)
        .get('/api/v1/search')
        .query({ query: '' })
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when limit exceeds maximum', async () => {
      const response = await request(app)
        .get('/api/v1/search')
        .query({ query: 'test', limit: 200 })
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when offset is negative', async () => {
      const response = await request(app)
        .get('/api/v1/search')
        .query({ query: 'test', offset: -1 })
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when version_id is not a valid UUID', async () => {
      const response = await request(app)
        .get('/api/v1/search')
        .query({ query: 'test', version_id: 'invalid-uuid' })
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle internal server error gracefully', async () => {
      (queries.searchDocuments as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/v1/search')
        .query({ query: 'test' })
        .expect(500);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    // Default values
    it('should use default limit of 20 when not specified', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: [],
        total: 0,
      });

      const response = await request(app)
        .get('/api/v1/search')
        .query({ query: 'test' })
        .expect(200);

      expect(response.body.limit).toBe(20);
      expect(queries.searchDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 20,
        })
      );
    });

    it('should use default offset of 0 when not specified', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: [],
        total: 0,
      });

      const response = await request(app)
        .get('/api/v1/search')
        .query({ query: 'test' })
        .expect(200);

      expect(response.body.offset).toBe(0);
      expect(queries.searchDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 0,
        })
      );
    });
  });
});

