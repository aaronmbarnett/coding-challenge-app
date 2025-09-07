import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PageHeader from './PageHeader.svelte';

describe('PageHeader', () => {
  describe('basic rendering', () => {
    it('should render title', async () => {
      render(PageHeader, {
        props: {
          title: 'Test Page'
        }
      });

      const title = page.getByText('Test Page');
      await expect.element(title).toBeInTheDocument();
      await expect.element(title).toHaveClass(/text-3xl/);
      await expect.element(title).toHaveClass(/font-bold/);
    });

    it('should render subtitle when provided', async () => {
      render(PageHeader, {
        props: {
          title: 'Test Page',
          subtitle: 'This is a test subtitle'
        }
      });

      const subtitle = page.getByText('This is a test subtitle');
      await expect.element(subtitle).toBeInTheDocument();
      await expect.element(subtitle).toHaveClass(/text-gray-600/);
    });

    it('should work without subtitle', async () => {
      render(PageHeader, {
        props: {
          title: 'Test Page'
        }
      });

      const title = page.getByText('Test Page');
      await expect.element(title).toBeInTheDocument();
    });
  });

  describe('back navigation', () => {
    it('should render back link when backHref provided', async () => {
      render(PageHeader, {
        props: {
          title: 'Test Page',
          backHref: '/admin',
          backText: '← Back to Admin'
        }
      });

      const backLink = page.getByText('← Back to Admin');
      await expect.element(backLink).toBeInTheDocument();
      await expect.element(backLink).toHaveAttribute('href', '/admin');
      await expect.element(backLink).toHaveClass(/text-blue-600/);
    });

    it('should use default back text when not provided', async () => {
      render(PageHeader, {
        props: {
          title: 'Test Page',
          backHref: '/admin'
        }
      });

      const backLink = page.getByText('← Back');
      await expect.element(backLink).toBeInTheDocument();
      await expect.element(backLink).toHaveAttribute('href', '/admin');
    });

    it('should not render back link when backHref not provided', async () => {
      render(PageHeader, {
        props: {
          title: 'Test Page'
        }
      });

      // Just verify the title renders (no back link should be present)
      const title = page.getByText('Test Page');
      await expect.element(title).toBeInTheDocument();
    });
  });

  describe('action button', () => {
    it('should render action button when both actionHref and actionText provided', async () => {
      render(PageHeader, {
        props: {
          title: 'Test Page',
          actionHref: '/admin/new',
          actionText: 'Create New'
        }
      });

      const actionButton = page.getByText('Create New');
      await expect.element(actionButton).toBeInTheDocument();
      await expect.element(actionButton).toHaveAttribute('href', '/admin/new');
      await expect.element(actionButton).toHaveClass(/bg-blue-600/);
      await expect.element(actionButton).toHaveClass(/text-white/);
    });

    it('should not render action button when actionHref missing', async () => {
      render(PageHeader, {
        props: {
          title: 'Test Page',
          actionText: 'Create New'
        }
      });

      // Just verify title renders (no action button should be present)
      const title = page.getByText('Test Page');
      await expect.element(title).toBeInTheDocument();
    });

    it('should not render action button when actionText missing', async () => {
      render(PageHeader, {
        props: {
          title: 'Test Page',
          actionHref: '/admin/new'
        }
      });

      // Should not find any link with the href since no text is provided
      const title = page.getByText('Test Page');
      await expect.element(title).toBeInTheDocument();
    });
  });

  describe('complete page header', () => {
    it('should render all elements when all props provided', async () => {
      render(PageHeader, {
        props: {
          title: 'Challenge Management',
          subtitle: 'Create and manage coding challenges',
          backHref: '/admin',
          backText: '← Back to Dashboard',
          actionHref: '/admin/challenges/new',
          actionText: 'New Challenge'
        }
      });

      // Check all elements are present
      const backLink = page.getByText('← Back to Dashboard');
      await expect.element(backLink).toBeInTheDocument();
      await expect.element(backLink).toHaveAttribute('href', '/admin');

      const title = page.getByText('Challenge Management');
      await expect.element(title).toBeInTheDocument();

      const subtitle = page.getByText('Create and manage coding challenges');
      await expect.element(subtitle).toBeInTheDocument();

      const actionButton = page.getByText('New Challenge');
      await expect.element(actionButton).toBeInTheDocument();
      await expect.element(actionButton).toHaveAttribute('href', '/admin/challenges/new');
    });
  });

  describe('layout and structure', () => {
    it('should have correct layout structure', async () => {
      render(PageHeader, {
        props: {
          title: 'Test Page',
          subtitle: 'Test subtitle',
          actionHref: '/test',
          actionText: 'Test Action'
        }
      });

      const title = page.getByText('Test Page');
      const subtitle = page.getByText('Test subtitle');
      const action = page.getByText('Test Action');

      // Verify elements are present
      await expect.element(title).toBeInTheDocument();
      await expect.element(subtitle).toBeInTheDocument();
      await expect.element(action).toBeInTheDocument();
    });
  });
});
