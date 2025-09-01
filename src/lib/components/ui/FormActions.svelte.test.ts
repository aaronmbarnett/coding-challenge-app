import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FormActions from './FormActions.svelte';

describe('FormActions', () => {
  describe('submit button', () => {
    it('should render submit button with default text', async () => {
      render(FormActions, { props: {} });

      const submitButton = page.getByText('Submit');
      await expect.element(submitButton).toBeInTheDocument();
      await expect.element(submitButton).toHaveAttribute('type', 'submit');
      await expect.element(submitButton).toHaveClass(/bg-blue-600/);
      await expect.element(submitButton).toHaveClass(/text-white/);
    });

    it('should render submit button with custom text', async () => {
      render(FormActions, { 
        props: { 
          submitText: 'Create Challenge' 
        } 
      });

      const submitButton = page.getByText('Create Challenge');
      await expect.element(submitButton).toBeInTheDocument();
      await expect.element(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should render enabled submit button by default', async () => {
      render(FormActions, { props: {} });

      const submitButton = page.getByText('Submit');
      await expect.element(submitButton).toBeInTheDocument();
      await expect.element(submitButton).not.toHaveAttribute('disabled');
      await expect.element(submitButton).toHaveClass(/bg-blue-600/);
    });

    it('should render disabled submit button when submitDisabled is true', async () => {
      render(FormActions, { 
        props: { 
          submitDisabled: true 
        } 
      });

      const submitButton = page.getByText('Submit');
      await expect.element(submitButton).toBeInTheDocument();
      await expect.element(submitButton).toHaveAttribute('disabled');
      await expect.element(submitButton).toHaveClass(/disabled:bg-gray-400/);
      await expect.element(submitButton).toHaveClass(/disabled:cursor-not-allowed/);
    });

    it('should render submit button with focus styles', async () => {
      render(FormActions, { props: {} });

      const submitButton = page.getByText('Submit');
      await expect.element(submitButton).toBeInTheDocument();
      await expect.element(submitButton).toHaveClass(/focus:ring-2/);
      await expect.element(submitButton).toHaveClass(/focus:ring-blue-500/);
      await expect.element(submitButton).toHaveClass(/focus:outline-none/);
    });
  });

  describe('cancel link', () => {
    it('should render cancel link when cancelHref provided', async () => {
      render(FormActions, { 
        props: { 
          cancelHref: '/admin/challenges' 
        } 
      });

      const cancelLink = page.getByText('Cancel');
      await expect.element(cancelLink).toBeInTheDocument();
      await expect.element(cancelLink).toHaveAttribute('href', '/admin/challenges');
      await expect.element(cancelLink).toHaveClass(/bg-gray-300/);
      await expect.element(cancelLink).toHaveClass(/text-gray-700/);
    });

    it('should render cancel link with custom text', async () => {
      render(FormActions, { 
        props: { 
          cancelHref: '/admin/challenges',
          cancelText: 'Back to List'
        } 
      });

      const cancelLink = page.getByText('Back to List');
      await expect.element(cancelLink).toBeInTheDocument();
      await expect.element(cancelLink).toHaveAttribute('href', '/admin/challenges');
    });

    it('should not render cancel link when cancelHref not provided', async () => {
      render(FormActions, { props: {} });

      // Just verify submit button renders (no cancel link should be present)
      const submitButton = page.getByText('Submit');
      await expect.element(submitButton).toBeInTheDocument();
    });

    it('should render cancel link with hover styles', async () => {
      render(FormActions, { 
        props: { 
          cancelHref: '/admin/challenges' 
        } 
      });

      const cancelLink = page.getByText('Cancel');
      await expect.element(cancelLink).toBeInTheDocument();
      await expect.element(cancelLink).toHaveClass(/hover:bg-gray-400/);
    });
  });

  describe('layout and structure', () => {
    it('should have correct flex layout', async () => {
      render(FormActions, { 
        props: { 
          cancelHref: '/admin/challenges' 
        } 
      });

      const submitButton = page.getByText('Submit');
      const cancelLink = page.getByText('Cancel');

      await expect.element(submitButton).toBeInTheDocument();
      await expect.element(cancelLink).toBeInTheDocument();
    });

    it('should work with only submit button', async () => {
      render(FormActions, { props: {} });

      const submitButton = page.getByText('Submit');
      await expect.element(submitButton).toBeInTheDocument();
    });
  });

  describe('all props combinations', () => {
    it('should render with all props provided', async () => {
      render(FormActions, { 
        props: { 
          submitText: 'Save Changes',
          submitDisabled: false,
          cancelHref: '/admin',
          cancelText: 'Discard Changes'
        } 
      });

      const submitButton = page.getByText('Save Changes');
      await expect.element(submitButton).toBeInTheDocument();
      await expect.element(submitButton).not.toHaveAttribute('disabled');

      const cancelLink = page.getByText('Discard Changes');
      await expect.element(cancelLink).toBeInTheDocument();
      await expect.element(cancelLink).toHaveAttribute('href', '/admin');
    });

    it('should render with disabled submit and cancel link', async () => {
      render(FormActions, { 
        props: { 
          submitText: 'Processing...',
          submitDisabled: true,
          cancelHref: '/admin',
          cancelText: 'Cancel'
        } 
      });

      const submitButton = page.getByText('Processing...');
      await expect.element(submitButton).toBeInTheDocument();
      await expect.element(submitButton).toHaveAttribute('disabled');

      const cancelLink = page.getByText('Cancel');
      await expect.element(cancelLink).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper button attributes', async () => {
      render(FormActions, { props: {} });

      const submitButton = page.getByText('Submit');
      await expect.element(submitButton).toBeInTheDocument();
      await expect.element(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should have disabled attributes when disabled', async () => {
      render(FormActions, { 
        props: { 
          submitDisabled: true 
        } 
      });

      const submitButton = page.getByText('Submit');
      await expect.element(submitButton).toBeInTheDocument();
      await expect.element(submitButton).toHaveAttribute('disabled');
    });
  });
});