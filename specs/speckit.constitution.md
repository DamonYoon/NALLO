# Speckit Constitution

> 이 문서는 speckit 기반 문서 관리의 핵심 규칙을 정의합니다.
> AI 어시스턴트와 개발자 모두 이 규칙을 따라야 합니다.

---

## 📋 핵심 규칙

### 1. 작업 후 문서 업데이트 필수

**모든 코드 작업이 완료되면 관련 speckit 문서를 반드시 업데이트해야 합니다.**

- **tasks.md**: 작업 상태(✅/⬜), 서브태스크 체크박스, Task Summary 테이블
- **spec.md**: Tech Stack, Requirements, User Scenarios 등 변경된 내용
- **data-model.md**: 데이터 모델 변경 시
- **contracts/**: API 계약 변경 시 (OpenAPI 등)

### 2. 문서 위치

```
specs/
├── {feature-id}-{feature-name}/
│   ├── spec.md              # 기능 명세
│   ├── tasks.md             # 태스크 목록 및 진행 상황
│   ├── data-model.md        # 데이터 모델
│   ├── plan.md              # 계획
│   ├── quickstart.md        # 빠른 시작 가이드
│   ├── research.md          # 리서치 노트
│   ├── checklists/
│   │   └── requirements.md  # 요구사항 체크리스트
│   └── contracts/
│       └── openapi.yaml     # API 계약
└── speckit.constitution.md  # 이 파일 (규칙 정의)
```

### 3. Task 상태 표기

| 상태   | 표기 | 설명                     |
| ------ | ---- | ------------------------ |
| 완료   | ✅   | 작업 완료 및 테스트 통과 |
| 진행중 | 🔄   | 현재 작업 중             |
| 대기   | ⬜   | 아직 시작하지 않음       |
| 취소   | ❌   | 더 이상 필요하지 않음    |

### 4. Subtask 체크박스

```markdown
- [x] 완료된 작업
- [ ] 아직 완료되지 않은 작업
```

### 5. 커밋 메시지 규칙

Spec 문서 관련 커밋은 다음 형식을 따릅니다:

```
<type>(<scope>): <subject>

[body]
```

#### Type

| Type       | 설명                                |
| ---------- | ----------------------------------- |
| `spec`     | spec.md, tasks.md 등 spec 문서 변경 |
| `feat`     | 새로운 기능 구현                    |
| `fix`      | 버그 수정                           |
| `docs`     | 일반 문서 변경                      |
| `refactor` | 리팩토링                            |
| `test`     | 테스트 추가/수정                    |

#### Scope

- `001-backend`, `002-frontend` 등 feature ID
- 또는 `constitution`, `all`

#### 예시

```bash
# Spec 문서 업데이트
spec(002-frontend): TASK-005 BlockNote 에디터 완료 표시

# 기능 구현 + Spec 업데이트
feat(002-frontend): BlockNote 에디터 구현

- 커스텀 Callout 블록 추가
- 멘션 인라인 컨텐츠 추가
- tasks.md 업데이트
```

### 6. 새 Feature Spec 생성 규칙

새로운 feature branch 생성 시 다음 구조로 spec 폴더를 생성합니다:

#### 폴더 구조

```
specs/
└── {NNN}-{feature-name}/
    ├── spec.md              # 필수: 기능 명세
    ├── tasks.md             # 필수: 태스크 목록
    ├── data-model.md        # 선택: 데이터 모델 (데이터 관련 기능)
    ├── plan.md              # 선택: 상세 계획
    ├── quickstart.md        # 선택: 빠른 시작 가이드
    ├── research.md          # 선택: 리서치 노트
    ├── checklists/
    │   └── requirements.md  # 선택: 요구사항 체크리스트
    └── contracts/
        └── openapi.yaml     # 선택: API 계약 (API 관련 기능)
```

#### Feature ID 규칙

- 3자리 숫자 (001, 002, 003...)
- 순차적으로 증가
- 기존 ID와 중복 불가

#### spec.md 필수 섹션

```markdown
# Feature Specification: {Feature Name}

**Feature Branch**: `{NNN}-{feature-name}`
**Created**: {YYYY-MM-DD}
**Status**: Draft | In Progress | Review | Done
**Depends On**: `{dependency-feature-id}` (있는 경우)

## Overview

## User Scenarios & Testing _(mandatory)_

## Requirements _(mandatory)_

## Success Criteria _(mandatory)_

## Tech Stack

## Out of Scope
```

#### tasks.md 필수 섹션

```markdown
# Tasks: {Feature Name}

## Task Overview

## Phase 1: {Phase Name}

### TASK-{NNN}: {Task Name}

## Task Summary (테이블)

## Unimplemented Features (미구현 기능)
```

### 7. 우선순위 규칙

태스크와 요구사항의 우선순위를 다음과 같이 정의합니다:

#### Priority 레벨

| Priority | 의미     | 설명                                 |
| -------- | -------- | ------------------------------------ |
| **P0**   | Critical | 프로젝트 기반, 다른 기능의 전제 조건 |
| **P1**   | High     | 핵심 기능, MVP 필수                  |
| **P2**   | Medium   | 중요하지만 MVP 이후 가능             |
| **P3**   | Low      | Nice-to-have, 추후 추가 가능         |

#### 작업 순서 원칙

1. **P0 → P1 → P2 → P3** 순서로 진행
2. 같은 Priority 내에서는 **의존성** 순서 고려
3. **Blocking 이슈**는 즉시 처리

#### Phase와 Priority 매핑

```
Phase 1 (Foundation)  → P0 태스크
Phase 2 (Core)        → P1 태스크
Phase 3 (Enhanced)    → P2 태스크
Phase 4 (Polish)      → P1~P2 태스크
```

### 8. Spec 버전 관리

Spec 문서의 변경 이력을 추적합니다:

#### Status 전환

```
Draft → In Progress → Review → Done
  ↓         ↓           ↓
  └─────────┴───────────┴──→ Deprecated (필요시)
```

| Status          | 설명                   |
| --------------- | ---------------------- |
| **Draft**       | 초안 작성 중, 검토 전  |
| **In Progress** | 구현 진행 중           |
| **Review**      | 구현 완료, 검토 대기   |
| **Done**        | 검토 완료, 릴리즈 가능 |
| **Deprecated**  | 더 이상 유효하지 않음  |

#### 버전 히스토리 관리

Major 변경 시 spec.md 상단에 버전 정보 추가:

```markdown
**Version**: 1.1.0
**Last Updated**: 2025-12-09
**Changes**:

- v1.1.0: BlockNote 에디터로 Tech Stack 변경
- v1.0.0: 최초 작성
```

#### Breaking Change 표기

기존 구현에 영향을 주는 변경은 명시적으로 표기:

```markdown
> ⚠️ **Breaking Change**: 기존 Markdown Editor → BlockNote로 변경
> 영향 범위: TASK-005, FR-004
```

### 9. Review 체크리스트

PR 리뷰 시 다음 항목을 확인합니다:

#### 코드 리뷰 체크리스트

- [ ] 코드가 요구사항을 충족하는가?
- [ ] 테스트가 작성되었는가?
- [ ] 린트 에러가 없는가?
- [ ] 타입 에러가 없는가?

#### Spec 문서 리뷰 체크리스트

- [ ] `tasks.md`의 관련 태스크가 업데이트되었는가?
- [ ] 완료된 태스크에 ✅ 표시가 되었는가?
- [ ] 서브태스크 체크박스가 업데이트되었는가?
- [ ] Task Summary 테이블이 업데이트되었는가?
- [ ] Tech Stack 변경 시 `spec.md`가 업데이트되었는가?
- [ ] 새로운 Requirements가 있으면 `spec.md`에 추가되었는가?

#### PR 제목 형식

```
[{feature-id}] {type}: {subject}
```

예시:

```
[002-frontend] feat: BlockNote 에디터 구현
[001-backend] fix: 문서 검색 API 버그 수정
[002-frontend] spec: TASK-007~012 진행 상황 업데이트
```

---

## 🏗️ 컴포넌트화 원칙 (Constitution V)

> **모든 코드는 수정 요청에 유연하게 대응할 수 있도록 컴포넌트화되어야 합니다.**

### 컴포넌트화 필수 규칙

| 규칙                        | 설명                                            | 예시                                                 |
| --------------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| **단일 책임 원칙**          | 하나의 컴포넌트는 하나의 기능만 담당            | `UserAvatar`, `UserName` (X: `UserCard`에 모두 포함) |
| **재사용 가능한 구조**      | 동일한 UI 패턴은 공통 컴포넌트로 추출           | `Button`, `Card`, `Modal` 등                         |
| **비즈니스 로직 분리**      | UI 컴포넌트에서 비즈니스 로직을 분리            | `useDocumentActions` hook 사용                       |
| **명확한 Props 인터페이스** | 컴포넌트 인터페이스는 타입으로 명시적 정의      | `interface ButtonProps { ... }`                      |
| **컴포넌트 독립 테스트**    | 전체 앱 컨텍스트 없이 컴포넌트 단독 테스트 가능 | Storybook 또는 단위 테스트                           |

### 컴포넌트 구조 예시

```
src/components/
├── ui/                    # 기본 UI 컴포넌트 (Button, Input, Card...)
├── shared/                # 공통 비즈니스 컴포넌트
├── features/              # 기능별 컴포넌트
│   ├── documents/
│   │   ├── DocumentList.tsx
│   │   ├── DocumentCard.tsx
│   │   └── hooks/
│   │       └── useDocumentActions.ts
│   └── users/
└── layout/                # 레이아웃 컴포넌트
```

### 코드 리뷰 체크리스트 (컴포넌트화)

- [ ] 새 컴포넌트가 단일 책임 원칙을 따르는가?
- [ ] 재사용 가능한 로직이 적절히 추출되었는가?
- [ ] 컴포넌트 인터페이스(Props)가 명확하게 정의되었는가?
- [ ] 비즈니스 로직이 UI와 분리되었는가?

---

## 🚫 하드코딩 지양 원칙 (Constitution VI)

> **변경될 수 있는 모든 값은 설정으로 외부화해야 합니다.**

### 하드코딩 금지 항목

| 항목               | ❌ 금지                              | ✅ 권장                                |
| ------------------ | ------------------------------------ | -------------------------------------- |
| **API 엔드포인트** | `fetch('http://localhost:3000/api')` | `fetch(process.env.API_URL)`           |
| **색상값**         | `color: '#3B82F6'`                   | `color: var(--primary-color)`          |
| **문자열**         | `'문서를 저장했습니다'`              | `t('document.saved')` 또는 상수        |
| **숫자 상수**      | `setTimeout(() => {}, 3000)`         | `setTimeout(() => {}, TOAST_DURATION)` |
| **API 키**         | `const API_KEY = 'sk-xxx'`           | `const API_KEY = process.env.API_KEY`  |
| **기능 플래그**    | `if (true) { showBetaFeature() }`    | `if (featureFlags.BETA_ENABLED)`       |

### 설정 외부화 위치

```
src/
├── config/
│   ├── constants.ts       # 앱 전역 상수
│   ├── api.config.ts      # API 관련 설정
│   └── theme.config.ts    # 테마 관련 설정
├── styles/
│   └── variables.css      # CSS 변수 정의
└── .env.local             # 환경 변수 (gitignore)
```

### 코드 리뷰 체크리스트 (하드코딩)

- [ ] 환경별로 달라지는 값이 환경 변수를 사용하는가?
- [ ] Magic number가 named constant로 대체되었는가?
- [ ] UI 텍스트가 외부화되어 있는가? (최소한 상수로)
- [ ] 색상, 크기 등 스타일 값이 CSS 변수 또는 테마 설정을 사용하는가?

---

## 📝 미구현 기능 추적 (Constitution VII)

> **개발 중 아직 구현되지 않은 버튼, 기능 등은 반드시 문서화하여 추후 작업을 확인할 수 있도록 합니다.**

### 미구현 기능 표기 방법

#### 1. 코드 내 TODO 주석

```typescript
// TODO(TASK-015): 알림 기능 구현 필요
// - 새 문서 생성 시 알림
// - 멘션 시 알림
const handleNotification = () => {
  console.warn("Not implemented: handleNotification");
  toast.info("Coming soon!"); // 사용자에게 안내
};
```

#### 2. UI에서 미구현 표시

```tsx
// 미구현 버튼은 disabled + tooltip으로 표시
<Button
  disabled
  title="Coming soon: 알림 기능 (TASK-015)"
  onClick={handleNotification}
>
  알림 설정
</Button>
```

#### 3. tasks.md 미구현 기능 섹션

```markdown
## Unimplemented Features (미구현 기능)

| 기능          | 위치                   | 관련 TASK | 우선순위 | 설명                     |
| ------------- | ---------------------- | --------- | -------- | ------------------------ |
| 알림 버튼     | Header.tsx:45          | TASK-015  | P2       | 알림 기능 구현 후 활성화 |
| 공유 기능     | DocumentActions.tsx:78 | TASK-022  | P3       | SNS 공유 기능            |
| 다크모드 토글 | Settings.tsx:23        | TASK-030  | P2       | 테마 시스템 구현 후      |
```

### 미구현 기능 추적 워크플로우

1. **개발 중 발견**: 미구현 기능 발견 시 즉시 TODO 주석 추가
2. **tasks.md 업데이트**: Unimplemented Features 섹션에 기록
3. **UI 처리**: disabled 상태 + 사용자 피드백 (tooltip/toast)
4. **주간 리뷰**: 미추적 placeholder가 없는지 확인
5. **릴리즈 노트**: 알려진 미구현 기능 명시

### 코드 리뷰 체크리스트 (미구현 기능)

- [ ] 모든 placeholder 버튼/기능에 TODO 주석이 있는가?
- [ ] tasks.md의 Unimplemented Features 섹션이 업데이트되었는가?
- [ ] 미구현 UI 요소가 적절히 disabled 처리되었는가?
- [ ] 사용자에게 "Coming soon" 등의 피드백이 제공되는가?

---

## 🤖 AI 어시스턴트 가이드라인

### 작업 완료 시 체크리스트

1. **코드 변경 완료 후**:

   - [ ] 관련 `tasks.md` 업데이트 (상태, 서브태스크)
   - [ ] 필요시 `spec.md` 업데이트 (Tech Stack, Requirements)
   - [ ] Task Summary 테이블 업데이트
   - [ ] 미구현 기능 섹션 업데이트 (있는 경우)

2. **새로운 기능 추가 시**:

   - [ ] `tasks.md`에 새 TASK 추가
   - [ ] `spec.md`의 Tech Stack 업데이트
   - [ ] 필요시 `data-model.md` 업데이트
   - [ ] 컴포넌트화 원칙 준수 확인

3. **기술 스택 변경 시**:

   - [ ] `spec.md`의 Tech Stack 섹션 업데이트
   - [ ] 이유와 변경 내용 명시

4. **미구현 기능 추가 시**:
   - [ ] 코드에 `TODO(TASK-XXX)` 주석 추가
   - [ ] `tasks.md`의 Unimplemented Features 섹션 업데이트
   - [ ] UI에 disabled 상태 + 사용자 피드백 적용

### 문서 업데이트 예시

```markdown
### TASK-005: BlockNote 블록 기반 에디터 ✅

**Status**: ✅ 완료

**Subtasks**:

- [x] BlockNote 에디터 기본 통합
- [x] 코드 블록 문법 하이라이팅
- [x] 커스텀 Callout 블록
- [x] 커스텀 Mention 인라인 컨텐츠
```

---

## 📝 변경 이력

| 날짜       | 변경 내용                                                        | 작성자       |
| ---------- | ---------------------------------------------------------------- | ------------ |
| 2025-12-09 | 최초 작성                                                        | AI Assistant |
| 2025-12-09 | 커밋 메시지 규칙, Feature Spec 생성 규칙, Review 체크리스트 추가 | AI Assistant |
| 2025-12-09 | 우선순위 규칙, Spec 버전 관리 규칙 추가                          | AI Assistant |
| 2025-12-10 | 컴포넌트화 원칙, 하드코딩 지양, 미구현 기능 추적 섹션 추가       | AI Assistant |
