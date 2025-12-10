# Tasks: Frontend UI & Design System

## Task Overview

Frontend 디자인 시스템 구축을 위한 작업 목록입니다.

---

## Phase 1: 디자인 토큰 체계화

### TASK-001: 색상 토큰 확장 ✅

**Status**: ✅ 완료
**Priority**: P0
**Completed**: 2025-12-10

**Description**: 기존 globals.css의 색상 토큰을 확장하고 체계화

**Subtasks**:

- [x] 기존 색상 토큰 검토 및 정리
- [x] 인터랙션 상태 색상 추가 (hover, active, focus)
- [x] 컴포넌트별 특화 색상 정의 (surface, text hierarchy)
- [x] 하드코딩된 색상값 조사 및 토큰화 (node types, status colors)

**Changes**:

- `globals.css` 확장: surface colors, text hierarchy, node type colors, status colors
- Light/Dark 모드 모두 완전한 토큰 지원

---

### TASK-002: 타이포그래피 토큰 정의 ✅

**Status**: ✅ 완료
**Priority**: P0
**Completed**: 2025-12-10

**Description**: 폰트 사이즈, 라인 높이, 폰트 웨이트 토큰화

**Subtasks**:

- [x] 타이포그래피 스케일 정의 (2xs~3xl)
- [x] 라인 높이 토큰 정의 (tight, normal, relaxed)
- [x] Tailwind 커스텀 유틸리티 생성 (.text-2xs, .text-label, .text-caption)

**Changes**:

- `@theme inline`에 font-size scale 추가 (10px~24px)
- line-height 변수 추가

---

### TASK-003: 스페이싱/레이아웃 토큰 ✅

**Status**: ✅ 완료
**Priority**: P0
**Completed**: 2025-12-10

**Description**: 고정 픽셀값을 CSS 변수로 전환

**Subtasks**:

- [x] 레이아웃 토큰 정의 (header-height, sidebar-width, panel-width, filter-width)
- [x] 스페이싱 스케일 확장 (0~10)
- [x] 레이아웃 유틸리티 클래스 생성 (.h-header, .w-sidebar 등)

**Changes**:

- Layout dimensions 변수 추가
- Tailwind 유틸리티 클래스 생성

---

## Phase 2: 기초 UI 컴포넌트 정비

### TASK-004: shadcn/ui 컴포넌트 커스터마이징 ✅

**Status**: ✅ 완료
**Priority**: P1
**Completed**: 2025-12-10

**Description**: Button, Badge, Input 등 NALLO 스타일 variant 추가

**Subtasks**:

- [x] Button - brand, brand-outline, brand-ghost, header-action variants 추가
- [x] Button - xs, icon-xs sizes 추가
- [x] Badge - status variants (draft, in-review, done, publish)
- [x] Badge - node type variants (page, document, concept, tag)

**Changes**:

- `button.tsx` 확장
- `badge.tsx` 확장

---

### TASK-005: 공통 컴포넌트 추출 ✅

**Status**: ✅ 완료
**Priority**: P1
**Completed**: 2025-12-10

**Description**: 반복 패턴을 재사용 가능한 컴포넌트로 분리

**Subtasks**:

- [x] IconButton 컴포넌트 생성 (tooltip 지원)
- [x] NavItem 컴포넌트 생성 (active indicator 지원)
- [x] StatusBadge 컴포넌트 생성 (타입 안전)
- [x] NodeTypeBadge 컴포넌트 생성

**New Files**:

- `src/components/ui/icon-button.tsx`
- `src/components/ui/nav-item.tsx`
- `src/components/ui/status-badge.tsx`

---

## Phase 3: 레이아웃 컴포넌트 리팩토링

### TASK-006: GlobalHeader 리팩토링 ✅

**Status**: ✅ 완료
**Priority**: P1
**Completed**: 2025-12-10

**Description**: 하드코딩된 색상 제거, 디자인 토큰 적용

**Subtasks**:

- [x] 하드코딩된 색상값 (#ececec, #594b45 등) 제거
- [x] CSS 변수 기반 색상 적용
- [x] HeaderActionButton 서브컴포넌트 추출
- [x] Props 인터페이스 확장 (projectName, onProjectSelect)

**Changes**:

- `global-header.tsx` 완전 리팩토링

---

### TASK-007: Sidebar 리팩토링 ✅

**Status**: ✅ 완료
**Priority**: P1
**Completed**: 2025-12-10

**Description**: Mock 데이터 분리, 토큰 적용

**Subtasks**:

- [x] Mock 데이터 `lib/mocks/sidebar.ts`로 분리
- [x] Props 인터페이스 정비 (콜백 함수들 추가)
- [x] NavItem, IconButton 컴포넌트 활용
- [x] 디자인 토큰 적용

**New Files**:

- `src/lib/mocks/sidebar.ts`

**Changes**:

- `sidebar.tsx` 완전 리팩토링

---

### TASK-007b: FunctionHeader & AppLayout 리팩토링 ✅

**Status**: ✅ 완료
**Priority**: P1
**Completed**: 2025-12-10

**Description**: 하드코딩된 색상 제거, 설정 가능한 Props 추가

**Subtasks**:

- [x] FunctionHeader - variant prop 추가 (light/dark)
- [x] FunctionHeader - tabs prop 추가 (커스텀 탭 지원)
- [x] AppLayout - showSidebarForTabs, darkModeForTabs props 추가
- [x] 하드코딩된 색상값 제거

**Changes**:

- `function-header.tsx` 리팩토링
- `app-layout.tsx` 리팩토링

---

## Phase 4: 기능별 컴포넌트 정리

### TASK-008: DocumentList 리팩토링 ✅

**Status**: ✅ 완료
**Priority**: P2
**Completed**: 2025-12-10

**Description**: 데이터/UI 분리, 디자인 토큰 적용

**Subtasks**:

- [x] Mock 데이터 `lib/mocks/documents.ts`로 분리
- [x] statusStyles를 StatusBadge 컴포넌트로 대체
- [x] Props 인터페이스 정비 (documents, 콜백 함수들)
- [x] DocumentRow 서브컴포넌트 추출
- [x] Button variant="brand" 사용

**New Files**:

- `src/lib/mocks/documents.ts`

**Changes**:

- `document-list.tsx` 완전 리팩토링

---

### TASK-009: Graph 컴포넌트 정리 ✅

**Status**: ✅ 완료
**Priority**: P2
**Completed**: 2025-12-10

**Description**: Graph 관련 컴포넌트 디자인 시스템 적용

**Subtasks**:

- [x] `types.ts` - 색상 상수 정리, CSS 변수 지원 추가
- [x] `graph-filter.tsx` - 하드코딩된 색상 토큰으로 교체
- [x] `graph-node-detail.tsx` - StatusBadge, IconButton 활용
- [x] `graph-view.tsx` - IconButton, 디자인 토큰 적용
- [x] NodeTypeButton 서브컴포넌트 추출

**Changes**:

- `types.ts` 확장 (NODE_COLORS_STATIC, TAG_COLOR_PALETTE, DEFAULT_TAG_COLORS)
- `graph-filter.tsx` 완전 리팩토링
- `graph-node-detail.tsx` 완전 리팩토링
- `graph-view.tsx` 완전 리팩토링

---

### TASK-010: GlossaryList 리팩토링 ✅

**Status**: ✅ 완료
**Priority**: P2
**Completed**: 2025-12-10

**Description**: GlossaryList 데이터/UI 분리, 디자인 토큰 적용

**Subtasks**:

- [x] Mock 데이터 `lib/mocks/glossary.ts`로 분리
- [x] Badge variant 활용
- [x] TermListItem, TermGridItem 서브컴포넌트 추출
- [x] Button variant="brand" 사용

**New Files**:

- `src/lib/mocks/glossary.ts`

**Changes**:

- `glossary-list.tsx` 완전 리팩토링

---

### TASK-011a: DocumentEditor 리팩토링 ✅

**Status**: ✅ 완료
**Priority**: P2
**Completed**: 2025-12-10

**Description**: DocumentEditor 데이터/UI 분리, 디자인 토큰 적용

**Subtasks**:

- [x] Mock 데이터 `lib/mocks/editor.ts`로 분리
- [x] 서브컴포넌트 추출 (ViewModeToggle, TagChip, LinkedTermChip, etc.)
- [x] IconButton, Button variant="brand" 활용
- [x] bg-white → bg-card 토큰 교체
- [x] Props 인터페이스 확장 (onSave 콜백)

**New Files**:

- `src/lib/mocks/editor.ts`

**Changes**:

- `document-editor.tsx` 완전 리팩토링

---

## Phase 5: 라우팅 구조 설정

### TASK-011b: App Router 라우팅 설정 ✅

**Status**: ✅ 완료
**Priority**: P1
**Completed**: 2025-12-10

**Description**: Next.js App Router를 활용한 탭 + URL 하이브리드 라우팅 구현

**Subtasks**:

- [x] `(main)/layout.tsx` 공통 레이아웃 생성
- [x] 문서 탭 라우트 설정 (`/documents`, `/documents/list`, `/documents/[id]`, `/documents/new`)
- [x] 용어집 탭 라우트 설정 (`/glossary`)
- [x] 배포 탭 라우트 설정 (`/deploy`)
- [x] 그래프 탭 라우트 설정 (`/graph`)
- [x] AppLayout에서 URL 기반 탭 동기화
- [x] 루트 페이지 → `/documents` 리다이렉트

**New Files**:

- `src/app/(main)/layout.tsx`
- `src/app/(main)/documents/page.tsx`
- `src/app/(main)/documents/list/page.tsx`
- `src/app/(main)/documents/[id]/page.tsx`
- `src/app/(main)/documents/new/page.tsx`
- `src/app/(main)/glossary/page.tsx`
- `src/app/(main)/deploy/page.tsx`
- `src/app/(main)/graph/page.tsx`

**Changes**:

- `app-layout.tsx` - URL 기반 탭 동기화 추가
- `app/page.tsx` - 리다이렉트 설정

---

### TASK-012: Dashboard 리팩토링 ✅

**Status**: ✅ 완료
**Priority**: P2
**Completed**: 2025-12-10

**Description**: Dashboard 컴포넌트 데이터/UI 분리, 디자인 토큰 적용

**Subtasks**:

- [x] Mock 데이터 `lib/mocks/dashboard.ts`로 분리
- [x] statusColors를 StatusBadge 컴포넌트로 대체
- [x] metricColors를 CSS 변수로 전환
- [x] OntologyInsightsCard 서브컴포넌트 추출
- [x] Button variant="brand" 사용
- [x] SVG stroke에 CSS 클래스 적용

**New Files**:

- `src/lib/mocks/dashboard.ts`

**Changes**:

- `dashboard/index.tsx` 완전 리팩토링

---

### TASK-013: CategoryBadge 컴포넌트 생성 ✅

**Status**: ✅ 완료
**Priority**: P2
**Completed**: 2025-12-10

**Description**: 용어집 카테고리 표시용 뱃지 컴포넌트

**Subtasks**:

- [x] CategoryBadge 컴포넌트 생성
- [x] CSS 변수 기반 카테고리 색상 적용
- [x] GlossaryList에서 활용

**New Files**:

- `src/components/ui/category-badge.tsx`

---

### TASK-014: 페이지-컴포넌트 맵 문서화 ✅

**Status**: ✅ 완료
**Priority**: P1
**Completed**: 2025-12-10

**Description**: 프론트엔드 페이지 구조 문서화

**Subtasks**:

- [x] URL 구조 정의
- [x] 레이아웃 구조 문서화
- [x] 페이지별 컴포넌트 매핑
- [x] Mock 데이터 의존성 정리

**New Files**:

- `specs/004-frontend-ui/pages.md`

---

## Task Summary

| Task      | Description                         | Status | Priority |
| --------- | ----------------------------------- | ------ | -------- |
| TASK-001  | 색상 토큰 확장                      | ✅     | P0       |
| TASK-002  | 타이포그래피 토큰 정의              | ✅     | P0       |
| TASK-003  | 스페이싱/레이아웃 토큰              | ✅     | P0       |
| TASK-004  | shadcn/ui 컴포넌트 커스터마이징     | ✅     | P1       |
| TASK-005  | 공통 컴포넌트 추출                  | ✅     | P1       |
| TASK-006  | GlobalHeader 리팩토링               | ✅     | P1       |
| TASK-007  | Sidebar 리팩토링                    | ✅     | P1       |
| TASK-007b | FunctionHeader & AppLayout 리팩토링 | ✅     | P1       |
| TASK-008  | DocumentList 리팩토링               | ✅     | P2       |
| TASK-009  | Graph 컴포넌트 정리                 | ✅     | P2       |
| TASK-010  | GlossaryList 리팩토링               | ✅     | P2       |
| TASK-011  | DocumentEditor 리팩토링             | ✅     | P2       |
| TASK-011  | App Router 라우팅 설정              | ✅     | P1       |
| TASK-012  | Dashboard 리팩토링                  | ✅     | P2       |
| TASK-013  | CategoryBadge 컴포넌트 생성         | ✅     | P2       |
| TASK-014  | 페이지-컴포넌트 맵 문서화           | ✅     | P1       |
