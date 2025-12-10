import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { versionsApi } from "@/lib/api";
import type { CreateVersionRequest } from "@/lib/types/api";

// Query Keys
export const versionKeys = {
  all: ["versions"] as const,
  lists: () => [...versionKeys.all, "list"] as const,
  details: () => [...versionKeys.all, "detail"] as const,
  detail: (id: string) => [...versionKeys.details(), id] as const,
  navigation: (id: string) =>
    [...versionKeys.detail(id), "navigation"] as const,
};

// List all versions
export function useVersions() {
  return useQuery({
    queryKey: versionKeys.lists(),
    queryFn: () => versionsApi.list(),
  });
}

// Get navigation tree
export function useNavigation(versionId: string) {
  return useQuery({
    queryKey: versionKeys.navigation(versionId),
    queryFn: () => versionsApi.getNavigation(versionId),
    enabled: !!versionId,
  });
}

// Create version
export function useCreateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVersionRequest) => versionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: versionKeys.lists() });
    },
  });
}
