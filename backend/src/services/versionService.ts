/**
 * Version Service
 * Handles version CRUD operations with GraphDB
 * Per Constitution Principle I: Business logic separated from API routes
 */

import { v4 as uuidv4 } from 'uuid';
import { VersionNode } from '../models/graphdb/versionNode';
import { NavigationItem } from '../models/graphdb/pageNode';
import {
  createVersionNode,
  getVersionNode,
  updateVersionNode,
  deleteVersionNode,
  listVersionNodes,
  getNavigationTree,
} from '../db/graphdb/queries';
import {
  CreateVersionRequest,
  UpdateVersionRequest,
  VersionQuery,
  VersionListResponse,
} from '../api/schemas/version';
import { logger } from '../utils/logger';

/**
 * Version response type for API
 */
export interface VersionResponseDTO {
  id: string;
  version: string;
  name: string;
  description: string | null;
  is_public: boolean;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Navigation tree response
 */
export interface NavigationTreeDTO {
  pages: NavigationItem[];
}

/**
 * Version Service class
 */
export class VersionService {
  /**
   * Create a new version
   */
  async createVersion(input: CreateVersionRequest): Promise<VersionResponseDTO> {
    const versionId = uuidv4();

    logger.info('Creating version', { versionId, version: input.version, name: input.name });

    try {
      const versionNode = await createVersionNode({
        id: versionId,
        version: input.version,
        name: input.name,
        description: input.description || null,
        is_public: input.is_public,
        is_main: input.is_main,
      });

      logger.info('Version created successfully', { versionId });

      return this.toResponseDTO(versionNode);
    } catch (error) {
      logger.error('Failed to create version', { versionId, error });
      throw error;
    }
  }

  /**
   * Get version by ID
   */
  async getVersion(id: string): Promise<VersionResponseDTO | null> {
    logger.debug('Getting version', { id });

    const versionNode = await getVersionNode(id);

    if (!versionNode) {
      logger.debug('Version not found', { id });
      return null;
    }

    return this.toResponseDTO(versionNode);
  }

  /**
   * Update version
   */
  async updateVersion(id: string, input: UpdateVersionRequest): Promise<VersionResponseDTO | null> {
    logger.info('Updating version', { id, fields: Object.keys(input) });

    const updatedNode = await updateVersionNode(id, {
      name: input.name,
      description: input.description,
      is_public: input.is_public,
      is_main: input.is_main,
    });

    if (!updatedNode) {
      logger.debug('Version not found for update', { id });
      return null;
    }

    logger.info('Version updated successfully', { id });

    return this.toResponseDTO(updatedNode);
  }

  /**
   * Delete version
   */
  async deleteVersion(id: string): Promise<boolean> {
    logger.info('Deleting version', { id });

    const deleted = await deleteVersionNode(id);

    if (!deleted) {
      logger.debug('Version not found for deletion', { id });
      return false;
    }

    logger.info('Version deleted successfully', { id });
    return true;
  }

  /**
   * List versions with optional filters and pagination
   */
  async listVersions(query: VersionQuery): Promise<VersionListResponse> {
    logger.debug('Listing versions', { query });

    const { items, total } = await listVersionNodes({
      is_public: query.is_public,
      limit: query.limit,
      offset: query.offset,
    });

    const versions = items.map(node => this.toResponseDTO(node));

    return {
      items: versions,
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }

  /**
   * Get navigation tree for a version
   */
  async getVersionNavigation(versionId: string): Promise<NavigationTreeDTO | null> {
    logger.debug('Getting navigation tree', { versionId });

    const result = await getNavigationTree(versionId);

    if (result === null) {
      logger.debug('Version not found for navigation', { versionId });
      return null;
    }

    logger.info('Navigation tree retrieved', { versionId, pageCount: result.pages.length });

    return result;
  }

  /**
   * Convert VersionNode to response DTO
   */
  private toResponseDTO(node: VersionNode): VersionResponseDTO {
    return {
      id: node.id,
      version: node.version,
      name: node.name,
      description: node.description,
      is_public: node.is_public,
      is_main: node.is_main,
      created_at: node.created_at.toISOString(),
      updated_at: node.updated_at.toISOString(),
    };
  }
}

// Export singleton instance
export const versionService = new VersionService();
