/**
 * Seed Data for GraphDB Testing
 *
 * GraphDB에 테스트용 dummy data를 생성하기 위한 정의
 */

import type {
  CreateDocumentRequest,
  CreateConceptRequest,
  CreateVersionRequest,
} from "@/lib/types/api";

// ============================================
// Versions (버전)
// ============================================
export const SEED_VERSIONS: CreateVersionRequest[] = [
  {
    version: "1.0.0",
    name: "Initial Release",
    description: "첫 번째 안정 버전",
    is_public: true,
    is_main: true,
  },
  {
    version: "1.1.0",
    name: "Feature Update",
    description: "새로운 기능 추가 버전",
    is_public: true,
    is_main: false,
  },
  {
    version: "2.0.0-beta",
    name: "Beta Release",
    description: "다음 메이저 버전 베타",
    is_public: false,
    is_main: false,
  },
];

// ============================================
// Concepts (용어/개념)
// ============================================
export const SEED_CONCEPTS: CreateConceptRequest[] = [
  {
    term: "GraphDB",
    description:
      "그래프 데이터베이스. 노드와 엣지로 데이터를 저장하며, 관계 기반 쿼리에 최적화되어 있습니다.",
    category: "Database",
    lang: "ko",
  },
  {
    term: "Neo4j",
    description:
      "가장 널리 사용되는 그래프 데이터베이스 시스템. Cypher 쿼리 언어를 사용합니다.",
    category: "Database",
    lang: "ko",
  },
  {
    term: "REST API",
    description:
      "Representational State Transfer. HTTP 프로토콜을 기반으로 하는 웹 서비스 아키텍처 스타일입니다.",
    category: "Architecture",
    lang: "ko",
  },
  {
    term: "JWT",
    description:
      "JSON Web Token. 인증 정보를 안전하게 전달하기 위한 토큰 기반 인증 방식입니다.",
    category: "Security",
    lang: "ko",
  },
  {
    term: "CRUD",
    description:
      "Create, Read, Update, Delete의 약자. 데이터 저장소에서 수행되는 기본 작업들입니다.",
    category: "Development",
    lang: "ko",
  },
  {
    term: "Pagination",
    description:
      "페이지네이션. 대량의 데이터를 작은 단위로 나누어 조회하는 기법입니다.",
    category: "Development",
    lang: "ko",
  },
  {
    term: "Document",
    description:
      "문서 노드. NALLO에서 관리되는 기술 문서의 기본 단위입니다.",
    category: "NALLO",
    lang: "ko",
  },
  {
    term: "Version",
    description:
      "버전 노드. 문서의 특정 시점 상태를 나타내며, 배포 관리에 사용됩니다.",
    category: "NALLO",
    lang: "ko",
  },
  {
    term: "Concept",
    description:
      "개념/용어 노드. 문서에서 사용되는 기술 용어와 그 정의를 관리합니다.",
    category: "NALLO",
    lang: "ko",
  },
  {
    term: "Node",
    description:
      "그래프에서 엔티티를 나타내는 기본 요소. 라벨과 속성을 가질 수 있습니다.",
    category: "Graph",
    lang: "ko",
  },
];

// ============================================
// Documents (문서)
// ============================================
export const SEED_DOCUMENTS: CreateDocumentRequest[] = [
  // API Documents
  {
    title: "인증 API 가이드",
    type: "api",
    lang: "ko",
    content: `# 인증 API 가이드

## 개요
사용자 인증 및 권한 관리를 위한 API 엔드포인트입니다.

## 엔드포인트

### POST /auth/login
사용자 로그인을 처리합니다.

\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

### POST /auth/logout
현재 세션을 종료합니다.

### GET /auth/me
현재 인증된 사용자 정보를 반환합니다.

## 응답 코드
- 200: 성공
- 401: 인증 실패
- 403: 권한 없음
`,
    tags: ["auth", "security", "api"],
  },
  {
    title: "문서 관리 API",
    type: "api",
    lang: "ko",
    content: `# 문서 관리 API

## 개요
기술 문서의 CRUD 작업을 위한 API입니다.

## 엔드포인트

### GET /documents
문서 목록을 조회합니다.

**Query Parameters:**
- \`limit\`: 조회할 문서 수 (기본값: 20)
- \`offset\`: 시작 위치
- \`status\`: 문서 상태 필터
- \`type\`: 문서 타입 필터

### POST /documents
새 문서를 생성합니다.

### GET /documents/{id}
특정 문서를 조회합니다.

### PUT /documents/{id}
문서를 수정합니다.

### DELETE /documents/{id}
문서를 삭제합니다.
`,
    tags: ["documents", "crud", "api"],
  },
  {
    title: "검색 API",
    type: "api",
    lang: "ko",
    content: `# 검색 API

## 개요
문서 및 용어 검색을 위한 API입니다.

## 엔드포인트

### GET /search
전체 검색을 수행합니다.

**Query Parameters:**
- \`query\`: 검색어 (필수)
- \`version_id\`: 버전 필터
- \`limit\`: 결과 수 제한

## 검색 결과

\`\`\`json
{
  "results": [
    {
      "page_id": "uuid",
      "title": "문서 제목",
      "summary": "일치하는 내용...",
      "relevance_score": 0.95
    }
  ],
  "total": 10
}
\`\`\`
`,
    tags: ["search", "api"],
  },
  // Tutorial Documents
  {
    title: "시작하기 가이드",
    type: "tutorial",
    lang: "ko",
    content: `# NALLO 시작하기

## 소개
NALLO는 기술 문서를 효율적으로 관리하고 배포하는 플랫폼입니다.

## 설치

### 1. 저장소 클론
\`\`\`bash
git clone https://github.com/your-org/nallo.git
cd nallo
\`\`\`

### 2. 의존성 설치
\`\`\`bash
# Backend
cd backend
poetry install

# Frontend
cd frontend
npm install
\`\`\`

### 3. 환경 설정
\`.env\` 파일을 생성하고 필요한 환경 변수를 설정합니다.

## 다음 단계
- [문서 작성하기](./writing-docs)
- [버전 관리하기](./version-management)
`,
    tags: ["tutorial", "getting-started"],
  },
  {
    title: "문서 작성 가이드",
    type: "tutorial",
    lang: "ko",
    content: `# 문서 작성 가이드

## Markdown 사용법

NALLO는 Markdown 형식을 지원합니다.

### 기본 문법

#### 제목
\`\`\`markdown
# H1
## H2
### H3
\`\`\`

#### 코드 블록
\`\`\`\`markdown
\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`
\`\`\`\`

#### 링크
\`\`\`markdown
[링크 텍스트](url)
\`\`\`

## 용어 링크

문서 내에서 정의된 용어에 자동으로 링크가 생성됩니다.

예: [[GraphDB]]는 관계 기반 데이터 저장에 최적화되어 있습니다.
`,
    tags: ["tutorial", "markdown", "writing"],
  },
  // General Documents
  {
    title: "아키텍처 개요",
    type: "general",
    lang: "ko",
    content: `# NALLO 아키텍처

## 시스템 구성

NALLO는 마이크로서비스 아키텍처를 기반으로 합니다.

## 주요 컴포넌트

### Backend (FastAPI)
- REST API 제공
- 비즈니스 로직 처리
- 데이터베이스 연동

### Frontend (Next.js)
- 관리자 UI
- 사용자 문서 뷰어
- 실시간 미리보기

### Database
- **Neo4j**: 문서 관계 및 그래프 데이터
- **PostgreSQL**: 사용자, 설정 등 관계형 데이터

## 데이터 흐름

\`\`\`
User -> Frontend -> Backend -> Database
                      |
                      v
                   Neo4j (Graph)
                      +
                   PostgreSQL
\`\`\`
`,
    tags: ["architecture", "overview"],
  },
  {
    title: "배포 가이드",
    type: "general",
    lang: "ko",
    content: `# 배포 가이드

## 배포 환경

### Docker 기반 배포

\`\`\`yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  
  neo4j:
    image: neo4j:5
    ports:
      - "7474:7474"
      - "7687:7687"
\`\`\`

## CI/CD

GitHub Actions를 사용하여 자동 배포를 구성합니다.

### 배포 트리거
- main 브랜치 push
- Release 태그 생성

## 모니터링

- Prometheus + Grafana 대시보드
- 에러 추적: Sentry
`,
    tags: ["deployment", "devops", "docker"],
  },
  {
    title: "FAQ",
    type: "general",
    lang: "ko",
    content: `# 자주 묻는 질문 (FAQ)

## 일반

### Q: NALLO는 무엇인가요?
A: NALLO는 기술 문서 관리 및 배포를 위한 플랫폼입니다.

### Q: 어떤 형식의 문서를 지원하나요?
A: Markdown, OpenAPI, AsyncAPI 등을 지원합니다.

## 기술

### Q: 지원하는 데이터베이스는?
A: Neo4j (그래프)와 PostgreSQL을 사용합니다.

### Q: API 인증 방식은?
A: JWT 토큰 기반 인증을 사용합니다.

## 문제 해결

### Q: 연결 오류가 발생합니다
A: 백엔드 서버가 실행 중인지 확인하고, 환경 변수를 점검하세요.

### Q: 문서가 표시되지 않습니다
A: 캐시를 지우고 새로고침 해보세요.
`,
    tags: ["faq", "support"],
  },
];

// ============================================
// Summary
// ============================================
export const SEED_DATA_SUMMARY = {
  versions: SEED_VERSIONS.length,
  concepts: SEED_CONCEPTS.length,
  documents: SEED_DOCUMENTS.length,
};

