import { useQuery } from "@tanstack/react-query";
import { healthApi } from "@/lib/api";

// Query Keys
export const healthKeys = {
  all: ["health"] as const,
};

// Check API health
export function useHealth() {
  return useQuery({
    queryKey: healthKeys.all,
    queryFn: () => healthApi.check(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false,
  });
}
