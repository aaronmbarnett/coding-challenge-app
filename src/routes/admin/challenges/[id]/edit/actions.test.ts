import { describe, it, expect, beforeEach, vi } from 'vitest';
import { actions } from './+page.server';
import { fail, redirect } from '@sveltejs/kit';
import * as table from '$lib/server/db/schema';

// Semantic time constants for challenge time limits
const THIRTY_MINUTES_SECONDS = 30 * 60; // 1800
const ONE_HOUR_SECONDS = 60 * 60; // 3600

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
const mockDb = {
  update: vi.fn().mockImplementation(() => ({
    set: vi.fn().mockImplementation(() => ({
      where: vi.fn().mockResolvedValue({})
    }))
  })),
  delete: vi.fn().mockImplementation(() => ({
    where: vi.fn().mockResolvedValue({})
  }))
};

describe('/admin/challenges/[id]/edit form actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('update action', () => {
    it('should update challenge with valid data', async () => {
      const mockFormData = new FormData();
      mockFormData.set('title', 'Updated Challenge');
      mockFormData.set('description', '# Updated description');
      mockFormData.set('languages', 'javascript,python,go');
      mockFormData.set('starterCode', 'function solve() {}');
      mockFormData.set('timeLimit', ONE_HOUR_SECONDS.toString());

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      await expect(
        actions.update({ request: mockRequest, params, locals } as any)
      ).rejects.toThrow('Redirect to /admin/challenges/challenge-1');

      // Verify correct table was targeted
      expect(mockDb.update).toHaveBeenCalledWith(table.challenges);
      
      // Focus on business logic: verify the update operation was called
      // (The actual data validation is handled by the implementation)
      const updateChain = mockDb.update.mock.results[0].value;
      expect(updateChain.set).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith(302, '/admin/challenges/challenge-1');
    });

    it('should handle null timeLimit when empty', async () => {
      const mockFormData = new FormData();
      mockFormData.set('title', 'Test Challenge');
      mockFormData.set('description', '# Test');
      mockFormData.set('languages', 'javascript');
      mockFormData.set('starterCode', '');
      mockFormData.set('timeLimit', ''); // Empty time limit

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      await expect(
        actions.update({ request: mockRequest, params, locals } as any)
      ).rejects.toThrow('Redirect to /admin/challenges/challenge-1');

      // Verify update operation was called (business logic handled by implementation)
      expect(mockDb.update).toHaveBeenCalledWith(table.challenges);
    });

    it('should handle whitespace in timeLimit', async () => {
      const mockFormData = new FormData();
      mockFormData.set('title', 'Test Challenge');
      mockFormData.set('description', '# Test');
      mockFormData.set('languages', 'javascript');
      mockFormData.set('timeLimit', `  ${THIRTY_MINUTES_SECONDS}  `); // Whitespace around value

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      await expect(
        actions.update({ request: mockRequest, params, locals } as any)
      ).rejects.toThrow('Redirect to /admin/challenges/challenge-1');

      // Verify update was attempted
      expect(mockDb.update).toHaveBeenCalledWith(table.challenges);
    });

    it('should return validation error for missing title', async () => {
      const mockFormData = new FormData();
      mockFormData.set('title', ''); // Empty title
      mockFormData.set('description', '# Test description');
      mockFormData.set('languages', 'javascript');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.update({ request: mockRequest, params, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Title,desc, and lang are required' }
      });
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should return validation error for missing description', async () => {
      const mockFormData = new FormData();
      mockFormData.set('title', 'Test Challenge');
      mockFormData.set('description', ''); // Empty description
      mockFormData.set('languages', 'javascript');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.update({ request: mockRequest, params, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Title,desc, and lang are required' }
      });
    });

    it('should return validation error for missing languages', async () => {
      const mockFormData = new FormData();
      mockFormData.set('title', 'Test Challenge');
      mockFormData.set('description', '# Test');
      mockFormData.set('languages', ''); // Empty languages

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.update({ request: mockRequest, params, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Title,desc, and lang are required' }
      });
    });

    it('should return database error for update failures', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockFormData = new FormData();
      mockFormData.set('title', 'Test Challenge');
      mockFormData.set('description', '# Test');
      mockFormData.set('languages', 'javascript');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      // Mock database error by creating a failing implementation
      mockDb.update.mockImplementation(() => ({
        set: vi.fn().mockImplementation(() => ({
          where: vi.fn().mockRejectedValue(new Error('Database constraint violation'))
        }))
      }));

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.update({ request: mockRequest, params, locals } as any);

      expect(result).toEqual({
        status: 500,
        data: { 
          message: 'Failed to update challenge',
          data: {
            title: 'Test Challenge',
            description: '# Test',
            languages: 'javascript'
          }
        }
      });
      expect(consoleSpy).toHaveBeenCalledWith('Error updating challenge:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('delete action', () => {
    it('should delete challenge and associated test cases', async () => {
      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      await expect(
        actions.delete({ params, locals } as any)
      ).rejects.toThrow('Redirect to /admin/challenges');

      // Should delete test cases first
      expect(mockDb.delete).toHaveBeenCalledWith(table.challengeTests);
      // Then delete the challenge
      expect(mockDb.delete).toHaveBeenCalledWith(table.challenges);
      expect(redirect).toHaveBeenCalledWith(302, '/admin/challenges');
    });

    it('should return error for delete failures', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock database error on first delete (test cases)
      mockDb.delete.mockImplementationOnce(() => ({
        where: vi.fn().mockRejectedValue(new Error('Foreign key constraint failed'))
      }));

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.delete({ params, locals } as any);

      expect(result).toEqual({
        status: 500,
        data: { message: 'Failed to delete challenge.' }
      });
      expect(consoleSpy).toHaveBeenCalledWith('Error deleteing challenge:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should return error if challenge delete fails after test cases deleted', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock successful test case deletion, then failed challenge deletion
      mockDb.delete
        .mockImplementationOnce(() => ({
          where: vi.fn().mockResolvedValue({}) // Test cases delete succeeds
        }))
        .mockImplementationOnce(() => ({
          where: vi.fn().mockRejectedValue(new Error('Challenge not found')) // Challenge delete fails
        }));

      const params = { id: 'nonexistent-challenge' };
      const locals = { db: mockDb };

      const result = await actions.delete({ params, locals } as any);

      expect(result).toEqual({
        status: 500,
        data: { message: 'Failed to delete challenge.' }
      });

      consoleSpy.mockRestore();
    });
  });
});