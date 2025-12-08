/**
 * Contract Tests for Version API
 * Validates that API responses match OpenAPI specification
 * Per Constitution Principle II: Contract tests MUST be written for external-facing APIs
 */

// Mock GraphDB queries
jest.mock('../../src/db/graphdb/queries', () => {
  const mockVersions = new Map<string, Record<string, unknown>>();
  const mockPages = new Map<string, Record<string, unknown>>();
  const mockPageVersionLinks = new Map<string, string>(); // pageId -> versionId
  const mockPageParentLinks = new Map<string, string>(); // pageId -> parentPageId
  const mockPageDocumentLinks = new Map<string, string>(); // pageId -> documentId
  let counter = 0;

  const generateId = () => {
    counter++;
    return `00000000-0000-4000-a000-${String(counter).padStart(12, '0')}`;
  };

  return {
    // Document queries (minimal mock)
    createDocumentNode: jest.fn().mockImplementation(async (data: Record<string, unknown>) => ({
      ...data,
      id: data.id || generateId(),
      created_at: new Date(),
      updated_at: new Date(),
    })),
    getDocumentNode: jest.fn().mockResolvedValue(null),
    updateDocumentNode: jest.fn(),
    deleteDocumentNode: jest.fn(),
    listDocumentNodes: jest.fn().mockResolvedValue({ items: [], total: 0 }),

    // Concept queries (minimal mock)
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
    updateVersionNode: jest
      .fn()
      .mockImplementation(async (id: string, updates: Record<string, unknown>) => {
        const version = mockVersions.get(id);
        if (!version) return null;
        const updated = { ...version, ...updates, updated_at: new Date() };
        mockVersions.set(id, updated);
        return updated;
      }),
    deleteVersionNode: jest.fn().mockImplementation(async (id: string) => {
      const existed = mockVersions.has(id);
      mockVersions.delete(id);
      return existed;
    }),
    listVersionNodes: jest.fn().mockImplementation(async (query: Record<string, unknown>) => {
      let items = Array.from(mockVersions.values());
      if (query.is_public !== undefined) {
        items = items.filter(v => v.is_public === query.is_public);
      }
      const offset = (query.offset as number) || 0;
      const limit = (query.limit as number) || 20;
      return { items: items.slice(offset, offset + limit), total: items.length };
    }),

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
    listPageNodes: jest.fn().mockResolvedValue({ items: [], total: 0 }),

    // Page-Document relationship
    linkPageToDocument: jest.fn().mockImplementation(async (pageId: string, documentId: string) => {
      mockPageDocumentLinks.set(pageId, documentId);
      return true;
    }),
    unlinkPageFromDocument: jest.fn().mockImplementation(async (pageId: string) => {
      const existed = mockPageDocumentLinks.has(pageId);
      mockPageDocumentLinks.delete(pageId);
      return existed;
    }),

    // Navigation tree
    getNavigationTree: jest.fn().mockImplementation(async (versionId: string) => {
      const version = mockVersions.get(versionId);
      if (!version) return null;

      const pages = Array.from(mockPages.values()).filter(
        p => mockPageVersionLinks.get(p.id as string) === versionId
      );

      // Build tree structure
      const buildTree = (parentId: string | null): Record<string, unknown>[] => {
        return pages
          .filter(p => {
            const parent = mockPageParentLinks.get(p.id as string);
            return parentId === null ? !parent : parent === parentId;
          })
          .map(p => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            order: p.order,
            visible: p.visible,
            document_id: mockPageDocumentLinks.get(p.id as string) || null,
            children: buildTree(p.id as string),
          }))
          .sort((a, b) => (a.order as number) - (b.order as number));
      };

      return { pages: buildTree(null) };
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

describe('Version API - Contract Tests', () => {
  const validVersion = {
    version: 'v1.0.0',
    name: 'Initial Release',
    description: 'First stable version',
    is_public: true,
    is_main: true,
  };

  let createdVersionId: string;

  /**
   * T062: Contract test for POST /api/v1/versions
   */
  describe('POST /api/v1/versions - Contract Validation', () => {
    it('should return 201 with VersionResponse schema on success', async () => {
      const response = await request(app)
        .post('/api/v1/versions')
        .set('Content-Type', 'application/json')
        .send(validVersion)
        .expect('Content-Type', /application\/json/)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(/^[0-9a-f-]{36}$/i),
          version: validVersion.version,
          name: validVersion.name,
          is_public: validVersion.is_public,
          is_main: validVersion.is_main,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        })
      );

      createdVersionId = response.body.id;
    });

    it('should return 400 for invalid version format', async () => {
      const invalidVersion = { ...validVersion, version: '1.0.0' }; // Missing 'v' prefix

      const response = await request(app).post('/api/v1/versions').send(invalidVersion).expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should validate version follows semantic versioning', async () => {
      const validVersions = ['v1.0.0', 'v2.1.3', 'v10.20.30'];
      for (const v of validVersions) {
        const response = await request(app)
          .post('/api/v1/versions')
          .send({ ...validVersion, version: v, name: `Version ${v}` })
          .expect(201);
        expect(response.body.version).toBe(v);
      }

      const invalidVersions = ['1.0.0', 'v1.0', 'v1', 'version-1'];
      for (const v of invalidVersions) {
        await request(app)
          .post('/api/v1/versions')
          .send({ ...validVersion, version: v })
          .expect(400);
      }
    });

    it('should require is_public and is_main fields', async () => {
      await request(app)
        .post('/api/v1/versions')
        .send({ version: 'v1.0.0', name: 'Test' })
        .expect(400);
    });

    it('should accept optional description field', async () => {
      // Without description
      await request(app)
        .post('/api/v1/versions')
        .send({ ...validVersion, version: 'v1.1.0', description: undefined })
        .expect(201);

      // With description
      const response = await request(app)
        .post('/api/v1/versions')
        .send({ ...validVersion, version: 'v1.2.0', description: 'Test description' })
        .expect(201);

      expect(response.body.description).toBe('Test description');
    });
  });

  /**
   * GET /api/v1/versions/{id} - Contract Validation
   */
  describe('GET /api/v1/versions/{id} - Contract Validation', () => {
    beforeAll(async () => {
      if (!createdVersionId) {
        const response = await request(app).post('/api/v1/versions').send(validVersion);
        createdVersionId = response.body.id;
      }
    });

    it('should return 200 with VersionResponse schema', async () => {
      const response = await request(app)
        .get(`/api/v1/versions/${createdVersionId}`)
        .expect('Content-Type', /application\/json/)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: createdVersionId,
          version: expect.any(String),
          name: expect.any(String),
          is_public: expect.any(Boolean),
          is_main: expect.any(Boolean),
        })
      );
    });

    it('should return 404 for non-existent version', async () => {
      const response = await request(app)
        .get('/api/v1/versions/00000000-0000-4000-a000-000000000000')
        .expect(404);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app).get('/api/v1/versions/invalid-id').expect(400);
    });
  });

  /**
   * T065: Contract test for GET /api/v1/versions/{id}/navigation
   */
  describe('GET /api/v1/versions/{id}/navigation - Contract Validation', () => {
    let navVersionId: string;

    beforeAll(async () => {
      // Create version for navigation test
      const versionResponse = await request(app)
        .post('/api/v1/versions')
        .send({ ...validVersion, version: 'v2.0.0', name: 'Navigation Test' });
      navVersionId = versionResponse.body.id;

      // Create pages
      await request(app).post('/api/v1/pages').send({
        slug: 'getting-started',
        title: 'Getting Started',
        version_id: navVersionId,
        order: 0,
        visible: true,
      });

      await request(app).post('/api/v1/pages').send({
        slug: 'api-reference',
        title: 'API Reference',
        version_id: navVersionId,
        order: 1,
        visible: true,
      });
    });

    it('should return 200 with NavigationTreeResponse schema', async () => {
      const response = await request(app)
        .get(`/api/v1/versions/${navVersionId}/navigation`)
        .expect('Content-Type', /application\/json/)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          pages: expect.any(Array),
        })
      );

      // Validate page structure
      if (response.body.pages.length > 0) {
        response.body.pages.forEach((page: Record<string, unknown>) => {
          expect(page.id).toBeDefined();
          expect(page.slug).toBeDefined();
          expect(page.title).toBeDefined();
          expect(page.children).toBeInstanceOf(Array);
        });
      }
    });

    it('should return 404 for non-existent version', async () => {
      await request(app)
        .get('/api/v1/versions/00000000-0000-4000-a000-000000000000/navigation')
        .expect(404);
    });

    it('should return pages sorted by order', async () => {
      const response = await request(app)
        .get(`/api/v1/versions/${navVersionId}/navigation`)
        .expect(200);

      const pages = response.body.pages;
      for (let i = 1; i < pages.length; i++) {
        expect(pages[i].order).toBeGreaterThanOrEqual(pages[i - 1].order);
      }
    });
  });

  /**
   * GET /api/v1/versions - List Versions
   */
  describe('GET /api/v1/versions - List Contract Validation', () => {
    it('should return 200 with VersionListResponse schema', async () => {
      const response = await request(app)
        .get('/api/v1/versions')
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

    it('should filter by is_public', async () => {
      const response = await request(app)
        .get('/api/v1/versions')
        .query({ is_public: true })
        .expect(200);

      response.body.items.forEach((v: { is_public: boolean }) => {
        expect(v.is_public).toBe(true);
      });
    });

    it('should use default pagination values', async () => {
      const response = await request(app).get('/api/v1/versions').expect(200);

      expect(response.body.limit).toBe(20);
      expect(response.body.offset).toBe(0);
    });
  });
});
