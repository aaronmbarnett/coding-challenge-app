import { describe, it, expect, beforeEach, vi } from 'vitest';
import { actions } from './+page.server';
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

// Contract-based database mock - focus on what operations succeed/fail
const createMockDb = () => ({
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

describe('/admin/challenges/[id] deletion actions', () => {
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createMockDb();
  });

  describe('delete action', () => {
    const challengeId = 'challenge-123';

    it('should successfully delete challenge when no constraints exist', async () => {
      // Mock challenge exists
      mockDb.select().from().where.mockResolvedValueOnce([
        { id: challengeId, title: 'Test Challenge' }
      ]);
      // Mock no attempts exist
      mockDb.select().from().where.mockResolvedValueOnce([]);
      // Mock no submissions exist
      mockDb.select().from().innerJoin().where.mockResolvedValueOnce([]);

      const params = { id: challengeId };
      const locals = { db: mockDb };

      await expect(actions.delete({ params, locals } as any)).rejects.toThrow(
        'Redirect to /admin/challenges'
      );

      // Should delete test cases first, then challenge
      expect(mockDb.delete).toHaveBeenCalledWith(table.challengeTests);
      expect(mockDb.delete).toHaveBeenCalledWith(table.challenges);
      expect(redirect).toHaveBeenCalledWith(303, '/admin/challenges');
    });

    it('should return error when challenge has existing attempts', async () => {
      // Mock challenge exists
      mockDb.select().from().where.mockResolvedValueOnce([
        { id: challengeId, title: 'Test Challenge' }
      ]);
      // Mock attempts exist
      mockDb.select().from().where.mockResolvedValueOnce([
        { id: 'attempt-1', challengeId, sessionId: 'session-1' }
      ]);

      const params = { id: challengeId };
      const locals = { db: mockDb };

      const result = await actions.delete({ params, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Cannot delete challenge with existing attempts/sessions. Data preservation required.' }
      });
      expect(mockDb.delete).not.toHaveBeenCalled();
      expect(fail).toHaveBeenCalledWith(400, {
        message: 'Cannot delete challenge with existing attempts/sessions. Data preservation required.'
      });
    });

    it('should return error when challenge has existing submissions', async () => {
      // Mock challenge exists
      mockDb.select().from().where.mockResolvedValueOnce([
        { id: challengeId, title: 'Test Challenge' }
      ]);
      // Mock no attempts
      mockDb.select().from().where.mockResolvedValueOnce([]);
      // Mock submissions exist
      mockDb.select().from().innerJoin().where.mockResolvedValueOnce([
        { id: 'submission-1', code: 'console.log("test")' }
      ]);

      const params = { id: challengeId };
      const locals = { db: mockDb };

      const result = await actions.delete({ params, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Cannot delete challenge with existing submissions. Data preservation required.' }
      });
      expect(mockDb.delete).not.toHaveBeenCalled();
    });

    it('should return error when challenge does not exist', async () => {
      // Mock challenge not found
      mockDb.select().from().where.mockResolvedValueOnce([]);

      const params = { id: 'nonexistent-challenge' };
      const locals = { db: mockDb };

      const result = await actions.delete({ params, locals } as any);

      expect(result).toEqual({
        status: 404,
        data: { message: 'Challenge not found' }
      });
      expect(mockDb.delete).not.toHaveBeenCalled();
    });

    it('should return error when challengeId is missing', async () => {
      const params = { id: undefined };
      const locals = { db: mockDb };

      const result = await actions.delete({ params, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Challenge ID is required' }
      });
      expect(mockDb.select).not.toHaveBeenCalled();
    });

    it('should handle database errors during deletion', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock challenge exists and passes all constraint checks
      mockDb.select().from().where
        .mockResolvedValueOnce([{ id: challengeId, title: 'Test Challenge' }])
        .mockResolvedValueOnce([]) // No attempts
        .mockResolvedValueOnce([]); // No submissions

      // Mock database error on test case deletion
      mockDb.delete.mockImplementationOnce(() => ({
        where: vi.fn().mockRejectedValue(new Error('Database connection failed'))
      }));

      const params = { id: challengeId };
      const locals = { db: mockDb };

      const result = await actions.delete({ params, locals } as any);

      expect(result).toEqual({
        status: 500,
        data: { message: 'Failed to delete challenge' }
      });
      expect(consoleSpy).toHaveBeenCalledWith('Error deleting challenge:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});