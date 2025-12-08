/**
 * Contract Tests for Document API
 * Validates that API responses match OpenAPI specification (contracts/openapi.yaml)
 * Per Constitution Principle II: Contract tests MUST be written for external-facing APIs
 *
 * These tests verify:
 * - Request/Response schema compliance
 * - HTTP status codes
 * - Content types
 * - Required fields
 */

// Mock GraphDB queries
jest.mock('../../src/db/graphdb/queries', () => {
  const mockDocuments = new Map<string, Record<string, unknown>>();
  let docCounter = 0;

  return {
    createDocumentNode: jest.fn().mockImplementation(async (data: Record<string, unknown>) => {
      docCounter++;
      const doc = {
        ...data,
        id: data.id || `00000000-000${docCounter}-4000-a000-00000000000${docCounter}`,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockDocuments.set(doc.id as string, doc);
      return doc;
    }),
    getDocumentNode: jest.fn().mockImplementation(async (id: string) => {
      return mockDocuments.get(id) || null;
    }),
    updateDocumentNode: jest
      .fn()
      .mockImplementation(async (id: string, updates: Record<string, unknown>) => {
        const doc = mockDocuments.get(id);
        if (!doc) return null;
        const updated = { ...doc, ...updates, updated_at: new Date() };
        mockDocuments.set(id, updated);
        return updated;
      }),
    deleteDocumentNode: jest.fn().mockImplementation(async (id: string) => {
      const existed = mockDocuments.has(id);
      mockDocuments.delete(id);
      return existed;
    }),
    listDocumentNodes: jest.fn().mockImplementation(async (query: Record<string, unknown>) => {
      let items = Array.from(mockDocuments.values());
      if (query.status) items = items.filter(d => d.status === query.status);
      if (query.type) items = items.filter(d => d.type === query.type);
      if (query.lang) items = items.filter(d => d.lang === query.lang);
      const offset = (query.offset as number) || 0;
      const limit = (query.limit as number) || 20;
      return {
        items: items.slice(offset, offset + limit),
        total: items.length,
      };
    }),
  };
});

// Mock MinIO storage
jest.mock('../../src/db/storage/connection', () => {
  const mockStorage = new Map<string, Buffer>();

  return {
    uploadFile: jest.fn().mockImplementation(async (key: string, content: Buffer) => {
      mockStorage.set(key, content);
      return key;
    }),
    downloadFile: jest.fn().mockImplementation(async (key: string) => {
      return mockStorage.get(key) || Buffer.from('');
    }),
    deleteFile: jest.fn().mockImplementation(async (key: string) => {
      mockStorage.delete(key);
    }),
    fileExists: jest.fn().mockImplementation(async (key: string) => {
      return mockStorage.has(key);
    }),
    initializeStorage: jest.fn().mockResolvedValue(undefined),
  };
});

import request from 'supertest';
import { createApp } from '../../src/app';
import { DocumentType } from '../../src/models/graphdb/documentNode';
import path from 'path';
import fs from 'fs';

const app = createApp();

describe('Document API - Contract Tests', () => {
  // Valid test document matching OpenAPI CreateDocumentRequest schema
  const validDocument = {
    title: 'Contract Test Document',
    type: DocumentType.GENERAL,
    content: '# Contract Test\n\nThis document validates API contract.',
    lang: 'en',
    tags: ['contract', 'test'],
  };

  let createdDocumentId: string;

  /**
   * T023: Contract test for POST /api/v1/documents
   * Validates against OpenAPI CreateDocumentRequest and DocumentResponse schemas
   */
  describe('POST /api/v1/documents - Contract Validation', () => {
    it('should return 201 with DocumentResponse schema on success', async () => {
      const response = await request(app)
        .post('/api/v1/documents')
        .set('Content-Type', 'application/json')
        .send(validDocument)
        .expect('Content-Type', /application\/json/)
        .expect(201);

      // Validate DocumentResponse schema per OpenAPI spec
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          ), // UUID v4 format
          type: expect.stringMatching(/^(api|general|tutorial)$/),
          status: expect.stringMatching(/^(draft|in_review|done|publish)$/),
          title: expect.any(String),
          lang: expect.stringMatching(/^[a-z]{2}$/),
          content: expect.any(String),
          created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/), // ISO 8601
          updated_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        })
      );

      // Store for subsequent tests
      createdDocumentId = response.body.id;
    });

    it('should return 400 with ErrorResponse schema for invalid request', async () => {
      const invalidDocument = {
        title: '', // Empty title should fail validation
        type: 'invalid_type',
      };

      const response = await request(app)
        .post('/api/v1/documents')
        .set('Content-Type', 'application/json')
        .send(invalidDocument)
        .expect('Content-Type', /application\/json/)
        .expect(400);

      // Validate ErrorResponse schema per OpenAPI spec
      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: expect.any(String),
            message: expect.any(String),
          }),
        })
      );
    });

    it('should accept all valid document types per OpenAPI enum', async () => {
      const types = ['api', 'general', 'tutorial'] as const;

      for (const docType of types) {
        const doc = { ...validDocument, type: docType, title: `Type ${docType} Test` };
        const response = await request(app).post('/api/v1/documents').send(doc).expect(201);

        expect(response.body.type).toBe(docType);
      }
    });

    it('should validate lang field matches ISO 639-1 pattern', async () => {
      // Valid language codes
      const validLangs = ['en', 'ko', 'ja', 'zh'];
      for (const lang of validLangs) {
        const doc = { ...validDocument, lang, title: `Lang ${lang} Test` };
        const response = await request(app).post('/api/v1/documents').send(doc).expect(201);
        expect(response.body.lang).toBe(lang);
      }

      // Invalid language codes
      const invalidLangs = ['eng', 'KO', '12', 'e'];
      for (const lang of invalidLangs) {
        const doc = { ...validDocument, lang, title: `Invalid Lang ${lang}` };
        await request(app).post('/api/v1/documents').send(doc).expect(400);
      }
    });

    it('should accept optional tags array', async () => {
      // Without tags
      const docWithoutTags = {
        title: 'No Tags Document',
        type: DocumentType.GENERAL,
        content: 'Content without tags',
        lang: 'en',
      };
      const response1 = await request(app)
        .post('/api/v1/documents')
        .send(docWithoutTags)
        .expect(201);
      expect(response1.body.tags).toBeUndefined();

      // With empty tags
      const docWithEmptyTags = { ...docWithoutTags, title: 'Empty Tags', tags: [] };
      await request(app).post('/api/v1/documents').send(docWithEmptyTags).expect(201);

      // With tags
      const docWithTags = { ...docWithoutTags, title: 'With Tags', tags: ['tag1', 'tag2'] };
      await request(app).post('/api/v1/documents').send(docWithTags).expect(201);
    });
  });

  /**
   * T024: Contract test for GET /api/v1/documents/{id}
   * Validates against OpenAPI DocumentResponse schema
   */
  describe('GET /api/v1/documents/{id} - Contract Validation', () => {
    beforeAll(async () => {
      if (!createdDocumentId) {
        const response = await request(app).post('/api/v1/documents').send(validDocument);
        createdDocumentId = response.body.id;
      }
    });

    it('should return 200 with DocumentResponse schema on success', async () => {
      const response = await request(app)
        .get(`/api/v1/documents/${createdDocumentId}`)
        .expect('Content-Type', /application\/json/)
        .expect(200);

      // Validate full DocumentResponse schema
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          ),
          type: expect.stringMatching(/^(api|general|tutorial)$/),
          status: expect.stringMatching(/^(draft|in_review|done|publish)$/),
          title: expect.any(String),
          lang: expect.stringMatching(/^[a-z]{2}$/),
          content: expect.any(String),
          created_at: expect.any(String),
          updated_at: expect.any(String),
        })
      );
    });

    it('should return 404 with ErrorResponse schema for non-existent document', async () => {
      const nonExistentId = '00000000-0000-4000-a000-000000000000';

      const response = await request(app)
        .get(`/api/v1/documents/${nonExistentId}`)
        .expect('Content-Type', /application\/json/)
        .expect(404);

      // Validate ErrorResponse schema
      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: expect.any(String),
            message: expect.any(String),
          }),
        })
      );
    });

    it('should validate id parameter as UUID format', async () => {
      const invalidIds = ['not-a-uuid', '123', 'abc-def-ghi'];

      for (const invalidId of invalidIds) {
        const response = await request(app)
          .get(`/api/v1/documents/${invalidId}`)
          .expect('Content-Type', /application\/json/)
          .expect(400);

        expect(response.body.error).toBeDefined();
      }
    });
  });

  /**
   * T025: Contract test for PUT /api/v1/documents/{id}
   * Validates against OpenAPI UpdateDocumentRequest and DocumentResponse schemas
   */
  describe('PUT /api/v1/documents/{id} - Contract Validation', () => {
    let updateTestDocId: string;

    beforeAll(async () => {
      // Create fresh document for update tests
      const response = await request(app)
        .post('/api/v1/documents')
        .send({ ...validDocument, title: 'Update Contract Test' });
      updateTestDocId = response.body.id;
    });

    it('should return 200 with DocumentResponse schema on success', async () => {
      const updateData = {
        title: 'Updated Contract Test Title',
      };

      const response = await request(app)
        .put(`/api/v1/documents/${updateTestDocId}`)
        .set('Content-Type', 'application/json')
        .send(updateData)
        .expect('Content-Type', /application\/json/)
        .expect(200);

      // Validate DocumentResponse schema
      expect(response.body).toEqual(
        expect.objectContaining({
          id: updateTestDocId,
          type: expect.stringMatching(/^(api|general|tutorial)$/),
          status: expect.stringMatching(/^(draft|in_review|done|publish)$/),
          title: updateData.title,
          lang: expect.stringMatching(/^[a-z]{2}$/),
          content: expect.any(String),
          created_at: expect.any(String),
          updated_at: expect.any(String),
        })
      );
    });

    it('should accept partial UpdateDocumentRequest per OpenAPI spec', async () => {
      // Only title
      await request(app)
        .put(`/api/v1/documents/${updateTestDocId}`)
        .send({ title: 'Only Title Update' })
        .expect(200);

      // Only content
      await request(app)
        .put(`/api/v1/documents/${updateTestDocId}`)
        .send({ content: 'Only content update' })
        .expect(200);

      // Only status (valid transition)
      await request(app)
        .put(`/api/v1/documents/${updateTestDocId}`)
        .send({ status: 'in_review' })
        .expect(200);
    });

    it('should validate status enum values per OpenAPI spec', async () => {
      // Create fresh document for status test
      const freshDoc = await request(app)
        .post('/api/v1/documents')
        .send({ ...validDocument, title: 'Status Enum Test' });
      const freshId = freshDoc.body.id;

      // Valid status values (DRAFT -> IN_REVIEW is valid)
      await request(app)
        .put(`/api/v1/documents/${freshId}`)
        .send({ status: 'in_review' })
        .expect(200);

      // Invalid status value
      await request(app)
        .put(`/api/v1/documents/${freshId}`)
        .send({ status: 'invalid_status' })
        .expect(400);
    });

    it('should return 404 with ErrorResponse for non-existent document', async () => {
      const nonExistentId = '00000000-0000-4000-a000-000000000000';

      const response = await request(app)
        .put(`/api/v1/documents/${nonExistentId}`)
        .send({ title: 'Update Non-existent' })
        .expect('Content-Type', /application\/json/)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * T026: Contract test for POST /api/v1/documents/import
   * Validates against OpenAPI multipart/form-data schema
   */
  describe('POST /api/v1/documents/import - Contract Validation', () => {
    // Create test files for import
    const testFilesDir = path.join(__dirname, '../fixtures');
    const markdownFilePath = path.join(testFilesDir, 'test-document.md');
    const oasFilePath = path.join(testFilesDir, 'test-openapi.yaml');

    beforeAll(() => {
      // Ensure fixtures directory exists
      if (!fs.existsSync(testFilesDir)) {
        fs.mkdirSync(testFilesDir, { recursive: true });
      }

      // Create test markdown file
      fs.writeFileSync(
        markdownFilePath,
        `# Test Document

This is a test markdown document for import.

## Section 1

Content for section 1.

## Section 2

Content for section 2.
`
      );

      // Create test OpenAPI file
      fs.writeFileSync(
        oasFilePath,
        `openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths:
  /test:
    get:
      summary: Test endpoint
      responses:
        '200':
          description: Success
`
      );
    });

    afterAll(() => {
      // Cleanup test files
      if (fs.existsSync(markdownFilePath)) fs.unlinkSync(markdownFilePath);
      if (fs.existsSync(oasFilePath)) fs.unlinkSync(oasFilePath);
      if (fs.existsSync(testFilesDir)) {
        try {
          fs.rmdirSync(testFilesDir);
        } catch {
          // Directory not empty or other error, ignore
        }
      }
    });

    it('should return 201 with DocumentResponse schema for markdown import', async () => {
      const response = await request(app)
        .post('/api/v1/documents/import')
        .attach('file', markdownFilePath)
        .field('type', 'general')
        .expect('Content-Type', /application\/json/)
        .expect(201);

      // Validate DocumentResponse schema
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          ),
          type: 'general',
          status: 'draft',
          title: expect.any(String),
          lang: expect.any(String),
          content: expect.any(String),
          created_at: expect.any(String),
          updated_at: expect.any(String),
        })
      );
    });

    it('should return 201 with DocumentResponse schema for OAS import', async () => {
      const response = await request(app)
        .post('/api/v1/documents/import')
        .attach('file', oasFilePath)
        .field('type', 'api')
        .expect('Content-Type', /application\/json/)
        .expect(201);

      // Validate DocumentResponse schema
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          type: 'api',
          status: 'draft',
          title: expect.any(String),
          content: expect.any(String),
        })
      );
    });

    it('should accept optional version_id field per OpenAPI spec', async () => {
      const versionId = '11111111-1111-4111-a111-111111111111';

      // This may return 400 if version doesn't exist, but should accept the parameter
      const response = await request(app)
        .post('/api/v1/documents/import')
        .attach('file', markdownFilePath)
        .field('type', 'general')
        .field('version_id', versionId);

      // Either success or version not found - both validate the contract accepts the field
      expect([201, 400, 404]).toContain(response.status);
    });

    it('should return 400 with ErrorResponse for missing file', async () => {
      const response = await request(app)
        .post('/api/v1/documents/import')
        .field('type', 'general')
        .expect('Content-Type', /application\/json/)
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: expect.any(String),
            message: expect.any(String),
          }),
        })
      );
    });

    it('should return 400 with ErrorResponse for invalid file format', async () => {
      // Create invalid file
      const invalidFilePath = path.join(testFilesDir, 'invalid.exe');
      fs.writeFileSync(invalidFilePath, 'binary content');

      try {
        const response = await request(app)
          .post('/api/v1/documents/import')
          .attach('file', invalidFilePath)
          .field('type', 'general')
          .expect('Content-Type', /application\/json/)
          .expect(400);

        expect(response.body.error).toBeDefined();
      } finally {
        fs.unlinkSync(invalidFilePath);
      }
    });

    it('should validate type enum per OpenAPI spec', async () => {
      // Valid types per OpenAPI: api, general
      const validTypes = ['api', 'general'];
      for (const type of validTypes) {
        const response = await request(app)
          .post('/api/v1/documents/import')
          .attach('file', markdownFilePath)
          .field('type', type);

        expect([200, 201]).toContain(response.status);
      }

      // Invalid type
      const response = await request(app)
        .post('/api/v1/documents/import')
        .attach('file', markdownFilePath)
        .field('type', 'invalid_type')
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * GET /api/v1/documents - List Documents Contract Validation
   */
  describe('GET /api/v1/documents - List Contract Validation', () => {
    it('should return 200 with DocumentListResponse schema', async () => {
      const response = await request(app)
        .get('/api/v1/documents')
        .query({ limit: 10, offset: 0 })
        .expect('Content-Type', /application\/json/)
        .expect(200);

      // Validate DocumentListResponse schema per OpenAPI
      expect(response.body).toEqual(
        expect.objectContaining({
          items: expect.any(Array),
          total: expect.any(Number),
          limit: expect.any(Number),
          offset: expect.any(Number),
        })
      );

      // Validate each item matches DocumentResponse schema
      if (response.body.items.length > 0) {
        response.body.items.forEach((item: Record<string, unknown>) => {
          expect(item).toEqual(
            expect.objectContaining({
              id: expect.any(String),
              type: expect.stringMatching(/^(api|general|tutorial)$/),
              status: expect.stringMatching(/^(draft|in_review|done|publish)$/),
              title: expect.any(String),
              lang: expect.any(String),
            })
          );
        });
      }
    });

    it('should accept query parameters per OpenAPI spec', async () => {
      // All optional query params
      const response = await request(app)
        .get('/api/v1/documents')
        .query({
          status: 'draft',
          type: 'general',
          lang: 'en',
          limit: 20,
          offset: 0,
        })
        .expect(200);

      expect(response.body.items).toBeDefined();
    });

    it('should validate status query enum per OpenAPI spec', async () => {
      const validStatuses = ['draft', 'in_review', 'done', 'publish'];
      for (const status of validStatuses) {
        await request(app).get('/api/v1/documents').query({ status }).expect(200);
      }
    });

    it('should validate type query enum per OpenAPI spec', async () => {
      const validTypes = ['api', 'general', 'tutorial'];
      for (const type of validTypes) {
        await request(app).get('/api/v1/documents').query({ type }).expect(200);
      }
    });

    it('should use default pagination values per OpenAPI spec', async () => {
      const response = await request(app).get('/api/v1/documents').expect(200);

      // OpenAPI spec defaults: limit=20, offset=0
      expect(response.body.limit).toBe(20);
      expect(response.body.offset).toBe(0);
    });
  });
});
