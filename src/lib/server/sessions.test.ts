import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createSession,
  startSession,
  stopSession,
  calculateSessionEndTime,
  isSessionExpired,
  parseSessionFormData
} from './sessions';
import * as table from './db/schema';

// Semantic constants for test data - makes tests self-documenting
const ONE_HOUR_SECONDS = 60 * 60; // 3600
const THIRTY_MINUTES_SECONDS = 30 * 60; // 1800
const TWO_HOURS_SECONDS = 2 * 60 * 60; // 7200

// Create a simplified contract-based database mock
const createMockDb = () => ({
  // Mock the database operations by their data contracts, not implementation
  createSession: vi.fn(),
  updateSession: vi.fn(),
  findSession: vi.fn(),
  createAttempts: vi.fn()
});

// Helper to mock actual drizzle operations
const mockDb = {
  insert: vi.fn(),
  update: vi.fn(),
  select: vi.fn()
};

describe('session functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    beforeEach(() => {
      // Simplified contract-based mock - focus on the data flow
      mockDb.insert.mockImplementation(() => ({
        values: vi.fn().mockImplementation((data) => {
          // Mock sessions table return
          if (data && 'candidateId' in data) {
            return {
              returning: () => Promise.resolve([{ id: 'session-1', candidateId: data.candidateId }])
            };
          }
          // Mock attempts table (array of attempts)
          return Promise.resolve();
        })
      }));
    });

    it('should create session with valid data', async () => {
      const data = {
        candidateId: 'candidate-1',
        totalDurationSec: ONE_HOUR_SECONDS,
        challengeIds: ['challenge-1', 'challenge-2']
      };

      const result = await createSession(mockDb as any, data);

      // Test the data contract: function should be called with correct table and data
      expect(mockDb.insert).toHaveBeenCalledWith(table.sessions);

      // Focus on the business logic result, not implementation details
      expect(result).toEqual({ id: 'session-1', candidateId: 'candidate-1' });
    });

    it('should create attempts for each challenge', async () => {
      const data = {
        candidateId: 'candidate-1',
        totalDurationSec: ONE_HOUR_SECONDS,
        challengeIds: ['challenge-1', 'challenge-2']
      };

      await createSession(mockDb as any, data);

      // Verify attempts table was used (contract-focused)
      expect(mockDb.insert).toHaveBeenCalledWith(table.attempts);
    });

    it('should validate required fields', async () => {
      const data = {
        candidateId: '',
        totalDurationSec: ONE_HOUR_SECONDS,
        challengeIds: ['challenge-1']
      };

      await expect(createSession(mockDb as any, data)).rejects.toThrow(
        'Candidate and duration are required'
      );
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should validate challenge selection', async () => {
      const data = {
        candidateId: 'candidate-1',
        totalDurationSec: ONE_HOUR_SECONDS,
        challengeIds: []
      };

      await expect(createSession(mockDb as any, data)).rejects.toThrow(
        'At least one challenge must be selected'
      );
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('startSession', () => {
    beforeEach(() => {
      // Mock data contract: what we get when we find a session
      mockDb.select.mockImplementation(() => ({
        from: () => ({
          where: () =>
            Promise.resolve([
              {
                id: 'session-1',
                status: 'pending',
                totalDurationSec: ONE_HOUR_SECONDS
              }
            ])
        })
      }));

      // Mock update operation contract
      mockDb.update.mockImplementation(() => ({
        set: () => ({
          where: () => Promise.resolve()
        })
      }));
    });

    it('should start a pending session', async () => {
      const result = await startSession(mockDb as any, 'session-1');

      expect(mockDb.update).toHaveBeenCalledWith(table.sessions);
      expect(result.session).toEqual({
        id: 'session-1',
        status: 'pending',
        totalDurationSec: ONE_HOUR_SECONDS
      });
      expect(result.startedAt).toBeInstanceOf(Date);
      expect(result.endsAt).toBeInstanceOf(Date);
    });

    it('should throw error if session not found', async () => {
      // Override the mock for this test case - focus on behavior
      mockDb.select.mockImplementation(() => ({
        from: () => ({
          where: () => Promise.resolve([])
        })
      }));

      await expect(startSession(mockDb as any, 'nonexistent')).rejects.toThrow('Session not found');
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should throw error if session cannot be started', async () => {
      // Test business logic: active sessions cannot be started again
      mockDb.select.mockImplementation(() => ({
        from: () => ({
          where: () =>
            Promise.resolve([
              {
                id: 'session-1',
                status: 'active',
                totalDurationSec: ONE_HOUR_SECONDS
              }
            ])
        })
      }));

      await expect(startSession(mockDb as any, 'session-1')).rejects.toThrow(
        'Session cannot be started'
      );
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });

  describe('stopSession', () => {
    beforeEach(() => {
      // Contract-based mock: what data comes back when finding active session
      mockDb.select.mockImplementation(() => ({
        from: () => ({
          where: () =>
            Promise.resolve([
              {
                id: 'session-1',
                status: 'active'
              }
            ])
        })
      }));

      // Mock update contract
      mockDb.update.mockImplementation(() => ({
        set: () => ({
          where: () => Promise.resolve()
        })
      }));
    });

    it('should stop an active session', async () => {
      const result = await stopSession(mockDb as any, 'session-1');

      expect(mockDb.update).toHaveBeenCalledWith(table.sessions);
      expect(result.session).toEqual({
        id: 'session-1',
        status: 'active'
      });
      expect(result.endedAt).toBeInstanceOf(Date);
    });

    it('should throw error if session not found', async () => {
      // Focus on behavior: what happens when session doesn't exist
      mockDb.select.mockImplementation(() => ({
        from: () => ({
          where: () => Promise.resolve([])
        })
      }));

      await expect(stopSession(mockDb as any, 'nonexistent')).rejects.toThrow('Session not found');
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should throw error if session cannot be stopped', async () => {
      // Test business rule: only active sessions can be stopped
      mockDb.select.mockImplementation(() => ({
        from: () => ({
          where: () =>
            Promise.resolve([
              {
                id: 'session-1',
                status: 'pending'
              }
            ])
        })
      }));

      await expect(stopSession(mockDb as any, 'session-1')).rejects.toThrow(
        'Session cannot be stopped'
      );
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });

  describe('utility functions', () => {
    describe('calculateSessionEndTime', () => {
      it('should calculate correct end time', () => {
        const startTime = new Date('2024-01-01T12:00:00Z');
        const durationSec = ONE_HOUR_SECONDS;

        const endTime = calculateSessionEndTime(startTime, durationSec);

        expect(endTime).toEqual(new Date('2024-01-01T13:00:00Z'));
      });
    });

    describe('isSessionExpired', () => {
      it('should return false if endsAt is null', () => {
        const session = { endsAt: null };

        expect(isSessionExpired(session)).toBe(false);
      });

      it('should return true if session has expired', () => {
        const session = { endsAt: new Date('2020-01-01T12:00:00Z') };

        expect(isSessionExpired(session)).toBe(true);
      });

      it('should return false if session has not expired', () => {
        const futureDate = new Date(Date.now() + ONE_HOUR_SECONDS * 1000); // 1 hour from now
        const session = { endsAt: futureDate };

        expect(isSessionExpired(session)).toBe(false);
      });
    });

    describe('parseSessionFormData', () => {
      it('should parse form data correctly', () => {
        const formData = new FormData();
        formData.set('candidateId', 'candidate-1');
        formData.set('totalDurationSec', ONE_HOUR_SECONDS.toString());
        formData.append('challengeIds', 'challenge-1');
        formData.append('challengeIds', 'challenge-2');

        const result = parseSessionFormData(formData);

        expect(result).toEqual({
          candidateId: 'candidate-1',
          totalDurationSec: ONE_HOUR_SECONDS,
          challengeIds: ['challenge-1', 'challenge-2']
        });
      });
    });
  });
});
