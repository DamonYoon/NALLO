# Data Model: Admin Frontend

## Overview

Admin Frontend의 데이터 모델과 상태 관리 구조를 정의합니다. Backend API의 OpenAPI spec에서 생성된 타입을 기반으로 합니다.

---

## API Types (Generated from OpenAPI)

### Document

```typescript
// Document status enum
type DocumentStatus = "draft" | "in_review" | "done" | "publish";

// Document type enum
type DocumentType = "api" | "general" | "tutorial";

// Document entity
interface Document {
  id: string; // UUID
  type: DocumentType;
  status: DocumentStatus;
  title: string;
  lang: string; // e.g., 'ko', 'en'
  content: string; // Markdown content
  summary?: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

// Create document request
interface CreateDocumentRequest {
  title: string;
  type: DocumentType;
  content: string;
  lang: string;
  tags?: string[];
}

// Update document request
interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  status?: DocumentStatus;
}

// Document list response
interface DocumentListResponse {
  items: Document[];
  total: number;
  limit: number;
  offset: number;
}
```

### Concept (Glossary)

```typescript
// Concept entity
interface Concept {
  id: string; // UUID
  term: string;
  description: string;
  category?: string;
  lang: string;
  created_at: string;
  updated_at: string;
}

// Create concept request
interface CreateConceptRequest {
  term: string;
  description: string;
  category?: string;
  lang: string;
}

// Update concept request
interface UpdateConceptRequest {
  term?: string;
  description?: string;
  category?: string;
}
```

### Version

```typescript
// Version entity
interface Version {
  id: string; // UUID
  version: string; // e.g., 'v1.0.0'
  name: string;
  description?: string;
  is_public: boolean;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

// Create version request
interface CreateVersionRequest {
  version: string; // Pattern: ^v\d+\.\d+\.\d+$
  name: string;
  description?: string;
  is_public: boolean;
  is_main: boolean;
}
```

### Page

```typescript
// Page entity
interface Page {
  id: string; // UUID
  slug: string; // URL path segment
  title: string;
  order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

// Create page request
interface CreatePageRequest {
  slug: string; // Pattern: ^[a-z0-9-]+$
  title: string;
  version_id: string;
  parent_page_id?: string;
  order?: number;
  visible?: boolean;
}

// Navigation tree node
interface NavigationNode {
  id: string;
  title: string;
  slug: string;
  children: NavigationNode[];
}

// Navigation tree response
interface NavigationTreeResponse {
  pages: NavigationNode[];
}
```

### Search

```typescript
// Search result item
interface SearchResult {
  page_id: string;
  title: string;
  summary: string;
  relevance_score: number;
  matched_fields: string[];
}

// Search response
interface SearchResponse {
  results: SearchResult[];
  total: number;
  limit: number;
  offset: number;
}
```

### Authentication

```typescript
// Login request
interface LoginRequest {
  email: string;
  password: string;
}

// Login response
interface LoginResponse {
  access_token: string;
  token_type: string; // 'bearer'
  expires_in: number; // seconds
}

// User (decoded from JWT)
interface User {
  id: string;
  email: string;
  role: "admin" | "end_user";
}
```

### Common Types

```typescript
// Error response
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Health response
interface HealthResponse {
  status: "healthy" | "unhealthy";
  graphdb: {
    status: "connected" | "disconnected";
  };
  postgresql: {
    status: "connected" | "disconnected";
  };
}

// Pagination params
interface PaginationParams {
  limit?: number;
  offset?: number;
}

// Link response
interface LinkResponse {
  relation_id: string;
}
```

---

## Client State (Zustand)

### Auth Store

```typescript
interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  checkAuth: () => Promise<boolean>;
}
```

### UI Store

```typescript
interface UIState {
  // State
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}
```

### Editor Store (for document editing)

```typescript
interface EditorState {
  // State
  content: string;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;

  // Actions
  setContent: (content: string) => void;
  markDirty: () => void;
  markClean: () => void;
  setSaving: (saving: boolean) => void;
  setLastSavedAt: (date: Date) => void;
}
```

---

## Server State (TanStack Query)

### Query Keys

```typescript
// Query key factory pattern
const queryKeys = {
  // Documents
  documents: {
    all: ["documents"] as const,
    lists: () => [...queryKeys.documents.all, "list"] as const,
    list: (filters: DocumentFilters) =>
      [...queryKeys.documents.lists(), filters] as const,
    details: () => [...queryKeys.documents.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.documents.details(), id] as const,
  },

  // Concepts
  concepts: {
    all: ["concepts"] as const,
    lists: () => [...queryKeys.concepts.all, "list"] as const,
    list: (filters?: ConceptFilters) =>
      [...queryKeys.concepts.lists(), filters] as const,
    details: () => [...queryKeys.concepts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.concepts.details(), id] as const,
    documents: (id: string) =>
      [...queryKeys.concepts.detail(id), "documents"] as const,
  },

  // Versions
  versions: {
    all: ["versions"] as const,
    lists: () => [...queryKeys.versions.all, "list"] as const,
    list: () => [...queryKeys.versions.lists()] as const,
    details: () => [...queryKeys.versions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.versions.details(), id] as const,
    navigation: (id: string) =>
      [...queryKeys.versions.detail(id), "navigation"] as const,
  },

  // Pages
  pages: {
    all: ["pages"] as const,
    details: () => [...queryKeys.pages.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.pages.details(), id] as const,
  },

  // Search
  search: {
    all: ["search"] as const,
    results: (query: string, filters?: SearchFilters) =>
      [...queryKeys.search.all, query, filters] as const,
  },

  // Health
  health: ["health"] as const,
};
```

### Filter Types

```typescript
interface DocumentFilters {
  status?: DocumentStatus;
  type?: DocumentType;
  lang?: string;
  limit?: number;
  offset?: number;
}

interface ConceptFilters {
  category?: string;
  lang?: string;
  limit?: number;
  offset?: number;
}

interface SearchFilters {
  version_id?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}
```

---

## Graph Data Model

### For Neo4j NVL / Cytoscape.js

```typescript
// Graph node
interface GraphNode {
  id: string;
  type: "document" | "concept" | "page" | "version" | "tag";
  label: string;
  properties: Record<string, unknown>;
}

// Graph edge
interface GraphEdge {
  id: string;
  source: string; // node id
  target: string; // node id
  type: string; // e.g., 'USES_CONCEPT', 'DISPLAYS', 'IN_VERSION'
  properties?: Record<string, unknown>;
}

// Graph data
interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Graph view filters
interface GraphFilters {
  nodeTypes: string[];
  versionId?: string;
  depth?: number;
}
```

---

## Form Validation Schemas (Zod)

```typescript
import { z } from "zod";

// Document form schema
const documentFormSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(200),
  type: z.enum(["api", "general", "tutorial"]),
  content: z.string().min(1, "내용을 입력해주세요"),
  lang: z.string().regex(/^[a-z]{2}$/, "유효한 언어 코드를 입력해주세요"),
  tags: z.array(z.string()).optional(),
});

// Concept form schema
const conceptFormSchema = z.object({
  term: z.string().min(1, "용어를 입력해주세요").max(100),
  description: z.string().min(1, "설명을 입력해주세요"),
  category: z.string().optional(),
  lang: z.string().regex(/^[a-z]{2}$/),
});

// Version form schema
const versionFormSchema = z.object({
  version: z.string().regex(/^v\d+\.\d+\.\d+$/, "버전 형식: v1.0.0"),
  name: z.string().min(1, "이름을 입력해주세요").max(100),
  description: z.string().optional(),
  is_public: z.boolean(),
  is_main: z.boolean(),
});

// Page form schema
const pageFormSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "소문자, 숫자, 하이픈만 사용 가능")
    .min(1, "slug를 입력해주세요"),
  title: z.string().min(1, "제목을 입력해주세요").max(200),
  version_id: z.string().uuid(),
  parent_page_id: z.string().uuid().optional(),
  order: z.number().int().optional(),
  visible: z.boolean().optional(),
});

// Login form schema
const loginFormSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});
```

---

## Local Storage Keys

```typescript
const STORAGE_KEYS = {
  ACCESS_TOKEN: "nallo_access_token",
  USER: "nallo_user",
  THEME: "nallo_theme",
  SIDEBAR_STATE: "nallo_sidebar_state",
  EDITOR_DRAFT: "nallo_editor_draft", // prefix for draft content
} as const;
```

---

## API Endpoints Summary

| Method | Endpoint                   | Description                 |
| ------ | -------------------------- | --------------------------- |
| GET    | `/health`                  | Health check                |
| POST   | `/auth/login`              | Login                       |
| GET    | `/documents`               | List documents              |
| POST   | `/documents`               | Create document             |
| GET    | `/documents/:id`           | Get document                |
| PUT    | `/documents/:id`           | Update document             |
| POST   | `/documents/import`        | Import document             |
| GET    | `/concepts`                | List concepts               |
| POST   | `/concepts`                | Create concept              |
| GET    | `/concepts/:id`            | Get concept                 |
| PUT    | `/concepts/:id`            | Update concept              |
| GET    | `/concepts/:id/documents`  | Get documents using concept |
| GET    | `/versions`                | List versions               |
| POST   | `/versions`                | Create version              |
| GET    | `/versions/:id/navigation` | Get navigation tree         |
| POST   | `/pages`                   | Create page                 |
| POST   | `/pages/:id/documents`     | Link page to document       |
| GET    | `/search`                  | Search documents            |
