import { apiClient } from "./client";
import type {
  Version,
  VersionListResponse,
  CreateVersionRequest,
  UpdateVersionRequest,
  NavigationTreeResponse,
} from "@/lib/types/api";

const BASE_PATH = "/versions";

export const versionsApi = {
  // List all versions
  list: async (): Promise<VersionListResponse> => {
    const { data } = await apiClient.get<VersionListResponse>(BASE_PATH);
    return data;
  },

  // Get single version by ID
  get: async (id: string): Promise<Version> => {
    const { data } = await apiClient.get<Version>(`${BASE_PATH}/${id}`);
    return data;
  },

  // Create new version
  create: async (request: CreateVersionRequest): Promise<Version> => {
    const { data } = await apiClient.post<Version>(BASE_PATH, request);
    return data;
  },

  // Update existing version
  update: async (
    id: string,
    request: UpdateVersionRequest
  ): Promise<Version> => {
    const { data } = await apiClient.put<Version>(
      `${BASE_PATH}/${id}`,
      request
    );
    return data;
  },

  // Delete version by ID
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },

  // Get navigation tree for a version
  getNavigation: async (id: string): Promise<NavigationTreeResponse> => {
    const { data } = await apiClient.get<NavigationTreeResponse>(
      `${BASE_PATH}/${id}/navigation`
    );
    return data;
  },
};
