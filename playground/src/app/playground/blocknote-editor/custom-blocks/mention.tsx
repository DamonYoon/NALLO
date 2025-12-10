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
  { id: "c1", name: "AI", description: "Artificial Intelligence", status: "active" },
  { id: "c2", name: "Machine Learning", description: "ML algorithms and models", status: "active" },
  { id: "c3", name: "Deep Learning", description: "Neural networks", status: "active" },
  { id: "c4", name: "NLP", description: "Natural Language Processing", status: "active" },
  { id: "c5", name: "Computer Vision", description: "Image and video analysis", status: "active" },
  { id: "c6", name: "Knowledge Graph", description: "Graph-based knowledge representation", status: "active" },
  { id: "c7", name: "RAG", description: "Retrieval Augmented Generation", status: "active" },
  { id: "c8", name: "Vector Database", description: "Embedding storage", status: "stub" },
];

// Mock Documents
export const mockDocuments: DocumentNode[] = [
  { id: "d1", title: "프로젝트 개요", status: "active", updatedAt: "2024-01-15" },
  { id: "d2", title: "API 설계 문서", status: "active", updatedAt: "2024-01-14" },
  { id: "d3", title: "데이터 모델링", status: "active", updatedAt: "2024-01-13" },
  { id: "d4", title: "사용자 가이드", status: "active", updatedAt: "2024-01-12" },
  { id: "d5", title: "아키텍처 설계", status: "stub", updatedAt: "2024-01-11" },
  { id: "d6", title: "테스트 계획", status: "stub", updatedAt: "2024-01-10" },
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
