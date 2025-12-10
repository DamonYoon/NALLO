/**
 * Graph Visualization Types
 *
 * Neo4j NVL 기반 그래프 시각화를 위한 타입 정의
 */

// ========================================
// Node Types
// ========================================

export type GraphNodeType = "document" | "concept" | "page" | "tag";

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  x?: number;
  y?: number;
  color?: string;
  size?: number;
  // 메타데이터
  description?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  // UI 상태
  isNew?: boolean;
  isHighlighted?: boolean;
  isDeleted?: boolean;
  hasBrokenLinks?: boolean;
  // 연결 정보
  connectedDocs?: number;
  connectedConcepts?: number;
}

// ========================================
// Edge Types
// ========================================

export type GraphEdgeType =
  | "doc-doc" // LINKS_TO
  | "doc-concept" // USES_CONCEPT
  | "doc-page" // HAS_PAGE
  | "concept-concept" // RELATED_TO, SUBTYPE_OF, etc.
  | "doc-tag"; // HAS_TAG

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: GraphEdgeType;
  label?: string;
  color?: string;
  width?: number;
  isBroken?: boolean;
}

// ========================================
// Filter State
// ========================================

export interface GraphFilterState {
  // 노드 타입 필터
  showDocuments: boolean;
  showConcepts: boolean;
  showPages: boolean;
  showTags: boolean;
  // 관계 타입 필터
  showDocDocEdges: boolean;
  showDocConceptEdges: boolean;
  showConceptConceptEdges: boolean;
  showDocTagEdges: boolean;
  // 태그 필터
  selectedTags: string[];
  // 검색
  searchQuery: string;
}

// ========================================
// Style Configuration
// ========================================

export interface GraphStyleConfig {
  nodeSize: number; // 50-150, default 100
  edgeWidth: number; // 0.5-3, default 1
  labelVisibility: "always" | "hover" | "important";
}

// ========================================
// Tag Color Configuration
// ========================================

export interface TagColor {
  tag: string;
  color: string;
}

// ========================================
// Constants
// ========================================

export const NODE_COLORS: Record<GraphNodeType, string> = {
  page: "#22c55e", // green-500
  document: "#3b82f6", // blue-500
  concept: "#a855f7", // purple-500
  tag: "#f97316", // orange-500
};

export const DEFAULT_NODE_COLOR = "#94a3b8"; // slate-400
export const DEFAULT_EDGE_COLOR = "#64748b"; // slate-500
export const SELECTED_NODE_COLOR = "#fc8658"; // accent orange
export const BROKEN_EDGE_COLOR = "#ef4444"; // red-500

export const AVAILABLE_TAGS = [
  "Web3",
  "Blockchain",
  "API",
  "Tutorial",
  "Guide",
];

// ========================================
// Default Filter State
// ========================================

export const DEFAULT_FILTER_STATE: GraphFilterState = {
  showDocuments: true,
  showConcepts: true,
  showPages: true,
  showTags: true,
  showDocDocEdges: true,
  showDocConceptEdges: true,
  showConceptConceptEdges: true,
  showDocTagEdges: true,
  selectedTags: [],
  searchQuery: "",
};

export const DEFAULT_STYLE_CONFIG: GraphStyleConfig = {
  nodeSize: 100,
  edgeWidth: 1,
  labelVisibility: "always",
};
