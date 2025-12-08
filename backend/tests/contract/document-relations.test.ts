/**
 * Contract Tests for Document Relationships API
 *
 * Tests for LINKS_TO and WORKING_COPY_OF relationships
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import { Express } from 'express';

// Mock GraphDB queries
jest.mock('../../src/db/graphdb/queries', () => ({
  ...jest.requireActual('../../src/db/graphdb/queries'),
  getDocumentNode: jest.fn(),
  linkDocumentToDocument: jest.fn(),
  unlinkDocumentFromDocument: jest.fn(),
  getLinkedDocuments: jest.fn(),
  getLinkingDocuments: jest.fn(),
  createWorkingCopy: jest.fn(),
  removeWorkingCopy: jest.fn(),
  getOriginalDocument: jest.fn(),
  getWorkingCopies: jest.fn(),
}));

// Mock storage
jest.mock('../../src/db/storage/connection', () => ({
  ...jest.requireActual('../../src/db/storage/connection'),
  uploadFile: jest.fn(),
  downloadFile: jest.fn(),
  deleteFile: jest.fn(),
  fileExists: jest.fn(),
}));

import * as queries from '../../src/db/graphdb/queries';

const mockedQueries = queries as jest.Mocked<typeof queries>;

describe('Document Relationships API Contract Tests', () => {
  let app: Express;

  const testDocument1 = {
    id: '00000000-0000-4000-a000-000000000001',
    title: 'Getting Started',
    type: 'general' as const,
    status: 'draft' as const,
    lang: 'en',
    storage_key: 'documents/doc1/content.md',
    summary: null,
    created_at: new Date('2025-12-08T10:00:00.000Z'),
    updated_at: new Date('2025-12-08T10:00:00.000Z'),
  };

  const testDocument2 = {
    id: '00000000-0000-4000-a000-000000000002',
    title: 'API Reference',
    type: 'api' as const,
    status: 'draft' as const,
    lang: 'en',
    storage_key: 'documents/doc2/content.yaml',
    summary: null,
    created_at: new Date('2025-12-08T10:00:00.000Z'),
    updated_at: new Date('2025-12-08T10:00:00.000Z'),
  };

  const testWorkingCopy = {
    id: '00000000-0000-4000-a000-000000000003',
    title: 'Getting Started (Working Copy)',
    type: 'general' as const,
    status: 'draft' as const,
    lang: 'en',
    storage_key: 'documents/doc3/content.md',
    summary: null,
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
  // LINKS_TO Relationship Tests
  // ========================================
  describe('LINKS_TO Relationship', () => {
    it('POST /api/v1/documents/:id/links - should link document to another', async () => {
      mockedQueries.getDocumentNode
        .mockResolvedValueOnce(testDocument1) // source
        .mockResolvedValueOnce(testDocument2); // target
      mockedQueries.linkDocumentToDocument.mockResolvedValue(true);

      const response = await request(app)
        .post(`/api/v1/documents/${testDocument1.id}/links`)
        .send({ target_id: testDocument2.id })
        .expect(201);

      expect(response.body).toHaveProperty('message');
    });

    it('POST /api/v1/documents/:id/links - should return 400 for missing target_id', async () => {
      const response = await request(app)
        .post(`/api/v1/documents/${testDocument1.id}/links`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('GET /api/v1/documents/:id/links - should return linked documents', async () => {
      mockedQueries.getDocumentNode.mockResolvedValue(testDocument1);
      mockedQueries.getLinkedDocuments.mockResolvedValue([testDocument2]);

      const response = await request(app)
        .get(`/api/v1/documents/${testDocument1.id}/links`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body.items.length).toBe(1);
    });

    it('GET /api/v1/documents/:id/backlinks - should return documents linking to this', async () => {
      mockedQueries.getDocumentNode.mockResolvedValue(testDocument2);
      mockedQueries.getLinkingDocuments.mockResolvedValue([testDocument1]);

      const response = await request(app)
        .get(`/api/v1/documents/${testDocument2.id}/backlinks`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body.items.length).toBe(1);
    });

    it('DELETE /api/v1/documents/:id/links/:targetId - should unlink documents', async () => {
      mockedQueries.unlinkDocumentFromDocument.mockResolvedValue(true);

      await request(app)
        .delete(`/api/v1/documents/${testDocument1.id}/links/${testDocument2.id}`)
        .expect(204);
    });

  });

  // ========================================
  // WORKING_COPY_OF Relationship Tests
  // ========================================
  describe('WORKING_COPY_OF Relationship', () => {
    it('POST /api/v1/documents/:id/working-copy - should create working copy relationship', async () => {
      mockedQueries.getDocumentNode
        .mockResolvedValueOnce(testWorkingCopy) // copy
        .mockResolvedValueOnce(testDocument1); // original
      mockedQueries.createWorkingCopy.mockResolvedValue(true);

      const response = await request(app)
        .post(`/api/v1/documents/${testWorkingCopy.id}/working-copy`)
        .send({ original_id: testDocument1.id })
        .expect(201);

      expect(response.body).toHaveProperty('message');
    });

    it('POST /api/v1/documents/:id/working-copy - should return 400 for missing original_id', async () => {
      const response = await request(app)
        .post(`/api/v1/documents/${testWorkingCopy.id}/working-copy`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('GET /api/v1/documents/:id/original - should return original document', async () => {
      mockedQueries.getDocumentNode.mockResolvedValue(testWorkingCopy);
      mockedQueries.getOriginalDocument.mockResolvedValue(testDocument1);

      const response = await request(app)
        .get(`/api/v1/documents/${testWorkingCopy.id}/original`)
        .expect(200);

      expect(response.body).toHaveProperty('original');
      expect(response.body.original.id).toBe(testDocument1.id);
    });

    it('GET /api/v1/documents/:id/original - should return null when no original', async () => {
      mockedQueries.getDocumentNode.mockResolvedValue(testDocument1);
      mockedQueries.getOriginalDocument.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/v1/documents/${testDocument1.id}/original`)
        .expect(200);

      expect(response.body.original).toBeNull();
    });

    it('GET /api/v1/documents/:id/working-copies - should return working copies', async () => {
      mockedQueries.getDocumentNode.mockResolvedValue(testDocument1);
      mockedQueries.getWorkingCopies.mockResolvedValue([testWorkingCopy]);

      const response = await request(app)
        .get(`/api/v1/documents/${testDocument1.id}/working-copies`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body.items.length).toBe(1);
    });

    it('DELETE /api/v1/documents/:id/working-copy/:originalId - should remove working copy relationship', async () => {
      mockedQueries.removeWorkingCopy.mockResolvedValue(true);

      await request(app)
        .delete(`/api/v1/documents/${testWorkingCopy.id}/working-copy/${testDocument1.id}`)
        .expect(204);
    });

  });
});

