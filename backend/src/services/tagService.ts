/**
 * Tag Service
 *
 * Business logic for Tag management and HAS_TAG relationships
 */

import {
  createTagNode,
  getTagNode,
  getTagNodeByName,
  updateTagNode,
  deleteTagNode,
  listTagNodes,
  linkDocumentToTag,
  unlinkDocumentFromTag,
  getTagsForDocument,
  linkConceptToTag,
  unlinkConceptFromTag,
  getTagsForConcept,
  linkPageToTag,
  unlinkPageFromTag,
  getTagsForPage,
  getEntitiesWithTag,
  getDocumentNode,
  getConceptNode,
  getPageNode,
} from '../db/graphdb/queries';
import type { TagNode, CreateTagInput, UpdateTagInput } from '../models/graphdb/tagNode';
import { AppError, ErrorCode } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Tag Service class
 */
export const tagService = {
  /**
   * Create a new tag
   */
  async createTag(input: CreateTagInput): Promise<TagNode> {
    logger.info('Creating tag', { name: input.name });

    // Check if tag with same name already exists
    const existing = await getTagNodeByName(input.name);
    if (existing) {
      throw new AppError(ErrorCode.CONFLICT, `Tag with name '${input.name}' already exists`);
    }

    const tag = await createTagNode(input);
    logger.info('Tag created', { id: tag.id, name: tag.name });

    return tag;
  },

  /**
   * Get tag by ID
   */
  async getTag(id: string): Promise<TagNode> {
    logger.info('Getting tag', { id });

    const tag = await getTagNode(id);
    if (!tag) {
      throw new AppError(ErrorCode.NOT_FOUND, `Tag with id '${id}' not found`);
    }

    return tag;
  },

  /**
   * Update tag
   */
  async updateTag(id: string, input: UpdateTagInput): Promise<TagNode> {
    logger.info('Updating tag', { id, input });

    // Check if tag exists
    const existing = await getTagNode(id);
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, `Tag with id '${id}' not found`);
    }

    // Check for name conflict if name is being changed
    if (input.name && input.name !== existing.name) {
      const nameConflict = await getTagNodeByName(input.name);
      if (nameConflict) {
      throw new AppError(
        ErrorCode.CONFLICT,
        `Tag with name '${input.name}' already exists`
      );
      }
    }

    const tag = await updateTagNode(id, input);
    if (!tag) {
      throw new AppError(ErrorCode.NOT_FOUND, `Tag with id '${id}' not found`);
    }

    logger.info('Tag updated', { id: tag.id });
    return tag;
  },

  /**
   * Delete tag
   */
  async deleteTag(id: string): Promise<void> {
    logger.info('Deleting tag', { id });

    const deleted = await deleteTagNode(id);
    if (!deleted) {
      throw new AppError(ErrorCode.NOT_FOUND, `Tag with id '${id}' not found`);
    }

    logger.info('Tag deleted', { id });
  },

  /**
   * List tags
   */
  async listTags(options: {
    limit: number;
    offset: number;
    search?: string;
  }): Promise<{ items: TagNode[]; total: number }> {
    logger.info('Listing tags', options);
    return listTagNodes(options);
  },

  /**
   * Link document to tag
   */
  async linkDocumentToTag(documentId: string, tagId: string): Promise<void> {
    logger.info('Linking document to tag', { documentId, tagId });

    // Verify document exists
    const document = await getDocumentNode(documentId);
    if (!document) {
      throw new AppError(ErrorCode.NOT_FOUND, `Document with id '${documentId}' not found`);
    }

    // Verify tag exists
    const tag = await getTagNode(tagId);
    if (!tag) {
      throw new AppError(ErrorCode.NOT_FOUND, `Tag with id '${tagId}' not found`);
    }

    await linkDocumentToTag(documentId, tagId);
    logger.info('Document linked to tag', { documentId, tagId });
  },

  /**
   * Unlink document from tag
   */
  async unlinkDocumentFromTag(documentId: string, tagId: string): Promise<void> {
    logger.info('Unlinking document from tag', { documentId, tagId });

    const unlinked = await unlinkDocumentFromTag(documentId, tagId);
    if (!unlinked) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Document '${documentId}' is not linked to tag '${tagId}'`
      );
    }

    logger.info('Document unlinked from tag', { documentId, tagId });
  },

  /**
   * Get tags for document
   */
  async getTagsForDocument(documentId: string): Promise<TagNode[]> {
    logger.info('Getting tags for document', { documentId });

    // Verify document exists
    const document = await getDocumentNode(documentId);
    if (!document) {
      throw new AppError(ErrorCode.NOT_FOUND, `Document with id '${documentId}' not found`);
    }

    return getTagsForDocument(documentId);
  },

  /**
   * Link concept to tag
   */
  async linkConceptToTag(conceptId: string, tagId: string): Promise<void> {
    logger.info('Linking concept to tag', { conceptId, tagId });

    // Verify concept exists
    const concept = await getConceptNode(conceptId);
    if (!concept) {
      throw new AppError(ErrorCode.NOT_FOUND, `Concept with id '${conceptId}' not found`);
    }

    // Verify tag exists
    const tag = await getTagNode(tagId);
    if (!tag) {
      throw new AppError(ErrorCode.NOT_FOUND, `Tag with id '${tagId}' not found`);
    }

    await linkConceptToTag(conceptId, tagId);
    logger.info('Concept linked to tag', { conceptId, tagId });
  },

  /**
   * Unlink concept from tag
   */
  async unlinkConceptFromTag(conceptId: string, tagId: string): Promise<void> {
    logger.info('Unlinking concept from tag', { conceptId, tagId });

    const unlinked = await unlinkConceptFromTag(conceptId, tagId);
    if (!unlinked) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Concept '${conceptId}' is not linked to tag '${tagId}'`
      );
    }

    logger.info('Concept unlinked from tag', { conceptId, tagId });
  },

  /**
   * Get tags for concept
   */
  async getTagsForConcept(conceptId: string): Promise<TagNode[]> {
    logger.info('Getting tags for concept', { conceptId });

    // Verify concept exists
    const concept = await getConceptNode(conceptId);
    if (!concept) {
      throw new AppError(ErrorCode.NOT_FOUND, `Concept with id '${conceptId}' not found`);
    }

    return getTagsForConcept(conceptId);
  },

  /**
   * Link page to tag
   */
  async linkPageToTag(pageId: string, tagId: string): Promise<void> {
    logger.info('Linking page to tag', { pageId, tagId });

    // Verify page exists
    const page = await getPageNode(pageId);
    if (!page) {
      throw new AppError(ErrorCode.NOT_FOUND, `Page with id '${pageId}' not found`);
    }

    // Verify tag exists
    const tag = await getTagNode(tagId);
    if (!tag) {
      throw new AppError(ErrorCode.NOT_FOUND, `Tag with id '${tagId}' not found`);
    }

    await linkPageToTag(pageId, tagId);
    logger.info('Page linked to tag', { pageId, tagId });
  },

  /**
   * Unlink page from tag
   */
  async unlinkPageFromTag(pageId: string, tagId: string): Promise<void> {
    logger.info('Unlinking page from tag', { pageId, tagId });

    const unlinked = await unlinkPageFromTag(pageId, tagId);
    if (!unlinked) {
      throw new AppError(ErrorCode.NOT_FOUND, `Page '${pageId}' is not linked to tag '${tagId}'`);
    }

    logger.info('Page unlinked from tag', { pageId, tagId });
  },

  /**
   * Get tags for page
   */
  async getTagsForPage(pageId: string): Promise<TagNode[]> {
    logger.info('Getting tags for page', { pageId });

    // Verify page exists
    const page = await getPageNode(pageId);
    if (!page) {
      throw new AppError(ErrorCode.NOT_FOUND, `Page with id '${pageId}' not found`);
    }

    return getTagsForPage(pageId);
  },

  /**
   * Get all entities with a specific tag
   */
  async getEntitiesWithTag(tagId: string): Promise<ReturnType<typeof getEntitiesWithTag>> {
    logger.info('Getting entities with tag', { tagId });

    // Verify tag exists
    const tag = await getTagNode(tagId);
    if (!tag) {
      throw new AppError(ErrorCode.NOT_FOUND, `Tag with id '${tagId}' not found`);
    }

    return getEntitiesWithTag(tagId);
  },
};

