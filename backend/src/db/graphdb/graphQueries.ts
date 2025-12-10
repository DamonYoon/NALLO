/**
 * Graph-specific query functions for visualization
 * Provides unified graph data access for frontend visualization
 */

import neo4j from 'neo4j-driver';
import { getGraphDBConnection } from './connection';
import { GraphNode, GraphEdge, GraphStats, GraphNodeType } from '../../api/schemas/graph';

/**
 * Helper function to get a database session
 */
function getSession() {
  const driver = getGraphDBConnection();
  return driver.session();
}

/**
 * Convert Neo4j node to GraphNode format
 */
function toGraphNode(nodeType: GraphNodeType, record: Record<string, unknown>): GraphNode {
  const id = String(record.id);
  let label = '';

  // Determine label based on node type
  switch (nodeType) {
    case 'document':
      label = String(record.title || record.id);
      break;
    case 'concept':
      label = String(record.term || record.id);
      break;
    case 'tag':
      label = String(record.name || record.id);
      break;
    case 'page':
      label = String(record.title || record.slug || record.id);
      break;
    case 'version':
      label = String(record.name || record.version || record.id);
      break;
  }

  // Build properties object (excluding internal fields)
  const properties: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (!['id', 'created_at', 'updated_at'].includes(key)) {
      // Handle Neo4j Integer type
      if (value && typeof (value as { toNumber?: () => number }).toNumber === 'function') {
        properties[key] = (value as { toNumber: () => number }).toNumber();
      } else if (value !== null && value !== undefined) {
        properties[key] = value;
      }
    }
  }

  return {
    id,
    type: nodeType,
    label,
    properties,
  };
}

// ============================================================================
// GRAPH NODE QUERIES
// ============================================================================

const GET_ALL_NODES_QUERY = `
  CALL {
    MATCH (d:Document)
    RETURN d as node, 'document' as type
    UNION ALL
    MATCH (c:Concept)
    RETURN c as node, 'concept' as type
    UNION ALL
    MATCH (t:Tag)
    RETURN t as node, 'tag' as type
    UNION ALL
    MATCH (p:Page)
    RETURN p as node, 'page' as type
    UNION ALL
    MATCH (v:Version)
    RETURN v as node, 'version' as type
  }
  RETURN node, type
  SKIP $offset
  LIMIT $limit
`;

const GET_NODES_BY_TYPE_QUERY = `
  MATCH (n)
  WHERE $type IN labels(n)
  RETURN n as node
  SKIP $offset
  LIMIT $limit
`;

const COUNT_ALL_NODES_QUERY = `
  CALL {
    MATCH (d:Document) RETURN count(d) as cnt
    UNION ALL
    MATCH (c:Concept) RETURN count(c) as cnt
    UNION ALL
    MATCH (t:Tag) RETURN count(t) as cnt
    UNION ALL
    MATCH (p:Page) RETURN count(p) as cnt
    UNION ALL
    MATCH (v:Version) RETURN count(v) as cnt
  }
  RETURN sum(cnt) as total
`;

const COUNT_NODES_BY_TYPE_QUERY = `
  MATCH (n)
  WHERE $type IN labels(n)
  RETURN count(n) as total
`;

/**
 * Get all graph nodes with optional type filter
 */
export async function getGraphNodes(params: {
  type?: GraphNodeType;
  limit: number;
  offset: number;
}): Promise<{ items: GraphNode[]; total: number }> {
  const session = getSession();

  try {
    let items: GraphNode[] = [];
    let total = 0;

    if (params.type) {
      // Get nodes by specific type
      const typeLabel = params.type.charAt(0).toUpperCase() + params.type.slice(1); // document -> Document
      const result = await session.run(GET_NODES_BY_TYPE_QUERY, {
        type: typeLabel,
        limit: neo4j.int(params.limit),
        offset: neo4j.int(params.offset),
      });

      items = result.records.map(record => {
        const node = record.get('node').properties;
        return toGraphNode(params.type!, node);
      });

      const countResult = await session.run(COUNT_NODES_BY_TYPE_QUERY, { type: typeLabel });
      const totalValue = countResult.records[0]?.get('total');
      total = typeof totalValue?.toNumber === 'function' ? totalValue.toNumber() : Number(totalValue ?? 0);
    } else {
      // Get all nodes
      const result = await session.run(GET_ALL_NODES_QUERY, {
        limit: neo4j.int(params.limit),
        offset: neo4j.int(params.offset),
      });

      items = result.records.map(record => {
        const node = record.get('node').properties;
        const type = record.get('type') as GraphNodeType;
        return toGraphNode(type, node);
      });

      const countResult = await session.run(COUNT_ALL_NODES_QUERY, {});
      const totalValue = countResult.records[0]?.get('total');
      total = typeof totalValue?.toNumber === 'function' ? totalValue.toNumber() : Number(totalValue ?? 0);
    }

    return { items, total };
  } finally {
    await session.close();
  }
}

// ============================================================================
// GRAPH EDGE QUERIES
// ============================================================================

const GET_ALL_EDGES_QUERY = `
  MATCH (a)-[r]->(b)
  WHERE (a:Document OR a:Concept OR a:Tag OR a:Page OR a:Version)
    AND (b:Document OR b:Concept OR b:Tag OR b:Page OR b:Version)
  RETURN 
    a.id as source_id,
    b.id as target_id,
    type(r) as rel_type,
    id(r) as rel_id,
    properties(r) as rel_props
  SKIP $offset
  LIMIT $limit
`;

const GET_EDGES_BY_TYPE_QUERY = `
  MATCH (a)-[r]->(b)
  WHERE type(r) = $type
    AND (a:Document OR a:Concept OR a:Tag OR a:Page OR a:Version)
    AND (b:Document OR b:Concept OR b:Tag OR b:Page OR b:Version)
  RETURN 
    a.id as source_id,
    b.id as target_id,
    type(r) as rel_type,
    id(r) as rel_id,
    properties(r) as rel_props
  SKIP $offset
  LIMIT $limit
`;

const COUNT_ALL_EDGES_QUERY = `
  MATCH (a)-[r]->(b)
  WHERE (a:Document OR a:Concept OR a:Tag OR a:Page OR a:Version)
    AND (b:Document OR b:Concept OR b:Tag OR b:Page OR b:Version)
  RETURN count(r) as total
`;

const COUNT_EDGES_BY_TYPE_QUERY = `
  MATCH (a)-[r]->(b)
  WHERE type(r) = $type
    AND (a:Document OR a:Concept OR a:Tag OR a:Page OR a:Version)
    AND (b:Document OR b:Concept OR b:Tag OR b:Page OR b:Version)
  RETURN count(r) as total
`;

/**
 * Get all graph edges with optional type filter
 */
export async function getGraphEdges(params: {
  type?: string;
  limit: number;
  offset: number;
}): Promise<{ items: GraphEdge[]; total: number }> {
  const session = getSession();

  try {
    let result;
    let countResult;

    if (params.type) {
      result = await session.run(GET_EDGES_BY_TYPE_QUERY, {
        type: params.type,
        limit: neo4j.int(params.limit),
        offset: neo4j.int(params.offset),
      });
      countResult = await session.run(COUNT_EDGES_BY_TYPE_QUERY, { type: params.type });
    } else {
      result = await session.run(GET_ALL_EDGES_QUERY, {
        limit: neo4j.int(params.limit),
        offset: neo4j.int(params.offset),
      });
      countResult = await session.run(COUNT_ALL_EDGES_QUERY, {});
    }

    const items: GraphEdge[] = result.records.map(record => {
      const relId = record.get('rel_id');
      const relType = record.get('rel_type');
      const relProps = record.get('rel_props') || {};

      return {
        id: `${relType}-${typeof relId?.toNumber === 'function' ? relId.toNumber() : relId}`,
        source: String(record.get('source_id')),
        target: String(record.get('target_id')),
        type: relType,
        label: relType.replace(/_/g, ' '),
        properties: relProps,
      };
    });

    const totalValue = countResult.records[0]?.get('total');
    const total = typeof totalValue?.toNumber === 'function' ? totalValue.toNumber() : Number(totalValue ?? 0);

    return { items, total };
  } finally {
    await session.close();
  }
}

// ============================================================================
// GRAPH NEIGHBORS QUERY
// ============================================================================

const GET_NODE_NEIGHBORS_QUERY = `
  // Get the center node
  MATCH (center)
  WHERE center.id = $nodeId
    AND (center:Document OR center:Concept OR center:Tag OR center:Page OR center:Version)
  
  // Get outgoing relationships
  OPTIONAL MATCH (center)-[r_out]->(neighbor_out)
  WHERE neighbor_out:Document OR neighbor_out:Concept OR neighbor_out:Tag OR neighbor_out:Page OR neighbor_out:Version
  
  // Get incoming relationships
  OPTIONAL MATCH (neighbor_in)-[r_in]->(center)
  WHERE neighbor_in:Document OR neighbor_in:Concept OR neighbor_in:Tag OR neighbor_in:Page OR neighbor_in:Version
  
  WITH center, 
       COLLECT(DISTINCT {node: neighbor_out, rel: r_out, direction: 'out'}) as outgoing,
       COLLECT(DISTINCT {node: neighbor_in, rel: r_in, direction: 'in'}) as incoming
  
  RETURN center, outgoing, incoming
`;

/**
 * Get center node type from labels
 */
function getNodeTypeFromLabels(labels: string[]): GraphNodeType {
  if (labels.includes('Document')) return 'document';
  if (labels.includes('Concept')) return 'concept';
  if (labels.includes('Tag')) return 'tag';
  if (labels.includes('Page')) return 'page';
  if (labels.includes('Version')) return 'version';
  return 'document'; // default
}

/**
 * Get node and its 1-hop neighbors
 */
export async function getNodeNeighbors(
  nodeId: string
): Promise<{ center: GraphNode; nodes: GraphNode[]; edges: GraphEdge[] } | null> {
  const session = getSession();

  try {
    const result = await session.run(GET_NODE_NEIGHBORS_QUERY, { nodeId });

    if (result.records.length === 0) {
      return null;
    }

    const record = result.records[0];
    const centerNode = record.get('center');

    if (!centerNode) {
      return null;
    }

    // Get center node type
    const centerType = getNodeTypeFromLabels(centerNode.labels);
    const center = toGraphNode(centerType, centerNode.properties);

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenNodeIds = new Set<string>();

    // Process outgoing relationships
    const outgoing = record.get('outgoing') as Array<{
      node: { labels: string[]; properties: Record<string, unknown> } | null;
      rel: { type: string; identity: { toNumber?: () => number } } | null;
      direction: string;
    }>;

    for (const item of outgoing) {
      if (item.node && item.rel) {
        const neighborId = String(item.node.properties.id);
        if (!seenNodeIds.has(neighborId)) {
          const neighborType = getNodeTypeFromLabels(item.node.labels);
          nodes.push(toGraphNode(neighborType, item.node.properties));
          seenNodeIds.add(neighborId);
        }

        const relId = typeof item.rel.identity?.toNumber === 'function' 
          ? item.rel.identity.toNumber() 
          : item.rel.identity;
        edges.push({
          id: `${item.rel.type}-${relId}`,
          source: nodeId,
          target: neighborId,
          type: item.rel.type,
          label: item.rel.type.replace(/_/g, ' '),
        });
      }
    }

    // Process incoming relationships
    const incoming = record.get('incoming') as Array<{
      node: { labels: string[]; properties: Record<string, unknown> } | null;
      rel: { type: string; identity: { toNumber?: () => number } } | null;
      direction: string;
    }>;

    for (const item of incoming) {
      if (item.node && item.rel) {
        const neighborId = String(item.node.properties.id);
        if (!seenNodeIds.has(neighborId)) {
          const neighborType = getNodeTypeFromLabels(item.node.labels);
          nodes.push(toGraphNode(neighborType, item.node.properties));
          seenNodeIds.add(neighborId);
        }

        const relId = typeof item.rel.identity?.toNumber === 'function' 
          ? item.rel.identity.toNumber() 
          : item.rel.identity;
        edges.push({
          id: `${item.rel.type}-${relId}`,
          source: neighborId,
          target: nodeId,
          type: item.rel.type,
          label: item.rel.type.replace(/_/g, ' '),
        });
      }
    }

    return { center, nodes, edges };
  } finally {
    await session.close();
  }
}

// ============================================================================
// CONCEPT RELATIONSHIP COUNTS QUERY
// ============================================================================

const GET_CONCEPT_RELATION_COUNTS_QUERY = `
  MATCH (c:Concept)
  OPTIONAL MATCH (d:Document)-[:USES_CONCEPT]->(c)
  WITH c, count(DISTINCT d) as documentCount
  OPTIONAL MATCH (c)-[:LINKS_TO|SUBTYPE_OF]-(related:Concept)
  RETURN c.id as conceptId, documentCount, count(DISTINCT related) as relatedConceptCount
`;

export interface ConceptRelationCounts {
  conceptId: string;
  documentCount: number;
  relatedConceptCount: number;
}

/**
 * Get relationship counts for all concepts
 * Returns document count and related concept count for each concept
 */
export async function getConceptRelationCounts(): Promise<ConceptRelationCounts[]> {
  const session = getSession();

  try {
    const result = await session.run(GET_CONCEPT_RELATION_COUNTS_QUERY, {});

    return result.records.map(record => {
      const docCount = record.get('documentCount');
      const relatedCount = record.get('relatedConceptCount');

      return {
        conceptId: String(record.get('conceptId')),
        documentCount: typeof docCount?.toNumber === 'function' ? docCount.toNumber() : Number(docCount ?? 0),
        relatedConceptCount: typeof relatedCount?.toNumber === 'function' ? relatedCount.toNumber() : Number(relatedCount ?? 0),
      };
    });
  } finally {
    await session.close();
  }
}

// ============================================================================
// GRAPH STATS QUERY
// ============================================================================

const GET_GRAPH_STATS_QUERY = `
  CALL {
    MATCH (d:Document) RETURN 'document' as type, count(d) as cnt
    UNION ALL
    MATCH (c:Concept) RETURN 'concept' as type, count(c) as cnt
    UNION ALL
    MATCH (t:Tag) RETURN 'tag' as type, count(t) as cnt
    UNION ALL
    MATCH (p:Page) RETURN 'page' as type, count(p) as cnt
    UNION ALL
    MATCH (v:Version) RETURN 'version' as type, count(v) as cnt
  }
  RETURN type, cnt
`;

const GET_EDGE_STATS_QUERY = `
  MATCH (a)-[r]->(b)
  WHERE (a:Document OR a:Concept OR a:Tag OR a:Page OR a:Version)
    AND (b:Document OR b:Concept OR b:Tag OR b:Page OR b:Version)
  RETURN type(r) as rel_type, count(r) as cnt
`;

/**
 * Get graph statistics
 */
export async function getGraphStats(): Promise<GraphStats> {
  const session = getSession();

  try {
    // Get node counts by type
    const nodeResult = await session.run(GET_GRAPH_STATS_QUERY, {});
    const nodesByType: Record<string, number> = {};
    let totalNodes = 0;

    for (const record of nodeResult.records) {
      const type = record.get('type');
      const cntValue = record.get('cnt');
      const cnt = typeof cntValue?.toNumber === 'function' ? cntValue.toNumber() : Number(cntValue ?? 0);
      nodesByType[type] = cnt;
      totalNodes += cnt;
    }

    // Get edge counts by type
    const edgeResult = await session.run(GET_EDGE_STATS_QUERY, {});
    const edgesByType: Record<string, number> = {};
    let totalEdges = 0;

    for (const record of edgeResult.records) {
      const type = record.get('rel_type');
      const cntValue = record.get('cnt');
      const cnt = typeof cntValue?.toNumber === 'function' ? cntValue.toNumber() : Number(cntValue ?? 0);
      edgesByType[type] = cnt;
      totalEdges += cnt;
    }

    return {
      totalNodes,
      totalEdges,
      nodesByType,
      edgesByType,
    };
  } finally {
    await session.close();
  }
}

