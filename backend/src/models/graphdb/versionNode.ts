/**
 * Version Node Model
 * Represents documentation versions stored in GraphDB
 * Per data-model.md specification
 */

/**
 * Version Node interface matching GraphDB schema
 */
export interface VersionNode {
  /** Version unique identifier (UUID) */
  id: string;

  /** Version identifier (e.g., "v1.0.1", "v1.0.2") - semantic versioning */
  version: string;

  /** Display name (e.g., "Version 1", "2025 Q1 Release") */
  name: string;

  /** Version description */
  description: string | null;

  /** Public access flag */
  is_public: boolean;

  /** Main version flag (only one true per team) */
  is_main: boolean;

  /** Creation timestamp */
  created_at: Date;

  /** Last update timestamp */
  updated_at: Date;
}

/**
 * Input for creating a new Version
 */
export interface CreateVersionInput {
  id: string;
  version: string;
  name: string;
  description?: string | null;
  is_public: boolean;
  is_main: boolean;
}

/**
 * Input for updating an existing Version
 */
export interface UpdateVersionInput {
  name?: string;
  description?: string | null;
  is_public?: boolean;
  is_main?: boolean;
}

/**
 * Validate version string format (semantic versioning)
 * Pattern: ^v\d+\.\d+\.\d+$
 */
export function isValidVersionFormat(version: string): boolean {
  return /^v\d+\.\d+\.\d+$/.test(version);
}

/**
 * Convert Neo4j record to VersionNode
 */
export function toVersionNode(record: Record<string, unknown>): VersionNode {
  return {
    id: String(record.id),
    version: String(record.version),
    name: String(record.name),
    description: record.description ? String(record.description) : null,
    is_public: Boolean(record.is_public),
    is_main: Boolean(record.is_main),
    created_at:
      record.created_at instanceof Date ? record.created_at : new Date(String(record.created_at)),
    updated_at:
      record.updated_at instanceof Date ? record.updated_at : new Date(String(record.updated_at)),
  };
}
