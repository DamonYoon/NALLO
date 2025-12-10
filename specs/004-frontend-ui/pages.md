# Frontend Pages & Components Map

프론트엔드 페이지와 컴포넌트 구조를 정의합니다.

---

## URL 구조

```
/                       → /documents 리다이렉트
/documents              → 문서 대시보드 (Dashboard)
/documents/list         → 문서 목록 (DocumentList)
/documents/new          → 새 문서 작성 (DocumentEditor)
/documents/[id]         → 문서 편집 (DocumentEditor)
/glossary               → 용어집 목록 (GlossaryList)
/glossary/[id]          → 용어 상세 (미구현)
/deploy                 → 배포 (미구현)
/graph                  → 그래프 뷰 (GraphView)
```

---

## 레이아웃 구조

### Admin Layout (관리자 모드)

```
RootLayout (app/layout.tsx)
└── MainLayout (app/(main)/layout.tsx)
    └── AdminLayout (components/layout/admin-layout.tsx)
        ├── AdminHeader (다크 테마)
        └── Main Container (flex, gap)
            ├── Card (rounded-lg, shadow-xl)
            │   ├── AdminFunctionHeader (탭 네비게이션)
            │   └── Sidebar + Content
            └── AdminAIPanel (push layout)
```

### User Layout (사용자 모드) - v1.2.0 추가

```
RootLayout (app/layout.tsx)
└── UserLayout (components/layout/user-layout.tsx)
    ├── bg-input (라이트 그레이 배경), padding: px-5 pb-5
    ├── UserGlobalBar (투명, 컴팩트 h-10)
    │   └── [Logo] ... [Bookmarks][Graph][Profile][Ask AI]
    └── Main Container (flex, gap)
        ├── Card (bg-card, rounded-lg, shadow-xl)
        │   ├── ServiceNavigation (문서 뷰에서만)
        │   └── UserSidebar + Content
        └── UserAskAIPanel (push layout)
```

**User Layout 특징**:
- Figma Make 디자인 기반
- AdminLayout 패턴 적용 (라이트 배경 + 카드형 콘텐츠)
- 조건부 로고 표시 (그래프 뷰에서만)
- CSS 변수 기반 스타일링

---

## 페이지별 컴포넌트 매핑

### 문서 탭 (`/documents/*`)

| URL | 페이지 파일 | 메인 컴포넌트 | 설명 |
|-----|------------|---------------|------|
| `/documents` | `(main)/documents/page.tsx` | `Dashboard` | 문서 대시보드, 최근 활동, AI 추천 |
| `/documents/list` | `(main)/documents/list/page.tsx` | `DocumentList` | 문서 목록, 검색, 필터링 |
| `/documents/new` | `(main)/documents/new/page.tsx` | `DocumentEditor` | 새 문서 작성 |
| `/documents/[id]` | `(main)/documents/[id]/page.tsx` | `DocumentEditor` | 기존 문서 편집 |

**사이드바**: 표시됨  
**테마**: Light

### 용어집 탭 (`/glossary/*`)

| URL | 페이지 파일 | 메인 컴포넌트 | 설명 |
|-----|------------|---------------|------|
| `/glossary` | `(main)/glossary/page.tsx` | `GlossaryList` | 용어 목록, 그리드/리스트 뷰 |
| `/glossary/[id]` | 미구현 | `GlossaryDetail` | 용어 상세 (추후) |

**사이드바**: 숨김  
**테마**: Light

### 배포 탭 (`/deploy`)

| URL | 페이지 파일 | 메인 컴포넌트 | 설명 |
|-----|------------|---------------|------|
| `/deploy` | `(main)/deploy/page.tsx` | `DeployPlaceholder` | 배포 기능 (추후 구현) |

**사이드바**: 숨김  
**테마**: Light

### 그래프 탭 (`/graph`)

| URL | 페이지 파일 | 메인 컴포넌트 | 설명 |
|-----|------------|---------------|------|
| `/graph` | `(main)/graph/page.tsx` | `GraphView` | Neo4j NVL 그래프 시각화 |

**사이드바**: 숨김  
**테마**: Dark

---

## 컴포넌트 의존성

### Admin 레이아웃 컴포넌트 (`components/layout/admin/`)

| 컴포넌트 | 파일 | 역할 | 의존성 |
|---------|------|------|--------|
| `AdminLayout` | `admin-layout.tsx` | 관리자 메인 레이아웃, 탭-URL 동기화 | AdminHeader, AdminFunctionHeader, AdminSidebar, AdminAIPanel |
| `AdminHeader` | `admin-header.tsx` | 상단 헤더, AI 버튼 (다크 테마) | IconButton |
| `AdminFunctionHeader` | `admin-function-header.tsx` | 탭 네비게이션 | - |
| `AdminSidebar` | `admin-sidebar.tsx` | 문서 네비게이션 | NavItem, IconButton |
| `AdminAIPanel` | `admin-ai-panel.tsx` | AI 어시스턴트 패널 | - |

### User 레이아웃 컴포넌트 (`components/layout/user/`)

| 컴포넌트 | 파일 | 역할 | 의존성 |
|---------|------|------|--------|
| `UserLayout` | `user-layout.tsx` | 사용자 메인 레이아웃 | UserGlobalBar, ServiceNavigation, UserSidebar, UserAskAIPanel |
| `UserGlobalBar` | `user-global-bar.tsx` | 상단 바 (라이트 테마, Pill 버튼) | PillButton (서브컴포넌트) |
| `ServiceNavigation` | `service-navigation.tsx` | 서비스 네비게이션 (Getting Started, Recipes 등) | Select |
| `UserSidebar` | `user-sidebar.tsx` | 문서 트리 네비게이션 | TreeItem (서브컴포넌트), Input, ScrollArea |
| `UserAskAIPanel` | `user-ask-ai-panel.tsx` | AI 어시스턴트 패널 (라이트 테마) | Button, motion |

### 페이지 컴포넌트

| 컴포넌트 | 파일 | Mock 데이터 | 상태 |
|---------|------|-------------|------|
| `Dashboard` | `components/dashboard/index.tsx` | `lib/mocks/dashboard.ts` | ✅ 완료 |
| `DocumentList` | `components/documents/document-list.tsx` | `lib/mocks/documents.ts` | ✅ 완료 |
| `DocumentEditor` | `components/documents/document-editor.tsx` | - | ✅ 완료 |
| `GlossaryList` | `components/glossary/glossary-list.tsx` | `lib/mocks/glossary.ts` | ✅ 완료 |
| `GraphView` | `components/graph/graph-view.tsx` | `components/graph/mock-data.ts` | ✅ 완료 |

### UI 컴포넌트 (`components/ui/`)

| 컴포넌트 | 용도 | shadcn 기반 |
|---------|------|-------------|
| `Button` | 버튼 (brand variant 추가) | ✅ |
| `Badge` | 상태/타입 뱃지 | ✅ |
| `IconButton` | 아이콘 버튼 (tooltip 지원) | 커스텀 |
| `NavItem` | 네비게이션 아이템 | 커스텀 |
| `StatusBadge` | 문서 상태 뱃지 | 커스텀 |
| `CategoryBadge` | 용어집 카테고리 뱃지 | 커스텀 |
| `Input`, `Select`, `Table` 등 | 폼 요소 | ✅ |

---

## Mock 데이터 위치

| 파일 | 사용처 | 내용 |
|------|--------|------|
| `lib/mocks/documents.ts` | DocumentList | 문서 목록 데이터 |
| `lib/mocks/sidebar.ts` | Sidebar | 사이드바 네비게이션 |
| `lib/mocks/dashboard.ts` | Dashboard | 대시보드 데이터 (최근 문서, AI 작업, 건강 지표) |
| `lib/mocks/glossary.ts` | GlossaryList | 용어집 데이터 |
| `lib/mocks/graph.ts` | GraphView | 그래프 노드/엣지 |

---

## 탭 설정

| 탭 이름 | URL 프리픽스 | 사이드바 | 테마 |
|--------|-------------|---------|------|
| 문서 | `/documents` | ✅ | Light |
| 용어집 | `/glossary` | ❌ | Light |
| 배포 | `/deploy` | ❌ | Light |
| 그래프 | `/graph` | ❌ | Dark |

설정 위치: `components/layout/app-layout.tsx`
- `showSidebarForTabs`: 사이드바 표시할 탭
- `darkModeForTabs`: 다크 테마 적용할 탭

