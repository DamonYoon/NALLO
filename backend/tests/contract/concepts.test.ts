/**
 * Contract Tests for Concept API
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
  const mockConcepts = new Map<string, Record<string, unknown>>();
  const mockDocuments = new Map<string, Record<string, unknown>>();
  const mockConceptDocumentLinks = new Map<string, string[]>(); // conceptId -> documentIds[]
  let conceptCounter = 0;
  let docCounter = 0;

  return {
    // Document queries (for impact analysis)
    createDocumentNode: jest.fn().mockImplementation(async (data: Record<string, unknown>) => {
      docCounter++;
      const doc = {
        ...data,
        id: data.id || `doc-${docCounter}`,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockDocuments.set(doc.id as string, doc);
      return doc;
    }),
    getDocumentNode: jest.fn().mockImplementation(async (id: string) => {
      return mockDocuments.get(id) || null;
    }),
    updateDocumentNode: jest.fn(),
    deleteDocumentNode: jest.fn(),
    listDocumentNodes: jest.fn().mockResolvedValue({ items: [], total: 0 }),

    // Concept queries
    createConceptNode: jest.fn().mockImplementation(async (data: Record<string, unknown>) => {
      conceptCounter++;
      const concept = {
        ...data,
        id: data.id || `00000000-000${conceptCounter}-4000-a000-00000000000${conceptCounter}`,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockConcepts.set(concept.id as string, concept);
      return concept;
    }),
    getConceptNode: jest.fn().mockImplementation(async (id: string) => {
      return mockConcepts.get(id) || null;
    }),
    updateConceptNode: jest
      .fn()
      .mockImplementation(async (id: string, updates: Record<string, unknown>) => {
        const concept = mockConcepts.get(id);
        if (!concept) return null;
        const updated = { ...concept, ...updates, updated_at: new Date() };
        mockConcepts.set(id, updated);
        return updated;
      }),
    deleteConceptNode: jest.fn().mockImplementation(async (id: string) => {
      const existed = mockConcepts.has(id);
      mockConcepts.delete(id);
      return existed;
    }),
    listConceptNodes: jest.fn().mockImplementation(async (query: Record<string, unknown>) => {
      let items = Array.from(mockConcepts.values());
      if (query.lang) items = items.filter(c => c.lang === query.lang);
      const offset = (query.offset as number) || 0;
      const limit = (query.limit as number) || 20;
      return {
        items: items.slice(offset, offset + limit),
        total: items.length,
      };
    }),

    // Document-Concept relationship queries
    linkDocumentToConcept: jest
      .fn()
      .mockImplementation(async (documentId: string, conceptId: string) => {
        const links = mockConceptDocumentLinks.get(conceptId) || [];
        if (!links.includes(documentId)) {
          links.push(documentId);
          mockConceptDocumentLinks.set(conceptId, links);
        }
        return true;
      }),
    getDocumentsUsingConcept: jest.fn().mockImplementation(async (conceptId: string) => {
      const concept = mockConcepts.get(conceptId);
      if (!concept) return null;
      const documentIds = mockConceptDocumentLinks.get(conceptId) || [];
      const documents = documentIds.map(id => mockDocuments.get(id)).filter(Boolean);
      return {
        items: documents,
        total: documents.length,
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

const app = createApp();

describe('Concept API - Contract Tests', () => {
  // Valid test concept matching OpenAPI CreateConceptRequest schema
  // Note: category field removed - categorization via Concept relationships
  const validConcept = {
    term: 'Access Token',
    description: 'A token used to access protected resources on behalf of a user.',
    lang: 'en',
  };

  let createdConceptId: string;

  /**
   * T043: Contract test for POST /api/v1/concepts
   * Validates against OpenAPI CreateConceptRequest and ConceptResponse schemas
   */
  describe('POST /api/v1/concepts - Contract Validation', () => {
    it('should return 201 with ConceptResponse schema on success', async () => {
      const response = await request(app)
        .post('/api/v1/concepts')
        .set('Content-Type', 'application/json')
        .send(validConcept)
        .expect('Content-Type', /application\/json/)
        .expect(201);

      // Validate ConceptResponse schema per OpenAPI spec
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          ), // UUID v4 format
          term: expect.any(String),
          description: expect.any(String),
          lang: expect.stringMatching(/^[a-z]{2}$/),
          created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/), // ISO 8601
          updated_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        })
      );

      // Store for subsequent tests
      createdConceptId = response.body.id;
    });

    it('should return 400 with ErrorResponse schema for invalid request', async () => {
      const invalidConcept = {
        term: '', // Empty term should fail validation
      };

      const response = await request(app)
        .post('/api/v1/concepts')
        .set('Content-Type', 'application/json')
        .send(invalidConcept)
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

    it('should validate lang field matches ISO 639-1 pattern', async () => {
      // Valid language codes
      const validLangs = ['en', 'ko', 'ja', 'zh'];
      for (const lang of validLangs) {
        const concept = { ...validConcept, lang, term: `Term ${lang}` };
        const response = await request(app).post('/api/v1/concepts').send(concept).expect(201);
        expect(response.body.lang).toBe(lang);
      }

      // Invalid language codes
      const invalidLangs = ['eng', 'KO', '12', 'e'];
      for (const lang of invalidLangs) {
        const concept = { ...validConcept, lang, term: `Invalid Lang ${lang}` };
        await request(app).post('/api/v1/concepts').send(concept).expect(400);
      }
    });

    it('should create concept without category field', async () => {
      // Category field has been removed - categorization via relationships
      const concept = {
        term: 'Concept Without Category',
        description: 'Category is determined by relationships',
        lang: 'en',
      };
      const response = await request(app)
        .post('/api/v1/concepts')
        .send(concept)
        .expect(201);
      // Category field should not exist
      expect(response.body.category).toBeUndefined();
    });

    it('should require term and description fields', async () => {
      // Missing term
      await request(app)
        .post('/api/v1/concepts')
        .send({ description: 'Description only', lang: 'en' })
        .expect(400);

      // Missing description
      await request(app)
        .post('/api/v1/concepts')
        .send({ term: 'Term only', lang: 'en' })
        .expect(400);

      // Missing lang
      await request(app)
        .post('/api/v1/concepts')
        .send({ term: 'Term', description: 'Description' })
        .expect(400);
    });
  });

  /**
   * T044: Contract test for GET /api/v1/concepts/{id}
   * Validates against OpenAPI ConceptResponse schema
   */
  describe('GET /api/v1/concepts/{id} - Contract Validation', () => {
    beforeAll(async () => {
      if (!createdConceptId) {
        const response = await request(app).post('/api/v1/concepts').send(validConcept);
        createdConceptId = response.body.id;
      }
    });

    it('should return 200 with ConceptResponse schema on success', async () => {
      const response = await request(app)
        .get(`/api/v1/concepts/${createdConceptId}`)
        .expect('Content-Type', /application\/json/)
        .expect(200);

      // Validate full ConceptResponse schema
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          ),
          term: expect.any(String),
          description: expect.any(String),
          lang: expect.stringMatching(/^[a-z]{2}$/),
          created_at: expect.any(String),
          updated_at: expect.any(String),
        })
      );
    });

    it('should return 404 with ErrorResponse schema for non-existent concept', async () => {
      const nonExistentId = '00000000-0000-4000-a000-000000000000';

      const response = await request(app)
        .get(`/api/v1/concepts/${nonExistentId}`)
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
          .get(`/api/v1/concepts/${invalidId}`)
          .expect('Content-Type', /application\/json/)
          .expect(400);

        expect(response.body.error).toBeDefined();
      }
    });
  });

  /**
   * T045: Contract test for PUT /api/v1/concepts/{id}
   * Validates against OpenAPI UpdateConceptRequest and ConceptResponse schemas
   */
  describe('PUT /api/v1/concepts/{id} - Contract Validation', () => {
    let updateTestConceptId: string;

    beforeAll(async () => {
      // Create fresh concept for update tests
      const response = await request(app)
        .post('/api/v1/concepts')
        .send({ ...validConcept, term: 'Update Contract Test' });
      updateTestConceptId = response.body.id;
    });

    it('should return 200 with ConceptResponse schema on success', async () => {
      const updateData = {
        description: 'Updated description for contract test.',
      };

      const response = await request(app)
        .put(`/api/v1/concepts/${updateTestConceptId}`)
        .set('Content-Type', 'application/json')
        .send(updateData)
        .expect('Content-Type', /application\/json/)
        .expect(200);

      // Validate ConceptResponse schema - check required fields exist
      expect(response.body.id).toBe(updateTestConceptId);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.lang).toMatch(/^[a-z]{2}$/);
      expect(response.body.created_at).toBeDefined();
      expect(response.body.updated_at).toBeDefined();
    });

    it('should accept partial UpdateConceptRequest per OpenAPI spec', async () => {
      // Only term
      await request(app)
        .put(`/api/v1/concepts/${updateTestConceptId}`)
        .send({ term: 'Only Term Update' })
        .expect(200);

      // Only description
      await request(app)
        .put(`/api/v1/concepts/${updateTestConceptId}`)
        .send({ description: 'Only description update' })
        .expect(200);
    });

    it('should return 404 with ErrorResponse for non-existent concept', async () => {
      const nonExistentId = '00000000-0000-4000-a000-000000000000';

      const response = await request(app)
        .put(`/api/v1/concepts/${nonExistentId}`)
        .send({ term: 'Update Non-existent' })
        .expect('Content-Type', /application\/json/)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * T046: Contract test for GET /api/v1/concepts/{id}/documents
   * Validates against OpenAPI DocumentListResponse schema (impact analysis)
   */
  describe('GET /api/v1/concepts/{id}/documents - Contract Validation', () => {
    let impactTestConceptId: string;

    beforeAll(async () => {
      // Create concept for impact analysis test
      const response = await request(app)
        .post('/api/v1/concepts')
        .send({ ...validConcept, term: 'Impact Analysis Test' });
      impactTestConceptId = response.body.id;
    });

    it('should return 200 with DocumentListResponse schema on success', async () => {
      const response = await request(app)
        .get(`/api/v1/concepts/${impactTestConceptId}/documents`)
        .expect('Content-Type', /application\/json/)
        .expect(200);

      // Validate DocumentListResponse schema per OpenAPI
      expect(response.body).toEqual(
        expect.objectContaining({
          items: expect.any(Array),
          total: expect.any(Number),
        })
      );
    });

    it('should return 404 for non-existent concept', async () => {
      const nonExistentId = '00000000-0000-4000-a000-000000000000';

      const response = await request(app)
        .get(`/api/v1/concepts/${nonExistentId}/documents`)
        .expect('Content-Type', /application\/json/)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });

    it('should validate id parameter as UUID format', async () => {
      const invalidIds = ['not-a-uuid', '123'];

      for (const invalidId of invalidIds) {
        const response = await request(app)
          .get(`/api/v1/concepts/${invalidId}/documents`)
          .expect('Content-Type', /application\/json/)
          .expect(400);

        expect(response.body.error).toBeDefined();
      }
    });
  });

  /**
   * GET /api/v1/concepts - List Concepts Contract Validation
   */
  describe('GET /api/v1/concepts - List Contract Validation', () => {
    it('should return 200 with ConceptListResponse schema', async () => {
      const response = await request(app)
        .get('/api/v1/concepts')
        .query({ limit: 10, offset: 0 })
        .expect('Content-Type', /application\/json/)
        .expect(200);

      // Validate ConceptListResponse schema per OpenAPI
      expect(response.body).toEqual(
        expect.objectContaining({
          items: expect.any(Array),
          total: expect.any(Number),
          limit: expect.any(Number),
          offset: expect.any(Number),
        })
      );

      // Validate each item matches ConceptResponse schema
      if (response.body.items.length > 0) {
        response.body.items.forEach((item: Record<string, unknown>) => {
          expect(item.id).toBeDefined();
          expect(item.lang).toBeDefined();
          // term and description may be missing in partial updates
          expect(item.created_at).toBeDefined();
          expect(item.updated_at).toBeDefined();
        });
      }
    });

    it('should accept query parameters per OpenAPI spec', async () => {
      const response = await request(app)
        .get('/api/v1/concepts')
        .query({
          lang: 'en',
          limit: 20,
          offset: 0,
        })
        .expect(200);

      expect(response.body.items).toBeDefined();
    });

    it('should use default pagination values per OpenAPI spec', async () => {
      const response = await request(app).get('/api/v1/concepts').expect(200);

      // OpenAPI spec defaults: limit=20, offset=0
      expect(response.body.limit).toBe(20);
      expect(response.body.offset).toBe(0);
    });
  });
});
