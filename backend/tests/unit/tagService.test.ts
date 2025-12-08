/**
 * Unit Tests for Tag Service
 *
 * Tests business logic for Tag management and HAS_TAG relationships
 */

import { tagService } from '../../src/services/tagService';
import * as queries from '../../src/db/graphdb/queries';
import { AppError, ErrorCode } from '../../src/utils/errors';

// Mock all GraphDB queries
jest.mock('../../src/db/graphdb/queries');

const mockedQueries = queries as jest.Mocked<typeof queries>;

describe('TagService Unit Tests', () => {
  const testTag = {
    id: '00000000-0000-4000-a000-000000000001',
    name: 'test-tag',
    color: '#FF5733',
    description: 'A test tag',
    created_at: '2025-12-08T10:00:00.000Z',
    updated_at: '2025-12-08T10:00:00.000Z',
  };

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

  const testConcept = {
    id: '00000000-0000-4000-a000-000000000020',
    term: 'Test Concept',
    description: 'A test concept',
    category: 'test',
    lang: 'en',
    created_at: new Date('2025-12-08T10:00:00.000Z'),
    updated_at: new Date('2025-12-08T10:00:00.000Z'),
  };

  const testPage = {
    id: '00000000-0000-4000-a000-000000000030',
    title: 'Test Page',
    slug: 'test-page',
    order: 0,
    visible: true,
    created_at: new Date('2025-12-08T10:00:00.000Z'),
    updated_at: new Date('2025-12-08T10:00:00.000Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // createTag
  // ========================================
  describe('createTag', () => {
    it('should create a tag successfully', async () => {
      mockedQueries.getTagNodeByName.mockResolvedValue(null);
      mockedQueries.createTagNode.mockResolvedValue(testTag);

      const result = await tagService.createTag({
        name: 'test-tag',
        color: '#FF5733',
        description: 'A test tag',
      });

      expect(result).toEqual(testTag);
      expect(mockedQueries.createTagNode).toHaveBeenCalledWith({
        name: 'test-tag',
        color: '#FF5733',
        description: 'A test tag',
      });
    });

    it('should throw CONFLICT when tag name already exists', async () => {
      mockedQueries.getTagNodeByName.mockResolvedValue(testTag);

      await expect(
        tagService.createTag({ name: 'test-tag' })
      ).rejects.toThrow(AppError);

      await expect(
        tagService.createTag({ name: 'test-tag' })
      ).rejects.toMatchObject({
        code: ErrorCode.CONFLICT,
      });
    });
  });

  // ========================================
  // getTag
  // ========================================
  describe('getTag', () => {
    it('should return a tag by ID', async () => {
      mockedQueries.getTagNode.mockResolvedValue(testTag);

      const result = await tagService.getTag(testTag.id);

      expect(result).toEqual(testTag);
      expect(mockedQueries.getTagNode).toHaveBeenCalledWith(testTag.id);
    });

    it('should throw NOT_FOUND when tag does not exist', async () => {
      mockedQueries.getTagNode.mockResolvedValue(null);

      await expect(
        tagService.getTag('non-existent-id')
      ).rejects.toThrow(AppError);

      await expect(
        tagService.getTag('non-existent-id')
      ).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
      });
    });
  });

  // ========================================
  // updateTag
  // ========================================
  describe('updateTag', () => {
    it('should update a tag successfully', async () => {
      const updatedTag = { ...testTag, name: 'updated-tag' };
      mockedQueries.getTagNode.mockResolvedValue(testTag);
      mockedQueries.getTagNodeByName.mockResolvedValue(null);
      mockedQueries.updateTagNode.mockResolvedValue(updatedTag);

      const result = await tagService.updateTag(testTag.id, { name: 'updated-tag' });

      expect(result).toEqual(updatedTag);
    });

    it('should throw NOT_FOUND when tag does not exist', async () => {
      mockedQueries.getTagNode.mockResolvedValue(null);

      await expect(
        tagService.updateTag('non-existent-id', { name: 'updated' })
      ).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
      });
    });

    it('should throw CONFLICT when updating to existing name', async () => {
      const existingTag = { ...testTag, id: 'other-id' };
      mockedQueries.getTagNode.mockResolvedValue(testTag);
      mockedQueries.getTagNodeByName.mockResolvedValue(existingTag);

      await expect(
        tagService.updateTag(testTag.id, { name: 'existing-name' })
      ).rejects.toMatchObject({
        code: ErrorCode.CONFLICT,
      });
    });
  });

  // ========================================
  // deleteTag
  // ========================================
  describe('deleteTag', () => {
    it('should delete a tag successfully', async () => {
      mockedQueries.deleteTagNode.mockResolvedValue(true);

      await expect(tagService.deleteTag(testTag.id)).resolves.not.toThrow();
      expect(mockedQueries.deleteTagNode).toHaveBeenCalledWith(testTag.id);
    });

    it('should throw NOT_FOUND when tag does not exist', async () => {
      mockedQueries.deleteTagNode.mockResolvedValue(false);

      await expect(
        tagService.deleteTag('non-existent-id')
      ).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
      });
    });
  });

  // ========================================
  // listTags
  // ========================================
  describe('listTags', () => {
    it('should return a list of tags', async () => {
      mockedQueries.listTagNodes.mockResolvedValue({
        items: [testTag],
        total: 1,
      });

      const result = await tagService.listTags({ limit: 20, offset: 0 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should support search parameter', async () => {
      mockedQueries.listTagNodes.mockResolvedValue({
        items: [],
        total: 0,
      });

      await tagService.listTags({ limit: 20, offset: 0, search: 'test' });

      expect(mockedQueries.listTagNodes).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
        search: 'test',
      });
    });
  });

  // ========================================
  // Document-Tag Relationships
  // ========================================
  describe('Document-Tag Relationships', () => {
    it('linkDocumentToTag should link successfully', async () => {
      mockedQueries.getDocumentNode.mockResolvedValue(testDocument);
      mockedQueries.getTagNode.mockResolvedValue(testTag);
      mockedQueries.linkDocumentToTag.mockResolvedValue(true);

      await expect(
        tagService.linkDocumentToTag(testDocument.id, testTag.id)
      ).resolves.not.toThrow();
    });

    it('linkDocumentToTag should throw NOT_FOUND when document does not exist', async () => {
      mockedQueries.getDocumentNode.mockResolvedValue(null);

      await expect(
        tagService.linkDocumentToTag('non-existent', testTag.id)
      ).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
      });
    });

    it('linkDocumentToTag should throw NOT_FOUND when tag does not exist', async () => {
      mockedQueries.getDocumentNode.mockResolvedValue(testDocument);
      mockedQueries.getTagNode.mockResolvedValue(null);

      await expect(
        tagService.linkDocumentToTag(testDocument.id, 'non-existent')
      ).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
      });
    });

    it('unlinkDocumentFromTag should unlink successfully', async () => {
      mockedQueries.unlinkDocumentFromTag.mockResolvedValue(true);

      await expect(
        tagService.unlinkDocumentFromTag(testDocument.id, testTag.id)
      ).resolves.not.toThrow();
    });

    it('getTagsForDocument should return tags', async () => {
      mockedQueries.getDocumentNode.mockResolvedValue(testDocument);
      mockedQueries.getTagsForDocument.mockResolvedValue([testTag]);

      const result = await tagService.getTagsForDocument(testDocument.id);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(testTag);
    });
  });

  // ========================================
  // Concept-Tag Relationships
  // ========================================
  describe('Concept-Tag Relationships', () => {
    it('linkConceptToTag should link successfully', async () => {
      mockedQueries.getConceptNode.mockResolvedValue(testConcept);
      mockedQueries.getTagNode.mockResolvedValue(testTag);
      mockedQueries.linkConceptToTag.mockResolvedValue(true);

      await expect(
        tagService.linkConceptToTag(testConcept.id, testTag.id)
      ).resolves.not.toThrow();
    });

    it('getTagsForConcept should return tags', async () => {
      mockedQueries.getConceptNode.mockResolvedValue(testConcept);
      mockedQueries.getTagsForConcept.mockResolvedValue([testTag]);

      const result = await tagService.getTagsForConcept(testConcept.id);

      expect(result).toHaveLength(1);
    });
  });

  // ========================================
  // Page-Tag Relationships
  // ========================================
  describe('Page-Tag Relationships', () => {
    it('linkPageToTag should link successfully', async () => {
      mockedQueries.getPageNode.mockResolvedValue(testPage);
      mockedQueries.getTagNode.mockResolvedValue(testTag);
      mockedQueries.linkPageToTag.mockResolvedValue(true);

      await expect(
        tagService.linkPageToTag(testPage.id, testTag.id)
      ).resolves.not.toThrow();
    });

    it('getTagsForPage should return tags', async () => {
      mockedQueries.getPageNode.mockResolvedValue(testPage);
      mockedQueries.getTagsForPage.mockResolvedValue([testTag]);

      const result = await tagService.getTagsForPage(testPage.id);

      expect(result).toHaveLength(1);
    });
  });

  // ========================================
  // getEntitiesWithTag
  // ========================================
  describe('getEntitiesWithTag', () => {
    it('should return entities with a tag', async () => {
      mockedQueries.getTagNode.mockResolvedValue(testTag);
      mockedQueries.getEntitiesWithTag.mockResolvedValue([
        { id: testDocument.id, type: 'Document' as const },
        { id: testConcept.id, type: 'Concept' as const },
      ]);

      const result = await tagService.getEntitiesWithTag(testTag.id);

      expect(result).toHaveLength(2);
    });

    it('should throw NOT_FOUND when tag does not exist', async () => {
      mockedQueries.getTagNode.mockResolvedValue(null);

      await expect(
        tagService.getEntitiesWithTag('non-existent')
      ).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
      });
    });
  });
});

