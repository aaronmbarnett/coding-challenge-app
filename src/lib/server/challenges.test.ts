import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createChallenge,
  updateChallenge,
  deleteChallenge,
  parseFormDataToChallenge
} from './challenges';
import * as table from './db/schema';

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
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'test-id', title: 'Test Challenge' }])
        })
      });
    });

    it('should create challenge with valid data', async () => {
      const data = {
        title: 'Test Challenge',
        description: '# Description',
        languages: 'javascript,python',
        starterCode: 'console.log("test");',
        timeLimitSec: 1800
      };

      const result = await createChallenge(mockDb as any, data);

      expect(mockDb.insert).toHaveBeenCalledWith(table.challenges);
      expect(mockDb.insert().values).toHaveBeenCalledWith({
        title: 'Test Challenge',
        descriptionMd: '# Description',
        languagesCsv: 'javascript,python',
        starterCode: 'console.log("test");',
        timeLimitSec: 1800
      });
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

      expect(mockDb.insert().values).toHaveBeenCalledWith({
        title: 'Test',
        descriptionMd: 'Desc',
        languagesCsv: 'js',
        starterCode: null,
        timeLimitSec: null
      });
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
      formData.set('timeLimit', '1800');

      const result = parseFormDataToChallenge(formData);

      expect(result).toEqual({
        title: 'Test',
        description: 'Desc',
        languages: 'js',
        starterCode: 'code',
        timeLimitSec: 1800
      });
    });
  });
});
