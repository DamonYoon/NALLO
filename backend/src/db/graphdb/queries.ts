/**
 * GraphDB (Neo4j) query utilities
 * This file contains reusable Cypher query templates and functions
 */

import { getGraphDBConnection } from './connection';
import { DocumentNode, DocumentStatus, DocumentType } from '../../models/graphdb/documentNode';
import {
  AttachmentNode,
  AttachmentFileType,
  HasAttachmentRelationship,
} from '../../models/graphdb/attachmentNode';

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
