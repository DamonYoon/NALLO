/* ============================================
   Types
   ============================================ */

export type GlossaryCategory = "API 요소" | "개념" | "기능";

export interface GlossaryTerm {
  id: string;
  name: string;
  description: string;
  category: GlossaryCategory;
  documentCount: number;
  linkedDocumentCount: number;
  lastModified: string;
}

/* ============================================
   Mock Data
   ============================================ */

export const mockGlossaryTerms: GlossaryTerm[] = [
  {
    id: "1",
    name: "REST API",
    description: "HTTP 기반의 웹 서비스 아키텍처 스타일",
    category: "API 요소",
    documentCount: 5,
    linkedDocumentCount: 12,
    lastModified: "2025.12.02",
  },
  {
    id: "2",
    name: "Webhook",
    description: "이벤트 기반 실시간 데이터 전송 방식",
    category: "개념",
    documentCount: 5,
    linkedDocumentCount: 12,
    lastModified: "2025.12.02",
  },
  {
    id: "3",
    name: "Authentication",
    description: "사용자 신원 확인 및 인증 프로세스",
    category: "기능",
    documentCount: 5,
    linkedDocumentCount: 12,
    lastModified: "2025.12.02",
  },
  {
    id: "4",
    name: "Rate Limiting",
    description: "API 호출 횟수 제한 정책",
    category: "API 요소",
    documentCount: 3,
    linkedDocumentCount: 8,
    lastModified: "2025.12.01",
  },
  {
    id: "5",
    name: "Token",
    description: "인증 및 권한 부여를 위한 디지털 키",
    category: "개념",
    documentCount: 7,
    linkedDocumentCount: 15,
    lastModified: "2025.11.30",
  },
  {
    id: "6",
    name: "API Key",
    description: "개발자 인증을 위한 고유 식별자",
    category: "API 요소",
    documentCount: 4,
    linkedDocumentCount: 10,
    lastModified: "2025.11.28",
  },
  {
    id: "7",
    name: "Endpoint",
    description: "API 리소스에 접근하기 위한 URL",
    category: "개념",
    documentCount: 6,
    linkedDocumentCount: 14,
    lastModified: "2025.11.25",
  },
  {
    id: "8",
    name: "JSON Response",
    description: "API 응답 데이터의 표준 형식",
    category: "기능",
    documentCount: 8,
    linkedDocumentCount: 20,
    lastModified: "2025.11.20",
  },
];

/* ============================================
   Category Options (for filters)
   ============================================ */

export const glossaryCategoryOptions: { value: string; label: string }[] = [
  { value: "all", label: "전체 카테고리" },
  { value: "API 요소", label: "API 요소" },
  { value: "개념", label: "개념" },
  { value: "기능", label: "기능" },
];
