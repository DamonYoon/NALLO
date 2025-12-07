/**
 * GraphDB (Neo4j) query utilities
 * This file contains reusable Cypher query templates
 */

/**
 * Create a Document node
 */
export const CREATE_DOCUMENT = `
  CREATE (d:Document {
    id: $id,
    type: $type,
    status: $status,
    title: $title,
    lang: $lang,
    storage_key: $storage_key,
    summary: $summary,
    created_at: datetime(),
    updated_at: datetime()
  })
  RETURN d
`;

/**
 * Get Document by ID
 */
export const GET_DOCUMENT_BY_ID = `
  MATCH (d:Document {id: $id})
  RETURN d
`;

/**
 * Create a Concept node
 */
export const CREATE_CONCEPT = `
  CREATE (c:Concept {
    id: $id,
    term: $term,
    description: $description,
    category: $category,
    lang: $lang,
    created_at: datetime(),
    updated_at: datetime()
  })
  RETURN c
`;

/**
 * Get Concept by ID
 */
export const GET_CONCEPT_BY_ID = `
  MATCH (c:Concept {id: $id})
  RETURN c
`;

/**
 * Create a Version node
 */
export const CREATE_VERSION = `
  CREATE (v:Version {
    id: $id,
    version: $version,
    name: $name,
    description: $description,
    is_public: $is_public,
    is_main: $is_main,
    created_at: datetime(),
    updated_at: datetime()
  })
  RETURN v
`;

/**
 * Create a Page node
 */
export const CREATE_PAGE = `
  CREATE (p:Page {
    id: $id,
    slug: $slug,
    title: $title,
    order: $order,
    visible: $visible,
    created_at: datetime(),
    updated_at: datetime()
  })
  RETURN p
`;

/**
 * Create IN_VERSION relationship
 */
export const CREATE_IN_VERSION_RELATIONSHIP = `
  MATCH (p:Page {id: $page_id}), (v:Version {id: $version_id})
  CREATE (p)-[:IN_VERSION]->(v)
  RETURN p, v
`;

/**
 * Create DISPLAYS relationship
 */
export const CREATE_DISPLAYS_RELATIONSHIP = `
  MATCH (p:Page {id: $page_id}), (d:Document {id: $document_id})
  CREATE (p)-[:DISPLAYS]->(d)
  RETURN p, d
`;

/**
 * Create USES_CONCEPT relationship
 */
export const CREATE_USES_CONCEPT_RELATIONSHIP = `
  MATCH (d:Document {id: $document_id}), (c:Concept {id: $concept_id})
  CREATE (d)-[:USES_CONCEPT]->(c)
  RETURN d, c
`;

/**
 * Get documents using a concept (impact analysis)
 */
export const GET_DOCUMENTS_USING_CONCEPT = `
  MATCH (c:Concept {id: $concept_id})<-[:USES_CONCEPT]-(d:Document)
  RETURN d.id as id, d.title as title, d.status as status
`;

/**
 * Get navigation tree for a version
 */
export const GET_NAVIGATION_TREE = `
  MATCH (v:Version {id: $version_id})<-[:IN_VERSION]-(p:Page)
  WHERE p.visible = true
  OPTIONAL MATCH (p)-[:CHILD_OF]->(parent:Page)
  RETURN p, parent
  ORDER BY p.order, p.created_at DESC
`;

