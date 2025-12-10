# NALLO Playground

Frontend/Backend Integration 테스트를 위한 개발 환경입니다.

## 목적

- **API Integration Test**: Backend API 연동 테스트
- **UI Component Test**: 개별 컴포넌트 독립 테스트
- **GraphDB Data Management**: Dummy 데이터 생성/삭제
- **Feature Prototyping**: 새로운 기능 프로토타이핑

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일 생성:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3010](http://localhost:3010)에서 확인할 수 있습니다.

## 주요 기능

### API Test (`/playground/api-test`)

- **Health Check**: Backend 연결 상태 확인
- **Data Management**: Documents, Concepts, Versions CRUD
- **Dummy Data Generator**: 테스트용 샘플 데이터 생성
- **Bulk Delete**: 전체 데이터 초기화

### Component Playgrounds

| 경로                           | 설명                    |
| ------------------------------ | ----------------------- |
| `/playground/blocknote-editor` | BlockNote 에디터 테스트 |
| `/playground/graph-view`       | Neo4j 그래프 시각화     |
| `/playground/data-table`       | DataTable 컴포넌트      |
| `/playground/concept-form`     | Concept 폼 테스트       |
| `/playground/document-form`    | Document 폼 테스트      |
| `/playground/version-form`     | Version 폼 테스트       |
| `/playground/page-tree`        | 페이지 트리 네비게이션  |
| `/playground/search`           | 검색 기능 테스트        |
| `/playground/dashboard`        | 대시보드 컴포넌트       |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: Radix UI + shadcn/ui + Tailwind CSS
- **Editor**: BlockNote
- **Graph**: Neo4j NVL / Cytoscape.js
- **State**: TanStack Query + Zustand
- **HTTP Client**: Axios

## 프로젝트 구조

```
playground/
├── src/
│   ├── app/
│   │   ├── playground/          # 테스트 페이지들
│   │   │   ├── api-test/        # API 연동 테스트
│   │   │   ├── blocknote-editor/
│   │   │   └── ...
│   │   └── (admin)/             # Admin 레이아웃 페이지
│   ├── components/              # 재사용 가능한 컴포넌트
│   │   ├── ui/                  # shadcn/ui 컴포넌트
│   │   ├── shared/              # 공통 컴포넌트
│   │   └── ...
│   └── lib/
│       ├── api/                 # API 클라이언트
│       ├── hooks/               # Custom hooks
│       ├── types/               # TypeScript 타입
│       └── mocks/               # Mock 데이터
└── public/
```

## 관련 문서

- [Backend API Spec](../specs/003-backend-api/spec.md)
- [Frontend UI Spec](../specs/004-frontend-ui/spec.md)
- [Integration Spec](../specs/005-backend-frontend-integration/spec.md)
