## 1. Node

- **노드 종류**
    1. **Version Node**
        1. 페이지 세트를 묶는 단위 (e.g. `v1.2.21`, `v2.0.1`, …)
        2. 버전 단위로 릴리즈 여부 결정
    2. **Page Node**
        1. URL, 메뉴, 계층 구조를 나타내는 단위 (e.g. `/getting-started`, `/ethereum-quickstart`, …)
        2. 페이지에서 Document를 보여줄지 결정 (하나의 Document가 여러 페이지에 연결될 수도 있음)
    3. **Document Node**
        1. 문서에 대한 메타데이터를 저장하고 있는 단위
        2. 문서의 원본은 다른 형식(.md, .yaml 등)으로 저장
    4. **Attachment Node**
        1. 컨텐츠에 첨부되는 이미지, 동영상 등의 리소스
    5. **Concept Node**
        1. 문서 내에서 사용되는 키워드를 정의하는 단위 (e.g. `Nodit`, `EVM`, `API Key`, …)
        2. 문서와의 연결, 동의어/번역 관계를 통해 지식 그래프와 SEO, AI context에 활용
    6. **Tag Node**
        1. 운영/추천용 그룹 라벨 (e.g. `#Beginner`, `#LLM`, `#2025Hackathon`, …)
        2. Document, Page, Concept를 묶어서 랜딩 추천, 타깃별 문서 묶음 등에 사용
    7. **Block Node** `TBD`
        1. 문서 안에서 재사용되는 섹션/단락/코드 블록 단위
        2. 여러 문서에서 공통으로 사용되는 컨텐츠 블록을 관리하고, 복제/동기화를 제어하기 위한 노드
    8. **SEO Node** `TBD`
        1. Page의 SEO 관련 메타데이터를 관리하는 노드
        2. Page에 대해 로케일별로 여러 SEO 노드가 존재할 수 있음
            
            (e.g. `(p:Page)-[:HAS_SEO]->(s_ko:SEOProperties {locale:"ko-KR"})`, `(p)-[:HAS_SEO]->(s_en:SEOProperties {locale:"en-US"})`)
            

### 1-1. Version Node

| **Property** | **Type** | **Required** | **Default** | **Description** |
| --- | --- | --- | --- | --- |
| **id** | string | ✅ |  | Version 고유 ID (UUID, unique) |
| **version** | string | ✅ |  | 버전 식별자 (예: "v1.0.1", "v1.0.2") – URL /v1/... 에 사용 |
| **name** | string | ✅ |  | 표시용 이름 (예: "Version 1", "2025 Q1 Release") |
| **description** | string | ❌ |  | version의 간단한 설명 (예: webhook 기능 추가 반영) |
| **is_public** | boolean | ✅ |  | 외부에서 직접 접근 가능한 버전인지 (/v1/... 허용 여부) |
| **is_main** | boolean | ✅ | false | /latest/...가 이 버전을 가리키는지 여부 (팀당 하나만 true) |
| **created_at** | datetime | ✅ | datetime() | 생성 시각 |
| **updated_at** | datetime | ✅ | datetime() | 최종 수정 시각 |

### 1-2. Page Node

| **Property** | **Type** | **Required** | **Default** | **Description** |
| --- | --- | --- | --- | --- |
| **id** | string | ✅ |  | Page 고유 ID (UUID, unique) |
| **slug** | string | ✅ |  | URL의 마지막 경로 (예: "getting-started" → /v1/getting-started)  |
| **title** | string | ✅ |  | 페이지/네비게이션 제목 |
| **order** | integer | ❌ | 0 | 같은 부모 Page 아래에서의 정렬 순서
(같은 order라면 createAt 순서로 desc) |
| **visible** | boolean | ❌ | false | 네비/목차에 노출 여부 |
| **created_at** | datetime | ✅ | datetime() | 생성 시각 |
| **updated_at** | datetime | ✅ | datetime() | 최종 수정 시각 |

### 1-3. Document Node

| **Property** | **Type** | **Required** | **Default** | **Description** |
| --- | --- | --- | --- | --- |
| **id** | string | ✅ |  | Document 고유 ID (UUID, unique) |
| **type** | string | ✅ |  | 문서 타입: "api" | "general" | "tutorial" |
| **status** | string | ✅ | draft | 워크플로우 상태: "draft" | "in_review" | "done" | "publish" |
| **title** | string | ✅ |  | 문서 제목 |
| **lang** | string | ✅ |  | 언어 코드 ("ko", "en" 등) |
| **storage_key** | string | ✅ |  | 실제 파일 위치 (예: S3 경로, .md 또는 .yaml) |
| **summary** | string | ❌ |  | 문서 요약(옵션, AI가 생성해둘 수 있는 한두 문장) |
| **created_at** | datetime | ✅ | datetime() | 생성 시각 |
| **updated_at** | datetime | ✅ | datetime() | 최종 수정 시각 |

### 1-4. Attachment Node

| **Property** | **Type** | **Required** | **Default** | **Description** |
| --- | --- | --- | --- | --- |
| **id** | string | ✅ |  | Attachment 고유 ID (UUID, unique) |
| **type** | string | ✅ |  | "image" | "video" | "file" 등 |
| **url** | string | ✅ |  | 파일 실제 URL/CDN 경로 |
| **mimeType** | string | ✅ |  | MIME 타입 (예: "image/png", "video/mp4") |
| **altText** | string | ✅ | datetime() | 대체 텍스트(SEO/접근성용, AI가 초안 생성 가능) |
| **created_at** | datetime | ✅ | datetime() | 생성 시각 |
| **updated_at** | datetime | ✅ | datetime() | 최종 수정 시각 |

### 1-5. **Concept Node (Glossary)**

| **Property** | **Type** | **Required** | **Default** | **Description** |
| --- | --- | --- | --- | --- |
| **id** | string | ✅ |  | Concept 고유 ID (UUID, unique) |
| **term** | string | ✅ |  | 용어 텍스트 (예: "access token", "액세스 토큰") |
| **category** | string | ❌ |  | 용어 카테고리 (예: "api", "domain", "ui" – 옵션) |
| **lang** | string | ✅ |  | 언어 코드 ("ko", "en" 등) |
| **description** | string | ✅ |  | 용어 정의/설명 |
| **created_at** | datetime | ✅ | datetime() | 생성 시각 |
| **updated_at** | datetime | ✅ | datetime() | 최종 수정 시각 |

### 1-6. Tag Node

| **Property** | **Type** | **Required** | **Default** | **Description** |
| --- | --- | --- | --- | --- |
| **id** | string | ✅ |  | Tag 고유 ID (UUID, unique) |
| **key** | string | ✅ |  | 태그 키 (예: "beginner", "llm", "campaign-2025") |
| **label** | string | ❌ |  | 화면에 보여줄 이름 (예: "Beginner", "LLM 관련") |
| **kind** | string | ❌ |  | "audience" | "topic" | "campaign" 등 |
| **description** | string | ❌ |  | 태그 설명 |
| **created_at** | datetime | ✅ | datetime() | 생성 시각 |
| **updated_at** | datetime | ✅ | datetime() | 최종 수정 시각 |

### 1-7. Block Node (재사용 컨텐츠 블록) `TBD`

| **Property** | **Type** | **Required** | **Default** | **Description** |
| --- | --- | --- | --- | --- |
| **id** | string | ✅ |  | Block 고유 ID (UUID, unique) |
| **type** | string | ✅ |  | "paragraph", "code", "section" 등 블록 타입 |
| **created_at** | datetime | ✅ | datetime() | 생성 시각 |
| **updated_at** | datetime | ✅ | datetime() | 최종 수정 시각 |

## 1-8. SEOProperties Node

| **Property** | **Type** | **Required** | **Default** | **Description** |
| --- | --- | --- | --- | --- |
| **id** | string | ✅ |  | SEOProperties 고유 ID (UUID, unique) |
| **locale** | string | ✅ |  | SEO 적용 대상 로케일 (`"ko-KR"`, `"en-US"` 등 IETF locale 코드) |
| **meta_title** | string | ❌ |  | `<title>` 태그에 사용되는 페이지 제목 |
| **meta_description** | string | ❌ |  | 메타 설명(검색 엔진/미리보기용 설명 텍스트) |
| **canonical_url** | string | ❌ |  | canonical 링크 URL (`<link rel="canonical">`) |
| **robots** | string | ❌ |  | 검색 크롤러 지침 (`"index,noindex,follow,nofollow"` 조합) |
| **og_title** | string | ❌ |  | Open Graph 제목 (`og:title`) |
| **og_description** | string | ❌ |  | Open Graph 설명 (`og:description`) |
| **og_image_url** | string | ❌ |  | Open Graph 이미지 URL (`og:image`) |
| **twitter_card** | string | ❌ |  | Twitter 카드 타입 (`"summary"`, `"summary_large_image"` 등) |
| **twitter_title** | string | ❌ |  | Twitter 공유용 제목 |
| **twitter_description** | string | ❌ |  | Twitter 공유용 설명 |
| **twitter_image_url** | string | ❌ |  | Twitter 카드 이미지 URL |
| **structured_data** | string | ❌ |  | JSON-LD 텍스트 (문자열로 저장, 예: `{ "@context": "<https://schema.org>", ... }`) |
| **last_updated** | datetime | ✅ | `datetime()` | SEO 설정이 마지막으로 갱신된 시각 |

## 2. Edge

| **Relation** | **From** | **To** | **Direction** | **Description** |
| --- | --- | --- | --- | --- |
| **IN_VERSION** | Page | Version | `(:Page)-[:**IN_VERSION**]->(:Version)` | 해당 Page가 어떤 Version에 속하는지 나타냄. 
URL /v1/slug 해석에 사용. |
| **DISPLAYS** | Page | Document | `(:Page)-[:**DISPLAYS**]->(:Document)` | 해당 Page에서 렌더링할 실제 Document를 가리킴. 
하나의 Document가 여러 Page에 연결될 수 있음. |
| **CHILD_OF** | Page | Page | `(:ChildPage)-[:**CHILD_OF**]->(:ParentPage)` | Page 계층 구조(Page / SubPage / …)를 표현. |
| **HAS_TAG** | Page | Tag | `(:Page)-[:**HAS_TAG**]->(:Tag)` | 페이지에 태그를 추가. 
랜딩 컴포넌트, 메뉴 필터링 등에 사용. |
| **HAS_SEO
`TBD`** | Page | SEOProperties | `(:Page)-[:**HAS_SEO**]->(:SEOProperties)` | 특정 Page와 로케일별 SEO 설정(메타 태그, OG/Twitter, 구조화 데이터)을 가진 SEOProperties 노드를 연결. 한 Page가 여러 로케일의 SEOProperties를 가질 수 있음. |
| **USES_CONCEPT** | Document | Concept | `(:Document)-[:**USES_CONCEPT**]->(:Concept)` | 문서에서 해당 용어/개념을 사용하고 있음을 나타냄. 
Glossary, SEO, AI 컨텍스트에 활용. |
| **HAS_ATTACHMENT** | Document | Attachment | `(:Document)-[:**HAS_ATTACHMENT**]->(:Attachment)` | 문서에 첨부된 이미지/영상/파일을 연결. |
| **LINKS_TO** | Document | Document | `(:Document)-[:**LINKS_TO**]->(:Document)` | 문서 본문 내에서 다른 문서로의 하이퍼링크/참조 관계. 
영향도 분석에 활용. |
| **TRANSLATION_OF (Document)
`TBD`** | Document | Document | `(:Document)-[:**TRANSLATION_OF**]->(:Document)` | 번역본 Document와 원문 Document 간 번역 관계(언어가 다름). |
| **WORKING_COPY_OF** | Document | Document | `(:Document)-[:**WORKING_COPY_OF**]->(:Document)` | Publish된 문서를 수정하기 위해 생성된 Working Copy와 원본 Document를 연결. 
WorkingDoc는 draft/in_review/done 상태에서만 사용. |
| **HAS_TAG** | Document | Tag | `(:Document)-[:**HAS_TAG**]->(:Tag)` | 문서에 태그를 추가. 
랜딩 추천, 타깃별 문서 묶음 등에 사용. |
| **HAS_TAG** | Concept | Tag | `(:Concept)-[:**HAS_TAG**]->(:Tag)` | 용어/개념에 태그를 추가. 
Beginner 용어 세트, 캠페인 등으로 묶을 때 사용. |
| **SYNONYM_OF** | Concept | Concept | `(:Concept)-[:**SYNONYM_OF**]->(:Concept)` | 같은 언어 내 동의어 관계. 보통 B를 canonical 개념으로 두고, A를 동의어로 연결 |
| **IS_A** | Concept | Concept | `(:Concept)-[:**IS_A**]->(:Concept)` | 상속 관계(상↔하위) |
| **PART_OF** | Concept | Concept | `(:Concept)-[:**PART_OF**]->(:Concept)` | 구성 요소 관계

예시:
- Authorization Header **PART_OF** HTTP Request
- API Key **PART_OF** Authentication Settings |
| **~~TRANSLATION_OF (Concept)~~
`TBD`** | ~~Concept~~ | ~~Concept~~ | `~~(:Concept)-[:**TRANSLATION_OF**]->(:Concept)~~` | ~~다른 언어의 동일 개념 간 번역 관계 

예시: 
- access token **TRANSLATION_OF** 액세스 토큰~~ |
| **~~RELATED_TO~~** | ~~Concept~~ | ~~Concept~~ | `~~(:Concept)-[:**RELATED_TO**]->(:Concept)~~` | ~~일반적 연관~~
위에서 정의된 관계로 커버 가능 |
| **~~HAS_PROPERTY~~** | ~~Concept~~ | ~~Concept~~ | `~~(:Concept)-[:**HAS_PROPERTY**]->(:Concept)~~` | ~~속성 보유~~
위에서 정의된 관계로 커버 가능 |
| **~~USED_BY~~** | ~~Concept~~ | ~~Concept~~ | `~~(:Concept)-[:**USED_BY**]->(:Concept)~~` | ~~사용 관계~~
위에서 정의된 관계로 커버 가능 |
| **USED_IN
`TBD`** | Block | Document | `(:Block)-[:**USED_IN**]->(:Document)` | 해당 Block이 어떤 Document에서 재사용되는지 나타냄. 
하나의 Block이 여러 문서에서 쓰일 수 있음. |
| **COPIED_FROM
`TBD`** | Block | Block | `(:BlockCopy)-[:**COPIED_FROM**]->(:BlockOriginal)` | 블록 복제/분기 관계. 
원본 Block에서 내용을 복사해 새 Block을 만들었을 때 연결. |