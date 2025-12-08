# Implementation Plan: Admin Frontend

## Overview

Admin Frontend 구현을 위한 단계별 계획입니다. **컴포넌트 주도 개발(Component-Driven Development)** 방식을 따르며, 각 컴포넌트는 Playground에서 독립적으로 개발/테스트 후 실제 페이지에 통합됩니다.

### 개발 철학

```
1. 컴포넌트 먼저 → 개별 컴포넌트를 /playground에서 개발 및 테스트
2. 조합 테스트 → 여러 컴포넌트를 조합하여 기능 단위 테스트
3. 페이지 통합 → UI 확정 후 실제 페이지에 컴포넌트 배치
```

---

## Phase 1: Foundation & Component Infrastructure (Week 1)

### 1.1 Project Setup

- [ ] Next.js 14+ 프로젝트 생성 (App Router)
- [ ] TypeScript 설정
- [ ] Tailwind CSS 설정
- [ ] shadcn/ui 설정
- [ ] ESLint + Prettier 설정
- [ ] 디렉토리 구조 설정

### 1.2 Component Playground Setup

- [ ] `/playground` 라우트 생성 (개발 전용)
- [ ] 컴포넌트 카탈로그 페이지 (`/playground/page.tsx`)
- [ ] 개별 컴포넌트 테스트 페이지 구조 (`/playground/[component]/page.tsx`)
- [ ] Props 조정 패널 (선택사항)
- [ ] 개발 환경에서만 접근 가능하도록 설정

### 1.3 API Integration Setup

- [ ] OpenAPI spec에서 TypeScript 타입 생성
- [ ] API 클라이언트 설정 (Axios/ky)
- [ ] TanStack Query 설정
- [ ] 환경 변수 설정 (API URL 등)
- [ ] Mock 데이터 헬퍼 (컴포넌트 테스트용)

### 1.4 Basic Layout (Minimal)

- [ ] Root Layout (기본 구조만)
- [ ] 임시 네비게이션 (Playground 접근용)
- [ ] 다크모드 토글

---

## Phase 2: Core Components (Week 2)

> **Note**: 이 단계에서는 **컴포넌트만** 개발합니다. 실제 페이지 통합은 Phase 4에서 진행합니다.

### 2.1 Document Components

- [ ] `MarkdownEditor` - Markdown 편집기
  - 툴바 (볼드, 이탤릭, 링크, 이미지 등)
  - 실시간 미리보기 (split view)
  - 자동 저장 (debounce)
- [ ] `MarkdownViewer` - Markdown 렌더링 뷰어
  - 코드 하이라이팅
  - 목차 자동 생성
- [ ] `DocumentForm` - 문서 기본 정보 폼
  - 제목, 타입, 언어, 태그 입력
- [ ] `DocumentCard` - 문서 카드 (목록용)
- [ ] `DocumentTable` - 문서 테이블 (목록용)

### 2.2 Concept Components

- [ ] `ConceptForm` - 용어 생성/편집 폼
- [ ] `ConceptCard` - 용어 카드
- [ ] `ConceptList` - 용어 목록
- [ ] `ImpactAnalysisPanel` - 영향도 분석 (사용 문서 목록)

### 2.3 Version & Page Components

- [ ] `VersionForm` - 버전 생성/편집 폼
- [ ] `VersionCard` - 버전 카드
- [ ] `PageTree` - 페이지 트리 뷰
- [ ] `PageForm` - 페이지 생성/편집 폼
- [ ] `PageDocumentLinker` - 페이지-문서 연결 UI

### 2.4 Shared Components

- [ ] `DataTable` - 범용 데이터 테이블 (정렬, 필터, 페이지네이션)
- [ ] `SearchInput` - 검색 입력 (debounce, 자동완성)
- [ ] `FileUploader` - 파일 업로드 (드래그 앤 드롭)
- [ ] `ConfirmDialog` - 확인 다이얼로그
- [ ] `LoadingSkeleton` - 로딩 스켈레톤
- [ ] `EmptyState` - 빈 상태 표시

---

## Phase 3: Advanced Components (Week 3)

### 3.1 Graph Visualization Components

- [ ] `GraphView` - 그래프 시각화 메인 컴포넌트
  - 노드/엣지 렌더링
  - 노드 타입별 스타일링
  - 줌/팬 컨트롤
- [ ] `GraphNodeDetail` - 노드 상세 정보 패널
- [ ] `GraphFilter` - 노드 타입 필터

### 3.2 Search Components

- [ ] `GlobalSearch` - 글로벌 검색 (Command Palette 스타일)
- [ ] `SearchResults` - 검색 결과 목록
- [ ] `SearchFilters` - 검색 필터 패널

### 3.3 Dashboard Widgets

- [ ] `StatCard` - 통계 카드
- [ ] `RecentDocuments` - 최근 문서 위젯
- [ ] `QuickActions` - 빠른 액션 버튼 그룹

---

## Phase 4: Page Integration & Polish (Week 4)

> **Note**: UI가 확정되면 이 단계에서 컴포넌트를 실제 페이지에 통합합니다.

### 4.1 Layout & Navigation (UI 확정 후)

- [ ] Sidebar 네비게이션
- [ ] Header
- [ ] Breadcrumb
- [ ] 반응형 레이아웃

### 4.2 Page Integration (UI 확정 후)

- [ ] `/documents` - 문서 목록 페이지
- [ ] `/documents/new` - 문서 생성 페이지
- [ ] `/documents/[id]` - 문서 상세 페이지
- [ ] `/concepts` - 용어 관리 페이지
- [ ] `/versions` - 버전 관리 페이지
- [ ] `/graph` - 그래프 뷰 페이지
- [ ] `/dashboard` - 대시보드 페이지

### 4.3 Error Handling & Loading

- [ ] 글로벌 에러 바운더리
- [ ] Toast 알림 시스템
- [ ] 404/500 페이지
- [ ] Skeleton 로딩 UI

### 4.4 Authentication (추후 추가)

- [ ] 로그인 페이지
- [ ] JWT 토큰 관리
- [ ] Protected Route 미들웨어

---

## Directory Structure

```
admin-frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── playground/               # 🎮 Component Playground (개발 전용)
│   │   │   ├── page.tsx              # 컴포넌트 카탈로그
│   │   │   ├── markdown-editor/
│   │   │   │   └── page.tsx          # MarkdownEditor 테스트
│   │   │   ├── markdown-viewer/
│   │   │   │   └── page.tsx          # MarkdownViewer 테스트
│   │   │   ├── document-form/
│   │   │   │   └── page.tsx          # DocumentForm 테스트
│   │   │   ├── data-table/
│   │   │   │   └── page.tsx          # DataTable 테스트
│   │   │   ├── graph-view/
│   │   │   │   └── page.tsx          # GraphView 테스트
│   │   │   └── layout.tsx            # Playground 레이아웃
│   │   ├── (main)/                   # 메인 앱 (UI 확정 후)
│   │   │   ├── documents/
│   │   │   ├── concepts/
│   │   │   ├── versions/
│   │   │   ├── graph/
│   │   │   └── layout.tsx
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # 홈 (Playground 링크)
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── documents/
│   │   │   ├── markdown-editor.tsx   # Markdown 편집기
│   │   │   ├── markdown-viewer.tsx   # Markdown 뷰어
│   │   │   ├── document-form.tsx     # 문서 폼
│   │   │   ├── document-card.tsx     # 문서 카드
│   │   │   └── document-table.tsx    # 문서 테이블
│   │   ├── concepts/
│   │   │   ├── concept-form.tsx
│   │   │   ├── concept-card.tsx
│   │   │   └── impact-analysis.tsx
│   │   ├── versions/
│   │   │   ├── version-form.tsx
│   │   │   └── version-card.tsx
│   │   ├── pages/
│   │   │   ├── page-tree.tsx
│   │   │   ├── page-form.tsx
│   │   │   └── page-document-linker.tsx
│   │   ├── graph/
│   │   │   ├── graph-view.tsx
│   │   │   ├── graph-node-detail.tsx
│   │   │   └── graph-filter.tsx
│   │   └── shared/
│   │       ├── data-table.tsx
│   │       ├── search-input.tsx
│   │       ├── file-uploader.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── loading-skeleton.tsx
│   │       └── empty-state.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts             # API client setup
│   │   │   ├── documents.ts
│   │   │   ├── concepts.ts
│   │   │   ├── versions.ts
│   │   │   ├── pages.ts
│   │   │   └── search.ts
│   │   ├── hooks/
│   │   │   ├── use-documents.ts      # TanStack Query hooks
│   │   │   ├── use-concepts.ts
│   │   │   └── use-versions.ts
│   │   ├── mocks/                    # 🎭 Mock 데이터 (컴포넌트 테스트용)
│   │   │   ├── documents.ts
│   │   │   ├── concepts.ts
│   │   │   └── versions.ts
│   │   ├── stores/
│   │   │   └── ui-store.ts           # UI 상태 (테마 등)
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   └── format.ts
│   │   └── types/
│   │       └── api.ts                # API 타입
│   └── styles/
├── public/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── components.json                   # shadcn/ui config
├── package.json
└── README.md
```

---

## Dependencies

### Production

```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.4.0",
  "axios": "^1.6.0",
  "tailwindcss": "^3.4.0",
  "@radix-ui/react-*": "latest",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0",
  "lucide-react": "^0.300.0",
  "@uiw/react-md-editor": "^4.0.0",
  "react-markdown": "^9.0.0",
  "remark-gfm": "^4.0.0",
  "@neo4j-nvl/react": "^0.3.0"
}
```

### Development

```json
{
  "@types/node": "^20.0.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "eslint": "^8.0.0",
  "eslint-config-next": "^14.0.0",
  "prettier": "^3.0.0",
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.0.0",
  "@playwright/test": "^1.40.0"
}
```

---

## Risk Assessment

| Risk             | Impact | Mitigation                                |
| ---------------- | ------ | ----------------------------------------- |
| Backend API 변경 | High   | OpenAPI spec 기반 타입 생성으로 변경 감지 |
| 그래프 성능 이슈 | Medium | 가상화, 레이지 로딩, 노드 수 제한         |
| 인증 토큰 만료   | Medium | 자동 토큰 갱신 또는 재로그인 유도         |
| 에디터 성능      | Medium | 디바운싱, 청크 단위 저장                  |

---

## Milestones

| Milestone               | Target Date | Deliverables                                                   |
| ----------------------- | ----------- | -------------------------------------------------------------- |
| M1: Foundation          | Week 1      | 프로젝트 셋업, Playground, API 클라이언트                      |
| M2: Core Components     | Week 2      | Markdown Editor/Viewer, Document/Concept/Version 폼, DataTable |
| M3: Advanced Components | Week 3      | GraphView, Search, Dashboard 위젯                              |
| M4: Integration         | Week 4      | UI 확정 후 페이지 통합, 에러 핸들링, 최적화                    |

---

## Component Development Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    개발 워크플로우                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 컴포넌트 생성                                            │
│     └── src/components/{domain}/{component-name}.tsx         │
│                                                             │
│  2. Playground 페이지 생성                                   │
│     └── src/app/playground/{component-name}/page.tsx         │
│                                                             │
│  3. Mock 데이터로 독립 테스트                                 │
│     └── Props 변경하며 다양한 상태 테스트                      │
│                                                             │
│  4. API 연동 테스트 (선택)                                   │
│     └── 실제 백엔드 데이터로 테스트                           │
│                                                             │
│  5. UI 확정 후 페이지에 통합                                  │
│     └── src/app/(main)/{page}/page.tsx                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
