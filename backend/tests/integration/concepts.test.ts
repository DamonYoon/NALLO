/**
 * Integration Tests for Concept Impact Analysis
 * T047: Tests the integration between concepts and documents
 * Per Constitution Principle II: Integration tests verify component interactions
 *
 * This test verifies that when a concept is linked to documents,
 * the impact analysis correctly identifies all affected documents.
 */

// Mock GraphDB with document-concept relationship tracking
jest.mock('../../src/db/graphdb/queries', () => {
  const mockConcepts = new Map<string, Record<string, unknown>>();
  const mockDocuments = new Map<string, Record<string, unknown>>();
  const mockConceptDocumentLinks = new Map<string, Set<string>>(); // conceptId -> Set<documentId>
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
        status: data.status || 'draft',
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockDocuments.set(doc.id as string, doc);
      return doc;
    }),
    getDocumentNode: jest.fn().mockImplementation(async (id: string) => mockDocuments.get(id) || null),
    updateDocumentNode: jest.fn().mockImplementation(
      async (id: string, updates: Record<string, unknown>) => {
        const doc = mockDocuments.get(id);
        if (!doc) return null;
        const updated = { ...doc, ...updates, updated_at: new Date() };
        mockDocuments.set(id, updated);
        return updated;
      }
    ),
    deleteDocumentNode: jest.fn().mockImplementation(async (id: string) => {
      mockDocuments.delete(id);
      // Remove document from all concept links
      mockConceptDocumentLinks.forEach(docSet => docSet.delete(id));
      return true;
    }),
    listDocumentNodes: jest.fn().mockImplementation(async (query: Record<string, unknown>) => {
      const items = Array.from(mockDocuments.values());
      const offset = (query.offset as number) || 0;
      const limit = (query.limit as number) || 20;
      return { items: items.slice(offset, offset + limit), total: items.length };
    }),

    // Concept queries
    createConceptNode: jest.fn().mockImplementation(async (data: Record<string, unknown>) => {
      const concept = {
        ...data,
        id: data.id || generateId(),
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockConcepts.set(concept.id as string, concept);
      mockConceptDocumentLinks.set(concept.id as string, new Set());
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
      mockConceptDocumentLinks.delete(id);
      return existed;
    }),
    listConceptNodes: jest.fn().mockImplementation(async (query: Record<string, unknown>) => {
      const items = Array.from(mockConcepts.values());
      const offset = (query.offset as number) || 0;
      const limit = (query.limit as number) || 20;
      return { items: items.slice(offset, offset + limit), total: items.length };
    }),

    // Document-Concept relationship queries
    linkDocumentToConcept: jest.fn().mockImplementation(
      async (documentId: string, conceptId: string) => {
        const links = mockConceptDocumentLinks.get(conceptId);
        if (!links) return false;
        links.add(documentId);
        return true;
      }
    ),
    unlinkDocumentFromConcept: jest.fn().mockImplementation(
      async (documentId: string, conceptId: string) => {
        const links = mockConceptDocumentLinks.get(conceptId);
        if (!links) return false;
        const existed = links.has(documentId);
        links.delete(documentId);
        return existed;
      }
    ),
    getDocumentsUsingConcept: jest.fn().mockImplementation(async (conceptId: string) => {
      const concept = mockConcepts.get(conceptId);
      if (!concept) return null;

      const documentIds = mockConceptDocumentLinks.get(conceptId) || new Set();
      const documents = Array.from(documentIds)
        .map(id => mockDocuments.get(id))
        .filter(Boolean);

      return { items: documents, total: documents.length };
    }),
  };
});

// Mock MinIO storage
jest.mock('../../src/db/storage/connection', () => ({
  uploadFile: jest.fn().mockResolvedValue('key'),
  downloadFile: jest.fn().mockResolvedValue(Buffer.from('# Content')),
  deleteFile: jest.fn().mockResolvedValue(undefined),
  fileExists: jest.fn().mockResolvedValue(true),
  initializeStorage: jest.fn().mockResolvedValue(undefined),
}));

import request from 'supertest';
import { createApp } from '../../src/app';
import { linkDocumentToConcept } from '../../src/db/graphdb/queries';

const app = createApp();

describe('Concept Impact Analysis - Integration Tests', () => {
  describe('Document-Concept Relationship', () => {
    let conceptId: string;
    let document1Id: string;
    let document2Id: string;
    let document3Id: string;

    beforeAll(async () => {
      // Create a concept
      const conceptResponse = await request(app)
        .post('/api/v1/concepts')
        .send({
          term: 'Authentication',
          description: 'The process of verifying user identity',
          category: 'security',
          lang: 'en',
        });
      conceptId = conceptResponse.body.id;

      // Create multiple documents
      const doc1Response = await request(app)
        .post('/api/v1/documents')
        .send({
          title: 'Authentication Guide',
          type: 'tutorial',
          content: '# Authentication\n\nLearn about authentication.',
          lang: 'en',
        });
      document1Id = doc1Response.body.id;

      const doc2Response = await request(app)
        .post('/api/v1/documents')
        .send({
          title: 'Security Best Practices',
          type: 'general',
          content: '# Security\n\nSecurity best practices.',
          lang: 'en',
        });
      document2Id = doc2Response.body.id;

      const doc3Response = await request(app)
        .post('/api/v1/documents')
        .send({
          title: 'API Reference',
          type: 'api',
          content: '# API Reference\n\nAPI documentation.',
          lang: 'en',
        });
      document3Id = doc3Response.body.id;

      // Link documents to concept
      await (linkDocumentToConcept as jest.Mock)(document1Id, conceptId);
      await (linkDocumentToConcept as jest.Mock)(document2Id, conceptId);
    });

    it('should identify all documents using a concept', async () => {
      const response = await request(app)
        .get(`/api/v1/concepts/${conceptId}/documents`)
        .expect(200);

      expect(response.body.total).toBe(2);
      expect(response.body.items).toHaveLength(2);

      const documentIds = response.body.items.map((d: { id: string }) => d.id);
      expect(documentIds).toContain(document1Id);
      expect(documentIds).toContain(document2Id);
      expect(documentIds).not.toContain(document3Id);
    });

    it('should return empty list for concept with no linked documents', async () => {
      // Create a concept with no documents
      const isolatedConcept = await request(app)
        .post('/api/v1/concepts')
        .send({
          term: 'Isolated Concept',
          description: 'A concept not used by any document',
          lang: 'en',
        });

      const response = await request(app)
        .get(`/api/v1/concepts/${isolatedConcept.body.id}/documents`)
        .expect(200);

      expect(response.body.total).toBe(0);
      expect(response.body.items).toEqual([]);
    });

    it('should update impact when new document is linked', async () => {
      // Link third document
      await (linkDocumentToConcept as jest.Mock)(document3Id, conceptId);

      const response = await request(app)
        .get(`/api/v1/concepts/${conceptId}/documents`)
        .expect(200);

      expect(response.body.total).toBe(3);
      const documentIds = response.body.items.map((d: { id: string }) => d.id);
      expect(documentIds).toContain(document3Id);
    });

    it('should provide document summary in impact analysis', async () => {
      const response = await request(app)
        .get(`/api/v1/concepts/${conceptId}/documents`)
        .expect(200);

      // Each document in the response should have summary fields
      response.body.items.forEach((doc: Record<string, unknown>) => {
        expect(doc.id).toBeDefined();
        expect(doc.title).toBeDefined();
        expect(doc.type).toBeDefined();
        expect(doc.status).toBeDefined();
        expect(doc.lang).toBeDefined();
      });
    });
  });

  describe('Concept Update Impact', () => {
    it('should maintain document links when concept is updated', async () => {
      // Create concept and link documents
      const conceptResponse = await request(app)
        .post('/api/v1/concepts')
        .send({
          term: 'Original Term',
          description: 'Original description',
          lang: 'en',
        });
      const conceptId = conceptResponse.body.id;

      const docResponse = await request(app)
        .post('/api/v1/documents')
        .send({
          title: 'Linked Document',
          type: 'general',
          content: 'Content',
          lang: 'en',
        });

      await (linkDocumentToConcept as jest.Mock)(docResponse.body.id, conceptId);

      // Update concept
      await request(app)
        .put(`/api/v1/concepts/${conceptId}`)
        .send({ description: 'Updated description - check all linked documents!' })
        .expect(200);

      // Verify links are maintained
      const impactResponse = await request(app)
        .get(`/api/v1/concepts/${conceptId}/documents`)
        .expect(200);

      expect(impactResponse.body.total).toBe(1);
      expect(impactResponse.body.items[0].id).toBe(docResponse.body.id);
    });
  });

  describe('Multiple Concepts Per Document', () => {
    it('should track documents using multiple concepts', async () => {
      // Create two concepts
      const concept1 = await request(app)
        .post('/api/v1/concepts')
        .send({ term: 'Concept A', description: 'First concept', lang: 'en' });

      const concept2 = await request(app)
        .post('/api/v1/concepts')
        .send({ term: 'Concept B', description: 'Second concept', lang: 'en' });

      // Create document using both concepts
      const doc = await request(app)
        .post('/api/v1/documents')
        .send({
          title: 'Document Using Both Concepts',
          type: 'general',
          content: 'Content referencing both concepts',
          lang: 'en',
        });

      // Link document to both concepts
      await (linkDocumentToConcept as jest.Mock)(doc.body.id, concept1.body.id);
      await (linkDocumentToConcept as jest.Mock)(doc.body.id, concept2.body.id);

      // Both concepts should list this document
      const impact1 = await request(app)
        .get(`/api/v1/concepts/${concept1.body.id}/documents`)
        .expect(200);
      const impact2 = await request(app)
        .get(`/api/v1/concepts/${concept2.body.id}/documents`)
        .expect(200);

      expect(impact1.body.items.some((d: { id: string }) => d.id === doc.body.id)).toBe(true);
      expect(impact2.body.items.some((d: { id: string }) => d.id === doc.body.id)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for impact analysis on non-existent concept', async () => {
      const nonExistentId = '00000000-0000-4000-a000-999999999999';

      const response = await request(app)
        .get(`/api/v1/concepts/${nonExistentId}/documents`)
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid concept ID format', async () => {
      const response = await request(app)
        .get('/api/v1/concepts/invalid-id/documents')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});

