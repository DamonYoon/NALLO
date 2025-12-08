/**
 * Unit Tests for Document Service
 * TDD: These tests are written FIRST before implementation
 * Per Constitution Principle II: Minimum 80% code coverage for business logic
 */
import { DocumentService } from '../../src/services/documentService';
import { DocumentType, DocumentStatus, DocumentNode } from '../../src/models/graphdb/documentNode';
import { CreateDocumentRequest, UpdateDocumentRequest } from '../../src/api/schemas/document';

// Mock the database modules
jest.mock('../../src/db/graphdb/queries', () => ({
  createDocumentNode: jest.fn(),
  getDocumentNode: jest.fn(),
  updateDocumentNode: jest.fn(),
  deleteDocumentNode: jest.fn(),
  listDocumentNodes: jest.fn(),
}));

jest.mock('../../src/db/postgres/queries', () => ({
  createDocumentContent: jest.fn(),
  getDocumentContent: jest.fn(),
  updateDocumentContent: jest.fn(),
  deleteDocumentContent: jest.fn(),
}));

// Import mocked modules
import * as graphdbQueries from '../../src/db/graphdb/queries';
import * as postgresQueries from '../../src/db/postgres/queries';

// Helper to create mock document node
function createMockDocumentNode(overrides: Partial<DocumentNode> = {}): DocumentNode {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    type: DocumentType.GENERAL,
    status: DocumentStatus.DRAFT,
    title: 'Test Document',
    lang: 'en',
    storage_key: 'documents/123e4567-e89b-12d3-a456-426614174000',
    summary: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

describe('DocumentService', () => {
  let documentService: DocumentService;

  beforeEach(() => {
    jest.clearAllMocks();
    documentService = new DocumentService();

    // Setup default mock implementations
    (graphdbQueries.createDocumentNode as jest.Mock).mockImplementation(params =>
      Promise.resolve(
        createMockDocumentNode({
          id: params.id || '123e4567-e89b-12d3-a456-426614174000',
          title: params.title,
          type: params.type,
          lang: params.lang,
          status: params.status,
          storage_key: params.storage_key,
        })
      )
    );

    (graphdbQueries.getDocumentNode as jest.Mock).mockResolvedValue(createMockDocumentNode());

    (graphdbQueries.updateDocumentNode as jest.Mock).mockImplementation((id, updates) =>
      Promise.resolve(createMockDocumentNode({ id, ...updates }))
    );

    (graphdbQueries.deleteDocumentNode as jest.Mock).mockResolvedValue(true);

    (graphdbQueries.listDocumentNodes as jest.Mock).mockResolvedValue({
      items: [createMockDocumentNode()],
      total: 1,
    });

    (postgresQueries.createDocumentContent as jest.Mock).mockResolvedValue(undefined);

    (postgresQueries.getDocumentContent as jest.Mock).mockResolvedValue({
      id: 'content-123',
      document_id: '123e4567-e89b-12d3-a456-426614174000',
      content: '# Test Content\n\nThis is test content.',
      storage_key: 'documents/123e4567-e89b-12d3-a456-426614174000',
      created_at: new Date(),
      updated_at: new Date(),
    });

    (postgresQueries.updateDocumentContent as jest.Mock).mockResolvedValue(undefined);

    (postgresQueries.deleteDocumentContent as jest.Mock).mockResolvedValue(undefined);
  });

  describe('createDocument', () => {
    const validCreateRequest: CreateDocumentRequest = {
      title: 'Getting Started Guide',
      type: DocumentType.TUTORIAL,
      content: '# Getting Started\n\nWelcome to NALLO!',
      lang: 'en',
      tags: ['getting-started', 'tutorial'],
    };

    it('should create a document with valid input', async () => {
      const result = await documentService.createDocument(validCreateRequest);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe(validCreateRequest.title);
      expect(result.type).toBe(validCreateRequest.type);
      expect(result.content).toBe(validCreateRequest.content);
      expect(result.lang).toBe(validCreateRequest.lang);
      expect(result.status).toBe(DocumentStatus.DRAFT);
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    it('should generate a valid UUID for new document', async () => {
      const result = await documentService.createDocument(validCreateRequest);

      // UUID v4 format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(result.id).toMatch(uuidRegex);
    });

    it('should set initial status to draft', async () => {
      const result = await documentService.createDocument(validCreateRequest);

      expect(result.status).toBe(DocumentStatus.DRAFT);
    });

    it('should store content in PostgreSQL', async () => {
      await documentService.createDocument(validCreateRequest);

      expect(postgresQueries.createDocumentContent).toHaveBeenCalledWith(
        expect.any(String), // documentId
        validCreateRequest.content,
        expect.any(String) // storageKey
      );
    });

    it('should store metadata in GraphDB', async () => {
      await documentService.createDocument(validCreateRequest);

      expect(graphdbQueries.createDocumentNode).toHaveBeenCalledWith(
        expect.objectContaining({
          title: validCreateRequest.title,
          type: validCreateRequest.type,
          lang: validCreateRequest.lang,
        })
      );
    });
  });

  describe('getDocument', () => {
    const testDocumentId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return document with content when found', async () => {
      const result = await documentService.getDocument(testDocumentId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(testDocumentId);
      expect(result?.content).toBeDefined();
    });

    it('should return null when document not found', async () => {
      (graphdbQueries.getDocumentNode as jest.Mock).mockResolvedValueOnce(null);

      const result = await documentService.getDocument('non-existent-id');

      expect(result).toBeNull();
    });

    it('should merge GraphDB metadata with PostgreSQL content', async () => {
      const result = await documentService.getDocument(testDocumentId);

      // Should have metadata from GraphDB
      expect(result?.title).toBeDefined();
      expect(result?.type).toBeDefined();
      expect(result?.status).toBeDefined();
      expect(result?.lang).toBeDefined();

      // Should have content from PostgreSQL
      expect(result?.content).toBeDefined();
    });
  });

  describe('updateDocument', () => {
    const testDocumentId = '123e4567-e89b-12d3-a456-426614174000';

    it('should update document title', async () => {
      const updateRequest: UpdateDocumentRequest = {
        title: 'Updated Title',
      };

      (graphdbQueries.updateDocumentNode as jest.Mock).mockResolvedValueOnce(
        createMockDocumentNode({ id: testDocumentId, title: updateRequest.title })
      );

      const result = await documentService.updateDocument(testDocumentId, updateRequest);

      expect(result).toBeDefined();
      expect(result?.title).toBe(updateRequest.title);
    });

    it('should update document content', async () => {
      const updateRequest: UpdateDocumentRequest = {
        content: '# Updated Content\n\nThis is new content.',
      };

      (postgresQueries.getDocumentContent as jest.Mock).mockResolvedValueOnce({
        id: 'content-123',
        document_id: testDocumentId,
        content: updateRequest.content,
        storage_key: `documents/${testDocumentId}`,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await documentService.updateDocument(testDocumentId, updateRequest);

      expect(result).toBeDefined();
      expect(result?.content).toBe(updateRequest.content);
    });

    it('should update document status with valid transition', async () => {
      const updateRequest: UpdateDocumentRequest = {
        status: DocumentStatus.IN_REVIEW,
      };

      (graphdbQueries.updateDocumentNode as jest.Mock).mockResolvedValueOnce(
        createMockDocumentNode({ id: testDocumentId, status: DocumentStatus.IN_REVIEW })
      );

      const result = await documentService.updateDocument(testDocumentId, updateRequest);

      expect(result).toBeDefined();
      expect(result?.status).toBe(DocumentStatus.IN_REVIEW);
    });

    it('should reject invalid status transition', async () => {
      // Mock document with DRAFT status
      (graphdbQueries.getDocumentNode as jest.Mock).mockResolvedValueOnce(
        createMockDocumentNode({ id: testDocumentId, status: DocumentStatus.DRAFT })
      );

      // Try to transition from DRAFT to PUBLISH (invalid)
      const updateRequest: UpdateDocumentRequest = {
        status: DocumentStatus.PUBLISH,
      };

      await expect(documentService.updateDocument(testDocumentId, updateRequest)).rejects.toThrow(
        'Invalid status transition'
      );
    });

    it('should return null when document not found', async () => {
      (graphdbQueries.getDocumentNode as jest.Mock).mockResolvedValueOnce(null);

      const updateRequest: UpdateDocumentRequest = {
        title: 'Updated Title',
      };

      const result = await documentService.updateDocument('non-existent-id', updateRequest);

      expect(result).toBeNull();
    });

    it('should update updated_at timestamp', async () => {
      const updateRequest: UpdateDocumentRequest = {
        title: 'Updated Title',
      };

      const beforeUpdate = new Date();
      const result = await documentService.updateDocument(testDocumentId, updateRequest);

      expect(result).toBeDefined();
      expect(new Date(result!.updated_at).getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });
  });

  describe('listDocuments', () => {
    it('should return paginated list of documents', async () => {
      const result = await documentService.listDocuments({
        limit: 10,
        offset: 0,
      });

      expect(result).toBeDefined();
      expect(result.items).toBeInstanceOf(Array);
      expect(result.total).toBeDefined();
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should filter by status', async () => {
      (graphdbQueries.listDocumentNodes as jest.Mock).mockResolvedValueOnce({
        items: [createMockDocumentNode({ status: DocumentStatus.DRAFT })],
        total: 1,
      });

      const result = await documentService.listDocuments({
        status: DocumentStatus.DRAFT,
        limit: 20,
        offset: 0,
      });

      expect(result.items.every(doc => doc.status === DocumentStatus.DRAFT)).toBe(true);
    });

    it('should filter by type', async () => {
      (graphdbQueries.listDocumentNodes as jest.Mock).mockResolvedValueOnce({
        items: [createMockDocumentNode({ type: DocumentType.API })],
        total: 1,
      });

      const result = await documentService.listDocuments({
        type: DocumentType.API,
        limit: 20,
        offset: 0,
      });

      expect(result.items.every(doc => doc.type === DocumentType.API)).toBe(true);
    });

    it('should filter by language', async () => {
      (graphdbQueries.listDocumentNodes as jest.Mock).mockResolvedValueOnce({
        items: [createMockDocumentNode({ lang: 'ko' })],
        total: 1,
      });

      const result = await documentService.listDocuments({
        lang: 'ko',
        limit: 20,
        offset: 0,
      });

      expect(result.items.every(doc => doc.lang === 'ko')).toBe(true);
    });

    it('should respect pagination parameters', async () => {
      const result = await documentService.listDocuments({
        limit: 5,
        offset: 10,
      });

      expect(result.limit).toBe(5);
      expect(result.offset).toBe(10);
      expect(result.items.length).toBeLessThanOrEqual(5);
    });
  });

  describe('deleteDocument', () => {
    const testDocumentId = '123e4567-e89b-12d3-a456-426614174000';

    it('should delete document from both databases', async () => {
      const result = await documentService.deleteDocument(testDocumentId);

      expect(result).toBe(true);
      expect(graphdbQueries.deleteDocumentNode).toHaveBeenCalledWith(testDocumentId);
      expect(postgresQueries.deleteDocumentContent).toHaveBeenCalledWith(testDocumentId);
    });

    it('should return false when document not found', async () => {
      (graphdbQueries.getDocumentNode as jest.Mock).mockResolvedValueOnce(null);

      const result = await documentService.deleteDocument('non-existent-id');

      expect(result).toBe(false);
    });

    it('should throw on partial failure', async () => {
      (postgresQueries.deleteDocumentContent as jest.Mock).mockRejectedValueOnce(
        new Error('PostgreSQL error')
      );

      await expect(documentService.deleteDocument(testDocumentId)).rejects.toThrow(
        'PostgreSQL error'
      );
    });
  });
});
