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

## 🤖 AI 어시스턴트 가이드라인

### 작업 완료 시 체크리스트

1. **코드 변경 완료 후**:

   - [ ] 관련 `tasks.md` 업데이트 (상태, 서브태스크)
   - [ ] 필요시 `spec.md` 업데이트 (Tech Stack, Requirements)
   - [ ] Task Summary 테이블 업데이트

2. **새로운 기능 추가 시**:

   - [ ] `tasks.md`에 새 TASK 추가
   - [ ] `spec.md`의 Tech Stack 업데이트
   - [ ] 필요시 `data-model.md` 업데이트

3. **기술 스택 변경 시**:
   - [ ] `spec.md`의 Tech Stack 섹션 업데이트
   - [ ] 이유와 변경 내용 명시

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
