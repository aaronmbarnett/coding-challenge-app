import { describe, it, expect, beforeEach, vi } from 'vitest';
import { THIRTY_MINUTES_SECONDS, ONE_HOUR_SECONDS } from '$lib/test-fixtures';
import { load, actions } from './+page.server';
import { fail, redirect } from '@sveltejs/kit';
import * as table from '$lib/server/db/schema';

// Mock SvelteKit functions
vi.mock('@sveltejs/kit', async () => {
  const actual = await vi.importActual('@sveltejs/kit');
  return {
    ...actual,
    fail: vi.fn((status: number, data: any) => ({ status, data })),
    redirect: vi.fn((status: number, location: string) => {
      const err = new Error(`Redirect to ${location}`) as any;
      err.status = status;
      err.location = location;
      throw err;
    })
  };
});

// Type for the expected return value
interface LoadResult {
  challenges: Array<{
    id: string;
    title: string;
    descriptionMd?: string;
    languagesCsv?: string;
    starterCode?: string | null;
    timeLimitSec?: number | null;
    createdAt?: Date;
  }>;
}

// Create a simple mock that returns data directly
const createMockDb = (mockData: any) => {
  return {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue(mockData)
      })
    })
  };
};

describe('/admin/challenges page server load', () => {
  describe('load function', () => {
    it('should load challenges ordered by creation date', async () => {
      const mockChallenges = [
        {
          id: 'challenge-1',
          title: 'Array Sum',
          descriptionMd: '# Calculate sum of array',
          languagesCsv: 'javascript,python',
          starterCode: 'function sum(arr) {}',
          timeLimitSec: THIRTY_MINUTES_SECONDS,
          createdAt: new Date('2024-01-01T10:00:00Z')
        },
        {
          id: 'challenge-2',
          title: 'String Reverse',
          descriptionMd: '# Reverse a string',
          languagesCsv: 'javascript,python,go',
          starterCode: null,
          timeLimitSec: 900,
          createdAt: new Date('2024-01-02T10:00:00Z')
        }
      ];

      const mockDb = createMockDb(mockChallenges);
      const locals = { db: mockDb };

      const result = await load({ locals } as any);

      expect(result).toEqual({
        challenges: mockChallenges
      });

      // Verify database was called
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should handle empty challenges list', async () => {
      const mockChallenges: any[] = [];
      const mockDb = createMockDb(mockChallenges);
      const locals = { db: mockDb };

      const result = await load({ locals } as any);

      expect(result).toEqual({
        challenges: []
      });
    });

    it('should handle challenges with different field combinations', async () => {
      const mockChallenges = [
        {
          id: 'challenge-1',
          title: 'With Starter Code',
          descriptionMd: '# Description',
          languagesCsv: 'javascript',
          starterCode: 'console.log("start");',
          timeLimitSec: ONE_HOUR_SECONDS,
          createdAt: new Date('2024-01-01T10:00:00Z')
        },
        {
          id: 'challenge-2',
          title: 'Without Starter Code',
          descriptionMd: '# Another Description',
          languagesCsv: 'python,go',
          starterCode: null,
          timeLimitSec: null,
          createdAt: new Date('2024-01-02T10:00:00Z')
        }
      ];

      const mockDb = createMockDb(mockChallenges);
      const locals = { db: mockDb };

      const result = (await load({ locals } as any)) as LoadResult;

      expect(result.challenges).toHaveLength(2);
      expect(result.challenges[0].starterCode).toBe('console.log("start");');
      expect(result.challenges[1].starterCode).toBeNull();
      expect(result.challenges[0].timeLimitSec).toBe(ONE_HOUR_SECONDS);
      expect(result.challenges[1].timeLimitSec).toBeNull();
    });

    it('should handle challenges with multiple languages', async () => {
      const mockChallenges = [
        {
          id: 'challenge-1',
          title: 'Multi-Language Challenge',
          languagesCsv: 'javascript,python,go,rust,typescript'
        }
      ];

      const mockDb = createMockDb(mockChallenges);
      const locals = { db: mockDb };

      const result = (await load({ locals } as any)) as LoadResult;

      expect(result.challenges[0].languagesCsv).toBe('javascript,python,go,rust,typescript');
    });

    it('should return data structure correctly', async () => {
      const mockChallenges = [
        {
          id: 'test-challenge',
          title: 'Test Challenge',
          descriptionMd: '# Test',
          languagesCsv: 'javascript',
          starterCode: null,
          timeLimitSec: THIRTY_MINUTES_SECONDS,
          createdAt: new Date()
        }
      ];

      const mockDb = createMockDb(mockChallenges);
      const locals = { db: mockDb };

      const result = (await load({ locals } as any)) as LoadResult;

      expect(result).toHaveProperty('challenges');
      expect(Array.isArray(result.challenges)).toBe(true);
      expect(result.challenges[0]).toHaveProperty('id');
      expect(result.challenges[0]).toHaveProperty('title');
      expect(result.challenges[0]).toHaveProperty('languagesCsv');
    });
  });

  describe('bulk deletion actions', () => {
    // Contract-based database mock for bulk operations
    const createBulkMockDb = () => ({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn(),
          innerJoin: vi.fn().mockReturnThis()
        })
      }),
      delete: vi.fn().mockImplementation(() => ({
        where: vi.fn().mockResolvedValue({})
      }))
    });

    let mockDb: ReturnType<typeof createBulkMockDb>;

    beforeEach(() => {
      vi.clearAllMocks();
      mockDb = createBulkMockDb();
    });

    describe('bulkDelete action', () => {
      it('should successfully delete multiple challenges when no constraints exist', async () => {
        const challengeIds = ['challenge-1', 'challenge-2', 'challenge-3'];

        const mockFormData = new FormData();
        challengeIds.forEach(id => mockFormData.append('challengeIds', id));

        const mockRequest = {
          formData: vi.fn().mockResolvedValue(mockFormData)
        };

        // Mock no attempts exist for any challenge
        mockDb.select().from().where.mockResolvedValueOnce([]);
        // Mock no submissions exist for any challenge
        mockDb.select().from().innerJoin().where.mockResolvedValueOnce([]);

        const locals = { db: mockDb };

        await expect(actions.bulkDelete({ request: mockRequest, locals } as any)).rejects.toThrow(
          'Redirect to /admin/challenges'
        );

        // Should delete test cases for all challenges, then all challenges
        expect(mockDb.delete).toHaveBeenCalledWith(table.challengeTests);
        expect(mockDb.delete).toHaveBeenCalledWith(table.challenges);
        expect(redirect).toHaveBeenCalledWith(303, '/admin/challenges');
      });

      it('should return error when no challenges are selected', async () => {
        const mockFormData = new FormData();
        // No challengeIds added

        const mockRequest = {
          formData: vi.fn().mockResolvedValue(mockFormData)
        };

        const locals = { db: mockDb };

        const result = await actions.bulkDelete({ request: mockRequest, locals } as any);

        expect(result).toEqual({
          status: 400,
          data: { message: 'No challenges selected for deletion' }
        });
        expect(mockDb.select).not.toHaveBeenCalled();
      });

      it('should return error when challenges have existing attempts', async () => {
        const challengeIds = ['challenge-1', 'challenge-2'];

        const mockFormData = new FormData();
        challengeIds.forEach(id => mockFormData.append('challengeIds', id));

        const mockRequest = {
          formData: vi.fn().mockResolvedValue(mockFormData)
        };

        // Mock attempts exist for one of the challenges
        mockDb.select().from().where.mockResolvedValueOnce([
          { id: 'attempt-1', challengeId: 'challenge-1', sessionId: 'session-1' }
        ]);

        const locals = { db: mockDb };

        const result = await actions.bulkDelete({ request: mockRequest, locals } as any);

        expect(result).toEqual({
          status: 400,
          data: { message: 'Cannot delete challenges with existing attempts.' }
        });
        expect(mockDb.delete).not.toHaveBeenCalled();
      });

      it('should return error when challenges have existing submissions', async () => {
        const challengeIds = ['challenge-1', 'challenge-2'];

        const mockFormData = new FormData();
        challengeIds.forEach(id => mockFormData.append('challengeIds', id));

        const mockRequest = {
          formData: vi.fn().mockResolvedValue(mockFormData)
        };

        // Mock no attempts
        mockDb.select().from().where.mockResolvedValueOnce([]);
        // Mock submissions exist
        mockDb.select().from().innerJoin().where.mockResolvedValueOnce([
          { id: 'submission-1', code: 'console.log("test")' }
        ]);

        const locals = { db: mockDb };

        const result = await actions.bulkDelete({ request: mockRequest, locals } as any);

        expect(result).toEqual({
          status: 400,
          data: { message: 'Cannot delete challenge with existing submissions. Data preservation required.' }
        });
        expect(mockDb.delete).not.toHaveBeenCalled();
      });

      it('should handle database errors during bulk deletion', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const challengeIds = ['challenge-1', 'challenge-2'];

        const mockFormData = new FormData();
        challengeIds.forEach(id => mockFormData.append('challengeIds', id));

        const mockRequest = {
          formData: vi.fn().mockResolvedValue(mockFormData)
        };

        // Mock constraint checks pass
        mockDb.select().from().where
          .mockResolvedValueOnce([]) // No attempts
          .mockResolvedValueOnce([]); // No submissions

        // Mock database error on test case deletion
        mockDb.delete.mockImplementationOnce(() => ({
          where: vi.fn().mockRejectedValue(new Error('Foreign key constraint violation'))
        }));

        const locals = { db: mockDb };

        const result = await actions.bulkDelete({ request: mockRequest, locals } as any);

        expect(result).toEqual({
          status: 500,
          data: { message: 'Failed to delete challenges' }
        });
        expect(consoleSpy).toHaveBeenCalledWith('Error in bulk delete:', expect.any(Error));

        consoleSpy.mockRestore();
      });
    });
  });
});
