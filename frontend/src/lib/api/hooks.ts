/**
 * React Query Hooks
 * Type-safe data fetching hooks using TanStack Query
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  documentsApi,
  conceptsApi,
  tagsApi,
  versionsApi,
  pagesApi,
  graphApi,
  searchApi,
  healthApi,
  type ListDocumentsParams,
  type ListConceptsParams,
  type ListTagsParams,
  type ListVersionsParams,
  type ListPagesParams,
  type ListGraphNodesParams,
  type ListGraphEdgesParams,
  type SearchParams,
} from './endpoints';
import type {
  CreateDocumentInput,
  UpdateDocumentInput,
  CreateConceptInput,
  UpdateConceptInput,
  CreateTagInput,
} from './types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const queryKeys = {
  // Health
  health: ['health'] as const,
  
  // Documents
  documents: {
    all: ['documents'] as const,
    list: (params?: ListDocumentsParams) => ['documents', 'list', params] as const,
    detail: (id: string) => ['documents', 'detail', id] as const,
  },
  
  // Concepts
  concepts: {
    all: ['concepts'] as const,
    list: (params?: ListConceptsParams) => ['concepts', 'list', params] as const,
    detail: (id: string) => ['concepts', 'detail', id] as const,
    documents: (id: string) => ['concepts', 'documents', id] as const,
  },
  
  // Tags
  tags: {
    all: ['tags'] as const,
    list: (params?: ListTagsParams) => ['tags', 'list', params] as const,
    detail: (id: string) => ['tags', 'detail', id] as const,
  },
  
  // Versions
  versions: {
    all: ['versions'] as const,
    list: (params?: ListVersionsParams) => ['versions', 'list', params] as const,
    detail: (id: string) => ['versions', 'detail', id] as const,
    navigation: (id: string) => ['versions', 'navigation', id] as const,
  },
  
  // Pages
  pages: {
    all: ['pages'] as const,
    list: (params?: ListPagesParams) => ['pages', 'list', params] as const,
    detail: (id: string) => ['pages', 'detail', id] as const,
  },
  
  // Graph
  graph: {
    all: ['graph'] as const,
    nodes: (params?: ListGraphNodesParams) => ['graph', 'nodes', params] as const,
    edges: (params?: ListGraphEdgesParams) => ['graph', 'edges', params] as const,
    neighbors: (nodeId: string) => ['graph', 'neighbors', nodeId] as const,
    stats: ['graph', 'stats'] as const,
  },
  
  // Search
  search: (params: SearchParams) => ['search', params] as const,
};

// ============================================================================
// HEALTH HOOKS
// ============================================================================

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => healthApi.check(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ============================================================================
// DOCUMENT HOOKS
// ============================================================================

export function useDocuments(params?: ListDocumentsParams) {
  return useQuery({
    queryKey: queryKeys.documents.list(params),
    queryFn: () => documentsApi.list(params),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: () => documentsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDocumentInput) => documentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentInput }) => 
      documentsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(id) });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

// ============================================================================
// CONCEPT HOOKS
// ============================================================================

export function useConcepts(params?: ListConceptsParams) {
  return useQuery({
    queryKey: queryKeys.concepts.list(params),
    queryFn: () => conceptsApi.list(params),
  });
}

export function useConcept(id: string) {
  return useQuery({
    queryKey: queryKeys.concepts.detail(id),
    queryFn: () => conceptsApi.get(id),
    enabled: !!id,
  });
}

export function useConceptDocuments(id: string) {
  return useQuery({
    queryKey: queryKeys.concepts.documents(id),
    queryFn: () => conceptsApi.getDocuments(id),
    enabled: !!id,
  });
}

export function useCreateConcept() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateConceptInput) => conceptsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.concepts.all });
    },
  });
}

export function useUpdateConcept() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConceptInput }) => 
      conceptsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.concepts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.concepts.detail(id) });
    },
  });
}

export function useDeleteConcept() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => conceptsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.concepts.all });
    },
  });
}

// ============================================================================
// TAG HOOKS
// ============================================================================

export function useTags(params?: ListTagsParams) {
  return useQuery({
    queryKey: queryKeys.tags.list(params),
    queryFn: () => tagsApi.list(params),
  });
}

export function useTag(id: string) {
  return useQuery({
    queryKey: queryKeys.tags.detail(id),
    queryFn: () => tagsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTagInput) => tagsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

// ============================================================================
// VERSION HOOKS
// ============================================================================

export function useVersions(params?: ListVersionsParams) {
  return useQuery({
    queryKey: queryKeys.versions.list(params),
    queryFn: () => versionsApi.list(params),
  });
}

export function useVersion(id: string) {
  return useQuery({
    queryKey: queryKeys.versions.detail(id),
    queryFn: () => versionsApi.get(id),
    enabled: !!id,
  });
}

export function useVersionNavigation(id: string) {
  return useQuery({
    queryKey: queryKeys.versions.navigation(id),
    queryFn: () => versionsApi.getNavigation(id),
    enabled: !!id,
  });
}

// ============================================================================
// PAGE HOOKS
// ============================================================================

export function usePages(params?: ListPagesParams) {
  return useQuery({
    queryKey: queryKeys.pages.list(params),
    queryFn: () => pagesApi.list(params),
  });
}

export function usePage(id: string) {
  return useQuery({
    queryKey: queryKeys.pages.detail(id),
    queryFn: () => pagesApi.get(id),
    enabled: !!id,
  });
}

// ============================================================================
// GRAPH HOOKS
// ============================================================================

export function useGraphNodes(params?: ListGraphNodesParams) {
  return useQuery({
    queryKey: queryKeys.graph.nodes(params),
    queryFn: () => graphApi.listNodes(params),
  });
}

export function useGraphEdges(params?: ListGraphEdgesParams) {
  return useQuery({
    queryKey: queryKeys.graph.edges(params),
    queryFn: () => graphApi.listEdges(params),
  });
}

export function useGraphNeighbors(nodeId: string) {
  return useQuery({
    queryKey: queryKeys.graph.neighbors(nodeId),
    queryFn: () => graphApi.getNeighbors(nodeId),
    enabled: !!nodeId,
  });
}

export function useGraphStats() {
  return useQuery({
    queryKey: queryKeys.graph.stats,
    queryFn: () => graphApi.getStats(),
  });
}

export function useConceptRelations() {
  return useQuery({
    queryKey: [...queryKeys.graph.stats, 'conceptRelations'],
    queryFn: () => graphApi.getConceptRelations(),
  });
}

// ============================================================================
// SEARCH HOOKS
// ============================================================================

export function useSearch(params: SearchParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.search(params),
    queryFn: () => searchApi.search(params),
    enabled: enabled && !!params.query,
  });
}

