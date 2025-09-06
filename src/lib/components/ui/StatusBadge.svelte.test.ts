import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StatusBadge from './StatusBadge.svelte';

describe('StatusBadge', () => {
  describe('session status rendering', () => {
    it('should render pending session status correctly', async () => {
      render(StatusBadge, { props: { status: 'pending', type: 'session' } });
      
      const badge = page.getByText('PENDING');
      await expect.element(badge).toBeVisible();
      await expect.element(badge).toHaveAttribute('class', expect.stringContaining('bg-gray-100'));
    });

    it('should render active session status correctly', async () => {
      render(StatusBadge, { props: { status: 'active', type: 'session' } });
      
      const badge = page.getByText('ACTIVE');
      await expect.element(badge).toBeVisible();
      await expect.element(badge).toHaveAttribute('class', expect.stringContaining('bg-green-100'));
    });

    it('should render submitted session status correctly', async () => {
      render(StatusBadge, { props: { status: 'submitted', type: 'session' } });
      
      const badge = page.getByText('SUBMITTED');
      await expect.element(badge).toBeVisible();
      await expect.element(badge).toHaveAttribute('class', expect.stringContaining('bg-blue-100'));
    });

    it('should render expired session status with alert styling', async () => {
      render(StatusBadge, { props: { status: 'expired', type: 'session' } });
      
      const badge = page.getByText('EXPIRED');
      await expect.element(badge).toBeVisible();
      // Focus on semantic meaning: expired status should have alert/warning appearance
      await expect.element(badge).toHaveAttribute('class', expect.stringContaining('bg-red-100'));
    });

    it('should handle unknown session status gracefully', async () => {
      render(StatusBadge, { props: { status: 'unknown', type: 'session' } });
      
      const badge = page.getByText('UNKNOWN');
      await expect.element(badge).toBeVisible();
      // Unknown status should fall back to neutral styling
      await expect.element(badge).toHaveAttribute('class', expect.stringContaining('bg-gray-100'));
    });
  });

  describe('attempt status rendering', () => {
    it('should render locked attempt status as inactive', async () => {
      render(StatusBadge, { props: { status: 'locked', type: 'attempt' } });
      
      const badge = page.getByText('LOCKED');
      await expect.element(badge).toBeVisible();
      // Locked should appear inactive/disabled
      await expect.element(badge).toHaveAttribute('class', expect.stringContaining('bg-gray-100'));
    });

    it('should render in_progress status with activity indicator styling', async () => {
      render(StatusBadge, { props: { status: 'in_progress', type: 'attempt' } });
      
      const badge = page.getByText('IN PROGRESS');
      await expect.element(badge).toBeVisible();
      // In progress should have warning/activity styling
      await expect.element(badge).toHaveAttribute('class', expect.stringContaining('bg-yellow-100'));
    });

    it('should render submitted attempt status as completed', async () => {
      render(StatusBadge, { props: { status: 'submitted', type: 'attempt' } });
      
      const badge = page.getByText('SUBMITTED');
      await expect.element(badge).toBeVisible();
      // Submitted should appear as completed/informational
      await expect.element(badge).toHaveAttribute('class', expect.stringContaining('bg-blue-100'));
    });
  });

  describe('testcase type indicators', () => {
    it('should distinguish IO testcase type', async () => {
      render(StatusBadge, { props: { status: 'io', type: 'testcase' } });
      
      const badge = page.getByText('IO');
      await expect.element(badge).toBeVisible();
      // IO type should have distinctive styling
      await expect.element(badge).toHaveAttribute('class', expect.stringContaining('bg-blue-100'));
    });

    it('should distinguish harness testcase type', async () => {
      render(StatusBadge, { props: { status: 'harness', type: 'testcase' } });
      
      const badge = page.getByText('HARNESS');
      await expect.element(badge).toBeVisible();
      // Harness type should have distinctive styling different from IO
      await expect.element(badge).toHaveAttribute('class', expect.stringContaining('bg-purple-100'));
    });
  });

  describe('default behavior', () => {
    it('should default to session type when type is not specified', async () => {
      render(StatusBadge, { props: { status: 'pending' } });
      
      const badge = page.getByText('PENDING');
      await expect.element(badge).toBeVisible();
      // Should render with same styling as session type
      await expect.element(badge).toHaveAttribute('class', expect.stringContaining('bg-gray-100'));
    });

    it('should render as a badge component', async () => {
      render(StatusBadge, { props: { status: 'active' } });
      
      const badge = page.getByText('ACTIVE');
      await expect.element(badge).toBeVisible();
      // Focus on semantic role rather than specific styling classes
      await expect.element(badge).toHaveAttribute('class', expect.stringContaining('inline-flex'));
      await expect.element(badge).toHaveAttribute('class', expect.stringContaining('rounded-full'));
    });
  });

  describe('text formatting and accessibility', () => {
    it('should format underscore statuses as readable text', async () => {
      render(StatusBadge, { props: { status: 'in_progress' } });
      
      // Users should see readable text, not technical status codes
      const badge = page.getByText('IN PROGRESS');
      await expect.element(badge).toBeVisible();
      
      // Verify the status is properly formatted for human reading
      await expect.element(badge).toHaveTextContent('IN PROGRESS');
    });

    it('should display single word statuses in uppercase', async () => {
      render(StatusBadge, { props: { status: 'active' } });
      
      const badge = page.getByText('ACTIVE');
      await expect.element(badge).toBeVisible();
      
      // Verify the status is properly formatted in uppercase
      await expect.element(badge).toHaveTextContent('ACTIVE');
    });

    it('should provide clear semantic meaning', async () => {
      render(StatusBadge, { props: { status: 'submitted', type: 'session' } });
      
      const badge = page.getByText('SUBMITTED');
      await expect.element(badge).toBeVisible();
      
      // Badge should provide clear semantic meaning through its text content
      await expect.element(badge).toHaveTextContent('SUBMITTED');
      
      // Badge should be distinguishable from other content
      await expect.element(badge).toHaveAttribute('class', expect.stringContaining('bg-blue-100'));
    });
  });
});