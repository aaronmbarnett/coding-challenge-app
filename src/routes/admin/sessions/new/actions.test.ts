import { describe, it, expect, beforeEach, vi } from 'vitest';
import { actions } from './+page.server';
import { fail, redirect } from '@sveltejs/kit';
import * as sessionsModule from '$lib/server/sessions';

// Semantic time constants for session duration tests
const ONE_HOUR_SECONDS = 60 * 60; // 3600
const TWO_HOURS_SECONDS = 2 * 60 * 60; // 7200

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

// Mock sessions module
vi.mock('$lib/server/sessions', () => ({
  createSession: vi.fn(),
  parseSessionFormData: vi.fn()
}));

const mockDb = {};

describe('/admin/sessions/new form actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('default action', () => {
    it('should create session with valid data', async () => {
      const mockSessionData = {
        candidateId: 'candidate-1',
        challengeIds: ['challenge-1', 'challenge-2'],
        totalDurationSec: TWO_HOURS_SECONDS
      };

      const mockFormData = new FormData();
      mockFormData.set('candidateId', 'candidate-1');
      mockFormData.set('challenge-1', 'on');
      mockFormData.set('challenge-2', 'on');

      vi.mocked(sessionsModule.parseSessionFormData).mockReturnValue(mockSessionData);
      vi.mocked(sessionsModule.createSession).mockResolvedValue({ 
        id: 'session-1', 
        candidateId: 'candidate-1',
        totalDurationSec: TWO_HOURS_SECONDS,
        status: 'pending' as const,
        startedAt: null,
        endsAt: null
      });

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { db: mockDb };

      await expect(
        actions.default({ request: mockRequest, locals } as any)
      ).rejects.toThrow('Redirect to /admin/sessions');

      expect(sessionsModule.parseSessionFormData).toHaveBeenCalledWith(mockFormData);
      expect(sessionsModule.createSession).toHaveBeenCalledWith(mockDb, mockSessionData);
      expect(redirect).toHaveBeenCalledWith(302, '/admin/sessions');
    });

    it('should return validation error for missing candidate', async () => {
      const mockFormData = new FormData();
      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      vi.mocked(sessionsModule.parseSessionFormData).mockImplementation(() => {
        throw new Error('Candidate is required');
      });

      const locals = { db: mockDb };

      const result = await actions.default({ request: mockRequest, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Candidate is required' }
      });
      expect(fail).toHaveBeenCalledWith(400, { message: 'Candidate is required' });
      expect(sessionsModule.createSession).not.toHaveBeenCalled();
    });

    it('should return validation error for missing challenges', async () => {
      const mockFormData = new FormData();
      mockFormData.set('candidateId', 'candidate-1');
      // No challenges selected

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      vi.mocked(sessionsModule.parseSessionFormData).mockImplementation(() => {
        throw new Error('At least one challenge must be selected');
      });

      const locals = { db: mockDb };

      const result = await actions.default({ request: mockRequest, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'At least one challenge must be selected' }
      });
      expect(fail).toHaveBeenCalledWith(400, { message: 'At least one challenge must be selected' });
    });

    it('should return database error for database failures', async () => {
      const mockSessionData = {
        candidateId: 'candidate-1',
        challengeIds: ['challenge-1'],
        totalDurationSec: ONE_HOUR_SECONDS
      };

      const mockFormData = new FormData();
      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      vi.mocked(sessionsModule.parseSessionFormData).mockReturnValue(mockSessionData);
      vi.mocked(sessionsModule.createSession).mockRejectedValue(new Error('Foreign key constraint failed'));

      const locals = { db: mockDb };

      const result = await actions.default({ request: mockRequest, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Foreign key constraint failed' }
      });
      expect(fail).toHaveBeenCalledWith(400, { message: 'Foreign key constraint failed' });
    });

    it('should handle console.error for non-Error exceptions and return generic error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockFormData = new FormData();
      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      vi.mocked(sessionsModule.parseSessionFormData).mockImplementation(() => {
        throw { code: 'UNKNOWN_ERROR' }; // Non-Error object
      });

      const locals = { db: mockDb };

      const result = await actions.default({ request: mockRequest, locals } as any);

      expect(result).toEqual({
        status: 500,
        data: { message: 'Failed to create session' }
      });
      expect(fail).toHaveBeenCalledWith(500, { message: 'Failed to create session' });
      expect(consoleSpy).toHaveBeenCalledWith('Database error:', { code: 'UNKNOWN_ERROR' });

      consoleSpy.mockRestore();
    });

    it('should handle form data parsing errors', async () => {
      const mockRequest = {
        formData: vi.fn().mockRejectedValue(new Error('Invalid multipart data'))
      };

      const locals = { db: mockDb };

      const result = await actions.default({ request: mockRequest, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Invalid multipart data' }
      });
      expect(sessionsModule.parseSessionFormData).not.toHaveBeenCalled();
    });
  });
});