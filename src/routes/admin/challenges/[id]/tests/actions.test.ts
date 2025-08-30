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

// Mock database operations
const mockDb = {
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockResolvedValue({})
  }),
  delete: vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue({})
  })
};

describe('/admin/challenges/[id]/tests form actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create action', () => {
    it('should create IO test case with valid data', async () => {
      const mockFormData = new FormData();
      mockFormData.set('kind', 'io');
      mockFormData.set('input', '[1, 2, 3]');
      mockFormData.set('expectedOutput', '6');
      mockFormData.set('weight', '2');
      mockFormData.set('hidden', 'on');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      await expect(
        actions.create({ request: mockRequest, params, locals } as any)
      ).rejects.toThrow('Redirect to /admin/challenges/challenge-1/tests');

      expect(mockDb.insert).toHaveBeenCalledWith(table.challengeTests);
      expect(mockDb.insert().values).toHaveBeenCalledWith({
        challengeId: 'challenge-1',
        kind: 'io',
        input: '[1, 2, 3]',
        expectedOutput: '6',
        harnessCode: null,
        weight: 2,
        hidden: 1
      });
      expect(redirect).toHaveBeenCalledWith(302, '/admin/challenges/challenge-1/tests');
    });

    it('should create harness test case with valid data', async () => {
      const mockFormData = new FormData();
      mockFormData.set('kind', 'harness');
      mockFormData.set('harnessCode', 'assert(sum([1,2,3]) === 6)');
      mockFormData.set('weight', '3');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      await expect(
        actions.create({ request: mockRequest, params, locals } as any)
      ).rejects.toThrow('Redirect to /admin/challenges/challenge-1/tests');

      expect(mockDb.insert().values).toHaveBeenCalledWith({
        challengeId: 'challenge-1',
        kind: 'harness',
        input: null,
        expectedOutput: null,
        harnessCode: 'assert(sum([1,2,3]) === 6)',
        weight: 3,
        hidden: 0
      });
    });

    it('should use default weight of 1 when not provided', async () => {
      const mockFormData = new FormData();
      mockFormData.set('kind', 'io');
      mockFormData.set('input', 'test');
      mockFormData.set('expectedOutput', 'result');
      // No weight provided

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      await expect(
        actions.create({ request: mockRequest, params, locals } as any)
      ).rejects.toThrow('Redirect to /admin/challenges/challenge-1/tests');

      expect(mockDb.insert().values).toHaveBeenCalledWith(
        expect.objectContaining({
          weight: 1,
          hidden: 0
        })
      );
    });

    it('should return validation error for missing kind', async () => {
      const mockFormData = new FormData();
      mockFormData.set('input', 'test');
      mockFormData.set('expectedOutput', 'result');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.create({ request: mockRequest, params, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: {
          message: 'Test kind and input/output are required for I/O tests',
          data: {
            input: 'test',
            expectedOutput: 'result'
          }
        }
      });
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should return validation error for IO test missing input', async () => {
      const mockFormData = new FormData();
      mockFormData.set('kind', 'io');
      mockFormData.set('expectedOutput', 'result');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.create({ request: mockRequest, params, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: {
          message: 'Test kind and input/output are required for I/O tests',
          data: expect.objectContaining({
            kind: 'io',
            expectedOutput: 'result'
          })
        }
      });
    });

    it('should return validation error for IO test missing expectedOutput', async () => {
      const mockFormData = new FormData();
      mockFormData.set('kind', 'io');
      mockFormData.set('input', 'test');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.create({ request: mockRequest, params, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: {
          message: 'Test kind and input/output are required for I/O tests',
          data: expect.objectContaining({
            kind: 'io',
            input: 'test'
          })
        }
      });
    });

    it('should return validation error for harness test missing harnessCode', async () => {
      const mockFormData = new FormData();
      mockFormData.set('kind', 'harness');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.create({ request: mockRequest, params, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: {
          message: 'Harness code is required for harness tests',
          data: expect.objectContaining({
            kind: 'harness'
          })
        }
      });
    });

    it('should return database error for insertion failures', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockFormData = new FormData();
      mockFormData.set('kind', 'io');
      mockFormData.set('input', 'test');
      mockFormData.set('expectedOutput', 'result');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      // Mock database error
      mockDb.insert().values.mockRejectedValue(new Error('Foreign key constraint failed'));

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.create({ request: mockRequest, params, locals } as any);

      expect(result).toEqual({
        status: 500,
        data: { message: 'Failed to create test case' }
      });
      expect(consoleSpy).toHaveBeenCalledWith('Database error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('delete action', () => {
    it('should delete test case with valid IDs', async () => {
      const mockFormData = new FormData();
      mockFormData.set('testId', 'test-1');
      mockFormData.set('challengeId', 'challenge-1');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { db: mockDb };

      await expect(
        actions.delete({ request: mockRequest, locals } as any)
      ).rejects.toThrow('Redirect to /admin/challenges/challenge-1/tests');

      expect(mockDb.delete).toHaveBeenCalledWith(table.challengeTests);
      expect(mockDb.delete().where).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith(302, '/admin/challenges/challenge-1/tests');
    });

    it('should return validation error for missing testId', async () => {
      const mockFormData = new FormData();
      mockFormData.set('challengeId', 'challenge-1');
      // Missing testId

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { db: mockDb };

      const result = await actions.delete({ request: mockRequest, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Test ID and Challenge ID required' }
      });
      expect(mockDb.delete).not.toHaveBeenCalled();
    });

    it('should return validation error for missing challengeId', async () => {
      const mockFormData = new FormData();
      mockFormData.set('testId', 'test-1');
      // Missing challengeId

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { db: mockDb };

      const result = await actions.delete({ request: mockRequest, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Test ID and Challenge ID required' }
      });
    });

    it('should return error for delete failures', async () => {
      const mockFormData = new FormData();
      mockFormData.set('testId', 'test-1');
      mockFormData.set('challengeId', 'challenge-1');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      // Mock database error
      mockDb.delete().where.mockRejectedValue(new Error('Test case not found'));

      const locals = { db: mockDb };

      const result = await actions.delete({ request: mockRequest, locals } as any);

      expect(result).toEqual({
        status: 500,
        data: { message: 'Failed to delete test case' }
      });
    });
  });
});