# Tasks: Frontend UI & Design System

## Task Overview

Frontend 디자인 시스템 구축을 위한 작업 목록입니다.

---

## Phase 1: 디자인 토큰 체계화

### TASK-001: 색상 토큰 확장 🔄

**Status**: 🔄 진행중
**Priority**: P0
**Estimated**: 1h

**Description**: 기존 globals.css의 색상 토큰을 확장하고 체계화

**Subtasks**:

- [ ] 기존 색상 토큰 검토 및 정리
- [ ] 인터랙션 상태 색상 추가 (hover, active, focus)
- [ ] 컴포넌트별 특화 색상 정의
- [ ] 하드코딩된 색상값 조사 및 토큰화

---

### TASK-002: 타이포그래피 토큰 정의 ⬜

**Status**: ⬜ 대기
**Priority**: P0
**Estimated**: 1h

**Description**: 폰트 사이즈, 라인 높이, 폰트 웨이트 토큰화

**Subtasks**:

- [ ] 타이포그래피 스케일 정의 (xs~3xl)
- [ ] 라인 높이 토큰 정의
- [ ] 폰트 웨이트 토큰 정의
- [ ] Tailwind 커스텀 유틸리티 생성

---

### TASK-003: 스페이싱/레이아웃 토큰 ⬜

**Status**: ⬜ 대기
**Priority**: P0
**Estimated**: 1h

**Description**: 고정 픽셀값을 CSS 변수로 전환

**Subtasks**:

- [ ] 레이아웃 토큰 정의 (header-height, sidebar-width 등)
- [ ] 스페이싱 스케일 확장
- [ ] 하드코딩된 px값 조사

---

## Phase 2: 기초 UI 컴포넌트 정비

### TASK-004: shadcn/ui 컴포넌트 커스터마이징 ⬜

**Status**: ⬜ 대기
**Priority**: P1
**Estimated**: 2h

**Description**: Button, Badge, Input 등 NALLO 스타일 variant 추가

**Subtasks**:

- [ ] Button - brand variant 추가
- [ ] Badge - status variants (draft, in-review, done, publish)
- [ ] Input - NALLO 스타일 적용

---

### TASK-005: 공통 컴포넌트 추출 ⬜

**Status**: ⬜ 대기
**Priority**: P1
**Estimated**: 2h

**Description**: 반복 패턴을 재사용 가능한 컴포넌트로 분리

**Subtasks**:

- [ ] IconButton 컴포넌트 생성
- [ ] NavItem 컴포넌트 생성
- [ ] StatusBadge 컴포넌트 생성

---

## Phase 3: 레이아웃 컴포넌트 리팩토링

### TASK-006: GlobalHeader 리팩토링 ⬜

**Status**: ⬜ 대기
**Priority**: P1
**Estimated**: 1h

**Description**: 하드코딩된 색상 제거, 디자인 토큰 적용

**Subtasks**:

- [ ] 하드코딩된 색상값 (#ececec, #594b45 등) 제거
- [ ] CSS 변수 기반 색상 적용
- [ ] 공통 컴포넌트 활용

---

### TASK-007: Sidebar 리팩토링 ⬜

**Status**: ⬜ 대기
**Priority**: P1
**Estimated**: 1.5h

**Description**: Mock 데이터 분리, 토큰 적용

**Subtasks**:

- [ ] Mock 데이터 lib/mocks/로 분리
- [ ] Props 인터페이스 정비
- [ ] 디자인 토큰 적용

---

## Phase 4: 기능별 컴포넌트 정리

### TASK-008: DocumentList 리팩토링 ⬜

**Status**: ⬜ 대기
**Priority**: P2
**Estimated**: 1.5h

**Description**: 데이터/UI 분리, 디자인 토큰 적용

**Subtasks**:

- [ ] Mock 데이터 분리
- [ ] statusStyles를 토큰 기반으로 변경
- [ ] Props 인터페이스 정비

---

### TASK-009: 기타 컴포넌트 정리 ⬜

**Status**: ⬜ 대기
**Priority**: P2
**Estimated**: 2h

**Description**: 나머지 기능 컴포넌트 디자인 시스템 적용

**Subtasks**:

- [ ] DocumentEditor 토큰 적용
- [ ] GlossaryList 토큰 적용
- [ ] GraphView 토큰 적용

---

## Task Summary

| Task     | Description                     | Status | Priority |
| -------- | ------------------------------- | ------ | -------- |
| TASK-001 | 색상 토큰 확장                  | 🔄     | P0       |
| TASK-002 | 타이포그래피 토큰 정의          | ⬜     | P0       |
| TASK-003 | 스페이싱/레이아웃 토큰          | ⬜     | P0       |
| TASK-004 | shadcn/ui 컴포넌트 커스터마이징 | ⬜     | P1       |
| TASK-005 | 공통 컴포넌트 추출              | ⬜     | P1       |
| TASK-006 | GlobalHeader 리팩토링           | ⬜     | P1       |
| TASK-007 | Sidebar 리팩토링                | ⬜     | P1       |
| TASK-008 | DocumentList 리팩토링           | ⬜     | P2       |
| TASK-009 | 기타 컴포넌트 정리              | ⬜     | P2       |

---

## Unimplemented Features (Constitution Principle VII) ⚠️

> **MANDATORY**: Track all unimplemented buttons, links, or features for future implementation.
> Every placeholder MUST have a TODO comment in code and be listed here.

| Feature | Location | Task ID | Priority | Description | User Feedback |
|---------|----------|---------|----------|-------------|---------------|
| 하드코딩 색상 제거 | GlobalHeader, Sidebar | TASK-006, TASK-007 | P1 | #ececec, #594b45 등 직접 색상값 | CSS 변수로 전환 필요 |
| Mock 데이터 분리 | Sidebar | TASK-007 | P1 | 인라인 Mock 데이터 | lib/mocks/로 이동 필요 |
| statusStyles 토큰화 | DocumentList | TASK-008 | P2 | 인라인 상태 스타일 | 디자인 토큰 기반으로 변경 필요 |

### Unimplemented Features Checklist

- [ ] All placeholder buttons/links are disabled with appropriate visual indication
- [ ] All placeholders have TODO(TASK-XXX) comments in code
- [ ] All placeholders provide user feedback (tooltip, toast, etc.)
- [ ] This table is updated after each development session
- [ ] No silent failures for unimplemented features
