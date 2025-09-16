import { test as base, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { createTestChallenge, deleteTestChallenge } from '../helpers/test-data';

// Define types for our fixtures
type TestFixtures = {
  adminPage: any;
  testChallenge: {
    title: string;
    description: string;
    languages: string;
    starterCode?: string;
    timeLimit?: string;
  };
  cleanChallenge: {
    title: string;
    create: () => Promise<void>;
    delete: () => Promise<void>;
  };
};

// Extend base test with our fixtures
export const test = base.extend<TestFixtures>({
  // Auto-login admin fixture
  adminPage: async ({ page }, use) => {
    await loginAsAdmin(page);
    await use(page);
  },

  // Test challenge data fixture
  testChallenge: async ({}, use) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const testChallenge = {
      title: `E2E Test Challenge ${timestamp}-${randomId}`,
      description: '# Test Challenge\nThis is a test challenge for e2e deletion tests.',
      languages: 'javascript,python',
      starterCode: '// Write your solution here\nfunction solve() {\n  return 42;\n}',
      timeLimit: '30'
    };
    await use(testChallenge);
  },

  // Auto-cleanup challenge fixture
  cleanChallenge: async ({ adminPage, testChallenge }, use) => {
    let challengeCreated = false;
    let challengeId: string | null = null;

    const challengeFixture = {
      title: testChallenge.title,
      id: challengeId,
      create: async () => {
        try {
          await createTestChallenge(adminPage, testChallenge);
          challengeCreated = true;
        } catch (error) {
          console.error(`Failed to create test challenge "${testChallenge.title}":`, error);
          throw error;
        }
      },
      delete: async () => {
        if (challengeCreated) {
          try {
            await deleteTestChallenge(adminPage, testChallenge.title);
            challengeCreated = false;
            challengeId = null;
          } catch (error) {
            console.error(`Failed to delete test challenge "${testChallenge.title}":`, error);
            // Don't throw here as this is cleanup
          }
        }
      }
    };

    await use(challengeFixture);

    // Cleanup after test with additional error handling
    if (challengeCreated) {
      await challengeFixture.delete();
    }
  }
});

// Export expect for convenience
export { expect } from '@playwright/test';