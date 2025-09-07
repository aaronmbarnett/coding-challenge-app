import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TestCasesPreview from './TestCasesPreview.svelte';
import { mockChallengeId, mockTestCases } from '$lib/test-fixtures';

describe('TestCasesPreview', () => {
  it('should render empty state when no test cases', async () => {
    render(TestCasesPreview, {
      props: {
        testCases: [],
        challengeId: mockChallengeId
      }
    });

    const emptyMessage = page.getByText('No test cases yet.');
    await expect.element(emptyMessage).toBeInTheDocument();

    const addLink = page.getByText('Add some');
    await expect.element(addLink).toBeInTheDocument();
    await expect
      .element(addLink)
      .toHaveAttribute('href', `/admin/challenges/${mockChallengeId}/tests`);
  });

  it('should render preview of test cases', async () => {
    render(TestCasesPreview, {
      props: {
        testCases: mockTestCases,
        challengeId: mockChallengeId
      }
    });

    const testCase1 = page.getByText('Test Case 1');
    await expect.element(testCase1).toBeInTheDocument();

    const testCase2 = page.getByText('Test Case 2');
    await expect.element(testCase2).toBeInTheDocument();
  });

  it('should show test case metadata', async () => {
    render(TestCasesPreview, {
      props: {
        testCases: mockTestCases,
        challengeId: mockChallengeId
      }
    });

    // Check IO test case metadata
    const ioType = page.getByText('io');
    await expect.element(ioType).toBeInTheDocument();

    const weight1 = page.getByText('Weight: 1');
    await expect.element(weight1).toBeInTheDocument();

    // Check harness test case metadata (look for the specific metadata instance)
    const harnessType = page.getByText('harness').first();
    await expect.element(harnessType).toBeInTheDocument();

    const weight2 = page.getByText('Weight: 2');
    await expect.element(weight2).toBeInTheDocument();

    const hiddenBadge = page.getByText('Hidden');
    await expect.element(hiddenBadge).toBeInTheDocument();
  });

  it('should show IO test case input and expected output', async () => {
    render(TestCasesPreview, {
      props: {
        testCases: mockTestCases,
        challengeId: mockChallengeId
      }
    });

    const inputLabel = page.getByText('Input:');
    await expect.element(inputLabel).toBeInTheDocument();

    const inputValue = page.getByText('[1, 2, 3]');
    await expect.element(inputValue).toBeInTheDocument();

    const expectedLabel = page.getByText('Expected:');
    await expect.element(expectedLabel).toBeInTheDocument();

    // Find the expected output specifically in the IO test case context
    const expectedValue = page.getByText('6', { exact: true });
    await expect.element(expectedValue).toBeInTheDocument();
  });

  it('should show harness test case code', async () => {
    render(TestCasesPreview, {
      props: {
        testCases: mockTestCases,
        challengeId: mockChallengeId
      }
    });

    const harnessLabel = page.getByText('Harness:');
    await expect.element(harnessLabel).toBeInTheDocument();

    const harnessCode = page.getByText('assert(sum([1,2,3]) === 6);');
    await expect.element(harnessCode).toBeInTheDocument();
  });

  it('should show summary and manage link', async () => {
    render(TestCasesPreview, {
      props: {
        testCases: mockTestCases,
        challengeId: mockChallengeId
      }
    });

    const summary = page.getByText('2 test cases total');
    await expect.element(summary).toBeInTheDocument();

    const manageLink = page.getByText('Manage all test cases →');
    await expect.element(manageLink).toBeInTheDocument();
    await expect
      .element(manageLink)
      .toHaveAttribute('href', `/admin/challenges/${mockChallengeId}/tests`);
  });

  it('should handle singular vs plural correctly', async () => {
    const singleTestCase = [mockTestCases[0]];

    render(TestCasesPreview, {
      props: {
        testCases: singleTestCase,
        challengeId: mockChallengeId
      }
    });

    const summary = page.getByText('1 test case total');
    await expect.element(summary).toBeInTheDocument();
  });
});
