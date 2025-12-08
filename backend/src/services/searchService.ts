/**
 * Search Service
 * Handles document search operations with GraphDB
 * Implements relevance ranking and filtering
 */

import { searchDocuments as searchGraphDB } from '../db/graphdb/queries';
import { SearchQuery, SearchResponse } from '../api/schemas/search';
import { logger } from '../utils/logger';

/**
 * Search service class
 */
export class SearchService {
  /**
   * Search documents by query
   * Searches across document titles, content summaries, and related concepts
   */
  async search(params: SearchQuery): Promise<SearchResponse> {
    const { query, version_id, tags, limit = 20, offset = 0 } = params;

    logger.info('Searching documents', { query, version_id, tags, limit, offset });

    try {
      // Normalize tags to array
      const normalizedTags = tags ? (Array.isArray(tags) ? tags : [tags]) : undefined;

      // Execute search in GraphDB
      const searchResult = await searchGraphDB({
        query,
        versionId: version_id,
        tags: normalizedTags,
        limit,
        offset,
      });

      logger.info('Search completed', {
        query,
        resultCount: searchResult.results.length,
        total: searchResult.total,
      });

      return {
        results: searchResult.results,
        total: searchResult.total,
        limit,
        offset,
      };
    } catch (error) {
      logger.error('Search failed', { query, error });
      throw error;
    }
  }
}

// Export singleton instance
export const searchService = new SearchService();
