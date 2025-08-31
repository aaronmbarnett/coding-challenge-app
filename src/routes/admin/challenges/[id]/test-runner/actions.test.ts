import { describe, it, expect, beforeEach, vi } from 'vitest';
import { actions } from './+page.server';
import { fail } from '@sveltejs/kit';
import type { CodeSubmission, ExecutionResult } from '$lib/server/execution/types';

// Mock the challenge executor
vi.mock('$lib/server/execution/challenge-executor', () => ({
  executeChallenge: vi.fn()
}));

// Mock SvelteKit functions
vi.mock('@sveltejs/kit', async () => {
  const actual = await vi.importActual('@sveltejs/kit');
  return {
    ...actual,
    fail: vi.fn((status: number, data: any) => ({ status, data }))
  };
});

// Mock database operations
const mockReturning = vi.fn().mockResolvedValue([{ id: 'test-id' }]);
const mockDb = {
  select: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([{
        id: 'challenge-1',
        title: 'Sum Array',
        languagesCsv: 'javascript,python'
      }])
    })
  }),
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: mockReturning
    })
  }),
  delete: vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue({})
  })
};

const mockExecuteChallenge = vi.mocked(await import('$lib/server/execution/challenge-executor')).executeChallenge;

describe('/admin/challenges/[id]/test-runner form actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset database mock chain to return challenge data by default
    mockDb.select().from().where.mockResolvedValue([{
      id: 'challenge-1',
      title: 'Sum Array',
      languagesCsv: 'javascript,python'
    }]);
    
    mockReturning.mockResolvedValue([{ id: 'test-id' }]);
  });

  describe('runTest action', () => {
    it('should execute challenge code and return results', async () => {
      const mockExecutionResult: ExecutionResult = {
        submissionId: 'sub-123',
        totalTests: 2,
        passedTests: 2,
        testResults: [
          {
            testCaseId: 'test-1',
            passed: true,
            expectedOutput: '6',
            actualOutput: '6',
            executionTime: 15,
            weight: 1
          },
          {
            testCaseId: 'test-2',
            passed: true,
            expectedOutput: '12',
            actualOutput: '12',
            executionTime: 18,
            weight: 2
          }
        ],
        score: 3,
        maxScore: 3,
        totalExecutionTime: 33
      };

      mockExecuteChallenge.mockResolvedValue(mockExecutionResult);

      const mockFormData = new FormData();
      mockFormData.set('code', 'function sum(arr) { return arr.reduce((a, b) => a + b, 0); }');
      mockFormData.set('language', 'javascript');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.runTest({ request: mockRequest, params, locals } as any);

      expect(mockExecuteChallenge).toHaveBeenCalledWith({
        attemptId: expect.any(String), // Mock attempt ID
        code: 'function sum(arr) { return arr.reduce((a, b) => a + b, 0); }',
        language: 'javascript'
      });

      expect(result).toEqual({
        success: true,
        executionResult: mockExecutionResult
      });
    });

    it('should handle Python code execution', async () => {
      const mockExecutionResult: ExecutionResult = {
        submissionId: 'sub-124',
        totalTests: 2,
        passedTests: 2,
        testResults: [
          {
            testCaseId: 'test-1',
            passed: true,
            expectedOutput: '6',
            actualOutput: '6',
            executionTime: 22,
            weight: 1
          },
          {
            testCaseId: 'test-2',
            passed: true,
            expectedOutput: '12',
            actualOutput: '12',
            executionTime: 25,
            weight: 2
          }
        ],
        score: 3,
        maxScore: 3,
        totalExecutionTime: 47
      };

      mockExecuteChallenge.mockResolvedValue(mockExecutionResult);

      const mockFormData = new FormData();
      mockFormData.set('code', 'def sum_array(arr):\n    return sum(arr)');
      mockFormData.set('language', 'python');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.runTest({ request: mockRequest, params, locals } as any);

      expect(mockExecuteChallenge).toHaveBeenCalledWith({
        attemptId: expect.any(String),
        code: 'def sum_array(arr):\n    return sum(arr)',
        language: 'python'
      });

      expect(result).toEqual({
        success: true,
        executionResult: mockExecutionResult
      });
    });

    it('should return validation error for missing code', async () => {
      const mockFormData = new FormData();
      mockFormData.set('language', 'javascript');
      // Missing code

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.runTest({ request: mockRequest, params, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: {
          message: 'Code and language are required',
          data: {
            language: 'javascript'
          }
        }
      });

      expect(mockExecuteChallenge).not.toHaveBeenCalled();
    });

    it('should return validation error for missing language', async () => {
      const mockFormData = new FormData();
      mockFormData.set('code', 'function test() {}');
      // Missing language

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.runTest({ request: mockRequest, params, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: {
          message: 'Code and language are required',
          data: {
            code: 'function test() {}'
          }
        }
      });
    });

    it('should return validation error for unsupported language', async () => {
      const mockFormData = new FormData();
      mockFormData.set('code', 'int main() { return 0; }');
      mockFormData.set('language', 'c++');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.runTest({ request: mockRequest, params, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: {
          message: 'Language c++ is not supported for this challenge. Supported languages: javascript, python',
          data: {
            code: 'int main() { return 0; }',
            language: 'c++'
          }
        }
      });
    });

    it('should handle execution errors gracefully', async () => {
      mockExecuteChallenge.mockRejectedValue(new Error('Judge0 service unavailable'));

      const mockFormData = new FormData();
      mockFormData.set('code', 'function test() {}');
      mockFormData.set('language', 'javascript');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.runTest({ request: mockRequest, params, locals } as any);

      expect(result).toEqual({
        status: 500,
        data: {
          message: 'Code execution failed: Judge0 service unavailable'
        }
      });
    });

    it('should handle challenge not found error', async () => {
      // Mock database to return empty result
      mockDb.select().from().where.mockResolvedValue([]);

      const mockFormData = new FormData();
      mockFormData.set('code', 'function test() {}');
      mockFormData.set('language', 'javascript');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'nonexistent-challenge' };
      const locals = { db: mockDb };

      const result = await actions.runTest({ request: mockRequest, params, locals } as any);

      expect(result).toEqual({
        status: 404,
        data: {
          message: 'Challenge not found'
        }
      });
    });

    it('should handle failed test cases', async () => {
      const mockExecutionResult: ExecutionResult = {
        submissionId: 'sub-125',
        totalTests: 2,
        passedTests: 1,
        testResults: [
          {
            testCaseId: 'test-1',
            passed: true,
            expectedOutput: '6',
            actualOutput: '6',
            executionTime: 15,
            weight: 1
          },
          {
            testCaseId: 'test-2',
            passed: false,
            expectedOutput: '12',
            actualOutput: '0',
            executionTime: 12,
            weight: 2
          }
        ],
        score: 1,
        maxScore: 3,
        totalExecutionTime: 27
      };

      mockExecuteChallenge.mockResolvedValue(mockExecutionResult);

      const mockFormData = new FormData();
      mockFormData.set('code', 'function sum(arr) { return 0; }'); // Incorrect implementation
      mockFormData.set('language', 'javascript');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.runTest({ request: mockRequest, params, locals } as any);

      expect(result).toEqual({
        success: true,
        executionResult: mockExecutionResult
      });
    });

    it('should handle syntax errors in code', async () => {
      const mockExecutionResult: ExecutionResult = {
        submissionId: 'sub-126',
        totalTests: 2,
        passedTests: 0,
        testResults: [
          {
            testCaseId: 'test-1',
            passed: false,
            expectedOutput: '6',
            actualOutput: '',
            executionTime: 0,
            weight: 1,
            error: 'SyntaxError: Unexpected token'
          },
          {
            testCaseId: 'test-2',
            passed: false,
            expectedOutput: '12',
            actualOutput: '',
            executionTime: 0,
            weight: 2,
            error: 'SyntaxError: Unexpected token'
          }
        ],
        score: 0,
        maxScore: 3,
        totalExecutionTime: 0,
        compilationError: 'SyntaxError: Unexpected token'
      };

      mockExecuteChallenge.mockResolvedValue(mockExecutionResult);

      const mockFormData = new FormData();
      mockFormData.set('code', 'function sum(arr { return 0; }'); // Missing closing paren
      mockFormData.set('language', 'javascript');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const params = { id: 'challenge-1' };
      const locals = { db: mockDb };

      const result = await actions.runTest({ request: mockRequest, params, locals } as any);

      expect(result).toEqual({
        success: true,
        executionResult: mockExecutionResult
      });
    });
  });
});