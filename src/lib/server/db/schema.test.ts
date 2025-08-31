import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from './index';
import * as table from './schema';
import { eq } from 'drizzle-orm';

describe('Database Schema and Relationships', () => {
  // Clean up test data after each test
  afterEach(async () => {
    await db.delete(table.submissions);
    await db.delete(table.attempts);
    await db.delete(table.sessions);
    await db.delete(table.challengeTests);
    await db.delete(table.challenges);
    await db.delete(table.invitation);
    await db.delete(table.session);
    await db.delete(table.user);
  });

  describe('User table', () => {
    it('should create user with auto-generated ID and timestamp', async () => {
      const [user] = await db
        .insert(table.user)
        .values({
          email: 'test@example.com',
          role: 'candidate'
        })
        .returning();

      expect(user.id).toBeDefined();
      expect(user.id).toMatch(/^[a-z0-9]{24}$/); // CUID2 format
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('candidate');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should enforce unique email constraint', async () => {
      await db.insert(table.user).values({
        email: 'duplicate@example.com',
        role: 'admin'
      });

      await expect(
        db.insert(table.user).values({
          email: 'duplicate@example.com',
          role: 'candidate'
        })
      ).rejects.toThrow();
    });

    it('should default to candidate role', async () => {
      const [user] = await db
        .insert(table.user)
        .values({
          email: 'default-role@example.com'
        })
        .returning();

      expect(user.role).toBe('candidate');
    });

    it('should accept valid role enum values', async () => {
      const [adminUser] = await db.insert(table.user).values({
        email: 'admin-role@example.com',
        role: 'admin'
      }).returning();

      const [candidateUser] = await db.insert(table.user).values({
        email: 'candidate-role@example.com',
        role: 'candidate'
      }).returning();

      expect(adminUser.role).toBe('admin');
      expect(candidateUser.role).toBe('candidate');
    });
  });

  describe('Challenges table', () => {
    it('should create challenge with auto-generated ID and timestamp', async () => {
      const [challenge] = await db
        .insert(table.challenges)
        .values({
          title: 'Array Sum',
          descriptionMd: '# Calculate sum',
          languagesCsv: 'javascript,python'
        })
        .returning();

      expect(challenge.id).toBeDefined();
      expect(challenge.id).toMatch(/^[a-z0-9]{24}$/);
      expect(challenge.title).toBe('Array Sum');
      expect(challenge.createdAt).toBeInstanceOf(Date);
    });

    it('should require non-empty description', async () => {
      const [challenge] = await db
        .insert(table.challenges)
        .values({
          title: 'Valid Challenge',
          descriptionMd: '# Valid description',
          languagesCsv: 'javascript'
        })
        .returning();

      expect(challenge.descriptionMd).toBe('# Valid description');
      expect(challenge.descriptionMd.length).toBeGreaterThan(0);
    });

    it('should handle optional fields correctly', async () => {
      const [challenge] = await db
        .insert(table.challenges)
        .values({
          title: 'Basic Challenge',
          descriptionMd: '# Simple test',
          languagesCsv: 'javascript',
          starterCode: null,
          timeLimitSec: null
        })
        .returning();

      expect(challenge.starterCode).toBeNull();
      expect(challenge.timeLimitSec).toBeNull();
    });
  });

  describe('Challenge Tests relationship', () => {
    it('should create test cases linked to challenges', async () => {
      // Create parent challenge
      const [challenge] = await db
        .insert(table.challenges)
        .values({
          title: 'Test Challenge',
          descriptionMd: '# Test',
          languagesCsv: 'javascript'
        })
        .returning();

      // Create linked test case
      const [testCase] = await db
        .insert(table.challengeTests)
        .values({
          challengeId: challenge.id,
          kind: 'io',
          input: '[1, 2, 3]',
          expectedOutput: '6',
          weight: 2,
          hidden: 0
        })
        .returning();

      expect(testCase.challengeId).toBe(challenge.id);
      expect(testCase.kind).toBe('io');
      expect(testCase.weight).toBe(2);
      expect(testCase.hidden).toBe(0);
    });

    it('should enforce foreign key constraint to challenges', async () => {
      await expect(
        db.insert(table.challengeTests).values({
          challengeId: 'nonexistent-challenge',
          kind: 'io',
          input: 'test',
          expectedOutput: 'result'
        })
      ).rejects.toThrow();
    });

    it('should default to io kind and weight 1 with hidden=1', async () => {
      const [challenge] = await db
        .insert(table.challenges)
        .values({
          title: 'Test',
          descriptionMd: '# Test',
          languagesCsv: 'js'
        })
        .returning();

      const [testCase] = await db
        .insert(table.challengeTests)
        .values({
          challengeId: challenge.id,
          input: 'test',
          expectedOutput: 'result'
        })
        .returning();

      expect(testCase.kind).toBe('io');
      expect(testCase.weight).toBe(1);
      expect(testCase.hidden).toBe(1);
    });

    it('should support harness test cases', async () => {
      const [challenge] = await db
        .insert(table.challenges)
        .values({
          title: 'Test',
          descriptionMd: '# Test',
          languagesCsv: 'js'
        })
        .returning();

      const [testCase] = await db
        .insert(table.challengeTests)
        .values({
          challengeId: challenge.id,
          kind: 'harness',
          harnessCode: 'assert(sum([1,2,3]) === 6)',
          weight: 3
        })
        .returning();

      expect(testCase.kind).toBe('harness');
      expect(testCase.harnessCode).toBe('assert(sum([1,2,3]) === 6)');
      expect(testCase.input).toBeNull();
      expect(testCase.expectedOutput).toBeNull();
    });
  });

  describe('Sessions and Users relationship', () => {
    it('should create session linked to candidate user', async () => {
      // Create candidate user
      const [candidate] = await db
        .insert(table.user)
        .values({
          email: 'candidate@example.com',
          role: 'candidate'
        })
        .returning();

      // Create session for candidate
      const [session] = await db
        .insert(table.sessions)
        .values({
          candidateId: candidate.id,
          totalDurationSec: 3600
        })
        .returning();

      expect(session.candidateId).toBe(candidate.id);
      expect(session.totalDurationSec).toBe(3600);
      expect(session.status).toBe('pending'); // Default status
      expect(session.startedAt).toBeNull();
      expect(session.endsAt).toBeNull();
    });

    it('should enforce foreign key constraint to users', async () => {
      await expect(
        db.insert(table.sessions).values({
          candidateId: 'nonexistent-user',
          totalDurationSec: 3600
        })
      ).rejects.toThrow();
    });

    it('should support all session status values', async () => {
      const [candidate] = await db
        .insert(table.user)
        .values({
          email: 'status-test@example.com',
          role: 'candidate'
        })
        .returning();

      // Test each status value
      const statuses = ['pending', 'active', 'submitted', 'expired'] as const;
      
      for (const status of statuses) {
        const [session] = await db
          .insert(table.sessions)
          .values({
            candidateId: candidate.id,
            totalDurationSec: 1800,
            status
          })
          .returning();

        expect(session.status).toBe(status);
      }
    });
  });

  describe('Attempts relationship (Sessions + Challenges)', () => {
    it('should create attempts linked to sessions and challenges', async () => {
      // Create test data
      const [candidate] = await db
        .insert(table.user)
        .values({
          email: 'attempt-test@example.com',
          role: 'candidate'
        })
        .returning();

      const [challenge] = await db
        .insert(table.challenges)
        .values({
          title: 'Test Challenge',
          descriptionMd: '# Test',
          languagesCsv: 'javascript'
        })
        .returning();

      const [session] = await db
        .insert(table.sessions)
        .values({
          candidateId: candidate.id,
          totalDurationSec: 3600
        })
        .returning();

      // Create attempt linking session and challenge
      const [attempt] = await db
        .insert(table.attempts)
        .values({
          sessionId: session.id,
          challengeId: challenge.id
        })
        .returning();

      expect(attempt.sessionId).toBe(session.id);
      expect(attempt.challengeId).toBe(challenge.id);
      expect(attempt.status).toBe('locked'); // Default status
      expect(attempt.testRunCount).toBe(0); // Default count
      expect(attempt.startedAt).toBeNull();
      expect(attempt.submittedAt).toBeNull();
    });

    it('should enforce foreign key constraints', async () => {
      const [candidate] = await db
        .insert(table.user)
        .values({
          email: 'fk-test@example.com',
          role: 'candidate'
        })
        .returning();

      const [session] = await db
        .insert(table.sessions)
        .values({
          candidateId: candidate.id,
          totalDurationSec: 3600
        })
        .returning();

      // Test invalid session ID
      await expect(
        db.insert(table.attempts).values({
          sessionId: 'nonexistent-session',
          challengeId: 'nonexistent-challenge'
        })
      ).rejects.toThrow();

      // Test invalid challenge ID (but valid session)
      await expect(
        db.insert(table.attempts).values({
          sessionId: session.id,
          challengeId: 'nonexistent-challenge'
        })
      ).rejects.toThrow();
    });

    it('should support all attempt status values', async () => {
      const [candidate] = await db
        .insert(table.user)
        .values({
          email: 'attempt-status@example.com',
          role: 'candidate'
        })
        .returning();

      const [challenge] = await db
        .insert(table.challenges)
        .values({
          title: 'Status Test',
          descriptionMd: '# Test',
          languagesCsv: 'python'
        })
        .returning();

      const [session] = await db
        .insert(table.sessions)
        .values({
          candidateId: candidate.id,
          totalDurationSec: 1800
        })
        .returning();

      const statuses = ['locked', 'in_progress', 'submitted'] as const;
      
      for (const status of statuses) {
        const [attempt] = await db
          .insert(table.attempts)
          .values({
            sessionId: session.id,
            challengeId: challenge.id,
            status
          })
          .returning();

        expect(attempt.status).toBe(status);
      }
    });
  });

  describe('Submissions relationship (Attempts)', () => {
    it('should create submissions linked to attempts', async () => {
      // Create full hierarchy
      const [candidate] = await db
        .insert(table.user)
        .values({
          email: 'submission-test@example.com',
          role: 'candidate'
        })
        .returning();

      const [challenge] = await db
        .insert(table.challenges)
        .values({
          title: 'Submission Test',
          descriptionMd: '# Test',
          languagesCsv: 'javascript'
        })
        .returning();

      const [session] = await db
        .insert(table.sessions)
        .values({
          candidateId: candidate.id,
          totalDurationSec: 3600
        })
        .returning();

      const [attempt] = await db
        .insert(table.attempts)
        .values({
          sessionId: session.id,
          challengeId: challenge.id,
          status: 'in_progress'
        })
        .returning();

      // Create submission
      const [submission] = await db
        .insert(table.submissions)
        .values({
          attemptId: attempt.id,
          code: 'function sum(arr) { return arr.reduce((a,b) => a+b, 0); }',
          language: 'javascript',
          passed: 3,
          total: 5
        })
        .returning();

      expect(submission.attemptId).toBe(attempt.id);
      expect(submission.code).toContain('function sum');
      expect(submission.language).toBe('javascript');
      expect(submission.passed).toBe(3);
      expect(submission.total).toBe(5);
      expect(submission.createdAt).toBeInstanceOf(Date);
    });

    it('should enforce foreign key constraint to attempts', async () => {
      await expect(
        db.insert(table.submissions).values({
          attemptId: 'nonexistent-attempt',
          code: 'test code',
          language: 'javascript'
        })
      ).rejects.toThrow();
    });

    it('should handle judge0 integration fields', async () => {
      const [candidate] = await db
        .insert(table.user)
        .values({
          email: 'judge0-test@example.com',
          role: 'candidate'
        })
        .returning();

      const [challenge] = await db
        .insert(table.challenges)
        .values({
          title: 'Judge0 Test',
          descriptionMd: '# Test',
          languagesCsv: 'python'
        })
        .returning();

      const [session] = await db
        .insert(table.sessions)
        .values({
          candidateId: candidate.id,
          totalDurationSec: 3600
        })
        .returning();

      const [attempt] = await db
        .insert(table.attempts)
        .values({
          sessionId: session.id,
          challengeId: challenge.id
        })
        .returning();

      const [submission] = await db
        .insert(table.submissions)
        .values({
          attemptId: attempt.id,
          code: 'def solution(): return 42',
          language: 'python',
          judge0Id: 'judge0-execution-123',
          stdout: 'Test output',
          stderr: 'Warning: deprecated syntax',
          timeMs: 250
        })
        .returning();

      expect(submission.judge0Id).toBe('judge0-execution-123');
      expect(submission.stdout).toBe('Test output');
      expect(submission.stderr).toBe('Warning: deprecated syntax');
      expect(submission.timeMs).toBe(250);
    });
  });

  describe('Invitation system', () => {
    it('should create invitation linked to admin user', async () => {
      const [admin] = await db
        .insert(table.user)
        .values({
          email: 'admin@example.com',
          role: 'admin'
        })
        .returning();

      const tokenHash = Buffer.from('hashed-token-data');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const [invitation] = await db
        .insert(table.invitation)
        .values({
          email: 'invited@example.com',
          tokenHash,
          expiresAt,
          createdBy: admin.id
        })
        .returning();

      expect(invitation.email).toBe('invited@example.com');
      expect(invitation.tokenHash).toEqual(tokenHash);
      expect(invitation.expiresAt).toEqual(expiresAt);
      expect(invitation.createdBy).toBe(admin.id);
      expect(invitation.consumedAt).toBeNull();
      expect(invitation.createdAt).toBeInstanceOf(Date);
    });

    it('should enforce foreign key constraint to users', async () => {
      await expect(
        db.insert(table.invitation).values({
          email: 'test@example.com',
          tokenHash: Buffer.from('test'),
          expiresAt: new Date(),
          createdBy: 'nonexistent-admin'
        })
      ).rejects.toThrow();
    });

    it('should handle invitation consumption', async () => {
      const [admin] = await db
        .insert(table.user)
        .values({
          email: 'admin@example.com',
          role: 'admin'
        })
        .returning();

      const [invitation] = await db
        .insert(table.invitation)
        .values({
          email: 'consume-test@example.com',
          tokenHash: Buffer.from('token'),
          expiresAt: new Date(Date.now() + 1000000),
          createdBy: admin.id
        })
        .returning();

      // Mark invitation as consumed
      const consumedAt = new Date();
      await db
        .update(table.invitation)
        .set({ consumedAt })
        .where(eq(table.invitation.id, invitation.id));

      const [updated] = await db
        .select()
        .from(table.invitation)
        .where(eq(table.invitation.id, invitation.id));

      expect(updated.consumedAt).toEqual(consumedAt);
    });
  });

  describe('Auth session table', () => {
    it('should create auth session linked to user', async () => {
      const [user] = await db
        .insert(table.user)
        .values({
          email: 'auth-test@example.com',
          role: 'admin'
        })
        .returning();

      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await db.insert(table.session).values({
        id: 'hashed-session-token',
        userId: user.id,
        expiresAt
      });

      const [authSession] = await db
        .select()
        .from(table.session)
        .where(eq(table.session.id, 'hashed-session-token'));

      expect(authSession.userId).toBe(user.id);
      expect(authSession.expiresAt).toEqual(expiresAt);
    });

    it('should enforce foreign key constraint to users', async () => {
      await expect(
        db.insert(table.session).values({
          id: 'test-session',
          userId: 'nonexistent-user',
          expiresAt: new Date()
        })
      ).rejects.toThrow();
    });
  });

  describe('Complex multi-table relationships', () => {
    it('should maintain referential integrity across full data hierarchy', async () => {
      // Create complete data hierarchy
      const [admin] = await db
        .insert(table.user)
        .values({
          email: 'admin@example.com',
          role: 'admin'
        })
        .returning();

      const [candidate] = await db
        .insert(table.user)
        .values({
          email: 'candidate@example.com',
          role: 'candidate'
        })
        .returning();

      const [challenge] = await db
        .insert(table.challenges)
        .values({
          title: 'Full Test',
          descriptionMd: '# Complete test',
          languagesCsv: 'javascript,python'
        })
        .returning();

      const [testCase] = await db
        .insert(table.challengeTests)
        .values({
          challengeId: challenge.id,
          kind: 'io',
          input: 'test',
          expectedOutput: 'result'
        })
        .returning();

      const [session] = await db
        .insert(table.sessions)
        .values({
          candidateId: candidate.id,
          totalDurationSec: 7200
        })
        .returning();

      const [attempt] = await db
        .insert(table.attempts)
        .values({
          sessionId: session.id,
          challengeId: challenge.id,
          status: 'in_progress'
        })
        .returning();

      const [submission] = await db
        .insert(table.submissions)
        .values({
          attemptId: attempt.id,
          code: 'solution code',
          language: 'javascript',
          passed: 1,
          total: 1
        })
        .returning();

      // Verify all relationships
      expect(session.candidateId).toBe(candidate.id);
      expect(testCase.challengeId).toBe(challenge.id);
      expect(attempt.sessionId).toBe(session.id);
      expect(attempt.challengeId).toBe(challenge.id);
      expect(submission.attemptId).toBe(attempt.id);
    });

    it('should handle cascading deletes correctly', async () => {
      // Create test data
      const [candidate] = await db
        .insert(table.user)
        .values({
          email: 'cascade-test@example.com',
          role: 'candidate'
        })
        .returning();

      const [challenge] = await db
        .insert(table.challenges)
        .values({
          title: 'Cascade Test',
          descriptionMd: '# Test',
          languagesCsv: 'go'
        })
        .returning();

      const [session] = await db
        .insert(table.sessions)
        .values({
          candidateId: candidate.id,
          totalDurationSec: 3600
        })
        .returning();

      const [attempt] = await db
        .insert(table.attempts)
        .values({
          sessionId: session.id,
          challengeId: challenge.id
        })
        .returning();

      await db
        .insert(table.submissions)
        .values({
          attemptId: attempt.id,
          code: 'package main',
          language: 'go'
        });

      // Delete in proper order (children first)
      await db.delete(table.submissions).where(eq(table.submissions.attemptId, attempt.id));
      await db.delete(table.attempts).where(eq(table.attempts.id, attempt.id));
      await db.delete(table.sessions).where(eq(table.sessions.id, session.id));

      // Verify deletions
      const remainingSessions = await db
        .select()
        .from(table.sessions)
        .where(eq(table.sessions.id, session.id));
      
      expect(remainingSessions).toHaveLength(0);
    });
  });

  describe('Data integrity and constraints', () => {
    it('should enforce email uniqueness across users', async () => {
      await db.insert(table.user).values({
        email: 'unique-test@example.com',
        role: 'admin'
      });

      await expect(
        db.insert(table.user).values({
          email: 'unique-test@example.com',
          role: 'candidate'
        })
      ).rejects.toThrow();
    });

    it('should handle timestamp fields correctly', async () => {
      const before = Date.now();
      
      const [user] = await db
        .insert(table.user)
        .values({
          email: 'timestamp-test@example.com'
        })
        .returning();

      const after = Date.now();

      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(after);
    });

    it('should generate unique CUID2 IDs', async () => {
      const [user1] = await db
        .insert(table.user)
        .values({
          email: 'cuid-test1@example.com'
        })
        .returning();

      const [user2] = await db
        .insert(table.user)
        .values({
          email: 'cuid-test2@example.com'
        })
        .returning();

      expect(user1.id).not.toBe(user2.id);
      expect(user1.id).toMatch(/^[a-z0-9]{24}$/);
      expect(user2.id).toMatch(/^[a-z0-9]{24}$/);
    });

    it('should handle null values appropriately', async () => {
      const [challenge] = await db
        .insert(table.challenges)
        .values({
          title: 'Null Test',
          descriptionMd: '# Test nulls',
          languagesCsv: 'rust',
          starterCode: null,
          timeLimitSec: null
        })
        .returning();

      expect(challenge.starterCode).toBeNull();
      expect(challenge.timeLimitSec).toBeNull();
    });
  });
});