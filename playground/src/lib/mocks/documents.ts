import type { Document, DocumentListResponse } from "@/lib/types/api";

// Mock Documents
export const mockDocuments: Document[] = [
  {
    id: "doc-001",
    type: "tutorial",
    status: "publish",
    title: "Getting Started with NALLO",
    lang: "ko",
    content: `# Getting Started with NALLO

NALLO에 오신 것을 환영합니다!

## 소개

NALLO는 지식 기반 문서 관리 시스템입니다.

## 주요 기능

1. **문서 관리**: Markdown 기반 문서 작성
2. **용어집**: 일관된 용어 사용을 위한 글로서리
3. **그래프 뷰**: 문서 간 관계 시각화

## 시작하기

\`\`\`bash
npm install
npm run dev
\`\`\`
`,
    summary: "NALLO 시작 가이드",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T15:30:00Z",
  },
  {
    id: "doc-002",
    type: "api",
    status: "publish",
    title: "Document API Reference",
    lang: "ko",
    content: `# Document API Reference

## Endpoints

### GET /documents

문서 목록을 조회합니다.

### POST /documents

새 문서를 생성합니다.

\`\`\`json
{
  "title": "My Document",
  "type": "general",
  "content": "# Hello",
  "lang": "ko"
}
\`\`\`
`,
    summary: "문서 API 레퍼런스",
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-18T12:00:00Z",
  },
  {
    id: "doc-003",
    type: "general",
    status: "draft",
    title: "Architecture Overview",
    lang: "ko",
    content: `# Architecture Overview

## 시스템 구조

NALLO는 다음 컴포넌트로 구성됩니다:

| Component | Technology |
|-----------|------------|
| Frontend | Next.js |
| Backend | Express |
| Database | Neo4j, PostgreSQL |
`,
    summary: "시스템 아키텍처 개요",
    created_at: "2024-01-12T09:00:00Z",
    updated_at: "2024-01-12T09:00:00Z",
  },
  {
    id: "doc-004",
    type: "tutorial",
    status: "in_review",
    title: "Creating Your First Document",
    lang: "ko",
    content: `# Creating Your First Document

이 가이드에서는 첫 번째 문서를 만드는 방법을 알아봅니다.

## Step 1: 새 문서 시작

1. "새 문서" 버튼을 클릭합니다.
2. 제목을 입력합니다.
3. 문서 타입을 선택합니다.

## Step 2: 내용 작성

Markdown 에디터를 사용하여 내용을 작성합니다.
`,
    summary: "첫 문서 작성 튜토리얼",
    created_at: "2024-01-08T14:00:00Z",
    updated_at: "2024-01-19T11:00:00Z",
  },
  {
    id: "doc-005",
    type: "api",
    status: "done",
    title: "Concept API Reference",
    lang: "en",
    content: `# Concept API Reference

## Overview

The Concept API allows you to manage glossary terms.

## Endpoints

- GET /concepts/:id
- POST /concepts
- PUT /concepts/:id
`,
    summary: "Concept API documentation",
    created_at: "2024-01-05T10:00:00Z",
    updated_at: "2024-01-17T16:00:00Z",
  },
];

// Mock document list response
export const mockDocumentListResponse: DocumentListResponse = {
  items: mockDocuments,
  total: mockDocuments.length,
  limit: 20,
  offset: 0,
};

// Helper to get mock document by ID
export function getMockDocument(id: string): Document | undefined {
  return mockDocuments.find((doc) => doc.id === id);
}

// Helper to filter mock documents
export function filterMockDocuments(filters?: {
  status?: string;
  type?: string;
  lang?: string;
}): DocumentListResponse {
  let filtered = [...mockDocuments];

  if (filters?.status) {
    filtered = filtered.filter((doc) => doc.status === filters.status);
  }
  if (filters?.type) {
    filtered = filtered.filter((doc) => doc.type === filters.type);
  }
  if (filters?.lang) {
    filtered = filtered.filter((doc) => doc.lang === filters.lang);
  }

  return {
    items: filtered,
    total: filtered.length,
    limit: 20,
    offset: 0,
  };
}
