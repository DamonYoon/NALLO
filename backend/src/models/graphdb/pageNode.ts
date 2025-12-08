/**
 * Page Node Model
 * Represents documentation pages stored in GraphDB
 * Per data-model.md specification
 */

/**
 * Page Node interface matching GraphDB schema
 */
export interface PageNode {
  /** Page unique identifier (UUID) */
  id: string;

  /** URL path segment (e.g., "getting-started") */
  slug: string;

  /** Page title */
  title: string;

  /** Sort order within parent */
  order: number;

  /** Navigation visibility */
  visible: boolean;

  /** Creation timestamp */
  created_at: Date;

  /** Last update timestamp */
  updated_at: Date;
}

/**
 * Input for creating a new Page
 */
export interface CreatePageInput {
  id: string;
  slug: string;
  title: string;
  version_id: string;
  parent_page_id?: string | null;
  order?: number;
  visible?: boolean;
}

/**
 * Input for updating an existing Page
 */
export interface UpdatePageInput {
  slug?: string;
  title?: string;
  order?: number;
  visible?: boolean;
}

/**
 * Page with version information
 */
export interface PageWithVersion extends PageNode {
  version_id: string;
  parent_page_id: string | null;
}

/**
 * Navigation tree item (hierarchical structure)
 */
export interface NavigationItem {
  id: string;
  slug: string;
  title: string;
  order: number;
  visible: boolean;
  children: NavigationItem[];
  document_id?: string | null;
}

/**
 * Validate slug format
 * Pattern: ^[a-z0-9-]+$ (lowercase alphanumeric with hyphens)
 */
export function isValidSlugFormat(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

/**
 * Convert Neo4j record to PageNode
 */
export function toPageNode(record: Record<string, unknown>): PageNode {
  return {
    id: String(record.id),
    slug: String(record.slug),
    title: String(record.title),
    order: typeof record.order === 'number' ? record.order : Number(record.order) || 0,
    visible: record.visible !== undefined ? Boolean(record.visible) : false,
    created_at:
      record.created_at instanceof Date ? record.created_at : new Date(String(record.created_at)),
    updated_at:
      record.updated_at instanceof Date ? record.updated_at : new Date(String(record.updated_at)),
  };
}

/**
 * Relationship: Page belongs to Version
 * Pattern: (:Page)-[:IN_VERSION]->(:Version)
 */
export const IN_VERSION = 'IN_VERSION';

/**
 * Relationship: Page displays Document
 * Pattern: (:Page)-[:DISPLAYS]->(:Document)
 */
export const DISPLAYS = 'DISPLAYS';

/**
 * Relationship: Page hierarchy (child -> parent)
 * Pattern: (:ChildPage)-[:CHILD_OF]->(:ParentPage)
 */
export const CHILD_OF = 'CHILD_OF';
