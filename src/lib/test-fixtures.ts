import type { Challenge, TestCase, User, ExamSession } from '$lib/server/db/schema';

export const mockChallenge: Challenge = {
  id: 'challenge-123',
  title: 'Two Sum Problem',
  descriptionMd: '# Find two numbers that add up to target',
  languagesCsv: 'javascript,python,java',
  starterCode: 'function twoSum() {}',
  timeLimitSec: 1800,
  createdAt: new Date('2024-01-15T10:00:00Z')
};

export const mockChallengeId = 'challenge-123';

export const mockIOTestCase: TestCase = {
  id: 'test-case-1',
  challengeId: mockChallengeId,
  kind: 'io',
  input: '[1, 2, 3]',
  expectedOutput: '6',
  harnessCode: null,
  weight: 1,
  hidden: 0
};

export const mockHarnessTestCase: TestCase = {
  id: 'test-case-2',
  challengeId: mockChallengeId,
  kind: 'harness',
  input: null,
  expectedOutput: null,
  harnessCode: 'assert(sum([1,2,3]) === 6);',
  weight: 2,
  hidden: 1
};

export const mockTestCases: TestCase[] = [mockIOTestCase, mockHarnessTestCase];

export const mockUser: User = {
  id: 'user-123',
  email: 'admin@example.com',
  role: 'admin',
  createdAt: new Date('2024-01-01T00:00:00Z')
};

export const mockSession: ExamSession = {
  id: 'session-123',
  candidateId: 'candidate-123',
  totalDurationSec: 3600,
  startedAt: new Date('2024-01-15T10:00:00Z'),
  endsAt: new Date('2024-01-15T11:00:00Z'),
  status: 'pending'
};

// Factory functions for creating variations
export function createMockChallenge(overrides: Partial<Challenge> = {}): Challenge {
  return { ...mockChallenge, ...overrides };
}

export function createMockTestCase(overrides: Partial<TestCase> = {}): TestCase {
  return { ...mockIOTestCase, ...overrides };
}

export function createMockUser(overrides: Partial<User> = {}): User {
  return { ...mockUser, ...overrides };
}

export function createMockSession(overrides: Partial<ExamSession> = {}): ExamSession {
  return { ...mockSession, ...overrides };
}