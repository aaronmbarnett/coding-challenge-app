import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { executeChallenge, type CodeSubmission, type ExecutionResult } from './challenge-executor';
import { setupTestDb, testFactories } from '../db/test-utils';
import * as table from '../db/schema';
import { eq } from 'drizzle-orm';

// Semantic time constants for execution tests
const ONE_HOUR_SECONDS = 60 * 60; // 3600

// We'll mock the database module to use our test database
let mockDb: any;
vi.mock('../db', () => ({
  get db() {
    return mockDb;
  }
}));

describe('Challenge Execution Service', () => {
  let db: ReturnType<typeof setupTestDb>['db'];
  let cleanup: ReturnType<typeof setupTestDb>['cleanup'];
  let challengeId: string;
  let attemptId: string;
  let testCaseIds: string[] = [];

  // Helper to create consistent test data for each test
  async function createTestData() {
    // Create test challenge
    const challenge = await testFactories.createChallenge(db, {
      title: 'Array Sum',
      descriptionMd: '# Calculate sum of array elements',
      languagesCsv: 'javascript,python'
    });
    challengeId = challenge.id;

    // Create test cases for the challenge
    const testCase1 = await testFactories.createTestCase(db, challengeId, {
      input: '[1, 2, 3]',
      expectedOutput: '6',
      weight: 1,
      hidden: 0
    });

    const testCase2 = await testFactories.createTestCase(db, challengeId, {
      input: '[5, 10, -3]',
      expectedOutput: '12',
      weight: 2,
      hidden: 1
    });

    testCaseIds = [testCase1.id, testCase2.id];

    // Create user, session, and attempt for testing
    const user = await testFactories.createUser(db, {
      email: 'candidate@test.com',
      role: 'candidate'
    });

    const session = await testFactories.createSession(db, user.id, {
      totalDurationSec: ONE_HOUR_SECONDS
    });

    const attempt = await testFactories.createAttempt(db, session.id, challengeId, {
      status: 'in_progress'
    });

    attemptId = attempt.id;
  }

  beforeEach(async () => {
    // Each test gets a fresh in-memory database
    const testDb = setupTestDb();
    db = testDb.db;
    cleanup = testDb.cleanup;

    // Set the mock to use our test database
    mockDb = db;

    // Reset variables
    challengeId = '';
    attemptId = '';
    testCaseIds = [];

    // Create test data
    await createTestData();
  });

  afterEach(() => {
    cleanup();
  });

  describe('executeChallenge', () => {
    it('should execute code and return results for all test cases', async () => {
      const submission: CodeSubmission = {
        attemptId,
        code: 'function sum(arr) { return arr.reduce((a, b) => a + b, 0); }',
        language: 'javascript'
      };

      const result: ExecutionResult = await executeChallenge(submission);

      expect(result).toBeDefined();
      expect(result.submissionId).toBeDefined();
      expect(result.totalTests).toBe(2);
      expect(result.passedTests).toBe(2);
      expect(result.testResults).toHaveLength(2);

      // Check first test case result
      expect(result.testResults[0]).toEqual({
        testCaseId: testCaseIds[0],
        passed: true,
        expectedOutput: '6',
        actualOutput: '6',
        executionTime: expect.any(Number),
        weight: 1
      });

      // Check second test case result
      expect(result.testResults[1]).toEqual({
        testCaseId: testCaseIds[1],
        passed: true,
        expectedOutput: '12',
        actualOutput: '12',
        executionTime: expect.any(Number),
        weight: 2
      });
    });

    it('should handle incorrect code submission', async () => {
      const submission: CodeSubmission = {
        attemptId,
        code: 'function sum(arr) { return 0; }', // Always returns 0
        language: 'javascript'
      };

      const result = await executeChallenge(submission);

      expect(result.totalTests).toBe(2);
      expect(result.passedTests).toBe(0);
      expect(result.testResults[0].passed).toBe(false);
      expect(result.testResults[0].actualOutput).toBe('0');
      expect(result.testResults[0].expectedOutput).toBe('6');
    });

    it('should handle syntax errors in code', async () => {
      const submission: CodeSubmission = {
        attemptId,
        code: 'function sum(arr) { return arr.reduce((a, b => a + b, 0); }', // Missing closing paren
        language: 'javascript'
      };

      const result = await executeChallenge(submission);

      expect(result.totalTests).toBe(2);
      expect(result.passedTests).toBe(0);
      expect(result.compilationError).toBeDefined();
      expect(result.compilationError).toContain('SyntaxError');
    });

    it('should handle runtime errors in code', async () => {
      const submission: CodeSubmission = {
        attemptId,
        code: 'function sum(arr) { throw new Error("Runtime error"); }',
        language: 'javascript'
      };

      const result = await executeChallenge(submission);

      expect(result.totalTests).toBe(2);
      expect(result.passedTests).toBe(0);
      expect(result.testResults[0].passed).toBe(false);
      expect(result.testResults[0].error).toContain('Runtime error');
    });

    it('should support Python code execution', async () => {
      const submission: CodeSubmission = {
        attemptId,
        code: 'def sum_array(arr):\n    return sum(arr)',
        language: 'python'
      };

      const result = await executeChallenge(submission);

      expect(result.totalTests).toBe(2);
      expect(result.passedTests).toBe(2);
      expect(result.testResults[0].passed).toBe(true);
      expect(result.testResults[1].passed).toBe(true);
    });

    it('should create submission record in database', async () => {
      const submission: CodeSubmission = {
        attemptId,
        code: 'function sum(arr) { return arr.reduce((a, b) => a + b, 0); }',
        language: 'javascript'
      };

      const result = await executeChallenge(submission);

      // Check that submission was saved to database
      const [dbSubmission] = await db
        .select()
        .from(table.submissions)
        .where(eq(table.submissions.id, result.submissionId));

      expect(dbSubmission).toBeDefined();
      expect(dbSubmission.attemptId).toBe(attemptId);
      expect(dbSubmission.code).toBe(submission.code);
      expect(dbSubmission.language).toBe('javascript');
      expect(dbSubmission.passed).toBe(2);
      expect(dbSubmission.total).toBe(2);
      expect(dbSubmission.judge0Id).toBeDefined();
      expect(dbSubmission.createdAt).toBeInstanceOf(Date);
    });

    it('should handle execution timeout', async () => {
      const submission: CodeSubmission = {
        attemptId,
        code: 'function sum(arr) { while(true) {} }', // Infinite loop
        language: 'javascript'
      };

      const result = await executeChallenge(submission);

      expect(result.totalTests).toBe(2);
      expect(result.passedTests).toBe(0);
      expect(result.executionTimeout).toBe(true);
      expect(result.testResults[0].error).toContain('timeout');
    });

    it('should handle unsupported language', async () => {
      const submission: CodeSubmission = {
        attemptId,
        code: 'int sum(int arr[]) { return 0; }',
        language: 'c++' // Not in languagesCsv
      };

      await expect(executeChallenge(submission)).rejects.toThrow(
        'Language c++ not supported for this challenge'
      );
    });

    it('should validate attempt exists and is in progress', async () => {
      // Mark attempt as submitted
      await db
        .update(table.attempts)
        .set({ status: 'submitted' })
        .where(eq(table.attempts.id, attemptId));

      const submission: CodeSubmission = {
        attemptId,
        code: 'function sum() {}',
        language: 'javascript'
      };

      await expect(executeChallenge(submission)).rejects.toThrow('Attempt is not in progress');
    });

    it('should calculate weighted score correctly', async () => {
      const submission: CodeSubmission = {
        attemptId,
        code: 'function sum(arr) { return arr[0] === 1 ? 6 : 0; }', // Only passes first test
        language: 'javascript'
      };

      const result = await executeChallenge(submission);

      expect(result.passedTests).toBe(1);
      expect(result.totalTests).toBe(2);
      expect(result.score).toBe(1); // Only weight-1 test passed (out of total weight 3)
      expect(result.maxScore).toBe(3); // Total weight of all tests
    });

    it('should handle empty code submission', async () => {
      const submission: CodeSubmission = {
        attemptId,
        code: '',
        language: 'javascript'
      };

      await expect(executeChallenge(submission)).rejects.toThrow('Code cannot be empty');
    });

    it('should handle challenge with no test cases', async () => {
      // Delete all test cases
      await db
        .delete(table.challengeTests)
        .where(eq(table.challengeTests.challengeId, challengeId));

      const submission: CodeSubmission = {
        attemptId,
        code: 'function sum() {}',
        language: 'javascript'
      };

      await expect(executeChallenge(submission)).rejects.toThrow(
        'No test cases found for challenge'
      );
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle Judge0 API unavailable', async () => {
      // For now, we'll just mock this scenario by creating a submission that triggers a service error
      const submission: CodeSubmission = {
        attemptId,
        code: 'SERVICE_UNAVAILABLE_TEST',
        language: 'javascript'
      };

      const result = await executeChallenge(submission);

      expect(result.serviceError).toBeDefined();
      expect(result.serviceError).toContain('Execution service unavailable');
    });

    it('should handle concurrent submissions for same attempt', async () => {
      const submission: CodeSubmission = {
        attemptId,
        code: 'function sum(arr) { return arr.reduce((a, b) => a + b, 0); }',
        language: 'javascript'
      };

      // Start multiple executions concurrently
      const promises = [
        executeChallenge(submission),
        executeChallenge(submission),
        executeChallenge(submission)
      ];

      const results = await Promise.allSettled(promises);

      // Only one should succeed, others should be rejected or handled gracefully
      const successes = results.filter((r) => r.status === 'fulfilled');
      expect(successes).toHaveLength(1);
    });

    it('should track execution metrics', async () => {
      const submission: CodeSubmission = {
        attemptId,
        code: 'function sum(arr) { return arr.reduce((a, b) => a + b, 0); }',
        language: 'javascript'
      };

      const startTime = Date.now();
      const result = await executeChallenge(submission);
      const endTime = Date.now();

      expect(result.totalExecutionTime).toBeGreaterThan(0);
      expect(result.totalExecutionTime).toBeLessThan(1000); // Should be less than 1 second
      expect(result.testResults[0].executionTime).toBeGreaterThan(0);
    });
  });
});
