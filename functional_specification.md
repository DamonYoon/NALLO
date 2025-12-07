# 기능명세서 (Functional Specification)

## 목차

1. [서비스 개요](#1-서비스-개요)
2. [기능 목록](#2-기능-목록)
3. [상세 기능 명세](#3-상세-기능-명세)
4. [사용자 시나리오](#4-사용자-시나리오)
5. [기술 요구사항](#5-기술-요구사항)

---

## 1. 서비스 개요

### 1.1. Pain Point

현재 문서 관리 시스템의 주요 문제점:

- **용어/정의 일괄 수정 어려움**: 문서가 여러 페이지에 흩어져 있어 용어나 정의를 일괄 수정하기 어려움
- **문서 간 관계 파악 불가**: 문서 간 관계를 한눈에 보기 어려워 구조 파악이 어렵고 탐색 난이도가 높음
- **일관성 없는 사용자 경험**: 초보자와 전문가 모두에게 동일한 흐름으로 문서가 제공됨
- **비효율적인 정보 탐색**: AI 기반 문맥 탐색 기능 부재로 필요한 정보를 찾기 어려움

### 1.2. 핵심 차별점

1. **용어집 기반 일괄 수정 (Glossary ↔ 전체 문서 자동 연동)**
   - 단어 정의 변경 시 연결된 모든 페이지 자동 업데이트
   - 문서 간 consistency 확보

2. **지식그래프 뷰에서 전체 문서 구조 시각화**
   - 페이지 = 노드, 문서 연결 = 엣지
   - 온톨로지 Entity Class별 구분
   - 수정 영향 범위 하이라이팅

3. **문서 Layer 구조 (키워드·요약·정문) 자동 생성**
   - Layer 1: AI가 추출한 핵심 개념 (Concept/Entity 매핑)
   - Layer 2: 요약본
   - Layer 3: 원문

4. **사용자 맞춤형 문서 추천 UX**
   - 사용자 맞춤형 온보딩
   - 현재 읽는 페이지 + 연결 노드 + 온톨로지 기반 추천
   - Assistant: 현재 문서와 연결된 온톨로지 데이터를 컨텍스트로 자동 주입

### 1.3. 주요 사용자

- **관리자 (Admin)**: 문서 작성, 관리, 배포 담당
- **문서 소비자 (End User)**: 문서 열람, 검색, AI 채팅을 통한 상호작용

---

## 2. 기능 목록

### 2.1. Phase 1: 기본 기능 (Core Features)

**목표**: 문서 작성, 관리, 열람의 기본 기능과 GraphDB 구조 구축

#### 2.1.1. 문서 관리 기능 (Admin)

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| DOC-001 | 문서 작성 및 관리 (기본) | P0 |
| DOC-002 | 문서 Import (마크다운, OAS) | P0 |
| DOC-004 | 문서 수정 및 Working Copy 관리 | P0 |
| DOC-006 | 문서 그래프 뷰 | P1 |

#### 2.1.2. 용어집(Glossary) 관리 기능 (Admin)

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| GLOSS-001 | 용어집 작성 및 관리 (기본) | P0 |
| GLOSS-003 | 동의어 관리 | P1 |
| GLOSS-004 | 용어 기반 문서 일괄 수정 | P0 |

#### 2.1.3. 버전/페이지 관리 기능 (Admin)

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| VER-001 | 버전 생성 및 관리 | P0 |
| VER-002 | 페이지 생성 및 관리 | P0 |
| VER-003 | 페이지-Document 연결 | P0 |
| VER-004 | 배포 관리 | P0 |

#### 2.1.4. 검색/탐색 기능 (End User)

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| SEARCH-001 | 문서 검색 | P0 |
| SEARCH-002 | 문서 네비게이션 | P0 |

#### 2.1.5. 사용자 인터랙션 기능 (End User)

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| UX-001 | 문서 열람 | P0 |
| UX-002 | API Try It 기능 | P1 |
| UX-003 | 즐겨찾기 | P1 |
| UX-004 | 최근 본 문서 | P1 |
| UX-005 | 문서 피드백 | P2 |

### 2.2. Phase 2: AI 기능 (AI Features)

**목표**: AI를 활용한 문서 작성 보조, 채팅, 추천 기능

#### 2.2.1. AI 문서 작성 보조

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| AI-001 | AI 문서 작성 보조 | P0 |
| DOC-003 | AI 문서 작성 보조 (상세) | P0 |
| DOC-007 | 문서 Layer 자동 생성 | P0 |

#### 2.2.2. AI 용어 관리

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| AI-002 | AI 용어 추출 및 추천 | P0 |
| GLOSS-002 | 용어 자동 추천 | P1 |

#### 2.2.3. AI 품질 검사

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| AI-003 | AI 문서 품질 검사 | P1 |
| DOC-005 | 문서 품질 관리 (AI 기반 검증) | P1 |

#### 2.2.4. AI 채팅

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| AI-004 | AI 채팅 (Admin용) | P1 |
| AI-005 | AI 채팅 (End User용) | P0 |

#### 2.2.5. AI 추천

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| AI-006 | AI 문서 추천 | P1 |
| SEARCH-003 | 문서 추천 | P1 |

### 2.3. Phase 3: 협업 및 워크플로우 (Collaboration & Workflow)

**목표**: 팀 협업, 리뷰, 워크플로우 관리 기능

#### 2.3.1. 팀 관리

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| TEAM-001 | 팀 관리 | P2 |

#### 2.3.2. 워크플로우 관리

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| TEAM-002 | 워크플로우 관리 (Draft/In Review/Done/Publish) | P2 |
| TEAM-003 | 리뷰 시스템 | P2 |

### 2.4. Phase 4: 고급 기능 (Advanced Features)

**목표**: SEO, 다국어, 분석, 고급 문서 관리 기능

#### 2.4.1. SEO 기능

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| SEO-001 | SEO 메타데이터 관리 | P1 |
| SEO-002 | SEO 자동 생성 | P1 |

#### 2.4.2. 다국어/번역 기능

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| I18N-001 | 번역 관리 | P2 |
| I18N-002 | AI 번역 생성 | P2 |
| I18N-003 | 다국어 지원 UI | P2 |

#### 2.4.3. 고급 문서 관리 기능

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| DOC-201 | 문서 간 콘텐츠 블록 재사용 | P2 |
| DOC-202 | 톤앤매너 관리 기능 | P2 |

#### 2.4.4. 분석/메트릭 기능

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| METRICS-001 | 페이지 뷰 수 통계 | P2 |
| METRICS-002 | 사용자 행동 분석 | P2 |
| METRICS-003 | 문서 피드백 분석 | P2 |

#### 2.4.5. 사이트 구성 기능

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|----------|
| SITE-001 | 사이트 전역 설정 | P1 |
| SITE-002 | 네비게이션/GNB 구성 | P1 |
| SITE-003 | 랜딩 페이지 레이아웃 구성 | P2 |

---

## 3. 상세 기능 명세

### 3.1. Phase 1: 기본 기능 (Core Features)

#### DOC-001: 문서 작성 및 관리

**기능 개요**
관리자가 문서를 작성, 수정, 관리할 수 있는 기능

**상세 명세**

##### 3.1.1.1. 문서 작성

**입력**
- `title` (string, required): 문서 제목
- `type` (enum, required): 문서 타입 ("api" | "general" | "tutorial")
- `content` (string, required): 문서 본문 (마크다운 또는 OAS 형식)
- `tags` (array<string>, optional): 태그 목록
- `lang` (string, required): 언어 코드 ("ko", "en" 등)

**처리 로직**
1. 사용자가 문서 작성 화면에서 제목, 타입, 본문 입력
2. 첫 저장 시 Document 노드 생성
   - GraphDB에 Document 노드 생성
   - RDB에 문서 본문 저장 (storage_key 생성)
   - Document 노드의 `status`를 "draft"로 설정
3. 첨부 파일이 있는 경우 Attachment 노드 생성 및 연결
4. (Phase 2) AI가 문서에서 용어 후보 추출 및 Concept 추천
5. (Phase 2) 사용자가 Concept 연결 승인/거부
6. (Phase 2) 문서 품질 검사 실행

**출력**
- `document_id` (UUID): 생성된 문서 ID
- `storage_key` (string): 문서 본문 저장 위치
- `status` (string): 문서 상태 ("draft")

**예외 처리**
- 제목이 비어있는 경우: "문서 제목을 입력해주세요" 에러 반환
- 지원하지 않는 문서 타입인 경우: "지원하지 않는 문서 타입입니다" 에러 반환
- 저장 실패 시: "문서 저장에 실패했습니다" 에러 반환 및 롤백

**관련 데이터 모델**
- Document Node (GraphDB)
- Document Content (RDB)
- Attachment Node (GraphDB, optional)
- Concept Node (GraphDB, optional)

##### 3.1.1.2. 문서 수정

**관련 데이터 모델**
- Document Node (GraphDB)
- Document Content (RDB)

#### DOC-002: 문서 Import (마크다운, OAS)

**기능 개요**
기존 마크다운 파일 또는 OAS 파일을 업로드하여 문서를 생성하는 기능

**상세 명세**

**입력**
- `file` (File, required): 업로드할 파일 (.md 또는 .yaml)
- `type` (enum, required): 문서 타입 ("api" | "general")
- `version_id` (UUID, optional): 연결할 버전 ID

**처리 로직**
1. 파일 형식 검증
   - .md 파일: 마크다운 형식 검증
   - .yaml 파일: OAS 스키마 검증
2. 파일 내용 파싱
3. Document 노드 생성
4. 파일을 storage에 저장 (storage_key 생성)
5. (Phase 2) AI가 자동으로 용어 추출 및 Concept 추천

**출력**
- `document_id` (UUID): 생성된 문서 ID
- `imported_concepts` (array<UUID>): 추출된 Concept 목록

**예외 처리**
- 파일 형식이 지원되지 않는 경우: "지원하지 않는 파일 형식입니다" 에러 반환
- 파일 파싱 실패 시: "파일을 파싱할 수 없습니다" 에러 반환
- 파일 크기 제한 초과: "파일 크기가 너무 큽니다" 에러 반환

#### DOC-004: 문서 수정 (기본)

**기능 개요**
관리자가 문서를 수정하는 기본 기능 (Working Copy는 Phase 3에서 처리)

**상세 명세**

**입력**
- `document_id` (UUID, required): 수정할 문서 ID
- `content` (string, required): 수정된 문서 본문
- `title` (string, optional): 수정된 제목

**처리 로직**
1. 문서 상태 확인
   - `status`가 "draft" 또는 "in_review"인 경우: 직접 수정
   - `status`가 "publish"인 경우: Phase 3의 Working Copy 프로세스 사용
2. 수정 내용 저장
3. 영향도 분석 실행
   - 직접 링크된 문서 확인
   - 동일 Concept를 사용하는 문서 확인
   - 영향받는 문서를 그래프 뷰로 표시

**출력**
- `document_id` (UUID): 수정된 문서 ID
- `impacted_documents` (array<UUID>): 영향받는 문서 목록

**예외 처리**
- 문서가 존재하지 않는 경우: "문서를 찾을 수 없습니다" 에러 반환
- 권한이 없는 경우: "문서 수정 권한이 없습니다" 에러 반환

#### DOC-005: 문서 그래프 뷰

**기능 개요**
문서 간 관계를 그래프로 시각화하여 보여주는 기능

**상세 명세**

**입력**
- `version_id` (UUID, optional): 버전 필터
- `node_types` (array<string>, optional): 노드 타입 필터
- `tags` (array<string>, optional): 태그 필터

**처리 로직**
1. 필터 조건에 맞는 노드 및 엣지 조회
2. 그래프 데이터 구조 생성
3. 시각화 라이브러리로 렌더링

**출력**
- `graph_data` (object): 그래프 데이터
  - `nodes` (array<object>): 노드 목록
    - `id` (UUID): 노드 ID
    - `type` (string): 노드 타입
    - `label` (string): 노드 라벨
    - `properties` (object): 노드 속성
  - `edges` (array<object>): 엣지 목록
    - `from` (UUID): 시작 노드 ID
    - `to` (UUID): 종료 노드 ID
    - `type` (string): 관계 타입
    - `weight` (number, optional): 가중치

**관련 데이터 모델**
- Document Node (GraphDB)
- Page Node (GraphDB)
- Concept Node (GraphDB)
- Tag Node (GraphDB)
- 모든 Edge 타입 (GraphDB)


#### GLOSS-001: 용어집 작성 및 관리

**기능 개요**
용어(Concept)를 작성하고 관리하는 기능

**상세 명세**

##### 3.1.6.1. 용어 작성

**입력**
- `term` (string, required): 용어 텍스트
- `description` (string, required): 용어 정의/설명
- `category` (string, optional): 용어 카테고리
- `lang` (string, required): 언어 코드

**처리 로직**
1. Concept 노드 생성
2. Graph view에 표시하여 시각적 피드백 제공

**출력**
- `concept_id` (UUID): 생성된 Concept ID

**예외 처리**
- 동일한 용어가 이미 존재하는 경우: "이미 존재하는 용어입니다" 경고 및 기존 Concept 연결 제안

**관련 데이터 모델**
- Concept Node (GraphDB)

##### 3.1.6.2. 동의어 관리

**입력**
- `concept_id` (UUID, required): Concept ID
- `synonym_concept_id` (UUID, required): 동의어 Concept ID

**처리 로직**
1. 두 Concept가 같은 언어인지 확인
2. `SYNONYM_OF` 관계 생성
3. Canonical Concept 지정 (B를 canonical로, A를 동의어로)

**출력**
- `synonym_relation_id` (string): 생성된 관계 ID

**예외 처리**
- 다른 언어의 Concept인 경우: "같은 언어의 Concept만 동의어로 연결할 수 있습니다" 에러 반환

**관련 데이터 모델**
- Concept Node (GraphDB)
- SYNONYM_OF Edge (GraphDB)


#### GLOSS-003: 용어 기반 문서 일괄 수정

**기능 개요**
Concept의 정의를 변경하면 해당 Concept를 사용하는 모든 문서에 자동 반영

**상세 명세**

**입력**
- `concept_id` (UUID, required): 수정할 Concept ID
- `new_description` (string, required): 새로운 정의

**처리 로직**
1. Concept의 `description` 업데이트
2. 해당 Concept와 `USES_CONCEPT` 관계가 있는 모든 Document 조회
3. 각 Document의 본문에서 해당 용어의 정의 부분 찾기
4. 정의 부분 자동 업데이트
5. 영향받는 문서 목록 반환

**출력**
- `updated_concept_id` (UUID): 업데이트된 Concept ID
- `impacted_documents` (array<UUID>): 영향받는 문서 목록

**예외 처리**
- Concept가 존재하지 않는 경우: "Concept를 찾을 수 없습니다" 에러 반환

**관련 데이터 모델**
- Concept Node (GraphDB)
- Document Node (GraphDB)
- USES_CONCEPT Edge (GraphDB)
- Document Content (RDB)

#### VER-001: 버전 생성 및 관리

**기능 개요**
문서 버전을 생성하고 관리하는 기능

**상세 명세**

##### 3.1.7.1. 버전 생성

**입력**
- `version` (string, required): 버전 식별자 (예: "v1.0.1")
- `name` (string, required): 표시용 이름
- `description` (string, optional): 버전 설명
- `is_public` (boolean, required): 공개 여부
- `is_main` (boolean, required): 메인 버전 여부

**처리 로직**
1. `is_main`이 true인 경우, 기존 메인 버전의 `is_main`을 false로 변경
2. Version 노드 생성

**출력**
- `version_id` (UUID): 생성된 Version ID

**예외 처리**
- 동일한 버전 식별자가 이미 존재하는 경우: "이미 존재하는 버전입니다" 에러 반환

**관련 데이터 모델**
- Version Node (GraphDB)

##### 3.1.7.2. 버전 설정 변경

**입력**
- `version_id` (UUID, required): 버전 ID
- `is_public` (boolean, optional): 공개 여부
- `is_main` (boolean, optional): 메인 버전 여부

**처리 로직**
1. `is_main`을 true로 변경하는 경우, 기존 메인 버전의 `is_main`을 false로 변경
2. Version 노드 업데이트

**출력**
- `version_id` (UUID): 업데이트된 Version ID

#### VER-002: 페이지 생성 및 관리

**기능 개요**
페이지를 생성하고 Document와 연결하는 기능

**상세 명세**

##### 3.1.8.1. 페이지 생성

**입력**
- `slug` (string, required): URL 경로
- `title` (string, required): 페이지 제목
- `version_id` (UUID, required): 버전 ID
- `parent_page_id` (UUID, optional): 부모 페이지 ID
- `order` (integer, optional): 정렬 순서
- `visible` (boolean, optional): 네비게이션 노출 여부

**처리 로직**
1. Page 노드 생성
2. `IN_VERSION` 관계 생성 (Page → Version)
3. 부모 페이지가 있는 경우 `CHILD_OF` 관계 생성

**출력**
- `page_id` (UUID): 생성된 Page ID

**예외 처리**
- 동일한 slug가 같은 버전에 이미 존재하는 경우: "이미 존재하는 slug입니다" 에러 반환

**관련 데이터 모델**
- Page Node (GraphDB)
- IN_VERSION Edge (GraphDB)
- CHILD_OF Edge (GraphDB, optional)

##### 3.1.8.2. 페이지-Document 연결

**입력**
- `page_id` (UUID, required): 페이지 ID
- `document_id` (UUID, required): 문서 ID

**처리 로직**
1. `DISPLAYS` 관계 생성 (Page → Document)

**출력**
- `relation_id` (string): 생성된 관계 ID

**관련 데이터 모델**
- DISPLAYS Edge (GraphDB)

#### VER-003: 배포 관리

**기능 개요**
버전을 공개하고 배포하는 기능

**상세 명세**

**입력**
- `version_id` (UUID, required): 배포할 버전 ID
- `is_public` (boolean, required): 공개 여부

**처리 로직**
1. Version 노드의 `is_public` 업데이트
2. 해당 버전의 모든 Page와 Document 조회
3. `status`가 "publish"인 Document만 공개

**출력**
- `version_id` (UUID): 배포된 버전 ID
- `published_pages` (array<UUID>): 공개된 페이지 목록

### 3.2. Phase 2: AI 기능 (AI Features)

#### AI-001: AI 문서 작성 보조

**기능 개요**
AI가 문서 작성 과정에서 구조, 내용, 자동완성을 제안하는 기능

**상세 명세**

##### 3.2.1.1. 문서 아웃라인 제안

**입력**
- `document_type` (enum, required): 문서 타입
- `title` (string, required): 문서 제목
- `existing_documents` (array<UUID>, optional): 참고할 기존 문서 목록

**처리 로직**
1. 문서 타입과 제목을 기반으로 AI가 아웃라인 생성
2. 기존 유사 문서 분석하여 섹션 구조 제안
3. 각 섹션에 대한 간단한 설명 제공

**출력**
- `outline` (array<object>): 제안된 아웃라인
  - `section_title` (string): 섹션 제목
  - `section_description` (string): 섹션 설명
  - `order` (integer): 섹션 순서

**예외 처리**
- AI 서비스 오류 시: "아웃라인 생성에 실패했습니다" 에러 반환

##### 3.2.1.2. 섹션 내용 제안

**입력**
- `document_id` (UUID, required): 문서 ID
- `section_title` (string, required): 섹션 제목
- `context` (string, optional): 현재 작성 중인 내용

**처리 로직**
1. 문서의 기존 내용과 섹션 제목을 분석
2. 유사한 기존 문서의 해당 섹션 참고
3. AI가 문맥에 맞는 섹션 내용 생성

**출력**
- `suggested_content` (string): 제안된 섹션 내용

##### 3.2.1.3. 자동완성 (Placeholder 추천)

**입력**
- `document_id` (UUID, required): 문서 ID
- `current_text` (string, required): 현재 입력 중인 텍스트
- `cursor_position` (integer, required): 커서 위치

**처리 로직**
1. 현재 입력 중인 텍스트 분석
2. 기존 문서에서 유사한 패턴 찾기
3. 다음 단어/문장 제안

**출력**
- `suggestions` (array<string>): 자동완성 제안 목록

#### AI-002: AI 용어 추출 및 추천

**기능 개요**
AI가 문서를 분석하여 용어 후보를 추출하고 추천하는 기능

**상세 명세**

**입력**
- `document_id` (UUID, required): 문서 ID
- `existing_documents` (array<UUID>, optional): 참고할 기존 문서 목록

**처리 로직**
1. 문서 내용 분석
2. 기존 Concept와 매칭되지 않는 키워드 추출
3. 유사한 기존 Concept 추천
4. 새 Concept 생성 제안

**출력**
- `suggested_concepts` (array<object>): 추천된 Concept 목록
  - `term` (string): 용어
  - `confidence` (number): 신뢰도 (0-1)
  - `existing_concept_id` (UUID, optional): 기존 Concept ID (매칭된 경우)
  - `suggested_description` (string, optional): 제안된 설명

#### AI-003: AI 문서 품질 검사

**기능 개요**
AI가 문서의 품질을 검사하고 개선 사항을 제안하는 기능

**상세 명세**

**입력**
- `document_id` (UUID, required): 검사할 문서 ID

**처리 로직**
1. **문체/톤 검사**
   - 설정된 톤앤매너 규칙과 비교
   - 일관성 없는 문체 감지
2. **용어 일관성 검사**
   - Glossary에 등록된 용어와 비교
   - 불일치하는 용어 감지
3. **중복 섹션 감지**
   - 다른 문서와 유사한 내용 찾기
   - Block 생성 제안
4. **링크 검사**
   - 내부 링크 깨짐 확인
   - 외부 링크 404 확인
5. **변경 사항 요약**
   - 이전 버전과 비교하여 Diff 생성

**출력**
- `quality_report` (object): 품질 검사 결과
  - `tone_issues` (array<object>): 문체 문제 목록
  - `terminology_issues` (array<object>): 용어 일관성 문제 목록
  - `duplicate_sections` (array<object>): 중복 섹션 목록
  - `broken_links` (array<object>): 깨진 링크 목록
  - `suggestions` (array<object>): 개선 제안 목록

**예외 처리**
- 문서가 존재하지 않는 경우: "문서를 찾을 수 없습니다" 에러 반환

#### DOC-007: 문서 Layer 자동 생성

**기능 개요**
문서를 3개 Layer로 자동 분리하여 생성하는 기능

**상세 명세**

**입력**
- `document_id` (UUID, required): 문서 ID

**처리 로직**
1. **Layer 1: 핵심 개념 키워드 추출**
   - AI가 문서에서 핵심 개념 추출
   - Concept Node와 매핑
   - USES_CONCEPT 관계 생성
2. **Layer 2: 요약문 생성**
   - AI가 문서 요약 생성
   - Document 노드의 `summary` 필드에 저장
3. **Layer 3: 원문 저장**
   - 원문은 RDB에 그대로 저장

**출력**
- `layer1_concepts` (array<UUID>): 추출된 Concept 목록
- `layer2_summary` (string): 생성된 요약문

**관련 데이터 모델**
- Document Node (GraphDB) - summary 필드
- Concept Node (GraphDB)
- USES_CONCEPT Edge (GraphDB)

#### AI-004: AI 채팅 (Admin용)

**기능 개요**
관리자가 문서 작성에 대한 피드백을 받기 위한 AI 채팅 기능

**상세 명세**

**입력**
- `message` (string, required): 사용자 메시지
- `document_id` (UUID, optional): 현재 작업 중인 문서 ID
- `concept_ids` (array<UUID>, optional): 참고할 Concept 목록

**처리 로직**
1. 현재 문서의 Concept, 연결된 Document 조회
2. Graph 기반 컨텍스트 구성
3. AI에게 질문 전달
4. 문서 작성 피드백 제공

**출력**
- `response` (string): AI 응답
- `suggested_actions` (array<object>, optional): 제안된 액션 목록

#### AI-005: AI 채팅 (End User용)

**기능 개요**
사용자가 문서에 대해 질문하고 답변을 받는 기능

**상세 명세**

**입력**
- `message` (string, required): 사용자 질문
- `current_page_id` (UUID, optional): 현재 보고 있는 페이지 ID
- `selected_text` (string, optional): 드래그한 텍스트
- `favorite_page_ids` (array<UUID>, optional): 즐겨찾기 페이지 목록
- `recent_page_ids` (array<UUID>, optional): 최근 본 페이지 목록
- `allow_web_search` (boolean, optional): 온라인 검색 허용 여부

**처리 로직**
1. 컨텍스트 구성
   - 현재 페이지의 Document, Concept 조회
   - 선택한 텍스트 포함
   - 즐겨찾기, 최근 본 문서 포함
   - 온라인 검색 허용 시 외부 검색 결과 포함
2. Graph 기반 관련 문서 추천
3. AI에게 질문 전달
4. 답변과 함께 관련 문서 링크 제공

**출력**
- `response` (string): AI 답변
- `related_documents` (array<object>): 관련 문서 목록
  - `page_id` (UUID): 페이지 ID
  - `title` (string): 문서 제목
  - `relevance_score` (number): 관련도 점수

**예외 처리**
- publish된 문서만 컨텍스트로 사용 가능

#### AI-006: AI 문서 추천

**기능 개요**
사용자에게 맞는 문서를 추천하는 기능

**상세 명세**

**입력**
- `user_id` (UUID, optional): 사용자 ID
- `current_page_id` (UUID, optional): 현재 페이지 ID
- `tags` (array<string>, optional): 태그 필터
- `user_level` (string, optional): 사용자 레벨 ("beginner", "intermediate", "advanced")

**처리 로직**
1. 온톨로지 기반 개념 유사도 계산
2. 태그 기반 필터링
3. 사용자 레벨에 맞는 문서 우선순위 조정
4. Graph weight 기반 다음 문서 추천

**출력**
- `recommended_pages` (array<object>): 추천 문서 목록
  - `page_id` (UUID): 페이지 ID
  - `title` (string): 문서 제목
  - `summary` (string): 문서 요약
  - `relevance_score` (number): 관련도 점수
  - `reason` (string): 추천 이유

#### SEARCH-001: 문서 검색

**기능 개요**
제목, 본문, 태그, Concept 기반으로 문서를 검색하는 기능

**상세 명세**

**입력**
- `query` (string, required): 검색어
- `version_id` (UUID, optional): 버전 필터
- `tags` (array<string>, optional): 태그 필터
- `limit` (integer, optional): 결과 개수 제한 (기본값: 20)

**처리 로직**
1. 검색어를 제목, 본문, 태그, Concept에서 검색
2. 관련도 점수 계산
3. publish된 문서만 반환
4. 관련도 순으로 정렬

**출력**
- `results` (array<object>): 검색 결과
  - `page_id` (UUID): 페이지 ID
  - `title` (string): 문서 제목
  - `summary` (string): 문서 요약
  - `relevance_score` (number): 관련도 점수
  - `matched_fields` (array<string>): 매칭된 필드 목록

#### SEARCH-002: 문서 네비게이션

**기능 개요**
페이지 계층 구조를 트리 형태로 보여주는 기능

**상세 명세**

**입력**
- `version_id` (UUID, required): 버전 ID

**처리 로직**
1. 해당 버전의 모든 Page 조회
2. `CHILD_OF` 관계를 기반으로 트리 구조 생성
3. `visible`이 true인 페이지만 표시
4. `order` 기준으로 정렬

**출력**
- `navigation_tree` (array<object>): 네비게이션 트리
  - `page_id` (UUID): 페이지 ID
  - `title` (string): 페이지 제목
  - `slug` (string): URL 경로
  - `children` (array<object>): 자식 페이지 목록

**관련 데이터 모델**
- Page Node (GraphDB)
- CHILD_OF Edge (GraphDB)

#### UX-001: 문서 열람

**기능 개요**
사용자가 문서를 열람하는 기능

**상세 명세**

**입력**
- `page_id` (UUID, required): 페이지 ID
- `version_id` (UUID, optional): 버전 ID

**처리 로직**
1. Page 노드 조회
2. `DISPLAYS` 관계로 연결된 Document 조회
3. Document의 `storage_key`로 본문 조회 (RDB)
4. Markdown 또는 OAS 렌더링
5. 첨부 파일 조회 및 표시
6. 사용자 조회 기록 저장 (최근 본 문서)

**출력**
- `page` (object): 페이지 정보
  - `page_id` (UUID): 페이지 ID
  - `title` (string): 페이지 제목
  - `document` (object): 문서 정보
    - `document_id` (UUID): 문서 ID
    - `content` (string): 렌더링된 문서 내용
    - `type` (string): 문서 타입
    - `attachments` (array<object>): 첨부 파일 목록

**예외 처리**
- 페이지가 존재하지 않는 경우: "페이지를 찾을 수 없습니다" 에러 반환
- publish되지 않은 문서인 경우: "접근할 수 없는 문서입니다" 에러 반환

**관련 데이터 모델**
- Page Node (GraphDB)
- Document Node (GraphDB)
- DISPLAYS Edge (GraphDB)
- Document Content (RDB)
- Attachment Node (GraphDB)

#### UX-002: API Try It 기능

**기능 개요**
API 문서에서 직접 API를 호출해볼 수 있는 기능

**상세 명세**

**입력**
- `page_id` (UUID, required): API 문서 페이지 ID
- `request_params` (object, required): API 요청 파라미터

**처리 로직**
1. Page의 Document 조회
2. OAS 파일 파싱
3. 요청 파라미터 검증
4. API 호출 실행
5. 응답 반환

**출력**
- `response` (object): API 응답
  - `status_code` (integer): HTTP 상태 코드
  - `headers` (object): 응답 헤더
  - `body` (object): 응답 본문

**예외 처리**
- API 문서가 아닌 경우: "API 문서가 아닙니다" 에러 반환
- 요청 파라미터 검증 실패: "잘못된 요청 파라미터입니다" 에러 반환
- API 호출 실패: "API 호출에 실패했습니다" 에러 반환

#### UX-003: 즐겨찾기

**기능 개요**
사용자가 원하는 페이지를 즐겨찾기로 등록하는 기능

**상세 명세**

##### 3.1.9.1. 즐겨찾기 추가

**입력**
- `user_id` (UUID, required): 사용자 ID
- `page_id` (UUID, required): 페이지 ID

**처리 로직**
1. RDB에 즐겨찾기 레코드 생성

**출력**
- `favorite_id` (UUID): 생성된 즐겨찾기 ID

**예외 처리**
- 이미 즐겨찾기에 등록된 경우: "이미 즐겨찾기에 등록되어 있습니다" 경고

**관련 데이터 모델**
- Favorites (RDB)

##### 3.1.9.2. 즐겨찾기 목록 조회

**입력**
- `user_id` (UUID, required): 사용자 ID

**출력**
- `favorites` (array<object>): 즐겨찾기 목록
  - `page_id` (UUID): 페이지 ID
  - `title` (string): 페이지 제목
  - `added_at` (datetime): 추가 시각

#### UX-004: 최근 본 문서

**기능 개요**
사용자가 최근에 본 문서 목록을 조회하는 기능

**상세 명세**

**입력**
- `user_id` (UUID, required): 사용자 ID
- `limit` (integer, optional): 조회 개수 제한 (기본값: 10)

**처리 로직**
1. RDB에서 최근 조회 기록 조회
2. 최대 10개만 반환

**출력**
- `recent_pages` (array<object>): 최근 본 문서 목록
  - `page_id` (UUID): 페이지 ID
  - `title` (string): 페이지 제목
  - `viewed_at` (datetime): 조회 시각

**관련 데이터 모델**
- Page Views (RDB)

#### UX-005: 문서 피드백

**기능 개요**
사용자가 문서에 대한 피드백을 제출하는 기능

**상세 명세**

##### 3.1.10.1. 피드백 제출

**입력**
- `page_id` (UUID, required): 페이지 ID
- `feedback_type` (enum, required): 피드백 타입 ("helpful" | "not_helpful" | "error")
- `message` (string, optional): 피드백 메시지

**처리 로직**
1. RDB에 피드백 레코드 저장

**출력**
- `feedback_id` (UUID): 생성된 피드백 ID

**관련 데이터 모델**
- Feedbacks (RDB)

##### 3.1.10.2. 오류 신고

**입력**
- `page_id` (UUID, required): 페이지 ID
- `error_type` (enum, required): 오류 타입 ("typo" | "schema_error" | "example_error")
- `description` (string, required): 오류 설명

**처리 로직**
1. RDB에 오류 신고 레코드 저장

**출력**
- `report_id` (UUID): 생성된 신고 ID

**관련 데이터 모델**
- Error Reports (RDB)

### 3.3. Phase 3: 협업 및 워크플로우 (Collaboration & Workflow)

#### TEAM-001: 팀 관리

**기능 개요**
팀을 생성하고 팀원을 관리하는 기능

**상세 명세**

**입력**
- `team_name` (string, required): 팀 이름
- `member_emails` (array<string>, required): 팀원 이메일 목록

**처리 로직**
1. RDB에 팀 레코드 생성
2. 팀원 초대 (회원가입 필요)
3. 권한 설정

**출력**
- `team_id` (UUID): 생성된 팀 ID

**관련 데이터 모델**
- Teams (RDB)
- Team Members (RDB)

#### TEAM-002: 워크플로우 관리

**기능 개요**
문서의 상태를 관리하고 워크플로우를 진행하는 기능

**상세 명세**

##### 3.3.2.1. 리뷰 요청

**입력**
- `document_id` (UUID, required): 문서 ID
- `reviewer_ids` (array<UUID>, required): 리뷰어 ID 목록

**처리 로직**
1. Document의 `status`를 "in_review"로 변경
2. 리뷰어에게 알림 전송

**출력**
- `review_request_id` (UUID): 생성된 리뷰 요청 ID

##### 3.3.2.2. 리뷰 승인/거부

**입력**
- `review_request_id` (UUID, required): 리뷰 요청 ID
- `action` (enum, required): 액션 ("approve" | "reject")
- `comment` (string, optional): 리뷰 코멘트

**처리 로직**
1. 모든 리뷰어의 승인 여부 확인
2. 모두 승인 시 `status`를 "done"으로 변경
3. 거부 시 `status`를 "draft"로 변경

**출력**
- `document_status` (string): 변경된 문서 상태

#### TEAM-003: 리뷰 시스템

**참고**: TEAM-002의 리뷰 요청/승인 기능과 통합

### 3.4. Phase 4: 고급 기능 (Advanced Features)

#### SEO-001: SEO 메타데이터 관리

**기능 개요**
페이지의 SEO 메타데이터를 관리하는 기능

**상세 명세**

**입력**
- `page_id` (UUID, required): 페이지 ID
- `locale` (string, required): 로케일 코드
- `seo_properties` (object, required): SEO 속성
  - `meta_title` (string, optional)
  - `meta_description` (string, optional)
  - `og_title` (string, optional)
  - `og_description` (string, optional)
  - 등등...

**처리 로직**
1. SEOProperties 노드 생성 또는 업데이트
2. `HAS_SEO` 관계 생성 (Page → SEOProperties)

**출력**
- `seo_properties_id` (UUID): 생성된 SEO 속성 ID

**관련 데이터 모델**
- SEOProperties Node (GraphDB)
- HAS_SEO Edge (GraphDB)

#### SEO-002: SEO 자동 생성

**기능 개요**
페이지와 연결된 Concept를 이용하여 SEO 메타데이터를 자동 생성

**상세 명세**

**입력**
- `page_id` (UUID, required): 페이지 ID
- `locale` (string, required): 로케일 코드

**처리 로직**
1. Page의 Document 조회
2. Document와 연결된 Concept 조회
3. AI가 Concept 기반으로 SEO 메타데이터 생성
4. SEOProperties 노드 생성

**출력**
- `seo_properties_id` (UUID): 생성된 SEO 속성 ID

#### I18N-001: 번역 관리

**기능 개요**
문서를 다른 언어로 번역하고 관리하는 기능

**상세 명세**

**입력**
- `source_document_id` (UUID, required): 원문 문서 ID
- `target_lang` (string, required): 대상 언어 코드
- `use_ai_translation` (boolean, optional): AI 번역 사용 여부

**처리 로직**
1. AI 번역 사용 시: AI가 번역본 생성
2. 새 Document 노드 생성 (target_lang)
3. `TRANSLATION_OF` 관계 생성

**출력**
- `translated_document_id` (UUID): 생성된 번역 문서 ID

**관련 데이터 모델**
- Document Node (GraphDB)
- TRANSLATION_OF Edge (GraphDB)

#### I18N-002: AI 번역 생성

**참고**: I18N-001에 포함

#### I18N-003: 다국어 지원 UI

**기능 개요**
사용자 인터페이스의 다국어 지원 기능

**상세 명세**

**입력**
- `locale` (string, required): 언어 코드

**처리 로직**
1. 사용자가 선택한 언어로 UI 텍스트 변경
2. 해당 언어의 문서 우선 표시

**출력**
- `ui_locale` (string): 적용된 언어 코드

#### DOC-201: 문서 간 콘텐츠 블록 재사용

**기능 개요**
문서 내 일부 섹션을 여러 문서에서 재사용할 수 있는 기능

**상세 명세**

**입력**
- `block_content` (string, required): 블록 내용
- `block_type` (enum, required): 블록 타입 ("paragraph" | "code" | "section")
- `source_document_id` (UUID, required): 원본 문서 ID

**처리 로직**
1. Block 노드 생성
2. `USED_IN` 관계 생성 (Block → Document)
3. 여러 Document에서 동일 Block 참조 가능

**출력**
- `block_id` (UUID): 생성된 Block ID

**관련 데이터 모델**
- Block Node (GraphDB)
- USED_IN Edge (GraphDB)

#### DOC-202: 톤앤매너 관리 기능

**기능 개요**
문서의 문체, 톤앤매너를 통일하고 검사하는 기능

**상세 명세**

**입력**
- `document_id` (UUID, required): 검사할 문서 ID
- `tone_rules` (object, optional): 톤앤매너 규칙

**처리 로직**
1. 문서 내용 분석
2. 설정된 톤앤매너 규칙과 비교
3. 일관성 없는 부분 감지
4. 수정안 제시

**출력**
- `tone_issues` (array<object>): 톤앤매너 문제 목록
  - `location` (string): 문제 위치
  - `issue_type` (string): 문제 타입
  - `suggestion` (string): 수정 제안


#### METRICS-001: 페이지 뷰 수 통계

**기능 개요**
페이지 조회 수를 통계로 제공하는 기능

**상세 명세**

**입력**
- `page_id` (UUID, optional): 페이지 ID (없으면 전체)
- `version_id` (UUID, optional): 버전 필터
- `start_date` (date, optional): 시작 날짜
- `end_date` (date, optional): 종료 날짜

**처리 로직**
1. RDB에서 조회 기록 집계
2. 통계 데이터 반환

**출력**
- `statistics` (object): 통계 데이터
  - `total_views` (integer): 총 조회 수
  - `unique_visitors` (integer): 고유 방문자 수
  - `average_time` (number): 평균 체류 시간
  - `bounce_rate` (number): 이탈률

**관련 데이터 모델**
- Page Views (RDB)

#### SITE-001: 사이트 전역 설정

**기능 개요**
사이트의 전역 설정을 관리하는 기능

**상세 명세**

**입력**
- `default_version_id` (UUID, optional): 기본 버전 ID
- `site_name` (string, optional): 사이트 이름
- `site_description` (string, optional): 사이트 설명

**처리 로직**
1. RDB에 사이트 설정 저장

**출력**
- `settings` (object): 저장된 설정

**관련 데이터 모델**
- Site Settings (RDB)

#### SITE-002: 네비게이션/GNB 구성

**기능 개요**
사이트의 네비게이션 메뉴를 구성하는 기능

**상세 명세**

**입력**
- `menu_structure` (array<object>, required): 메뉴 구조
  - `menu_name` (string): 메뉴 이름
  - `page_ids` (array<UUID>): 연결된 페이지 ID 목록
  - `order` (integer): 정렬 순서

**처리 로직**
1. RDB에 메뉴 구조 저장

**출력**
- `menu_id` (UUID): 생성된 메뉴 ID

**관련 데이터 모델**
- Navigation Menus (RDB)

---

## 4. 사용자 시나리오

### 4.1. 관리자 시나리오

#### 시나리오 1: 새 문서 작성 및 배포

1. 관리자가 관리자 워크스페이스에 접속
2. 현재 버전 선택 (또는 새 버전 생성)
3. "새 문서 작성" 선택
4. 문서 기본 정보 입력 (제목, 타입, 태그)
5. AI가 문서 아웃라인 제안 → 사용자가 수정/승인
6. 본문 작성 (AI 섹션 제안 및 자동완성 활용)
7. 이미지 첨부 → Attachment 노드 자동 생성
8. 초기 저장 → Document 노드 생성 (status: "draft")
9. AI가 용어 후보 추출 및 Concept 추천
10. 사용자가 Concept 연결 승인
11. 문서 품질 검사 실행 → 문제 수정
12. 페이지 생성 및 Document 연결
13. 리뷰 요청 → 상태 변경 (in_review)
14. 리뷰어 승인 → 상태 변경 (done)
15. 배포 → 상태 변경 (publish)

#### 시나리오 2: 용어집 기반 일괄 수정

1. 관리자가 용어집 관리 화면 접속
2. 기존 Concept 선택 또는 새 Concept 생성
3. Concept의 정의 수정
4. 시스템이 해당 Concept를 사용하는 모든 Document 자동 조회
5. 영향받는 문서 목록 표시 (그래프 뷰)
6. 각 문서의 해당 용어 정의 부분 자동 업데이트
7. 변경 사항 확인 및 승인

#### 시나리오 3: publish된 문서 수정

1. 관리자가 publish된 문서 선택
2. 수정 시작 → Working Copy 자동 생성
3. Working Copy에서 내용 수정
4. 수정 완료 후 리뷰 요청
5. 리뷰어 승인
6. "배포 문서에 반영하기" 선택
7. 원본 Document에 병합
8. Working Copy 삭제 또는 보관

### 4.2. 사용자 시나리오

#### 시나리오 1: 문서 검색 및 열람

1. 사용자가 문서 포털 접속
2. 버전 선택 (기본: 메인 버전)
3. 검색창에서 키워드 입력
4. 검색 결과 목록 확인
5. 문서 선택 → 문서 상세 페이지 열람
6. Markdown 렌더링된 문서 확인
7. 관련 문서 추천 확인

#### 시나리오 2: AI 채팅을 통한 질문

1. 사용자가 문서를 읽는 중
2. AI 채팅창 열기
3. 현재 문서가 자동으로 컨텍스트로 주입됨
4. 질문 입력
5. AI가 문서와 Graph 기반으로 답변 제공
6. 관련 문서 링크 확인
7. 추가 질문 계속 진행

#### 시나리오 3: API 문서에서 Try It 사용

1. 사용자가 API 문서 페이지 접속
2. "Try It" 버튼 클릭
3. API 요청 파라미터 입력
4. "실행" 버튼 클릭
5. API 호출 결과 확인
6. 응답 데이터 확인

---

## 5. 기술 요구사항

### 5.1. 데이터베이스 구조

#### 5.1.1. GraphDB (Neo4j 권장)

**노드 타입**
- Version Node
- Page Node
- Document Node
- Attachment Node
- Concept Node
- Tag Node
- Block Node (Phase 4)
- SEOProperties Node (Phase 4)

**엣지 타입**
- IN_VERSION: Page → Version
- DISPLAYS: Page → Document
- CHILD_OF: Page → Page
- HAS_TAG: Page/Document/Concept → Tag
- USES_CONCEPT: Document → Concept
- HAS_ATTACHMENT: Document → Attachment
- LINKS_TO: Document → Document
- WORKING_COPY_OF: Document → Document
- TRANSLATION_OF: Document → Document (Phase 4)
- SYNONYM_OF: Concept → Concept
- IS_A: Concept → Concept
- PART_OF: Concept → Concept
- HAS_SEO: Page → SEOProperties (Phase 4)
- USED_IN: Block → Document (Phase 4)
- COPIED_FROM: Block → Block (Phase 4)

**상세 스키마**: `graphDB_draft.md` 참조

#### 5.1.2. RDB (PostgreSQL 권장)

**주요 테이블**
- `documents`: Document 본문 저장
  - `id` (UUID, PK)
  - `document_id` (UUID, FK → GraphDB Document Node)
  - `content` (TEXT): 문서 본문
  - `storage_key` (STRING): 파일 저장 위치
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

- `favorites`: 사용자 즐겨찾기
  - `id` (UUID, PK)
  - `user_id` (UUID)
  - `page_id` (UUID)
  - `created_at` (TIMESTAMP)

- `page_views`: 페이지 조회 기록
  - `id` (UUID, PK)
  - `user_id` (UUID, nullable)
  - `page_id` (UUID)
  - `viewed_at` (TIMESTAMP)

- `feedbacks`: 문서 피드백
  - `id` (UUID, PK)
  - `page_id` (UUID)
  - `user_id` (UUID, nullable)
  - `feedback_type` (ENUM)
  - `message` (TEXT, nullable)
  - `created_at` (TIMESTAMP)

- `error_reports`: 오류 신고
  - `id` (UUID, PK)
  - `page_id` (UUID)
  - `user_id` (UUID, nullable)
  - `error_type` (ENUM)
  - `description` (TEXT)
  - `created_at` (TIMESTAMP)

- `teams`: 팀 정보 (Phase 3)
- `team_members`: 팀원 정보 (Phase 3)
- `site_settings`: 사이트 전역 설정 (Phase 4)
- `navigation_menus`: 네비게이션 메뉴 (Phase 4)

### 5.2. API 요구사항

#### 5.2.1. REST API 구조

**Base URL**: `/api/v1`

**인증**: JWT 토큰 기반 인증

**주요 엔드포인트**

**문서 관리**
- `POST /documents`: 문서 생성
- `GET /documents/{id}`: 문서 조회
- `PUT /documents/{id}`: 문서 수정
- `DELETE /documents/{id}`: 문서 삭제
- `POST /documents/{id}/working-copy`: Working Copy 생성
- `POST /documents/{id}/merge`: Working Copy 병합
- `POST /documents/import`: 문서 Import

**용어집 관리**
- `POST /concepts`: Concept 생성
- `GET /concepts/{id}`: Concept 조회
- `PUT /concepts/{id}`: Concept 수정
- `POST /concepts/{id}/synonyms`: 동의어 연결
- `GET /documents/{id}/suggested-concepts`: 용어 추천

**버전/페이지 관리**
- `POST /versions`: 버전 생성
- `GET /versions`: 버전 목록 조회
- `PUT /versions/{id}`: 버전 수정
- `POST /pages`: 페이지 생성
- `GET /pages/{id}`: 페이지 조회
- `PUT /pages/{id}`: 페이지 수정
- `POST /pages/{id}/documents`: 페이지-Document 연결

**AI 기능**
- `POST /ai/outline`: 문서 아웃라인 제안
- `POST /ai/suggest-section`: 섹션 내용 제안
- `POST /ai/autocomplete`: 자동완성
- `POST /ai/quality-check`: 문서 품질 검사
- `POST /ai/chat`: AI 채팅

**검색/탐색**
- `GET /search`: 문서 검색
- `GET /versions/{id}/navigation`: 네비게이션 트리 조회
- `GET /pages/{id}/recommendations`: 문서 추천

**사용자 인터랙션**
- `GET /pages/{id}`: 문서 열람
- `POST /pages/{id}/try-api`: API Try It
- `POST /favorites`: 즐겨찾기 추가
- `GET /favorites`: 즐겨찾기 목록
- `GET /recent-pages`: 최근 본 문서
- `POST /feedbacks`: 피드백 제출
- `POST /error-reports`: 오류 신고

### 5.3. AI/ML 요구사항

#### 5.3.1. AI 모델 요구사항

**문서 생성/보조**
- LLM 모델 (GPT-4, Claude 등)
- 문서 아웃라인 생성
- 섹션 내용 제안
- 자동완성

**용어 추출**
- NER (Named Entity Recognition) 모델
- 키워드 추출
- Concept 매칭

**문서 품질 검사**
- 문체 분석 모델
- 용어 일관성 검사
- 중복 섹션 감지

**문서 요약**
- 요약 생성 모델
- Layer 2 요약 생성

**AI 채팅**
- LLM 모델 (컨텍스트 기반)
- Graph 기반 컨텍스트 활용
- 관련 문서 추천

**번역 (Phase 4)**
- 번역 모델 (다국어 지원)

#### 5.3.2. AI 서비스 통합

- OpenAI API
- Anthropic Claude API
- 또는 자체 호스팅 모델

### 5.4. 파일 저장소

**요구사항**
- S3 호환 스토리지 (AWS S3, MinIO 등)
- 문서 본문 저장 (.md, .yaml)
- 첨부 파일 저장 (이미지, 동영상 등)

**저장 구조**
```
/{team_id}/
  /documents/
    /{document_id}/
      content.md (또는 spec.yaml)
  /attachments/
    /{attachment_id}/
      {filename}
```

### 5.5. 프론트엔드 요구사항

**기술 스택 제안**
- React / Next.js
- TypeScript
- GraphQL 또는 REST API 클라이언트
- Markdown 렌더링 라이브러리 (react-markdown)
- 그래프 시각화 라이브러리 (vis.js, cytoscape.js 등)
- OAS 렌더링 라이브러리

**주요 컴포넌트**
- 문서 에디터 (Markdown, OAS)
- 그래프 뷰어
- AI 채팅 인터페이스
- API Try It 인터페이스
- 네비게이션 트리

### 5.6. 성능 요구사항

- 문서 검색 응답 시간: < 500ms
- AI 응답 시간: < 5초
- 페이지 로딩 시간: < 2초
- 그래프 뷰 렌더링: < 1초 (노드 100개 기준)

### 5.7. 보안 요구사항

- JWT 기반 인증
- RBAC (Role-Based Access Control)
- 문서 접근 권한 관리
- API Rate Limiting
- 파일 업로드 검증 및 바이러스 스캔

---

## 부록

### A. 용어 정의

- **Document**: 실제 문서 콘텐츠를 담는 단위
- **Page**: URL, 메뉴 구조를 나타내는 단위
- **Version**: 페이지 세트를 묶는 버전 단위
- **Concept**: 용어/개념을 정의하는 단위 (Glossary)
- **Working Copy**: publish된 문서를 수정하기 위한 작업용 복사본
- **Layer**: 문서를 3단계로 분리한 구조 (키워드, 요약, 원문)

### B. 참고 문서

- `service_overview_draft.md`: 서비스 개요
- `features_draft.md`: 상세 기능 설명
- `graphDB_draft.md`: GraphDB 스키마 정의

### C. 변경 이력

- 2025-01-XX: 초안 작성

