"use client";

import { createReactInlineContentSpec } from "@blocknote/react";
import { Lightbulb, FileText } from "lucide-react";

import "./mention.css";

// Mention types
export type MentionType = "concept" | "document";

// Create the Mention inline content with type support
export const createMention = createReactInlineContentSpec(
  {
    type: "mention",
    propSchema: {
      mentionType: {
        default: "concept" as MentionType,
      },
      id: {
        default: "",
      },
      name: {
        default: "",
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      const { mentionType, id, name } = props.inlineContent.props;
      const displayName = name || "Unknown";
      const isConcept = mentionType === "concept";

      return (
        <span
          className={`mention-inline ${isConcept ? "mention-concept" : "mention-document"}`}
          data-mention-type={mentionType}
          data-mention-id={id}
          contentEditable={false}
          title={`${isConcept ? "Concept" : "Document"}: ${displayName}${id ? ` (${id})` : ""}`}
        >
          {isConcept ? (
            <Lightbulb className="mention-icon" size={12} />
          ) : (
            <FileText className="mention-icon" size={12} />
          )}
          <span className="mention-name">{displayName}</span>
        </span>
      );
    },
  }
);

// ============================================
// Mock Data - Replace with API calls later
// ============================================

export interface ConceptNode {
  id: string;
  name: string;
  description?: string;
  status: "active" | "stub";
}

export interface DocumentNode {
  id: string;
  title: string;
  status: "active" | "stub";
  updatedAt?: string;
}

// Mock Concepts
export const mockConcepts: ConceptNode[] = [
  { id: "c1", name: "Web3 Data API", description: "블록체인 데이터 조회 API", status: "active" },
  { id: "c2", name: "API Key", description: "API 인증을 위한 고유 키", status: "active" },
  { id: "c3", name: "Endpoint", description: "API 요청을 받는 URL 경로", status: "active" },
  { id: "c4", name: "Event Log", description: "블록체인에서 발생한 이벤트 기록", status: "active" },
  { id: "c5", name: "SDK", description: "소프트웨어 개발 키트", status: "active" },
  { id: "c6", name: "Smart Contract", description: "블록체인 스마트 계약", status: "active" },
  { id: "c7", name: "BNB Chain", description: "바이낸스 스마트 체인", status: "active" },
  { id: "c8", name: "Token", description: "블록체인 토큰", status: "stub" },
];

// Mock Documents
export const mockDocuments: DocumentNode[] = [
  { id: "d1", title: "API 인증 가이드", status: "active", updatedAt: "2024-01-15" },
  { id: "d2", title: "시작하기", status: "active", updatedAt: "2024-01-14" },
  { id: "d3", title: "REST API 개요", status: "active", updatedAt: "2024-01-13" },
  { id: "d4", title: "Web3 통합 가이드", status: "active", updatedAt: "2024-01-12" },
  { id: "d5", title: "블록체인 기초", status: "stub", updatedAt: "2024-01-11" },
  { id: "d6", title: "SDK 설치", status: "stub", updatedAt: "2024-01-10" },
];

// ============================================
// Mention Item Types for Suggestion Menu
// ============================================

export interface MentionItem {
  type: MentionType;
  id: string;
  name: string;
  description?: string;
  status: "active" | "stub";
}

// Get all mention items for suggestion menu
export const getMentionItems = (query: string): MentionItem[] => {
  const lowerQuery = query.toLowerCase();

  const conceptItems: MentionItem[] = mockConcepts
    .filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.description?.toLowerCase().includes(lowerQuery)
    )
    .map((c) => ({
      type: "concept" as MentionType,
      id: c.id,
      name: c.name,
      description: c.description,
      status: c.status,
    }));

  const documentItems: MentionItem[] = mockDocuments
    .filter((d) => d.title.toLowerCase().includes(lowerQuery))
    .map((d) => ({
      type: "document" as MentionType,
      id: d.id,
      name: d.title,
      status: d.status,
    }));

  return [...conceptItems, ...documentItems];
};

// Create a new stub node (to be connected to backend later)
export const createStubNode = (
  type: MentionType,
  name: string
): MentionItem => {
  const id = `stub-${Date.now()}`;
  
  if (type === "concept") {
    const newConcept: ConceptNode = {
      id,
      name,
      status: "stub",
    };
    mockConcepts.push(newConcept);
    return { type: "concept", id, name, status: "stub" };
  } else {
    const newDocument: DocumentNode = {
      id,
      title: name,
      status: "stub",
    };
    mockDocuments.push(newDocument);
    return { type: "document", id, name, status: "stub" };
  }
};

