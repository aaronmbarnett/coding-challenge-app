import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TestCaseList from './TestCaseList.svelte';
import { mockChallengeId, mockTestCases } from '$lib/test-fixtures';

describe('TestCaseList', () => {
  it('should render empty state when no test cases', async () => {
    render(TestCaseList, {
      props: {
        testCases: [],
        challengeId: mockChallengeId
      }
    });

    const emptyMessage = page.getByText(
      'No test cases yet. Add some to validate candidate solutions.'
    );
    await expect.element(emptyMessage).toBeInTheDocument();
  });

  it('should render test cases when provided', async () => {
    render(TestCaseList, {
      props: {
        testCases: mockTestCases,
        challengeId: mockChallengeId
      }
    });

    const header = page.getByText('Test Cases (2)');
    await expect.element(header).toBeInTheDocument();

    const testCase1 = page.getByText('Test Case #1');
    await expect.element(testCase1).toBeInTheDocument();

    const testCase2 = page.getByText('Test Case #2');
    await expect.element(testCase2).toBeInTheDocument();
  });

  it('should display correct count in header', async () => {
    const singleTestCase = [mockTestCases[0]];

    render(TestCaseList, {
      props: {
        testCases: singleTestCase,
        challengeId: mockChallengeId
      }
    });

    const header = page.getByText('Test Cases (1)');
    await expect.element(header).toBeInTheDocument();
  });

  it('should render all test case types', async () => {
    render(TestCaseList, {
      props: {
        testCases: mockTestCases,
        challengeId: mockChallengeId
      }
    });

    // Check for IO test case elements
    const inputLabel = page.getByText('Input:');
    await expect.element(inputLabel).toBeInTheDocument();

    const outputLabel = page.getByText('Expected Output:');
    await expect.element(outputLabel).toBeInTheDocument();

    // Check for harness test case elements
    const harnessLabel = page.getByText('Test Harness:');
    await expect.element(harnessLabel).toBeInTheDocument();
  });
});
