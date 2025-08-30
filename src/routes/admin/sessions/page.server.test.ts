import { describe, it, expect, beforeEach, vi } from 'vitest';
import { load } from './+page.server';
import * as table from '$lib/server/db/schema';

// Create mock db functions for different query patterns
const createMockDbForSessions = (mockSessions: any, challengeCount: number, candidateCount: number) => {
  return {
    select: vi.fn()
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockSessions)
          })
        })
      })
      .mockReturnValueOnce({
        from: vi.fn().mockResolvedValue([{ count: challengeCount }])
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: candidateCount }])
        })
      })
  };
};

describe('/admin/sessions +page.server.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('load function', () => {
    it('should load sessions with candidate information', async () => {
      const mockSessions = [
        {
          session: {
            id: 'session-1',
            candidateId: 'candidate-1',
            status: 'pending',
            totalDurationSec: 3600,
            startedAt: new Date('2024-01-01T10:00:00Z'),
            endsAt: null
          },
          candidate: {
            id: 'candidate-1',
            email: 'test@example.com'
          }
        }
      ];

      const mockDb = createMockDbForSessions(mockSessions, 5, 3);
      const locals = { db: mockDb };

      const result = await load({ locals } as any);

      expect(result).toEqual({
        sessions: mockSessions,
        stats: {
          totalChallenges: 5,
          totalCandidates: 3
        }
      });

      // Verify database was called
      expect(mockDb.select).toHaveBeenCalledTimes(3);
    });

    it('should handle empty sessions list', async () => {
      const mockSessions: any[] = [];

      const mockDb = createMockDbForSessions(mockSessions, 0, 0);
      const locals = { db: mockDb };

      const result = await load({ locals } as any);

      expect(result).toEqual({
        sessions: [],
        stats: {
          totalChallenges: 0,
          totalCandidates: 0
        }
      });
    });

    it('should handle sessions without candidates', async () => {
      const mockSessions = [
        {
          session: {
            id: 'session-1',
            candidateId: 'nonexistent',
            status: 'pending',
            totalDurationSec: 3600,
            startedAt: new Date(),
            endsAt: null
          },
          candidate: null
        }
      ];

      const mockDb = createMockDbForSessions(mockSessions, 1, 2);
      const locals = { db: mockDb };

      const result = await load({ locals } as any);

      expect(result.sessions).toEqual(mockSessions);
      expect(result.sessions[0].candidate).toBeNull();
    });

    it('should calculate stats correctly with various counts', async () => {
      const mockDb = createMockDbForSessions([], 42, 17);
      const locals = { db: mockDb };

      const result = await load({ locals } as any);

      expect(result.stats).toEqual({
        totalChallenges: 42,
        totalCandidates: 17
      });
    });
  });
});

