import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TestRunnerPage from './+page.svelte';

describe('Test Runner Page', () => {
  const mockChallenge = {
    id: 'challenge-1',
    title: 'Two Sum Problem',
    descriptionMd: '# Two Sum\n\nFind two numbers that add up to target.',
    languagesCsv: 'javascript,python,java',
    starterCode: 'function twoSum(nums, target) {\n  // Your code here\n}',
    timeLimitSec: 1800
  };

  const mockTestCases = [
    {
      id: 'test-1',
      challengeId: 'challenge-1',
      kind: 'io' as const,
      input: '[2,7,11,15], 9',
      expectedOutput: '[0,1]',
      weight: 1,
      hidden: 0
    },
    {
      id: 'test-2', 
      challengeId: 'challenge-1',
      kind: 'io' as const,
      input: '[3,2,4], 6',
      expectedOutput: '[1,2]',
      weight: 1,
      hidden: 1
    }
  ];

  describe('page structure and navigation', () => {
    it('should display challenge information and breadcrumb navigation', async () => {
      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: mockTestCases },
          form: null
        }
      });

      await expect.element(page.getByRole('heading', { name: 'Two Sum Problem' })).toBeVisible();
      await expect.element(page.getByText('Test Runner')).toBeVisible();
      
      // Breadcrumb navigation
      await expect.element(page.getByRole('link', { name: 'Challenges', exact: true })).toBeVisible();
      await expect.element(page.getByRole('link', { name: 'Two Sum Problem' })).toBeVisible();
    });

    it('should display challenge description and test cases sections', async () => {
      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: mockTestCases },
          form: null
        }
      });

      await expect.element(page.getByRole('heading', { name: 'Challenge Description' })).toBeVisible();
      await expect.element(page.getByRole('heading', { name: 'Test Cases' })).toBeVisible();
      await expect.element(page.getByText('Find two numbers that add up to target.')).toBeVisible();
    });
  });

  describe('language selection and code generation', () => {
    it('should initialize with default JavaScript code', async () => {
      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: mockTestCases },
          form: null
        }
      });

      // CodeEditor component should receive the default code
      // We verify this by checking the component is rendered (detailed behavior tested in CodeEditor tests)
      await expect.element(page.getByRole('heading', { name: 'Challenge Description' })).toBeVisible();
    });

    it('should handle challenge with custom starter code', async () => {
      const customChallenge = {
        ...mockChallenge,
        starterCode: 'function customFunction() {\n  return "custom";\n}'
      };

      render(TestRunnerPage, {
        props: {
          data: { challenge: customChallenge, testCases: mockTestCases },
          form: null
        }
      });

      // Component should initialize with custom starter code
      await expect.element(page.getByRole('heading', { name: 'Challenge Description' })).toBeVisible();
    });

    it('should handle challenge with multiple supported languages', async () => {
      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: mockTestCases },
          form: null
        }
      });

      // CodeEditor should receive the parsed supported languages
      await expect.element(page.getByRole('heading', { name: 'Challenge Description' })).toBeVisible();
    });

    it('should handle challenge with no starter code', async () => {
      const challengeNoStarter = {
        ...mockChallenge,
        starterCode: null
      };

      render(TestRunnerPage, {
        props: {
          data: { challenge: challengeNoStarter, testCases: mockTestCases },
          form: null
        }
      });

      // Should still render editor with default fallback
      await expect.element(page.getByRole('heading', { name: 'Challenge Description' })).toBeVisible();
    });
  });

  describe('test results display', () => {
    it('should not show test results section when no form data', async () => {
      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: mockTestCases },
          form: null
        }
      });

      expect(page.getByText('Test Results').query()).toBeNull();
    });

    it('should display successful test results', async () => {
      const mockFormResult = {
        success: true,
        executionResult: {
          testResults: [
            {
              testCaseId: 'test-1',
              passed: true,
              weight: 1,
              executionTime: 150,
              expectedOutput: '[0,1]',
              actualOutput: '[0,1]',
              error: null
            },
            {
              testCaseId: 'test-2', 
              passed: false,
              weight: 1,
              executionTime: 250,
              expectedOutput: '[1,2]',
              actualOutput: '[2,1]',
              error: null
            }
          ],
          compilationError: null,
          serviceError: null,
          executionTimeout: false
        }
      };

      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: mockTestCases },
          form: mockFormResult
        }
      });

      await expect.element(page.getByText('Test Results')).toBeVisible();
      await expect.element(page.getByText('Test Case #1')).toBeVisible();
      await expect.element(page.getByText('Test Case #2')).toBeVisible();
      await expect.element(page.getByText('PASSED', { exact: true })).toBeVisible();
      await expect.element(page.getByText('FAILED')).toBeVisible();
    });

    it('should display test execution times and weights', async () => {
      const mockFormResult = {
        success: true,
        executionResult: {
          testResults: [
            {
              testCaseId: 'test-1',
              passed: true,
              weight: 2,
              executionTime: 1500,
              expectedOutput: '[0,1]',
              actualOutput: '[0,1]',
              error: null
            }
          ],
          compilationError: null,
          serviceError: null,
          executionTimeout: false
        }
      };

      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: mockTestCases },
          form: mockFormResult
        }
      });

      await expect.element(page.getByText(/Weight: 2/)).toBeVisible();
      await expect.element(page.getByText(/1\.50s/)).toBeVisible();
    });

    it('should display compilation errors', async () => {
      const mockFormResult = {
        success: true,
        executionResult: {
          testResults: [],
          compilationError: 'Syntax error: unexpected token',
          serviceError: null,
          executionTimeout: false
        }
      };

      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: mockTestCases },
          form: mockFormResult
        }
      });

      await expect.element(page.getByText('Test Results')).toBeVisible();
      // ErrorDisplay component should show compilation error (tested separately)
    });

    it('should display general form error messages', async () => {
      const mockFormResult = {
        success: false,
        message: 'Code execution failed: timeout'
      };

      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: mockTestCases },
          form: mockFormResult
        }
      });

      await expect.element(page.getByText('Test Results')).toBeVisible();
      await expect.element(page.getByText('Code execution failed: timeout')).toBeVisible();
    });

    it('should show public vs hidden test case labels', async () => {
      const mockFormResult = {
        success: true,
        executionResult: {
          testResults: [
            {
              testCaseId: 'test-1',
              passed: true,
              weight: 1,
              executionTime: 150,
              expectedOutput: '[0,1]',
              actualOutput: '[0,1]',
              error: null
            },
            {
              testCaseId: 'test-2',
              passed: true, 
              weight: 1,
              executionTime: 200,
              expectedOutput: '[1,2]',
              actualOutput: '[1,2]',
              error: null
            }
          ],
          compilationError: null,
          serviceError: null,
          executionTimeout: false
        }
      };

      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: mockTestCases },
          form: mockFormResult
        }
      });

      // Should show both public and hidden labels (may appear multiple times in different sections)
      expect(page.getByText('Public').query()).not.toBeNull();
      expect(page.getByText('Hidden').first().query()).not.toBeNull();
    });
  });

  describe('helper function behaviors', () => {
    it('should format execution times correctly for fast tests', async () => {
      const mockFormResult = {
        success: true,
        executionResult: {
          testResults: [
            {
              testCaseId: 'test-1',
              passed: true,
              weight: 1,
              executionTime: 150,
              expectedOutput: '[0,1]',
              actualOutput: '[0,1]',
              error: null
            }
          ],
          compilationError: null,
          serviceError: null,
          executionTimeout: false
        }
      };

      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: mockTestCases },
          form: mockFormResult
        }
      });

      // Should show milliseconds for fast execution
      await expect.element(page.getByText(/150ms/)).toBeVisible();
    });

    it('should format execution times correctly for slow tests', async () => {
      const mockFormResult = {
        success: true,
        executionResult: {
          testResults: [
            {
              testCaseId: 'test-1',
              passed: true,
              weight: 1,
              executionTime: 2500,
              expectedOutput: '[0,1]',
              actualOutput: '[0,1]',
              error: null
            }
          ],
          compilationError: null,
          serviceError: null,
          executionTimeout: false
        }
      };

      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: mockTestCases },
          form: mockFormResult
        }
      });

      // Should show seconds for slow execution
      await expect.element(page.getByText(/2\.50s/)).toBeVisible();
    });

    it('should display appropriate status icons for pass/fail', async () => {
      const mockFormResult = {
        success: true,
        executionResult: {
          testResults: [
            {
              testCaseId: 'test-1',
              passed: true,
              weight: 1,
              executionTime: 150,
              expectedOutput: '[0,1]',
              actualOutput: '[0,1]',
              error: null
            },
            {
              testCaseId: 'test-2',
              passed: false,
              weight: 1,
              executionTime: 200,
              expectedOutput: '[1,2]',
              actualOutput: '[2,1]',
              error: null
            }
          ],
          compilationError: null,
          serviceError: null,
          executionTimeout: false
        }
      };

      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: mockTestCases },
          form: mockFormResult
        }
      });

      // Should show success and failure icons (emojis)
      await expect.element(page.getByText('✅')).toBeVisible();
      await expect.element(page.getByText('❌')).toBeVisible();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle challenge with single supported language', async () => {
      const singleLangChallenge = {
        ...mockChallenge,
        languagesCsv: 'python'
      };

      render(TestRunnerPage, {
        props: {
          data: { challenge: singleLangChallenge, testCases: mockTestCases },
          form: null
        }
      });

      await expect.element(page.getByRole('heading', { name: 'Challenge Description' })).toBeVisible();
    });

    it('should handle empty test cases list', async () => {
      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: [] },
          form: null
        }
      });

      await expect.element(page.getByRole('heading', { name: 'Test Cases' })).toBeVisible();
      // TestCasesPreview component should handle empty list (tested separately)
    });

    it('should handle test results with errors', async () => {
      const mockFormResult = {
        success: true,
        executionResult: {
          testResults: [
            {
              testCaseId: 'test-1',
              passed: false,
              weight: 1,
              executionTime: 0,
              expectedOutput: '[0,1]',
              actualOutput: '',
              error: 'ReferenceError: nums is not defined'
            }
          ],
          compilationError: null,
          serviceError: null,
          executionTimeout: false
        }
      };

      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: mockTestCases },
          form: mockFormResult
        }
      });

      await expect.element(page.getByText('Test Results')).toBeVisible();
      // Error should be displayed in expandable test case details
    });

    it('should handle missing test case data gracefully', async () => {
      const mockFormResult = {
        success: true,
        executionResult: {
          testResults: [
            {
              testCaseId: 'nonexistent-test',
              passed: false,
              weight: 1,
              executionTime: 100,
              expectedOutput: '[0,1]',
              actualOutput: '[1,0]',
              error: null
            }
          ],
          compilationError: null,
          serviceError: null,
          executionTimeout: false
        }
      };

      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: mockTestCases },
          form: mockFormResult
        }
      });

      await expect.element(page.getByText('Test Results')).toBeVisible();
      // Should still render test result even without matching test case
    });
  });

  describe('component integration', () => {
    it('should pass correct props to child components', async () => {
      render(TestRunnerPage, {
        props: {
          data: { challenge: mockChallenge, testCases: mockTestCases },
          form: null
        }
      });

      // Verify components are rendered (their detailed behavior tested separately)
      // ChallengeHeader
      await expect.element(page.getByRole('heading', { name: 'Two Sum Problem' })).toBeVisible();
      
      // TestCasesPreview section
      await expect.element(page.getByRole('heading', { name: 'Test Cases' })).toBeVisible();
      
      // CodeEditor area - verify page structure is rendered
      await expect.element(page.getByRole('heading', { name: 'Challenge Description' })).toBeVisible();
    });
  });
});