import { apiClient } from "./client";
import type {
  Concept,
  CreateConceptRequest,
  UpdateConceptRequest,
  DocumentListResponse,
  PaginationParams,
} from "@/lib/types/api";

const BASE_PATH = "/concepts";

export const conceptsApi = {
  // Get single concept by ID
  get: async (id: string): Promise<Concept> => {
    const { data } = await apiClient.get<Concept>(`${BASE_PATH}/${id}`);
    return data;
  },

  // Create new concept
  create: async (request: CreateConceptRequest): Promise<Concept> => {
    const { data } = await apiClient.post<Concept>(BASE_PATH, request);
    return data;
  },

  // Update existing concept
  update: async (
    id: string,
    request: UpdateConceptRequest
  ): Promise<Concept> => {
    const { data } = await apiClient.put<Concept>(
      `${BASE_PATH}/${id}`,
      request
    );
    return data;
  },

  // Get documents that use this concept (impact analysis)
  getDocuments: async (
    id: string,
    params?: PaginationParams
  ): Promise<DocumentListResponse> => {
    const { data } = await apiClient.get<DocumentListResponse>(
      `${BASE_PATH}/${id}/documents`,
      { params }
    );
    return data;
  },
};
