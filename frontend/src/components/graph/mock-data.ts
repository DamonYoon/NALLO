/**
 * Graph Mock Data
 *
 * 테스트용 그래프 데이터 생성
 */

import {
  GraphNode,
  GraphEdge,
  GraphNodeType,
  NODE_COLORS,
  AVAILABLE_TAGS,
} from "./types";

// ========================================
// Mock Node Generation
// ========================================

export function generateMockNodes(): GraphNode[] {
  const nodes: GraphNode[] = [];

  const normalizeTagId = (tag: string) =>
    `tag-${tag.toLowerCase().replace(/\s+/g, "-")}`;

  // 중심 문서 노드들
  const documentNodes: Partial<GraphNode>[] = [
    {
      id: "doc-1",
      label: "API 인증 가이드",
      tags: ["API", "Guide"],
      status: "Publish",
    },
    { id: "doc-2", label: "REST API 개요", tags: ["API"], status: "Done" },
    { id: "doc-3", label: "시작하기", tags: ["Tutorial"], status: "In Review" },
    {
      id: "doc-4",
      label: "Web3 통합 가이드",
      tags: ["Web3", "Guide"],
      status: "Draft",
    },
    {
      id: "doc-5",
      label: "블록체인 기초",
      tags: ["Blockchain", "Tutorial"],
      status: "Publish",
    },
  ];

  // 문서 노드 생성 - 더 넓게 분산
  documentNodes.forEach((doc) => {
    nodes.push({
      id: doc.id!,
      label: doc.label!,
      type: "document",
      // 초기 위치는 설정하지 않음 - NVL force layout이 자동 배치
      color: NODE_COLORS.document,
      size: 16,
      tags: doc.tags,
      status: doc.status,
      description: `${doc.label} 문서입니다.`,
      connectedDocs: Math.floor(Math.random() * 5) + 1,
      connectedConcepts: Math.floor(Math.random() * 8) + 2,
      createdAt: "2025-11-01",
      updatedAt: "2025-12-01",
    });
  });

  // 용어(Concept) 노드들
  const conceptNodes: Partial<GraphNode>[] = [
    { id: "concept-1", label: "API Key", tags: ["API"] },
    { id: "concept-2", label: "Authentication", tags: ["API"] },
    { id: "concept-3", label: "Token", tags: ["API", "Web3"] },
    { id: "concept-4", label: "Smart Contract", tags: ["Blockchain", "Web3"] },
    { id: "concept-5", label: "Endpoint", tags: ["API"] },
    { id: "concept-6", label: "BNB Chain", tags: ["Blockchain"] },
    { id: "concept-7", label: "Wallet", tags: ["Web3"] },
    { id: "concept-8", label: "REST", tags: ["API"] },
  ];

  // 용어 노드 생성 - 초기 위치 없이 레이아웃에 맡김
  conceptNodes.forEach((concept) => {
    nodes.push({
      id: concept.id!,
      label: concept.label!,
      type: "concept",
      // 초기 위치는 설정하지 않음 - NVL force layout이 자동 배치
      color: NODE_COLORS.concept,
      size: 12,
      tags: concept.tags,
      description: `${concept.label} 용어 정의`,
      connectedDocs: Math.floor(Math.random() * 4) + 1,
      connectedConcepts: Math.floor(Math.random() * 3),
      createdAt: "2025-10-15",
    });
  });

  // 태그 노드들 (AVAILABLE_TAGS 기반)
  AVAILABLE_TAGS.forEach((tag) => {
    nodes.push({
      id: normalizeTagId(tag),
      label: tag,
      type: "tag",
      color: NODE_COLORS.tag,
      size: 12,
      tags: [tag],
      description: `${tag} 태그 노드`,
      createdAt: "2025-11-20",
    });
  });

  // 페이지 노드 생성
  const pageNodes: Partial<GraphNode>[] = Array.from({ length: 12 }).map(
    (_, idx) => ({
      id: `page-${idx + 1}`,
      label: `Page ${idx + 1}`,
      type: "page" as GraphNodeType,
      color: NODE_COLORS.page,
      size: 10,
      description: `Page node ${idx + 1}`,
      createdAt: "2025-11-10",
    })
  );
  pageNodes.forEach((p) => nodes.push(p as GraphNode));

  // 배경 노드들 (50개) - 초기 위치 없이 레이아웃에 맡김
  for (let i = 0; i < 50; i++) {
    const typeRoll = Math.random();
    const type: GraphNodeType =
      typeRoll > 0.7 ? "concept" : typeRoll > 0.35 ? "document" : "page";
    const randomTag =
      Math.random() > 0.4
        ? [AVAILABLE_TAGS[Math.floor(Math.random() * AVAILABLE_TAGS.length)]]
        : [];

    nodes.push({
      id: `node-${i}`,
      label: `Node ${i + 1}`,
      type,
      // 초기 위치는 설정하지 않음 - NVL force layout이 자동 배치
      color: NODE_COLORS[type],
      size: 10,
      tags: randomTag,
      description: `Background ${type} node ${i + 1}`,
      connectedDocs: Math.floor(Math.random() * 3),
      connectedConcepts: Math.floor(Math.random() * 3),
      createdAt: "2025-11-01",
    });
  }

  return nodes;
}

// ========================================
// Mock Edge Generation
// ========================================

export function generateMockEdges(nodes: GraphNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  let edgeId = 0;

  const normalizeTagId = (tag: string) =>
    `tag-${tag.toLowerCase().replace(/\s+/g, "-")}`;

  // 문서-용어 연결
  const documents = nodes.filter(
    (n) => n.type === "document" && n.id.startsWith("doc-")
  );
  const concepts = nodes.filter(
    (n) => n.type === "concept" && n.id.startsWith("concept-")
  );

  documents.forEach((doc) => {
    // 각 문서에서 2-4개 용어 연결
    const connectionCount = Math.floor(Math.random() * 3) + 2;
    const shuffled = [...concepts].sort(() => Math.random() - 0.5);

    shuffled.slice(0, connectionCount).forEach((concept) => {
      edges.push({
        id: `edge-${edgeId++}`,
        from: doc.id,
        to: concept.id,
        type: "doc-concept",
        label: "USES",
      });
    });
  });

  // 문서-문서 연결 (일부)
  for (let i = 0; i < documents.length - 1; i++) {
    if (Math.random() > 0.5) {
      edges.push({
        id: `edge-${edgeId++}`,
        from: documents[i].id,
        to: documents[i + 1].id,
        type: "doc-doc",
        label: "LINKS_TO",
      });
    }
  }

  // 용어-용어 연결 (일부)
  for (let i = 0; i < concepts.length - 1; i++) {
    if (Math.random() > 0.6) {
      edges.push({
        id: `edge-${edgeId++}`,
        from: concepts[i].id,
        to: concepts[i + 1].id,
        type: "concept-concept",
        label: "RELATED_TO",
      });
    }
  }

  // 문서-태그 연결 (문서의 tags 배열을 사용)
  nodes
    .filter((n) => n.type === "document")
    .forEach((doc) => {
      (doc.tags || []).forEach((tag) => {
        edges.push({
          id: `edge-${edgeId++}`,
          from: doc.id,
          to: normalizeTagId(tag),
          type: "doc-tag",
          label: "HAS_TAG",
        });
      });
    });

  // 배경 문서 노드에 대해 태그가 있는 경우 연결
  nodes
    .filter((n) => n.type === "document" && n.id.startsWith("node-"))
    .forEach((doc) => {
      (doc.tags || []).forEach((tag) => {
        edges.push({
          id: `edge-${edgeId++}`,
          from: doc.id,
          to: normalizeTagId(tag),
          type: "doc-tag",
          label: "HAS_TAG",
        });
      });
    });

  // 문서-페이지 연결
  const pages = nodes.filter((n) => n.type === "page");
  pages.forEach((page, idx) => {
    const doc = documents[idx % documents.length];
    edges.push({
      id: `edge-${edgeId++}`,
      from: doc.id,
      to: page.id,
      type: "doc-page",
      label: "HAS_PAGE",
    });
  });

  // 배경 노드 연결
  for (let i = 0; i < 80; i++) {
    const from = nodes[Math.floor(Math.random() * nodes.length)];
    const to = nodes[Math.floor(Math.random() * nodes.length)];

    if (from.id !== to.id && !from.isDeleted && !to.isDeleted) {
      const bothDocs = from.type === "document" && to.type === "document";
      const bothConcepts = from.type === "concept" && to.type === "concept";
      const docPage =
        (from.type === "document" && to.type === "page") ||
        (from.type === "page" && to.type === "document");

      edges.push({
        id: `edge-${edgeId++}`,
        from: from.id,
        to: to.id,
        type: bothDocs
          ? "doc-doc"
          : bothConcepts
          ? "concept-concept"
          : docPage
          ? "doc-page"
          : "doc-concept",
        label:
          bothDocs
            ? "LINKS_TO"
            : bothConcepts
            ? "RELATED_TO"
            : docPage
            ? "HAS_PAGE"
            : undefined,
      });
    }
  }

  return edges;
}

