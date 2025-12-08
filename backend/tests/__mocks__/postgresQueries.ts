/**
 * Mock for PostgreSQL queries
 * Used in unit tests to isolate DocumentService from actual database
 */

// Default mock content for testing
const mockContent = {
  id: 'content-123',
  document_id: '123e4567-e89b-12d3-a456-426614174000',
  content: '# Test Content\n\nThis is test content.',
  storage_key: 'documents/123e4567-e89b-12d3-a456-426614174000',
  created_at: new Date(),
  updated_at: new Date(),
};

export const createDocumentContent = jest.fn().mockResolvedValue(undefined);
export const getDocumentContent = jest.fn().mockResolvedValue(mockContent);
export const updateDocumentContent = jest.fn().mockResolvedValue(undefined);
export const deleteDocumentContent = jest.fn().mockResolvedValue(undefined);

