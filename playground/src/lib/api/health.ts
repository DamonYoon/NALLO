import { apiClient } from "./client";
import type { HealthResponse } from "@/lib/types/api";

// Health endpoint is at /health (not under /api/v1)
const HEALTH_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ||
  "http://localhost:8000";

export const healthApi = {
  // Check API health
  check: async (): Promise<HealthResponse> => {
    const { data } = await apiClient.get<HealthResponse>("/health", {
      baseURL: HEALTH_BASE_URL,
    });
    return data;
  },
};
