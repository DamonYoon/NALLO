/**
 * GraphDB (Neo4j) query utilities
 * This file contains reusable Cypher query templates and functions
 */

import { getGraphDBConnection } from './connection';
import { DocumentNode, DocumentStatus, DocumentType } from '../../models/graphdb/documentNode';

// ============================================
// CYPHER QUERY TEMPLATES
// ============================================

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
 * Update Document node
 */
export const UPDATE_DOCUMENT = `
  MATCH (d:Document {id: $id})
  SET d += $updates, d.updated_at = datetime()
  RETURN d
`;

/**
 * Delete Document node
 */
export const DELETE_DOCUMENT = `
  MATCH (d:Document {id: $id})
  DETACH DELETE d
  RETURN count(d) as deleted
`;

/**
 * List Documents with optional filters
 */
export const LIST_DOCUMENTS = `
  MATCH (d:Document)
  WHERE ($status IS NULL OR d.status = $status)
    AND ($type IS NULL OR d.type = $type)
    AND ($lang IS NULL OR d.lang = $lang)
  RETURN d
  ORDER BY d.created_at DESC
  SKIP $offset
  LIMIT $limit
`;

/**
 * Count Documents with optional filters
 */
export const COUNT_DOCUMENTS = `
  MATCH (d:Document)
  WHERE ($status IS NULL OR d.status = $status)
    AND ($type IS NULL OR d.type = $type)
    AND ($lang IS NULL OR d.lang = $lang)
  RETURN count(d) as total
`;

// ============================================
// DOCUMENT QUERY FUNCTIONS
// ============================================

/**
 * Create a document node in GraphDB
 */
export async function createDocumentNode(params: {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  title: string;
  lang: string;
  storage_key: string;
  summary?: string | null;
}): Promise<DocumentNode> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(CREATE_DOCUMENT, {
      ...params,
      summary: params.summary ?? null,
    });

    const record = result.records[0];
    const node = record.get('d').properties;

    return {
      id: node.id,
      type: node.type as DocumentType,
      status: node.status as DocumentStatus,
      title: node.title,
      lang: node.lang,
      storage_key: node.storage_key,
      summary: node.summary,
      created_at: new Date(node.created_at.toString()),
      updated_at: new Date(node.updated_at.toString()),
    };
  } finally {
    await session.close();
  }
}

/**
 * Get a document node by ID from GraphDB
 */
export async function getDocumentNode(id: string): Promise<DocumentNode | null> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(GET_DOCUMENT_BY_ID, { id });

    if (result.records.length === 0) {
      return null;
    }

    const node = result.records[0].get('d').properties;

    return {
      id: node.id,
      type: node.type as DocumentType,
      status: node.status as DocumentStatus,
      title: node.title,
      lang: node.lang,
      storage_key: node.storage_key,
      summary: node.summary,
      created_at: new Date(node.created_at.toString()),
      updated_at: new Date(node.updated_at.toString()),
    };
  } finally {
    await session.close();
  }
}

/**
 * Update a document node in GraphDB
 */
export async function updateDocumentNode(
  id: string,
  updates: Partial<Pick<DocumentNode, 'title' | 'status'>>
): Promise<DocumentNode | null> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(UPDATE_DOCUMENT, {
      id,
      updates,
    });

    if (result.records.length === 0) {
      return null;
    }

    const node = result.records[0].get('d').properties;

    return {
      id: node.id,
      type: node.type as DocumentType,
      status: node.status as DocumentStatus,
      title: node.title,
      lang: node.lang,
      storage_key: node.storage_key,
      summary: node.summary,
      created_at: new Date(node.created_at.toString()),
      updated_at: new Date(node.updated_at.toString()),
    };
  } finally {
    await session.close();
  }
}

/**
 * Delete a document node from GraphDB
 */
export async function deleteDocumentNode(id: string): Promise<boolean> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(DELETE_DOCUMENT, { id });
    const deleted = result.records[0]?.get('deleted')?.toNumber() ?? 0;
    return deleted > 0;
  } finally {
    await session.close();
  }
}

/**
 * List document nodes with optional filters
 */
export async function listDocumentNodes(params: {
  status?: DocumentStatus | null;
  type?: DocumentType | null;
  lang?: string | null;
  limit: number;
  offset: number;
}): Promise<{ items: DocumentNode[]; total: number }> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    // Get documents
    const listResult = await session.run(LIST_DOCUMENTS, {
      status: params.status ?? null,
      type: params.type ?? null,
      lang: params.lang ?? null,
      limit: params.limit,
      offset: params.offset,
    });

    // Get total count
    const countResult = await session.run(COUNT_DOCUMENTS, {
      status: params.status ?? null,
      type: params.type ?? null,
      lang: params.lang ?? null,
    });

    const items: DocumentNode[] = listResult.records.map((record) => {
      const node = record.get('d').properties;
      return {
        id: String(node.id),
        type: String(node.type) as DocumentType,
        status: String(node.status) as DocumentStatus,
        title: String(node.title),
        lang: String(node.lang),
        storage_key: String(node.storage_key),
        summary: node.summary ? String(node.summary) : null,
        created_at: new Date(String(node.created_at)),
        updated_at: new Date(String(node.updated_at)),
      };
    });

    const total = countResult.records[0]?.get('total')?.toNumber() ?? 0;

    return { items, total };
  } finally {
    await session.close();
  }
}

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

