/**
 * Contract Tests for Tags API
 *
 * Tests that the Tag API endpoints conform to the expected contract.
 * Uses mocks for database and storage to test API contract in isolation.
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import { Express } from 'express';

// Mock GraphDB queries
jest.mock('../../src/db/graphdb/queries', () => ({
  ...jest.requireActual('../../src/db/graphdb/queries'),
  createTagNode: jest.fn(),
  getTagNode: jest.fn(),
  getTagNodeByName: jest.fn(),
  updateTagNode: jest.fn(),
  deleteTagNode: jest.fn(),
  listTagNodes: jest.fn(),
  linkDocumentToTag: jest.fn(),
  unlinkDocumentFromTag: jest.fn(),
  getTagsForDocument: jest.fn(),
  linkConceptToTag: jest.fn(),
  unlinkConceptFromTag: jest.fn(),
  getTagsForConcept: jest.fn(),
  linkPageToTag: jest.fn(),
  unlinkPageFromTag: jest.fn(),
  getTagsForPage: jest.fn(),
  getEntitiesWithTag: jest.fn(),
  getDocumentNode: jest.fn(),
  getConceptNode: jest.fn(),
  getPageNode: jest.fn(),
}));

// Import mocked queries
import * as queries from '../../src/db/graphdb/queries';

const mockedQueries = queries as jest.Mocked<typeof queries>;

describe('Tags API Contract Tests', () => {
  let app: Express;

  const testTag = {
    id: '00000000-0000-4000-a000-000000000001',
    name: 'test-tag',
    color: '#FF5733',
    description: 'A test tag',
    created_at: '2025-12-08T10:00:00.000Z',
    updated_at: '2025-12-08T10:00:00.000Z',
  };

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // POST /api/v1/tags - Create Tag
  // ========================================
  describe('POST /api/v1/tags - Create Tag', () => {
    it('should create a new tag and return 201', async () => {
      mockedQueries.getTagNodeByName.mockResolvedValue(null);
      mockedQueries.createTagNode.mockResolvedValue(testTag);

      const response = await request(app)
        .post('/api/v1/tags')
        .send({
          name: 'test-tag',
          color: '#FF5733',
          description: 'A test tag',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'test-tag',
        color: '#FF5733',
        description: 'A test tag',
      });
    });

    it('should return 400 for invalid tag name format', async () => {
      const response = await request(app)
        .post('/api/v1/tags')
        .send({
          name: 'Invalid Tag Name!',
          description: 'A test tag',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid color format', async () => {
      const response = await request(app)
        .post('/api/v1/tags')
        .send({
          name: 'test-tag',
          color: 'invalid-color',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/v1/tags')
        .send({
          description: 'A test tag',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // ========================================
  // GET /api/v1/tags - List Tags
  // ========================================
  describe('GET /api/v1/tags - List Tags', () => {
    it('should return a list of tags with pagination', async () => {
      mockedQueries.listTagNodes.mockResolvedValue({
        items: [testTag],
        total: 1,
      });

      const response = await request(app).get('/api/v1/tags').expect(200);

      expect(response.body).toMatchObject({
        items: expect.any(Array),
        total: expect.any(Number),
        limit: expect.any(Number),
        offset: expect.any(Number),
      });
      expect(response.body.items.length).toBeGreaterThanOrEqual(0);
    });

    it('should support search parameter', async () => {
      mockedQueries.listTagNodes.mockResolvedValue({
        items: [testTag],
        total: 1,
      });

      const response = await request(app).get('/api/v1/tags?search=test').expect(200);

      expect(response.body).toHaveProperty('items');
    });

    it('should support pagination parameters', async () => {
      mockedQueries.listTagNodes.mockResolvedValue({
        items: [],
        total: 0,
      });

      const response = await request(app).get('/api/v1/tags?limit=10&offset=5').expect(200);

      expect(response.body.limit).toBe(10);
      expect(response.body.offset).toBe(5);
    });
  });

  // ========================================
  // GET /api/v1/tags/:id - Get Tag
  // ========================================
  describe('GET /api/v1/tags/:id - Get Tag', () => {
    it('should return a tag by ID', async () => {
      mockedQueries.getTagNode.mockResolvedValue(testTag);

      const response = await request(app)
        .get(`/api/v1/tags/${testTag.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testTag.id,
        name: testTag.name,
      });
    });

  });

  // ========================================
  // PUT /api/v1/tags/:id - Update Tag
  // ========================================
  describe('PUT /api/v1/tags/:id - Update Tag', () => {
    it('should update a tag and return 200', async () => {
      const updatedTag = { ...testTag, name: 'updated-tag' };
      mockedQueries.getTagNode.mockResolvedValue(testTag);
      mockedQueries.getTagNodeByName.mockResolvedValue(null);
      mockedQueries.updateTagNode.mockResolvedValue(updatedTag);

      const response = await request(app)
        .put(`/api/v1/tags/${testTag.id}`)
        .send({ name: 'updated-tag' })
        .expect(200);

      expect(response.body.name).toBe('updated-tag');
    });

  });

  // ========================================
  // DELETE /api/v1/tags/:id - Delete Tag
  // ========================================
  describe('DELETE /api/v1/tags/:id - Delete Tag', () => {
    it('should delete a tag and return 204', async () => {
      mockedQueries.deleteTagNode.mockResolvedValue(true);

      await request(app).delete(`/api/v1/tags/${testTag.id}`).expect(204);
    });

  });

  // ========================================
  // GET /api/v1/tags/:id/entities - Get Entities with Tag
  // ========================================
  describe('GET /api/v1/tags/:id/entities - Get Entities with Tag', () => {
    it('should return entities with the specified tag', async () => {
      mockedQueries.getTagNode.mockResolvedValue(testTag);
      mockedQueries.getEntitiesWithTag.mockResolvedValue([
        { id: 'doc-1', type: 'Document', title: 'Test Doc' },
        { id: 'concept-1', type: 'Concept', term: 'Test Term' },
      ]);

      const response = await request(app)
        .get(`/api/v1/tags/${testTag.id}/entities`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body.items.length).toBe(2);
    });

  });

  // ========================================
  // HAS_TAG Relationship Tests - Documents
  // ========================================
  describe('Document Tags API', () => {
    const testDocument = {
      id: '00000000-0000-4000-a000-000000000010',
      title: 'Test Document',
      type: 'general' as const,
      status: 'draft' as const,
      lang: 'en',
      storage_key: 'documents/doc1/content.md',
      summary: null,
      created_at: new Date('2025-12-08T10:00:00.000Z'),
      updated_at: new Date('2025-12-08T10:00:00.000Z'),
    };

    it('POST /api/v1/documents/:id/tags - should add tag to document', async () => {
      mockedQueries.getDocumentNode.mockResolvedValue(testDocument);
      mockedQueries.getTagNode.mockResolvedValue(testTag);
      mockedQueries.linkDocumentToTag.mockResolvedValue(true);

      const response = await request(app)
        .post(`/api/v1/documents/${testDocument.id}/tags`)
        .send({ tag_id: testTag.id })
        .expect(201);

      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/v1/documents/:id/tags - should get tags for document', async () => {
      mockedQueries.getDocumentNode.mockResolvedValue(testDocument);
      mockedQueries.getTagsForDocument.mockResolvedValue([testTag]);

      const response = await request(app)
        .get(`/api/v1/documents/${testDocument.id}/tags`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body.items.length).toBe(1);
    });

    it('DELETE /api/v1/documents/:id/tags/:tagId - should remove tag from document', async () => {
      mockedQueries.unlinkDocumentFromTag.mockResolvedValue(true);

      await request(app)
        .delete(`/api/v1/documents/${testDocument.id}/tags/${testTag.id}`)
        .expect(204);
    });
  });

  // ========================================
  // HAS_TAG Relationship Tests - Concepts
  // ========================================
  describe('Concept Tags API', () => {
    const testConcept = {
      id: '00000000-0000-4000-a000-000000000020',
      term: 'Test Concept',
      description: 'A test concept',
      category: 'test',
      lang: 'en',
      created_at: new Date('2025-12-08T10:00:00.000Z'),
      updated_at: new Date('2025-12-08T10:00:00.000Z'),
    };

    it('POST /api/v1/concepts/:id/tags - should add tag to concept', async () => {
      mockedQueries.getConceptNode.mockResolvedValue(testConcept);
      mockedQueries.getTagNode.mockResolvedValue(testTag);
      mockedQueries.linkConceptToTag.mockResolvedValue(true);

      const response = await request(app)
        .post(`/api/v1/concepts/${testConcept.id}/tags`)
        .send({ tag_id: testTag.id })
        .expect(201);

      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/v1/concepts/:id/tags - should get tags for concept', async () => {
      mockedQueries.getConceptNode.mockResolvedValue(testConcept);
      mockedQueries.getTagsForConcept.mockResolvedValue([testTag]);

      const response = await request(app)
        .get(`/api/v1/concepts/${testConcept.id}/tags`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body.items.length).toBe(1);
    });

    it('DELETE /api/v1/concepts/:id/tags/:tagId - should remove tag from concept', async () => {
      mockedQueries.unlinkConceptFromTag.mockResolvedValue(true);

      await request(app)
        .delete(`/api/v1/concepts/${testConcept.id}/tags/${testTag.id}`)
        .expect(204);
    });
  });

  // ========================================
  // HAS_TAG Relationship Tests - Pages
  // ========================================
  describe('Page Tags API', () => {
    const testPage = {
      id: '00000000-0000-4000-a000-000000000030',
      title: 'Test Page',
      slug: 'test-page',
      order: 0,
      visible: true,
      created_at: new Date('2025-12-08T10:00:00.000Z'),
      updated_at: new Date('2025-12-08T10:00:00.000Z'),
    };

    it('POST /api/v1/pages/:id/tags - should add tag to page', async () => {
      mockedQueries.getPageNode.mockResolvedValue(testPage);
      mockedQueries.getTagNode.mockResolvedValue(testTag);
      mockedQueries.linkPageToTag.mockResolvedValue(true);

      const response = await request(app)
        .post(`/api/v1/pages/${testPage.id}/tags`)
        .send({ tag_id: testTag.id })
        .expect(201);

      expect(response.body).toHaveProperty('message');
    });

    it('GET /api/v1/pages/:id/tags - should get tags for page', async () => {
      mockedQueries.getPageNode.mockResolvedValue(testPage);
      mockedQueries.getTagsForPage.mockResolvedValue([testTag]);

      const response = await request(app)
        .get(`/api/v1/pages/${testPage.id}/tags`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body.items.length).toBe(1);
    });

    it('DELETE /api/v1/pages/:id/tags/:tagId - should remove tag from page', async () => {
      mockedQueries.unlinkPageFromTag.mockResolvedValue(true);

      await request(app)
        .delete(`/api/v1/pages/${testPage.id}/tags/${testTag.id}`)
        .expect(204);
    });
  });
});

