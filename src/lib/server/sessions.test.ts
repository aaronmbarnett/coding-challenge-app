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
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'session-1', candidateId: 'candidate-1' }])
        })
      });
    });

    it('should create session with valid data', async () => {
      const data = {
        candidateId: 'candidate-1',
        totalDurationSec: 3600,
        challengeIds: ['challenge-1', 'challenge-2']
      };

      const result = await createSession(mockDb as any, data);

      expect(mockDb.insert).toHaveBeenCalledWith(table.sessions);
      expect(mockDb.insert().values).toHaveBeenCalledWith({
        candidateId: 'candidate-1',
        totalDurationSec: 3600,
        status: 'pending'
      });
      expect(result).toEqual({ id: 'session-1', candidateId: 'candidate-1' });
    });

    it('should create attempts for each challenge', async () => {
      const data = {
        candidateId: 'candidate-1',
        totalDurationSec: 3600,
        challengeIds: ['challenge-1', 'challenge-2']
      };

      await createSession(mockDb as any, data);

      expect(mockDb.insert).toHaveBeenNthCalledWith(2, table.attempts);
      expect(mockDb.insert().values).toHaveBeenNthCalledWith(2, [
        { sessionId: 'session-1', challengeId: 'challenge-1', status: 'locked' },
        { sessionId: 'session-1', challengeId: 'challenge-2', status: 'locked' }
      ]);
    });

    it('should validate required fields', async () => {
      const data = { candidateId: '', totalDurationSec: 3600, challengeIds: ['challenge-1'] };

      await expect(createSession(mockDb as any, data)).rejects.toThrow(
        'Candidate and duration are required'
      );
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should validate challenge selection', async () => {
      const data = { candidateId: 'candidate-1', totalDurationSec: 3600, challengeIds: [] };

      await expect(createSession(mockDb as any, data)).rejects.toThrow(
        'At least one challenge must be selected'
      );
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('startSession', () => {
    beforeEach(() => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{
            id: 'session-1',
            status: 'pending',
            totalDurationSec: 3600
          }])
        })
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn()
        })
      });
    });

    it('should start a pending session', async () => {
      const result = await startSession(mockDb as any, 'session-1');

      expect(mockDb.update).toHaveBeenCalledWith(table.sessions);
      expect(result.session).toEqual({
        id: 'session-1',
        status: 'pending',
        totalDurationSec: 3600
      });
      expect(result.startedAt).toBeInstanceOf(Date);
      expect(result.endsAt).toBeInstanceOf(Date);
    });

    it('should throw error if session not found', async () => {
      mockDb.select().from().where.mockResolvedValue([]);

      await expect(startSession(mockDb as any, 'nonexistent')).rejects.toThrow(
        'Session not found'
      );
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should throw error if session cannot be started', async () => {
      mockDb.select().from().where.mockResolvedValue([{
        id: 'session-1',
        status: 'active',
        totalDurationSec: 3600
      }]);

      await expect(startSession(mockDb as any, 'session-1')).rejects.toThrow(
        'Session cannot be started'
      );
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });

  describe('stopSession', () => {
    beforeEach(() => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{
            id: 'session-1',
            status: 'active'
          }])
        })
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn()
        })
      });
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
      mockDb.select().from().where.mockResolvedValue([]);

      await expect(stopSession(mockDb as any, 'nonexistent')).rejects.toThrow(
        'Session not found'
      );
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should throw error if session cannot be stopped', async () => {
      mockDb.select().from().where.mockResolvedValue([{
        id: 'session-1',
        status: 'pending'
      }]);

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
        const durationSec = 3600; // 1 hour

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
        const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
        const session = { endsAt: futureDate };

        expect(isSessionExpired(session)).toBe(false);
      });
    });

    describe('parseSessionFormData', () => {
      it('should parse form data correctly', () => {
        const formData = new FormData();
        formData.set('candidateId', 'candidate-1');
        formData.set('totalDurationSec', '3600');
        formData.append('challengeIds', 'challenge-1');
        formData.append('challengeIds', 'challenge-2');

        const result = parseSessionFormData(formData);

        expect(result).toEqual({
          candidateId: 'candidate-1',
          totalDurationSec: 3600,
          challengeIds: ['challenge-1', 'challenge-2']
        });
      });
    });
  });
});