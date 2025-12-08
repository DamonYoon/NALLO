/**
 * Unit Tests for Document Relationships
 *
 * Tests business logic for LINKS_TO and WORKING_COPY_OF relationships
 */

import { documentService } from '../../src/services/documentService';
import * as queries from '../../src/db/graphdb/queries';
import { ErrorCode } from '../../src/utils/errors';

// Mock all GraphDB queries
jest.mock('../../src/db/graphdb/queries');

// Mock storage connection
jest.mock('../../src/db/storage/connection', () => ({
  uploadFile: jest.fn(),
  downloadFile: jest.fn(),
  deleteFile: jest.fn(),
  fileExists: jest.fn(),
}));

const mockedQueries = queries as jest.Mocked<typeof queries>;

describe('DocumentService Relationship Unit Tests', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // LINKS_TO Relationships
  // ========================================
  describe('LINKS_TO Relationships', () => {
    describe('linkToDocument', () => {
      it('should link document to another successfully', async () => {
        mockedQueries.getDocumentNode
          .mockResolvedValueOnce(testDocument1) // source
          .mockResolvedValueOnce(testDocument2); // target
        mockedQueries.linkDocumentToDocument.mockResolvedValue(true);

        await expect(
          documentService.linkToDocument(testDocument1.id, testDocument2.id)
        ).resolves.not.toThrow();

        expect(mockedQueries.linkDocumentToDocument).toHaveBeenCalledWith(
          testDocument1.id,
          testDocument2.id
        );
      });

      it('should throw NOT_FOUND when source document does not exist', async () => {
        mockedQueries.getDocumentNode.mockResolvedValue(null);

        await expect(
          documentService.linkToDocument('non-existent', testDocument2.id)
        ).rejects.toMatchObject({
          code: ErrorCode.NOT_FOUND,
        });
      });

      it('should throw NOT_FOUND when target document does not exist', async () => {
        mockedQueries.getDocumentNode
          .mockResolvedValueOnce(testDocument1) // source exists
          .mockResolvedValueOnce(null); // target doesn't exist

        await expect(
          documentService.linkToDocument(testDocument1.id, 'non-existent')
        ).rejects.toMatchObject({
          code: ErrorCode.NOT_FOUND,
        });
      });

      it('should throw VALIDATION_ERROR for self-reference', async () => {
        mockedQueries.getDocumentNode.mockResolvedValue(testDocument1);

        await expect(
          documentService.linkToDocument(testDocument1.id, testDocument1.id)
        ).rejects.toMatchObject({
          code: ErrorCode.VALIDATION_ERROR,
        });
      });
    });

    describe('unlinkFromDocument', () => {
      it('should unlink successfully', async () => {
        mockedQueries.unlinkDocumentFromDocument.mockResolvedValue(true);

        await expect(
          documentService.unlinkFromDocument(testDocument1.id, testDocument2.id)
        ).resolves.not.toThrow();
      });

      it('should throw NOT_FOUND when link does not exist', async () => {
        mockedQueries.unlinkDocumentFromDocument.mockResolvedValue(false);

        await expect(
          documentService.unlinkFromDocument(testDocument1.id, testDocument2.id)
        ).rejects.toMatchObject({
          code: ErrorCode.NOT_FOUND,
        });
      });
    });

    describe('getLinkedDocuments', () => {
      it('should return linked documents', async () => {
        mockedQueries.getDocumentNode.mockResolvedValue(testDocument1);
        mockedQueries.getLinkedDocuments.mockResolvedValue([testDocument2]);

        const result = await documentService.getLinkedDocuments(testDocument1.id);

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('API Reference');
      });

      it('should throw NOT_FOUND when document does not exist', async () => {
        mockedQueries.getDocumentNode.mockResolvedValue(null);

        await expect(
          documentService.getLinkedDocuments('non-existent')
        ).rejects.toMatchObject({
          code: ErrorCode.NOT_FOUND,
        });
      });
    });

    describe('getLinkingDocuments', () => {
      it('should return documents linking to this (backlinks)', async () => {
        mockedQueries.getDocumentNode.mockResolvedValue(testDocument2);
        mockedQueries.getLinkingDocuments.mockResolvedValue([testDocument1]);

        const result = await documentService.getLinkingDocuments(testDocument2.id);

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Getting Started');
      });
    });
  });

  // ========================================
  // WORKING_COPY_OF Relationships
  // ========================================
  describe('WORKING_COPY_OF Relationships', () => {
    describe('createWorkingCopy', () => {
      it('should create working copy relationship successfully', async () => {
        mockedQueries.getDocumentNode
          .mockResolvedValueOnce(testWorkingCopy) // copy
          .mockResolvedValueOnce(testDocument1); // original
        mockedQueries.createWorkingCopy.mockResolvedValue(true);

        await expect(
          documentService.createWorkingCopy(testWorkingCopy.id, testDocument1.id)
        ).resolves.not.toThrow();

        expect(mockedQueries.createWorkingCopy).toHaveBeenCalledWith(
          testWorkingCopy.id,
          testDocument1.id
        );
      });

      it('should throw NOT_FOUND when copy document does not exist', async () => {
        mockedQueries.getDocumentNode.mockResolvedValue(null);

        await expect(
          documentService.createWorkingCopy('non-existent', testDocument1.id)
        ).rejects.toMatchObject({
          code: ErrorCode.NOT_FOUND,
        });
      });

      it('should throw NOT_FOUND when original document does not exist', async () => {
        mockedQueries.getDocumentNode
          .mockResolvedValueOnce(testWorkingCopy) // copy exists
          .mockResolvedValueOnce(null); // original doesn't exist

        await expect(
          documentService.createWorkingCopy(testWorkingCopy.id, 'non-existent')
        ).rejects.toMatchObject({
          code: ErrorCode.NOT_FOUND,
        });
      });

      it('should throw VALIDATION_ERROR for self-reference', async () => {
        mockedQueries.getDocumentNode.mockResolvedValue(testDocument1);

        await expect(
          documentService.createWorkingCopy(testDocument1.id, testDocument1.id)
        ).rejects.toMatchObject({
          code: ErrorCode.VALIDATION_ERROR,
        });
      });
    });

    describe('removeWorkingCopy', () => {
      it('should remove working copy relationship successfully', async () => {
        mockedQueries.removeWorkingCopy.mockResolvedValue(true);

        await expect(
          documentService.removeWorkingCopy(testWorkingCopy.id, testDocument1.id)
        ).resolves.not.toThrow();
      });

      it('should throw NOT_FOUND when relationship does not exist', async () => {
        mockedQueries.removeWorkingCopy.mockResolvedValue(false);

        await expect(
          documentService.removeWorkingCopy(testWorkingCopy.id, testDocument1.id)
        ).rejects.toMatchObject({
          code: ErrorCode.NOT_FOUND,
        });
      });
    });

    describe('getOriginalDocument', () => {
      it('should return original document', async () => {
        mockedQueries.getDocumentNode.mockResolvedValue(testWorkingCopy);
        mockedQueries.getOriginalDocument.mockResolvedValue(testDocument1);

        const result = await documentService.getOriginalDocument(testWorkingCopy.id);

        expect(result).not.toBeNull();
        expect(result?.title).toBe('Getting Started');
      });

      it('should return null when no original exists', async () => {
        mockedQueries.getDocumentNode.mockResolvedValue(testDocument1);
        mockedQueries.getOriginalDocument.mockResolvedValue(null);

        const result = await documentService.getOriginalDocument(testDocument1.id);

        expect(result).toBeNull();
      });

      it('should throw NOT_FOUND when document does not exist', async () => {
        mockedQueries.getDocumentNode.mockResolvedValue(null);

        await expect(
          documentService.getOriginalDocument('non-existent')
        ).rejects.toMatchObject({
          code: ErrorCode.NOT_FOUND,
        });
      });
    });

    describe('getWorkingCopies', () => {
      it('should return working copies', async () => {
        mockedQueries.getDocumentNode.mockResolvedValue(testDocument1);
        mockedQueries.getWorkingCopies.mockResolvedValue([testWorkingCopy]);

        const result = await documentService.getWorkingCopies(testDocument1.id);

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Getting Started (Working Copy)');
      });

      it('should throw NOT_FOUND when document does not exist', async () => {
        mockedQueries.getDocumentNode.mockResolvedValue(null);

        await expect(
          documentService.getWorkingCopies('non-existent')
        ).rejects.toMatchObject({
          code: ErrorCode.NOT_FOUND,
        });
      });
    });
  });
});

