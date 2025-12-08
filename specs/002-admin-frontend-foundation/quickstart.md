# Quickstart: Admin Frontend

## Prerequisites

- **Node.js**: v18.17.0 이상 (LTS 권장)
- **npm**: v9.0.0 이상 또는 **pnpm**: v8.0.0 이상
- **Backend**: `001-backend-api-foundation` 실행 중 (http://localhost:8000)

---

## 1. 프로젝트 생성

```bash
# 프로젝트 루트에서 실행
cd /path/to/NALLO

# Next.js 프로젝트 생성
npx create-next-app@latest admin-frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd admin-frontend
```

---

## 2. 기본 의존성 설치

```bash
# 핵심 의존성
npm install @tanstack/react-query zustand axios zod react-hook-form @hookform/resolvers

# UI 관련
npm install lucide-react class-variance-authority clsx tailwind-merge

# Markdown 에디터 및 렌더링
npm install @uiw/react-md-editor react-markdown remark-gfm

# 그래프 시각화 (선택)
npm install @neo4j-nvl/react
# 또는
npm install cytoscape react-cytoscapejs

# 다크모드
npm install next-themes
```

---

## 3. shadcn/ui 설정

```bash
# shadcn/ui 초기화
npx shadcn-ui@latest init

# 프롬프트 답변:
# - Style: Default
# - Base color: Slate (또는 원하는 색상)
# - CSS variables: Yes

# 필수 컴포넌트 설치
npx shadcn-ui@latest add button input label card dialog dropdown-menu \
  table tabs toast avatar badge separator skeleton sheet command \
  form select textarea popover calendar
```

---

## 4. 환경 변수 설정

```bash
# .env.local 생성
cat > .env.local << 'EOF'
# API 설정
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# 앱 설정
NEXT_PUBLIC_APP_NAME=NALLO Admin
EOF

# .env.example 생성 (버전 관리용)
cat > .env.example << 'EOF'
# API 설정
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# 앱 설정
NEXT_PUBLIC_APP_NAME=NALLO Admin
EOF
```

---

## 5. 디렉토리 구조 설정

```bash
# 필요한 디렉토리 생성
mkdir -p src/lib/api
mkdir -p src/lib/hooks
mkdir -p src/lib/stores
mkdir -p src/lib/utils
mkdir -p src/lib/types
mkdir -p src/components/layout
mkdir -p src/components/documents
mkdir -p src/components/concepts
mkdir -p src/components/versions
mkdir -p src/components/pages
mkdir -p src/components/graph
mkdir -p src/components/shared
```

---

## 6. 기본 유틸리티 파일 생성

### `src/lib/utils/cn.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### `src/lib/api/client.ts`

```typescript
import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - 토큰 주입
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("nallo_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - 에러 핸들링
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("nallo_access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### `src/lib/stores/auth-store.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  role: "admin" | "end_user";
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({ user, accessToken: token, isAuthenticated: true }),
      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: "nallo-auth-storage",
    }
  )
);
```

---

## 7. TanStack Query Provider 설정

### `src/app/providers.tsx`

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            gcTime: 5 * 60 * 1000, // 5분
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### `src/app/layout.tsx` 수정

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NALLO Admin",
  description: "NALLO Documentation Admin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 8. 개발 서버 실행

```bash
# Backend가 실행 중인지 확인
curl http://localhost:8000/api/v1/health

# Frontend 개발 서버 시작
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 9. Playground 설정

### `src/app/page.tsx` (홈 → Playground 리다이렉트)

```typescript
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/playground");
}
```

### `src/app/playground/layout.tsx`

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/playground" className="text-xl font-bold">
            🎮 Component Playground
          </Link>
          <div className="flex items-center gap-2">
            {/* 다크모드 토글은 next-themes 설정 후 추가 */}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
```

### `src/app/playground/page.tsx` (컴포넌트 카탈로그)

```typescript
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const components = [
  {
    name: "markdown-editor",
    title: "Markdown Editor",
    description: "Markdown 편집기 컴포넌트",
  },
  {
    name: "markdown-viewer",
    title: "Markdown Viewer",
    description: "Markdown 렌더링 뷰어",
  },
  {
    name: "document-form",
    title: "Document Form",
    description: "문서 기본 정보 폼",
  },
  {
    name: "data-table",
    title: "Data Table",
    description: "범용 데이터 테이블",
  },
  { name: "concept-form", title: "Concept Form", description: "용어 폼" },
  { name: "page-tree", title: "Page Tree", description: "페이지 트리 구조" },
  { name: "graph-view", title: "Graph View", description: "그래프 시각화" },
];

export default function PlaygroundPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Component Playground</h1>
      <p className="text-muted-foreground mb-8">
        각 컴포넌트를 독립적으로 테스트하고 개발할 수 있습니다.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map((component) => (
          <Link key={component.name} href={`/playground/${component.name}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-lg">{component.title}</CardTitle>
                <CardDescription>{component.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### `src/app/playground/markdown-editor/page.tsx` (예시)

```typescript
"use client";

import { useState } from "react";
// import { MarkdownEditor } from "@/components/documents/markdown-editor";

export default function MarkdownEditorPlayground() {
  const [content, setContent] = useState(
    "# Hello World\n\n이것은 **Markdown** 테스트입니다."
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Markdown Editor</h1>
      <p className="text-muted-foreground mb-6">
        Markdown 편집기 컴포넌트를 테스트합니다.
      </p>

      {/* 컴포넌트 개발 후 주석 해제 */}
      {/* <MarkdownEditor value={content} onChange={setContent} /> */}

      {/* 임시 placeholder */}
      <div className="border rounded-lg p-4 bg-muted">
        <p className="text-muted-foreground">
          MarkdownEditor 컴포넌트가 여기에 표시됩니다.
        </p>
        <textarea
          className="w-full h-64 mt-4 p-2 border rounded"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Props</h2>
        <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
          {`{
  value: "${content.slice(0, 50)}...",
  onChange: (value) => void
}`}
        </pre>
      </div>
    </div>
  );
}
```

---

## 10. 다음 단계

1. **MarkdownEditor 컴포넌트 개발**: `@uiw/react-md-editor` 통합
2. **MarkdownViewer 컴포넌트 개발**: `react-markdown` + `remark-gfm`
3. **DocumentForm 컴포넌트 개발**: `react-hook-form` + `zod`
4. **DataTable 컴포넌트 개발**: 정렬, 필터, 페이지네이션

컴포넌트 개발 순서와 상세 가이드는 `tasks.md`를 참조하세요.

---

## 유용한 명령어

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start

# 린트
npm run lint

# 타입 체크
npx tsc --noEmit

# shadcn/ui 컴포넌트 추가
npx shadcn-ui@latest add [component-name]
```

---

## 문제 해결

### Backend 연결 실패

```bash
# Backend 상태 확인
curl http://localhost:8000/api/v1/health

# Backend 실행 (필요시)
cd ../backend
npm run dev
```

### CORS 오류

Backend의 CORS 설정 확인 또는 Next.js API Routes를 프록시로 사용

### TypeScript 에러

```bash
# 타입 체크
npx tsc --noEmit

# 캐시 클리어
rm -rf .next
npm run dev
```
