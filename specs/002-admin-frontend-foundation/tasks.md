# Tasks: Admin Frontend

## Task Overview

각 태스크는 독립적으로 완료 가능하며, 의존성이 있는 경우 명시합니다.

---

## Phase 1: Foundation

### TASK-001: Next.js 프로젝트 초기 설정

**Priority**: P0  
**Estimate**: 2h  
**Dependencies**: None

**Description**:
Next.js 14+ 프로젝트를 생성하고 기본 설정을 완료합니다.

**Subtasks**:

- [ ] `create-next-app`으로 프로젝트 생성 (App Router, TypeScript)
- [ ] `.env.local` 및 `.env.example` 설정
- [ ] `next.config.js` 설정 (이미지 도메인, 리다이렉트 등)
- [ ] ESLint 설정 (next/recommended + custom rules)
- [ ] Prettier 설정 (tailwind plugin)
- [ ] `.gitignore` 업데이트
- [ ] README.md 기본 내용 작성

**Acceptance Criteria**:

- `npm run dev`로 개발 서버 시작 가능
- `npm run build`로 빌드 성공
- `npm run lint`로 린트 체크 통과

---

### TASK-002: Tailwind CSS 및 shadcn/ui 설정

**Priority**: P0  
**Estimate**: 2h  
**Dependencies**: TASK-001

**Description**:
Tailwind CSS와 shadcn/ui를 설정하고 기본 테마를 구성합니다.

**Subtasks**:

- [ ] Tailwind CSS 설정 (content paths, plugins)
- [ ] `globals.css` 기본 스타일 설정
- [ ] shadcn/ui 초기화 (`npx shadcn-ui@latest init`)
- [ ] 기본 컴포넌트 설치 (Button, Input, Card, Dialog 등)
- [ ] 커스텀 테마 색상 설정 (CSS variables)
- [ ] 다크모드 설정 (next-themes)

**Acceptance Criteria**:

- shadcn/ui 컴포넌트가 올바르게 렌더링됨
- 다크/라이트 테마 전환 가능

---

### TASK-003: Component Playground 설정

**Priority**: P0  
**Estimate**: 2h  
**Dependencies**: TASK-002

**Description**:
컴포넌트 독립 개발/테스트를 위한 Playground 환경을 설정합니다.

**Subtasks**:

- [ ] `/playground` 라우트 및 레이아웃 생성
- [ ] 컴포넌트 카탈로그 메인 페이지 (`/playground/page.tsx`)
- [ ] 개별 컴포넌트 테스트 페이지 템플릿
- [ ] 다크모드 토글 추가
- [ ] 개발 환경에서만 접근 가능하도록 설정 (선택)

**Acceptance Criteria**:

- `/playground`에서 컴포넌트 목록 확인 가능
- 각 컴포넌트 테스트 페이지로 이동 가능
- 다크/라이트 모드 전환 가능

---

### TASK-004: API 클라이언트 및 Mock 데이터 설정

**Priority**: P0  
**Estimate**: 3h  
**Dependencies**: TASK-001

**Description**:
Backend API 클라이언트와 컴포넌트 테스트용 Mock 데이터를 설정합니다.

**Subtasks**:

- [ ] OpenAPI spec에서 TypeScript 타입 생성 스크립트 설정
- [ ] Axios 또는 ky 인스턴스 생성
- [ ] TanStack Query Provider 설정
- [ ] Query Client 설정 (staleTime, gcTime 등)
- [ ] API 함수 모듈 구조 설정 (`lib/api/`)
- [ ] Mock 데이터 생성 (`lib/mocks/`) - 문서, 용어, 버전 샘플
- [ ] 환경 변수로 Mock/Real API 전환 가능하도록 설정

**Acceptance Criteria**:

- `/health` 엔드포인트 호출 성공 (Backend 실행 시)
- Mock 데이터로 컴포넌트 테스트 가능

---

### TASK-005: BlockNote 블록 기반 에디터 ✅

**Priority**: P0  
**Estimate**: 6h  
**Dependencies**: TASK-002, TASK-003
**Status**: ✅ 완료

**Description**:
Notion-style 블록 기반 WYSIWYG 에디터를 개발하고 Playground에서 테스트합니다.

**Subtasks**:

- [x] BlockNote 에디터 기본 통합 (`@blocknote/core`, `@blocknote/react`, `@blocknote/mantine`)
- [x] 코드 블록 문법 하이라이팅 (Shiki + `@blocknote/code-block`)
- [x] ` ```lang + Enter ` 단축키로 코드 블록 생성
- [x] 커스텀 Callout 블록 (7가지 타입: tip, info, warning, success, error, important, quote)
- [x] 커스텀 Mention 인라인 컨텐츠 (Concept/Document 연결)
  - [x] Concept 멘션 → USES_CONCEPT 관계 생성 예정
  - [x] Document 멘션 → LINKS_TO 관계 생성 예정
  - [x] 없는 Concept/Document 검색 시 빈 껍데기(stub) 노드 생성
- [x] 커스텀 스타일 (Highlight, Underline, Small Caps, Font Size)
- [x] Edit/View 토글 기능
- [x] 다크/라이트 모드 지원
- [x] `/playground/blocknote-editor` 테스트 페이지 생성

**Acceptance Criteria**:

- [x] Playground에서 블록 에디터 정상 동작
- [x] 슬래시 커맨드(`/`)로 블록 생성 가능
- [x] 멘션(`@`)으로 Concept/Document 연결 가능
- [x] Edit/View 모드 전환 가능
- [x] 다크/라이트 모드에서 정상 동작

---

### TASK-006: MarkdownViewer 컴포넌트 ✅

**Priority**: P0  
**Estimate**: 2h  
**Dependencies**: TASK-002, TASK-003
**Status**: ✅ 완료

**Description**:
Markdown 렌더링 뷰어 컴포넌트를 개발합니다.

**Subtasks**:

- [x] `react-markdown` + `remark-gfm` 설정
- [x] `MarkdownViewer` 컴포넌트 생성 (`components/documents/markdown-viewer.tsx`)
- [x] 코드 블록 하이라이팅 (`react-syntax-highlighter`)
- [x] 테이블, 체크리스트 렌더링
- [x] 코드 블록 복사 버튼

**Acceptance Criteria**:

- [x] Markdown이 올바르게 렌더링됨
- [x] 코드 블록에 구문 하이라이팅 적용됨
- [x] GFM (GitHub Flavored Markdown) 지원

---

## Phase 2: Core Components

> **Note**: 이 단계에서는 컴포넌트만 개발합니다. 페이지 통합은 UI 확정 후 진행합니다.

### TASK-007: DataTable 컴포넌트 ✅

**Priority**: P1  
**Estimate**: 4h  
**Dependencies**: TASK-002
**Status**: ✅ 완료

**Description**:
범용 데이터 테이블 컴포넌트를 개발합니다.

**Subtasks**:

- [x] `DataTable` 컴포넌트 생성 (`components/shared/data-table.tsx`)
- [x] `DataTableColumnHeader` 헬퍼 컴포넌트 생성
- [x] 컬럼 정의 인터페이스 (@tanstack/react-table)
- [x] 정렬 기능 (컬럼 헤더 클릭, 오름차순/내림차순)
- [x] 필터 기능 (검색 입력 필드)
- [x] 페이지네이션 (페이지 크기 선택, 네비게이션)
- [x] 행 선택 기능 (체크박스)
- [x] 컬럼 표시/숨김 토글
- [x] 로딩/빈 상태 처리 (Skeleton)
- [x] `/playground/data-table` 테스트 페이지 (Mock 문서 데이터)

**Acceptance Criteria**:

- [x] Playground에서 테이블 정렬, 필터, 페이지네이션 동작
- [x] 다양한 데이터 타입에 재사용 가능

---

### TASK-008: DocumentForm 컴포넌트 ✅

**Priority**: P1  
**Estimate**: 3h  
**Dependencies**: TASK-002
**Status**: ✅ 완료

**Description**:
문서 기본 정보 입력 폼 컴포넌트를 개발합니다.

**Subtasks**:

- [x] `DocumentForm` 컴포넌트 생성 (`components/documents/document-form.tsx`)
- [x] react-hook-form + zod 유효성 검사
- [x] 제목 입력 (필수, 최대 200자)
- [x] 타입 선택 (api, general, tutorial)
- [x] 언어 선택 (ko, en, ja)
- [x] 요약 입력 (선택, 최대 500자)
- [x] 태그 입력 (멀티 입력, Enter 키 추가, X 버튼 삭제)
- [x] 생성/편집 모드 지원
- [x] 로딩 상태 표시
- [x] `/playground/document-form` 테스트 페이지

**Acceptance Criteria**:

- [x] Playground에서 폼 입력 및 유효성 검사 동작
- [x] onSubmit으로 데이터 전달

---

### TASK-009: ConceptForm 및 ImpactAnalysis 컴포넌트 ✅

**Priority**: P1  
**Estimate**: 3h  
**Dependencies**: TASK-002
**Status**: ✅ 완료

**Description**:
용어 폼과 영향도 분석 컴포넌트를 개발합니다.

**Subtasks**:

- [x] `ConceptForm` 컴포넌트 생성 (`components/concepts/concept-form.tsx`)
- [x] 용어 입력 (필수, 최대 100자)
- [x] 설명 입력 (필수, 최대 2000자)
- [x] 언어 선택 (ko, en, ja)
- [x] ~~카테고리 필드 제거~~ (Concept 노드 간 관계로 자동 카테고리화)
- [x] react-hook-form + zod 유효성 검사
- [x] 생성/편집 모드 지원
- [x] `ImpactAnalysisPanel` 컴포넌트 (`components/concepts/impact-analysis.tsx`)
- [x] 영향받는 문서 목록 표시
- [x] `ConceptRelations` 컴포넌트 (`components/concepts/concept-relations.tsx`)
  - [x] 상위 개념 (SUBTYPE_OF) 관계 추가/삭제
  - [x] 동의어 (SYNONYM_OF) 관계 추가/삭제
  - [x] 부분-전체 (PART_OF) 관계 추가/삭제
  - [x] 검색 기반 용어 선택 UI (Combobox)
- [x] 문서 타입/상태 뱃지
- [x] 클릭 이벤트, 새로고침 버튼
- [x] 로딩/빈 상태 처리
- [x] `/playground/concept-form` 테스트 페이지

**Acceptance Criteria**:

- [x] Playground에서 폼 동작 확인
- [x] 영향도 분석 패널에 Mock 문서 목록 표시

---

### TASK-010: VersionForm 및 VersionCard 컴포넌트 ✅

**Priority**: P1  
**Estimate**: 2h  
**Dependencies**: TASK-002

**Description**:
버전 관련 컴포넌트들을 개발합니다.

**Subtasks**:

- [x] `VersionForm` 컴포넌트 (버전 식별자, 이름, 설명, 공개 여부, 메인 여부)
- [x] `VersionCard` 컴포넌트 (카드 형태로 버전 정보 표시)
- [x] `/playground/version-form` 테스트 페이지

**Acceptance Criteria**:

- ✅ Playground에서 버전 폼 동작 확인
- ✅ 버전 카드에 상태 뱃지 표시

---

### TASK-011: PageTree 컴포넌트 ✅

**Priority**: P1  
**Estimate**: 4h  
**Dependencies**: TASK-002

**Description**:
페이지 트리 구조 컴포넌트를 개발합니다.

**Subtasks**:

- [x] `PageTree` 컴포넌트 생성 (`components/pages/page-tree.tsx`)
- [x] 트리 노드 렌더링 (재귀)
- [x] 노드 확장/축소 (개별 + 전체)
- [x] 노드 선택 시 콜백
- [x] 액션 메뉴 (편집, 숨기기/표시, 하위 추가, 삭제)
- [x] 문서 링크 뱃지, 표시 여부 아이콘
- [x] `/playground/page-tree` 테스트 페이지 (Mock 계층 데이터)

**Acceptance Criteria**:

- ✅ Playground에서 트리 구조 표시
- ✅ 노드 클릭 시 선택 이벤트 발생

---

### TASK-012: 공통 컴포넌트 (Shared) ✅

**Priority**: P1  
**Estimate**: 3h  
**Dependencies**: TASK-002

**Description**:
공통으로 사용되는 유틸리티 컴포넌트들을 개발합니다.

**Subtasks**:

- [x] `SearchInput` - 검색 입력 (debounce, 사이즈 옵션, 클리어 버튼)
- [x] `FileUploader` - 파일 업로드 (드래그 앤 드롭, 진행률 표시)
- [x] `ConfirmDialog` - 확인 다이얼로그 (default/warning/danger variants)
- [x] `EmptyState` - 빈 상태 표시 (empty/no-results/error variants)
- [x] `/playground/shared` 테스트 페이지

**Acceptance Criteria**:

- ✅ Playground에서 각 컴포넌트 독립 테스트 가능

---

## Phase 3: Enhanced Features

### TASK-013: 대시보드 페이지 ✅

**Priority**: P2  
**Estimate**: 4h  
**Dependencies**: TASK-006

**Description**:
대시보드 위젯 컴포넌트들을 구현합니다.

**Subtasks**:

- [x] `StatCard` 컴포넌트 (통계 카드, 트렌드 표시)
- [x] `StatCardGrid` 컴포넌트 (2/3/4 컬럼 그리드)
- [x] `RecentDocuments` 위젯 (최근 문서 목록, 타입 뱃지)
- [x] `QuickActions` 빠른 액션 버튼
- [x] `QuickActionGrid` 카드형 액션 그리드
- [x] `/playground/dashboard` 테스트 페이지

**Acceptance Criteria**:

- ✅ 대시보드에 통계와 최근 활동 표시
- ✅ 빠른 액션으로 작업 시작 가능

---

### TASK-014: 통합 검색 ✅

**Priority**: P2  
**Estimate**: 4h  
**Dependencies**: TASK-006

**Description**:
글로벌 검색 기능을 구현합니다.

**Subtasks**:

- [x] `GlobalSearch` 컴포넌트 (Command Palette 스타일)
- [x] ⌘K 단축키 지원
- [x] 최근 검색어, 추천 검색어, 바로가기 링크
- [x] `HeaderSearchBar` 헤더용 검색 바
- [x] `SearchResults` 검색 결과 목록
- [x] 타입별 필터 (document, concept, page, tag)
- [x] 검색어 하이라이팅
- [x] `/playground/search` 테스트 페이지

**Acceptance Criteria**:

- ✅ 키워드 입력 시 실시간 제안 표시
- ✅ 검색 결과 페이지에서 필터 적용 가능

---

### TASK-015: 그래프 시각화 (Neo4j NVL)

**Priority**: P2  
**Estimate**: 6h  
**Dependencies**: TASK-006

**Description**:
Neo4j NVL(Network Visualization Library)을 사용하여 문서/용어 관계 그래프 시각화를 구현합니다.

**Tech Stack**:
- `@neo4j-nvl/react` - React wrapper for NVL
- 참고 문서:
  - [NVL Documentation](https://neo4j.com/docs/nvl/current/)
  - [NVL API Reference](https://neo4j.com/docs/api/nvl/current/)
  - [NVL React Examples](https://neo4j.com/docs/api/nvl/current/examples.html)

**Subtasks**:

- [ ] `@neo4j-nvl/react` 패키지 설치
- [ ] `GraphView` 컴포넌트 생성 (`components/graph/graph-view.tsx`)
  - NVL InteractiveNvlWrapper 사용
  - 노드 데이터 변환 (Document, Concept, Page → NVL Node)
  - 관계 데이터 변환 (USES_CONCEPT, LINKS_TO 등 → NVL Relationship)
- [ ] 노드 스타일링 (타입별 색상/아이콘)
  - Document: 파란색
  - Concept: 보라색
  - Page: 초록색
  - Tag: 주황색
- [ ] 엣지 스타일링 (관계 타입별)
  - USES_CONCEPT: 점선
  - LINKS_TO: 실선
  - CHILD_OF: 화살표
- [ ] `GraphNodeDetail` 컴포넌트 (노드 클릭 시 상세 정보 패널)
- [ ] `GraphFilter` 컴포넌트 (노드 타입 필터)
- [ ] NVL 내장 기능 활용:
  - 줌/팬 컨트롤
  - Minimap
  - 레이아웃 알고리즘 (force-directed, hierarchical)
- [ ] `/playground/graph-view` 테스트 페이지

**Acceptance Criteria**:

- NVL로 그래프가 렌더링됨
- 노드 클릭 시 상세 정보 패널 표시
- 노드 타입 필터 적용 시 그래프 갱신
- 줌/팬 컨트롤 동작

---

## Phase 4: Polish

### TASK-016: 에러 핸들링

**Priority**: P1  
**Estimate**: 3h  
**Dependencies**: TASK-003

**Description**:
글로벌 에러 핸들링을 구현합니다.

**Subtasks**:

- [ ] Error Boundary 컴포넌트
- [ ] 404 페이지 (app/not-found.tsx)
- [ ] 500 페이지 (app/error.tsx)
- [ ] Toast 알림 시스템 (sonner 또는 react-hot-toast)
- [ ] API 에러 → Toast 자동 표시

**Acceptance Criteria**:

- 존재하지 않는 페이지에서 404 표시
- API 에러 시 Toast 알림 표시
- 예기치 않은 에러 시 Error Boundary 동작

---

### TASK-017: 로딩 상태

**Priority**: P1  
**Estimate**: 2h  
**Dependencies**: TASK-006

**Description**:
로딩 상태 UI를 구현합니다.

**Subtasks**:

- [ ] Skeleton 컴포넌트 생성
- [ ] 테이블 로딩 Skeleton
- [ ] 카드 로딩 Skeleton
- [ ] 페이지별 loading.tsx 파일
- [ ] Suspense 바운더리 설정

**Acceptance Criteria**:

- 데이터 로딩 중 Skeleton 표시
- 페이지 전환 시 로딩 상태 표시

---

### TASK-018: 테스트 작성

**Priority**: P2  
**Estimate**: 6h  
**Dependencies**: All features

**Description**:
테스트를 작성합니다.

**Subtasks**:

- [ ] Vitest 설정
- [ ] React Testing Library 설정
- [ ] 핵심 컴포넌트 단위 테스트
- [ ] 핵심 훅 단위 테스트
- [ ] Playwright E2E 설정
- [ ] 로그인 플로우 E2E 테스트
- [ ] 문서 CRUD E2E 테스트

**Acceptance Criteria**:

- 테스트 커버리지 80% 이상
- CI에서 테스트 통과

---

### TASK-019: 문서 Import 기능

**Priority**: P2  
**Estimate**: 3h  
**Dependencies**: TASK-008

**Description**:
파일 업로드로 문서를 가져오는 기능을 구현합니다.

**Subtasks**:

- [ ] 파일 업로드 컴포넌트
- [ ] 드래그 앤 드롭 지원
- [ ] .md, .yaml 파일 검증
- [ ] Import API 연동 (multipart/form-data)
- [ ] 업로드 진행률 표시
- [ ] 성공/실패 알림

**Acceptance Criteria**:

- Markdown 파일 업로드 후 문서 생성
- 잘못된 파일 형식 시 에러 표시

---

### TASK-020: 최적화

**Priority**: P2  
**Estimate**: 3h  
**Dependencies**: All features

**Description**:
성능 최적화를 수행합니다.

**Subtasks**:

- [ ] 이미지 최적화 (next/image)
- [ ] 코드 스플리팅 확인
- [ ] 번들 크기 분석 및 최적화
- [ ] SEO 메타데이터 (메타 태그)
- [ ] Lighthouse 점수 확인 및 개선
- [ ] Web Vitals 모니터링 설정

**Acceptance Criteria**:

- Lighthouse Performance 점수 90+
- LCP 2.5초 이내

---

## Task Summary

| Task ID  | Task Name                      | Priority | Estimate | Status |
| -------- | ------------------------------ | -------- | -------- | ------ |
| TASK-001 | Next.js 프로젝트 초기 설정     | P0       | 2h       | ✅     |
| TASK-002 | Tailwind CSS 및 shadcn/ui 설정 | P0       | 2h       | ✅     |
| TASK-003 | Component Playground 설정      | P0       | 2h       | ✅     |
| TASK-004 | API 클라이언트 및 Mock 데이터  | P0       | 3h       | ✅     |
| TASK-005 | BlockNote 블록 기반 에디터     | P0       | 6h       | ✅     |
| TASK-006 | MarkdownViewer 컴포넌트        | P0       | 2h       | ✅     |
| TASK-007 | DataTable 컴포넌트             | P1       | 4h       | ✅     |
| TASK-008 | DocumentForm 컴포넌트          | P1       | 3h       | ✅     |
| TASK-009 | ConceptForm 및 ImpactAnalysis  | P1       | 3h       | ✅     |
| TASK-010 | VersionForm 및 VersionCard     | P1       | 2h       | ✅     |
| TASK-011 | PageTree 컴포넌트              | P1       | 4h       | ⬜     |
| TASK-012 | 공통 컴포넌트 (Shared)         | P1       | 3h       | ⬜     |
| TASK-013 | Dashboard 위젯 컴포넌트        | P2       | 4h       | ⬜     |
| TASK-014 | Search 컴포넌트                | P2       | 4h       | ⬜     |
| TASK-015 | GraphView 컴포넌트             | P2       | 6h       | ⬜     |
| TASK-016 | 에러 핸들링                    | P1       | 3h       | ⬜     |
| TASK-017 | 로딩 상태                      | P1       | 2h       | ⬜     |
| TASK-018 | 테스트 작성                    | P2       | 6h       | ⬜     |
| TASK-019 | 문서 Import 기능               | P2       | 3h       | ⬜     |
| TASK-020 | 최적화                         | P2       | 3h       | ⬜     |
| TASK-021 | 페이지 통합 (UI 확정 후)       | P2       | 8h       | ⬜     |
| TASK-022 | 레이아웃 구현 (UI 확정 후)     | P2       | 4h       | ⬜     |
| TASK-023 | 인증 시스템 (추후 추가)        | P3       | 6h       | ⬜     |

**Total Estimate**: ~74h

### Priority Legend

- **P0**: 프로젝트 셋업, 핵심 컴포넌트 (먼저 완료)
- **P1**: 주요 컴포넌트 (Playground에서 테스트)
- **P2**: 고급 기능, 페이지 통합 (UI 확정 후)
- **P3**: 추후 추가 기능
