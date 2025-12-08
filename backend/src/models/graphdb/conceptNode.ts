/**
 * Concept Node Model
 * Represents glossary terms stored in GraphDB
 * Per data-model.md specification
 */

/**
 * Concept category type
 * Categorizes concepts by domain area
 */
export const ConceptCategory = {
  API: 'api',
  DOMAIN: 'domain',
  UI: 'ui',
  GENERAL: 'general',
} as const;
export type ConceptCategory = (typeof ConceptCategory)[keyof typeof ConceptCategory];

/**
 * Concept Node interface matching GraphDB schema
 */
export interface ConceptNode {
  /** Concept unique identifier (UUID) */
  id: string;

  /** Term text (e.g., "access token", "액세스 토큰") */
  term: string;

  /** Concept category (e.g., "api", "domain", "ui") */
  category: string | null;

  /** Language code (ISO 639-1, e.g., "ko", "en") */
  lang: string;

  /** Term definition/description */
  description: string;

  /** Creation timestamp */
  created_at: Date;

  /** Last update timestamp */
  updated_at: Date;
}

/**
 * Input for creating a new Concept
 */
export interface CreateConceptInput {
  id: string;
  term: string;
  category?: string | null;
  lang: string;
  description: string;
}

/**
 * Input for updating an existing Concept
 */
export interface UpdateConceptInput {
  term?: string;
  category?: string | null;
  description?: string;
}

/**
 * Concept relationship types
 */
export const ConceptRelationship = {
  /** Synonym relationship (same language) */
  SYNONYM_OF: 'SYNONYM_OF',
  /** Inheritance/classification relationship (e.g., "REST API" subtype_of "API") */
  SUBTYPE_OF: 'SUBTYPE_OF',
  /** Composition relationship (e.g., "엔진" part_of "자동차") */
  PART_OF: 'PART_OF',
} as const;
export type ConceptRelationship = (typeof ConceptRelationship)[keyof typeof ConceptRelationship];

/**
 * Document-Concept relationship
 * Pattern: (:Document)-[:USES_CONCEPT]->(:Concept)
 */
export const USES_CONCEPT = 'USES_CONCEPT';

/**
 * Validate category value
 */
export function isValidCategory(category: string): category is ConceptCategory {
  return Object.values(ConceptCategory).includes(category as ConceptCategory);
}

/**
 * Convert Neo4j record to ConceptNode
 */
export function toConceptNode(record: Record<string, unknown>): ConceptNode {
  return {
    id: record.id as string,
    term: record.term as string,
    category: (record.category as string) || null,
    lang: record.lang as string,
    description: record.description as string,
    created_at:
      record.created_at instanceof Date ? record.created_at : new Date(record.created_at as string),
    updated_at:
      record.updated_at instanceof Date ? record.updated_at : new Date(record.updated_at as string),
  };
}
