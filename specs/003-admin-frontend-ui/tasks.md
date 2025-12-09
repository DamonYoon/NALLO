# Tasks: Admin Frontend UI

## Task Overview

Figma 디자인을 Admin Frontend에 적용하는 태스크입니다. 각 태스크는 Figma 디자인을 참고하여 기존 컴포넌트에 스타일을 적용합니다.

---

## Phase 1: Design System Foundation

### TASK-001: 디자인 토큰 설정 ✅

**Priority**: P0  
**Estimate**: 2h  
**Dependencies**: None  
**Status**: ✅ 완료

**Description**:
Figma 디자인에서 색상, 타이포그래피, 스페이싱 등 디자인 토큰을 추출하여 CSS 변수로 설정합니다.

**Subtasks**:

- [x] Figma에서 색상 팔레트 추출
- [x] CSS 변수로 색상 토큰 정의 (globals.css)
- [x] 타이포그래피 스케일 정의
- [x] 스페이싱 스케일 정의
- [x] 그림자, 테두리 반경 등 정의
- [x] 다크 모드 색상 토큰 정의

**Acceptance Criteria**:

- CSS 변수로 모든 디자인 토큰 접근 가능
- 다크/라이트 모드 토큰 전환 동작

---

### TASK-002: 메인 레이아웃 구현 ✅

**Priority**: P0  
**Estimate**: 4h  
**Dependencies**: TASK-001  
**Status**: ✅ 완료

**Description**:
사이드바, 헤더, 메인 콘텐츠 영역으로 구성된 레이아웃을 구현합니다.

**Subtasks**:

- [x] `AppLayout` 컴포넌트 생성
- [x] `Sidebar` 컴포넌트 생성 (네비게이션 메뉴)
- [x] `GlobalHeader` 컴포넌트 생성 (프로젝트 선택, 사용자 메뉴)
- [x] `FunctionHeader` 컴포넌트 생성 (문서/용어집/배포/그래프 탭)
- [ ] 반응형 레이아웃 (모바일 사이드바 토글)
- [ ] 사이드바 접기/펼치기 기능
- [x] 현재 경로 하이라이트

**Acceptance Criteria**:

- Figma 디자인과 일치하는 레이아웃
- 모바일에서 햄버거 메뉴로 사이드바 토글
- 사이드바에서 현재 위치 표시

---

## Phase 2: Page Integration

### TASK-003: 대시보드 페이지 ✅

**Priority**: P1  
**Estimate**: 3h  
**Dependencies**: TASK-002  
**Status**: ✅ 완료

**Description**:
대시보드 페이지를 Figma 디자인에 맞게 구현합니다.

**Subtasks**:

- [x] 메인 페이지에 대시보드 배치
- [x] 최근 활동 섹션 (최근 문서 목록)
- [x] 문서 운영 인사이트 섹션 (연결성 지수 원형 차트)
- [x] AI 추천 작업 섹션
- [x] 문서 상태 요약 섹션 (KPI 그리드)
- [x] 레이아웃 및 스페이싱 조정

**Acceptance Criteria**:

- Figma 대시보드 디자인과 일치
- 기존 컴포넌트 정상 동작

---

### TASK-004: 문서 목록 페이지 ✅

**Priority**: P1  
**Estimate**: 3h  
**Dependencies**: TASK-002  
**Status**: ✅ 완료

**Description**:
문서 목록 페이지를 Figma 디자인에 맞게 구현합니다.

**Subtasks**:

- [x] DocumentList 컴포넌트 생성
- [x] 페이지 헤더 (제목, 새 문서 버튼)
- [x] 검색 및 필터 영역 (상태, 타입)
- [x] 문서 테이블 (체크박스, 정보, 액션 메뉴)
- [x] 페이지네이션 UI
- [x] 대시보드에서 문서 목록으로 전환 기능

**Acceptance Criteria**:

- Figma 문서 목록 디자인과 일치
- 필터, 정렬, 페이지네이션 동작

---

### TASK-005: 문서 상세/편집 페이지 ✅

**Priority**: P1  
**Estimate**: 4h  
**Dependencies**: TASK-004  
**Status**: ✅ 완료

**Description**:
문서 상세 보기 및 편집 페이지를 구현합니다.

**Subtasks**:

- [x] DocumentEditor 컴포넌트 생성
- [x] 문서 위치/타입/상태 선택
- [x] Edit/Preview 모드 토글
- [x] 제목 및 본문 편집 영역
- [x] 용어 연결 섹션 (검색, 추가, 삭제)
- [x] 태그 관리 (우측 패널)
- [x] AI 추천 용어 패널
- [x] 지식 그래프 미니맵
- [x] 저장/취소 액션 바

**Acceptance Criteria**:

- Figma 문서 편집 디자인과 일치
- Edit/Preview 모드 전환 동작

---

### TASK-006: 용어집 페이지 ✅

**Priority**: P1  
**Estimate**: 3h  
**Dependencies**: TASK-002  
**Status**: ✅ 완료

**Description**:
용어집(Concept) 목록 및 상세 페이지를 구현합니다.

**Subtasks**:

- [x] GlossaryList 컴포넌트 생성
- [x] 카테고리 필터 (API 요소, 개념, 기능)
- [x] 검색 기능
- [x] 리스트/그리드 뷰 토글
- [x] 용어 테이블 (이름, 카테고리, 문서 수, 수정일)
- [x] 페이지네이션

**Acceptance Criteria**:

- Figma 용어집 디자인과 일치
- 필터, 검색, 뷰 모드 전환 동작

---

### TASK-007: 버전/페이지 관리

**Priority**: P2  
**Estimate**: 3h  
**Dependencies**: TASK-002

**Description**:
버전 및 페이지 트리 관리 페이지를 구현합니다.

**Subtasks**:

- [ ] `/versions` 라우트 생성
- [ ] `/versions/[id]/pages` 라우트 생성
- [ ] 버전 목록/카드 레이아웃
- [ ] 페이지 트리 레이아웃

**Acceptance Criteria**:

- Figma 버전/페이지 디자인과 일치
- 페이지 트리 동작

---

### TASK-008: 그래프 뷰 페이지 ✅

**Priority**: P2  
**Estimate**: 3h  
**Dependencies**: TASK-002  
**Status**: ✅ 완료

**Description**:
그래프 시각화 페이지를 Figma 디자인에 맞게 조정합니다.

**Subtasks**:

- [x] GraphView 컴포넌트 생성
- [x] 다크 테마 UI (좌측 필터 패널)
- [x] 노드 타입 필터 (문서, 용어)
- [x] 관계 타입 필터 (문서↔문서, 문서↔용어, 용어↔용어)
- [x] SVG 기반 그래프 렌더링
- [x] 노드 클릭 시 상세 패널 표시
- [x] 줌 컨트롤

**Acceptance Criteria**:

- Figma 그래프 뷰 디자인과 일치
- 그래프 인터랙션 정상 동작

---

## Phase 3: Polish

### TASK-009: 애니메이션 및 트랜지션

**Priority**: P2  
**Estimate**: 2h  
**Dependencies**: TASK-002

**Description**:
페이지 전환, 사이드바 토글 등에 애니메이션을 적용합니다.

**Subtasks**:

- [ ] 사이드바 토글 애니메이션
- [ ] 페이지 전환 트랜지션
- [ ] 버튼/카드 호버 효과
- [ ] 로딩 애니메이션

**Acceptance Criteria**:

- 부드러운 애니메이션 동작
- 성능 저하 없음 (60fps)

---

### TASK-010: 최종 디자인 QA

**Priority**: P1  
**Estimate**: 2h  
**Dependencies**: All

**Description**:
모든 페이지의 Figma 디자인 일치 여부를 검증합니다.

**Subtasks**:

- [ ] 페이지별 디자인 검토
- [ ] 반응형 검증 (데스크톱, 태블릿, 모바일)
- [ ] 다크 모드 검증
- [ ] 접근성 검증

**Acceptance Criteria**:

- 모든 페이지 Figma 디자인과 일치
- 반응형 동작 정상
- 접근성 이슈 없음

---

## Task Summary

| Task ID  | Task Name              | Priority | Estimate | Status |
| -------- | ---------------------- | -------- | -------- | ------ |
| TASK-001 | 디자인 토큰 설정       | P0       | 2h       | ✅     |
| TASK-002 | 메인 레이아웃 구현     | P0       | 4h       | ✅     |
| TASK-003 | 대시보드 페이지        | P1       | 3h       | ✅     |
| TASK-004 | 문서 목록 페이지       | P1       | 3h       | ✅     |
| TASK-005 | 문서 상세/편집 페이지  | P1       | 4h       | ✅     |
| TASK-006 | 용어집 페이지          | P1       | 3h       | ✅     |
| TASK-007 | 버전/페이지 관리       | P2       | 3h       | ⬜     |
| TASK-008 | 그래프 뷰 페이지       | P2       | 3h       | ✅     |
| TASK-009 | 애니메이션 및 트랜지션 | P2       | 2h       | ⬜     |
| TASK-010 | 최종 디자인 QA         | P1       | 2h       | ⬜     |

**Total Estimate**: ~28h

### Priority Legend

- **P0**: 디자인 시스템 기반 (먼저 완료)
- **P1**: 핵심 페이지 (MVP)
- **P2**: 부가 페이지 및 폴리시
