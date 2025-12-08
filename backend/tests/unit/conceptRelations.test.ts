/**
 * Unit Tests for Concept Relationships
 *
 * Tests business logic for SUBTYPE_OF, PART_OF, SYNONYM_OF relationships
 */

import { conceptService } from '../../src/services/conceptService';
import * as queries from '../../src/db/graphdb/queries';
import { ErrorCode } from '../../src/utils/errors';

// Mock all GraphDB queries
jest.mock('../../src/db/graphdb/queries');

const mockedQueries = queries as jest.Mocked<typeof queries>;

describe('ConceptService Relationship Unit Tests', () => {
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

  const testConceptKo = {
    id: '00000000-0000-4000-a000-000000000003',
    term: 'API 키',
    description: 'API 접근을 위한 키',
    category: 'technology',
    lang: 'ko',
    created_at: new Date('2025-12-08T10:00:00.000Z'),
    updated_at: new Date('2025-12-08T10:00:00.000Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // SUBTYPE_OF Relationships
  // ========================================
  describe('SUBTYPE_OF Relationships', () => {
    describe('linkSubtypeOf', () => {
      it('should link concept as subtype successfully', async () => {
        mockedQueries.getConceptNode
          .mockResolvedValueOnce(testConcept2) // child
          .mockResolvedValueOnce(testConcept1); // parent
        mockedQueries.linkConceptSubtypeOf.mockResolvedValue(true);

        await expect(
          conceptService.linkSubtypeOf(testConcept2.id, testConcept1.id)
        ).resolves.not.toThrow();

        expect(mockedQueries.linkConceptSubtypeOf).toHaveBeenCalledWith(
          testConcept2.id,
          testConcept1.id
        );
      });

      it('should throw NOT_FOUND when child concept does not exist', async () => {
        mockedQueries.getConceptNode.mockResolvedValue(null);

        await expect(
          conceptService.linkSubtypeOf('non-existent', testConcept1.id)
        ).rejects.toMatchObject({
          code: ErrorCode.NOT_FOUND,
        });
      });

      it('should throw NOT_FOUND when parent concept does not exist', async () => {
        mockedQueries.getConceptNode
          .mockResolvedValueOnce(testConcept2) // child exists
          .mockResolvedValueOnce(null); // parent doesn't exist

        await expect(
          conceptService.linkSubtypeOf(testConcept2.id, 'non-existent')
        ).rejects.toMatchObject({
          code: ErrorCode.NOT_FOUND,
        });
      });

      it('should throw VALIDATION_ERROR for self-reference', async () => {
        mockedQueries.getConceptNode.mockResolvedValue(testConcept1);

        await expect(
          conceptService.linkSubtypeOf(testConcept1.id, testConcept1.id)
        ).rejects.toMatchObject({
          code: ErrorCode.VALIDATION_ERROR,
        });
      });
    });

    describe('unlinkSubtypeOf', () => {
      it('should unlink successfully', async () => {
        mockedQueries.unlinkConceptSubtypeOf.mockResolvedValue(true);

        await expect(
          conceptService.unlinkSubtypeOf(testConcept2.id, testConcept1.id)
        ).resolves.not.toThrow();
      });

      it('should throw NOT_FOUND when relationship does not exist', async () => {
        mockedQueries.unlinkConceptSubtypeOf.mockResolvedValue(false);

        await expect(
          conceptService.unlinkSubtypeOf(testConcept2.id, testConcept1.id)
        ).rejects.toMatchObject({
          code: ErrorCode.NOT_FOUND,
        });
      });
    });

    describe('getSupertypes', () => {
      it('should return supertypes', async () => {
        mockedQueries.getConceptNode.mockResolvedValue(testConcept2);
        mockedQueries.getConceptSupertypes.mockResolvedValue([testConcept1]);

        const result = await conceptService.getSupertypes(testConcept2.id);

        expect(result).toHaveLength(1);
        expect(result[0].term).toBe('API');
      });

      it('should throw NOT_FOUND when concept does not exist', async () => {
        mockedQueries.getConceptNode.mockResolvedValue(null);

        await expect(
          conceptService.getSupertypes('non-existent')
        ).rejects.toMatchObject({
          code: ErrorCode.NOT_FOUND,
        });
      });
    });

    describe('getSubtypes', () => {
      it('should return subtypes', async () => {
        mockedQueries.getConceptNode.mockResolvedValue(testConcept1);
        mockedQueries.getConceptSubtypes.mockResolvedValue([testConcept2]);

        const result = await conceptService.getSubtypes(testConcept1.id);

        expect(result).toHaveLength(1);
        expect(result[0].term).toBe('REST API');
      });
    });
  });

  // ========================================
  // PART_OF Relationships
  // ========================================
  describe('PART_OF Relationships', () => {
    describe('linkPartOf', () => {
      it('should link concept as part successfully', async () => {
        mockedQueries.getConceptNode
          .mockResolvedValueOnce(testConcept2) // part
          .mockResolvedValueOnce(testConcept1); // whole
        mockedQueries.linkConceptPartOf.mockResolvedValue(true);

        await expect(
          conceptService.linkPartOf(testConcept2.id, testConcept1.id)
        ).resolves.not.toThrow();

        expect(mockedQueries.linkConceptPartOf).toHaveBeenCalledWith(
          testConcept2.id,
          testConcept1.id
        );
      });

      it('should throw VALIDATION_ERROR for self-reference', async () => {
        mockedQueries.getConceptNode.mockResolvedValue(testConcept1);

        await expect(
          conceptService.linkPartOf(testConcept1.id, testConcept1.id)
        ).rejects.toMatchObject({
          code: ErrorCode.VALIDATION_ERROR,
        });
      });
    });

    describe('unlinkPartOf', () => {
      it('should unlink successfully', async () => {
        mockedQueries.unlinkConceptPartOf.mockResolvedValue(true);

        await expect(
          conceptService.unlinkPartOf(testConcept2.id, testConcept1.id)
        ).resolves.not.toThrow();
      });
    });

    describe('getWholeOf', () => {
      it('should return what this is part of', async () => {
        mockedQueries.getConceptNode.mockResolvedValue(testConcept2);
        mockedQueries.getConceptWholeOf.mockResolvedValue([testConcept1]);

        const result = await conceptService.getWholeOf(testConcept2.id);

        expect(result).toHaveLength(1);
      });
    });

    describe('getParts', () => {
      it('should return parts of this', async () => {
        mockedQueries.getConceptNode.mockResolvedValue(testConcept1);
        mockedQueries.getConceptParts.mockResolvedValue([testConcept2]);

        const result = await conceptService.getParts(testConcept1.id);

        expect(result).toHaveLength(1);
      });
    });
  });

  // ========================================
  // SYNONYM_OF Relationships
  // ========================================
  describe('SYNONYM_OF Relationships', () => {
    const testSynonym = {
      ...testConcept1,
      id: '00000000-0000-4000-a000-000000000004',
      term: 'Application Interface',
    };

    describe('linkSynonymOf', () => {
      it('should link concepts as synonyms successfully', async () => {
        mockedQueries.getConceptNode
          .mockResolvedValueOnce(testConcept1)
          .mockResolvedValueOnce(testSynonym);
        mockedQueries.linkConceptSynonymOf.mockResolvedValue(true);

        await expect(
          conceptService.linkSynonymOf(testConcept1.id, testSynonym.id)
        ).resolves.not.toThrow();

        expect(mockedQueries.linkConceptSynonymOf).toHaveBeenCalledWith(
          testConcept1.id,
          testSynonym.id
        );
      });

      it('should throw VALIDATION_ERROR for self-reference', async () => {
        mockedQueries.getConceptNode.mockResolvedValue(testConcept1);

        await expect(
          conceptService.linkSynonymOf(testConcept1.id, testConcept1.id)
        ).rejects.toMatchObject({
          code: ErrorCode.VALIDATION_ERROR,
        });
      });

      it('should throw VALIDATION_ERROR for different languages', async () => {
        mockedQueries.getConceptNode
          .mockResolvedValueOnce(testConcept1) // lang: 'en'
          .mockResolvedValueOnce(testConceptKo); // lang: 'ko'

        await expect(
          conceptService.linkSynonymOf(testConcept1.id, testConceptKo.id)
        ).rejects.toMatchObject({
          code: ErrorCode.VALIDATION_ERROR,
        });
      });
    });

    describe('unlinkSynonymOf', () => {
      it('should unlink successfully', async () => {
        mockedQueries.unlinkConceptSynonymOf.mockResolvedValue(true);

        await expect(
          conceptService.unlinkSynonymOf(testConcept1.id, testSynonym.id)
        ).resolves.not.toThrow();
      });
    });

    describe('getSynonyms', () => {
      it('should return synonyms', async () => {
        mockedQueries.getConceptNode.mockResolvedValue(testConcept1);
        mockedQueries.getConceptSynonyms.mockResolvedValue([testSynonym]);

        const result = await conceptService.getSynonyms(testConcept1.id);

        expect(result).toHaveLength(1);
        expect(result[0].term).toBe('Application Interface');
      });
    });
  });
});

