# Feature Specification: Admin Frontend UI

**Feature Branch**: `003-admin-frontend-ui`  
**Created**: 2025-12-09  
**Status**: In Progress  
**Version**: 1.1.0  
**Last Updated**: 2025-12-09  
**Depends On**: `002-admin-frontend-foundation`  
**Input**: Figma 디자인을 기반으로 Admin Frontend에 UI/UX 디자인 적용

**Changes**:

- v1.1.0 (2025-12-09): 새 frontend 프로젝트 생성, 디자인 토큰/레이아웃/대시보드 구현 완료
- v1.0.0 (2025-12-09): 최초 작성

## Overview

Admin Frontend UI는 Figma에서 디자인된 UI/UX를 기존 `002-admin-frontend-foundation`에서 개발된 컴포넌트들에 적용하는 작업입니다. Figma 코드는 최적화되지 않았으므로 참고용으로만 사용하고, 기존 컴포넌트 구조와 shadcn/ui 기반으로 최적화된 구현을 진행합니다.

### Goals

1. **Figma 디자인 시스템 적용**: 색상, 타이포그래피, 스페이싱 등 디자인 토큰 적용
2. **레이아웃 구현**: 사이드바, 헤더, 메인 콘텐츠 영역 레이아웃
3. **페이지 통합**: 개별 컴포넌트들을 실제 페이지로 통합
4. **인터랙션 개선**: 애니메이션, 트랜지션, 마이크로 인터랙션

### Approach

- Figma 디자인은 **참고용**으로만 사용
- 기존 shadcn/ui 컴포넌트 구조 유지
- CSS 변수 기반 테마 시스템 활용
- 성능과 접근성 고려한 구현

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 일관된 디자인 시스템 (Priority: P0)

사용자가 모든 페이지에서 일관된 디자인을 경험합니다.

**Why this priority**: 디자인 시스템은 모든 UI 작업의 기반입니다.

**Independent Test**: 다양한 페이지 탐색 → 색상, 타이포그래피, 스페이싱 일관성 확인

**Acceptance Scenarios**:

1. **Given** 어떤 페이지든, **When** 페이지 로드, **Then** 동일한 색상 팔레트와 타이포그래피가 적용됨
2. **Given** 다크/라이트 모드 토글, **When** 테마 전환, **Then** 모든 컴포넌트가 새 테마로 즉시 변경됨

---

### User Story 2 - 메인 레이아웃 (Priority: P0)

사용자가 사이드바, 헤더, 메인 콘텐츠 영역으로 구성된 레이아웃에서 작업합니다.

**Why this priority**: 레이아웃은 모든 페이지의 기본 구조입니다.

**Independent Test**: 애플리케이션 접속 → 사이드바 네비게이션 확인 → 헤더 검색 확인 → 메인 콘텐츠 영역 확인

**Acceptance Scenarios**:

1. **Given** 로그인한 상태, **When** 메인 페이지 접속, **Then** 사이드바, 헤더, 메인 콘텐츠 영역이 표시됨
2. **Given** 사이드바, **When** 메뉴 항목 클릭, **Then** 해당 페이지로 이동하고 현재 위치가 하이라이트됨
3. **Given** 모바일 뷰포트, **When** 햄버거 메뉴 클릭, **Then** 사이드바가 오버레이로 표시됨

---

### User Story 3 - 대시보드 페이지 (Priority: P1)

사용자가 대시보드에서 현황을 한눈에 파악합니다.

**Independent Test**: 대시보드 접속 → 통계 카드 확인 → 최근 문서 확인 → 빠른 액션 확인

---

### User Story 4 - 문서 관리 페이지 (Priority: P1)

사용자가 문서 목록을 조회하고 관리합니다.

**Independent Test**: 문서 목록 접속 → 필터 적용 → 정렬 변경 → 문서 선택 → 상세 페이지 이동

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 시스템은 Figma 디자인과 일치하는 UI를 제공해야 함
- **FR-002**: 시스템은 사이드바 네비게이션을 제공해야 함
- **FR-003**: 시스템은 헤더 (검색, 사용자 메뉴)를 제공해야 함
- **FR-004**: 시스템은 반응형 레이아웃을 제공해야 함 (모바일 사이드바 토글)
- **FR-005**: 시스템은 다크/라이트 테마 전환을 지원해야 함
- **FR-006**: 시스템은 페이지 간 일관된 레이아웃을 유지해야 함

### Non-Functional Requirements

- **NFR-001**: 레이아웃 렌더링 100ms 이내
- **NFR-002**: 테마 전환 즉시 반영 (Flash 없음)
- **NFR-003**: 접근성 WCAG 2.1 AA 준수

---

## Success Criteria _(mandatory)_

### Visual Criteria

- **SC-VIS-001**: Figma 디자인과 90% 이상 시각적 일치
- **SC-VIS-002**: 모든 페이지에서 일관된 디자인 시스템 적용

### Performance Criteria

- **SC-PERF-001**: Lighthouse Performance 점수 90+
- **SC-PERF-002**: CLS (Cumulative Layout Shift) 0.1 이하

### User Experience Criteria

- **SC-UX-001**: 모든 인터랙션에 시각적 피드백 제공
- **SC-UX-002**: 키보드 네비게이션 완전 지원

---

## Tech Stack

### 기존 스택 (002-admin-frontend-foundation)

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**

### 추가 고려 사항

- **CSS Variables**: 디자인 토큰 관리
- **Framer Motion** (선택): 애니메이션 (필요시)
- **next-themes**: 다크/라이트 테마

---

## Out of Scope

- 새로운 기능 개발 (002에서 완료된 컴포넌트 활용)
- 백엔드 API 변경
- 인증 시스템 (별도 스펙)

---

## Figma Reference

> Figma Make로 생성된 코드를 참고하여 구현

| 화면 | Figma Node ID | 상태 |
|------|---------------|------|
| 레이아웃 | wVQMV1ioDa5K0LqLq4XY8V | ✅ |
| 대시보드 | wVQMV1ioDa5K0LqLq4XY8V | ✅ |
| 문서 목록 | TBD | ⬜ |
| 문서 편집 | TBD | ⬜ |
| 용어집 | TBD | ⬜ |
| 그래프 뷰 | TBD | ⬜ |

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css      # 디자인 토큰 (NALLO 브랜드 색상)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── dashboard/       # 대시보드 컴포넌트
│   │   ├── layout/          # 레이아웃 컴포넌트
│   │   │   ├── app-layout.tsx
│   │   │   ├── global-header.tsx
│   │   │   ├── function-header.tsx
│   │   │   └── sidebar.tsx
│   │   └── ui/              # shadcn/ui 컴포넌트
│   └── lib/
│       └── utils.ts
└── package.json
```

