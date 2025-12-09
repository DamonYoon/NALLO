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
  linkConceptSubtypeOf,
  unlinkConceptSubtypeOf,
  getConceptSupertypes,
  getConceptSubtypes,
  linkConceptPartOf,
  unlinkConceptPartOf,
  getConceptWholeOf,
  getConceptParts,
  linkConceptSynonymOf,
  unlinkConceptSynonymOf,
  getConceptSynonyms,
} from '../db/graphdb/queries';
import { AppError, ErrorCode } from '../utils/errors';
import {
  CreateConceptRequest,
  UpdateConceptRequest,
  ConceptQuery,
  ConceptListResponse,
} from '../api/schemas/concept';
import { logger } from '../utils/logger';

/**
 * Concept response type for API
 * Note: category field removed - categorization via Concept relationships
 */
export interface ConceptResponseDTO {
  id: string;
  term: string;
  description: string;
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
      lang: node.lang,
      created_at: node.created_at.toISOString(),
      updated_at: node.updated_at.toISOString(),
    };
  }

  // ============================================================================
  // CONCEPT RELATIONSHIP METHODS
  // ============================================================================

  /**
   * Link concept as subtype of another concept
   * @param childId - The subtype concept ID
   * @param parentId - The supertype concept ID
   */
  async linkSubtypeOf(childId: string, parentId: string): Promise<void> {
    logger.info('Linking concept as subtype', { childId, parentId });

    // Verify both concepts exist
    const child = await getConceptNode(childId);
    if (!child) {
      throw new AppError(ErrorCode.NOT_FOUND, `Concept with id '${childId}' not found`);
    }

    const parent = await getConceptNode(parentId);
    if (!parent) {
      throw new AppError(ErrorCode.NOT_FOUND, `Concept with id '${parentId}' not found`);
    }

    // Prevent self-referencing
    if (childId === parentId) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Cannot link concept to itself');
    }

    await linkConceptSubtypeOf(childId, parentId);
    logger.info('Concept linked as subtype', { childId, parentId });
  }

  /**
   * Unlink concept subtype relationship
   */
  async unlinkSubtypeOf(childId: string, parentId: string): Promise<void> {
    logger.info('Unlinking concept subtype', { childId, parentId });

    const unlinked = await unlinkConceptSubtypeOf(childId, parentId);
    if (!unlinked) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Subtype relationship from '${childId}' to '${parentId}' not found`
      );
    }

    logger.info('Concept subtype unlinked', { childId, parentId });
  }

  /**
   * Get supertypes (parent concepts in SUBTYPE_OF hierarchy)
   */
  async getSupertypes(conceptId: string): Promise<ConceptResponseDTO[]> {
    logger.debug('Getting supertypes', { conceptId });

    const concept = await getConceptNode(conceptId);
    if (!concept) {
      throw new AppError(ErrorCode.NOT_FOUND, `Concept with id '${conceptId}' not found`);
    }

    const supertypes = await getConceptSupertypes(conceptId);
    return supertypes.map(node => this.toResponseDTO(node));
  }

  /**
   * Get subtypes (child concepts in SUBTYPE_OF hierarchy)
   */
  async getSubtypes(conceptId: string): Promise<ConceptResponseDTO[]> {
    logger.debug('Getting subtypes', { conceptId });

    const concept = await getConceptNode(conceptId);
    if (!concept) {
      throw new AppError(ErrorCode.NOT_FOUND, `Concept with id '${conceptId}' not found`);
    }

    const subtypes = await getConceptSubtypes(conceptId);
    return subtypes.map(node => this.toResponseDTO(node));
  }

  /**
   * Link concept as part of another concept
   * @param partId - The part concept ID
   * @param wholeId - The whole concept ID
   */
  async linkPartOf(partId: string, wholeId: string): Promise<void> {
    logger.info('Linking concept as part', { partId, wholeId });

    // Verify both concepts exist
    const part = await getConceptNode(partId);
    if (!part) {
      throw new AppError(ErrorCode.NOT_FOUND, `Concept with id '${partId}' not found`);
    }

    const whole = await getConceptNode(wholeId);
    if (!whole) {
      throw new AppError(ErrorCode.NOT_FOUND, `Concept with id '${wholeId}' not found`);
    }

    // Prevent self-referencing
    if (partId === wholeId) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Cannot link concept to itself');
    }

    await linkConceptPartOf(partId, wholeId);
    logger.info('Concept linked as part', { partId, wholeId });
  }

  /**
   * Unlink concept part-of relationship
   */
  async unlinkPartOf(partId: string, wholeId: string): Promise<void> {
    logger.info('Unlinking concept part-of', { partId, wholeId });

    const unlinked = await unlinkConceptPartOf(partId, wholeId);
    if (!unlinked) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Part-of relationship from '${partId}' to '${wholeId}' not found`
      );
    }

    logger.info('Concept part-of unlinked', { partId, wholeId });
  }

  /**
   * Get what this concept is part of (whole concepts)
   */
  async getWholeOf(conceptId: string): Promise<ConceptResponseDTO[]> {
    logger.debug('Getting whole-of', { conceptId });

    const concept = await getConceptNode(conceptId);
    if (!concept) {
      throw new AppError(ErrorCode.NOT_FOUND, `Concept with id '${conceptId}' not found`);
    }

    const wholes = await getConceptWholeOf(conceptId);
    return wholes.map(node => this.toResponseDTO(node));
  }

  /**
   * Get parts of this concept
   */
  async getParts(conceptId: string): Promise<ConceptResponseDTO[]> {
    logger.debug('Getting parts', { conceptId });

    const concept = await getConceptNode(conceptId);
    if (!concept) {
      throw new AppError(ErrorCode.NOT_FOUND, `Concept with id '${conceptId}' not found`);
    }

    const parts = await getConceptParts(conceptId);
    return parts.map(node => this.toResponseDTO(node));
  }

  /**
   * Link two concepts as synonyms
   */
  async linkSynonymOf(conceptId1: string, conceptId2: string): Promise<void> {
    logger.info('Linking concepts as synonyms', { conceptId1, conceptId2 });

    // Verify both concepts exist
    const concept1 = await getConceptNode(conceptId1);
    if (!concept1) {
      throw new AppError(ErrorCode.NOT_FOUND, `Concept with id '${conceptId1}' not found`);
    }

    const concept2 = await getConceptNode(conceptId2);
    if (!concept2) {
      throw new AppError(ErrorCode.NOT_FOUND, `Concept with id '${conceptId2}' not found`);
    }

    // Prevent self-referencing
    if (conceptId1 === conceptId2) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Cannot link concept to itself');
    }

    // Validate same language constraint
    if (concept1.lang !== concept2.lang) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        `Synonym concepts must be in the same language. Got '${concept1.lang}' and '${concept2.lang}'`
      );
    }

    await linkConceptSynonymOf(conceptId1, conceptId2);
    logger.info('Concepts linked as synonyms', { conceptId1, conceptId2 });
  }

  /**
   * Unlink synonym relationship
   */
  async unlinkSynonymOf(conceptId1: string, conceptId2: string): Promise<void> {
    logger.info('Unlinking concept synonyms', { conceptId1, conceptId2 });

    const unlinked = await unlinkConceptSynonymOf(conceptId1, conceptId2);
    if (!unlinked) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Synonym relationship between '${conceptId1}' and '${conceptId2}' not found`
      );
    }

    logger.info('Concept synonyms unlinked', { conceptId1, conceptId2 });
  }

  /**
   * Get synonyms of a concept (bidirectional)
   */
  async getSynonyms(conceptId: string): Promise<ConceptResponseDTO[]> {
    logger.debug('Getting synonyms', { conceptId });

    const concept = await getConceptNode(conceptId);
    if (!concept) {
      throw new AppError(ErrorCode.NOT_FOUND, `Concept with id '${conceptId}' not found`);
    }

    const synonyms = await getConceptSynonyms(conceptId);
    return synonyms.map(node => this.toResponseDTO(node));
  }
}

// Export singleton instance
export const conceptService = new ConceptService();
