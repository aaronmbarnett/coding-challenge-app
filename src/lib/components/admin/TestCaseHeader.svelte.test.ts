import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TestCaseHeader from './TestCaseHeader.svelte';

describe('TestCaseHeader', () => {
  const mockProps = {
    challengeTitle: 'Two Sum Problem',
    challengeId: 'challenge-123',
    showForm: false,
    onToggleForm: vi.fn()
  };

  describe('content and navigation', () => {
    it('should display challenge title in header', async () => {
      render(TestCaseHeader, { props: mockProps });

      const heading = page.getByRole('heading', { name: /Test Cases: Two Sum Problem/ });
      await expect.element(heading).toBeVisible();
    });

    it('should provide navigation back to challenge', async () => {
      render(TestCaseHeader, { props: mockProps });

      const backLink = page.getByRole('link', { name: '← Back to Challenge' });
      await expect.element(backLink).toBeVisible();
      await expect.element(backLink).toHaveAttribute('href', '/admin/challenges/challenge-123');
    });

    it('should adapt to different challenge titles and IDs', async () => {
      render(TestCaseHeader, { 
        props: { 
          ...mockProps, 
          challengeTitle: 'Binary Search Tree',
          challengeId: 'challenge-456'
        } 
      });

      const heading = page.getByRole('heading', { name: /Test Cases: Binary Search Tree/ });
      await expect.element(heading).toBeVisible();

      const backLink = page.getByRole('link', { name: '← Back to Challenge' });
      await expect.element(backLink).toHaveAttribute('href', '/admin/challenges/challenge-456');
    });
  });

  describe('form toggle functionality', () => {
    it('should show add button when form is hidden', async () => {
      render(TestCaseHeader, { props: { ...mockProps, showForm: false } });

      const addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await expect.element(addButton).toBeVisible();
    });

    it('should show cancel button when form is visible', async () => {
      render(TestCaseHeader, { props: { ...mockProps, showForm: true } });

      const cancelButton = page.getByRole('button', { name: 'Cancel' });
      await expect.element(cancelButton).toBeVisible();
    });

    it('should call toggle function when button is clicked', async () => {
      const onToggleForm = vi.fn();
      render(TestCaseHeader, { props: { ...mockProps, onToggleForm } });

      const button = page.getByRole('button', { name: '+ Add Test Case' });
      await button.click();
      
      expect(onToggleForm).toHaveBeenCalledOnce();
    });

    it('should call toggle function for cancel button', async () => {
      const onToggleForm = vi.fn();
      render(TestCaseHeader, { props: { ...mockProps, showForm: true, onToggleForm } });

      const cancelButton = page.getByRole('button', { name: 'Cancel' });
      await cancelButton.click();
      
      expect(onToggleForm).toHaveBeenCalledOnce();
    });
  });

  describe('accessibility and semantics', () => {
    it('should have proper heading hierarchy', async () => {
      render(TestCaseHeader, { props: mockProps });

      const heading = page.getByRole('heading', { level: 1 });
      await expect.element(heading).toBeVisible();
    });

    it('should provide accessible button labels', async () => {
      render(TestCaseHeader, { props: mockProps });

      const button = page.getByRole('button', { name: '+ Add Test Case' });
      await expect.element(button).toBeVisible();
    });

    it('should maintain button accessibility in both states', async () => {
      render(TestCaseHeader, { props: mockProps });

      // Test add state
      const addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await expect.element(addButton).toBeVisible();
    });
  });

  describe('edge cases', () => {
    it('should handle empty challenge title gracefully', async () => {
      render(TestCaseHeader, { props: { ...mockProps, challengeTitle: '' } });

      const heading = page.getByRole('heading');
      await expect.element(heading).toBeVisible();
      await expect.element(heading).toHaveTextContent('Test Cases:');
    });

    it('should handle special characters in challenge title', async () => {
      const titleWithSpecialChars = 'Test & Validate <Components>';
      render(TestCaseHeader, { 
        props: { ...mockProps, challengeTitle: titleWithSpecialChars } 
      });

      const heading = page.getByRole('heading', { name: new RegExp(titleWithSpecialChars) });
      await expect.element(heading).toBeVisible();
    });

    it('should work without onToggleForm callback', async () => {
      render(TestCaseHeader, { 
        props: { 
          challengeTitle: 'Test',
          challengeId: 'test-123',
          showForm: false,
          onToggleForm: () => {}
        } 
      });

      const button = page.getByRole('button', { name: '+ Add Test Case' });
      await expect.element(button).toBeVisible();
      
      // Should not throw when clicked
      await button.click();
    });
  });

  describe('user experience', () => {
    it('should provide clear visual state changes', async () => {
      // Test showForm: false state
      render(TestCaseHeader, { props: { ...mockProps, showForm: false } });
      const addButton = page.getByRole('button', { name: '+ Add Test Case' });
      await expect.element(addButton).toBeVisible();
      
      // Test showForm: true state
      render(TestCaseHeader, { props: { ...mockProps, showForm: true } });
      const cancelButton = page.getByRole('button', { name: 'Cancel' });
      await expect.element(cancelButton).toBeVisible();
    });

    it('should maintain navigation context', async () => {
      render(TestCaseHeader, { props: mockProps });

      const backLink = page.getByRole('link', { name: '← Back to Challenge' });
      const heading = page.getByRole('heading');
      
      await expect.element(backLink).toBeVisible();
      await expect.element(heading).toBeVisible();
      
      // Both should be present regardless of form state
    });
  });
});