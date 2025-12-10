import type { Concept } from "@/lib/types/api";

// Mock Concepts
export const mockConcepts: Concept[] = [
  {
    id: "concept-001",
    term: "Document",
    description:
      "실제 문서 콘텐츠를 담는 단위입니다. Markdown 또는 OAS 형식으로 작성됩니다.",
    category: "core",
    lang: "ko",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "concept-002",
    term: "Page",
    description: "URL, 메뉴 구조를 나타내는 단위입니다. Document와 연결됩니다.",
    category: "core",
    lang: "ko",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "concept-003",
    term: "Version",
    description:
      "페이지 세트를 묶는 버전 단위입니다. v1.0.0 형식을 사용합니다.",
    category: "core",
    lang: "ko",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "concept-004",
    term: "Concept",
    description:
      "용어/개념을 정의하는 단위입니다. 문서에서 참조되어 일관성을 유지합니다.",
    category: "glossary",
    lang: "ko",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-16T00:00:00Z",
  },
  {
    id: "concept-005",
    term: "GraphDB",
    description:
      "노드와 엣지로 데이터를 저장하는 데이터베이스입니다. Neo4j를 사용합니다.",
    category: "technical",
    lang: "ko",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-17T00:00:00Z",
  },
  {
    id: "concept-006",
    term: "Working Copy",
    description: "publish된 문서를 수정하기 위한 작업용 복사본입니다.",
    category: "workflow",
    lang: "ko",
    created_at: "2024-01-04T00:00:00Z",
    updated_at: "2024-01-18T00:00:00Z",
  },
];

// Helper to get mock concept by ID
export function getMockConcept(id: string): Concept | undefined {
  return mockConcepts.find((concept) => concept.id === id);
}

// Helper to filter concepts by category
export function filterMockConcepts(category?: string): Concept[] {
  if (!category) return mockConcepts;
  return mockConcepts.filter((concept) => concept.category === category);
}
