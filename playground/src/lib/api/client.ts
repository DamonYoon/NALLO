import axios, { AxiosError, AxiosInstance } from "axios";
import type { ErrorResponse } from "@/lib/types/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Skip auth for now (will be added later)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("nallo_access_token")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    // Handle 401 Unauthorized (skip for now)
    // if (error.response?.status === 401) {
    //   localStorage.removeItem("nallo_access_token");
    //   window.location.href = "/login";
    // }

    // Extract error message
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      "An unexpected error occurred";

    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("[API Error]", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message,
      });
    }

    return Promise.reject(error);
  }
);

// Helper to check if error is API error
export function isApiError(error: unknown): error is AxiosError<ErrorResponse> {
  return axios.isAxiosError(error);
}

// Helper to get error message
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return (
      error.response?.data?.error?.message ||
      error.message ||
      "An unexpected error occurred"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}
