/**
 * Acceptance Tests for Concept CRUD Operations
 * TDD: These tests validate the complete user story workflow
 * Per Constitution Principle II: Tests MUST be independent, repeatable, and fast (< 1 second per test)
 *
 * Independent Test: Can be fully tested by creating a Concept via POST /api/v1/concepts,
 * retrieving it via GET /api/v1/concepts/{id}, updating its description, and verifying
 * impact analysis via GET /api/v1/concepts/{id}/documents.
 */

// Mock GraphDB queries
jest.mock('../../src/db/graphdb/queries', () => {
  const mockConcepts = new Map<string, Record<string, unknown>>();
  const mockDocuments = new Map<string, Record<string, unknown>>();
  const mockConceptDocumentLinks = new Map<string, string[]>();
  let conceptCounter = 0;
  let docCounter = 0;

  return {
    // Document queries
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
    getDocumentNode: jest.fn().mockImplementation(async (id: string) => mockDocuments.get(id) || null),
    updateDocumentNode: jest.fn(),
    deleteDocumentNode: jest.fn(),
    listDocumentNodes: jest.fn().mockResolvedValue({ items: [], total: 0 }),

    // Concept queries
    createConceptNode: jest.fn().mockImplementation(async (data: Record<string, unknown>) => {
      conceptCounter++;
      const concept = {
        ...data,
        id: data.id || `concept-${conceptCounter}`,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockConcepts.set(concept.id as string, concept);
      return concept;
    }),
    getConceptNode: jest.fn().mockImplementation(async (id: string) => mockConcepts.get(id) || null),
    updateConceptNode: jest.fn().mockImplementation(
      async (id: string, updates: Record<string, unknown>) => {
        const concept = mockConcepts.get(id);
        if (!concept) return null;
        const updated = { ...concept, ...updates, updated_at: new Date() };
        mockConcepts.set(id, updated);
        return updated;
      }
    ),
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
    linkDocumentToConcept: jest.fn().mockImplementation(
      async (documentId: string, conceptId: string) => {
        const links = mockConceptDocumentLinks.get(conceptId) || [];
        if (!links.includes(documentId)) {
          links.push(documentId);
          mockConceptDocumentLinks.set(conceptId, links);
        }
        return true;
      }
    ),
    getDocumentsUsingConcept: jest.fn().mockImplementation(async (conceptId: string) => {
      const concept = mockConcepts.get(conceptId);
      if (!concept) return null;
      const documentIds = mockConceptDocumentLinks.get(conceptId) || [];
      const documents = documentIds.map(id => mockDocuments.get(id)).filter(Boolean);
      return { items: documents, total: documents.length };
    }),
  };
});

// Mock MinIO storage
jest.mock('../../src/db/storage/connection', () => ({
  uploadFile: jest.fn().mockResolvedValue('key'),
  downloadFile: jest.fn().mockResolvedValue(Buffer.from('')),
  deleteFile: jest.fn().mockResolvedValue(undefined),
  fileExists: jest.fn().mockResolvedValue(true),
  initializeStorage: jest.fn().mockResolvedValue(undefined),
}));

import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Concept CRUD - Acceptance Tests', () => {
  // Test data matching User Story 2 requirements
  // Note: category field removed - categorization via Concept relationships
  const testConcept = {
    term: 'Access Token',
    description: 'A credential used to access protected resources on behalf of a user.',
    lang: 'en',
  };

  let createdConceptId: string;

  describe('POST /api/v1/concepts - Create Concept', () => {
    it('should create a new concept and return 201', async () => {
      const response = await request(app)
        .post('/api/v1/concepts')
        .send(testConcept)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        term: testConcept.term,
        description: testConcept.description,
        lang: testConcept.lang,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });

      createdConceptId = response.body.id;
    });

    it('should return 400 for missing required term', async () => {
      const invalidConcept = {
        description: 'Description only',
        lang: 'en',
      };

      const response = await request(app)
        .post('/api/v1/concepts')
        .send(invalidConcept)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required description', async () => {
      const invalidConcept = {
        term: 'Term only',
        lang: 'en',
      };

      const response = await request(app)
        .post('/api/v1/concepts')
        .send(invalidConcept)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for invalid language code', async () => {
      const invalidConcept = {
        ...testConcept,
        lang: 'invalid',
      };

      const response = await request(app)
        .post('/api/v1/concepts')
        .send(invalidConcept)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    });
  // Note: category field has been removed - no category-related tests needed

  describe('GET /api/v1/concepts/{id} - Get Concept', () => {
    beforeAll(async () => {
      if (!createdConceptId) {
        const response = await request(app).post('/api/v1/concepts').send(testConcept);
        createdConceptId = response.body.id;
      }
    });

    it('should retrieve concept by ID and return 200', async () => {
      const response = await request(app)
        .get(`/api/v1/concepts/${createdConceptId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdConceptId,
        term: expect.any(String),
        description: expect.any(String),
        lang: expect.any(String),
      });
    });

    it('should return 404 for non-existent concept', async () => {
      const nonExistentId = '00000000-0000-4000-a000-000000000000';

      const response = await request(app)
        .get(`/api/v1/concepts/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/v1/concepts/invalid-uuid')
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/v1/concepts/{id} - Update Concept', () => {
    beforeAll(async () => {
      if (!createdConceptId) {
        const response = await request(app).post('/api/v1/concepts').send(testConcept);
        createdConceptId = response.body.id;
      }
    });

    it('should update concept description and return 200', async () => {
      const updateData = {
        description: 'Updated: A credential for accessing protected APIs.',
      };

      const response = await request(app)
        .put(`/api/v1/concepts/${createdConceptId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.description).toBe(updateData.description);
      expect(response.body.id).toBe(createdConceptId);
    });

    it('should update concept term and return 200', async () => {
      const updateData = {
        term: 'OAuth Access Token',
      };

      const response = await request(app)
        .put(`/api/v1/concepts/${createdConceptId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.term).toBe(updateData.term);
    });

    it('should return 404 for non-existent concept', async () => {
      const nonExistentId = '00000000-0000-4000-a000-000000000000';

      const response = await request(app)
        .put(`/api/v1/concepts/${nonExistentId}`)
        .send({ term: 'Updated Term' })
        .expect(404);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should update updated_at timestamp', async () => {
      const beforeUpdate = await request(app).get(`/api/v1/concepts/${createdConceptId}`);
      const beforeTimestamp = beforeUpdate.body.updated_at;

      await new Promise(resolve => setTimeout(resolve, 10));

      const updateData = { term: 'Timestamp Update Test' };
      const response = await request(app)
        .put(`/api/v1/concepts/${createdConceptId}`)
        .send(updateData)
        .expect(200);

      expect(new Date(response.body.updated_at).getTime()).toBeGreaterThan(
        new Date(beforeTimestamp).getTime()
      );
    });
  });

  describe('DELETE /api/v1/concepts/{id} - Delete Concept', () => {
    let conceptToDelete: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/concepts')
        .send({ ...testConcept, term: 'Concept to Delete' });
      conceptToDelete = response.body.id;
    });

    it('should delete concept and return 204', async () => {
      await request(app)
        .delete(`/api/v1/concepts/${conceptToDelete}`)
        .expect(204);

      // Verify deletion
      await request(app)
        .get(`/api/v1/concepts/${conceptToDelete}`)
        .expect(404);
    });

    it('should return 404 for non-existent concept', async () => {
      const nonExistentId = '00000000-0000-4000-a000-000000000000';

      const response = await request(app)
        .delete(`/api/v1/concepts/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/concepts - List Concepts', () => {
    beforeAll(async () => {
      // Create multiple concepts for listing tests
      // Note: category field removed - categorization via relationships
      const concepts = [
        { term: 'API Key', description: 'A key for API access', lang: 'en' },
        { term: 'Bearer Token', description: 'A bearer authentication token', lang: 'en' },
        { term: '액세스 토큰', description: '보호된 리소스에 접근하기 위한 토큰', lang: 'ko' },
      ];

      for (const concept of concepts) {
        await request(app).post('/api/v1/concepts').send(concept);
      }
    });

    it('should return paginated list of concepts', async () => {
      const response = await request(app)
        .get('/api/v1/concepts')
        .query({ limit: 10, offset: 0 })
        .expect(200);

      expect(response.body).toMatchObject({
        items: expect.any(Array),
        total: expect.any(Number),
        limit: 10,
        offset: 0,
      });
    });

    it('should filter concepts by language', async () => {
      const response = await request(app)
        .get('/api/v1/concepts')
        .query({ lang: 'ko' })
        .expect(200);

      const allKorean = response.body.items.every(
        (c: { lang: string }) => c.lang === 'ko'
      );
      expect(allKorean).toBe(true);
    });

    it('should respect pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/concepts')
        .query({ limit: 2, offset: 0 })
        .expect(200);

      expect(response.body.items.length).toBeLessThanOrEqual(2);
      expect(response.body.limit).toBe(2);
      expect(response.body.offset).toBe(0);
    });
  });

  describe('GET /api/v1/concepts/{id}/documents - Impact Analysis', () => {
    let impactConceptId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/v1/concepts')
        .send({ ...testConcept, term: 'Impact Analysis Concept' });
      impactConceptId = response.body.id;
    });

    it('should return documents using the concept', async () => {
      const response = await request(app)
        .get(`/api/v1/concepts/${impactConceptId}/documents`)
        .expect(200);

      expect(response.body).toMatchObject({
        items: expect.any(Array),
        total: expect.any(Number),
      });
    });

    it('should return 404 for non-existent concept', async () => {
      const nonExistentId = '00000000-0000-4000-a000-000000000000';

      const response = await request(app)
        .get(`/api/v1/concepts/${nonExistentId}/documents`)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });

    it('should return empty array when no documents use the concept', async () => {
      const response = await request(app)
        .get(`/api/v1/concepts/${impactConceptId}/documents`)
        .expect(200);

      // Initially, no documents should use this concept
      expect(response.body.items).toEqual([]);
      expect(response.body.total).toBe(0);
    });
  });
});

