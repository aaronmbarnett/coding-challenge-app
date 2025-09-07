import type { Challenge, TestCase, User, ExamSession, Invitation } from '$lib/server/db/schema';

// Semantic time constants for test fixtures (in seconds)
export const TEN_MINUTES_SECONDS = 10 * 60; // 600
export const FIFTEEN_MINUTES_SECONDS = 15 * 60; // 900
export const TWENTY_MINUTES_SECONDS = 20 * 60; // 1200
export const THIRTY_MINUTES_SECONDS = 30 * 60; // 1800
export const ONE_HOUR_SECONDS = 60 * 60; // 3600
export const TWO_HOURS_SECONDS = 2 * 60 * 60; // 7200

// Time constants in milliseconds for invitation/session tests
export const TIME_MS = {
  THIRTY_MINUTES: 30 * 60 * 1000, // 1800000
  ONE_HOUR: 60 * 60 * 1000, // 3600000
  TWO_HOURS: 2 * 60 * 60 * 1000, // 7200000
  ONE_DAY: 24 * 60 * 60 * 1000 // 86400000
} as const;

export const mockChallenge: Challenge = {
  id: 'challenge-123',
  title: 'Two Sum Problem',
  descriptionMd: '# Find two numbers that add up to target',
  languagesCsv: 'javascript,python,java',
  starterCode: 'function twoSum() {}',
  timeLimitSec: THIRTY_MINUTES_SECONDS,
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
  totalDurationSec: ONE_HOUR_SECONDS,
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

// ===== CANDIDATE FIXTURES =====
export const mockCandidates = [
  { id: 'candidate-1', email: 'alice@example.com' },
  { id: 'candidate-2', email: 'bob@example.com' },
  { id: 'candidate-3', email: 'charlie@example.com' }
] as const;

export const mockCandidate = mockCandidates[0];

export function createMockCandidate(overrides: Partial<User> = {}): User {
  return { 
    id: 'candidate-123',
    email: 'candidate@example.com',
    role: 'candidate',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides 
  };
}

// ===== CHALLENGE COLLECTION FIXTURES =====
export const mockChallenges = [
  {
    id: 'challenge-1', 
    title: 'Two Sum',
    descriptionMd: '# Two Sum\n\nFind two numbers that add up to target.',
    languagesCsv: 'javascript,python,java',
    starterCode: 'function twoSum(nums, target) {\n  // Your code here\n}',
    timeLimitSec: THIRTY_MINUTES_SECONDS,
    createdAt: new Date('2024-01-15T10:00:00Z')
  },
  {
    id: 'challenge-2', 
    title: 'Valid Palindrome',
    descriptionMd: '# Valid Palindrome\n\nCheck if a string is a palindrome.',
    languagesCsv: 'javascript,python',
    starterCode: 'function isPalindrome(s) {\n  // Your code here\n}',
    timeLimitSec: TWENTY_MINUTES_SECONDS,
    createdAt: new Date('2024-01-16T10:00:00Z')
  },
  {
    id: 'challenge-3',
    title: 'Algorithm Challenge',
    descriptionMd: '# Algorithm Challenge\n\nSolve this complex algorithm.',
    languagesCsv: 'javascript,python,java,cpp',
    starterCode: 'function solve() {\n  // Your implementation\n}',
    timeLimitSec: ONE_HOUR_SECONDS,
    createdAt: new Date('2024-01-17T10:00:00Z')
  },
  {
    id: 'challenge-4',
    title: 'System Design',
    descriptionMd: '# System Design\n\nDesign a scalable system.',
    languagesCsv: 'javascript,python,java',
    starterCode: 'class System {\n  // Design here\n}',
    timeLimitSec: TWO_HOURS_SECONDS,
    createdAt: new Date('2024-01-18T10:00:00Z')
  }
] as const;

// ===== INVITATION FIXTURES =====
export const createMockInvitation = (overrides: Partial<Invitation> = {}): Invitation => {
  // Use TextEncoder for browser-compatible Buffer alternative
  const tokenHash = typeof Buffer !== 'undefined' 
    ? Buffer.from('mock-token-hash') 
    : new Uint8Array(new TextEncoder().encode('mock-token-hash'));
  
  return {
    id: 'invitation-123',
    email: 'candidate@example.com',
    tokenHash: tokenHash as Buffer,
    expiresAt: new Date(Date.now() + TIME_MS.ONE_HOUR),
    consumedAt: null,
    createdBy: 'admin-123',
    createdAt: new Date(),
    ...overrides
  };
};

export const mockInvitations = {
  pending: createMockInvitation({
    id: 'pending-invitation',
    email: 'pending@example.com',
    consumedAt: null
  }),
  consumed: createMockInvitation({
    id: 'consumed-invitation', 
    email: 'consumed@example.com',
    consumedAt: new Date(Date.now() - TIME_MS.THIRTY_MINUTES)
  }),
  expired: createMockInvitation({
    id: 'expired-invitation',
    email: 'expired@example.com',
    expiresAt: new Date(Date.now() - TIME_MS.THIRTY_MINUTES),
    consumedAt: null
  })
} as const;

// ===== MOCK REQUEST/FORM DATA HELPERS =====
export function createMockFormData(data: Record<string, string>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.set(key, value);
  });
  return formData;
}

export function createMockRequest(formData: FormData, url = 'http://localhost:5173') {
  return {
    formData: () => Promise.resolve(formData),
    url: new URL(url)
  };
}

// ===== COMMON ADMIN USER =====
export const mockAdmin: User = {
  id: 'admin-123',
  email: 'admin@example.com',
  role: 'admin',
  createdAt: new Date('2024-01-01T00:00:00Z')
};

// ===== DURATION OPTIONS (commonly used in forms) =====
export const commonDurationOptions = [
  { value: TWENTY_MINUTES_SECONDS, label: '20 minutes' },
  { value: THIRTY_MINUTES_SECONDS, label: '30 minutes' },
  { value: ONE_HOUR_SECONDS, label: '1 hour' },
  { value: TWO_HOURS_SECONDS, label: '2 hours' }
] as const;