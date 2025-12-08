/**
 * Page Service
 * Handles page CRUD operations with GraphDB
 * Per Constitution Principle I: Business logic separated from API routes
 */

import { v4 as uuidv4 } from 'uuid';
import { PageNode } from '../models/graphdb/pageNode';
import {
  createPageNode,
  getPageNode,
  updatePageNode,
  deletePageNode,
  listPageNodes,
  linkPageToDocument,
  getVersionNode,
  getDocumentNode,
} from '../db/graphdb/queries';
import {
  CreatePageRequest,
  UpdatePageRequest,
  PageQuery,
  PageListResponse,
} from '../api/schemas/page';
import { AppError, ErrorCode } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Page response type for API
 */
export interface PageResponseDTO {
  id: string;
  slug: string;
  title: string;
  order: number;
  visible: boolean;
  version_id?: string;
  parent_page_id?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Link response type
 */
export interface LinkResponseDTO {
  page_id: string;
  document_id: string;
  relation_id?: string;
}

/**
 * Page Service class
 */
export class PageService {
  /**
   * Create a new page
   */
  async createPage(input: CreatePageRequest): Promise<PageResponseDTO> {
    const pageId = uuidv4();

    logger.info('Creating page', { pageId, slug: input.slug, versionId: input.version_id });

    // Verify version exists
    const version = await getVersionNode(input.version_id);
    if (!version) {
      throw new AppError(ErrorCode.NOT_FOUND, `Version not found: ${input.version_id}`, 404);
    }

    // Verify parent page exists if provided
    if (input.parent_page_id) {
      const parentPage = await getPageNode(input.parent_page_id);
      if (!parentPage) {
        throw new AppError(
          ErrorCode.NOT_FOUND,
          `Parent page not found: ${input.parent_page_id}`,
          404
        );
      }
    }

    try {
      const pageNode = await createPageNode({
        id: pageId,
        slug: input.slug,
        title: input.title,
        version_id: input.version_id,
        parent_page_id: input.parent_page_id || null,
        order: input.order ?? 0,
        visible: input.visible ?? false,
      });

      logger.info('Page created successfully', { pageId });

      return this.toResponseDTO(pageNode, input.version_id, input.parent_page_id);
    } catch (error) {
      logger.error('Failed to create page', { pageId, error });
      throw error;
    }
  }

  /**
   * Get page by ID
   */
  async getPage(id: string): Promise<PageResponseDTO | null> {
    logger.debug('Getting page', { id });

    const pageNode = await getPageNode(id);

    if (!pageNode) {
      logger.debug('Page not found', { id });
      return null;
    }

    return this.toResponseDTO(pageNode);
  }

  /**
   * Update page
   */
  async updatePage(id: string, input: UpdatePageRequest): Promise<PageResponseDTO | null> {
    logger.info('Updating page', { id, fields: Object.keys(input) });

    const updatedNode = await updatePageNode(id, {
      slug: input.slug,
      title: input.title,
      order: input.order,
      visible: input.visible,
    });

    if (!updatedNode) {
      logger.debug('Page not found for update', { id });
      return null;
    }

    logger.info('Page updated successfully', { id });

    return this.toResponseDTO(updatedNode);
  }

  /**
   * Delete page
   */
  async deletePage(id: string): Promise<boolean> {
    logger.info('Deleting page', { id });

    const deleted = await deletePageNode(id);

    if (!deleted) {
      logger.debug('Page not found for deletion', { id });
      return false;
    }

    logger.info('Page deleted successfully', { id });
    return true;
  }

  /**
   * List pages with optional filters and pagination
   */
  async listPages(query: PageQuery): Promise<PageListResponse> {
    logger.debug('Listing pages', { query });

    const { items, total } = await listPageNodes({
      version_id: query.version_id,
      visible: query.visible,
      limit: query.limit,
      offset: query.offset,
    });

    const pages = items.map(node => this.toResponseDTO(node));

    return {
      items: pages,
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }

  /**
   * Link page to document
   */
  async linkToDocument(pageId: string, documentId: string): Promise<LinkResponseDTO | null> {
    logger.info('Linking page to document', { pageId, documentId });

    // Verify page exists
    const page = await getPageNode(pageId);
    if (!page) {
      logger.debug('Page not found for linking', { pageId });
      return null;
    }

    // Verify document exists
    const document = await getDocumentNode(documentId);
    if (!document) {
      throw new AppError(ErrorCode.NOT_FOUND, `Document not found: ${documentId}`, 404);
    }

    const result = await linkPageToDocument(pageId, documentId);

    if (!result) {
      logger.error('Failed to link page to document', { pageId, documentId });
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 'Failed to create link', 500);
    }

    logger.info('Page linked to document successfully', { pageId, documentId });

    return {
      page_id: pageId,
      document_id: documentId,
    };
  }

  /**
   * Convert PageNode to response DTO
   */
  private toResponseDTO(
    node: PageNode,
    versionId?: string,
    parentPageId?: string | null
  ): PageResponseDTO {
    return {
      id: node.id,
      slug: node.slug,
      title: node.title,
      order: node.order,
      visible: node.visible,
      version_id: versionId,
      parent_page_id: parentPageId,
      created_at: node.created_at.toISOString(),
      updated_at: node.updated_at.toISOString(),
    };
  }
}

// Export singleton instance
export const pageService = new PageService();
