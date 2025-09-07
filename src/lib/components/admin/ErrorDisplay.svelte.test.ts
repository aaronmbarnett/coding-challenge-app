import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ErrorDisplay from './ErrorDisplay.svelte';

describe('ErrorDisplay', () => {
  describe('compilation errors', () => {
    it('should display compilation error with correct styling', async () => {
      const { container } = render(ErrorDisplay, {
        props: {
          type: 'compilation',
          error: 'Syntax error: missing semicolon'
        }
      });

      // Check for error container classes
      const errorContainer = container.querySelector('.border-red-400');
      expect(errorContainer).toBeTruthy();
      expect(errorContainer?.classList.contains('bg-red-50')).toBe(true);

      const errorMessage = page.getByText('Syntax error: missing semicolon');
      await expect.element(errorMessage).toBeVisible();
      await expect.element(errorMessage).toHaveClass(/font-mono/);
    });

    it('should show compilation error title', async () => {
      render(ErrorDisplay, {
        props: {
          type: 'compilation',
          error: 'Invalid syntax'
        }
      });

      const title = page.getByRole('heading', { name: 'Compilation Error' });
      await expect.element(title).toBeVisible();
      await expect.element(title).toHaveClass(/text-red-800/);
    });
  });

  describe('service errors', () => {
    it('should display service error with yellow styling', async () => {
      const { container } = render(ErrorDisplay, {
        props: {
          type: 'service',
          error: 'Judge0 service unavailable'
        }
      });

      // Check for error container classes
      const errorContainer = container.querySelector('.border-yellow-400');
      expect(errorContainer).toBeTruthy();
      expect(errorContainer?.classList.contains('bg-yellow-50')).toBe(true);

      const title = page.getByRole('heading', { name: 'Service Issue' });
      await expect.element(title).toHaveClass(/text-yellow-800/);

      const errorMessage = page.getByText('Judge0 service unavailable');
      await expect.element(errorMessage).toBeVisible();
    });
  });

  describe('timeout errors', () => {
    it('should display timeout error with predefined message', async () => {
      render(ErrorDisplay, {
        props: {
          type: 'timeout',
          error: 'ignored for timeout type'
        }
      });

      const title = page.getByRole('heading', { name: 'Execution Timeout' });
      await expect.element(title).toBeVisible();
      await expect.element(title).toHaveClass(/text-yellow-800/);

      const timeoutMessage = page.getByText('Your code took too long to execute');
      await expect.element(timeoutMessage).toBeVisible();

      // Should not show the provided error message for timeout type
      // (The component should show predefined message instead of the error prop)
      const { container } = render(ErrorDisplay, {
        props: {
          type: 'timeout',
          error: 'ignored for timeout type'
        }
      });

      // Verify the predefined message is shown, not the error prop
      const predefinedMessage = container.textContent?.includes(
        'Your code took too long to execute'
      );
      const errorProp = container.textContent?.includes('ignored for timeout type');
      expect(predefinedMessage).toBe(true);
      expect(errorProp).toBe(false);
    });

    it('should have timeout icon', async () => {
      const { container } = render(ErrorDisplay, {
        props: {
          type: 'timeout',
          error: ''
        }
      });

      const icon = container.querySelector('svg');
      expect(icon).toBeTruthy();
      expect(icon?.classList.contains('text-yellow-400')).toBe(true);
    });
  });

  describe('general errors', () => {
    it('should display general error with red styling', async () => {
      render(ErrorDisplay, {
        props: {
          type: 'general',
          error: 'Something went wrong'
        }
      });

      const title = page.getByRole('heading', { name: 'Error' });
      await expect.element(title).toBeVisible();
      await expect.element(title).toHaveClass(/text-red-800/);

      const errorMessage = page.getByText('Something went wrong');
      await expect.element(errorMessage).toBeVisible();
      await expect.element(errorMessage).toHaveClass(/font-mono/);
    });
  });

  describe('accessibility', () => {
    it('should have proper heading structure', async () => {
      render(ErrorDisplay, {
        props: {
          type: 'compilation',
          error: 'Test error'
        }
      });

      const heading = page.getByRole('heading');
      await expect.element(heading).toBeVisible();
    });

    it('should have descriptive error content', async () => {
      render(ErrorDisplay, {
        props: {
          type: 'service',
          error: 'Network connection failed'
        }
      });

      const errorText = page.getByText('Network connection failed');
      await expect.element(errorText).toBeVisible();
    });
  });

  describe('visual indicators', () => {
    it('should show different icons for different error types', async () => {
      const { container: compilationContainer } = render(ErrorDisplay, {
        props: { type: 'compilation', error: 'test' }
      });

      const { container: serviceContainer } = render(ErrorDisplay, {
        props: { type: 'service', error: 'test' }
      });

      const compilationIcon = compilationContainer.querySelector('svg');
      const serviceIcon = serviceContainer.querySelector('svg');

      // Icons should exist
      expect(compilationIcon).toBeTruthy();
      expect(serviceIcon).toBeTruthy();

      // Icons should have different colors
      expect(compilationIcon?.classList.contains('text-red-400')).toBe(true);
      expect(serviceIcon?.classList.contains('text-yellow-400')).toBe(true);
    });

    it('should use monospace font for error messages except timeout', async () => {
      render(ErrorDisplay, {
        props: {
          type: 'compilation',
          error: 'Syntax error line 5'
        }
      });

      const errorMessage = page.getByText('Syntax error line 5');
      await expect.element(errorMessage).toHaveClass(/font-mono/);
    });

    it('should not use monospace font for timeout messages', async () => {
      render(ErrorDisplay, {
        props: {
          type: 'timeout',
          error: 'ignored'
        }
      });

      const timeoutMessage = page.getByText('Your code took too long to execute');
      await expect.element(timeoutMessage).not.toHaveClass(/font-mono/);
    });
  });
});
