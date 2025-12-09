import { apiClient } from "./client";
import type {
  Version,
  CreateVersionRequest,
  NavigationTreeResponse,
} from "@/lib/types/api";

const BASE_PATH = "/versions";

export const versionsApi = {
  // List all versions
  list: async (): Promise<Version[]> => {
    const { data } = await apiClient.get<Version[]>(BASE_PATH);
    return data;
  },

  // Create new version
  create: async (request: CreateVersionRequest): Promise<Version> => {
    const { data } = await apiClient.post<Version>(BASE_PATH, request);
    return data;
  },

  // Get navigation tree for a version
  getNavigation: async (id: string): Promise<NavigationTreeResponse> => {
    const { data } = await apiClient.get<NavigationTreeResponse>(
      `${BASE_PATH}/${id}/navigation`
    );
    return data;
  },
};
