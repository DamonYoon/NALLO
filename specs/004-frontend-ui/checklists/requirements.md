# Requirements Checklist: Frontend UI & Design System

## Functional Requirements

- [x] **FR-001**: CSS 변수 기반 디자인 토큰 시스템 (P0)
- [x] **FR-002**: Tailwind 커스텀 유틸리티 클래스 (P0)
- [x] **FR-003**: Light/Dark 모드 전환 (P1)
- [x] **FR-004**: shadcn/ui 컴포넌트 NALLO 스타일 커스터마이징 (P1)
- [x] **FR-005**: 재사용 가능한 공통 컴포넌트 라이브러리 (P1)
- [x] **FR-006**: 레이아웃 컴포넌트 토큰 적용 (P1)
- [x] **FR-007**: 기능별 컴포넌트 데이터/UI 분리 (P2) - DocumentList, GlossaryList, Graph 완료

## Non-Functional Requirements

- [x] **NFR-001**: 하드코딩된 색상값 0개 (P0) - 주요 레이아웃 컴포넌트 완료
- [x] **NFR-002**: 일관된 스페이싱 시스템 적용 (P1)
- [x] **NFR-003**: 컴포넌트 Props 타입 안전성 (P1)

## Success Criteria

- [x] 모든 색상이 CSS 변수로 정의됨
- [x] 하드코딩된 픽셀값이 토큰으로 대체됨
- [x] 공통 UI 컴포넌트가 분리되어 재사용 가능
- [x] Light/Dark 모드 전환 시 모든 컴포넌트 정상 동작
- [x] Mock 데이터가 컴포넌트에서 분리됨 (sidebar, documents, glossary)
