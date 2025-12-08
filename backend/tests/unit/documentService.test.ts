/**
 * Unit Tests for Document Service
 * TDD: These tests are written FIRST before implementation
 * Per Constitution Principle II: Minimum 80% code coverage for business logic
 *
 * Storage Architecture:
 * - GraphDB: document metadata (id, title, status, lang, etc.)
 * - MinIO: document content (md, yaml files)
 */
import { DocumentService } from '../../src/services/documentService';
import { DocumentType, DocumentStatus, DocumentNode } from '../../src/models/graphdb/documentNode';
import { CreateDocumentRequest, UpdateDocumentRequest } from '../../src/api/schemas/document';

// Mock the database and storage modules
jest.mock('../../src/db/graphdb/queries', () => ({
  createDocumentNode: jest.fn(),
  getDocumentNode: jest.fn(),
  updateDocumentNode: jest.fn(),
  deleteDocumentNode: jest.fn(),
  listDocumentNodes: jest.fn(),
}));

jest.mock('../../src/db/storage/connection', () => ({
  uploadFile: jest.fn(),
  downloadFile: jest.fn(),
  deleteFile: jest.fn(),
  fileExists: jest.fn(),
}));

// Import mocked modules
import * as graphdbQueries from '../../src/db/graphdb/queries';
import * as storageConnection from '../../src/db/storage/connection';

// Helper to create mock document node
function createMockDocumentNode(overrides: Partial<DocumentNode> = {}): DocumentNode {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    type: DocumentType.GENERAL,
    status: DocumentStatus.DRAFT,
    title: 'Test Document',
    lang: 'en',
    storage_key: 'documents/123e4567-e89b-12d3-a456-426614174000/content.md',
    summary: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

describe('DocumentService', () => {
  let documentService: DocumentService;
  const testContent = '# Test Content\n\nThis is test content.';

  beforeEach(() => {
    jest.clearAllMocks();
    documentService = new DocumentService();

    // Setup default mock implementations for GraphDB
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

    // Setup default mock implementations for MinIO storage
    (storageConnection.uploadFile as jest.Mock).mockResolvedValue('documents/test-id/content.md');

    (storageConnection.downloadFile as jest.Mock).mockResolvedValue(
      Buffer.from(testContent, 'utf-8')
    );

    (storageConnection.deleteFile as jest.Mock).mockResolvedValue(undefined);

    (storageConnection.fileExists as jest.Mock).mockResolvedValue(true);
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

    it('should store content in MinIO', async () => {
      await documentService.createDocument(validCreateRequest);

      expect(storageConnection.uploadFile).toHaveBeenCalledWith(
        expect.stringContaining('documents/'), // storageKey
        expect.any(Buffer), // content buffer
        expect.any(String) // mime type
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

    it('should use correct mime type based on document type', async () => {
      // API document should use yaml
      const apiRequest: CreateDocumentRequest = {
        ...validCreateRequest,
        type: DocumentType.API,
      };

      await documentService.createDocument(apiRequest);

      expect(storageConnection.uploadFile).toHaveBeenCalledWith(
        expect.stringContaining('.yaml'),
        expect.any(Buffer),
        'application/yaml'
      );
    });
  });

  describe('getDocument', () => {
    const testDocumentId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return document with content when found', async () => {
      const result = await documentService.getDocument(testDocumentId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(testDocumentId);
      expect(result?.content).toBe(testContent);
    });

    it('should return null when document not found', async () => {
      (graphdbQueries.getDocumentNode as jest.Mock).mockResolvedValueOnce(null);

      const result = await documentService.getDocument('non-existent-id');

      expect(result).toBeNull();
    });

    it('should merge GraphDB metadata with MinIO content', async () => {
      const result = await documentService.getDocument(testDocumentId);

      // Should have metadata from GraphDB
      expect(result?.title).toBeDefined();
      expect(result?.type).toBeDefined();
      expect(result?.status).toBeDefined();
      expect(result?.lang).toBeDefined();

      // Should have content from MinIO
      expect(result?.content).toBe(testContent);
    });

    it('should return empty content when file not found in MinIO', async () => {
      (storageConnection.fileExists as jest.Mock).mockResolvedValueOnce(false);

      const result = await documentService.getDocument(testDocumentId);

      expect(result).toBeDefined();
      expect(result?.content).toBe('');
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

    it('should update document content in MinIO', async () => {
      const updateRequest: UpdateDocumentRequest = {
        content: '# Updated Content\n\nThis is new content.',
      };

      // Mock download to return updated content
      (storageConnection.downloadFile as jest.Mock).mockResolvedValueOnce(
        Buffer.from(updateRequest.content!, 'utf-8')
      );

      const result = await documentService.updateDocument(testDocumentId, updateRequest);

      expect(storageConnection.uploadFile).toHaveBeenCalled();
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
    it('should return paginated list of documents without content', async () => {
      const result = await documentService.listDocuments({
        limit: 10,
        offset: 0,
      });

      expect(result).toBeDefined();
      expect(result.items).toBeInstanceOf(Array);
      expect(result.total).toBeDefined();
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
      // List should not fetch content from MinIO for performance
      expect(result.items[0].content).toBe('');
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

    it('should delete document from both GraphDB and MinIO', async () => {
      const result = await documentService.deleteDocument(testDocumentId);

      expect(result).toBe(true);
      expect(graphdbQueries.deleteDocumentNode).toHaveBeenCalledWith(testDocumentId);
      expect(storageConnection.deleteFile).toHaveBeenCalled();
    });

    it('should return false when document not found', async () => {
      (graphdbQueries.getDocumentNode as jest.Mock).mockResolvedValueOnce(null);

      const result = await documentService.deleteDocument('non-existent-id');

      expect(result).toBe(false);
    });

    it('should continue deletion even if MinIO delete fails', async () => {
      (storageConnection.deleteFile as jest.Mock).mockRejectedValueOnce(new Error('MinIO error'));

      const result = await documentService.deleteDocument(testDocumentId);

      // Should still return true as GraphDB deletion succeeded
      expect(result).toBe(true);
      expect(graphdbQueries.deleteDocumentNode).toHaveBeenCalledWith(testDocumentId);
    });
  });
});
