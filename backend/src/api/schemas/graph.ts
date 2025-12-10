/**
 * Graph API Schemas
 * Validation schemas for Graph API endpoints
 */

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const GraphNodeType = z.enum(['document', 'concept', 'tag', 'page', 'version']);
export type GraphNodeType = z.infer<typeof GraphNodeType>;

export const GraphEdgeType = z.enum([
  'USES_CONCEPT',
  'LINKS_TO',
  'HAS_TAG',
  'IN_VERSION',
  'DISPLAYS',
  'CHILD_OF',
  'SUBTYPE_OF',
  'PART_OF',
  'SYNONYM_OF',
  'WORKING_COPY_OF',
]);
export type GraphEdgeType = z.infer<typeof GraphEdgeType>;

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

export const graphNodesQuerySchema = z.object({
  type: GraphNodeType.optional(),
  limit: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().positive().max(1000))
    .optional()
    .default('100'),
  offset: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().nonnegative())
    .optional()
    .default('0'),
});
export type GraphNodesQuery = z.infer<typeof graphNodesQuerySchema>;

export const graphEdgesQuerySchema = z.object({
  type: GraphEdgeType.optional(),
  limit: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().positive().max(5000))
    .optional()
    .default('500'),
  offset: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().nonnegative())
    .optional()
    .default('0'),
});
export type GraphEdgesQuery = z.infer<typeof graphEdgesQuerySchema>;

export const graphNodeIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const graphNeighborsQuerySchema = z.object({
  depth: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().positive().max(3))
    .optional()
    .default('1'),
});

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

export const graphNodeSchema = z.object({
  id: z.string().uuid(),
  type: GraphNodeType,
  label: z.string(),
  properties: z.record(z.unknown()).optional(),
});
export type GraphNode = z.infer<typeof graphNodeSchema>;

export const graphEdgeSchema = z.object({
  id: z.string(),
  source: z.string().uuid(),
  target: z.string().uuid(),
  type: z.string(),
  label: z.string().optional(),
  properties: z.record(z.unknown()).optional(),
});
export type GraphEdge = z.infer<typeof graphEdgeSchema>;

export const graphStatsSchema = z.object({
  totalNodes: z.number(),
  totalEdges: z.number(),
  nodesByType: z.record(z.number()),
  edgesByType: z.record(z.number()),
});
export type GraphStats = z.infer<typeof graphStatsSchema>;

export const graphNodesResponseSchema = z.object({
  items: z.array(graphNodeSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export const graphEdgesResponseSchema = z.object({
  items: z.array(graphEdgeSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export const graphNeighborsResponseSchema = z.object({
  center: graphNodeSchema,
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),
});

