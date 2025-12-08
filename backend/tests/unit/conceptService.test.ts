/**
 * Unit Tests for Concept Service
 * Per Constitution Principle II: Unit tests MUST achieve minimum 80% code coverage for business logic
 * Tests are isolated from actual database using mocks
 */

// Mock GraphDB queries before importing service
jest.mock('../../src/db/graphdb/queries', () => ({
  createConceptNode: jest.fn(),
  getConceptNode: jest.fn(),
  updateConceptNode: jest.fn(),
  deleteConceptNode: jest.fn(),
  listConceptNodes: jest.fn(),
  getDocumentsUsingConcept: jest.fn(),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234-5678-9012'),
}));

import { ConceptService } from '../../src/services/conceptService';
import {
  createConceptNode,
  getConceptNode,
  updateConceptNode,
  deleteConceptNode,
  listConceptNodes,
  getDocumentsUsingConcept,
} from '../../src/db/graphdb/queries';
import { ConceptNode } from '../../src/models/graphdb/conceptNode';
import { DocumentNode, DocumentStatus, DocumentType } from '../../src/models/graphdb/documentNode';

describe('ConceptService', () => {
  let service: ConceptService;

  // Mock data
  const mockConceptNode: ConceptNode = {
    id: 'test-uuid-1234-5678-9012',
    term: 'Access Token',
    description: 'A token used to access protected resources.',
    category: 'api',
    lang: 'en',
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z'),
  };

  const mockDocumentNode: DocumentNode = {
    id: 'doc-uuid-1234',
    type: DocumentType.API,
    status: DocumentStatus.DRAFT,
    title: 'API Guide',
    lang: 'en',
    storage_key: 'documents/doc-uuid-1234/content.md',
    summary: null,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    service = new ConceptService();
    jest.clearAllMocks();
  });

  describe('createConcept', () => {
    it('should create a new concept with all fields', async () => {
      (createConceptNode as jest.Mock).mockResolvedValue(mockConceptNode);

      const input = {
        term: 'Access Token',
        description: 'A token used to access protected resources.',
        category: 'api',
        lang: 'en',
      };

      const result = await service.createConcept(input);

      expect(createConceptNode).toHaveBeenCalledWith({
        id: 'test-uuid-1234-5678-9012',
        term: input.term,
        category: input.category,
        lang: input.lang,
        description: input.description,
      });

      expect(result).toEqual({
        id: mockConceptNode.id,
        term: mockConceptNode.term,
        description: mockConceptNode.description,
        category: mockConceptNode.category,
        lang: mockConceptNode.lang,
        created_at: mockConceptNode.created_at.toISOString(),
        updated_at: mockConceptNode.updated_at.toISOString(),
      });
    });

    it('should create a concept without optional category', async () => {
      const conceptWithoutCategory = { ...mockConceptNode, category: null };
      (createConceptNode as jest.Mock).mockResolvedValue(conceptWithoutCategory);

      const input = {
        term: 'API',
        description: 'Application Programming Interface',
        lang: 'en',
      };

      const result = await service.createConcept(input);

      expect(createConceptNode).toHaveBeenCalledWith({
        id: 'test-uuid-1234-5678-9012',
        term: input.term,
        category: null,
        lang: input.lang,
        description: input.description,
      });

      expect(result.category).toBeNull();
    });

    it('should propagate errors from createConceptNode', async () => {
      const error = new Error('Database error');
      (createConceptNode as jest.Mock).mockRejectedValue(error);

      await expect(
        service.createConcept({
          term: 'Test',
          description: 'Test description',
          lang: 'en',
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('getConcept', () => {
    it('should return concept when found', async () => {
      (getConceptNode as jest.Mock).mockResolvedValue(mockConceptNode);

      const result = await service.getConcept('test-uuid-1234-5678-9012');

      expect(getConceptNode).toHaveBeenCalledWith('test-uuid-1234-5678-9012');
      expect(result).toEqual({
        id: mockConceptNode.id,
        term: mockConceptNode.term,
        description: mockConceptNode.description,
        category: mockConceptNode.category,
        lang: mockConceptNode.lang,
        created_at: mockConceptNode.created_at.toISOString(),
        updated_at: mockConceptNode.updated_at.toISOString(),
      });
    });

    it('should return null when concept not found', async () => {
      (getConceptNode as jest.Mock).mockResolvedValue(null);

      const result = await service.getConcept('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateConcept', () => {
    it('should update concept with new values', async () => {
      const updatedConcept = {
        ...mockConceptNode,
        description: 'Updated description',
        updated_at: new Date('2025-01-02T00:00:00Z'),
      };
      (updateConceptNode as jest.Mock).mockResolvedValue(updatedConcept);

      const result = await service.updateConcept('test-uuid-1234-5678-9012', {
        description: 'Updated description',
      });

      expect(updateConceptNode).toHaveBeenCalledWith('test-uuid-1234-5678-9012', {
        description: 'Updated description',
      });
      expect(result?.description).toBe('Updated description');
    });

    it('should update only provided fields', async () => {
      const updatedConcept = {
        ...mockConceptNode,
        term: 'New Term',
      };
      (updateConceptNode as jest.Mock).mockResolvedValue(updatedConcept);

      await service.updateConcept('test-uuid-1234-5678-9012', {
        term: 'New Term',
      });

      expect(updateConceptNode).toHaveBeenCalledWith('test-uuid-1234-5678-9012', {
        term: 'New Term',
      });
    });

    it('should return null when concept not found', async () => {
      (updateConceptNode as jest.Mock).mockResolvedValue(null);

      const result = await service.updateConcept('non-existent-id', {
        term: 'New Term',
      });

      expect(result).toBeNull();
    });

    it('should update category field', async () => {
      const updatedConcept = { ...mockConceptNode, category: 'domain' };
      (updateConceptNode as jest.Mock).mockResolvedValue(updatedConcept);

      const result = await service.updateConcept('test-uuid-1234-5678-9012', {
        category: 'domain',
      });

      expect(updateConceptNode).toHaveBeenCalledWith('test-uuid-1234-5678-9012', {
        category: 'domain',
      });
      expect(result?.category).toBe('domain');
    });
  });

  describe('deleteConcept', () => {
    it('should return true when concept deleted successfully', async () => {
      (deleteConceptNode as jest.Mock).mockResolvedValue(true);

      const result = await service.deleteConcept('test-uuid-1234-5678-9012');

      expect(deleteConceptNode).toHaveBeenCalledWith('test-uuid-1234-5678-9012');
      expect(result).toBe(true);
    });

    it('should return false when concept not found', async () => {
      (deleteConceptNode as jest.Mock).mockResolvedValue(false);

      const result = await service.deleteConcept('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('listConcepts', () => {
    it('should return paginated list of concepts', async () => {
      (listConceptNodes as jest.Mock).mockResolvedValue({
        items: [mockConceptNode],
        total: 1,
      });

      const result = await service.listConcepts({
        limit: 20,
        offset: 0,
      });

      expect(listConceptNodes).toHaveBeenCalledWith({
        category: undefined,
        lang: undefined,
        limit: 20,
        offset: 0,
      });

      expect(result).toEqual({
        items: [
          {
            id: mockConceptNode.id,
            term: mockConceptNode.term,
            description: mockConceptNode.description,
            category: mockConceptNode.category,
            lang: mockConceptNode.lang,
            created_at: mockConceptNode.created_at.toISOString(),
            updated_at: mockConceptNode.updated_at.toISOString(),
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      });
    });

    it('should filter by category', async () => {
      (listConceptNodes as jest.Mock).mockResolvedValue({
        items: [mockConceptNode],
        total: 1,
      });

      await service.listConcepts({
        category: 'api',
        limit: 20,
        offset: 0,
      });

      expect(listConceptNodes).toHaveBeenCalledWith({
        category: 'api',
        lang: undefined,
        limit: 20,
        offset: 0,
      });
    });

    it('should filter by language', async () => {
      (listConceptNodes as jest.Mock).mockResolvedValue({
        items: [],
        total: 0,
      });

      await service.listConcepts({
        lang: 'ko',
        limit: 20,
        offset: 0,
      });

      expect(listConceptNodes).toHaveBeenCalledWith({
        category: undefined,
        lang: 'ko',
        limit: 20,
        offset: 0,
      });
    });

    it('should return empty list when no concepts found', async () => {
      (listConceptNodes as jest.Mock).mockResolvedValue({
        items: [],
        total: 0,
      });

      const result = await service.listConcepts({
        limit: 20,
        offset: 0,
      });

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getConceptImpact', () => {
    it('should return documents using the concept', async () => {
      (getDocumentsUsingConcept as jest.Mock).mockResolvedValue({
        items: [mockDocumentNode],
        total: 1,
      });

      const result = await service.getConceptImpact('test-uuid-1234-5678-9012');

      expect(getDocumentsUsingConcept).toHaveBeenCalledWith('test-uuid-1234-5678-9012');
      expect(result).toEqual({
        items: [
          {
            id: mockDocumentNode.id,
            title: mockDocumentNode.title,
            type: mockDocumentNode.type,
            status: mockDocumentNode.status,
            lang: mockDocumentNode.lang,
          },
        ],
        total: 1,
      });
    });

    it('should return null when concept not found', async () => {
      (getDocumentsUsingConcept as jest.Mock).mockResolvedValue(null);

      const result = await service.getConceptImpact('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return empty list when no documents use the concept', async () => {
      (getDocumentsUsingConcept as jest.Mock).mockResolvedValue({
        items: [],
        total: 0,
      });

      const result = await service.getConceptImpact('test-uuid-1234-5678-9012');

      expect(result).toEqual({
        items: [],
        total: 0,
      });
    });

    it('should return multiple documents when concept is widely used', async () => {
      const documents = [
        mockDocumentNode,
        { ...mockDocumentNode, id: 'doc-2', title: 'Another Guide' },
        { ...mockDocumentNode, id: 'doc-3', title: 'Third Guide' },
      ];

      (getDocumentsUsingConcept as jest.Mock).mockResolvedValue({
        items: documents,
        total: 3,
      });

      const result = await service.getConceptImpact('test-uuid-1234-5678-9012');

      expect(result?.items).toHaveLength(3);
      expect(result?.total).toBe(3);
    });
  });
});

