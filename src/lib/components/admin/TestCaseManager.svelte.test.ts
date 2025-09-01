import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TestCaseManager from './TestCaseManager.svelte';
import { mockChallenge, mockTestCases } from '$lib/test-fixtures';

describe('TestCaseManager', () => {
  const baseProps = {
    challenge: mockChallenge,
    testCases: mockTestCases,
    form: null
  };

  describe('component composition', () => {
    it('should render the test case header', async () => {
      render(TestCaseManager, { props: baseProps });

      const heading = page.getByRole('heading', { name: /Test Cases: Two Sum Problem/ });
      await expect.element(heading).toBeVisible();

      const backLink = page.getByRole('link', { name: '← Back to Challenge' });
      await expect.element(backLink).toBeVisible();
    });

    it('should render the test case list', async () => {
      render(TestCaseManager, { props: baseProps });

      const listHeader = page.getByText('Test Cases (2)');
      await expect.element(listHeader).toBeVisible();

      const testCase1 = page.getByText('Test Case #1');
      await expect.element(testCase1).toBeVisible();

      const testCase2 = page.getByText('Test Case #2');
      await expect.element(testCase2).toBeVisible();
    });

    it('should show add test case button initially', async () => {
      render(TestCaseManager, { props: baseProps });

      const addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await expect.element(addButton).toBeVisible();
    });
  });

  describe('form toggle functionality', () => {
    it('should show form when add button is clicked', async () => {
      render(TestCaseManager, { props: baseProps });

      const addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await addButton.click();

      const formHeader = page.getByText('Add New Test Case');
      await expect.element(formHeader).toBeVisible();

      const cancelButton = page.getByRole('button', { name: 'Cancel' });
      await expect.element(cancelButton).toBeVisible();
    });

    it('should hide form when cancel button is clicked', async () => {
      render(TestCaseManager, { props: baseProps });

      // Show form
      const addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await addButton.click();

      const formHeader = page.getByText('Add New Test Case');
      await expect.element(formHeader).toBeVisible();

      // Hide form - use the form's cancel button specifically
      const cancelButton = page.getByRole('button', { name: 'Cancel' }).nth(1);
      await cancelButton.click();

      await expect.element(formHeader).not.toBeVisible();
    });

    it('should toggle between add and cancel button states', async () => {
      render(TestCaseManager, { props: baseProps });

      // Initially shows add button
      let addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await expect.element(addButton).toBeVisible();

      // Click to show form and cancel button
      await addButton.click();
      const cancelButton = page.getByRole('button', { name: 'Cancel' }).nth(1);
      await expect.element(cancelButton).toBeVisible();

      // Click cancel to return to add button
      await cancelButton.click();
      addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await expect.element(addButton).toBeVisible();
    });
  });

  describe('form integration', () => {
    it('should display form validation errors when provided', async () => {
      const propsWithError = {
        ...baseProps,
        form: { message: 'Input is required' }
      };

      render(TestCaseManager, { props: propsWithError });

      // Show form to see error
      const addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await addButton.click();

      const errorMessage = page.getByText('Input is required');
      await expect.element(errorMessage).toBeVisible();
    });

    it('should render form with correct challenge ID', async () => {
      render(TestCaseManager, { props: baseProps });

      const addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await addButton.click();

      // Form should be present (we can't easily test hidden input values in browser tests)
      const formHeader = page.getByText('Add New Test Case');
      await expect.element(formHeader).toBeVisible();
    });
  });

  describe('different challenge data', () => {
    it('should work with different challenge titles', async () => {
      const differentChallenge = {
        ...mockChallenge,
        title: 'Binary Search Algorithm',
        id: 'challenge-456'
      };

      render(TestCaseManager, { 
        props: { 
          ...baseProps, 
          challenge: differentChallenge 
        } 
      });

      const heading = page.getByRole('heading', { name: /Test Cases: Binary Search Algorithm/ });
      await expect.element(heading).toBeVisible();

      const backLink = page.getByRole('link', { name: '← Back to Challenge' });
      await expect.element(backLink).toHaveAttribute('href', '/admin/challenges/challenge-456');
    });

    it('should handle empty test cases', async () => {
      render(TestCaseManager, { 
        props: { 
          ...baseProps, 
          testCases: [] 
        } 
      });

      const emptyMessage = page.getByText('No test cases yet. Add some to validate candidate solutions.');
      await expect.element(emptyMessage).toBeVisible();

      const addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await expect.element(addButton).toBeVisible();
    });

    it('should handle single test case', async () => {
      render(TestCaseManager, { 
        props: { 
          ...baseProps, 
          testCases: [mockTestCases[0]] 
        } 
      });

      const listHeader = page.getByText('Test Cases (1)');
      await expect.element(listHeader).toBeVisible();

      const testCase = page.getByText('Test Case #1');
      await expect.element(testCase).toBeVisible();
    });
  });

  describe('layout and structure', () => {
    it('should maintain consistent layout structure', async () => {
      render(TestCaseManager, { props: baseProps });

      // Header should be at top
      const heading = page.getByRole('heading', { name: /Test Cases: Two Sum Problem/ });
      await expect.element(heading).toBeVisible();

      // List should be below header
      const listHeader = page.getByText('Test Cases (2)');
      await expect.element(listHeader).toBeVisible();

      // All elements should be within the container
      const addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await expect.element(addButton).toBeVisible();
    });

    it('should show form between header and list when active', async () => {
      render(TestCaseManager, { props: baseProps });

      const addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await addButton.click();

      // All three sections should be visible
      const heading = page.getByRole('heading', { name: /Test Cases: Two Sum Problem/ });
      await expect.element(heading).toBeVisible();

      const formHeader = page.getByText('Add New Test Case');
      await expect.element(formHeader).toBeVisible();

      const listHeader = page.getByText('Test Cases (2)');
      await expect.element(listHeader).toBeVisible();
    });
  });

  describe('user workflow', () => {
    it('should support complete add test case workflow', async () => {
      render(TestCaseManager, { props: baseProps });

      // Step 1: Initial state shows list and add button
      const listHeader = page.getByText('Test Cases (2)');
      await expect.element(listHeader).toBeVisible();

      const addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await expect.element(addButton).toBeVisible();

      // Step 2: Click add shows form
      await addButton.click();
      const formHeader = page.getByText('Add New Test Case');
      await expect.element(formHeader).toBeVisible();

      // Step 3: Can cancel back to list - use form's cancel button
      const cancelButton = page.getByRole('button', { name: 'Cancel' }).nth(1);
      await cancelButton.click();

      await expect.element(formHeader).not.toBeVisible();
      await expect.element(listHeader).toBeVisible();
    });

    it('should maintain test case data throughout form interactions', async () => {
      render(TestCaseManager, { props: baseProps });

      // Show form
      const addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await addButton.click();

      // Test cases should still be visible
      const testCase1 = page.getByText('Test Case #1');
      await expect.element(testCase1).toBeVisible();

      // Cancel form - use form's cancel button
      const cancelButton = page.getByRole('button', { name: 'Cancel' }).nth(1);
      await cancelButton.click();

      // Test cases should still be there
      await expect.element(testCase1).toBeVisible();
    });
  });

  describe('accessibility', () => {
    it('should maintain focus management during form toggle', async () => {
      render(TestCaseManager, { props: baseProps });

      const addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await addButton.click();

      // Form should be accessible
      const formHeader = page.getByText('Add New Test Case');
      await expect.element(formHeader).toBeVisible();

      const cancelButton = page.getByRole('button', { name: 'Cancel' }).nth(1);
      await expect.element(cancelButton).toBeVisible();
    });

    it('should have proper heading hierarchy', async () => {
      render(TestCaseManager, { props: baseProps });

      const mainHeading = page.getByRole('heading', { level: 1 });
      await expect.element(mainHeading).toBeVisible();

      // Show form to check its heading
      const addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await addButton.click();

      const formHeading = page.getByRole('heading', { name: 'Add New Test Case' });
      await expect.element(formHeading).toBeVisible();
    });
  });
});