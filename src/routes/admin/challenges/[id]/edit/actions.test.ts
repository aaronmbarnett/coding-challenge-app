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
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue({})
    })
  }),
  delete: vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue({})
  })
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
      mockFormData.set('timeLimit', '3600');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      await expect(
        actions.update({ request: mockRequest, params, locals } as any)
      ).rejects.toThrow('Redirect to /admin/challenges/challenge-1');

      expect(mockDb.update).toHaveBeenCalledWith(table.challenges);
      expect(mockDb.update().set).toHaveBeenCalledWith({
        title: 'Updated Challenge',
        descriptionMd: '# Updated description',
        languagesCsv: 'javascript,python,go',
        starterCode: 'function solve() {}',
        timeLimitSec: 3600
      });
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

      expect(mockDb.update().set).toHaveBeenCalledWith({
        title: 'Test Challenge',
        descriptionMd: '# Test',
        languagesCsv: 'javascript',
        starterCode: '',
        timeLimitSec: null
      });
    });

    it('should handle whitespace in timeLimit', async () => {
      const mockFormData = new FormData();
      mockFormData.set('title', 'Test Challenge');
      mockFormData.set('description', '# Test');
      mockFormData.set('languages', 'javascript');
      mockFormData.set('timeLimit', '  1800  '); // Whitespace around value

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      await expect(
        actions.update({ request: mockRequest, params, locals } as any)
      ).rejects.toThrow('Redirect to /admin/challenges/challenge-1');

      expect(mockDb.update().set).toHaveBeenCalledWith(
        expect.objectContaining({
          timeLimitSec: 1800
        })
      );
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

      // Mock database error
      mockDb.update().set().where.mockRejectedValue(new Error('Database constraint violation'));

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
      mockDb.delete().where.mockRejectedValueOnce(new Error('Foreign key constraint failed'));

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

      // Mock successful test case deletion, but failed challenge deletion
      mockDb.delete().where
        .mockResolvedValueOnce({}) // Test cases delete succeeds
        .mockRejectedValueOnce(new Error('Challenge not found')); // Challenge delete fails

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