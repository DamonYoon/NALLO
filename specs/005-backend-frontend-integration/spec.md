# Feature Specification: Backend-Frontend Integration

**Feature Branch**: `005-backend-frontend-integration`  
**Created**: 2025-12-10  
**Status**: Draft  
**Depends On**: `001-backend-api-foundation`, `002-admin-frontend-foundation`, `004-frontend-ui`  
**Input**: User description: "backend와 frontend를 integration 하려고 해요"

---

## Overview

Backend REST API와 Frontend Mock 데이터를 연동하여 실제 동작하는 애플리케이션을 완성합니다. 이 과정에서 Graph 시각화를 위한 새로운 API를 개발하고, 개발/테스트를 위한 Seed 데이터 생성 기능을 구현합니다.

### 목표

1. Frontend Mock 데이터를 Backend API 호출로 전환
2. Graph 시각화를 위한 Backend API 신규 개발
3. GraphDB Seed 데이터 생성 스크립트 구현
4. E2E 테스트 가능한 통합 환경 구축

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Graph 데이터 조회 (Priority: P1)

관리자가 지식 그래프 페이지에서 전체 노드(문서, 용어, 태그, 페이지)와 관계를 시각화하여 볼 수 있습니다. 데이터는 GraphDB에서 직접 조회됩니다.

**Why this priority**: Graph 시각화는 NALLO의 핵심 차별화 기능이며, 현재 Backend에 전용 API가 없어 가장 먼저 개발이 필요합니다.

**Independent Test**: Graph 페이지 접근 → 실제 GraphDB 데이터 기반 노드/엣지 렌더링 확인 → 노드 클릭 시 상세 정보 표시

**Acceptance Scenarios**:

1. **Given** GraphDB에 노드가 존재할 때, **When** 관리자가 Graph 페이지에 접근, **Then** 모든 노드와 관계가 시각화됨
2. **Given** Graph API 호출 시, **When** 노드 타입 필터를 적용, **Then** 해당 타입의 노드와 연결된 엣지만 반환됨
3. **Given** Graph API 호출 시, **When** 특정 노드 ID로 조회, **Then** 해당 노드와 1-hop 연결된 노드/엣지가 반환됨

---

### User Story 2 - Seed 데이터 생성 (Priority: P1)

개발자가 명령어 하나로 GraphDB에 테스트용 Dummy 데이터를 생성하여 API와 UI를 검증할 수 있습니다.

**Why this priority**: 통합 테스트를 위해서는 실제 데이터가 필요합니다. Seed 스크립트가 없으면 매번 수동으로 데이터를 입력해야 합니다.

**Independent Test**: `npm run seed` 명령어 실행 → GraphDB에 문서, 용어, 태그, 페이지, 버전 노드 및 관계 생성 확인

**Acceptance Scenarios**:

1. **Given** 빈 GraphDB, **When** seed 스크립트 실행, **Then** 최소 10개의 문서, 8개의 용어, 6개의 태그, 5개의 페이지, 1개의 버전이 생성됨
2. **Given** seed 스크립트 실행 시, **When** 노드 생성 완료, **Then** USES_CONCEPT, LINKS_TO, HAS_TAG, IN_VERSION, DISPLAYS 관계가 자동 생성됨
3. **Given** 이미 데이터가 있는 GraphDB, **When** seed 스크립트 재실행, **Then** 기존 데이터를 초기화하고 새로 생성 (--reset 옵션)

---

### User Story 3 - 문서 목록 API 연동 (Priority: P1)

관리자가 문서 목록 페이지에서 실제 Backend API에서 조회한 문서 목록을 확인할 수 있습니다.

**Why this priority**: 문서 관리는 가장 기본적인 CRUD 기능이며, API 연동의 첫 단계입니다.

**Independent Test**: 문서 목록 페이지 접근 → Backend API에서 조회한 실제 문서 목록 표시 확인

**Acceptance Scenarios**:

1. **Given** Backend에 문서가 존재할 때, **When** 문서 목록 페이지 접근, **Then** 실제 문서 데이터가 표시됨
2. **Given** 문서 목록 로딩 중, **When** API 응답 대기, **Then** 로딩 스켈레톤이 표시됨
3. **Given** API 오류 발생 시, **When** 문서 목록 조회 실패, **Then** 사용자에게 오류 메시지가 표시됨

---

### User Story 4 - 용어집 목록 API 연동 (Priority: P2)

관리자가 용어집 페이지에서 실제 Backend API에서 조회한 용어 목록을 확인할 수 있습니다.

**Why this priority**: 용어집 관리는 핵심 기능이지만, 문서 연동 패턴을 먼저 확립한 후 동일 패턴을 적용합니다.

**Independent Test**: 용어집 페이지 접근 → Backend API에서 조회한 실제 용어 목록 표시 확인

**Acceptance Scenarios**:

1. **Given** Backend에 용어가 존재할 때, **When** 용어집 페이지 접근, **Then** 실제 용어 데이터가 표시됨
2. **Given** 용어 클릭 시, **When** 상세 정보 요청, **Then** 해당 용어를 사용하는 문서 수가 함께 표시됨

---

### User Story 5 - API 클라이언트 인프라 구축 (Priority: P0)

개발자가 일관된 패턴으로 Backend API를 호출할 수 있는 클라이언트 인프라를 사용할 수 있습니다.

**Why this priority**: 모든 API 연동의 기반이 되는 인프라로, 가장 먼저 구축되어야 합니다.

**Independent Test**: API 클라이언트로 Health Check 호출 → 응답 수신 확인

**Acceptance Scenarios**:

1. **Given** Frontend 애플리케이션, **When** API 클라이언트 import, **Then** 타입 안전한 API 호출이 가능함
2. **Given** API 호출 시, **When** 인증 토큰이 필요한 엔드포인트 호출, **Then** 자동으로 Authorization 헤더가 추가됨
3. **Given** API 오류 발생 시, **When** 에러 응답 수신, **Then** 일관된 에러 형식으로 파싱됨

---

### Edge Cases

- GraphDB 연결 실패 시 Graph API 응답 처리
- 대량 노드(1000개+) 조회 시 페이지네이션 또는 가상화 처리
- Seed 스크립트 실행 중 중단 시 롤백 처리
- API 타임아웃 시 재시도 로직
- 동시 다발적 API 호출 시 요청 제한 처리

---

## Requirements _(mandatory)_

### Functional Requirements

#### Backend - Graph API

- **FR-001**: 시스템은 전체 그래프 노드 목록을 반환하는 API를 제공해야 함 (`GET /api/v1/graph/nodes`)
- **FR-002**: 시스템은 전체 그래프 엣지 목록을 반환하는 API를 제공해야 함 (`GET /api/v1/graph/edges`)
- **FR-003**: 시스템은 노드 타입별 필터링을 지원해야 함 (document, concept, tag, page)
- **FR-004**: 시스템은 특정 노드의 1-hop 이웃 노드/엣지를 반환하는 API를 제공해야 함
- **FR-005**: 시스템은 그래프 통계(노드 수, 엣지 수, 타입별 분포)를 반환하는 API를 제공해야 함

#### Backend - Seed Data

- **FR-006**: 시스템은 CLI 명령어로 GraphDB에 테스트 데이터를 생성할 수 있어야 함
- **FR-007**: Seed 스크립트는 문서, 용어, 태그, 페이지, 버전 노드를 생성해야 함
- **FR-008**: Seed 스크립트는 노드 간 관계(USES_CONCEPT, LINKS_TO, HAS_TAG, IN_VERSION, DISPLAYS)를 생성해야 함
- **FR-009**: Seed 스크립트는 기존 데이터 초기화 옵션(--reset)을 지원해야 함
- **FR-010**: Seed 데이터는 Frontend Mock 데이터와 유사한 구조여야 함 (테스트 일관성)

#### Frontend - API 클라이언트

- **FR-011**: Frontend는 중앙화된 API 클라이언트를 제공해야 함
- **FR-012**: API 클라이언트는 환경변수 기반 Base URL을 사용해야 함
- **FR-013**: API 클라이언트는 요청/응답 인터셉터를 지원해야 함
- **FR-014**: API 클라이언트는 OpenAPI 스키마 기반 타입을 사용해야 함

#### Frontend - 데이터 연동

- **FR-015**: 문서 목록 컴포넌트는 Backend API를 호출해야 함
- **FR-016**: 용어집 목록 컴포넌트는 Backend API를 호출해야 함
- **FR-017**: Graph 뷰 컴포넌트는 Graph API를 호출해야 함
- **FR-018**: 모든 API 호출에 로딩/에러 상태를 표시해야 함

### Key Entities

- **GraphNode**: id, type (document|concept|tag|page), label, properties, position (optional)
- **GraphEdge**: id, source, target, type (USES_CONCEPT|LINKS_TO|HAS_TAG|etc), label
- **GraphResponse**: nodes[], edges[], stats (nodeCount, edgeCount, typeDistribution)

---

## Success Criteria _(mandatory)_

### Performance Criteria (Constitution Principle IV)

- **SC-PERF-001**: Graph API는 1000개 노드 기준 500ms 이내 응답
- **SC-PERF-002**: Seed 스크립트는 50개 노드 + 관계 생성에 10초 이내 완료
- **SC-PERF-003**: Frontend API 호출 후 UI 업데이트 500ms 이내
- **SC-PERF-004**: 문서/용어집 목록 API 응답 200ms 이내 (p95)

### User Experience Criteria (Constitution Principle III)

- **SC-UX-001**: 모든 API 호출에 로딩 인디케이터 표시
- **SC-UX-002**: API 오류 시 사용자 친화적 메시지 표시
- **SC-UX-003**: 네트워크 재시도 시 진행 상태 표시
- **SC-UX-004**: Graph 데이터 로딩 시 스켈레톤 또는 프로그레스 표시

### Architecture Criteria (Constitution Principles V, VI, VII)

- **SC-ARCH-001**: API 클라이언트는 단일 모듈로 분리 (`lib/api/`)
- **SC-ARCH-002**: API Base URL은 환경변수로 설정 (`NEXT_PUBLIC_API_URL`)
- **SC-ARCH-003**: 모든 Mock 데이터 파일은 API 연동 후 개발 모드에서만 사용
- **SC-ARCH-004**: Graph API는 기존 라우트 패턴을 따름 (`/api/v1/graph`)
- **SC-ARCH-005**: Seed 스크립트는 `backend/scripts/` 디렉토리에 위치

### Functional Outcomes

- **SC-FUNC-001**: Graph 페이지에서 실제 GraphDB 데이터 시각화 가능
- **SC-FUNC-002**: `npm run seed` 명령어로 테스트 데이터 생성 가능
- **SC-FUNC-003**: 문서 목록 페이지에서 Backend 데이터 조회 가능
- **SC-FUNC-004**: 용어집 페이지에서 Backend 데이터 조회 가능
- **SC-FUNC-005**: Frontend와 Backend가 동일 타입 시스템 공유

---

## Tech Stack

### Backend (추가)

| Category      | Technology           | Note                  |
| ------------- | -------------------- | --------------------- |
| Graph API     | Express Router       | 기존 라우트 패턴 유지 |
| Seed Script   | TypeScript + ts-node | CLI 스크립트          |
| GraphDB Query | Neo4j Driver         | Cypher 쿼리           |

### Frontend (추가)

| Category         | Technology         | Note                 |
| ---------------- | ------------------ | -------------------- |
| HTTP Client      | ky                 | 가볍고 타입 안전     |
| State Management | TanStack Query v5  | 서버 상태 관리       |
| Type Generation  | openapi-typescript | OpenAPI → TypeScript |

---

## Out of Scope

- 인증/인가 API 연동 (별도 feature로 분리)
- 실시간 동기화 (WebSocket)
- 오프라인 캐싱
- 문서 CRUD 연동 (목록 조회만 Phase 1)

---

## Implementation Phases

### Phase 1: Infrastructure & Graph API (이번 작업)

1. Backend Graph API 개발
2. Seed 데이터 스크립트 구현
3. Frontend API 클라이언트 설정

### Phase 2: Core CRUD Integration

1. 문서 목록 API 연동
2. 용어집 목록 API 연동
3. Graph 뷰 API 연동

### Phase 3: Full Integration

1. 문서 상세/편집 API 연동
2. 용어집 상세/편집 API 연동
3. 사이드바 네비게이션 API 연동
