/**
 * Unit Tests for Search Service
 * Tests business logic in isolation using mocks
 * Per Constitution Principle II: Tests MUST be independent, repeatable, and fast (< 1 second per test)
 */

import { SearchService } from '../../src/services/searchService';
import * as queries from '../../src/db/graphdb/queries';

// Mock GraphDB queries
jest.mock('../../src/db/graphdb/queries', () => ({
  searchDocuments: jest.fn(),
}));

describe('SearchService - Unit Tests', () => {
  let searchService: SearchService;

  beforeEach(() => {
    jest.clearAllMocks();
    searchService = new SearchService();
  });

  describe('search', () => {
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

    it('should call searchDocuments with correct parameters', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: mockSearchResults,
        total: 2,
      });

      await searchService.search({
        query: 'getting started',
        limit: 20,
        offset: 0,
      });

      expect(queries.searchDocuments).toHaveBeenCalledWith({
        query: 'getting started',
        versionId: undefined,
        tags: undefined,
        limit: 20,
        offset: 0,
      });
    });

    it('should return search results with correct structure', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: mockSearchResults,
        total: 2,
      });

      const result = await searchService.search({
        query: 'documentation',
        limit: 20,
        offset: 0,
      });

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('offset');
      expect(result.results).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should pass version_id to GraphDB query', async () => {
      const versionId = '00000000-0000-4000-a000-000000000100';
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: [],
        total: 0,
      });

      await searchService.search({
        query: 'test',
        version_id: versionId,
        limit: 20,
        offset: 0,
      });

      expect(queries.searchDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          versionId: versionId,
        })
      );
    });

    it('should normalize single tag to array', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: [],
        total: 0,
      });

      await searchService.search({
        query: 'test',
        tags: 'tutorial',
        limit: 20,
        offset: 0,
      });

      expect(queries.searchDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['tutorial'],
        })
      );
    });

    it('should pass multiple tags as array', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: [],
        total: 0,
      });

      await searchService.search({
        query: 'test',
        tags: ['tutorial', 'api'],
        limit: 20,
        offset: 0,
      });

      expect(queries.searchDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['tutorial', 'api'],
        })
      );
    });

    it('should use default limit and offset when not provided', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: [],
        total: 0,
      });

      await searchService.search({
        query: 'test',
      } as any);

      expect(queries.searchDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 20,
          offset: 0,
        })
      );
    });

    it('should return empty results when no matches found', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: [],
        total: 0,
      });

      const result = await searchService.search({
        query: 'nonexistent',
        limit: 20,
        offset: 0,
      });

      expect(result.results).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should include pagination info in response', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: [mockSearchResults[0]],
        total: 10,
      });

      const result = await searchService.search({
        query: 'test',
        limit: 5,
        offset: 5,
      });

      expect(result.limit).toBe(5);
      expect(result.offset).toBe(5);
      expect(result.total).toBe(10);
    });

    it('should propagate errors from GraphDB', async () => {
      const error = new Error('Database connection failed');
      (queries.searchDocuments as jest.Mock).mockRejectedValue(error);

      await expect(
        searchService.search({
          query: 'test',
          limit: 20,
          offset: 0,
        })
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle empty query gracefully', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: [],
        total: 0,
      });

      const result = await searchService.search({
        query: '',
        limit: 20,
        offset: 0,
      });

      expect(queries.searchDocuments).toHaveBeenCalled();
      expect(result.results).toHaveLength(0);
    });

    it('should preserve result order from GraphDB (relevance sorted)', async () => {
      const sortedResults = [
        { ...mockSearchResults[0], relevance_score: 0.95 },
        { ...mockSearchResults[1], relevance_score: 0.85 },
      ];

      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: sortedResults,
        total: 2,
      });

      const result = await searchService.search({
        query: 'documentation',
        limit: 20,
        offset: 0,
      });

      expect(result.results[0].relevance_score).toBeGreaterThanOrEqual(
        result.results[1].relevance_score
      );
    });

    it('should not modify tags when undefined', async () => {
      (queries.searchDocuments as jest.Mock).mockResolvedValue({
        results: [],
        total: 0,
      });

      await searchService.search({
        query: 'test',
        limit: 20,
        offset: 0,
      });

      expect(queries.searchDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: undefined,
        })
      );
    });
  });
});

