import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StatCard from './StatCard.svelte';

describe('StatCard', () => {
  describe('basic rendering', () => {
    it('should render title and value', async () => {
      render(StatCard, {
        props: {
          title: 'Total Sessions',
          value: 42
        }
      });

      const title = page.getByText('Total Sessions');
      const value = page.getByText('42');

      await expect.element(title).toBeInTheDocument();
      await expect.element(value).toBeInTheDocument();
    });

    it('should render string value', async () => {
      render(StatCard, {
        props: {
          title: 'Status',
          value: 'Active'
        }
      });

      const title = page.getByText('Status');
      const value = page.getByText('Active');

      await expect.element(title).toBeInTheDocument();
      await expect.element(value).toBeInTheDocument();
    });

    it('should render number value', async () => {
      render(StatCard, {
        props: {
          title: 'Count',
          value: 123
        }
      });

      const title = page.getByText('Count');
      const value = page.getByText('123');

      await expect.element(title).toBeInTheDocument();
      await expect.element(value).toBeInTheDocument();
    });
  });

  describe('subtitle functionality', () => {
    it('should render subtitle when provided', async () => {
      render(StatCard, {
        props: {
          title: 'Active Sessions',
          value: 15,
          subtitle: 'Currently running'
        }
      });

      const title = page.getByText('Active Sessions');
      const value = page.getByText('15');
      const subtitle = page.getByText('Currently running');

      await expect.element(title).toBeInTheDocument();
      await expect.element(value).toBeInTheDocument();
      await expect.element(subtitle).toBeInTheDocument();
    });

    it('should work without subtitle', async () => {
      render(StatCard, {
        props: {
          title: 'Simple Card',
          value: 99
        }
      });

      const title = page.getByText('Simple Card');
      const value = page.getByText('99');

      await expect.element(title).toBeInTheDocument();
      await expect.element(value).toBeInTheDocument();
    });
  });

  describe('styling and structure', () => {
    it('should use proper heading for title', async () => {
      render(StatCard, {
        props: {
          title: 'Accessible Card',
          value: 'Content'
        }
      });

      const heading = page.getByRole('heading', { level: 3 });

      await expect.element(heading).toBeInTheDocument();
    });

    it('should have correct title classes', async () => {
      render(StatCard, {
        props: {
          title: 'Styled Title',
          value: 'Value'
        }
      });

      const title = page.getByRole('heading', { level: 3 });

      await expect.element(title).toBeInTheDocument();
      await expect.element(title).toHaveClass(/text-sm/);
      await expect.element(title).toHaveClass(/font-medium/);
      await expect.element(title).toHaveClass(/text-gray-500/);
    });
  });

  describe('edge cases', () => {
    it('should handle zero value', async () => {
      render(StatCard, {
        props: {
          title: 'Zero Value',
          value: 0
        }
      });

      const value = page.getByText('0');

      await expect.element(value).toBeInTheDocument();
    });

    it('should handle negative value', async () => {
      render(StatCard, {
        props: {
          title: 'Negative Value',
          value: -5
        }
      });

      const value = page.getByText('-5');

      await expect.element(value).toBeInTheDocument();
    });

    it('should handle very long title', async () => {
      const longTitle =
        'This is a very long title that might wrap to multiple lines in the card component';

      render(StatCard, {
        props: {
          title: longTitle,
          value: 'Short'
        }
      });

      const title = page.getByText(longTitle);

      await expect.element(title).toBeInTheDocument();
    });

    it('should handle very long value', async () => {
      const longValue = 'This is a very long value that might affect the card layout and styling';

      render(StatCard, {
        props: {
          title: 'Short Title',
          value: longValue
        }
      });

      const value = page.getByText(longValue);

      await expect.element(value).toBeInTheDocument();
    });
  });

  describe('component completeness', () => {
    it('should render all elements with subtitle', async () => {
      render(StatCard, {
        props: {
          title: 'Complete Card',
          value: 100,
          subtitle: 'Extra info'
        }
      });

      const title = page.getByRole('heading', { level: 3 });
      const value = page.getByText('100');
      const subtitle = page.getByText('Extra info');

      await expect.element(title).toBeInTheDocument();
      await expect.element(value).toBeInTheDocument();
      await expect.element(subtitle).toBeInTheDocument();
    });

    it('should work with minimal props', async () => {
      render(StatCard, {
        props: {
          title: 'Minimal Card',
          value: 'Test'
        }
      });

      const title = page.getByRole('heading', { level: 3 });
      const value = page.getByText('Test');

      await expect.element(title).toBeInTheDocument();
      await expect.element(value).toBeInTheDocument();
    });
  });
});
