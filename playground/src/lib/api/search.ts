import { apiClient } from "./client";
import type { SearchResponse, SearchParams } from "@/lib/types/api";

export const searchApi = {
  // Search documents
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const { data } = await apiClient.get<SearchResponse>("/search", {
      params,
    });
    return data;
  },
};
