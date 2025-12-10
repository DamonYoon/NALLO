/**
 * Graph Service
 * Business logic for graph data operations
 * Per Constitution Principle I: Service layer separated from routes
 */

import {
  getGraphNodes,
  getGraphEdges,
  getNodeNeighbors,
  getGraphStats,
  getConceptRelationCounts,
  type ConceptRelationCounts,
} from '../db/graphdb/graphQueries';
import {
  GraphNode,
  GraphEdge,
  GraphStats,
  GraphNodeType,
  GraphNodesQuery,
  GraphEdgesQuery,
} from '../api/schemas/graph';
import { logger } from '../utils/logger';

export interface GraphNodesResult {
  items: GraphNode[];
  total: number;
  limit: number;
  offset: number;
}

export interface GraphEdgesResult {
  items: GraphEdge[];
  total: number;
  limit: number;
  offset: number;
}

export interface GraphNeighborsResult {
  center: GraphNode;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * List graph nodes with optional type filter
 */
async function listNodes(query: GraphNodesQuery): Promise<GraphNodesResult> {
  logger.debug('Fetching graph nodes', { type: query.type, limit: query.limit, offset: query.offset });

  const result = await getGraphNodes({
    type: query.type as GraphNodeType | undefined,
    limit: Number(query.limit),
    offset: Number(query.offset),
  });

  return {
    items: result.items,
    total: result.total,
    limit: Number(query.limit),
    offset: Number(query.offset),
  };
}

/**
 * List graph edges with optional type filter
 */
async function listEdges(query: GraphEdgesQuery): Promise<GraphEdgesResult> {
  logger.debug('Fetching graph edges', { type: query.type, limit: query.limit, offset: query.offset });

  const result = await getGraphEdges({
    type: query.type,
    limit: Number(query.limit),
    offset: Number(query.offset),
  });

  return {
    items: result.items,
    total: result.total,
    limit: Number(query.limit),
    offset: Number(query.offset),
  };
}

/**
 * Get node and its 1-hop neighbors
 */
async function getNeighbors(nodeId: string): Promise<GraphNeighborsResult | null> {
  logger.debug('Fetching node neighbors', { nodeId });

  const result = await getNodeNeighbors(nodeId);
  return result;
}

/**
 * Get graph statistics
 */
async function getStats(): Promise<GraphStats> {
  logger.debug('Fetching graph statistics');

  const stats = await getGraphStats();
  return stats;
}

/**
 * Get relationship counts for all concepts
 */
async function getConceptRelations(): Promise<ConceptRelationCounts[]> {
  logger.debug('Fetching concept relations');

  const relations = await getConceptRelationCounts();
  return relations;
}

export const graphService = {
  listNodes,
  listEdges,
  getNeighbors,
  getStats,
  getConceptRelations,
};

