import { describe, it, expect, beforeEach, vi } from 'vitest';
import { load } from './+page.server';

// Semantic time constants for challenges page tests
const THIRTY_MINUTES_SECONDS = 30 * 60; // 1800
const ONE_HOUR_SECONDS = 60 * 60; // 3600

// Type for the expected return value
interface LoadResult {
  challenges: Array<{
    id: string;
    title: string;
    descriptionMd?: string;
    languagesCsv?: string;
    starterCode?: string | null;
    timeLimitSec?: number | null;
    createdAt?: Date;
  }>;
}

// Create a simple mock that returns data directly
const createMockDb = (mockData: any) => {
  return {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue(mockData)
      })
    })
  };
};

describe('/admin/challenges page server load', () => {
  describe('load function', () => {
    it('should load challenges ordered by creation date', async () => {
      const mockChallenges = [
        {
          id: 'challenge-1',
          title: 'Array Sum',
          descriptionMd: '# Calculate sum of array',
          languagesCsv: 'javascript,python',
          starterCode: 'function sum(arr) {}',
          timeLimitSec: THIRTY_MINUTES_SECONDS,
          createdAt: new Date('2024-01-01T10:00:00Z')
        },
        {
          id: 'challenge-2',
          title: 'String Reverse',
          descriptionMd: '# Reverse a string',
          languagesCsv: 'javascript,python,go',
          starterCode: null,
          timeLimitSec: 900,
          createdAt: new Date('2024-01-02T10:00:00Z')
        }
      ];

      const mockDb = createMockDb(mockChallenges);
      const locals = { db: mockDb };

      const result = await load({ locals } as any);

      expect(result).toEqual({
        challenges: mockChallenges
      });

      // Verify database was called
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should handle empty challenges list', async () => {
      const mockChallenges: any[] = [];
      const mockDb = createMockDb(mockChallenges);
      const locals = { db: mockDb };

      const result = await load({ locals } as any);

      expect(result).toEqual({
        challenges: []
      });
    });

    it('should handle challenges with different field combinations', async () => {
      const mockChallenges = [
        {
          id: 'challenge-1',
          title: 'With Starter Code',
          descriptionMd: '# Description',
          languagesCsv: 'javascript',
          starterCode: 'console.log("start");',
          timeLimitSec: ONE_HOUR_SECONDS,
          createdAt: new Date('2024-01-01T10:00:00Z')
        },
        {
          id: 'challenge-2',
          title: 'Without Starter Code',
          descriptionMd: '# Another Description',
          languagesCsv: 'python,go',
          starterCode: null,
          timeLimitSec: null,
          createdAt: new Date('2024-01-02T10:00:00Z')
        }
      ];

      const mockDb = createMockDb(mockChallenges);
      const locals = { db: mockDb };

      const result = await load({ locals } as any) as LoadResult;

      expect(result.challenges).toHaveLength(2);
      expect(result.challenges[0].starterCode).toBe('console.log("start");');
      expect(result.challenges[1].starterCode).toBeNull();
      expect(result.challenges[0].timeLimitSec).toBe(ONE_HOUR_SECONDS);
      expect(result.challenges[1].timeLimitSec).toBeNull();
    });

    it('should handle challenges with multiple languages', async () => {
      const mockChallenges = [
        {
          id: 'challenge-1',
          title: 'Multi-Language Challenge',
          languagesCsv: 'javascript,python,go,rust,typescript'
        }
      ];

      const mockDb = createMockDb(mockChallenges);
      const locals = { db: mockDb };

      const result = await load({ locals } as any) as LoadResult;

      expect(result.challenges[0].languagesCsv).toBe('javascript,python,go,rust,typescript');
    });

    it('should return data structure correctly', async () => {
      const mockChallenges = [
        {
          id: 'test-challenge',
          title: 'Test Challenge',
          descriptionMd: '# Test',
          languagesCsv: 'javascript',
          starterCode: null,
          timeLimitSec: THIRTY_MINUTES_SECONDS,
          createdAt: new Date()
        }
      ];

      const mockDb = createMockDb(mockChallenges);
      const locals = { db: mockDb };

      const result = await load({ locals } as any) as LoadResult;

      expect(result).toHaveProperty('challenges');
      expect(Array.isArray(result.challenges)).toBe(true);
      expect(result.challenges[0]).toHaveProperty('id');
      expect(result.challenges[0]).toHaveProperty('title');
      expect(result.challenges[0]).toHaveProperty('languagesCsv');
    });
  });
});

