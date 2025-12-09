import { apiClient } from "./client";
import type {
  Document,
  DocumentListResponse,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentFilters,
} from "@/lib/types/api";

const BASE_PATH = "/documents";

export const documentsApi = {
  // List documents with optional filters
  list: async (filters?: DocumentFilters): Promise<DocumentListResponse> => {
    const { data } = await apiClient.get<DocumentListResponse>(BASE_PATH, {
      params: filters,
    });
    return data;
  },

  // Get single document by ID
  get: async (id: string): Promise<Document> => {
    const { data } = await apiClient.get<Document>(`${BASE_PATH}/${id}`);
    return data;
  },

  // Create new document
  create: async (request: CreateDocumentRequest): Promise<Document> => {
    const { data } = await apiClient.post<Document>(BASE_PATH, request);
    return data;
  },

  // Update existing document
  update: async (
    id: string,
    request: UpdateDocumentRequest
  ): Promise<Document> => {
    const { data } = await apiClient.put<Document>(
      `${BASE_PATH}/${id}`,
      request
    );
    return data;
  },

  // Import document from file
  import: async (
    file: File,
    type: "api" | "general",
    versionId?: string
  ): Promise<Document> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    if (versionId) {
      formData.append("version_id", versionId);
    }

    const { data } = await apiClient.post<Document>(
      `${BASE_PATH}/import`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  },
};
