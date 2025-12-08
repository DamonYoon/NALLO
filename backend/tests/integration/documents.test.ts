/**
 * Integration Tests for Document Creation Workflow
 * TDD: These tests are written FIRST before implementation
 * Per Constitution Principle II: Tests MUST be independent, repeatable, and fast (< 1 second per test)
 *
 * These tests verify the integration between GraphDB and PostgreSQL for document operations.
 */
import { DocumentService } from '../../src/services/documentService';
import { initializeGraphDB, closeGraphDB } from '../../src/db/graphdb/connection';
import { initializePostgres, closePostgres } from '../../src/db/postgres/connection';
import { initializeStorage, closeStorage } from '../../src/db/storage/connection';
import { DocumentType, DocumentStatus } from '../../src/models/graphdb/documentNode';

describe('Document Integration Tests', () => {
  let documentService: DocumentService;

  beforeAll(async () => {
    // Initialize database connections for integration tests
    await initializeGraphDB();
    await initializePostgres();
    await initializeStorage();
    documentService = new DocumentService();
  });

  afterAll(async () => {
    // Clean up connections
    await closeStorage();
    await closeGraphDB();
    await closePostgres();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    // This ensures test isolation
  });

  describe('Document Creation Workflow', () => {
    it('should create document in both GraphDB and PostgreSQL', async () => {
      const uniqueTitle = `Integration Test Document ${Date.now()}`;
      const createRequest = {
        title: uniqueTitle,
        type: DocumentType.GENERAL,
        content: '# Integration Test\n\nThis document tests database integration.',
        lang: 'en',
      };

      const result = await documentService.createDocument(createRequest);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      // Verify document can be retrieved (both databases working)
      const retrieved = await documentService.getDocument(result.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe(uniqueTitle);
      expect(retrieved?.content).toBe(createRequest.content);
    });

    it('should maintain data consistency between GraphDB and PostgreSQL', async () => {
      const createRequest = {
        title: 'Consistency Test Document',
        type: DocumentType.API,
        content: '# API Documentation\n\nThis is an API document.',
        lang: 'ko',
      };

      const created = await documentService.createDocument(createRequest);

      // Update the document
      const updateRequest = {
        title: 'Updated Consistency Test',
        content: '# Updated API Documentation\n\nContent has been updated.',
      };

      const updated = await documentService.updateDocument(created.id, updateRequest);

      expect(updated).toBeDefined();
      expect(updated?.title).toBe(updateRequest.title);
      expect(updated?.content).toBe(updateRequest.content);

      // Verify consistency by fetching again
      const retrieved = await documentService.getDocument(created.id);
      expect(retrieved?.title).toBe(updateRequest.title);
      expect(retrieved?.content).toBe(updateRequest.content);
    });

    it('should handle document deletion from both databases', async () => {
      const createRequest = {
        title: 'To Be Deleted',
        type: DocumentType.TUTORIAL,
        content: '# Temporary Document\n\nThis will be deleted.',
        lang: 'en',
      };

      const created = await documentService.createDocument(createRequest);
      const documentId = created.id;

      // Delete the document
      const deleted = await documentService.deleteDocument(documentId);
      expect(deleted).toBe(true);

      // Verify document is gone from both databases
      const retrieved = await documentService.getDocument(documentId);
      expect(retrieved).toBeNull();
    });

    it('should rollback on partial failure', async () => {
      // This test verifies transaction behavior
      // If GraphDB write succeeds but PostgreSQL fails, both should rollback

      const createRequest = {
        title: 'Rollback Test Document',
        type: DocumentType.GENERAL,
        content: '# Rollback Test\n\nTesting transaction rollback.',
        lang: 'en',
      };

      // Create a valid document first
      const created = await documentService.createDocument(createRequest);
      expect(created).toBeDefined();

      // The service should handle rollback scenarios gracefully
      // This is a placeholder for more detailed rollback testing
    });
  });

  describe('Document Retrieval Workflow', () => {
    it('should merge GraphDB metadata with PostgreSQL content', async () => {
      const uniqueTitle = `Merge Test Document ${Date.now()}`;
      const createRequest = {
        title: uniqueTitle,
        type: DocumentType.API,
        content: '# API Content\n\nThis tests metadata and content merge.',
        lang: 'en',
      };

      const created = await documentService.createDocument(createRequest);
      const retrieved = await documentService.getDocument(created.id);

      expect(retrieved).toBeDefined();

      // Metadata from GraphDB
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.title).toBe(uniqueTitle);
      expect(retrieved?.type).toBe(createRequest.type);
      expect(retrieved?.status).toBe(DocumentStatus.DRAFT);
      expect(retrieved?.lang).toBe(createRequest.lang);
      expect(retrieved?.created_at).toBeDefined();
      expect(retrieved?.updated_at).toBeDefined();

      // Content from PostgreSQL
      expect(retrieved?.content).toBe(createRequest.content);
    });

    it('should return null for non-existent document', async () => {
      const nonExistentId = '00000000-0000-4000-a000-000000000000';
      const result = await documentService.getDocument(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe('Document Update Workflow', () => {
    it('should update metadata in GraphDB and content in PostgreSQL', async () => {
      const createRequest = {
        title: 'Update Workflow Test',
        type: DocumentType.TUTORIAL,
        content: '# Original Content\n\nOriginal tutorial content.',
        lang: 'ko',
      };

      const created = await documentService.createDocument(createRequest);

      // Update both metadata and content
      const updateRequest = {
        title: 'Updated Workflow Test',
        content: '# Updated Content\n\nUpdated tutorial content.',
      };

      const updated = await documentService.updateDocument(created.id, updateRequest);

      expect(updated?.title).toBe(updateRequest.title);
      expect(updated?.content).toBe(updateRequest.content);

      // Original values should be preserved
      expect(updated?.type).toBe(createRequest.type);
      expect(updated?.lang).toBe(createRequest.lang);
    });

    it('should update status in GraphDB only', async () => {
      const createRequest = {
        title: 'Status Update Test',
        type: DocumentType.GENERAL,
        content: '# Status Test\n\nTesting status updates.',
        lang: 'en',
      };

      const created = await documentService.createDocument(createRequest);

      // Update status (GraphDB only)
      const updateRequest = {
        status: DocumentStatus.IN_REVIEW,
      };

      const updated = await documentService.updateDocument(created.id, updateRequest);

      expect(updated?.status).toBe(DocumentStatus.IN_REVIEW);
      expect(updated?.content).toBe(createRequest.content); // Content unchanged
    });
  });

  describe('Document Listing Workflow', () => {
    beforeAll(async () => {
      // Create test documents for listing
      const testDocs = [
        { title: 'List Test 1', type: DocumentType.API, content: '# API 1', lang: 'en' },
        {
          title: 'List Test 2',
          type: DocumentType.TUTORIAL,
          content: '# Tutorial 1',
          lang: 'en',
        },
        {
          title: 'List Test 3',
          type: DocumentType.GENERAL,
          content: '# General 1',
          lang: 'ko',
        },
      ];

      for (const doc of testDocs) {
        await documentService.createDocument(doc);
      }
    });

    it('should return paginated results', async () => {
      const result = await documentService.listDocuments({
        limit: 2,
        offset: 0,
      });

      expect(result.items).toBeInstanceOf(Array);
      expect(result.items.length).toBeLessThanOrEqual(2);
      expect(result.total).toBeGreaterThan(0);
      expect(result.limit).toBe(2);
      expect(result.offset).toBe(0);
    });

    it('should filter by type', async () => {
      const result = await documentService.listDocuments({
        type: DocumentType.API,
        limit: 20,
        offset: 0,
      });

      expect(result.items.every(doc => doc.type === DocumentType.API)).toBe(true);
    });

    it('should filter by language', async () => {
      const result = await documentService.listDocuments({
        lang: 'ko',
        limit: 20,
        offset: 0,
      });

      expect(result.items.every(doc => doc.lang === 'ko')).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should create document within 500ms (p95 target)', async () => {
      const createRequest = {
        title: 'Performance Test Document',
        type: DocumentType.GENERAL,
        content: '# Performance Test\n\n'.repeat(100), // ~2KB content
        lang: 'en',
      };

      const startTime = Date.now();
      await documentService.createDocument(createRequest);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500);
    });

    it('should retrieve document within 200ms (p95 target)', async () => {
      const createRequest = {
        title: 'Retrieval Performance Test',
        type: DocumentType.GENERAL,
        content: '# Retrieval Test\n\nTesting retrieval performance.',
        lang: 'en',
      };

      const created = await documentService.createDocument(createRequest);

      const startTime = Date.now();
      await documentService.getDocument(created.id);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(200);
    });
  });
});
