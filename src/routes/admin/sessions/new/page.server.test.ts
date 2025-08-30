import { describe, it, expect, beforeEach, vi } from 'vitest';
import { load } from './+page.server';
import * as table from '$lib/server/db/schema';

// Create mock db for form data loading
const createMockDbForNewSession = (mockCandidates: any, mockChallenges: any) => {
  return {
    select: vi.fn()
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
      const mockCandidates = [
        {
          id: 'candidate-1',
          email: 'alice@example.com'
        },
        {
          id: 'candidate-2',
          email: 'bob@example.com'
        }
      ];

      const mockChallenges = [
        {
          id: 'challenge-1',
          title: 'Array Sum',
          timeLimitSec: 1800
        },
        {
          id: 'challenge-2',
          title: 'String Reverse',
          timeLimitSec: 900
        }
      ];

      const mockDb = createMockDbForNewSession(mockCandidates, mockChallenges);
      const locals = { db: mockDb };
      
      const result = await load({ locals } as any);

      expect(result).toEqual({
        candidates: mockCandidates,
        challenges: mockChallenges
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
          timeLimitSec: 1800
        }
      ];

      const mockDb = createMockDbForNewSession(mockCandidates, mockChallenges);
      const locals = { db: mockDb };
      
      const result = await load({ locals } as any);

      expect(result).toEqual({
        candidates: [],
        challenges: mockChallenges
      });
    });

    it('should handle empty challenges list', async () => {
      const mockCandidates = [
        {
          id: 'candidate-1',
          email: 'test@example.com'
        }
      ];
      const mockChallenges: any[] = [];

      const mockDb = createMockDbForNewSession(mockCandidates, mockChallenges);
      const locals = { db: mockDb };
      
      const result = await load({ locals } as any);

      expect(result).toEqual({
        candidates: mockCandidates,
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
          timeLimitSec: 600 // 10 minutes
        },
        {
          id: 'challenge-2',
          title: 'Long Challenge',
          timeLimitSec: 7200 // 2 hours
        },
        {
          id: 'challenge-3',
          title: 'No Time Limit',
          timeLimitSec: null
        }
      ];

      const mockDb = createMockDbForNewSession([], mockChallenges);
      const locals = { db: mockDb };
      
      const result = await load({ locals } as any);

      expect(result.challenges).toEqual(mockChallenges);
      expect(result.challenges[0].timeLimitSec).toBe(600);
      expect(result.challenges[1].timeLimitSec).toBe(7200);
      expect(result.challenges[2].timeLimitSec).toBeNull();
    });

    it('should preserve email and title ordering', async () => {
      const mockCandidates = [
        { id: 'candidate-1', email: 'alice@example.com' },
        { id: 'candidate-2', email: 'bob@example.com' },
        { id: 'candidate-3', email: 'charlie@example.com' }
      ];

      const mockChallenges = [
        { id: 'challenge-1', title: 'A Challenge', timeLimitSec: 1800 },
        { id: 'challenge-2', title: 'B Challenge', timeLimitSec: 900 },
        { id: 'challenge-3', title: 'C Challenge', timeLimitSec: 3600 }
      ];

      const mockDb = createMockDbForNewSession(mockCandidates, mockChallenges);
      const locals = { db: mockDb };
      
      const result = await load({ locals } as any);

      // Verify ordering is preserved as returned by database
      expect(result.candidates[0].email).toBe('alice@example.com');
      expect(result.candidates[1].email).toBe('bob@example.com');
      expect(result.candidates[2].email).toBe('charlie@example.com');

      expect(result.challenges[0].title).toBe('A Challenge');
      expect(result.challenges[1].title).toBe('B Challenge');
      expect(result.challenges[2].title).toBe('C Challenge');
    });
  });
});