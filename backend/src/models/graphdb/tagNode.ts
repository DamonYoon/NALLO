/**
 * Tag Node Model
 *
 * Represents a tag in GraphDB (Neo4j).
 * Tags can be attached to Documents, Concepts, and Pages.
 *
 * @see data-model.md for schema definition
 */

/**
 * Tag node properties stored in GraphDB
 */
export interface TagNode {
  /** Unique identifier (UUID) */
  id: string;

  /** Tag name (unique, lowercase) */
  name: string;

  /** Tag color for UI display (hex color code) */
  color?: string;

  /** Tag description */
  description?: string;

  /** Creation timestamp */
  created_at: string;

  /** Last update timestamp */
  updated_at: string;
}

/**
 * Input for creating a new Tag node
 */
export interface CreateTagInput {
  name: string;
  color?: string;
  description?: string;
}

/**
 * Input for updating an existing Tag node
 */
export interface UpdateTagInput {
  name?: string;
  color?: string | null;
  description?: string | null;
}

/**
 * Convert a raw Neo4j record to TagNode
 */
export function toTagNode(record: Record<string, unknown>): TagNode {
  return {
    id: String(record.id),
    name: String(record.name),
    color: record.color ? String(record.color) : undefined,
    description: record.description ? String(record.description) : undefined,
    created_at: String(record.created_at),
    updated_at: String(record.updated_at),
  };
}

