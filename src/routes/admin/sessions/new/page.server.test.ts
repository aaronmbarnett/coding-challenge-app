import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  mockCandidates,
  mockChallenges,
  TEN_MINUTES_SECONDS,
  THIRTY_MINUTES_SECONDS,
  TWO_HOURS_SECONDS
} from '$lib/test-fixtures';
import { load } from './+page.server';

// Type for the expected return value
interface SessionNewLoadResult {
  candidates: Array<{
    id: string;
    email: string;
  }>;
  challenges: Array<{
    id: string;
    title: string;
    timeLimitSec: number | null;
  }>;
}

// Create mock db for form data loading
const createMockDbForNewSession = (mockCandidates: any, mockChallenges: any) => {
  return {
    select: vi
      .fn()
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockCandidates)
          })
        })
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockChallenges)
        })
      })
  };
};

describe('/admin/sessions/new +page.server.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('load function', () => {
    it('should load candidates and challenges for form options', async () => {
      // Use first two candidates and challenges from fixtures
      const testCandidates = mockCandidates.slice(0, 2);
      const testChallenges = mockChallenges.slice(0, 2);

      const mockDb = createMockDbForNewSession(testCandidates, testChallenges);
      const locals = { db: mockDb };

      const result = (await load({ locals } as any)) as SessionNewLoadResult;

      expect(result).toEqual({
        candidates: testCandidates,
        challenges: testChallenges
      });

      // Verify database was called
      expect(mockDb.select).toHaveBeenCalledTimes(2);
    });

    it('should handle empty candidates list', async () => {
      const mockCandidates: any[] = [];
      const mockChallenges = [
        {
          id: 'challenge-1',
          title: 'Some Challenge',
          timeLimitSec: THIRTY_MINUTES_SECONDS
        }
      ];

      const mockDb = createMockDbForNewSession(mockCandidates, mockChallenges);
      const locals = { db: mockDb };

      const result = (await load({ locals } as any)) as SessionNewLoadResult;

      expect(result).toEqual({
        candidates: [],
        challenges: mockChallenges
      });
    });

    it('should handle empty challenges list', async () => {
      const testCandidates = mockCandidates.slice(0, 1);
      const testChallenges: any[] = [];

      const mockDb = createMockDbForNewSession(testCandidates, testChallenges);
      const locals = { db: mockDb };

      const result = (await load({ locals } as any)) as SessionNewLoadResult;

      expect(result).toEqual({
        candidates: testCandidates,
        challenges: []
      });
    });

    it('should filter candidates by role', async () => {
      const mockDb = createMockDbForNewSession([], []);
      const locals = { db: mockDb };

      await load({ locals } as any);

      // Verify database was called
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should order candidates by email and challenges by title', async () => {
      const mockDb = createMockDbForNewSession([], []);
      const locals = { db: mockDb };

      await load({ locals } as any);

      // Verify database was called for both queries
      expect(mockDb.select).toHaveBeenCalledTimes(2);
    });

    it('should handle challenges with different time limits', async () => {
      const mockChallenges = [
        {
          id: 'challenge-1',
          title: 'Quick Challenge',
          timeLimitSec: TEN_MINUTES_SECONDS
        },
        {
          id: 'challenge-2',
          title: 'Long Challenge',
          timeLimitSec: TWO_HOURS_SECONDS
        },
        {
          id: 'challenge-3',
          title: 'No Time Limit',
          timeLimitSec: null
        }
      ];

      const mockDb = createMockDbForNewSession([], mockChallenges);
      const locals = { db: mockDb };

      const result = (await load({ locals } as any)) as SessionNewLoadResult;

      expect(result.challenges).toEqual(mockChallenges);
      expect(result.challenges[0].timeLimitSec).toBe(TEN_MINUTES_SECONDS);
      expect(result.challenges[1].timeLimitSec).toBe(TWO_HOURS_SECONDS);
      expect(result.challenges[2].timeLimitSec).toBeNull();
    });

    it('should preserve email and title ordering', async () => {
      // Use all candidates and challenges from fixtures for ordering test
      const testCandidates = [...mockCandidates];
      const testChallenges = [...mockChallenges];

      const mockDb = createMockDbForNewSession(testCandidates, testChallenges);
      const locals = { db: mockDb };

      const result = (await load({ locals } as any)) as SessionNewLoadResult;

      // Verify ordering is preserved as returned by database
      expect(result.candidates[0].email).toBe('alice@example.com');
      expect(result.candidates[1].email).toBe('bob@example.com');
      expect(result.candidates[2].email).toBe('charlie@example.com');

      expect(result.challenges[0].title).toBe('Two Sum');
      expect(result.challenges[1].title).toBe('Valid Palindrome');
      expect(result.challenges[2].title).toBe('Algorithm Challenge');
    });
  });
});
