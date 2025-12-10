/**
 * Mock data for Document Editor
 * This file contains sample data for development and testing
 */

/* ============================================
   Types
   ============================================ */

export interface GlossaryTermSuggestion {
  id: string;
  name: string;
  description: string;
}

export interface LinkedTerm {
  id: string;
  name: string;
  description: string;
}

export type DocumentType = "api-guide" | "general" | "tutorial";

export interface DocumentFormData {
  title: string;
  content: string;
  type: DocumentType;
  status: "Draft" | "In Review" | "Done" | "Publish";
  location: string;
  tags: string[];
  linkedTerms: LinkedTerm[];
}

/* ============================================
   Document Type Options
   ============================================ */

export const documentTypeOptions = [
  { value: "api-guide", label: "API Guide" },
  { value: "general", label: "General" },
  { value: "tutorial", label: "Tutorial" },
];

export const documentStatusOptions = [
  { value: "Draft", label: "Draft" },
  { value: "In Review", label: "In Review" },
  { value: "Done", label: "Done" },
  { value: "Publish", label: "Publish" },
];

/* ============================================
   Mock Glossary Terms (for autocomplete)
   ============================================ */

export const mockGlossaryTerms: GlossaryTermSuggestion[] = [
  {
    id: "term-1",
    name: "Web3 Data API",
    description: "Web3 블록체인 데이터를 조회하는 API",
  },
  {
    id: "term-2",
    name: "API Key",
    description: "API 인증을 위한 고유 키",
  },
  {
    id: "term-3",
    name: "Endpoint",
    description: "API 요청을 받는 URL 경로",
  },
  {
    id: "term-4",
    name: "Event Log",
    description: "블록체인에서 발생한 이벤트 기록",
  },
  {
    id: "term-5",
    name: "SDK",
    description: "소프트웨어 개발 키트",
  },
];

/* ============================================
   Default Document Data
   ============================================ */

export const defaultDocumentData: DocumentFormData = {
  title: "",
  content: "",
  type: "api-guide",
  status: "Draft",
  location: "Getting Started > Features",
  tags: [],
  linkedTerms: [],
};

export const mockExistingDocument: DocumentFormData = {
  title: "Web3 Data API Quickstart",
  content:
    "BNB Chain의 온체인 데이터를 빠르게 조회할 수 있는 Web3 Data API의 기본 사용법을 안내합니다.",
  type: "api-guide",
  status: "Draft",
  location: "Getting Started > Features",
  tags: ["Quickstart", "beginner"],
  linkedTerms: mockGlossaryTerms.slice(0, 3).map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
  })),
};

