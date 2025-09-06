import { describe, it, expect, beforeEach, vi } from 'vitest';
import { load } from './+page.server';
import * as table from '$lib/server/db/schema';
import { createMockLoadEvent } from '$lib/test-utils/sveltekit-mocks';

// Semantic time constants for sessions page tests
const ONE_HOUR_SECONDS = 60 * 60; // 3600

// Type for the expected return value
interface SessionsLoadResult {
  sessions: Array<{
    session: {
      id: string;
      candidateId: string;
      status: string;
      totalDurationSec: number;
      startedAt: Date | null;
      endsAt: Date | null;
    };
    candidate: {
      id: string;
      email: string;
    } | null;
  }>;
  stats: {
    totalChallenges: number;
    totalCandidates: number;
  };
}

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
            totalDurationSec: ONE_HOUR_SECONDS,
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

      const event = createMockLoadEvent({ locals });
      const result = await load(event) as SessionsLoadResult;

      expect(result).toEqual({
        sessions: mockSessions,
        stats: {
          totalChallenges: 5,
          totalCandidates: 3
        }
      });

      // Verify all necessary database queries were executed
      expect(mockDb.select).toHaveBeenCalledTimes(3);
    });

    it('should handle empty sessions list', async () => {
      const mockSessions: any[] = [];

      const mockDb = createMockDbForSessions(mockSessions, 0, 0);
      const locals = { db: mockDb };

      const event = createMockLoadEvent({ locals });
      const result = await load(event) as SessionsLoadResult;

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
            totalDurationSec: ONE_HOUR_SECONDS,
            startedAt: new Date(),
            endsAt: null
          },
          candidate: null
        }
      ];

      const mockDb = createMockDbForSessions(mockSessions, 1, 2);
      const locals = { db: mockDb };

      const event = createMockLoadEvent({ locals });
      const result = await load(event) as SessionsLoadResult;

      expect(result.sessions).toEqual(mockSessions);
      expect(result.sessions[0].candidate).toBeNull();
    });

    it('should calculate stats correctly with various counts', async () => {
      const mockDb = createMockDbForSessions([], 42, 17);
      const locals = { db: mockDb };

      const event = createMockLoadEvent({ locals });
      const result = await load(event) as SessionsLoadResult;

      expect(result.stats).toEqual({
        totalChallenges: 42,
        totalCandidates: 17
      });
    });
  });
});

