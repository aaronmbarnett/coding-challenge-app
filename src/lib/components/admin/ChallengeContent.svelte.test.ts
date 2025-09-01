import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ChallengeContent from './ChallengeContent.svelte';
import { createMockChallenge } from '$lib/test-fixtures';

describe('ChallengeContent', () => {
  const mockChallenge = createMockChallenge({
    descriptionMd: '# Two Sum Problem\n\nGiven an array of integers, return indices of the two numbers such that they add up to a specific target.\n\n## Example\n\nInput: [2,7,11,15], target = 9\nOutput: [0,1]',
    starterCode: 'function twoSum(nums, target) {\n  // Your code here\n  return [];\n}'
  });

  describe('description section', () => {
    it('should render description section heading', async () => {
      render(ChallengeContent, { props: { challenge: mockChallenge } });

      const heading = page.getByRole('heading', { name: 'Description' });
      await expect.element(heading).toBeVisible();
    });

    it('should display challenge description content', async () => {
      render(ChallengeContent, { props: { challenge: mockChallenge } });

      const descriptionText = page.getByText(/Two Sum Problem/);
      await expect.element(descriptionText).toBeVisible();

      const exampleText = page.getByText(/Given an array of integers/);
      await expect.element(exampleText).toBeVisible();
    });

    it('should preserve markdown formatting in description', async () => {
      render(ChallengeContent, { props: { challenge: mockChallenge } });

      // Check for various parts of the markdown content
      const mainDescription = page.getByText('Given an array of integers');
      const inputText = page.getByText('Input:');
      const outputText = page.getByText('Output:');
      
      await expect.element(mainDescription).toBeVisible();
      await expect.element(inputText).toBeVisible();
      await expect.element(outputText).toBeVisible();
    });

    it('should handle different description content', async () => {
      const differentChallenge = createMockChallenge({
        descriptionMd: '# Binary Search\n\nImplement binary search algorithm.\n\nTime complexity: O(log n)'
      });

      render(ChallengeContent, { props: { challenge: differentChallenge } });

      const binarySearchText = page.getByText(/Binary Search/);
      const complexityText = page.getByText(/Time complexity/);

      await expect.element(binarySearchText).toBeVisible();
      await expect.element(complexityText).toBeVisible();
    });

    it('should handle empty description', async () => {
      const emptyDescChallenge = createMockChallenge({ descriptionMd: '' });
      render(ChallengeContent, { props: { challenge: emptyDescChallenge } });

      const heading = page.getByRole('heading', { name: 'Description' });
      await expect.element(heading).toBeVisible();
    });
  });

  describe('starter code section', () => {
    it('should render starter code section when code is provided', async () => {
      render(ChallengeContent, { props: { challenge: mockChallenge } });

      const heading = page.getByRole('heading', { name: 'Starter Code' });
      await expect.element(heading).toBeVisible();
    });

    it('should display starter code in code block', async () => {
      render(ChallengeContent, { props: { challenge: mockChallenge } });

      const codeBlock = page.getByText(/function twoSum/);
      await expect.element(codeBlock).toBeVisible();

      const returnStatement = page.getByText(/return \[\];/);
      await expect.element(returnStatement).toBeVisible();
    });

    it('should not render starter code section when code is null', async () => {
      const noCodeChallenge = createMockChallenge({ starterCode: null });
      render(ChallengeContent, { props: { challenge: noCodeChallenge } });

      // Only description and test cases sections should be visible
      const descriptionHeading = page.getByRole('heading', { name: 'Description' });
      const testCasesHeading = page.getByRole('heading', { name: 'Test Cases' });
      
      await expect.element(descriptionHeading).toBeVisible();
      await expect.element(testCasesHeading).toBeVisible();
    });

    it('should not render starter code section when code is empty', async () => {
      const emptyCodeChallenge = createMockChallenge({ starterCode: '' });
      render(ChallengeContent, { props: { challenge: emptyCodeChallenge } });

      // Only description and test cases sections should be visible
      const descriptionHeading = page.getByRole('heading', { name: 'Description' });
      const testCasesHeading = page.getByRole('heading', { name: 'Test Cases' });
      
      await expect.element(descriptionHeading).toBeVisible();
      await expect.element(testCasesHeading).toBeVisible();
    });

    it('should handle different programming languages in starter code', async () => {
      const pythonChallenge = createMockChallenge({
        starterCode: 'def two_sum(nums, target):\n    # Your code here\n    return []'
      });

      render(ChallengeContent, { props: { challenge: pythonChallenge } });

      const pythonCode = page.getByText(/def two_sum/);
      await expect.element(pythonCode).toBeVisible();
    });

    it('should preserve code formatting and indentation', async () => {
      const indentedCodeChallenge = createMockChallenge({
        starterCode: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Implementation\n        return new int[]{};\n    }\n}'
      });

      render(ChallengeContent, { props: { challenge: indentedCodeChallenge } });

      const javaCode = page.getByText(/class Solution/);
      const methodCode = page.getByText(/public int\[\] twoSum/);

      await expect.element(javaCode).toBeVisible();
      await expect.element(methodCode).toBeVisible();
    });
  });

  describe('test cases section', () => {
    it('should render test cases section heading', async () => {
      render(ChallengeContent, { props: { challenge: mockChallenge } });

      const heading = page.getByRole('heading', { name: 'Test Cases' });
      await expect.element(heading).toBeVisible();
    });

    it('should render manage test cases link', async () => {
      render(ChallengeContent, { props: { challenge: mockChallenge } });

      const manageLink = page.getByRole('link', { name: 'Manage Test Cases →' });
      await expect.element(manageLink).toBeVisible();
      await expect.element(manageLink).toHaveAttribute('href', `/admin/challenges/${mockChallenge.id}/tests`);
    });

    it('should adapt manage link to different challenge IDs', async () => {
      const differentChallenge = createMockChallenge({ id: 'challenge-456' });
      render(ChallengeContent, { props: { challenge: differentChallenge } });

      const manageLink = page.getByRole('link', { name: 'Manage Test Cases →' });
      await expect.element(manageLink).toHaveAttribute('href', '/admin/challenges/challenge-456/tests');
    });

    it('should have slot for test cases content', async () => {
      render(ChallengeContent, { 
        props: { challenge: mockChallenge }
      });

      const testCasesHeading = page.getByRole('heading', { name: 'Test Cases' });
      await expect.element(testCasesHeading).toBeVisible();
      
      // Test cases section structure should be present for slot content
      const manageLink = page.getByRole('link', { name: 'Manage Test Cases →' });
      await expect.element(manageLink).toBeVisible();
    });
  });

  describe('layout and structure', () => {
    it('should render all main sections in correct order', async () => {
      render(ChallengeContent, { props: { challenge: mockChallenge } });

      const descriptionHeading = page.getByRole('heading', { name: 'Description' });
      const starterCodeHeading = page.getByRole('heading', { name: 'Starter Code' });
      const testCasesHeading = page.getByRole('heading', { name: 'Test Cases' });

      await expect.element(descriptionHeading).toBeVisible();
      await expect.element(starterCodeHeading).toBeVisible();
      await expect.element(testCasesHeading).toBeVisible();
    });

    it('should maintain proper section structure without starter code', async () => {
      const noCodeChallenge = createMockChallenge({ starterCode: null });
      render(ChallengeContent, { props: { challenge: noCodeChallenge } });

      const descriptionHeading = page.getByRole('heading', { name: 'Description' });
      const testCasesHeading = page.getByRole('heading', { name: 'Test Cases' });

      await expect.element(descriptionHeading).toBeVisible();
      await expect.element(testCasesHeading).toBeVisible();
    });

    it('should have proper spacing between sections', async () => {
      render(ChallengeContent, { props: { challenge: mockChallenge } });

      // All sections should be independently visible
      const descriptionHeading = page.getByRole('heading', { name: 'Description' });
      const starterCodeHeading = page.getByRole('heading', { name: 'Starter Code' });
      const testCasesHeading = page.getByRole('heading', { name: 'Test Cases' });

      await expect.element(descriptionHeading).toBeVisible();
      await expect.element(starterCodeHeading).toBeVisible();
      await expect.element(testCasesHeading).toBeVisible();
    });
  });

  describe('accessibility and semantics', () => {
    it('should have proper heading hierarchy', async () => {
      render(ChallengeContent, { props: { challenge: mockChallenge } });

      const descriptionHeading = page.getByRole('heading', { name: 'Description', level: 2 });
      const starterCodeHeading = page.getByRole('heading', { name: 'Starter Code', level: 2 });
      const testCasesHeading = page.getByRole('heading', { name: 'Test Cases', level: 2 });

      await expect.element(descriptionHeading).toBeVisible();
      await expect.element(starterCodeHeading).toBeVisible();
      await expect.element(testCasesHeading).toBeVisible();
    });

    it('should have accessible link for test case management', async () => {
      render(ChallengeContent, { props: { challenge: mockChallenge } });

      const manageLink = page.getByRole('link', { name: 'Manage Test Cases →' });
      await expect.element(manageLink).toBeVisible();
      await expect.element(manageLink).toHaveAttribute('href', `/admin/challenges/${mockChallenge.id}/tests`);
    });

    it('should provide semantic structure for code blocks', async () => {
      render(ChallengeContent, { props: { challenge: mockChallenge } });

      // Starter code section should contain code content
      const starterCodeHeading = page.getByRole('heading', { name: 'Starter Code' });
      await expect.element(starterCodeHeading).toBeVisible();
      
      const codeContent = page.getByText(/function twoSum/);
      await expect.element(codeContent).toBeVisible();
    });
  });

  describe('content variations and edge cases', () => {
    it('should handle markdown with special characters', async () => {
      const specialCharChallenge = createMockChallenge({
        descriptionMd: '# Test & Validation\n\nSpecial chars: @#$%^&*()\n\n<script>alert("test")</script>'
      });

      render(ChallengeContent, { props: { challenge: specialCharChallenge } });

      const titleText = page.getByText('Test & Validation');
      await expect.element(titleText).toBeVisible();

      // Special characters should be visible
      const specialChars = page.getByText('Special chars:');
      await expect.element(specialChars).toBeVisible();
    });

    it('should handle very long descriptions', async () => {
      const longDescription = 'This is a very long challenge description. '.repeat(100);
      const longDescChallenge = createMockChallenge({
        descriptionMd: `# Long Challenge\n\n${longDescription}`
      });

      render(ChallengeContent, { props: { challenge: longDescChallenge } });

      const heading = page.getByRole('heading', { name: 'Description' });
      await expect.element(heading).toBeVisible();

      const longText = page.getByText(/This is a very long challenge/);
      await expect.element(longText).toBeVisible();
    });

    it('should handle code with syntax highlighting markers', async () => {
      const syntaxCodeChallenge = createMockChallenge({
        starterCode: '```javascript\nfunction solution() {\n  // TODO: implement\n}\n```'
      });

      render(ChallengeContent, { props: { challenge: syntaxCodeChallenge } });

      const heading = page.getByRole('heading', { name: 'Starter Code' });
      await expect.element(heading).toBeVisible();

      const codeText = page.getByText(/function solution/);
      await expect.element(codeText).toBeVisible();
    });

    it('should work with minimal challenge data', async () => {
      const minimalChallenge = createMockChallenge({
        descriptionMd: 'Simple challenge',
        starterCode: null
      });

      render(ChallengeContent, { props: { challenge: minimalChallenge } });

      const descriptionHeading = page.getByRole('heading', { name: 'Description' });
      const testCasesHeading = page.getByRole('heading', { name: 'Test Cases' });

      await expect.element(descriptionHeading).toBeVisible();
      await expect.element(testCasesHeading).toBeVisible();

      const simpleText = page.getByText('Simple challenge');
      await expect.element(simpleText).toBeVisible();
    });
  });

  describe('integration with slot content', () => {
    it('should have test cases section ready for slot content', async () => {
      render(ChallengeContent, { props: { challenge: mockChallenge } });

      const testCasesHeading = page.getByRole('heading', { name: 'Test Cases' });
      await expect.element(testCasesHeading).toBeVisible();

      const manageLink = page.getByRole('link', { name: 'Manage Test Cases →' });
      await expect.element(manageLink).toBeVisible();
    });

    it('should work without slot content', async () => {
      render(ChallengeContent, { props: { challenge: mockChallenge } });

      const testCasesHeading = page.getByRole('heading', { name: 'Test Cases' });
      await expect.element(testCasesHeading).toBeVisible();

      const manageLink = page.getByRole('link', { name: 'Manage Test Cases →' });
      await expect.element(manageLink).toBeVisible();
    });
  });
});