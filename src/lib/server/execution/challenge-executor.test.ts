import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { executeChallenge, type CodeSubmission, type ExecutionResult } from './challenge-executor';
import { db } from '../db';
import * as table from '../db/schema';
import { eq, sql } from 'drizzle-orm';

// Helper function for database cleanup - simple and reliable
async function cleanupTestData() {
  // Clean up in correct dependency order - simple approach
  try {
    await db.delete(table.submissions);
    await db.delete(table.attempts);
    await db.delete(table.challengeTests);
    await db.delete(table.sessions);
    await db.delete(table.challenges);
    await db.delete(table.invitation);
    await db.delete(table.session);
    await db.delete(table.user);
  } catch (error) {
    // Ignore cleanup errors - they're usually harmless
  }
}

describe('Challenge Execution Service', () => {
  let challengeId: string;
  let attemptId: string;
  let testCaseIds: string[] = [];

  // Helper to create consistent test data for each test
  async function createTestData() {
    // Create test challenge with test cases
    try {
      const challengeResult = await db
        .insert(table.challenges)
        .values({
          title: 'Array Sum',
          descriptionMd: '# Calculate sum of array elements',
          languagesCsv: 'javascript,python'
        })
        .returning();
      
      if (!challengeResult.length) {
        throw new Error('Failed to create challenge');
      }
      challengeId = challengeResult[0].id;
    } catch (error) {
      console.error('Failed to create challenge:', error);
      throw error;
    }

    // Create test cases for the challenge
    try {
      const testCase1Result = await db
        .insert(table.challengeTests)
        .values({
          challengeId,
          kind: 'io',
          input: '[1, 2, 3]',
          expectedOutput: '6',
          weight: 1,
          hidden: 0
        })
        .returning();

      const testCase2Result = await db
        .insert(table.challengeTests)
        .values({
          challengeId,
          kind: 'io',
          input: '[5, 10, -3]',
          expectedOutput: '12',
          weight: 2,
          hidden: 1
        })
        .returning();

      testCaseIds = [testCase1Result[0].id, testCase2Result[0].id];
    } catch (error) {
      console.error('Failed to create test cases:', error);
      throw error;
    }

    // Create user, session, and attempt for testing
    try {
      const userResult = await db
        .insert(table.user)
        .values({
          email: 'candidate@test.com',
          role: 'candidate'
        })
        .returning();
        
      if (!userResult.length) {
        throw new Error('Failed to create user');
      }

      const sessionResult = await db
        .insert(table.sessions)
        .values({
          candidateId: userResult[0].id,
          totalDurationSec: 3600
        })
        .returning();
        
      if (!sessionResult.length) {
        throw new Error('Failed to create session');
      }

      const attemptResult = await db
        .insert(table.attempts)
        .values({
          sessionId: sessionResult[0].id,
          challengeId: challengeId,
          status: 'in_progress'
        })
        .returning();
        
      if (!attemptResult.length) {
        throw new Error('Failed to create attempt');
      }
      attemptId = attemptResult[0].id;
    } catch (error) {
      console.error('Failed to create user/session/attempt:', error);
      throw error;
    }
  }

  // Clean up any leftover data from previous test runs
  beforeAll(async () => {
    await cleanupTestData();
  });

  beforeEach(async () => {
    // Always clean up before setting up new test data
    await cleanupTestData();
    
    // Reset the variables
    challengeId = '';
    attemptId = '';
    testCaseIds = [];

    // Always recreate test data for each test to ensure isolation
    await createTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
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

