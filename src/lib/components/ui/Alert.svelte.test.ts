import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Alert from './Alert.svelte';

describe('Alert Component', () => {
  describe('content display', () => {
    it('should display message to users', async () => {
      render(Alert, { props: { message: 'Operation completed successfully' } });

      await expect.element(page.getByText('Operation completed successfully')).toBeVisible();
    });

    it('should display both title and message when provided', async () => {
      render(Alert, {
        props: {
          title: 'Success',
          message: 'Your changes have been saved',
          type: 'success'
        }
      });

      const alert = page.getByRole('alert');
      await expect.element(alert).toHaveTextContent(/Success/);
      await expect.element(alert).toHaveTextContent(/Your changes have been saved/);
    });
  });

  describe('accessibility', () => {
    it('should be announced to screen readers as an alert', async () => {
      render(Alert, { props: { message: 'Form validation failed', type: 'error' } });

      const alert = page.getByRole('alert');
      await expect.element(alert).toBeVisible();
      await expect.element(alert).toHaveTextContent(/Form validation failed/);
    });
  });

  describe('visual distinction by type', () => {
    it('should visually distinguish different alert types', async () => {
      // Test that different types get different visual treatment
      const { unmount } = render(Alert, { props: { message: 'Success', type: 'success' } });
      let alert = page.getByRole('alert');
      await expect.element(alert).toHaveAttribute('class', expect.stringMatching(/green/));
      unmount();

      render(Alert, { props: { message: 'Error', type: 'error' } });
      alert = page.getByRole('alert');
      await expect.element(alert).toHaveAttribute('class', expect.stringMatching(/red/));
    });

    it('should default to info styling when type not specified', async () => {
      render(Alert, { props: { message: 'Default alert' } });

      const alert = page.getByRole('alert');
      await expect.element(alert).toHaveAttribute('class', expect.stringMatching(/blue/));
    });
  });

  describe('edge cases', () => {
    it('should handle invalid alert type gracefully', async () => {
      render(Alert, { props: { message: 'Test message', type: 'invalid' as any } });

      const alert = page.getByRole('alert');
      await expect.element(alert).toBeVisible();
      await expect.element(alert).toHaveTextContent(/Test message/);
    });

    it('should render with empty message', async () => {
      render(Alert, { props: { message: '' } });

      await expect.element(page.getByRole('alert')).toBeVisible();
    });
  });
});
