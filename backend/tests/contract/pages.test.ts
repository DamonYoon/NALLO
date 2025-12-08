/**
 * Contract Tests for Page API
 * Validates that API responses match OpenAPI specification
 * Per Constitution Principle II: Contract tests MUST be written for external-facing APIs
 */

// Mock GraphDB queries
jest.mock('../../src/db/graphdb/queries', () => {
  const mockVersions = new Map<string, Record<string, unknown>>();
  const mockPages = new Map<string, Record<string, unknown>>();
  const mockDocuments = new Map<string, Record<string, unknown>>();
  const mockPageVersionLinks = new Map<string, string>();
  const mockPageParentLinks = new Map<string, string>();
  const mockPageDocumentLinks = new Map<string, string>();
  let counter = 0;

  const generateId = () => {
    counter++;
    return `00000000-0000-4000-a000-${String(counter).padStart(12, '0')}`;
  };

  return {
    // Document queries
    createDocumentNode: jest.fn().mockImplementation(async (data: Record<string, unknown>) => {
      const doc = {
        ...data,
        id: data.id || generateId(),
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockDocuments.set(doc.id as string, doc);
      return doc;
    }),
    getDocumentNode: jest
      .fn()
      .mockImplementation(async (id: string) => mockDocuments.get(id) || null),
    updateDocumentNode: jest.fn(),
    deleteDocumentNode: jest.fn(),
    listDocumentNodes: jest.fn().mockResolvedValue({ items: [], total: 0 }),

    // Concept queries
    createConceptNode: jest.fn(),
    getConceptNode: jest.fn().mockResolvedValue(null),
    updateConceptNode: jest.fn(),
    deleteConceptNode: jest.fn(),
    listConceptNodes: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    getDocumentsUsingConcept: jest.fn().mockResolvedValue({ items: [], total: 0 }),

    // Version queries
    createVersionNode: jest.fn().mockImplementation(async (data: Record<string, unknown>) => {
      const version = {
        ...data,
        id: data.id || generateId(),
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockVersions.set(version.id as string, version);
      return version;
    }),
    getVersionNode: jest
      .fn()
      .mockImplementation(async (id: string) => mockVersions.get(id) || null),
    updateVersionNode: jest.fn(),
    deleteVersionNode: jest.fn(),
    listVersionNodes: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    getNavigationTree: jest.fn().mockResolvedValue({ pages: [] }),

    // Page queries
    createPageNode: jest.fn().mockImplementation(async (data: Record<string, unknown>) => {
      const page = {
        ...data,
        id: data.id || generateId(),
        order: data.order ?? 0,
        visible: data.visible ?? false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockPages.set(page.id as string, page);
      if (data.version_id) mockPageVersionLinks.set(page.id as string, data.version_id as string);
      if (data.parent_page_id)
        mockPageParentLinks.set(page.id as string, data.parent_page_id as string);
      return page;
    }),
    getPageNode: jest.fn().mockImplementation(async (id: string) => mockPages.get(id) || null),
    updatePageNode: jest
      .fn()
      .mockImplementation(async (id: string, updates: Record<string, unknown>) => {
        const page = mockPages.get(id);
        if (!page) return null;
        const updated = { ...page, ...updates, updated_at: new Date() };
        mockPages.set(id, updated);
        return updated;
      }),
    deletePageNode: jest.fn().mockImplementation(async (id: string) => {
      const existed = mockPages.has(id);
      mockPages.delete(id);
      return existed;
    }),
    listPageNodes: jest.fn().mockImplementation(async (query: Record<string, unknown>) => {
      let items = Array.from(mockPages.values());
      if (query.version_id) {
        items = items.filter(p => mockPageVersionLinks.get(p.id as string) === query.version_id);
      }
      const offset = (query.offset as number) || 0;
      const limit = (query.limit as number) || 20;
      return { items: items.slice(offset, offset + limit), total: items.length };
    }),

    // Page-Document relationship
    linkPageToDocument: jest.fn().mockImplementation(async (pageId: string, documentId: string) => {
      if (!mockPages.has(pageId)) return null;
      if (!mockDocuments.has(documentId)) return null;
      mockPageDocumentLinks.set(pageId, documentId);
      return { page_id: pageId, document_id: documentId };
    }),
    unlinkPageFromDocument: jest.fn().mockImplementation(async (pageId: string) => {
      const existed = mockPageDocumentLinks.has(pageId);
      mockPageDocumentLinks.delete(pageId);
      return existed;
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

describe('Page API - Contract Tests', () => {
  let testVersionId: string;

  beforeAll(async () => {
    // Create a version for page tests
    const versionResponse = await request(app).post('/api/v1/versions').send({
      version: 'v1.0.0',
      name: 'Test Version',
      is_public: true,
      is_main: true,
    });
    testVersionId = versionResponse.body.id;
  });

  const validPage = {
    slug: 'getting-started',
    title: 'Getting Started',
    order: 0,
    visible: true,
  };

  let createdPageId: string;

  /**
   * T063: Contract test for POST /api/v1/pages
   */
  describe('POST /api/v1/pages - Contract Validation', () => {
    it('should return 201 with PageResponse schema on success', async () => {
      const response = await request(app)
        .post('/api/v1/pages')
        .set('Content-Type', 'application/json')
        .send({ ...validPage, version_id: testVersionId })
        .expect('Content-Type', /application\/json/)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(/^[0-9a-f-]{36}$/i),
          slug: validPage.slug,
          title: validPage.title,
          order: validPage.order,
          visible: validPage.visible,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        })
      );

      createdPageId = response.body.id;
    });

    it('should return 400 for invalid slug format', async () => {
      const invalidSlugs = ['Getting Started', 'UPPERCASE', 'with_underscore', 'with.dot'];

      for (const slug of invalidSlugs) {
        await request(app)
          .post('/api/v1/pages')
          .send({ ...validPage, slug, version_id: testVersionId })
          .expect(400);
      }
    });

    it('should validate slug follows lowercase alphanumeric pattern', async () => {
      const validSlugs = ['getting-started', 'api-reference', 'v1-guide', '123-test'];

      for (const slug of validSlugs) {
        const response = await request(app)
          .post('/api/v1/pages')
          .send({ ...validPage, slug, title: `Page ${slug}`, version_id: testVersionId })
          .expect(201);
        expect(response.body.slug).toBe(slug);
      }
    });

    it('should require version_id', async () => {
      await request(app).post('/api/v1/pages').send({ slug: 'test', title: 'Test' }).expect(400);
    });

    it('should accept optional parent_page_id', async () => {
      // Create parent page
      const parentResponse = await request(app)
        .post('/api/v1/pages')
        .send({ ...validPage, slug: 'parent-page', title: 'Parent', version_id: testVersionId });

      // Create child page
      const childResponse = await request(app)
        .post('/api/v1/pages')
        .send({
          ...validPage,
          slug: 'child-page',
          title: 'Child',
          version_id: testVersionId,
          parent_page_id: parentResponse.body.id,
        })
        .expect(201);

      expect(childResponse.body.slug).toBe('child-page');
    });

    it('should use default values for order and visible', async () => {
      const response = await request(app)
        .post('/api/v1/pages')
        .send({
          slug: 'default-values-test',
          title: 'Default Values Test',
          version_id: testVersionId,
        })
        .expect(201);

      expect(response.body.order).toBe(0);
      expect(response.body.visible).toBe(false);
    });
  });

  /**
   * GET /api/v1/pages/{id} - Contract Validation
   */
  describe('GET /api/v1/pages/{id} - Contract Validation', () => {
    beforeAll(async () => {
      if (!createdPageId) {
        const response = await request(app)
          .post('/api/v1/pages')
          .send({ ...validPage, version_id: testVersionId });
        createdPageId = response.body.id;
      }
    });

    it('should return 200 with PageResponse schema', async () => {
      const response = await request(app)
        .get(`/api/v1/pages/${createdPageId}`)
        .expect('Content-Type', /application\/json/)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: createdPageId,
          slug: expect.any(String),
          title: expect.any(String),
          order: expect.any(Number),
          visible: expect.any(Boolean),
        })
      );
    });

    it('should return 404 for non-existent page', async () => {
      await request(app).get('/api/v1/pages/00000000-0000-4000-a000-000000000000').expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app).get('/api/v1/pages/invalid-id').expect(400);
    });
  });

  /**
   * PUT /api/v1/pages/{id} - Contract Validation
   */
  describe('PUT /api/v1/pages/{id} - Contract Validation', () => {
    let updatePageId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/v1/pages')
        .send({ ...validPage, slug: 'update-test', version_id: testVersionId });
      updatePageId = response.body.id;
    });

    it('should return 200 with PageResponse schema on success', async () => {
      const response = await request(app)
        .put(`/api/v1/pages/${updatePageId}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
      expect(response.body.id).toBe(updatePageId);
    });

    it('should accept partial updates', async () => {
      // Update only order
      await request(app).put(`/api/v1/pages/${updatePageId}`).send({ order: 5 }).expect(200);

      // Update only visible
      await request(app).put(`/api/v1/pages/${updatePageId}`).send({ visible: true }).expect(200);
    });

    it('should return 404 for non-existent page', async () => {
      await request(app)
        .put('/api/v1/pages/00000000-0000-4000-a000-000000000000')
        .send({ title: 'Test' })
        .expect(404);
    });
  });

  /**
   * T064: Contract test for POST /api/v1/pages/{id}/documents
   */
  describe('POST /api/v1/pages/{id}/documents - Contract Validation', () => {
    let linkPageId: string;
    let linkDocumentId: string;

    beforeAll(async () => {
      // Create page
      const pageResponse = await request(app)
        .post('/api/v1/pages')
        .send({ ...validPage, slug: 'link-test', version_id: testVersionId });
      linkPageId = pageResponse.body.id;

      // Create document
      const docResponse = await request(app).post('/api/v1/documents').send({
        title: 'Test Document',
        type: 'general',
        content: '# Test',
        lang: 'en',
      });
      linkDocumentId = docResponse.body.id;
    });

    it('should return 201 with LinkResponse schema on success', async () => {
      const response = await request(app)
        .post(`/api/v1/pages/${linkPageId}/documents`)
        .set('Content-Type', 'application/json')
        .send({ document_id: linkDocumentId })
        .expect('Content-Type', /application\/json/)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          page_id: linkPageId,
          document_id: linkDocumentId,
        })
      );
    });

    it('should return 400 for missing document_id', async () => {
      await request(app).post(`/api/v1/pages/${linkPageId}/documents`).send({}).expect(400);
    });

    it('should return 400 for invalid document_id format', async () => {
      await request(app)
        .post(`/api/v1/pages/${linkPageId}/documents`)
        .send({ document_id: 'invalid-uuid' })
        .expect(400);
    });

    it('should return 404 for non-existent page', async () => {
      await request(app)
        .post('/api/v1/pages/00000000-0000-4000-a000-000000000000/documents')
        .send({ document_id: linkDocumentId })
        .expect(404);
    });
  });

  /**
   * DELETE /api/v1/pages/{id} - Contract Validation
   */
  describe('DELETE /api/v1/pages/{id} - Contract Validation', () => {
    let deletePageId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/pages')
        .send({ ...validPage, slug: `delete-test-${Date.now()}`, version_id: testVersionId });
      deletePageId = response.body.id;
    });

    it('should return 204 on success', async () => {
      await request(app).delete(`/api/v1/pages/${deletePageId}`).expect(204);

      // Verify deletion
      await request(app).get(`/api/v1/pages/${deletePageId}`).expect(404);
    });

    it('should return 404 for non-existent page', async () => {
      await request(app).delete('/api/v1/pages/00000000-0000-4000-a000-000000000000').expect(404);
    });
  });

  /**
   * GET /api/v1/pages - List Pages
   */
  describe('GET /api/v1/pages - List Contract Validation', () => {
    it('should return 200 with PageListResponse schema', async () => {
      const response = await request(app)
        .get('/api/v1/pages')
        .query({ limit: 10, offset: 0 })
        .expect('Content-Type', /application\/json/)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          items: expect.any(Array),
          total: expect.any(Number),
          limit: expect.any(Number),
          offset: expect.any(Number),
        })
      );
    });

    it('should filter by version_id', async () => {
      await request(app).get('/api/v1/pages').query({ version_id: testVersionId }).expect(200);
    });

    it('should use default pagination values', async () => {
      const response = await request(app).get('/api/v1/pages').expect(200);

      expect(response.body.limit).toBe(20);
      expect(response.body.offset).toBe(0);
    });
  });
});
