/**
 * Concept Service
 * Handles concept (glossary term) CRUD operations with GraphDB
 * Per Constitution Principle I: Business logic separated from API routes and database access
 */

import { v4 as uuidv4 } from 'uuid';
import { ConceptNode } from '../models/graphdb/conceptNode';
import {
  createConceptNode,
  getConceptNode,
  updateConceptNode,
  deleteConceptNode,
  listConceptNodes,
  getDocumentsUsingConcept,
} from '../db/graphdb/queries';
import {
  CreateConceptRequest,
  UpdateConceptRequest,
  ConceptQuery,
  ConceptListResponse,
} from '../api/schemas/concept';
import { logger } from '../utils/logger';

/**
 * Concept response type for API
 */
export interface ConceptResponseDTO {
  id: string;
  term: string;
  description: string;
  category: string | null;
  lang: string;
  created_at: string;
  updated_at: string;
}

/**
 * Document summary for impact analysis response
 */
export interface DocumentSummaryDTO {
  id: string;
  title: string;
  type: string;
  status: string;
  lang: string;
}

/**
 * Impact analysis response
 */
export interface ImpactAnalysisResponse {
  items: DocumentSummaryDTO[];
  total: number;
}

/**
 * Concept Service class
 * Manages glossary terms stored in GraphDB
 */
export class ConceptService {
  /**
   * Create a new concept
   */
  async createConcept(input: CreateConceptRequest): Promise<ConceptResponseDTO> {
    const conceptId = uuidv4();

    logger.info('Creating concept', { conceptId, term: input.term, lang: input.lang });

    try {
      const conceptNode = await createConceptNode({
        id: conceptId,
        term: input.term,
        category: input.category || null,
        lang: input.lang,
        description: input.description,
      });

      logger.info('Concept created successfully', { conceptId });

      return this.toResponseDTO(conceptNode);
    } catch (error) {
      logger.error('Failed to create concept', { conceptId, error });
      throw error;
    }
  }

  /**
   * Get concept by ID
   */
  async getConcept(id: string): Promise<ConceptResponseDTO | null> {
    logger.debug('Getting concept', { id });

    const conceptNode = await getConceptNode(id);

    if (!conceptNode) {
      logger.debug('Concept not found', { id });
      return null;
    }

    return this.toResponseDTO(conceptNode);
  }

  /**
   * Update concept
   */
  async updateConcept(id: string, input: UpdateConceptRequest): Promise<ConceptResponseDTO | null> {
    logger.info('Updating concept', { id, fields: Object.keys(input) });

    const updatedNode = await updateConceptNode(id, {
      term: input.term,
      category: input.category,
      description: input.description,
    });

    if (!updatedNode) {
      logger.debug('Concept not found for update', { id });
      return null;
    }

    logger.info('Concept updated successfully', { id });

    return this.toResponseDTO(updatedNode);
  }

  /**
   * Delete concept
   */
  async deleteConcept(id: string): Promise<boolean> {
    logger.info('Deleting concept', { id });

    const deleted = await deleteConceptNode(id);

    if (!deleted) {
      logger.debug('Concept not found for deletion', { id });
      return false;
    }

    logger.info('Concept deleted successfully', { id });
    return true;
  }

  /**
   * List concepts with optional filters and pagination
   */
  async listConcepts(query: ConceptQuery): Promise<ConceptListResponse> {
    logger.debug('Listing concepts', { query });

    const { items, total } = await listConceptNodes({
      category: query.category,
      lang: query.lang,
      limit: query.limit,
      offset: query.offset,
    });

    const concepts = items.map(node => this.toResponseDTO(node));

    return {
      items: concepts,
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }

  /**
   * Get documents using a concept (Impact Analysis)
   * Returns list of documents that reference this concept
   */
  async getConceptImpact(conceptId: string): Promise<ImpactAnalysisResponse | null> {
    logger.debug('Getting concept impact analysis', { conceptId });

    const result = await getDocumentsUsingConcept(conceptId);

    if (result === null) {
      logger.debug('Concept not found for impact analysis', { conceptId });
      return null;
    }

    const documents: DocumentSummaryDTO[] = result.items.map(doc => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      status: doc.status,
      lang: doc.lang,
    }));

    logger.info('Impact analysis completed', {
      conceptId,
      documentCount: documents.length,
    });

    return {
      items: documents,
      total: result.total,
    };
  }

  /**
   * Convert ConceptNode to response DTO
   */
  private toResponseDTO(node: ConceptNode): ConceptResponseDTO {
    return {
      id: node.id,
      term: node.term,
      description: node.description,
      category: node.category,
      lang: node.lang,
      created_at: node.created_at.toISOString(),
      updated_at: node.updated_at.toISOString(),
    };
  }
}

// Export singleton instance
export const conceptService = new ConceptService();
