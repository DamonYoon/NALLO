# Tasks: Backend-Frontend Integration

**Feature Branch**: `005-backend-frontend-integration`  
**Last Updated**: 2025-12-10

---

## Task Summary

| Phase | Task | Status | Priority |
|-------|------|--------|----------|
| 1 | Backend Graph API 개발 | ✅ Done | P1 |
| 1 | GraphDB Seed 데이터 스크립트 | ✅ Done | P1 |
| 1 | Frontend API 클라이언트 설정 | ✅ Done | P0 |
| 2 | 문서 목록 API 연동 | ✅ Done | P1 |
| 2 | 용어집 목록 API 연동 | ✅ Done | P2 |
| 2 | Graph 뷰 API 연동 | ✅ Done | P2 |

---

## Phase 1: Infrastructure & Graph API

### Task 1.1: Backend Graph API 개발

**Status**: ✅ Done  
**Priority**: P1  
**Completed**: 2025-12-10

#### Subtasks

- [x] Graph API 라우터 생성 (`/api/v1/graph`)
- [x] GraphDB 쿼리 함수 구현 (nodes, edges 조회)
- [x] Graph Service 구현
- [x] API 스키마 정의 (Zod)
- [x] 노드 타입별 필터링 지원
- [x] 1-hop 이웃 조회 API
- [x] 그래프 통계 API

#### Files Created

- `src/api/schemas/graph.ts` - Zod 스키마
- `src/db/graphdb/graphQueries.ts` - Cypher 쿼리 함수
- `src/services/graphService.ts` - 비즈니스 로직
- `src/api/routes/graph.ts` - Express 라우터

#### API Endpoints

```
GET /api/v1/graph/nodes         - 전체 노드 조회
GET /api/v1/graph/nodes?type=document - 타입별 필터
GET /api/v1/graph/edges         - 전체 엣지 조회  
GET /api/v1/graph/nodes/:id/neighbors - 1-hop 이웃
GET /api/v1/graph/stats         - 통계
```

---

### Task 1.2: GraphDB Seed 데이터 스크립트

**Status**: ✅ Done  
**Priority**: P1  
**Completed**: 2025-12-10

#### Subtasks

- [x] Seed 스크립트 파일 생성 (`scripts/seed-graph.ts`)
- [x] 문서 노드 생성 (10개)
- [x] 용어(Concept) 노드 생성 (8개)
- [x] 태그 노드 생성 (6개)
- [x] 페이지 노드 생성 (5개)
- [x] 버전 노드 생성 (1개)
- [x] 관계 생성 (USES_CONCEPT, LINKS_TO, HAS_TAG, IN_VERSION, DISPLAYS, SUBTYPE_OF)
- [x] --reset 옵션 구현
- [x] npm script 추가 (`npm run seed`, `npm run seed:reset`)

#### Files Created

- `scripts/seed-graph.ts` - Seed 스크립트

#### Usage

```bash
cd backend
npm run seed          # 기존 데이터에 추가
npm run seed:reset    # 기존 데이터 삭제 후 새로 생성
```

#### Seed Data Structure

```typescript
// Documents (10개)
- API 인증 가이드, REST API 개요, 시작하기, Web3 통합 가이드...

// Concepts (8개)  
- API Key, Authentication, Token, Smart Contract, Endpoint...

// Tags (6개)
- API, Tutorial, Guide, Blockchain, Web3, General

// Pages (5개)
- Getting Started, API Reference, Tutorials, Concepts, FAQ

// Version (1개)
- v1.0.0 (main, public)
```

---

### Task 1.3: Frontend API 클라이언트 설정

**Status**: ✅ Done  
**Priority**: P0  
**Completed**: 2025-12-10

#### Subtasks

- [x] API 클라이언트 모듈 생성 (`lib/api/client.ts`)
- [x] 환경변수 설정 (`NEXT_PUBLIC_API_URL`)
- [x] 타입 정의 (`lib/api/types.ts`)
- [x] TanStack Query Provider 설정
- [x] 에러 핸들링 유틸리티
- [x] 인터셉터 설정 (auth, logging)
- [x] React Query hooks 생성

#### Files Created

- `src/lib/api/client.ts` - ky HTTP 클라이언트
- `src/lib/api/types.ts` - API 타입 정의
- `src/lib/api/endpoints.ts` - API 엔드포인트 함수
- `src/lib/api/hooks.ts` - React Query hooks
- `src/lib/api/index.ts` - 모듈 exports
- `src/lib/providers.tsx` - QueryClientProvider

#### Packages Installed

- `@tanstack/react-query`
- `@tanstack/react-query-devtools`
- `ky`

---

## Phase 2: Core Integration

### Task 2.1: 문서 목록 API 연동

**Status**: ✅ Done  
**Priority**: P1  
**Completed**: 2025-12-10

#### Subtasks

- [x] useDocuments hook 생성 (hooks.ts에 포함)
- [x] DocumentList 컴포넌트 수정
- [x] 로딩/에러 상태 처리 (Skeleton, Error 컴포넌트)
- [x] Mock 데이터 fallback (useMockData prop)

#### Changes

- `document-list.tsx`: API 연동 + Mock fallback 지원
- 타입 변환 함수 추가 (API ↔ Display)
- 로딩/에러 상태 UI 추가

#### Usage

```tsx
// API 사용 (기본)
<DocumentList />

// Mock 데이터 사용 (개발/테스트)
<DocumentList useMockData />
```

---

### Task 2.2: 용어집 목록 API 연동

**Status**: ✅ Done  
**Priority**: P2  
**Completed**: 2025-12-10

#### Subtasks

- [x] useConcepts hook 생성 (hooks.ts에 포함)
- [x] GlossaryList 컴포넌트 수정
- [x] 로딩/에러 상태 처리 (Skeleton, Error 컴포넌트)
- [x] Mock 데이터 fallback (useMockData prop)
- [ ] Impact Analysis 연동 (문서 수 표시) - TODO(005-GRAPH-RELATIONS)

#### Changes

- `glossary-list.tsx`: API 연동 + Mock fallback 지원
- 카테고리 자동 추론 함수 추가 (inferCategory)
- 타입 변환 함수 추가 (API ↔ Display)

#### Usage

```tsx
// API 사용 (기본)
<GlossaryList />

// Mock 데이터 사용 (개발/테스트)
<GlossaryList useMockData />
```

---

### Task 2.3: Graph 뷰 API 연동

**Status**: ✅ Done  
**Priority**: P2  
**Completed**: 2025-12-10

#### Subtasks

- [x] useGraphNodes, useGraphEdges, useGraphStats hooks 사용
- [x] GraphView 컴포넌트 수정
- [x] API 데이터 → 로컬 타입 변환 함수
- [x] 로딩/에러 상태 처리
- [x] Mock 데이터 fallback (useMockData prop)

#### Changes

- `graph-view.tsx`: API 연동 + Mock fallback 지원
- 노드/엣지 타입 변환 함수 추가
- 새로고침 버튼 추가

#### Usage

```tsx
// API 사용 (기본)
<GraphView />

// Mock 데이터 사용 (개발/테스트)
<GraphView useMockData />
```

---

## Unimplemented Features

| Feature | Reason | TODO Reference |
|---------|--------|----------------|
| 인증 API 연동 | 별도 feature로 분리 | TODO(005-AUTH) |
| WebSocket 실시간 동기화 | Phase 2 이후 | TODO(005-REALTIME) |
| 오프라인 캐싱 | Phase 3 이후 | TODO(005-OFFLINE) |

---

## Dependencies

- `001-backend-api-foundation`: Documents, Concepts, Tags API
- `002-admin-frontend-foundation`: Admin UI 컴포넌트
- `004-frontend-ui`: 디자인 시스템, Mock 데이터 구조

