/**
 * Contract Tests for Concept Relationships API
 *
 * Tests for SUBTYPE_OF, PART_OF, SYNONYM_OF relationships
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import { Express } from 'express';

// Mock GraphDB queries
jest.mock('../../src/db/graphdb/queries', () => {
  const actual = jest.requireActual('../../src/db/graphdb/queries');
  return {
    ...actual,
    getConceptNode: jest.fn(),
    linkConceptSubtypeOf: jest.fn(),
    unlinkConceptSubtypeOf: jest.fn(),
    getConceptSupertypes: jest.fn(),
    getConceptSubtypes: jest.fn(),
    linkConceptPartOf: jest.fn(),
    unlinkConceptPartOf: jest.fn(),
    getConceptWholeOf: jest.fn(),
    getConceptParts: jest.fn(),
    linkConceptSynonymOf: jest.fn(),
    unlinkConceptSynonymOf: jest.fn(),
    getConceptSynonyms: jest.fn(),
    // Mock other queries that might be called
    createConceptNode: jest.fn(),
    updateConceptNode: jest.fn(),
    deleteConceptNode: jest.fn(),
    listConceptNodes: jest.fn(),
    getDocumentsUsingConcept: jest.fn(),
  };
});

import * as queries from '../../src/db/graphdb/queries';

const mockedQueries = queries as jest.Mocked<typeof queries>;

describe('Concept Relationships API Contract Tests', () => {
  let app: Express;

  const testConcept1 = {
    id: '00000000-0000-4000-a000-000000000001',
    term: 'API',
    description: 'Application Programming Interface',
    category: 'technology',
    lang: 'en',
    created_at: new Date('2025-12-08T10:00:00.000Z'),
    updated_at: new Date('2025-12-08T10:00:00.000Z'),
  };

  const testConcept2 = {
    id: '00000000-0000-4000-a000-000000000002',
    term: 'REST API',
    description: 'Representational State Transfer API',
    category: 'technology',
    lang: 'en',
    created_at: new Date('2025-12-08T10:00:00.000Z'),
    updated_at: new Date('2025-12-08T10:00:00.000Z'),
  };


  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // SUBTYPE_OF Relationship Tests
  // ========================================
  describe('SUBTYPE_OF Relationship', () => {
    it('POST /api/v1/concepts/:id/supertypes - should link concept as subtype', async () => {
      mockedQueries.getConceptNode
        .mockResolvedValueOnce(testConcept2) // child
        .mockResolvedValueOnce(testConcept1); // parent
      mockedQueries.linkConceptSubtypeOf.mockResolvedValue(true);

      const response = await request(app)
        .post(`/api/v1/concepts/${testConcept2.id}/supertypes`)
        .send({ parent_id: testConcept1.id })
        .expect(201);

      expect(response.body).toHaveProperty('message');
    });

    it('POST /api/v1/concepts/:id/supertypes - should return 400 for missing parent_id', async () => {
      const response = await request(app)
        .post(`/api/v1/concepts/${testConcept1.id}/supertypes`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('GET /api/v1/concepts/:id/supertypes - should return supertypes', async () => {
      mockedQueries.getConceptNode.mockResolvedValue(testConcept2);
      mockedQueries.getConceptSupertypes.mockResolvedValue([testConcept1]);

      const response = await request(app)
        .get(`/api/v1/concepts/${testConcept2.id}/supertypes`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body.items.length).toBe(1);
    });

    it('GET /api/v1/concepts/:id/subtypes - should return subtypes', async () => {
      mockedQueries.getConceptNode.mockResolvedValue(testConcept1);
      mockedQueries.getConceptSubtypes.mockResolvedValue([testConcept2]);

      const response = await request(app)
        .get(`/api/v1/concepts/${testConcept1.id}/subtypes`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body.items.length).toBe(1);
    });

    it('DELETE /api/v1/concepts/:id/supertypes/:parentId - should unlink subtype', async () => {
      mockedQueries.unlinkConceptSubtypeOf.mockResolvedValue(true);

      await request(app)
        .delete(`/api/v1/concepts/${testConcept2.id}/supertypes/${testConcept1.id}`)
        .expect(204);
    });

    it('DELETE /api/v1/concepts/:id/supertypes/:parentId - should succeed when relationship exists', async () => {
      mockedQueries.unlinkConceptSubtypeOf.mockResolvedValue(true);

      await request(app)
        .delete(`/api/v1/concepts/${testConcept2.id}/supertypes/${testConcept1.id}`)
        .expect(204);
    });
  });

  // ========================================
  // PART_OF Relationship Tests
  // ========================================
  describe('PART_OF Relationship', () => {
    it('POST /api/v1/concepts/:id/whole-of - should link concept as part', async () => {
      mockedQueries.getConceptNode
        .mockResolvedValueOnce(testConcept2) // part
        .mockResolvedValueOnce(testConcept1); // whole
      mockedQueries.linkConceptPartOf.mockResolvedValue(true);

      const response = await request(app)
        .post(`/api/v1/concepts/${testConcept2.id}/whole-of`)
        .send({ whole_id: testConcept1.id })
        .expect(201);

      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/v1/concepts/:id/whole-of - should return what this is part of', async () => {
      mockedQueries.getConceptNode.mockResolvedValue(testConcept2);
      mockedQueries.getConceptWholeOf.mockResolvedValue([testConcept1]);

      const response = await request(app)
        .get(`/api/v1/concepts/${testConcept2.id}/whole-of`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body.items.length).toBe(1);
    });

    it('GET /api/v1/concepts/:id/parts - should return parts of this', async () => {
      mockedQueries.getConceptNode.mockResolvedValue(testConcept1);
      mockedQueries.getConceptParts.mockResolvedValue([testConcept2]);

      const response = await request(app)
        .get(`/api/v1/concepts/${testConcept1.id}/parts`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body.items.length).toBe(1);
    });

    it('DELETE /api/v1/concepts/:id/whole-of/:wholeId - should unlink part-of', async () => {
      mockedQueries.unlinkConceptPartOf.mockResolvedValue(true);

      await request(app)
        .delete(`/api/v1/concepts/${testConcept2.id}/whole-of/${testConcept1.id}`)
        .expect(204);
    });
  });

  // ========================================
  // SYNONYM_OF Relationship Tests
  // ========================================
  describe('SYNONYM_OF Relationship', () => {
    const testSynonym = {
      ...testConcept1,
      id: '00000000-0000-4000-a000-000000000004',
      term: 'Application Interface',
    };

    it('POST /api/v1/concepts/:id/synonyms - should link concepts as synonyms', async () => {
      mockedQueries.getConceptNode
        .mockResolvedValueOnce(testConcept1)
        .mockResolvedValueOnce(testSynonym);
      mockedQueries.linkConceptSynonymOf.mockResolvedValue(true);

      const response = await request(app)
        .post(`/api/v1/concepts/${testConcept1.id}/synonyms`)
        .send({ synonym_id: testSynonym.id })
        .expect(201);

      expect(response.body).toHaveProperty('message');
    });

    it('POST /api/v1/concepts/:id/synonyms - should return 400 for missing synonym_id', async () => {
      const response = await request(app)
        .post(`/api/v1/concepts/${testConcept1.id}/synonyms`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('GET /api/v1/concepts/:id/synonyms - should return synonyms', async () => {
      mockedQueries.getConceptNode.mockResolvedValue(testConcept1);
      mockedQueries.getConceptSynonyms.mockResolvedValue([testSynonym]);

      const response = await request(app)
        .get(`/api/v1/concepts/${testConcept1.id}/synonyms`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body.items.length).toBe(1);
    });

    it('DELETE /api/v1/concepts/:id/synonyms/:synonymId - should unlink synonyms', async () => {
      mockedQueries.unlinkConceptSynonymOf.mockResolvedValue(true);

      await request(app)
        .delete(`/api/v1/concepts/${testConcept1.id}/synonyms/${testSynonym.id}`)
        .expect(204);
    });
  });
});

