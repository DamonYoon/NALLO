m# 개발 툴 정의 (Development Tools)

## 목차

1. [백엔드 기술 스택](#1-백엔드-기술-스택)
2. [프론트엔드 기술 스택](#2-프론트엔드-기술-스택)
3. [데이터베이스](#3-데이터베이스)
4. [AI/ML 서비스](#4-aiml-서비스)
5. [인프라 및 배포](#5-인프라-및-배포)
6. [개발 도구](#6-개발-도구)
7. [모니터링 및 로깅](#7-모니터링-및-로깅)
8. [보안 도구](#8-보안-도구)

---

## 1. 백엔드 기술 스택

### 1.1. 프로그래밍 언어

**권장: Node.js (TypeScript)**

**선택 이유**
- GraphDB (Neo4j)와의 통합이 용이
- AI API 통합이 간편
- 프론트엔드와 언어 통일로 개발 효율성 향상
- 풍부한 라이브러리 생태계

**대안**
- Python: AI/ML 기능이 많은 경우
- Go: 고성능이 필요한 경우

### 1.2. 백엔드 프레임워크

**권장: NestJS**

**선택 이유**
- TypeScript 네이티브 지원
- 모듈화된 아키텍처 (GraphDB, RDB, AI 서비스 분리 용이)
- 의존성 주입으로 테스트 용이
- GraphQL 및 REST API 동시 지원
- 미들웨어 및 가드 시스템 (인증/인가)

**대안**
- Express.js: 더 가벼운 프레임워크가 필요한 경우
- Fastify: 고성능이 중요한 경우

### 1.3. API 프레임워크

**REST API**
- NestJS 기본 제공
- Swagger/OpenAPI 자동 문서화 (`@nestjs/swagger`)

**GraphQL (선택사항)**
- NestJS GraphQL 모듈 (`@nestjs/graphql`)
- 복잡한 관계 쿼리 최적화

### 1.4. 인증/인가

**JWT 토큰**
- `@nestjs/jwt`: JWT 토큰 생성/검증
- `@nestjs/passport`: 인증 전략 관리

**세션 관리 (선택사항)**
- Redis 기반 세션 스토어

---

## 2. 프론트엔드 기술 스택

### 2.1. 프레임워크

**권장: Next.js 14+ (App Router)**

**선택 이유**
- React 기반 SSR/SSG 지원
- API Routes로 백엔드와 통합 용이
- 파일 기반 라우팅
- 이미지 최적화 내장
- SEO 최적화

**대안**
- Remix: 더 나은 데이터 로딩이 필요한 경우
- Vite + React: SPA가 적합한 경우

### 2.2. 언어

**TypeScript**
- 타입 안정성
- 백엔드와 타입 공유 가능

### 2.3. 상태 관리

**권장: Zustand 또는 Jotai**

**선택 이유**
- 가벼움
- React Query와 함께 사용 가능
- 서버 상태와 클라이언트 상태 분리 용이

**서버 상태**
- TanStack Query (React Query): 서버 데이터 캐싱 및 동기화

**대안**
- Redux Toolkit: 복잡한 상태 관리가 필요한 경우

### 2.4. UI 라이브러리

**권장: shadcn/ui 또는 Radix UI**

**선택 이유**
- 접근성 우수
- 커스터마이징 용이
- 컴포넌트 기반 개발

**스타일링**
- Tailwind CSS: 유틸리티 기반 스타일링
- CSS Modules: 컴포넌트별 스타일 격리

### 2.5. 문서 렌더링

**Markdown 렌더링**
- `react-markdown`: Markdown → React 컴포넌트
- `remark-gfm`: GitHub Flavored Markdown 지원
- `rehype-highlight`: 코드 하이라이팅
- `rehype-raw`: HTML 태그 지원

**OAS 렌더링**
- `@stoplight/elements` 또는 `swagger-ui-react`: OpenAPI 스펙 렌더링

### 2.6. 그래프 시각화

**권장: Neo4j NVL (Neo4j Visualization Library)**

**선택 이유**
- **Neo4j 공식 라이브러리**: GraphDB로 Neo4j를 사용하므로 완벽한 통합
- **React 네이티브**: Next.js와 완벽 호환, React 컴포넌트 제공
- **TypeScript 지원**: 타입 안정성 보장
- **Neo4j 쿼리 직접 활용**: Cypher 쿼리 결과를 바로 시각화 가능
- **Neo4j Bloom 스타일**: Neo4j Bloom과 유사한 시각화 경험
- **인터랙티브 기능**: 호버, 클릭, 드래그, 줌 등 지원
- **커스터마이징**: 노드/엣지 스타일링, 레이아웃 옵션 제공
- **공식 문서 및 예제**: [Neo4j NVL 문서](https://neo4j.com/docs/api/nvl/current/)

**설치 및 사용**
```bash
npm install @neo4j-nvl/react
```

**주요 기능**
- Neo4j 드라이버와 직접 통합
- Cypher 쿼리 결과 자동 시각화
- 노드/엣지 타입별 스타일링
- 필터링 및 검색 기능
- 레이아웃 알고리즘 (force-directed 등)

**대안**
- **Cytoscape.js**: 대용량 노드(수천 개) 처리나 복잡한 레이아웃 알고리즘이 필요한 경우
- **vis-network**: 중간 성능, 간단한 API
- **@nivo/network**: Neo4j를 사용하지 않는 경우
- **D3.js**: 더 세밀한 커스터마이징이 필요한 경우
- **React Flow**: 워크플로우 시각화에 특화

### 2.7. 문서 에디터

**Markdown 에디터**
- `@uiw/react-md-editor`: WYSIWYG Markdown 에디터
- 또는 `CodeMirror` + Markdown 모드: 코드 에디터 스타일

**OAS 에디터**
- `@stoplight/monaco` 또는 `swagger-editor`: YAML 에디터

---

## 3. 데이터베이스

### 3.1. GraphDB

**권장: Neo4j**

**선택 이유**
- 성숙한 생태계
- Cypher 쿼리 언어
- 풍부한 문서화
- 클라우드 호스팅 옵션 (Neo4j Aura)

**클라이언트 라이브러리**
- `neo4j-driver`: 공식 Node.js 드라이버
- `@nestjs/neo4j`: NestJS 통합

**대안**
- Amazon Neptune: AWS 환경인 경우
- ArangoDB: 멀티 모델이 필요한 경우

### 3.2. RDB

**권장: PostgreSQL**

**선택 이유**
- JSON 타입 지원 (유연한 스키마)
- 풍부한 기능 (Full-text search, Array 등)
- 확장성 우수
- 오픈소스

**ORM**
- TypeORM: NestJS와 통합 용이
- Prisma: 타입 안정성과 마이그레이션 관리 우수

**대안**
- MySQL: 더 가벼운 선택이 필요한 경우

### 3.3. 캐싱

**권장: Redis**

**선택 이유**
- 빠른 읽기/쓰기
- 세션 저장소로 활용
- 캐싱 전략 구현
- Pub/Sub 기능 (실시간 알림)

**사용 사례**
- 문서 조회 캐싱
- 검색 결과 캐싱
- 세션 관리
- Rate limiting

---

## 4. AI/ML 서비스

### 4.1. LLM 서비스

**권장: OpenAI API 또는 Anthropic Claude API**

**선택 이유**
- 높은 품질의 응답
- 쉬운 통합
- 다양한 모델 선택

**사용 사례**
- 문서 작성 보조
- 문서 요약 (Layer 2)
- AI 채팅
- 용어 추출 및 추천

**대안**
- 자체 호스팅 모델 (Llama, Mistral 등): 비용 절감이 중요한 경우

### 4.2. 임베딩 모델

**권장: OpenAI Embeddings 또는 Cohere**

**선택 이유**
- 문서 유사도 계산
- 검색 정확도 향상
- 추천 시스템 구축

**사용 사례**
- 문서 유사도 계산
- 검색 결과 관련도 점수 계산
- 문서 추천

### 4.3. NER (Named Entity Recognition)

**권장: spaCy (Python) 또는 OpenAI API**

**선택 이유**
- 용어 추출
- Concept 매칭
- 키워드 자동 태깅

**대안**
- 자체 학습 모델: 도메인 특화가 필요한 경우

---

## 5. 인프라 및 배포

### 5.1. 파일 저장소

**권장: AWS S3 또는 MinIO (자체 호스팅)**

**선택 이유**
- 확장성
- CDN 연동 가능
- 버전 관리 지원

**CDN**
- CloudFront (AWS) 또는 Cloudflare: 정적 파일 배포

### 5.2. 컨테이너화

**권장: Docker**

**선택 이유**
- 개발/프로덕션 환경 일치
- 마이크로서비스 아키텍처 지원
- 배포 자동화 용이

**컨테이너 오케스트레이션**
- Kubernetes: 대규모 배포
- Docker Compose: 개발 환경

### 5.3. 배포 플랫폼

**권장 옵션**

**클라우드**
- AWS: EC2, ECS, Lambda
- Google Cloud Platform: Cloud Run, GKE
- Azure: App Service, AKS

**서버리스**
- Vercel: Next.js 배포 최적화
- AWS Lambda: API 서버리스
- Netlify: 정적 사이트 배포

**대안**
- 자체 서버: 온프레미스 배포

### 5.4. 환경 변수 관리

**권장: AWS Secrets Manager 또는 HashiCorp Vault**

**선택 이유**
- 민감 정보 보안
- 환경별 설정 관리
- 자동 로테이션

---

## 6. 개발 도구

### 6.1. 버전 관리

**Git**
- GitHub 또는 GitLab: 코드 저장소
- Git Flow 또는 GitHub Flow: 브랜치 전략

### 6.2. 코드 품질

**Linting**
- ESLint: JavaScript/TypeScript 린팅
- Prettier: 코드 포맷팅

**타입 체크**
- TypeScript 컴파일러
- `tsc --noEmit`: 빌드 전 타입 체크

### 6.3. 테스팅

**단위 테스트**
- Jest: JavaScript/TypeScript 테스트 프레임워크
- Vitest: 빠른 실행 속도

**통합 테스트**
- Supertest: API 테스트
- Playwright 또는 Cypress: E2E 테스트

**테스트 커버리지**
- `@jest/coverage`: 코드 커버리지 측정

### 6.4. CI/CD

**권장: GitHub Actions 또는 GitLab CI**

**선택 이유**
- 코드 저장소와 통합
- 무료 플랜 제공
- 다양한 액션/템플릿

**파이프라인 단계**
1. 코드 체크아웃
2. 의존성 설치
3. Linting 및 타입 체크
4. 테스트 실행
5. 빌드
6. 배포

**대안**
- Jenkins: 자체 호스팅이 필요한 경우
- CircleCI: 더 복잡한 워크플로우가 필요한 경우

### 6.5. 문서화

**API 문서**
- Swagger/OpenAPI: 자동 생성
- Postman: API 테스트 및 문서화

**코드 문서**
- JSDoc 또는 TSDoc: 코드 주석 기반 문서
- TypeDoc: TypeScript 문서 생성

**프로젝트 문서**
- Markdown: README, 가이드 등

### 6.6. 프로젝트 관리

**이슈 트래킹**
- GitHub Issues 또는 GitLab Issues
- Jira: 더 복잡한 프로젝트 관리

**프로젝트 보드**
- GitHub Projects 또는 GitLab Boards
- Linear: 개발자 친화적 인터페이스

---

## 7. 모니터링 및 로깅

### 7.1. 애플리케이션 모니터링

**권장: Sentry 또는 Datadog**

**선택 이유**
- 에러 추적
- 성능 모니터링
- 사용자 세션 재현

**대안**
- New Relic: 더 상세한 APM이 필요한 경우
- Grafana + Prometheus: 자체 호스팅 모니터링

### 7.2. 로깅

**권장: Winston 또는 Pino**

**선택 이유**
- 구조화된 로깅
- 다양한 로그 레벨
- 로그 집계 용이

**로그 집계**
- ELK Stack (Elasticsearch, Logstash, Kibana)
- CloudWatch (AWS)
- Datadog Logs

### 7.3. 성능 모니터링

**APM (Application Performance Monitoring)**
- New Relic
- Datadog APM
- AWS X-Ray

**프론트엔드 모니터링**
- Vercel Analytics
- Google Analytics
- Hotjar: 사용자 행동 분석

---

## 8. 보안 도구

### 8.1. 의존성 보안

**권장: Snyk 또는 Dependabot**

**선택 이유**
- 취약점 자동 스캔
- 업데이트 제안
- CI/CD 통합

### 8.2. 코드 보안 스캔

**권장: SonarQube 또는 CodeQL**

**선택 이유**
- 보안 취약점 감지
- 코드 품질 분석
- CI/CD 통합

### 8.3. 인증/인가

**JWT**
- `jsonwebtoken`: JWT 생성/검증
- `@nestjs/jwt`: NestJS 통합

**OAuth 2.0 (선택사항)**
- Passport.js: 다양한 인증 전략
- Google OAuth, GitHub OAuth 등

---

## 9. 개발 환경 설정

### 9.1. 로컬 개발 환경

**필수 도구**
- Node.js 18+ (LTS)
- Docker & Docker Compose
- Git
- VS Code (권장 IDE)

**VS Code 확장 프로그램**
- ESLint
- Prettier
- TypeScript
- GitLens
- REST Client: API 테스트
- GraphQL: GraphQL 쿼리 작성

### 9.2. 데이터베이스 관리 도구

**Neo4j**
- Neo4j Browser: 웹 기반 쿼리 도구
- Neo4j Desktop: 로컬 개발 환경

**PostgreSQL**
- pgAdmin: GUI 관리 도구
- DBeaver: 범용 데이터베이스 도구
- TablePlus: 모던한 데이터베이스 클라이언트

### 9.3. API 테스트

**권장: Postman 또는 Insomnia**

**선택 이유**
- REST API 테스트
- 환경 변수 관리
- 자동화된 테스트 스위트

**대안**
- Thunder Client (VS Code 확장): IDE 내에서 테스트
- curl: 커맨드라인 테스트

---

## 10. Phase별 도구 우선순위

### Phase 1: 기본 기능

**필수 도구**
- 백엔드: NestJS, TypeScript, Neo4j, PostgreSQL
- 프론트엔드: Next.js, TypeScript, Tailwind CSS
- 개발: Git, Docker, ESLint, Prettier
- 테스트: Jest

**선택 도구**
- CI/CD: GitHub Actions
- 모니터링: 기본 로깅 (Winston)

### Phase 2: AI 기능

**추가 도구**
- AI 서비스: OpenAI API 또는 Claude API
- 임베딩: OpenAI Embeddings
- 벡터 DB (선택사항): Pinecone 또는 Weaviate (유사도 검색 최적화)

### Phase 3: 협업 및 워크플로우

**추가 도구**
- 실시간 알림: WebSocket (Socket.io)
- 이메일: SendGrid 또는 AWS SES
- 알림 서비스: Slack API (선택사항)

### Phase 4: 고급 기능

**추가 도구**
- 분석: Google Analytics 또는 Mixpanel
- 번역: Google Translate API 또는 DeepL API
- SEO: Google Search Console 연동

---

## 11. 추천 기술 스택 요약

### 백엔드
```
NestJS (TypeScript)
├── Neo4j (GraphDB)
├── PostgreSQL (RDB)
├── Redis (캐싱)
├── OpenAI/Claude API (AI)
└── AWS S3 (파일 저장소)
```

### 프론트엔드
```
Next.js 14+ (TypeScript)
├── Tailwind CSS (스타일링)
├── shadcn/ui (UI 컴포넌트)
├── TanStack Query (서버 상태)
├── react-markdown (Markdown 렌더링)
├── Cytoscape.js (그래프 시각화)
└── @stoplight/elements (OAS 렌더링)
```

### 개발 도구
```
Git + GitHub
├── Docker (컨테이너화)
├── Jest (테스팅)
├── ESLint + Prettier (코드 품질)
├── GitHub Actions (CI/CD)
└── Sentry (에러 모니터링)
```

---

## 12. 참고 자료

### 공식 문서
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Neo4j Documentation](https://neo4j.com/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### 학습 자료
- TypeScript Handbook
- Graph Database 개념 및 Cypher 쿼리
- RESTful API 설계 가이드
- AI/LLM 통합 가이드

---

## 부록

### A. 기술 스택 선택 기준

1. **성숙도**: 충분한 커뮤니티와 문서화
2. **통합성**: 다른 도구와의 호환성
3. **성능**: 요구사항 충족
4. **유지보수성**: 장기적 유지보수 용이성
5. **비용**: 라이선스 및 운영 비용

### B. 마이그레이션 고려사항

- 단계적 도입: Phase별로 도구 추가
- 호환성: 기존 시스템과의 통합
- 학습 곡선: 팀의 기술 스택 숙련도

### C. 변경 이력

- 2025-01-XX: 초안 작성


