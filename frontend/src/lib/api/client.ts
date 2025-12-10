/**
 * API Client Configuration
 * Central HTTP client using ky for type-safe API calls
 * Per Constitution Principle VI: No hardcoding - uses environment variables
 */

import ky, { HTTPError, type KyInstance } from 'ky';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(code: string, message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Create configured ky instance
 */
function createApiClient(): KyInstance {
  return ky.create({
    prefixUrl: API_BASE_URL,
    timeout: 30000, // 30 seconds
    retry: {
      limit: 2,
      methods: ['get'],
      statusCodes: [408, 500, 502, 503, 504],
    },
    hooks: {
      beforeRequest: [
        (request) => {
          // Add auth token if available (for future use)
          const token = typeof window !== 'undefined' 
            ? localStorage.getItem('auth_token') 
            : null;
          
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
          
          // Add content type for JSON requests
          if (!request.headers.has('Content-Type')) {
            request.headers.set('Content-Type', 'application/json');
          }
        },
      ],
      afterResponse: [
        async (_request, _options, response) => {
          // Log responses in development
          if (process.env.NODE_ENV === 'development') {
            console.debug(`[API] ${response.status} ${response.url}`);
          }
          return response;
        },
      ],
      beforeError: [
        async (error) => {
          const { response } = error;
          
          if (response) {
            try {
              const body = await response.json() as ApiErrorResponse;
              const apiError = new ApiError(
                body.error?.code || 'UNKNOWN_ERROR',
                body.error?.message || 'An unknown error occurred',
                response.status,
                body.error?.details
              );
              
              // Log error in development
              if (process.env.NODE_ENV === 'development') {
                console.error(`[API Error] ${apiError.code}: ${apiError.message}`);
              }
              
              throw apiError;
            } catch (e) {
              if (e instanceof ApiError) throw e;
              // If parsing fails, throw original error
            }
          }
          
          return error;
        },
      ],
    },
  });
}

// Singleton instance
export const api = createApiClient();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Type-safe GET request
 */
export async function apiGet<T>(endpoint: string, searchParams?: Record<string, string | number | boolean>): Promise<T> {
  return api.get(endpoint, { searchParams }).json<T>();
}

/**
 * Type-safe POST request
 */
export async function apiPost<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
  return api.post(endpoint, { json: data }).json<T>();
}

/**
 * Type-safe PUT request
 */
export async function apiPut<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
  return api.put(endpoint, { json: data }).json<T>();
}

/**
 * Type-safe DELETE request
 */
export async function apiDelete<T = void>(endpoint: string): Promise<T> {
  const response = await api.delete(endpoint);
  
  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }
  
  return response.json<T>();
}

/**
 * Check if error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Check if error is an HTTP error
 */
export function isHttpError(error: unknown): error is HTTPError {
  return error instanceof HTTPError;
}

