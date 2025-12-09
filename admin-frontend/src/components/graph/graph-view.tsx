"use client";

/**
 * GraphView - Neo4j NVL 기반 그래프 시각화
 *
 * 문서/용어 관계 그래프를 시각화하는 메인 컴포넌트
 *
 * @see https://neo4j.com/docs/nvl/current/
 * @see https://neo4j.com/docs/api/nvl/current/examples.html
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { RotateCcw, ZoomIn, ZoomOut, Download, Maximize2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { InteractiveNvlWrapper } from "@neo4j-nvl/react";
import type { Node, Relationship, NVL } from "@neo4j-nvl/base";
import { GraphFilter } from "./graph-filter";
import { GraphNodeDetail } from "./graph-node-detail";
import {
  GraphNode,
  GraphEdge,
  GraphFilterState,
  GraphStyleConfig,
  TagColor,
  DEFAULT_FILTER_STATE,
  DEFAULT_STYLE_CONFIG,
  NODE_COLORS,
  DEFAULT_NODE_COLOR,
  DEFAULT_EDGE_COLOR,
  SELECTED_NODE_COLOR,
  AVAILABLE_TAGS,
} from "./types";
import { generateMockNodes, generateMockEdges } from "./mock-data";

// NVL이 rgba 투명도를 덜 반영할 때를 대비해 비포커스 색을 어둡게 고정
// 너무 안 보이지 않도록 이전보다 약간 밝게 조정
const DIMMED_NODE_COLOR = "#1f1f1f";
const DIMMED_EDGE_COLOR = "#1a1a1a";

// ========================================
// NVL Node/Relationship Conversion
// ========================================

interface NodeConversionContext {
  styleConfig: GraphStyleConfig;
  tagColors: TagColor[];
  selectedNodeId: string | null;
  connectedToSelectedIds: Set<string>;
  selectedTags: string[];
}

function getMatchingTagColor(
  node: GraphNode,
  tagColors: TagColor[],
  selectedTags: string[]
): string | null {
  if (!selectedTags.length) return null;
  if (!node.tags?.length) return null;
  const matched = tagColors.find(
    (tc) => node.tags?.includes(tc.tag) && selectedTags.includes(tc.tag)
  );
  return matched?.color || null;
}

// 태그 색상 링(테두리)용 데이터 URI 캐시
const TAG_RING_CACHE = new Map<string, string>();
function getTagRingIcon(color: string): string {
  if (TAG_RING_CACHE.has(color)) return TAG_RING_CACHE.get(color)!;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="${color}" stroke-width="6" /></svg>`;
  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  TAG_RING_CACHE.set(color, uri);
  return uri;
}

function toNvlNode(node: GraphNode, context: NodeConversionContext): Node {
  const {
    styleConfig,
    tagColors,
    selectedNodeId,
    connectedToSelectedIds,
    selectedTags,
  } = context;
  const sizeMultiplier = styleConfig.nodeSize / 100;
  const baseSize = node.size || 12;

  const isSelected = node.id === selectedNodeId;
  const isConnectedToSelected = connectedToSelectedIds.has(node.id);
  const matchingTagColor =
    node.type !== "tag"
      ? getMatchingTagColor(node, tagColors, selectedTags)
      : null;

  // 색상 결정: 기본은 타입 색상 유지 (선택/연결 시에도 색상 고정)
  let nodeColor: string = NODE_COLORS[node.type] || DEFAULT_NODE_COLOR;

  // 선택된 노드가 있을 때 관련 없는 노드는 투명하게
  const shouldDim = !!(selectedNodeId && !isSelected && !isConnectedToSelected);

  if (shouldDim) {
    nodeColor = DIMMED_NODE_COLOR;
  }

  return {
    id: node.id,
    size: isSelected
      ? baseSize * sizeMultiplier * 1.3
      : baseSize * sizeMultiplier,
    color: nodeColor,
    // 태그 필터가 있을 때만 태그 색상 링을 덧씌움 (내부는 타입색 유지)
    overlayIcon:
      matchingTagColor && !shouldDim
        ? {
            url: getTagRingIcon(matchingTagColor),
            size: 1.4,
          }
        : undefined,
    caption:
      !shouldDim &&
      (styleConfig.labelVisibility === "always" ||
        isSelected ||
        isConnectedToSelected)
        ? node.label
        : undefined,
    selected: isSelected,
    activated: isConnectedToSelected,
    x: node.x,
    y: node.y,
    disabled: shouldDim,
  };
}

function toNvlRelationship(
  edge: GraphEdge,
  styleConfig: GraphStyleConfig,
  selectedNodeId: string | null
): Relationship {
  // 선택된 노드와 연결된 엣지인지 확인
  const isConnectedToSelected =
    selectedNodeId &&
    (edge.from === selectedNodeId || edge.to === selectedNodeId);

  const shouldDim = !!(selectedNodeId && !isConnectedToSelected);

  let edgeColor: string;
  if (edge.isBroken) {
    edgeColor = "#ef4444";
  } else if (isConnectedToSelected) {
    edgeColor = SELECTED_NODE_COLOR;
  } else if (shouldDim) {
    edgeColor = DIMMED_EDGE_COLOR;
  } else {
    edgeColor = edge.color || DEFAULT_EDGE_COLOR;
  }

  return {
    id: edge.id,
    from: edge.from,
    to: edge.to,
    type: edge.label || edge.type,
    width: isConnectedToSelected
      ? styleConfig.edgeWidth * 2
      : styleConfig.edgeWidth,
    color: edgeColor,
    // 선택된 노드가 있지만 연결되지 않은 엣지는 투명하게
    disabled: selectedNodeId ? !isConnectedToSelected : false,
  };
}

// ========================================
// Props
// ========================================

interface GraphViewProps {
  initialNodes?: GraphNode[];
  initialEdges?: GraphEdge[];
  className?: string;
}

// ========================================
// Component
// ========================================

export function GraphView({
  initialNodes,
  initialEdges,
  className,
}: GraphViewProps) {
  // ----------------------------------------
  // State
  // ----------------------------------------

  const nvlRef = useRef<NVL | null>(null);

  // 그래프 데이터
  const [allNodes, setAllNodes] = useState<GraphNode[]>(
    () => initialNodes || generateMockNodes()
  );
  const [allEdges, setAllEdges] = useState<GraphEdge[]>(
    () => initialEdges || generateMockEdges(allNodes)
  );

  // 선택된 노드
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 필터 상태
  const [filters, setFilters] =
    useState<GraphFilterState>(DEFAULT_FILTER_STATE);

  // 스타일 설정
  const [styleConfig, setStyleConfig] =
    useState<GraphStyleConfig>(DEFAULT_STYLE_CONFIG);

  // 태그 색상
  const [tagColors, setTagColors] = useState<TagColor[]>([
    { tag: "Web3", color: "#fc8658" },
    { tag: "Blockchain", color: "#60a5fa" },
    { tag: "API", color: "#34d399" },
    { tag: "Tutorial", color: "#f472b6" },
    { tag: "Guide", color: "#a78bfa" },
  ]);

  // 줌 레벨
  const [zoom, setZoom] = useState(1);

  // ----------------------------------------
  // Filtered Data
  // ----------------------------------------

  const filteredNodes = useMemo(() => {
    const selectedTags = new Set(filters.selectedTags);
    const hasTagFilter = selectedTags.size > 0;

    // 선택된 태그 노드 id 수집
    const selectedTagNodeIds = new Set(
      allNodes
        .filter((n) => n.type === "tag" && selectedTags.has(n.label))
        .map((n) => n.id)
    );

    // 선택된 태그와 doc-tag 엣지로 연결된 노드 수집 (직접 연결만 허용)
    const connectedToSelectedTags = new Set<string>();
    if (hasTagFilter) {
      allEdges.forEach((edge) => {
        if (edge.type !== "doc-tag") return;
        const fromIsSelectedTag = selectedTagNodeIds.has(edge.from);
        const toIsSelectedTag = selectedTagNodeIds.has(edge.to);
        if (fromIsSelectedTag) connectedToSelectedTags.add(edge.to);
        if (toIsSelectedTag) connectedToSelectedTags.add(edge.from);
      });
    }

    return allNodes.filter((node) => {
      // 노드 타입 필터
      if (!filters.showDocuments && node.type === "document") return false;
      if (!filters.showConcepts && node.type === "concept") return false;
      if (!filters.showPages && node.type === "page") return false;
      if (!filters.showTags && node.type === "tag") return false;

      // 태그 필터: 선택된 태그가 있으면 태그 노드 자체 또는 doc-tag로 직접 연결된 노드만 남김
      if (hasTagFilter) {
        const isSelectedTagNode = selectedTagNodeIds.has(node.id);
        const connectedViaTagEdge = connectedToSelectedTags.has(node.id);
        if (!isSelectedTagNode && !connectedViaTagEdge) return false;
      }

      // 검색 필터
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!node.label.toLowerCase().includes(query)) return false;
      }

      return true;
    });
  }, [allNodes, allEdges, filters]);

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map((n) => n.id));

    return allEdges.filter((edge) => {
      // 노드가 필터링된 경우 엣지도 제외
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) return false;

      // 관계 타입 필터
      if (!filters.showDocDocEdges && edge.type === "doc-doc") return false;
      if (!filters.showDocConceptEdges && edge.type === "doc-concept")
        return false;
      if (!filters.showConceptConceptEdges && edge.type === "concept-concept")
        return false;
      if (!filters.showDocTagEdges && edge.type === "doc-tag") return false;

      return true;
    });
  }, [allEdges, filteredNodes, filters]);

  // ----------------------------------------
  // Connected Node IDs (선택된 노드와 연결된 노드들)
  // ----------------------------------------

  const connectedToSelectedIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const ids = new Set<string>();

    allEdges.forEach((edge) => {
      if (edge.from === selectedNodeId) ids.add(edge.to);
      if (edge.to === selectedNodeId) ids.add(edge.from);
    });

    return ids;
  }, [selectedNodeId, allEdges]);

  // ----------------------------------------
  // NVL Data
  // ----------------------------------------

  const nvlNodes: Node[] = useMemo(() => {
    const context: NodeConversionContext = {
      styleConfig,
      tagColors,
      selectedNodeId,
      connectedToSelectedIds,
      selectedTags: filters.selectedTags,
    };
    return filteredNodes.map((node) => toNvlNode(node, context));
  }, [
    filteredNodes,
    styleConfig,
    tagColors,
    selectedNodeId,
    connectedToSelectedIds,
  ]);

  const nvlRelationships: Relationship[] = useMemo(() => {
    return filteredEdges.map((edge) =>
      toNvlRelationship(edge, styleConfig, selectedNodeId)
    );
  }, [filteredEdges, styleConfig, selectedNodeId]);

  // ----------------------------------------
  // Selected Node Data
  // ----------------------------------------

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return allNodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, allNodes]);

  const connectedDocuments = useMemo(() => {
    if (!selectedNodeId) return [];
    const connectedIds = new Set<string>();

    allEdges.forEach((edge) => {
      if (edge.from === selectedNodeId) connectedIds.add(edge.to);
      if (edge.to === selectedNodeId) connectedIds.add(edge.from);
    });

    return allNodes.filter(
      (n) => connectedIds.has(n.id) && n.type === "document"
    );
  }, [selectedNodeId, allNodes, allEdges]);

  const connectedConcepts = useMemo(() => {
    if (!selectedNodeId) return [];
    const connectedIds = new Set<string>();

    allEdges.forEach((edge) => {
      if (edge.from === selectedNodeId) connectedIds.add(edge.to);
      if (edge.to === selectedNodeId) connectedIds.add(edge.from);
    });

    return allNodes.filter(
      (n) => connectedIds.has(n.id) && n.type === "concept"
    );
  }, [selectedNodeId, allNodes, allEdges]);

  // ----------------------------------------
  // Node Stats
  // ----------------------------------------

  const nodeStats = useMemo(
    () => ({
      documents: allNodes.filter((n) => n.type === "document").length,
      concepts: allNodes.filter((n) => n.type === "concept").length,
      pages: allNodes.filter((n) => n.type === "page").length,
      tags: allNodes.filter((n) => n.type === "tag").length,
    }),
    [allNodes]
  );

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleTagColorChange = useCallback((tag: string, color: string) => {
    setTagColors((prev) => {
      const existing = prev.find((tc) => tc.tag === tag);
      if (existing) {
        return prev.map((tc) => (tc.tag === tag ? { ...tc, color } : tc));
      }
      return [...prev, { tag, color }];
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoom * 1.25, 3); // 최대 300%
    try {
      nvlRef.current?.setZoom(newZoom);
      setZoom(newZoom);
    } catch (e) {
      console.warn("Zoom in failed:", e);
    }
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoom * 0.8, 0.25); // 최소 25%
    try {
      nvlRef.current?.setZoom(newZoom);
      setZoom(newZoom);
    } catch (e) {
      console.warn("Zoom out failed:", e);
    }
  }, [zoom]);

  const handleResetView = useCallback(() => {
    try {
      nvlRef.current?.resetZoom();
      setZoom(1);
      setSelectedNodeId(null);
    } catch (e) {
      console.warn("Reset view failed:", e);
    }
  }, []);

  const handleFitToScreen = useCallback(() => {
    try {
      const nodeIds = filteredNodes.map((n) => n.id);
      if (nodeIds.length > 0) {
        nvlRef.current?.fit(nodeIds);
      }
    } catch (e) {
      console.warn("Fit to screen failed:", e);
    }
  }, [filteredNodes]);

  const handleFullscreen = useCallback(() => {
    const container = document.querySelector("[data-graph-container]");
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, []);

  // NVL external callbacks
  const nvlCallbacks = useMemo(
    () => ({
      onLayoutDone: () => {
        // 레이아웃 완료 - fit 호출하지 않음 (사용자 뷰 유지)
        console.log("Layout done");
      },
    }),
    []
  );

  // Mouse event callbacks (NVL InteractiveNvlWrapper)
  // @see https://neo4j.com/docs/api/nvl/current/examples.html?tab=InteractiveReactWrapperExample
  const mouseEventCallbacks = useMemo(
    () => ({
      // 클릭 이벤트
      onNodeClick: (node: Node) => handleNodeClick(node),
      onCanvasClick: () => handleCanvasClick(),
      // 드래그 이벤트 - 드래그 후 노드 위치 고정(pin)
      onDragEnd: (nodes: Node[]) => {
        // 드래그 완료된 노드들은 pinned 상태로 설정하여 레이아웃에서 고정
        if (nvlRef.current && nodes.length > 0) {
          const updates = nodes.map((node) => ({ id: node.id, pinned: true }));
          nvlRef.current.addAndUpdateElementsInGraph(updates, []);
        }
      },
      onPan: true,
      // 호버 이벤트 - 라벨 표시 (hover 모드일 때)
      onHover: (node: Node | null) => {
        if (styleConfig.labelVisibility === "hover" && node && nvlRef.current) {
          const originalNode = allNodes.find((n) => n.id === node.id);
          if (originalNode) {
            nvlRef.current.addAndUpdateElementsInGraph(
              [{ id: node.id, caption: originalNode.label }],
              []
            );
          }
        }
      },
    }),
    [handleNodeClick, handleCanvasClick, styleConfig.labelVisibility, allNodes]
  );

  // ----------------------------------------
  // Render
  // ----------------------------------------

  return (
    <div
      data-graph-container
      className={`flex-1 bg-[#0d0d0d] flex overflow-hidden relative ${
        className || ""
      }`}
    >
      {/* 왼쪽 필터 패널 */}
      <GraphFilter
        filters={filters}
        onFiltersChange={setFilters}
        styleConfig={styleConfig}
        onStyleConfigChange={setStyleConfig}
        tagColors={tagColors}
        onTagColorChange={handleTagColorChange}
        nodeStats={nodeStats}
      />

      {/* 메인 그래프 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* 플로팅 툴바 */}
        <div className="absolute top-5 left-5 bg-[#1e1e1e]/90 backdrop-blur-sm rounded-lg border border-[#2a2a2a] shadow-lg flex flex-col overflow-hidden z-10">
          <button
            onClick={handleResetView}
            className="p-3 hover:bg-[#2a2a2a] transition-colors border-b border-[#2a2a2a]"
            title="뷰 초기화"
          >
            <RotateCcw size={18} className="text-[#d1d5db]" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-3 hover:bg-[#2a2a2a] transition-colors border-b border-[#2a2a2a]"
            title="확대"
          >
            <ZoomIn size={18} className="text-[#d1d5db]" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-3 hover:bg-[#2a2a2a] transition-colors border-b border-[#2a2a2a]"
            title="축소"
          >
            <ZoomOut size={18} className="text-[#d1d5db]" />
          </button>
          <button
            className="p-3 hover:bg-[#2a2a2a] transition-colors border-b border-[#2a2a2a]"
            title="내보내기"
          >
            <Download size={18} className="text-[#d1d5db]" />
          </button>
          <button
            onClick={handleFullscreen}
            className="p-3 hover:bg-[#2a2a2a] transition-colors"
            title="전체화면"
          >
            <Maximize2 size={18} className="text-[#d1d5db]" />
          </button>
        </div>

        {/* NVL 그래프 캔버스 */}
        <div className="flex-1 relative">
          <InteractiveNvlWrapper
            ref={nvlRef as any}
            nodes={nvlNodes}
            rels={nvlRelationships}
            nvlOptions={{
              initialZoom: 0.7,
              layout: "d3Force",
              renderer: "canvas", // caption 표시를 위해 canvas 렌더러 필요
              allowDynamicMinZoom: true,
              minZoom: 0.1,
              maxZoom: 3,
              // 비포커스(disabled) 색상을 강제 지정하여 시인성 낮춤
              styling: {
                disabledItemColor: DIMMED_NODE_COLOR,
                disabledItemFontColor: DIMMED_NODE_COLOR,
              },
            }}
            // nvlCallbacks={nvlCallbacks}
            mouseEventCallbacks={mouseEventCallbacks}
            interactionOptions={{
              selectOnClick: false,
            }}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#0d0d0d",
            }}
          />
        </div>

        {/* 통계 푸터 */}
        <div className="absolute bottom-5 left-5 bg-[#1e1e1e]/90 backdrop-blur-sm rounded-lg px-4 py-2.5 shadow-lg border border-[#2a2a2a] pointer-events-none">
          <div className="flex items-center gap-5 text-[12px] text-[#9ca3af]">
            <span className="text-[#e5e5e5]">{filteredNodes.length}</span>
            <span>노드</span>
            <span>•</span>
            <span className="text-[#e5e5e5]">{filteredEdges.length}</span>
            <span>연결</span>
            <span>•</span>
            <span className="text-[#e5e5e5]">{Math.round(zoom * 100)}%</span>
            <span>배율</span>
          </div>
        </div>
      </div>

      {/* 오른쪽 상세 패널 (오버레이) */}
      <AnimatePresence mode="wait">
        {selectedNode && (
          <div className="absolute right-0 top-0 bottom-0 h-full z-20">
            <GraphNodeDetail
              key={selectedNode.id}
              node={selectedNode}
              tagColors={tagColors}
              connectedDocuments={connectedDocuments}
              connectedConcepts={connectedConcepts}
              onClose={() => setSelectedNodeId(null)}
              onOpenDocument={(id) => console.log("Open document:", id)}
              onEditNode={(id) => console.log("Edit node:", id)}
              onCreateConnection={(id) =>
                console.log("Create connection from:", id)
              }
              onSelectNode={(id) => setSelectedNodeId(id)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
