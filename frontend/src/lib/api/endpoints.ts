/**
 * API Endpoints
 * Type-safe API endpoint functions
 */

import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type {
  Document,
  CreateDocumentInput,
  UpdateDocumentInput,
  Concept,
  CreateConceptInput,
  UpdateConceptInput,
  Tag,
  CreateTagInput,
  Version,
  Page,
  NavigationTree,
  GraphNode,
  GraphEdge,
  GraphStats,
  GraphNodesResponse,
  GraphEdgesResponse,
  GraphNeighborsResponse,
  SearchResponse,
  HealthResponse,
  PaginatedResponse,
} from './types';

// ============================================================================
// HEALTH
// ============================================================================

export const healthApi = {
  check: () => apiGet<HealthResponse>('../health'),
};

// ============================================================================
// DOCUMENTS
// ============================================================================

export interface ListDocumentsParams {
  status?: string;
  type?: string;
  lang?: string;
  limit?: number;
  offset?: number;
}

export const documentsApi = {
  list: (params?: ListDocumentsParams) => 
    apiGet<PaginatedResponse<Document>>('documents', params as Record<string, string | number>),
  
  get: (id: string) => 
    apiGet<Document>(`documents/${id}`),
  
  create: (data: CreateDocumentInput) => 
    apiPost<Document>('documents', data),
  
  update: (id: string, data: UpdateDocumentInput) => 
    apiPut<Document>(`documents/${id}`, data),
  
  delete: (id: string) => 
    apiDelete(`documents/${id}`),
};

// ============================================================================
// CONCEPTS
// ============================================================================

export interface ListConceptsParams {
  lang?: string;
  limit?: number;
  offset?: number;
}

export const conceptsApi = {
  list: (params?: ListConceptsParams) => 
    apiGet<PaginatedResponse<Concept>>('concepts', params as Record<string, string | number>),
  
  get: (id: string) => 
    apiGet<Concept>(`concepts/${id}`),
  
  create: (data: CreateConceptInput) => 
    apiPost<Concept>('concepts', data),
  
  update: (id: string, data: UpdateConceptInput) => 
    apiPut<Concept>(`concepts/${id}`, data),
  
  delete: (id: string) => 
    apiDelete(`concepts/${id}`),
  
  // Impact analysis
  getDocuments: (id: string) => 
    apiGet<PaginatedResponse<Document>>(`concepts/${id}/documents`),
};

// ============================================================================
// TAGS
// ============================================================================

export interface ListTagsParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export const tagsApi = {
  list: (params?: ListTagsParams) => 
    apiGet<PaginatedResponse<Tag>>('tags', params as Record<string, string | number>),
  
  get: (id: string) => 
    apiGet<Tag>(`tags/${id}`),
  
  create: (data: CreateTagInput) => 
    apiPost<Tag>('tags', data),
  
  delete: (id: string) => 
    apiDelete(`tags/${id}`),
};

// ============================================================================
// VERSIONS
// ============================================================================

export interface ListVersionsParams {
  is_public?: boolean;
  limit?: number;
  offset?: number;
}

export const versionsApi = {
  list: (params?: ListVersionsParams) => 
    apiGet<PaginatedResponse<Version>>('versions', params as Record<string, string | number | boolean>),
  
  get: (id: string) => 
    apiGet<Version>(`versions/${id}`),
  
  getNavigation: (id: string) => 
    apiGet<NavigationTree>(`versions/${id}/navigation`),
};

// ============================================================================
// PAGES
// ============================================================================

export interface ListPagesParams {
  version_id?: string;
  visible?: boolean;
  limit?: number;
  offset?: number;
}

export const pagesApi = {
  list: (params?: ListPagesParams) => 
    apiGet<PaginatedResponse<Page>>('pages', params as Record<string, string | number | boolean>),
  
  get: (id: string) => 
    apiGet<Page>(`pages/${id}`),
};

// ============================================================================
// GRAPH
// ============================================================================

export interface ListGraphNodesParams {
  type?: string;
  limit?: number;
  offset?: number;
}

export interface ListGraphEdgesParams {
  type?: string;
  limit?: number;
  offset?: number;
}

export const graphApi = {
  listNodes: (params?: ListGraphNodesParams) => 
    apiGet<GraphNodesResponse>('graph/nodes', params as Record<string, string | number>),
  
  listEdges: (params?: ListGraphEdgesParams) => 
    apiGet<GraphEdgesResponse>('graph/edges', params as Record<string, string | number>),
  
  getNeighbors: (nodeId: string) => 
    apiGet<GraphNeighborsResponse>(`graph/nodes/${nodeId}/neighbors`),
  
  getStats: () => 
    apiGet<GraphStats>('graph/stats'),
};

// ============================================================================
// SEARCH
// ============================================================================

export interface SearchParams {
  query: string;
  version_id?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export const searchApi = {
  search: (params: SearchParams) => 
    apiGet<SearchResponse>('search', {
      ...params,
      tags: params.tags?.join(','),
    } as Record<string, string | number>),
};

