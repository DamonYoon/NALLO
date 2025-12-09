import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conceptsApi } from "@/lib/api";
import type {
  CreateConceptRequest,
  UpdateConceptRequest,
  PaginationParams,
} from "@/lib/types/api";

// Query Keys
export const conceptKeys = {
  all: ["concepts"] as const,
  lists: () => [...conceptKeys.all, "list"] as const,
  details: () => [...conceptKeys.all, "detail"] as const,
  detail: (id: string) => [...conceptKeys.details(), id] as const,
  documents: (id: string) => [...conceptKeys.detail(id), "documents"] as const,
};

// Get single concept
export function useConcept(id: string) {
  return useQuery({
    queryKey: conceptKeys.detail(id),
    queryFn: () => conceptsApi.get(id),
    enabled: !!id,
  });
}

// Get documents using concept (impact analysis)
export function useConceptDocuments(id: string, params?: PaginationParams) {
  return useQuery({
    queryKey: conceptKeys.documents(id),
    queryFn: () => conceptsApi.getDocuments(id, params),
    enabled: !!id,
  });
}

// Create concept
export function useCreateConcept() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConceptRequest) => conceptsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conceptKeys.lists() });
    },
  });
}

// Update concept
export function useUpdateConcept() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConceptRequest }) =>
      conceptsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: conceptKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: conceptKeys.lists() });
    },
  });
}
