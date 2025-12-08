/**
 * Acceptance Tests for Document CRUD Operations
 * TDD: These tests are written FIRST before implementation
 * Per Constitution Principle II: Tests MUST be independent, repeatable, and fast (< 1 second per test)
 *
 * Independent Test: Can be fully tested by creating a document via POST /api/v1/documents,
 * retrieving it via GET /api/v1/documents/{id}, and updating it via PUT /api/v1/documents/{id}.
 */
import request from 'supertest';
import { createApp } from '../../src/app';
import { DocumentType, DocumentStatus } from '../../src/models/graphdb/documentNode';

const app = createApp();

describe('Document CRUD - Acceptance Tests', () => {
  // Test data
  const testDocument = {
    title: 'Getting Started Guide',
    type: DocumentType.TUTORIAL,
    content: '# Getting Started\n\nWelcome to NALLO documentation!',
    lang: 'en',
    tags: ['getting-started', 'tutorial'],
  };

  let createdDocumentId: string;

  describe('POST /api/v1/documents - Create Document', () => {
    it('should create a new document and return 201', async () => {
      const response = await request(app).post('/api/v1/documents').send(testDocument).expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: testDocument.title,
        type: testDocument.type,
        content: testDocument.content,
        lang: testDocument.lang,
        status: DocumentStatus.DRAFT,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });

      // Store ID for subsequent tests
      createdDocumentId = response.body.id;
    });

    it('should return 400 for invalid document type', async () => {
      const invalidDocument = {
        ...testDocument,
        type: 'invalid_type',
      };

      const response = await request(app)
        .post('/api/v1/documents')
        .send(invalidDocument)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteDocument = {
        title: 'Missing Fields',
        // Missing: type, content, lang
      };

      const response = await request(app)
        .post('/api/v1/documents')
        .send(incompleteDocument)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid language code', async () => {
      const invalidLangDocument = {
        ...testDocument,
        lang: 'invalid',
      };

      const response = await request(app)
        .post('/api/v1/documents')
        .send(invalidLangDocument)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/documents/{id} - Get Document', () => {
    beforeAll(async () => {
      // Create a document for testing if not exists
      if (!createdDocumentId) {
        const response = await request(app).post('/api/v1/documents').send(testDocument);
        createdDocumentId = response.body.id;
      }
    });

    it('should retrieve document by ID and return 200', async () => {
      const response = await request(app).get(`/api/v1/documents/${createdDocumentId}`).expect(200);

      expect(response.body).toMatchObject({
        id: createdDocumentId,
        title: testDocument.title,
        type: testDocument.type,
        content: testDocument.content,
        lang: testDocument.lang,
      });
    });

    it('should return 404 for non-existent document', async () => {
      const nonExistentId = '00000000-0000-4000-a000-000000000000';

      const response = await request(app).get(`/api/v1/documents/${nonExistentId}`).expect(404);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app).get('/api/v1/documents/invalid-uuid').expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/v1/documents/{id} - Update Document', () => {
    beforeAll(async () => {
      // Create a document for testing if not exists
      if (!createdDocumentId) {
        const response = await request(app).post('/api/v1/documents').send(testDocument);
        createdDocumentId = response.body.id;
      }
    });

    it('should update document title and return 200', async () => {
      const updateData = {
        title: 'Updated Getting Started Guide',
      };

      const response = await request(app)
        .put(`/api/v1/documents/${createdDocumentId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.id).toBe(createdDocumentId);
    });

    it('should update document content and return 200', async () => {
      const updateData = {
        content: '# Updated Getting Started\n\nThis content has been updated.',
      };

      const response = await request(app)
        .put(`/api/v1/documents/${createdDocumentId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.content).toBe(updateData.content);
    });

    it('should update document status with valid transition', async () => {
      // DRAFT → IN_REVIEW is valid
      const updateData = {
        status: DocumentStatus.IN_REVIEW,
      };

      const response = await request(app)
        .put(`/api/v1/documents/${createdDocumentId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe(DocumentStatus.IN_REVIEW);
    });

    it('should return 400 for invalid status transition', async () => {
      // Create a fresh draft document
      const freshDoc = await request(app).post('/api/v1/documents').send(testDocument);
      const freshDocId = freshDoc.body.id;

      // DRAFT → PUBLISH is invalid (must go through IN_REVIEW, DONE first)
      const updateData = {
        status: DocumentStatus.PUBLISH,
      };

      const response = await request(app)
        .put(`/api/v1/documents/${freshDocId}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('INVALID_STATUS_TRANSITION');
    });

    it('should return 404 for non-existent document', async () => {
      const nonExistentId = '00000000-0000-4000-a000-000000000000';
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put(`/api/v1/documents/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should update updated_at timestamp', async () => {
      const beforeUpdate = await request(app).get(`/api/v1/documents/${createdDocumentId}`);
      const beforeTimestamp = beforeUpdate.body.updated_at;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const updateData = { title: 'Another Update' };
      const response = await request(app)
        .put(`/api/v1/documents/${createdDocumentId}`)
        .send(updateData)
        .expect(200);

      expect(new Date(response.body.updated_at).getTime()).toBeGreaterThan(
        new Date(beforeTimestamp).getTime()
      );
    });
  });

  describe('GET /api/v1/documents - List Documents', () => {
    beforeAll(async () => {
      // Create multiple documents for listing tests
      const documents = [
        { ...testDocument, title: 'API Reference', type: DocumentType.API, lang: 'en' },
        { ...testDocument, title: 'Tutorial 1', type: DocumentType.TUTORIAL, lang: 'en' },
        { ...testDocument, title: '시작하기', type: DocumentType.GENERAL, lang: 'ko' },
      ];

      for (const doc of documents) {
        await request(app).post('/api/v1/documents').send(doc);
      }
    });

    it('should return paginated list of documents', async () => {
      const response = await request(app)
        .get('/api/v1/documents')
        .query({ limit: 10, offset: 0 })
        .expect(200);

      expect(response.body).toMatchObject({
        items: expect.any(Array),
        total: expect.any(Number),
        limit: 10,
        offset: 0,
      });
    });

    it('should filter documents by status', async () => {
      const response = await request(app)
        .get('/api/v1/documents')
        .query({ status: DocumentStatus.DRAFT })
        .expect(200);

      expect(
        response.body.items.every((doc: { status: string }) => doc.status === DocumentStatus.DRAFT)
      ).toBe(true);
    });

    it('should filter documents by type', async () => {
      const response = await request(app)
        .get('/api/v1/documents')
        .query({ type: DocumentType.API })
        .expect(200);

      expect(
        response.body.items.every((doc: { type: string }) => doc.type === DocumentType.API)
      ).toBe(true);
    });

    it('should filter documents by language', async () => {
      const response = await request(app)
        .get('/api/v1/documents')
        .query({ lang: 'ko' })
        .expect(200);

      expect(response.body.items.every((doc: { lang: string }) => doc.lang === 'ko')).toBe(true);
    });

    it('should respect pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/documents')
        .query({ limit: 2, offset: 0 })
        .expect(200);

      expect(response.body.items.length).toBeLessThanOrEqual(2);
      expect(response.body.limit).toBe(2);
      expect(response.body.offset).toBe(0);
    });
  });

  describe('Data Consistency - GraphDB and PostgreSQL', () => {
    it('should store metadata in GraphDB and content in PostgreSQL', async () => {
      const doc = {
        title: 'Consistency Test Document',
        type: DocumentType.GENERAL,
        content: '# Test Content\n\nThis is a consistency test.',
        lang: 'en',
      };

      const createResponse = await request(app).post('/api/v1/documents').send(doc).expect(201);

      const docId = createResponse.body.id;

      // Retrieve and verify both metadata and content are returned
      const getResponse = await request(app).get(`/api/v1/documents/${docId}`).expect(200);

      // Metadata (from GraphDB)
      expect(getResponse.body.id).toBe(docId);
      expect(getResponse.body.title).toBe(doc.title);
      expect(getResponse.body.type).toBe(doc.type);
      expect(getResponse.body.lang).toBe(doc.lang);
      expect(getResponse.body.status).toBe(DocumentStatus.DRAFT);

      // Content (from PostgreSQL)
      expect(getResponse.body.content).toBe(doc.content);
    });

    it('should update both databases atomically', async () => {
      // Create document
      const createResponse = await request(app)
        .post('/api/v1/documents')
        .send({
          ...testDocument,
          title: 'Atomic Update Test',
        })
        .expect(201);

      const docId = createResponse.body.id;

      // Update both metadata and content
      const updateData = {
        title: 'Updated Atomic Test',
        content: '# Updated Content\n\nBoth title and content updated.',
      };

      const updateResponse = await request(app)
        .put(`/api/v1/documents/${docId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.title).toBe(updateData.title);
      expect(updateResponse.body.content).toBe(updateData.content);

      // Verify by fetching again
      const getResponse = await request(app).get(`/api/v1/documents/${docId}`).expect(200);

      expect(getResponse.body.title).toBe(updateData.title);
      expect(getResponse.body.content).toBe(updateData.content);
    });
  });
});
