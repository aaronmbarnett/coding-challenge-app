import { describe, it, expect, beforeEach, vi } from 'vitest';
import { actions } from './+page.server';
import { fail, redirect } from '@sveltejs/kit';
import * as challengesModule from '$lib/server/challenges';
import { createMockActionEvent, createMockRequest } from '$lib/test-utils/sveltekit-mocks';

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

// Mock challenges module
vi.mock('$lib/server/challenges', () => ({
  createChallenge: vi.fn(),
  parseFormDataToChallenge: vi.fn()
}));

const mockDb = {};

describe('/admin/challenges/new form actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('default action', () => {
    it('should create challenge with valid data', async () => {
      const mockChallengeData = {
        title: 'Array Sum',
        description: '# Calculate sum of array',
        languages: 'javascript,python',
        starterCode: 'function sum(arr) {}',
        timeLimitSec: 1800
      };

      const mockFormData = new FormData();
      mockFormData.set('title', 'Array Sum');

      vi.mocked(challengesModule.parseFormDataToChallenge).mockReturnValue(mockChallengeData);
      vi.mocked(challengesModule.createChallenge).mockResolvedValue({
        id: 'challenge-1',
        title: 'Array Sum',
        descriptionMd: '# Calculate sum of array',
        languagesCsv: 'javascript,python',
        starterCode: 'function sum(arr) {}',
        timeLimitSec: 1800,
        createdAt: new Date()
      });

      const mockRequest = createMockRequest(mockFormData);

      const locals = { db: mockDb };

      const event = createMockActionEvent({ request: mockRequest, locals });
      await expect(actions.default(event)).rejects.toThrow(
        'Redirect to /admin/challenges'
      );

      expect(challengesModule.parseFormDataToChallenge).toHaveBeenCalledWith(mockFormData);
      expect(challengesModule.createChallenge).toHaveBeenCalledWith(mockDb, mockChallengeData);
      expect(redirect).toHaveBeenCalledWith(302, '/admin/challenges');
    });

    it('should return validation error for invalid data', async () => {
      const mockFormData = new FormData();
      const mockRequest = createMockRequest(mockFormData);

      vi.mocked(challengesModule.parseFormDataToChallenge).mockImplementation(() => {
        throw new Error('Title, description, and languages are required');
      });

      const locals = { db: mockDb };

      const event = createMockActionEvent({ request: mockRequest, locals });
      const result = await actions.default(event);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Title, description, and languages are required' }
      });
      expect(fail).toHaveBeenCalledWith(400, {
        message: 'Title, description, and languages are required'
      });
      expect(challengesModule.createChallenge).not.toHaveBeenCalled();
    });

    it('should return database error for database failures', async () => {
      const mockChallengeData = {
        title: 'Test Challenge',
        description: '# Test',
        languages: 'javascript'
      };

      const mockFormData = new FormData();
      const mockRequest = createMockRequest(mockFormData);

      vi.mocked(challengesModule.parseFormDataToChallenge).mockReturnValue(mockChallengeData);
      vi.mocked(challengesModule.createChallenge).mockRejectedValue(
        new Error('Database connection failed')
      );

      const locals = { db: mockDb };

      const event = createMockActionEvent({ request: mockRequest, locals });
      const result = await actions.default(event);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Database connection failed' }
      });
      expect(fail).toHaveBeenCalledWith(400, { message: 'Database connection failed' });
    });

    it('should return generic error for unknown errors', async () => {
      const mockFormData = new FormData();
      const mockRequest = createMockRequest(mockFormData);

      vi.mocked(challengesModule.parseFormDataToChallenge).mockImplementation(() => {
        throw 'Unknown error'; // Non-Error object
      });

      const locals = { db: mockDb };

      const event = createMockActionEvent({ request: mockRequest, locals });
      const result = await actions.default(event);

      expect(result).toEqual({
        status: 500,
        data: { message: 'Failed to create challenge' }
      });
      expect(fail).toHaveBeenCalledWith(500, { message: 'Failed to create challenge' });
    });
  });
});

