/**
 * API Response Types
 * Type definitions matching Backend API schemas
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export type DocumentType = 'api' | 'general' | 'tutorial';
export type DocumentStatus = 'draft' | 'in_review' | 'done' | 'publish';

export interface Document {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  title: string;
  lang: string;
  content?: string;
  summary?: string | null;
  storage_key: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentInput {
  title: string;
  type: DocumentType;
  content: string;
  lang: string;
  tags?: string[];
}

export interface UpdateDocumentInput {
  title?: string;
  content?: string;
  status?: DocumentStatus;
}

// ============================================================================
// CONCEPT TYPES
// ============================================================================

export interface Concept {
  id: string;
  term: string;
  description: string;
  lang: string;
  created_at: string;
  updated_at: string;
}

export interface CreateConceptInput {
  term: string;
  description: string;
  lang: string;
}

export interface UpdateConceptInput {
  term?: string;
  description?: string;
}

// ============================================================================
// TAG TYPES
// ============================================================================

export interface Tag {
  id: string;
  name: string;
  color?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTagInput {
  name: string;
  color?: string;
  description?: string;
}

// ============================================================================
// VERSION TYPES
// ============================================================================

export interface Version {
  id: string;
  version: string;
  name: string;
  description?: string | null;
  is_public: boolean;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PAGE TYPES
// ============================================================================

export interface Page {
  id: string;
  slug: string;
  title: string;
  order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface NavigationItem {
  id: string;
  slug: string;
  title: string;
  order: number;
  visible: boolean;
  document_id: string | null;
  children: NavigationItem[];
}

export interface NavigationTree {
  pages: NavigationItem[];
}

// ============================================================================
// GRAPH TYPES
// ============================================================================

export type GraphNodeType = 'document' | 'concept' | 'tag' | 'page' | 'version';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  properties?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  properties?: Record<string, unknown>;
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  nodesByType: Record<string, number>;
  edgesByType: Record<string, number>;
}

export interface GraphNodesResponse extends PaginatedResponse<GraphNode> {}

export interface GraphEdgesResponse extends PaginatedResponse<GraphEdge> {}

export interface GraphNeighborsResponse {
  center: GraphNode;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ============================================================================
// SEARCH TYPES
// ============================================================================

export interface SearchResultItem {
  document_id: string;
  page_id: string | null;
  title: string;
  summary: string | null;
  relevance_score: number;
  matched_fields: string[];
  type: string;
}

export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// HEALTH TYPES
// ============================================================================

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  graphdb: {
    status: 'connected' | 'disconnected';
  };
  postgresql: {
    status: 'connected' | 'disconnected';
  };
}

