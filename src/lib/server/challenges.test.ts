import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createChallenge, parseFormDataToChallenge, type CreateChallengeData } from './challenges';
import * as table from './db/schema';

// Semantic time constants for challenge tests
const THIRTY_MINUTES_SECONDS = 30 * 60; // 1800

// Contract-based database mock - focus on data flow
const mockDb = {
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
};

describe('challenge functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createChallenge', () => {
    beforeEach(() => {
      // Simplified contract-based mock - focus on what data comes back
      mockDb.insert.mockImplementation(() => ({
        values: vi.fn().mockImplementation((data) => {
          // Mock successful challenge creation
          if (data && 'title' in data) {
            return {
              returning: () => Promise.resolve([{ id: 'test-id', title: data.title }])
            };
          }
          return Promise.resolve();
        })
      }));
    });

    it('should create challenge with valid data', async () => {
      const data = {
        title: 'Test Challenge',
        description: '# Description',
        languages: 'javascript,python',
        starterCode: 'console.log("test");',
        timeLimitSec: THIRTY_MINUTES_SECONDS
      };

      const result = await createChallenge(mockDb as any, data);

      // Verify correct table and successful operation
      expect(mockDb.insert).toHaveBeenCalledWith(table.challenges);
      
      // Focus on business logic: function returns created challenge
      expect(result).toEqual({ id: 'test-id', title: 'Test Challenge' });
    });

    it('should handle optional fields', async () => {
      const data = {
        title: 'Test',
        description: 'Desc',
        languages: 'js'
        // starterCode and timeLimitSec intentionally omitted
      };

      await createChallenge(mockDb as any, data);

      // Verify table was targeted (business logic handles null values)
      expect(mockDb.insert).toHaveBeenCalledWith(table.challenges);
    });

    it('should validate required fields', async () => {
      const data = { title: '', description: 'Desc', languages: 'js' };

      await expect(createChallenge(mockDb as any, data)).rejects.toThrow(
        'Title, description, and languages are required'
      );
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('parseFormDataToChallenge', () => {
    it('should parse form data correctly', () => {
      const formData = new FormData();
      formData.set('title', 'Test');
      formData.set('description', 'Desc');
      formData.set('languages', 'js');
      formData.set('starterCode', 'code');
      formData.set('timeLimit', THIRTY_MINUTES_SECONDS.toString());

      const result: CreateChallengeData = parseFormDataToChallenge(formData);

      expect(result).toEqual({
        title: 'Test',
        description: 'Desc',
        languages: 'js',
        starterCode: 'code',
        timeLimitSec: THIRTY_MINUTES_SECONDS
      });
    });
  });
});
