// ============================================
// API Types (Based on OpenAPI spec)
// ============================================

// Document
export type DocumentStatus = "draft" | "in_review" | "done" | "publish";
export type DocumentType = "api" | "general" | "tutorial";

export interface Document {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  title: string;
  lang: string;
  content: string;
  summary?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentRequest {
  title: string;
  type: DocumentType;
  content: string;
  lang: string;
  tags?: string[];
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  status?: DocumentStatus;
}

export interface DocumentListResponse {
  items: Document[];
  total: number;
  limit: number;
  offset: number;
}

// Concept (Glossary)
export interface Concept {
  id: string;
  term: string;
  description: string;
  category?: string;
  lang: string;
  created_at: string;
  updated_at: string;
}

export interface CreateConceptRequest {
  term: string;
  description: string;
  category?: string;
  lang: string;
}

export interface UpdateConceptRequest {
  term?: string;
  description?: string;
  category?: string;
}

export interface ConceptListResponse {
  items: Concept[];
  total: number;
  limit: number;
  offset: number;
}

// Version
export interface Version {
  id: string;
  version: string;
  name: string;
  description?: string;
  is_public: boolean;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateVersionRequest {
  version: string;
  name: string;
  description?: string;
  is_public: boolean;
  is_main: boolean;
}

export interface UpdateVersionRequest {
  name?: string;
  description?: string;
  is_public?: boolean;
  is_main?: boolean;
}

export interface VersionListResponse {
  items: Version[];
  total: number;
  limit: number;
  offset: number;
}

// Page
export interface Page {
  id: string;
  slug: string;
  title: string;
  order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePageRequest {
  slug: string;
  title: string;
  version_id: string;
  parent_page_id?: string;
  order?: number;
  visible?: boolean;
}

export interface NavigationNode {
  id: string;
  title: string;
  slug: string;
  children: NavigationNode[];
}

export interface NavigationTreeResponse {
  pages: NavigationNode[];
}

// Search
export interface SearchResult {
  page_id: string;
  title: string;
  summary: string;
  relevance_score: number;
  matched_fields: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  limit: number;
  offset: number;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Common
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface HealthResponse {
  status: "healthy" | "unhealthy";
  graphdb: {
    status: "connected" | "disconnected";
  };
  postgresql: {
    status: "connected" | "disconnected";
  };
}

export interface LinkResponse {
  relation_id: string;
}

// Query Params
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface DocumentFilters extends PaginationParams {
  status?: DocumentStatus;
  type?: DocumentType;
  lang?: string;
}

export interface SearchParams extends PaginationParams {
  query: string;
  version_id?: string;
  tags?: string[];
}
