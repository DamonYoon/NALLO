/**
 * Mock for GraphDB queries
 * Used in unit tests to isolate DocumentService from actual database
 */
import { DocumentNode, DocumentStatus, DocumentType } from '../../src/models/graphdb/documentNode';

// Default mock document for testing
const mockDocument: DocumentNode = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  type: DocumentType.GENERAL,
  status: DocumentStatus.DRAFT,
  title: 'Test Document',
  lang: 'en',
  storage_key: 'documents/123e4567-e89b-12d3-a456-426614174000',
  summary: null,
  created_at: new Date(),
  updated_at: new Date(),
};

export const createDocumentNode = jest.fn().mockResolvedValue(mockDocument);
export const getDocumentNode = jest.fn().mockResolvedValue(mockDocument);
export const updateDocumentNode = jest.fn().mockResolvedValue(mockDocument);
export const deleteDocumentNode = jest.fn().mockResolvedValue(true);
export const listDocumentNodes = jest.fn().mockResolvedValue({
  items: [mockDocument],
  total: 1,
});
