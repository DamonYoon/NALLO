# Feature Specification: Admin Frontend

**Feature Branch**: `002-admin-frontend-foundation`  
**Created**: 2025-12-08  
**Status**: In Progress  
**Version**: 1.1.7  
**Last Updated**: 2025-12-09  
**Depends On**: `001-backend-api-foundation`  
**Input**: User description: "Admin frontend for document authors/publishers. Provides document management, glossary management, version/page management, and graph visualization. Uses Next.js 14+ with App Router, TypeScript, Tailwind CSS, and shadcn/ui components."

**Changes**:

- v1.1.7 (2025-12-09): 페이지 노드/엣지 추가(Mock), 페이지 노드 필터 토글 추가, showPages 기본 ON
- v1.1.6 (2025-12-09): 태그 선택 칩 폭을 전체로 사용하고 내부 정렬 개선, 긴 태그명은 말줄임 처리
- v1.1.5 (2025-12-09): 태그 검색어 입력 시에만 목록 노출, 선택 시 랜덤 색상 자동 부여 및 색상 버튼으로 수정 가능
- v1.1.4 (2025-12-09): 태그 필터 검색 결과에서 색상 선택 후 추가 가능하도록 UX 개선
- v1.1.3 (2025-12-09): GraphView 태그 필터 검색/선택 UX 추가 (검색 후 추가, 선택된 태그만 필터 버튼 표시)
- v1.1.2 (2025-12-09): GraphView에 태그 노드 및 doc-tag 관계 시각화 추가, 태그 클릭 시 필터 연동
- v1.1.1 (2025-12-09): ConceptForm에서 category 필드 제거 (관계형 카테고리화로 대체)
- v1.1.0 (2025-12-09): BlockNote 에디터로 Tech Stack 변경, 멘션 기능 User Story 추가
- v1.0.0 (2025-12-08): 최초 작성

## Overview

Admin Frontend는 문서 작성자/배포자(Admin)를 위한 관리 인터페이스입니다. 문서 생성, 편집, 용어집 관리, 버전/페이지 관리, 그래프 시각화 등의 핵심 기능을 제공합니다.

### Target Users

- **문서 작성자**: 기술 문서를 작성하고 편집하는 테크니컬 라이터, 개발자
- **배포자**: 문서를 검토하고 배포하는 관리자

### Key Differentiators

1. **용어집 기반 일괄 수정**: 용어 정의 변경 시 연결된 문서 자동 업데이트
2. **지식 그래프 시각화**: 문서 간 관계를 그래프로 시각화
3. **영향도 분석**: 수정 시 영향받는 문서 목록 표시

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Document Management (Priority: P1)

관리자가 문서를 생성, 조회, 편집할 수 있습니다. BlockNote 블록 기반 에디터를 통해 문서를 작성하고, Edit/View 모드 전환을 제공합니다.

**Why this priority**: 문서 관리는 시스템의 핵심 기능입니다. 다른 모든 기능이 문서 존재를 전제로 합니다.

**Independent Test**: 문서 목록 페이지에서 "새 문서" 버튼 클릭 → 에디터에서 제목, 타입, 본문 입력 → 저장 → 문서 목록에서 확인 → 문서 상세 페이지에서 내용 확인 및 편집 가능 여부 검증

**Acceptance Scenarios**:

1. **Given** 관리자가 로그인한 상태, **When** 문서 목록 페이지에 접근, **Then** 시스템이 모든 문서 목록을 상태/타입별 필터와 함께 표시
2. **Given** 문서 목록 페이지, **When** "새 문서" 버튼 클릭, **Then** 문서 에디터 페이지로 이동하고 빈 BlockNote 에디터가 표시됨
3. **Given** 문서 에디터, **When** 제목, 타입, 본문을 입력하고 저장, **Then** 문서가 생성되고 목록 페이지로 이동하며 새 문서가 "draft" 상태로 표시됨
4. **Given** 문서 상세 페이지, **When** "편집" 버튼 클릭, **Then** 에디터가 기존 내용을 로드하고 수정 가능한 상태가 됨
5. **Given** BlockNote 에디터, **When** `/` 입력, **Then** 슬래시 커맨드 메뉴가 표시되고 블록 타입 선택 가능
6. **Given** BlockNote 에디터, **When** `@` 입력 후 검색어 입력, **Then** Concept/Document 멘션 목록이 표시됨
7. **Given** 멘션 목록에서, **When** Concept 선택, **Then** 문서와 해당 Concept 간 USES_CONCEPT 관계가 생성됨
8. **Given** 멘션 목록에서, **When** Document 선택, **Then** 문서 간 LINKS_TO 관계가 생성됨
9. **Given** 멘션 검색 결과에 없는 항목, **When** "새 Concept/Document 생성" 선택, **Then** stub 노드가 생성되고 멘션이 삽입됨
10. **Given** BlockNote 에디터, **When** Edit/View 토글 클릭, **Then** 편집 모드와 읽기 전용 모드가 전환됨

---

### User Story 2 - Glossary (Concept) Management (Priority: P1)

관리자가 용어집(Concept)을 생성하고 관리할 수 있습니다. 용어 수정 시 영향받는 문서를 확인할 수 있습니다.

**Why this priority**: 용어집 기반 일괄 수정은 핵심 차별화 기능입니다.

**Independent Test**: 용어집 페이지에서 새 용어 생성 → 용어 상세 페이지에서 "사용 문서" 탭 클릭 → 해당 용어를 사용하는 문서 목록 확인

**Acceptance Scenarios**:

1. **Given** 용어집 페이지, **When** "새 용어" 버튼 클릭, **Then** 용어 생성 폼이 표시됨
2. **Given** 용어 생성 폼, **When** 용어명, 설명, 언어를 입력하고 저장, **Then** 용어가 생성되고 용어집 목록에 표시됨
3. **Given** 용어 상세 페이지, **When** "사용 문서" 탭 클릭, **Then** 해당 용어를 사용하는 모든 문서 목록이 표시됨 (영향도 분석)
4. **Given** 용어 편집 페이지, **When** 설명을 수정하고 저장, **Then** 수정 전 영향받는 문서 목록이 표시되고, 확인 후 저장됨

---

### User Story 3 - Version and Page Management (Priority: P1)

관리자가 문서 버전을 생성하고, 페이지를 구성하며, 페이지와 문서를 연결할 수 있습니다.

**Why this priority**: 버전/페이지 관리는 문서 배포 워크플로우의 핵심입니다.

**Independent Test**: 버전 생성 → 페이지 생성 → 페이지에 문서 연결 → 네비게이션 트리에서 구조 확인

**Acceptance Scenarios**:

1. **Given** 버전 관리 페이지, **When** "새 버전" 버튼 클릭, **Then** 버전 생성 폼이 표시됨
2. **Given** 버전 생성 폼, **When** 버전 식별자, 이름, 공개 여부를 입력하고 저장, **Then** 버전이 생성되고 목록에 표시됨
3. **Given** 버전 상세 페이지, **When** "새 페이지" 버튼 클릭, **Then** 페이지 생성 폼이 표시됨
4. **Given** 페이지 생성 폼, **When** slug, 제목, 부모 페이지를 입력하고 저장, **Then** 페이지가 생성되고 네비게이션 트리에 표시됨
5. **Given** 페이지 상세 페이지, **When** "문서 연결" 버튼 클릭, **Then** 문서 선택 모달이 표시되고 연결 가능

---

### User Story 4 - Graph Visualization (Priority: P2)

관리자가 문서 간 관계를 그래프로 시각화하여 볼 수 있습니다. 노드를 클릭하면 상세 정보가 표시됩니다.

**Why this priority**: 그래프 시각화는 핵심 차별화 기능이지만, 기본 CRUD 이후 구현 가능합니다.

**Independent Test**: 그래프 뷰 페이지 접근 → 노드 클릭 → 상세 패널 확인 → 필터 적용 → 그래프 변화 확인

**Acceptance Scenarios**:

1. **Given** 그래프 뷰 페이지, **When** 페이지 로드, **Then** 문서, 개념, 페이지 노드가 관계와 함께 그래프로 표시됨
2. **Given** 그래프 뷰, **When** 노드 클릭, **Then** 우측에 노드 상세 정보 패널이 표시됨
3. **Given** 그래프 뷰, **When** 노드 타입 필터 적용, **Then** 선택된 타입의 노드만 표시됨
4. **Given** 그래프 뷰, **When** 특정 문서 노드 더블 클릭, **Then** 해당 문서 상세 페이지로 이동

---

### User Story 5 - Search and Navigation (Priority: P2)

관리자가 문서, 용어, 페이지를 검색하고 네비게이션을 통해 탐색할 수 있습니다.

**Why this priority**: 검색은 효율적인 관리를 위해 중요하지만, 기본 CRUD 이후 구현 가능합니다.

**Independent Test**: 검색창에 키워드 입력 → 결과 목록 확인 → 결과 클릭하여 이동

**Acceptance Scenarios**:

1. **Given** 아무 페이지에서, **When** 검색창에 키워드 입력, **Then** 실시간으로 검색 결과 드롭다운이 표시됨
2. **Given** 검색 결과 페이지, **When** 필터(타입, 버전, 태그) 적용, **Then** 필터에 맞는 결과만 표시됨
3. **Given** 검색 결과, **When** 결과 항목 클릭, **Then** 해당 문서/용어/페이지 상세 페이지로 이동

---

### User Story 6 - Authentication and Dashboard (Priority: P1)

관리자가 로그인하고 대시보드에서 현황을 확인할 수 있습니다.

**Why this priority**: 인증은 보안을 위한 필수 기능입니다.

**Independent Test**: 로그인 페이지에서 로그인 → 대시보드 표시 → 로그아웃 → 보호된 페이지 접근 시 리다이렉트 확인

**Acceptance Scenarios**:

1. **Given** 로그인 페이지, **When** 유효한 자격 증명 입력, **Then** 대시보드로 리다이렉트되고 JWT 토큰이 저장됨
2. **Given** 대시보드, **When** 페이지 로드, **Then** 최근 문서, 통계, 빠른 액션이 표시됨
3. **Given** 로그인 상태, **When** 로그아웃 버튼 클릭, **Then** 토큰이 삭제되고 로그인 페이지로 이동
4. **Given** 비로그인 상태, **When** 보호된 페이지 접근 시도, **Then** 로그인 페이지로 리다이렉트됨

---

### Edge Cases

- 네트워크 오류 시 사용자에게 어떻게 알릴 것인가?
- 긴 문서(10MB 이상) 편집 시 성능 저하 처리
- 동시 편집 충돌 처리 (낙관적 잠금)
- JWT 토큰 만료 시 자동 갱신 또는 재로그인 유도
- 대용량 그래프(노드 1000개 이상) 렌더링 최적화
- 오프라인 상태에서의 임시 저장
- 브라우저 탭 간 인증 상태 동기화

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 시스템은 이메일/비밀번호 기반 로그인 기능을 제공해야 함
- **FR-002**: 시스템은 JWT 토큰 기반 인증 상태를 유지해야 함
- **FR-003**: 시스템은 문서 CRUD 인터페이스를 제공해야 함
- **FR-004**: 시스템은 BlockNote 블록 기반 WYSIWYG 에디터를 제공해야 함
- **FR-004a**: 에디터는 슬래시 커맨드(`/`)로 블록 생성을 지원해야 함
- **FR-004b**: 에디터는 멘션(`@`)으로 Concept/Document 연결을 지원해야 함
- **FR-004c**: 에디터는 Edit/View 모드 전환을 지원해야 함
- **FR-005**: 시스템은 문서 Import(마크다운, OAS) 기능을 제공해야 함
- **FR-006**: 시스템은 용어집 CRUD 인터페이스를 제공해야 함
- **FR-007**: 시스템은 용어 수정 시 영향받는 문서 목록을 표시해야 함
- **FR-008**: 시스템은 버전 CRUD 인터페이스를 제공해야 함
- **FR-009**: 시스템은 페이지 CRUD 및 계층 구조 관리 인터페이스를 제공해야 함
- **FR-010**: 시스템은 페이지-문서 연결 기능을 제공해야 함
- **FR-011**: 시스템은 문서/개념/페이지 관계를 그래프로 시각화해야 함
- **FR-012**: 시스템은 통합 검색 기능을 제공해야 함
- **FR-013**: 시스템은 대시보드에서 최근 활동과 통계를 표시해야 함
- **FR-014**: 시스템은 반응형 레이아웃을 제공해야 함 (데스크톱 우선)
- **FR-015**: 시스템은 사용자 친화적인 오류 메시지를 표시해야 함
- **FR-016**: 시스템은 로딩 상태를 명확히 표시해야 함

### Non-Functional Requirements

- **NFR-001**: 초기 페이지 로드 시간 3초 이내
- **NFR-002**: API 응답 후 UI 업데이트 500ms 이내
- **NFR-003**: 접근성 WCAG 2.1 AA 수준 준수
- **NFR-004**: 최신 Chrome, Firefox, Safari, Edge 지원
- **NFR-005**: 코드 커버리지 80% 이상

### Key Entities _(include if feature involves data)_

- **Document**: 문서 (id, type, status, title, lang, content, summary, created_at, updated_at)
- **Concept**: 용어 (id, term, description, category, lang, created_at, updated_at)
- **Version**: 버전 (id, version, name, description, is_public, is_main, created_at, updated_at)
- **Page**: 페이지 (id, slug, title, order, visible, created_at, updated_at)
- **User**: 사용자 (인증 정보)

---

## Success Criteria _(mandatory)_

### Performance Criteria

- **SC-PERF-001**: 대시보드 초기 로드 2초 이내 (LCP)
- **SC-PERF-002**: 문서 목록 페이지 로드 1초 이내
- **SC-PERF-003**: 문서 에디터 초기화 1초 이내
- **SC-PERF-004**: 검색 결과 표시 500ms 이내
- **SC-PERF-005**: 그래프 렌더링 (100노드 기준) 1초 이내

### User Experience Criteria

- **SC-UX-001**: 모든 인터랙션에 시각적 피드백 제공
- **SC-UX-002**: 일관된 디자인 시스템 적용
- **SC-UX-003**: 키보드 네비게이션 지원
- **SC-UX-004**: 오류 발생 시 명확한 복구 방법 제시

### Functional Outcomes

- **SC-FUNC-001**: 문서 CRUD 작업 100% 성공률 (유효한 입력 기준)
- **SC-FUNC-002**: 용어집 영향도 분석 정확도 100%
- **SC-FUNC-003**: 그래프 시각화가 실제 관계를 정확히 반영
- **SC-FUNC-004**: 검색 결과가 관련 문서를 정확히 반환

---

## Tech Stack

### Framework & Language

- **Next.js 14+** (App Router)
- **TypeScript**

### Styling

- **Tailwind CSS**
- **shadcn/ui** (UI 컴포넌트 라이브러리)

### State Management

- **TanStack Query (React Query)** - 서버 상태 관리
- **Zustand** - 클라이언트 상태 관리

### Document Editing

- **BlockNote** - Notion-style 블록 기반 WYSIWYG 에디터
  - 커스텀 블록: Callout, CodeBlock (Shiki 문법 하이라이팅)
  - 커스텀 인라인: Mention (Concept/Document 연결 → 그래프 관계 생성)
  - 커스텀 스타일: Highlight, Underline, Small Caps, Font Size
  - Edit/View 토글 지원
- **react-markdown** + **remark-gfm** - Markdown 렌더링 (필요시)

### Graph Visualization

- **@neo4j-nvl/react** - Neo4j Network Visualization Library (NVL)
  - [NVL Documentation](https://neo4j.com/docs/nvl/current/)
  - [NVL API Reference](https://neo4j.com/docs/api/nvl/current/)
  - [NVL React Examples](https://neo4j.com/docs/api/nvl/current/examples.html)
  - InteractiveNvlWrapper for React integration
  - 내장 줌/팬, Minimap, 레이아웃 알고리즘 지원

### API Integration

- **OpenAPI TypeScript Codegen** - API 타입 자동 생성
- **Axios** 또는 **ky** - HTTP 클라이언트

### Testing

- **Vitest** - 단위 테스트
- **Playwright** - E2E 테스트
- **React Testing Library** - 컴포넌트 테스트

---

## Out of Scope

- End User 프론트엔드 (별도 스펙으로 분리)
- AI 기능 (Phase 2)
- 실시간 협업 편집 (Phase 3)
- 다국어 지원 UI (Phase 4)
- 모바일 네이티브 앱
