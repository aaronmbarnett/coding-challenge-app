import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StatusBadge from './StatusBadge.svelte';

describe('StatusBadge', () => {
  describe('session status colors', () => {
    it('should render pending status with gray colors', async () => {
      render(StatusBadge, { props: { status: 'pending', type: 'session' } });
      
      const badge = page.getByText('PENDING');
      await expect.element(badge).toBeInTheDocument();
      await expect.element(badge).toHaveClass(/bg-gray-100/);
      await expect.element(badge).toHaveClass(/text-gray-800/);
    });

    it('should render active status with green colors', async () => {
      render(StatusBadge, { props: { status: 'active', type: 'session' } });
      
      const badge = page.getByText('ACTIVE');
      await expect.element(badge).toBeInTheDocument();
      await expect.element(badge).toHaveClass(/bg-green-100/);
      await expect.element(badge).toHaveClass(/text-green-800/);
    });

    it('should render submitted status with blue colors', async () => {
      render(StatusBadge, { props: { status: 'submitted', type: 'session' } });
      
      const badge = page.getByText('SUBMITTED');
      await expect.element(badge).toBeInTheDocument();
      await expect.element(badge).toHaveClass(/bg-blue-100/);
      await expect.element(badge).toHaveClass(/text-blue-800/);
    });

    it('should render expired status with red colors', async () => {
      render(StatusBadge, { props: { status: 'expired', type: 'session' } });
      
      const badge = page.getByText('EXPIRED');
      await expect.element(badge).toBeInTheDocument();
      await expect.element(badge).toHaveClass(/bg-red-100/);
      await expect.element(badge).toHaveClass(/text-red-800/);
    });

    it('should render unknown session status with default gray colors', async () => {
      render(StatusBadge, { props: { status: 'unknown', type: 'session' } });
      
      const badge = page.getByText('UNKNOWN');
      await expect.element(badge).toBeInTheDocument();
      await expect.element(badge).toHaveClass(/bg-gray-100/);
      await expect.element(badge).toHaveClass(/text-gray-800/);
    });
  });

  describe('attempt status colors', () => {
    it('should render locked status with gray colors', async () => {
      render(StatusBadge, { props: { status: 'locked', type: 'attempt' } });
      
      const badge = page.getByText('LOCKED');
      await expect.element(badge).toBeInTheDocument();
      await expect.element(badge).toHaveClass(/bg-gray-100/);
      await expect.element(badge).toHaveClass(/text-gray-800/);
    });

    it('should render in_progress status with yellow colors and formatted text', async () => {
      render(StatusBadge, { props: { status: 'in_progress', type: 'attempt' } });
      
      const badge = page.getByText('IN PROGRESS');
      await expect.element(badge).toBeInTheDocument();
      await expect.element(badge).toHaveClass(/bg-yellow-100/);
      await expect.element(badge).toHaveClass(/text-yellow-800/);
    });

    it('should render submitted attempt status with blue colors', async () => {
      render(StatusBadge, { props: { status: 'submitted', type: 'attempt' } });
      
      const badge = page.getByText('SUBMITTED');
      await expect.element(badge).toBeInTheDocument();
      await expect.element(badge).toHaveClass(/bg-blue-100/);
      await expect.element(badge).toHaveClass(/text-blue-800/);
    });
  });

  describe('testcase status colors', () => {
    it('should render io testcase with blue colors', async () => {
      render(StatusBadge, { props: { status: 'io', type: 'testcase' } });
      
      const badge = page.getByText('IO');
      await expect.element(badge).toBeInTheDocument();
      await expect.element(badge).toHaveClass(/bg-blue-100/);
      await expect.element(badge).toHaveClass(/text-blue-800/);
    });

    it('should render harness testcase with purple colors', async () => {
      render(StatusBadge, { props: { status: 'harness', type: 'testcase' } });
      
      const badge = page.getByText('HARNESS');
      await expect.element(badge).toBeInTheDocument();
      await expect.element(badge).toHaveClass(/bg-purple-100/);
      await expect.element(badge).toHaveClass(/text-purple-800/);
    });
  });

  describe('default behavior', () => {
    it('should default to session type', async () => {
      render(StatusBadge, { props: { status: 'pending' } });
      
      const badge = page.getByText('PENDING');
      await expect.element(badge).toBeInTheDocument();
      await expect.element(badge).toHaveClass(/bg-gray-100/);
      await expect.element(badge).toHaveClass(/text-gray-800/);
    });

    it('should render base styling classes', async () => {
      render(StatusBadge, { props: { status: 'active' } });
      
      const badge = page.getByText('ACTIVE');
      await expect.element(badge).toBeInTheDocument();
      await expect.element(badge).toHaveClass(/inline-flex/);
      await expect.element(badge).toHaveClass(/items-center/);
      await expect.element(badge).toHaveClass(/rounded-full/);
      await expect.element(badge).toHaveClass(/px-2/);
      await expect.element(badge).toHaveClass(/py-1/);
      await expect.element(badge).toHaveClass(/text-xs/);
      await expect.element(badge).toHaveClass(/font-medium/);
    });
  });

  describe('text formatting', () => {
    it('should replace underscores with spaces and convert to uppercase', async () => {
      render(StatusBadge, { props: { status: 'in_progress' } });
      
      const badge = page.getByText('IN PROGRESS');
      await expect.element(badge).toBeInTheDocument();
    });

    it('should handle status without underscores', async () => {
      render(StatusBadge, { props: { status: 'active' } });
      
      const badge = page.getByText('ACTIVE');
      await expect.element(badge).toBeInTheDocument();
    });
  });
});