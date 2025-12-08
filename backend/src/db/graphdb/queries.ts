/**
 * GraphDB (Neo4j) query utilities
 * This file contains reusable Cypher query templates and functions
 */

import neo4j from 'neo4j-driver';
import { v4 as uuidv4 } from 'uuid';
import { getGraphDBConnection } from './connection';
import {
  DocumentNode,
  DocumentStatus,
  DocumentType,
  toDocumentNode,
} from '../../models/graphdb/documentNode';
import {
  AttachmentNode,
  AttachmentFileType,
  HasAttachmentRelationship,
} from '../../models/graphdb/attachmentNode';
import {
  ConceptNode,
  CreateConceptInput,
  UpdateConceptInput,
  toConceptNode,
} from '../../models/graphdb/conceptNode';
import { TagNode, CreateTagInput, UpdateTagInput, toTagNode } from '../../models/graphdb/tagNode';

/**
 * Helper function to get a database session
 */
function getSession() {
  const driver = getGraphDBConnection();
  return driver.session();
}

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
    const deletedValue = result.records[0]?.get('deleted');
    // Handle both Neo4j Integer and regular number (depends on driver config)
    const deleted =
      typeof deletedValue?.toNumber === 'function'
        ? deletedValue.toNumber()
        : Number(deletedValue ?? 0);
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
    // Get documents - use neo4j.int() for integer parameters
    const neo4j = await import('neo4j-driver');
    const listResult = await session.run(LIST_DOCUMENTS, {
      status: params.status ?? null,
      type: params.type ?? null,
      lang: params.lang ?? null,
      limit: neo4j.int(params.limit),
      offset: neo4j.int(params.offset),
    });

    // Get total count
    const countResult = await session.run(COUNT_DOCUMENTS, {
      status: params.status ?? null,
      type: params.type ?? null,
      lang: params.lang ?? null,
    });

    const items: DocumentNode[] = listResult.records.map(record => {
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

    const totalValue = countResult.records[0]?.get('total');
    const total =
      typeof totalValue?.toNumber === 'function' ? totalValue.toNumber() : Number(totalValue ?? 0);

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

// ============================================
// ATTACHMENT CYPHER QUERY TEMPLATES
// ============================================

/**
 * Create an Attachment node
 */
export const CREATE_ATTACHMENT = `
  CREATE (a:Attachment {
    id: $id,
    filename: $filename,
    storage_key: $storage_key,
    mime_type: $mime_type,
    file_type: $file_type,
    size_bytes: $size_bytes,
    checksum: $checksum,
    alt_text: $alt_text,
    created_at: datetime(),
    updated_at: datetime()
  })
  RETURN a
`;

/**
 * Get Attachment by ID
 */
export const GET_ATTACHMENT_BY_ID = `
  MATCH (a:Attachment {id: $id})
  OPTIONAL MATCH (d:Document)-[r:HAS_ATTACHMENT]->(a)
  RETURN a, d.id as document_id, r
`;

/**
 * Delete Attachment node
 */
export const DELETE_ATTACHMENT = `
  MATCH (a:Attachment {id: $id})
  DETACH DELETE a
  RETURN count(a) as deleted
`;

/**
 * List Attachments with optional filters
 * Note: When document_id is provided, only returns attachments linked to that document
 */
export const LIST_ATTACHMENTS = `
  MATCH (a:Attachment)
  WHERE ($file_type IS NULL OR a.file_type = $file_type)
  OPTIONAL MATCH (d:Document)-[r:HAS_ATTACHMENT]->(a)
  WITH a, d, r
  WHERE $document_id IS NULL OR d.id = $document_id
  RETURN a, d.id as document_id, r
  ORDER BY a.created_at DESC
  SKIP $offset
  LIMIT $limit
`;

/**
 * Count Attachments with optional filters
 */
export const COUNT_ATTACHMENTS = `
  MATCH (a:Attachment)
  WHERE ($file_type IS NULL OR a.file_type = $file_type)
  OPTIONAL MATCH (d:Document)-[:HAS_ATTACHMENT]->(a)
  WITH a, d
  WHERE $document_id IS NULL OR d.id = $document_id
  RETURN count(a) as total
`;

/**
 * Create HAS_ATTACHMENT relationship
 */
export const CREATE_HAS_ATTACHMENT = `
  MATCH (d:Document {id: $document_id}), (a:Attachment {id: $attachment_id})
  CREATE (d)-[r:HAS_ATTACHMENT {order: $order, caption: $caption}]->(a)
  RETURN d, a, r
`;

/**
 * Get Attachments for a Document
 */
export const GET_DOCUMENT_ATTACHMENTS = `
  MATCH (d:Document {id: $document_id})-[r:HAS_ATTACHMENT]->(a:Attachment)
  RETURN a, r
  ORDER BY r.order ASC, a.created_at DESC
`;

/**
 * Remove HAS_ATTACHMENT relationship
 */
export const REMOVE_HAS_ATTACHMENT = `
  MATCH (d:Document {id: $document_id})-[r:HAS_ATTACHMENT]->(a:Attachment {id: $attachment_id})
  DELETE r
  RETURN count(r) as deleted
`;

// ============================================
// ATTACHMENT QUERY FUNCTIONS
// ============================================

/**
 * Create an attachment node in GraphDB
 */
export async function createAttachmentNode(params: {
  id: string;
  filename: string;
  storage_key: string;
  mime_type: string;
  file_type: AttachmentFileType;
  size_bytes: number;
  checksum: string | null;
  alt_text: string | null;
}): Promise<AttachmentNode> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(CREATE_ATTACHMENT, params);
    const record = result.records[0];
    const node = record.get('a').properties;

    return {
      id: String(node.id),
      filename: String(node.filename),
      storage_key: String(node.storage_key),
      mime_type: String(node.mime_type),
      file_type: String(node.file_type) as AttachmentFileType,
      size_bytes:
        typeof node.size_bytes?.toNumber === 'function'
          ? node.size_bytes.toNumber()
          : Number(node.size_bytes),
      checksum: node.checksum ? String(node.checksum) : null,
      alt_text: node.alt_text ? String(node.alt_text) : null,
      created_at: new Date(String(node.created_at)),
      updated_at: new Date(String(node.updated_at)),
    };
  } finally {
    await session.close();
  }
}

/**
 * Get an attachment node by ID from GraphDB
 */
export async function getAttachmentNode(
  id: string
): Promise<{ attachment: AttachmentNode; document_id: string | null } | null> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(GET_ATTACHMENT_BY_ID, { id });

    if (result.records.length === 0) {
      return null;
    }

    const record = result.records[0];
    const node = record.get('a').properties;
    const documentId = record.get('document_id');

    return {
      attachment: {
        id: String(node.id),
        filename: String(node.filename),
        storage_key: String(node.storage_key),
        mime_type: String(node.mime_type),
        file_type: String(node.file_type) as AttachmentFileType,
        size_bytes:
          typeof node.size_bytes?.toNumber === 'function'
            ? node.size_bytes.toNumber()
            : Number(node.size_bytes),
        checksum: node.checksum ? String(node.checksum) : null,
        alt_text: node.alt_text ? String(node.alt_text) : null,
        created_at: new Date(String(node.created_at)),
        updated_at: new Date(String(node.updated_at)),
      },
      document_id: documentId ? String(documentId) : null,
    };
  } finally {
    await session.close();
  }
}

/**
 * Delete an attachment node from GraphDB
 */
export async function deleteAttachmentNode(id: string): Promise<boolean> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(DELETE_ATTACHMENT, { id });
    const deletedValue = result.records[0]?.get('deleted');
    const deleted =
      typeof deletedValue?.toNumber === 'function'
        ? deletedValue.toNumber()
        : Number(deletedValue ?? 0);
    return deleted > 0;
  } finally {
    await session.close();
  }
}

/**
 * List attachment nodes with optional filters
 */
export async function listAttachmentNodes(params: {
  document_id?: string | null;
  file_type?: AttachmentFileType | null;
  limit: number;
  offset: number;
}): Promise<{ items: Array<AttachmentNode & { document_id: string | null }>; total: number }> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const neo4j = await import('neo4j-driver');
    const listResult = await session.run(LIST_ATTACHMENTS, {
      document_id: params.document_id ?? null,
      file_type: params.file_type ?? null,
      limit: neo4j.int(params.limit),
      offset: neo4j.int(params.offset),
    });

    const countResult = await session.run(COUNT_ATTACHMENTS, {
      document_id: params.document_id ?? null,
      file_type: params.file_type ?? null,
    });

    const items = listResult.records.map(record => {
      const node = record.get('a').properties;
      const documentId = record.get('document_id');

      return {
        id: String(node.id),
        filename: String(node.filename),
        storage_key: String(node.storage_key),
        mime_type: String(node.mime_type),
        file_type: String(node.file_type) as AttachmentFileType,
        size_bytes:
          typeof node.size_bytes?.toNumber === 'function'
            ? node.size_bytes.toNumber()
            : Number(node.size_bytes),
        checksum: node.checksum ? String(node.checksum) : null,
        alt_text: node.alt_text ? String(node.alt_text) : null,
        created_at: new Date(String(node.created_at)),
        updated_at: new Date(String(node.updated_at)),
        document_id: documentId ? String(documentId) : null,
      };
    });

    const totalValue = countResult.records[0]?.get('total');
    const total =
      typeof totalValue?.toNumber === 'function' ? totalValue.toNumber() : Number(totalValue ?? 0);

    return { items, total };
  } finally {
    await session.close();
  }
}

/**
 * Link attachment to document
 */
export async function linkAttachmentToDocument(params: {
  document_id: string;
  attachment_id: string;
  order?: number;
  caption?: string;
}): Promise<boolean> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(CREATE_HAS_ATTACHMENT, {
      document_id: params.document_id,
      attachment_id: params.attachment_id,
      order: params.order ?? 0,
      caption: params.caption ?? null,
    });
    return result.records.length > 0;
  } finally {
    await session.close();
  }
}

/**
 * Unlink attachment from document
 */
export async function unlinkAttachmentFromDocument(
  documentId: string,
  attachmentId: string
): Promise<boolean> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(REMOVE_HAS_ATTACHMENT, {
      document_id: documentId,
      attachment_id: attachmentId,
    });
    const deletedValue = result.records[0]?.get('deleted');
    const deleted =
      typeof deletedValue?.toNumber === 'function'
        ? deletedValue.toNumber()
        : Number(deletedValue ?? 0);
    return deleted > 0;
  } finally {
    await session.close();
  }
}

/**
 * Get all attachments for a document
 */
export async function getDocumentAttachments(
  documentId: string
): Promise<Array<AttachmentNode & { relationship: HasAttachmentRelationship }>> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(GET_DOCUMENT_ATTACHMENTS, { document_id: documentId });

    return result.records.map(record => {
      const node = record.get('a').properties;
      const rel = record.get('r').properties;

      return {
        id: String(node.id),
        filename: String(node.filename),
        storage_key: String(node.storage_key),
        mime_type: String(node.mime_type),
        file_type: String(node.file_type) as AttachmentFileType,
        size_bytes:
          typeof node.size_bytes?.toNumber === 'function'
            ? node.size_bytes.toNumber()
            : Number(node.size_bytes),
        checksum: node.checksum ? String(node.checksum) : null,
        alt_text: node.alt_text ? String(node.alt_text) : null,
        created_at: new Date(String(node.created_at)),
        updated_at: new Date(String(node.updated_at)),
        relationship: {
          order:
            typeof rel.order?.toNumber === 'function' ? rel.order.toNumber() : Number(rel.order),
          caption: rel.caption ? String(rel.caption) : undefined,
        },
      };
    });
  } finally {
    await session.close();
  }
}

// ============================================================================
// Concept Node Operations
// ============================================================================

/**
 * Cypher query to update a Concept
 */
const UPDATE_CONCEPT = `
  MATCH (c:Concept {id: $id})
  SET c += $updates, c.updated_at = datetime()
  RETURN c
`;

/**
 * Cypher query to delete a Concept
 */
const DELETE_CONCEPT = `
  MATCH (c:Concept {id: $id})
  DETACH DELETE c
  RETURN count(c) as deleted
`;

/**
 * Cypher query to list Concepts with filters
 */
const LIST_CONCEPTS = `
  MATCH (c:Concept)
  WHERE ($category IS NULL OR c.category = $category)
    AND ($lang IS NULL OR c.lang = $lang)
  RETURN c
  ORDER BY c.term ASC
  SKIP $offset
  LIMIT $limit
`;

/**
 * Cypher query to count Concepts
 */
const COUNT_CONCEPTS = `
  MATCH (c:Concept)
  WHERE ($category IS NULL OR c.category = $category)
    AND ($lang IS NULL OR c.lang = $lang)
  RETURN count(c) as total
`;

/**
 * Cypher query to link Document to Concept
 */
const LINK_DOCUMENT_TO_CONCEPT = `
  MATCH (d:Document {id: $document_id})
  MATCH (c:Concept {id: $concept_id})
  MERGE (d)-[r:USES_CONCEPT]->(c)
  RETURN r
`;

/**
 * Cypher query to unlink Document from Concept
 */
const UNLINK_DOCUMENT_FROM_CONCEPT = `
  MATCH (d:Document {id: $document_id})-[r:USES_CONCEPT]->(c:Concept {id: $concept_id})
  DELETE r
  RETURN count(r) as deleted
`;

/**
 * Create a new Concept node in GraphDB
 */
export async function createConceptNode(input: CreateConceptInput): Promise<ConceptNode> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(CREATE_CONCEPT, {
      id: input.id,
      term: input.term,
      category: input.category || null,
      lang: input.lang,
      description: input.description,
    });

    const record = result.records[0];
    if (!record) {
      throw new Error('Failed to create concept node');
    }

    const node = record.get('c').properties;
    return toConceptNode({
      ...node,
      created_at: node.created_at.toString(),
      updated_at: node.updated_at.toString(),
    });
  } finally {
    await session.close();
  }
}

/**
 * Get a Concept node by ID
 */
export async function getConceptNode(id: string): Promise<ConceptNode | null> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(GET_CONCEPT_BY_ID, { id });

    if (result.records.length === 0) {
      return null;
    }

    const node = result.records[0].get('c').properties;
    return toConceptNode({
      ...node,
      created_at: node.created_at.toString(),
      updated_at: node.updated_at.toString(),
    });
  } finally {
    await session.close();
  }
}

/**
 * Update an existing Concept node
 */
export async function updateConceptNode(
  id: string,
  updates: UpdateConceptInput
): Promise<ConceptNode | null> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    // Filter out undefined values
    const cleanUpdates: Record<string, unknown> = {};
    if (updates.term !== undefined) cleanUpdates.term = updates.term;
    if (updates.category !== undefined) cleanUpdates.category = updates.category;
    if (updates.description !== undefined) cleanUpdates.description = updates.description;

    const result = await session.run(UPDATE_CONCEPT, {
      id,
      updates: cleanUpdates,
    });

    if (result.records.length === 0) {
      return null;
    }

    const node = result.records[0].get('c').properties;
    return toConceptNode({
      ...node,
      created_at: node.created_at.toString(),
      updated_at: node.updated_at.toString(),
    });
  } finally {
    await session.close();
  }
}

/**
 * Delete a Concept node
 */
export async function deleteConceptNode(id: string): Promise<boolean> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(DELETE_CONCEPT, { id });
    const deleted = result.records[0]?.get('deleted')?.toNumber?.() ?? 0;
    return deleted > 0;
  } finally {
    await session.close();
  }
}

/**
 * Query parameters for listing Concepts
 */
export interface ListConceptsQuery {
  category?: string;
  lang?: string;
  limit: number;
  offset: number;
}

/**
 * List Concepts with filters and pagination
 */
export async function listConceptNodes(
  query: ListConceptsQuery
): Promise<{ items: ConceptNode[]; total: number }> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const params = {
      category: query.category || null,
      lang: query.lang || null,
      limit: neo4j.int(query.limit),
      offset: neo4j.int(query.offset),
    };

    // Get items
    const itemsResult = await session.run(LIST_CONCEPTS, params);
    const items = itemsResult.records.map(record => {
      const node = record.get('c').properties;
      return toConceptNode({
        ...node,
        created_at: node.created_at.toString(),
        updated_at: node.updated_at.toString(),
      });
    });

    // Get total count
    const countResult = await session.run(COUNT_CONCEPTS, {
      category: query.category || null,
      lang: query.lang || null,
    });
    const total = countResult.records[0]?.get('total')?.toNumber?.() ?? 0;

    return { items, total };
  } finally {
    await session.close();
  }
}

/**
 * Get documents using a concept (Impact Analysis)
 */
export async function getDocumentsUsingConcept(
  conceptId: string
): Promise<{ items: DocumentNode[]; total: number } | null> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    // First check if concept exists
    const conceptResult = await session.run(GET_CONCEPT_BY_ID, { id: conceptId });
    if (conceptResult.records.length === 0) {
      return null;
    }

    // Get documents using this concept
    const result = await session.run(GET_DOCUMENTS_USING_CONCEPT, { concept_id: conceptId });

    const items = result.records.map(record => {
      const node = record.get('d').properties;
      return toDocumentNode({
        ...node,
        created_at: node.created_at.toString(),
        updated_at: node.updated_at.toString(),
      });
    });

    return { items, total: items.length };
  } finally {
    await session.close();
  }
}

/**
 * Link a document to a concept
 */
export async function linkDocumentToConcept(
  documentId: string,
  conceptId: string
): Promise<boolean> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(LINK_DOCUMENT_TO_CONCEPT, {
      document_id: documentId,
      concept_id: conceptId,
    });
    return result.records.length > 0;
  } finally {
    await session.close();
  }
}

/**
 * Unlink a document from a concept
 */
export async function unlinkDocumentFromConcept(
  documentId: string,
  conceptId: string
): Promise<boolean> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(UNLINK_DOCUMENT_FROM_CONCEPT, {
      document_id: documentId,
      concept_id: conceptId,
    });
    const deleted = result.records[0]?.get('deleted')?.toNumber?.() ?? 0;
    return deleted > 0;
  } finally {
    await session.close();
  }
}

// ============================================================================
// Version Node Operations
// ============================================================================

import {
  VersionNode,
  CreateVersionInput,
  UpdateVersionInput,
  toVersionNode,
} from '../../models/graphdb/versionNode';
import {
  PageNode,
  CreatePageInput,
  UpdatePageInput,
  toPageNode,
  NavigationItem,
} from '../../models/graphdb/pageNode';

/**
 * Create a new Version node
 */
export async function createVersionNode(input: CreateVersionInput): Promise<VersionNode> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(CREATE_VERSION, {
      id: input.id,
      version: input.version,
      name: input.name,
      description: input.description || null,
      is_public: input.is_public,
      is_main: input.is_main,
    });

    const record = result.records[0];
    if (!record) {
      throw new Error('Failed to create version node');
    }

    const node = record.get('v').properties;
    return toVersionNode({
      ...node,
      created_at: node.created_at.toString(),
      updated_at: node.updated_at.toString(),
    });
  } finally {
    await session.close();
  }
}

/**
 * Get a Version node by ID
 */
export async function getVersionNode(id: string): Promise<VersionNode | null> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run('MATCH (v:Version {id: $id}) RETURN v', { id });

    if (result.records.length === 0) {
      return null;
    }

    const node = result.records[0].get('v').properties;
    return toVersionNode({
      ...node,
      created_at: node.created_at.toString(),
      updated_at: node.updated_at.toString(),
    });
  } finally {
    await session.close();
  }
}

/**
 * Update an existing Version node
 */
export async function updateVersionNode(
  id: string,
  updates: UpdateVersionInput
): Promise<VersionNode | null> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const cleanUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) cleanUpdates.name = updates.name;
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.is_public !== undefined) cleanUpdates.is_public = updates.is_public;
    if (updates.is_main !== undefined) cleanUpdates.is_main = updates.is_main;

    const result = await session.run(
      'MATCH (v:Version {id: $id}) SET v += $updates, v.updated_at = datetime() RETURN v',
      { id, updates: cleanUpdates }
    );

    if (result.records.length === 0) {
      return null;
    }

    const node = result.records[0].get('v').properties;
    return toVersionNode({
      ...node,
      created_at: node.created_at.toString(),
      updated_at: node.updated_at.toString(),
    });
  } finally {
    await session.close();
  }
}

/**
 * Delete a Version node
 */
export async function deleteVersionNode(id: string): Promise<boolean> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(
      'MATCH (v:Version {id: $id}) DETACH DELETE v RETURN count(v) as deleted',
      { id }
    );
    const deleted = result.records[0]?.get('deleted')?.toNumber?.() ?? 0;
    return deleted > 0;
  } finally {
    await session.close();
  }
}

/**
 * List Version nodes with filters
 */
export async function listVersionNodes(query: {
  is_public?: boolean;
  limit: number;
  offset: number;
}): Promise<{ items: VersionNode[]; total: number }> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const params = {
      is_public: query.is_public ?? null,
      limit: neo4j.int(query.limit),
      offset: neo4j.int(query.offset),
    };

    const itemsResult = await session.run(
      `MATCH (v:Version)
       WHERE $is_public IS NULL OR v.is_public = $is_public
       RETURN v
       ORDER BY v.created_at DESC
       SKIP $offset
       LIMIT $limit`,
      params
    );

    const items = itemsResult.records.map(record => {
      const node = record.get('v').properties;
      return toVersionNode({
        ...node,
        created_at: node.created_at.toString(),
        updated_at: node.updated_at.toString(),
      });
    });

    const countResult = await session.run(
      `MATCH (v:Version)
       WHERE $is_public IS NULL OR v.is_public = $is_public
       RETURN count(v) as total`,
      { is_public: query.is_public ?? null }
    );
    const total = countResult.records[0]?.get('total')?.toNumber?.() ?? 0;

    return { items, total };
  } finally {
    await session.close();
  }
}

// ============================================================================
// Page Node Operations
// ============================================================================

/**
 * Create a new Page node
 */
export async function createPageNode(input: CreatePageInput): Promise<PageNode> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    // Create page and link to version
    const result = await session.run(
      `CREATE (p:Page {
        id: $id,
        slug: $slug,
        title: $title,
        order: $order,
        visible: $visible,
        created_at: datetime(),
        updated_at: datetime()
      })
      WITH p
      MATCH (v:Version {id: $version_id})
      CREATE (p)-[:IN_VERSION]->(v)
      RETURN p`,
      {
        id: input.id,
        slug: input.slug,
        title: input.title,
        order: neo4j.int(input.order ?? 0),
        visible: input.visible ?? false,
        version_id: input.version_id,
      }
    );

    const record = result.records[0];
    if (!record) {
      throw new Error('Failed to create page node');
    }

    // Create parent relationship if provided
    if (input.parent_page_id) {
      await session.run(
        `MATCH (child:Page {id: $child_id}), (parent:Page {id: $parent_id})
         CREATE (child)-[:CHILD_OF]->(parent)`,
        { child_id: input.id, parent_id: input.parent_page_id }
      );
    }

    const node = record.get('p').properties;
    return toPageNode({
      ...node,
      order: typeof node.order?.toNumber === 'function' ? node.order.toNumber() : node.order,
      created_at: node.created_at.toString(),
      updated_at: node.updated_at.toString(),
    });
  } finally {
    await session.close();
  }
}

/**
 * Get a Page node by ID
 */
export async function getPageNode(id: string): Promise<PageNode | null> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run('MATCH (p:Page {id: $id}) RETURN p', { id });

    if (result.records.length === 0) {
      return null;
    }

    const node = result.records[0].get('p').properties;
    return toPageNode({
      ...node,
      order: typeof node.order?.toNumber === 'function' ? node.order.toNumber() : node.order,
      created_at: node.created_at.toString(),
      updated_at: node.updated_at.toString(),
    });
  } finally {
    await session.close();
  }
}

/**
 * Update an existing Page node
 */
export async function updatePageNode(
  id: string,
  updates: UpdatePageInput
): Promise<PageNode | null> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const cleanUpdates: Record<string, unknown> = {};
    if (updates.slug !== undefined) cleanUpdates.slug = updates.slug;
    if (updates.title !== undefined) cleanUpdates.title = updates.title;
    if (updates.order !== undefined) cleanUpdates.order = neo4j.int(updates.order);
    if (updates.visible !== undefined) cleanUpdates.visible = updates.visible;

    const result = await session.run(
      'MATCH (p:Page {id: $id}) SET p += $updates, p.updated_at = datetime() RETURN p',
      { id, updates: cleanUpdates }
    );

    if (result.records.length === 0) {
      return null;
    }

    const node = result.records[0].get('p').properties;
    return toPageNode({
      ...node,
      order: typeof node.order?.toNumber === 'function' ? node.order.toNumber() : node.order,
      created_at: node.created_at.toString(),
      updated_at: node.updated_at.toString(),
    });
  } finally {
    await session.close();
  }
}

/**
 * Delete a Page node
 */
export async function deletePageNode(id: string): Promise<boolean> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(
      'MATCH (p:Page {id: $id}) DETACH DELETE p RETURN count(p) as deleted',
      { id }
    );
    const deleted = result.records[0]?.get('deleted')?.toNumber?.() ?? 0;
    return deleted > 0;
  } finally {
    await session.close();
  }
}

/**
 * List Page nodes with filters
 */
export async function listPageNodes(query: {
  version_id?: string;
  visible?: boolean;
  limit: number;
  offset: number;
}): Promise<{ items: PageNode[]; total: number }> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const params = {
      version_id: query.version_id ?? null,
      visible: query.visible ?? null,
      limit: neo4j.int(query.limit),
      offset: neo4j.int(query.offset),
    };

    const itemsResult = await session.run(
      `MATCH (p:Page)
       OPTIONAL MATCH (p)-[:IN_VERSION]->(v:Version)
       WHERE ($version_id IS NULL OR v.id = $version_id)
         AND ($visible IS NULL OR p.visible = $visible)
       RETURN p
       ORDER BY p.order ASC, p.created_at DESC
       SKIP $offset
       LIMIT $limit`,
      params
    );

    const items = itemsResult.records.map(record => {
      const node = record.get('p').properties;
      return toPageNode({
        ...node,
        order: typeof node.order?.toNumber === 'function' ? node.order.toNumber() : node.order,
        created_at: node.created_at.toString(),
        updated_at: node.updated_at.toString(),
      });
    });

    const countResult = await session.run(
      `MATCH (p:Page)
       OPTIONAL MATCH (p)-[:IN_VERSION]->(v:Version)
       WHERE ($version_id IS NULL OR v.id = $version_id)
         AND ($visible IS NULL OR p.visible = $visible)
       RETURN count(p) as total`,
      { version_id: query.version_id ?? null, visible: query.visible ?? null }
    );
    const total = countResult.records[0]?.get('total')?.toNumber?.() ?? 0;

    return { items, total };
  } finally {
    await session.close();
  }
}

/**
 * Link page to document
 */
export async function linkPageToDocument(
  pageId: string,
  documentId: string
): Promise<{ page_id: string; document_id: string } | null> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (p:Page {id: $page_id}), (d:Document {id: $document_id})
       MERGE (p)-[r:DISPLAYS]->(d)
       RETURN p.id as page_id, d.id as document_id`,
      { page_id: pageId, document_id: documentId }
    );

    if (result.records.length === 0) {
      return null;
    }

    return {
      page_id: result.records[0].get('page_id'),
      document_id: result.records[0].get('document_id'),
    };
  } finally {
    await session.close();
  }
}

/**
 * Get navigation tree for a version
 */
export async function getNavigationTree(
  versionId: string
): Promise<{ pages: NavigationItem[] } | null> {
  const driver = getGraphDBConnection();
  const session = driver.session();

  try {
    // Check if version exists
    const versionResult = await session.run('MATCH (v:Version {id: $id}) RETURN v', {
      id: versionId,
    });

    if (versionResult.records.length === 0) {
      return null;
    }

    // Get all pages for this version with their relationships
    const pagesResult = await session.run(
      `MATCH (v:Version {id: $version_id})<-[:IN_VERSION]-(p:Page)
       WHERE p.visible = true
       OPTIONAL MATCH (p)-[:CHILD_OF]->(parent:Page)
       OPTIONAL MATCH (p)-[:DISPLAYS]->(d:Document)
       RETURN p, parent.id as parent_id, d.id as document_id
       ORDER BY p.order ASC`,
      { version_id: versionId }
    );

    // Build page map
    const pageMap = new Map<string, NavigationItem>();
    const rootPages: NavigationItem[] = [];

    pagesResult.records.forEach(record => {
      const node = record.get('p').properties;
      const parentId = record.get('parent_id');
      const documentId = record.get('document_id');

      const item: NavigationItem = {
        id: String(node.id),
        slug: String(node.slug),
        title: String(node.title),
        order:
          typeof node.order?.toNumber === 'function' ? node.order.toNumber() : Number(node.order),
        visible: Boolean(node.visible),
        document_id: documentId ? String(documentId) : null,
        children: [],
      };

      pageMap.set(item.id, item);

      if (!parentId) {
        rootPages.push(item);
      }
    });

    // Build tree structure
    pagesResult.records.forEach(record => {
      const node = record.get('p').properties;
      const parentId = record.get('parent_id');

      if (parentId) {
        const parent = pageMap.get(String(parentId));
        const child = pageMap.get(String(node.id));
        if (parent && child) {
          parent.children.push(child);
        }
      }
    });

    // Sort children by order
    const sortChildren = (items: NavigationItem[]) => {
      items.sort((a, b) => a.order - b.order);
      items.forEach(item => sortChildren(item.children));
    };
    sortChildren(rootPages);

    return { pages: rootPages };
  } finally {
    await session.close();
  }
}

// ============================================================================
// TAG QUERIES
// ============================================================================

/** Create a new Tag node */
const CREATE_TAG = `
  CREATE (t:Tag {
    id: $id,
    name: $name,
    color: $color,
    description: $description,
    created_at: datetime(),
    updated_at: datetime()
  })
  RETURN t
`;

/** Get Tag by ID */
const GET_TAG_BY_ID = `
  MATCH (t:Tag {id: $id})
  RETURN t
`;

/** Get Tag by name */
const GET_TAG_BY_NAME = `
  MATCH (t:Tag {name: $name})
  RETURN t
`;

/** Update Tag node */
const UPDATE_TAG = `
  MATCH (t:Tag {id: $id})
  SET t.name = COALESCE($name, t.name),
      t.color = CASE WHEN $color IS NULL THEN t.color ELSE $color END,
      t.description = CASE WHEN $description IS NULL THEN t.description ELSE $description END,
      t.updated_at = datetime()
  RETURN t
`;

/** Delete Tag node */
const DELETE_TAG = `
  MATCH (t:Tag {id: $id})
  DETACH DELETE t
  RETURN COUNT(*) AS deleted
`;

/** List Tag nodes with pagination */
const LIST_TAGS = `
  MATCH (t:Tag)
  WHERE ($search IS NULL OR t.name CONTAINS $search OR t.description CONTAINS $search)
  RETURN t
  ORDER BY t.name ASC
  SKIP $offset
  LIMIT $limit
`;

/** Count Tag nodes */
const COUNT_TAGS = `
  MATCH (t:Tag)
  WHERE ($search IS NULL OR t.name CONTAINS $search OR t.description CONTAINS $search)
  RETURN COUNT(t) AS count
`;

/**
 * Create a new Tag node
 */
export async function createTagNode(input: CreateTagInput): Promise<TagNode> {
  const session = getSession();
  const id = uuidv4();

  try {
    const result = await session.run(CREATE_TAG, {
      id,
      name: input.name,
      color: input.color || null,
      description: input.description || null,
    });

    const record = result.records[0].get('t').properties;
    return toTagNode(record);
  } finally {
    await session.close();
  }
}

/**
 * Get Tag node by ID
 */
export async function getTagNode(id: string): Promise<TagNode | null> {
  const session = getSession();

  try {
    const result = await session.run(GET_TAG_BY_ID, { id });

    if (result.records.length === 0) {
      return null;
    }

    const record = result.records[0].get('t').properties;
    return toTagNode(record);
  } finally {
    await session.close();
  }
}

/**
 * Get Tag node by name
 */
export async function getTagNodeByName(name: string): Promise<TagNode | null> {
  const session = getSession();

  try {
    const result = await session.run(GET_TAG_BY_NAME, { name });

    if (result.records.length === 0) {
      return null;
    }

    const record = result.records[0].get('t').properties;
    return toTagNode(record);
  } finally {
    await session.close();
  }
}

/**
 * Update Tag node
 */
export async function updateTagNode(id: string, input: UpdateTagInput): Promise<TagNode | null> {
  const session = getSession();

  try {
    const result = await session.run(UPDATE_TAG, {
      id,
      name: input.name ?? null,
      color: input.color ?? null,
      description: input.description ?? null,
    });

    if (result.records.length === 0) {
      return null;
    }

    const record = result.records[0].get('t').properties;
    return toTagNode(record);
  } finally {
    await session.close();
  }
}

/**
 * Delete Tag node
 */
export async function deleteTagNode(id: string): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(DELETE_TAG, { id });
    const deleted = result.records[0].get('deleted').toNumber();
    return deleted > 0;
  } finally {
    await session.close();
  }
}

/**
 * List Tag nodes with pagination
 */
export async function listTagNodes(options: {
  limit: number;
  offset: number;
  search?: string;
}): Promise<{ items: TagNode[]; total: number }> {
  const session = getSession();

  try {
    const [listResult, countResult] = await Promise.all([
      session.run(LIST_TAGS, {
        limit: neo4j.int(options.limit),
        offset: neo4j.int(options.offset),
        search: options.search || null,
      }),
      session.run(COUNT_TAGS, {
        search: options.search || null,
      }),
    ]);

    const items = listResult.records.map(record => toTagNode(record.get('t').properties));
    const total = countResult.records[0].get('count').toNumber();

    return { items, total };
  } finally {
    await session.close();
  }
}

// ============================================================================
// HAS_TAG RELATIONSHIP QUERIES
// ============================================================================

/** Link Document to Tag */
const LINK_DOCUMENT_TO_TAG = `
  MATCH (d:Document {id: $documentId})
  MATCH (t:Tag {id: $tagId})
  MERGE (d)-[r:HAS_TAG]->(t)
  RETURN d, t
`;

/** Unlink Document from Tag */
const UNLINK_DOCUMENT_FROM_TAG = `
  MATCH (d:Document {id: $documentId})-[r:HAS_TAG]->(t:Tag {id: $tagId})
  DELETE r
  RETURN COUNT(*) AS deleted
`;

/** Get Tags for Document */
const GET_TAGS_FOR_DOCUMENT = `
  MATCH (d:Document {id: $documentId})-[:HAS_TAG]->(t:Tag)
  RETURN t
  ORDER BY t.name ASC
`;

/** Link Concept to Tag */
const LINK_CONCEPT_TO_TAG = `
  MATCH (c:Concept {id: $conceptId})
  MATCH (t:Tag {id: $tagId})
  MERGE (c)-[r:HAS_TAG]->(t)
  RETURN c, t
`;

/** Unlink Concept from Tag */
const UNLINK_CONCEPT_FROM_TAG = `
  MATCH (c:Concept {id: $conceptId})-[r:HAS_TAG]->(t:Tag {id: $tagId})
  DELETE r
  RETURN COUNT(*) AS deleted
`;

/** Get Tags for Concept */
const GET_TAGS_FOR_CONCEPT = `
  MATCH (c:Concept {id: $conceptId})-[:HAS_TAG]->(t:Tag)
  RETURN t
  ORDER BY t.name ASC
`;

/** Link Page to Tag */
const LINK_PAGE_TO_TAG = `
  MATCH (p:Page {id: $pageId})
  MATCH (t:Tag {id: $tagId})
  MERGE (p)-[r:HAS_TAG]->(t)
  RETURN p, t
`;

/** Unlink Page from Tag */
const UNLINK_PAGE_FROM_TAG = `
  MATCH (p:Page {id: $pageId})-[r:HAS_TAG]->(t:Tag {id: $tagId})
  DELETE r
  RETURN COUNT(*) AS deleted
`;

/** Get Tags for Page */
const GET_TAGS_FOR_PAGE = `
  MATCH (p:Page {id: $pageId})-[:HAS_TAG]->(t:Tag)
  RETURN t
  ORDER BY t.name ASC
`;

/** Get entities with a specific Tag */
const GET_ENTITIES_WITH_TAG = `
  MATCH (entity)-[:HAS_TAG]->(t:Tag {id: $tagId})
  RETURN entity, labels(entity) AS labels
`;

/**
 * Link Document to Tag
 */
export async function linkDocumentToTag(documentId: string, tagId: string): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(LINK_DOCUMENT_TO_TAG, { documentId, tagId });
    return result.records.length > 0;
  } finally {
    await session.close();
  }
}

/**
 * Unlink Document from Tag
 */
export async function unlinkDocumentFromTag(documentId: string, tagId: string): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(UNLINK_DOCUMENT_FROM_TAG, { documentId, tagId });
    const deleted = result.records[0].get('deleted').toNumber();
    return deleted > 0;
  } finally {
    await session.close();
  }
}

/**
 * Get Tags for Document
 */
export async function getTagsForDocument(documentId: string): Promise<TagNode[]> {
  const session = getSession();

  try {
    const result = await session.run(GET_TAGS_FOR_DOCUMENT, { documentId });
    return result.records.map(record => toTagNode(record.get('t').properties));
  } finally {
    await session.close();
  }
}

/**
 * Link Concept to Tag
 */
export async function linkConceptToTag(conceptId: string, tagId: string): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(LINK_CONCEPT_TO_TAG, { conceptId, tagId });
    return result.records.length > 0;
  } finally {
    await session.close();
  }
}

/**
 * Unlink Concept from Tag
 */
export async function unlinkConceptFromTag(conceptId: string, tagId: string): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(UNLINK_CONCEPT_FROM_TAG, { conceptId, tagId });
    const deleted = result.records[0].get('deleted').toNumber();
    return deleted > 0;
  } finally {
    await session.close();
  }
}

/**
 * Get Tags for Concept
 */
export async function getTagsForConcept(conceptId: string): Promise<TagNode[]> {
  const session = getSession();

  try {
    const result = await session.run(GET_TAGS_FOR_CONCEPT, { conceptId });
    return result.records.map(record => toTagNode(record.get('t').properties));
  } finally {
    await session.close();
  }
}

/**
 * Link Page to Tag
 */
export async function linkPageToTag(pageId: string, tagId: string): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(LINK_PAGE_TO_TAG, { pageId, tagId });
    return result.records.length > 0;
  } finally {
    await session.close();
  }
}

/**
 * Unlink Page from Tag
 */
export async function unlinkPageFromTag(pageId: string, tagId: string): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(UNLINK_PAGE_FROM_TAG, { pageId, tagId });
    const deleted = result.records[0].get('deleted').toNumber();
    return deleted > 0;
  } finally {
    await session.close();
  }
}

/**
 * Get Tags for Page
 */
export async function getTagsForPage(pageId: string): Promise<TagNode[]> {
  const session = getSession();

  try {
    const result = await session.run(GET_TAGS_FOR_PAGE, { pageId });
    return result.records.map(record => toTagNode(record.get('t').properties));
  } finally {
    await session.close();
  }
}

/**
 * Entity with Tag result
 */
export interface EntityWithTag {
  id: string;
  type: 'Document' | 'Concept' | 'Page';
  [key: string]: unknown;
}

/**
 * Get all entities with a specific Tag
 */
export async function getEntitiesWithTag(tagId: string): Promise<EntityWithTag[]> {
  const session = getSession();

  try {
    const result = await session.run(GET_ENTITIES_WITH_TAG, { tagId });
    return result.records.map(record => {
      const entity = record.get('entity').properties;
      const labels = record.get('labels') as string[];
      let type: 'Document' | 'Concept' | 'Page' = 'Document';
      if (labels.includes('Concept')) type = 'Concept';
      else if (labels.includes('Page')) type = 'Page';

      return {
        id: String(entity.id),
        type,
        ...entity,
      };
    });
  } finally {
    await session.close();
  }
}

// ============================================================================
// CONCEPT RELATIONSHIP QUERIES (SUBTYPE_OF, PART_OF, SYNONYM_OF)
// ============================================================================

/** Link Concept as subtype of another Concept */
const LINK_CONCEPT_SUBTYPE_OF = `
  MATCH (child:Concept {id: $childId})
  MATCH (parent:Concept {id: $parentId})
  MERGE (child)-[r:SUBTYPE_OF]->(parent)
  RETURN child, parent
`;

/** Unlink Concept subtype relationship */
const UNLINK_CONCEPT_SUBTYPE_OF = `
  MATCH (child:Concept {id: $childId})-[r:SUBTYPE_OF]->(parent:Concept {id: $parentId})
  DELETE r
  RETURN COUNT(*) AS deleted
`;

/** Get parent Concepts (supertype) */
const GET_CONCEPT_SUPERTYPES = `
  MATCH (c:Concept {id: $conceptId})-[:SUBTYPE_OF]->(parent:Concept)
  RETURN parent
`;

/** Get child Concepts (subtypes) */
const GET_CONCEPT_SUBTYPES = `
  MATCH (c:Concept {id: $conceptId})<-[:SUBTYPE_OF]-(child:Concept)
  RETURN child
`;

/** Link Concept as part of another Concept */
const LINK_CONCEPT_PART_OF = `
  MATCH (part:Concept {id: $partId})
  MATCH (whole:Concept {id: $wholeId})
  MERGE (part)-[r:PART_OF]->(whole)
  RETURN part, whole
`;

/** Unlink Concept part-of relationship */
const UNLINK_CONCEPT_PART_OF = `
  MATCH (part:Concept {id: $partId})-[r:PART_OF]->(whole:Concept {id: $wholeId})
  DELETE r
  RETURN COUNT(*) AS deleted
`;

/** Get whole Concepts (what this is part of) */
const GET_CONCEPT_WHOLE_OF = `
  MATCH (c:Concept {id: $conceptId})-[:PART_OF]->(whole:Concept)
  RETURN whole
`;

/** Get part Concepts (parts of this) */
const GET_CONCEPT_PARTS = `
  MATCH (c:Concept {id: $conceptId})<-[:PART_OF]-(part:Concept)
  RETURN part
`;

/** Link Concept as synonym of another Concept */
const LINK_CONCEPT_SYNONYM_OF = `
  MATCH (c1:Concept {id: $conceptId1})
  MATCH (c2:Concept {id: $conceptId2})
  MERGE (c1)-[r:SYNONYM_OF]->(c2)
  RETURN c1, c2
`;

/** Unlink Concept synonym relationship */
const UNLINK_CONCEPT_SYNONYM_OF = `
  MATCH (c1:Concept {id: $conceptId1})-[r:SYNONYM_OF]->(c2:Concept {id: $conceptId2})
  DELETE r
  RETURN COUNT(*) AS deleted
`;

/** Get synonyms of a Concept (bidirectional) */
const GET_CONCEPT_SYNONYMS = `
  MATCH (c:Concept {id: $conceptId})
  OPTIONAL MATCH (c)-[:SYNONYM_OF]->(s1:Concept)
  OPTIONAL MATCH (c)<-[:SYNONYM_OF]-(s2:Concept)
  WITH c, COLLECT(DISTINCT s1) + COLLECT(DISTINCT s2) AS synonyms
  UNWIND synonyms AS synonym
  RETURN DISTINCT synonym
`;

/**
 * Link Concept as subtype of another Concept
 */
export async function linkConceptSubtypeOf(childId: string, parentId: string): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(LINK_CONCEPT_SUBTYPE_OF, { childId, parentId });
    return result.records.length > 0;
  } finally {
    await session.close();
  }
}

/**
 * Unlink Concept subtype relationship
 */
export async function unlinkConceptSubtypeOf(childId: string, parentId: string): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(UNLINK_CONCEPT_SUBTYPE_OF, { childId, parentId });
    const deleted = result.records[0].get('deleted').toNumber();
    return deleted > 0;
  } finally {
    await session.close();
  }
}

/**
 * Get parent Concepts (supertypes)
 */
export async function getConceptSupertypes(conceptId: string): Promise<ConceptNode[]> {
  const session = getSession();

  try {
    const result = await session.run(GET_CONCEPT_SUPERTYPES, { conceptId });
    return result.records.map(record => toConceptNode(record.get('parent').properties));
  } finally {
    await session.close();
  }
}

/**
 * Get child Concepts (subtypes)
 */
export async function getConceptSubtypes(conceptId: string): Promise<ConceptNode[]> {
  const session = getSession();

  try {
    const result = await session.run(GET_CONCEPT_SUBTYPES, { conceptId });
    return result.records.map(record => toConceptNode(record.get('child').properties));
  } finally {
    await session.close();
  }
}

/**
 * Link Concept as part of another Concept
 */
export async function linkConceptPartOf(partId: string, wholeId: string): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(LINK_CONCEPT_PART_OF, { partId, wholeId });
    return result.records.length > 0;
  } finally {
    await session.close();
  }
}

/**
 * Unlink Concept part-of relationship
 */
export async function unlinkConceptPartOf(partId: string, wholeId: string): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(UNLINK_CONCEPT_PART_OF, { partId, wholeId });
    const deleted = result.records[0].get('deleted').toNumber();
    return deleted > 0;
  } finally {
    await session.close();
  }
}

/**
 * Get whole Concepts (what this is part of)
 */
export async function getConceptWholeOf(conceptId: string): Promise<ConceptNode[]> {
  const session = getSession();

  try {
    const result = await session.run(GET_CONCEPT_WHOLE_OF, { conceptId });
    return result.records.map(record => toConceptNode(record.get('whole').properties));
  } finally {
    await session.close();
  }
}

/**
 * Get part Concepts (parts of this)
 */
export async function getConceptParts(conceptId: string): Promise<ConceptNode[]> {
  const session = getSession();

  try {
    const result = await session.run(GET_CONCEPT_PARTS, { conceptId });
    return result.records.map(record => toConceptNode(record.get('part').properties));
  } finally {
    await session.close();
  }
}

/**
 * Link Concept as synonym of another Concept
 */
export async function linkConceptSynonymOf(
  conceptId1: string,
  conceptId2: string
): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(LINK_CONCEPT_SYNONYM_OF, { conceptId1, conceptId2 });
    return result.records.length > 0;
  } finally {
    await session.close();
  }
}

/**
 * Unlink Concept synonym relationship
 */
export async function unlinkConceptSynonymOf(
  conceptId1: string,
  conceptId2: string
): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(UNLINK_CONCEPT_SYNONYM_OF, { conceptId1, conceptId2 });
    const deleted = result.records[0].get('deleted').toNumber();
    return deleted > 0;
  } finally {
    await session.close();
  }
}

/**
 * Get synonyms of a Concept (bidirectional)
 */
export async function getConceptSynonyms(conceptId: string): Promise<ConceptNode[]> {
  const session = getSession();

  try {
    const result = await session.run(GET_CONCEPT_SYNONYMS, { conceptId });
    return result.records
      .filter(record => record.get('synonym') !== null)
      .map(record => toConceptNode(record.get('synonym').properties));
  } finally {
    await session.close();
  }
}

// ============================================================================
// DOCUMENT RELATIONSHIP QUERIES (LINKS_TO, WORKING_COPY_OF)
// ============================================================================

/** Link Document to another Document */
const LINK_DOCUMENT_TO_DOCUMENT = `
  MATCH (source:Document {id: $sourceId})
  MATCH (target:Document {id: $targetId})
  MERGE (source)-[r:LINKS_TO]->(target)
  RETURN source, target
`;

/** Unlink Document from another Document */
const UNLINK_DOCUMENT_FROM_DOCUMENT = `
  MATCH (source:Document {id: $sourceId})-[r:LINKS_TO]->(target:Document {id: $targetId})
  DELETE r
  RETURN COUNT(*) AS deleted
`;

/** Get Documents that this Document links to */
const GET_LINKED_DOCUMENTS = `
  MATCH (d:Document {id: $documentId})-[:LINKS_TO]->(linked:Document)
  RETURN linked
`;

/** Get Documents that link to this Document */
const GET_LINKING_DOCUMENTS = `
  MATCH (d:Document {id: $documentId})<-[:LINKS_TO]-(linking:Document)
  RETURN linking
`;

/** Create working copy relationship */
const CREATE_WORKING_COPY = `
  MATCH (copy:Document {id: $copyId})
  MATCH (original:Document {id: $originalId})
  MERGE (copy)-[r:WORKING_COPY_OF]->(original)
  RETURN copy, original
`;

/** Remove working copy relationship */
const REMOVE_WORKING_COPY = `
  MATCH (copy:Document {id: $copyId})-[r:WORKING_COPY_OF]->(original:Document {id: $originalId})
  DELETE r
  RETURN COUNT(*) AS deleted
`;

/** Get original document of a working copy */
const GET_ORIGINAL_DOCUMENT = `
  MATCH (d:Document {id: $documentId})-[:WORKING_COPY_OF]->(original:Document)
  RETURN original
`;

/** Get working copies of a document */
const GET_WORKING_COPIES = `
  MATCH (d:Document {id: $documentId})<-[:WORKING_COPY_OF]-(copy:Document)
  RETURN copy
`;

/**
 * Link Document to another Document
 */
export async function linkDocumentToDocument(sourceId: string, targetId: string): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(LINK_DOCUMENT_TO_DOCUMENT, { sourceId, targetId });
    return result.records.length > 0;
  } finally {
    await session.close();
  }
}

/**
 * Unlink Document from another Document
 */
export async function unlinkDocumentFromDocument(
  sourceId: string,
  targetId: string
): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(UNLINK_DOCUMENT_FROM_DOCUMENT, { sourceId, targetId });
    const deleted = result.records[0].get('deleted').toNumber();
    return deleted > 0;
  } finally {
    await session.close();
  }
}

/**
 * Get Documents that this Document links to
 */
export async function getLinkedDocuments(documentId: string): Promise<DocumentNode[]> {
  const session = getSession();

  try {
    const result = await session.run(GET_LINKED_DOCUMENTS, { documentId });
    return result.records.map(record => toDocumentNode(record.get('linked').properties));
  } finally {
    await session.close();
  }
}

/**
 * Get Documents that link to this Document
 */
export async function getLinkingDocuments(documentId: string): Promise<DocumentNode[]> {
  const session = getSession();

  try {
    const result = await session.run(GET_LINKING_DOCUMENTS, { documentId });
    return result.records.map(record => toDocumentNode(record.get('linking').properties));
  } finally {
    await session.close();
  }
}

/**
 * Create working copy relationship
 */
export async function createWorkingCopy(copyId: string, originalId: string): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(CREATE_WORKING_COPY, { copyId, originalId });
    return result.records.length > 0;
  } finally {
    await session.close();
  }
}

/**
 * Remove working copy relationship
 */
export async function removeWorkingCopy(copyId: string, originalId: string): Promise<boolean> {
  const session = getSession();

  try {
    const result = await session.run(REMOVE_WORKING_COPY, { copyId, originalId });
    const deleted = result.records[0].get('deleted').toNumber();
    return deleted > 0;
  } finally {
    await session.close();
  }
}

/**
 * Get original document of a working copy
 */
export async function getOriginalDocument(documentId: string): Promise<DocumentNode | null> {
  const session = getSession();

  try {
    const result = await session.run(GET_ORIGINAL_DOCUMENT, { documentId });
    if (result.records.length === 0) {
      return null;
    }
    return toDocumentNode(result.records[0].get('original').properties);
  } finally {
    await session.close();
  }
}

/**
 * Get working copies of a document
 */
export async function getWorkingCopies(documentId: string): Promise<DocumentNode[]> {
  const session = getSession();

  try {
    const result = await session.run(GET_WORKING_COPIES, { documentId });
    return result.records.map(record => toDocumentNode(record.get('copy').properties));
  } finally {
    await session.close();
  }
}
