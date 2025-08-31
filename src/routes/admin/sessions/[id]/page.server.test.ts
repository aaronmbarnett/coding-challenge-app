import { describe, it, expect, beforeEach, vi } from 'vitest';
import { load } from './+page.server';
import { error } from '@sveltejs/kit';
import { createMockLoadEvent } from '$lib/test-utils/sveltekit-mocks';

// Type for the expected return value
interface SessionDetailLoadResult {
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
  attempts: Array<{
    attempt: {
      id: string;
      sessionId: string;
      challengeId: string;
      status: string;
      startedAt: Date | null;
      submittedAt: Date | null;
    };
    challenge: {
      id: string;
      title: string;
      timeLimitSec: number;
    } | null;
  }>;
}

// Mock SvelteKit error function
vi.mock('@sveltejs/kit', async () => {
  const actual = await vi.importActual('@sveltejs/kit');
  return {
    ...actual,
    error: vi.fn((status: number, message: string) => {
      const err = new Error(message) as Error & { status: number };
      err.status = status;
      throw err;
    })
  };
});

// Create mock db for session detail loading
const createMockDbForSessionDetail = (mockSessionData: any, mockAttempts: any) => {
  return {
    select: vi
      .fn()
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(mockSessionData ? [mockSessionData] : [])
          })
        })
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockAttempts)
            })
          })
        })
      })
  };
};

describe('/admin/sessions/[id] +page.server.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('load function', () => {
    it('should load session with candidate and attempts', async () => {
      const mockSessionData = {
        session: {
          id: 'session-1',
          candidateId: 'candidate-1',
          status: 'active',
          totalDurationSec: 3600,
          startedAt: new Date('2024-01-01T10:00:00Z'),
          endsAt: new Date('2024-01-01T11:00:00Z')
        },
        candidate: {
          id: 'candidate-1',
          email: 'test@example.com'
        }
      };

      const mockAttempts = [
        {
          attempt: {
            id: 'attempt-1',
            sessionId: 'session-1',
            challengeId: 'challenge-1',
            status: 'locked',
            startedAt: null,
            submittedAt: null
          },
          challenge: {
            id: 'challenge-1',
            title: 'Array Sum',
            timeLimitSec: 1800
          }
        },
        {
          attempt: {
            id: 'attempt-2',
            sessionId: 'session-1',
            challengeId: 'challenge-2',
            status: 'in_progress',
            startedAt: new Date('2024-01-01T10:05:00Z'),
            submittedAt: null
          },
          challenge: {
            id: 'challenge-2',
            title: 'String Reverse',
            timeLimitSec: 900
          }
        }
      ];

      const mockDb = createMockDbForSessionDetail(mockSessionData, mockAttempts);
      const params = { id: 'session-1' };
      const locals = { db: mockDb };

      const event = createMockLoadEvent({ params, locals });
      const result = await load(event) as SessionDetailLoadResult;

      expect(result).toEqual({
        session: mockSessionData.session,
        candidate: mockSessionData.candidate,
        attempts: mockAttempts
      });

      // Verify database was called
      expect(mockDb.select).toHaveBeenCalledTimes(2);
    });

    it('should throw 404 error when session not found', async () => {
      const mockDb = createMockDbForSessionDetail(null, []);
      const params = { id: 'nonexistent-session' };
      const locals = { db: mockDb };

      const event = createMockLoadEvent({ params, locals });
      await expect(load(event)).rejects.toThrow();
      expect(error).toHaveBeenCalledWith(404, 'Session not found');
    });

    it('should handle session without candidate', async () => {
      const mockSessionData = {
        session: {
          id: 'session-1',
          candidateId: 'nonexistent-candidate',
          status: 'pending',
          totalDurationSec: 3600
        },
        candidate: null // No candidate found
      };

      const mockAttempts: any[] = [];

      const mockDb = createMockDbForSessionDetail(mockSessionData, mockAttempts);
      const params = { id: 'session-1' };
      const locals = { db: mockDb };

      const event = createMockLoadEvent({ params, locals });
      const result = await load(event) as SessionDetailLoadResult;

      expect(result.candidate).toBeNull();
      expect(result.session).toEqual(mockSessionData.session);
      expect(result.attempts).toEqual([]);
    });

    it('should handle session with no attempts', async () => {
      const mockSessionData = {
        session: {
          id: 'session-1',
          candidateId: 'candidate-1',
          status: 'pending',
          totalDurationSec: 3600
        },
        candidate: {
          id: 'candidate-1',
          email: 'test@example.com'
        }
      };

      const mockAttempts: any[] = [];

      const mockDb = createMockDbForSessionDetail(mockSessionData, mockAttempts);
      const params = { id: 'session-1' };
      const locals = { db: mockDb };

      const event = createMockLoadEvent({ params, locals });
      const result = await load(event) as SessionDetailLoadResult;

      expect(result.attempts).toEqual([]);
      expect(result.session).toEqual(mockSessionData.session);
      expect(result.candidate).toEqual(mockSessionData.candidate);
    });

    it('should handle attempts without challenges', async () => {
      const mockSessionData = {
        session: { id: 'session-1', candidateId: 'candidate-1' },
        candidate: { id: 'candidate-1', email: 'test@example.com' }
      };

      const mockAttempts = [
        {
          attempt: {
            id: 'attempt-1',
            sessionId: 'session-1',
            challengeId: 'deleted-challenge',
            status: 'locked'
          },
          challenge: null // Challenge was deleted
        }
      ];

      const mockDb = createMockDbForSessionDetail(mockSessionData, mockAttempts);
      const params = { id: 'session-1' };
      const locals = { db: mockDb };

      const event = createMockLoadEvent({ params, locals });
      const result = await load(event) as SessionDetailLoadResult;

      expect(result.attempts[0].challenge).toBeNull();
      expect(result.attempts[0].attempt).toEqual(mockAttempts[0].attempt);
    });
  });
});

