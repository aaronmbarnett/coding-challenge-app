import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ChallengeHeader from './ChallengeHeader.svelte';
import { mockChallenge, createMockChallenge } from '$lib/test-fixtures';

describe('ChallengeHeader', () => {
  it('should render challenge title', async () => {
    render(ChallengeHeader, {
      props: {
        challenge: mockChallenge
      }
    });

    const title = page.getByText('Two Sum Problem');
    await expect.element(title).toBeInTheDocument();
  });

  it('should render back link', async () => {
    render(ChallengeHeader, {
      props: {
        challenge: mockChallenge
      }
    });

    const backLink = page.getByText('← Back to Challenges');
    await expect.element(backLink).toBeInTheDocument();
    await expect.element(backLink).toHaveAttribute('href', '/admin/challenges');
  });

  it('should render edit link with correct href', async () => {
    render(ChallengeHeader, {
      props: {
        challenge: mockChallenge
      }
    });

    const editLink = page.getByText('Edit Challenge');
    await expect.element(editLink).toBeInTheDocument();
    await expect
      .element(editLink)
      .toHaveAttribute('href', `/admin/challenges/${mockChallenge.id}/edit`);
  });

  it('should render delete button', async () => {
    render(ChallengeHeader, {
      props: {
        challenge: mockChallenge
      }
    });

    const deleteButton = page.getByText('Delete');
    await expect.element(deleteButton).toBeInTheDocument();
    await expect.element(deleteButton).toHaveClass(/bg-red-600/);
  });

  it('should handle different challenge data', async () => {
    const differentChallenge = createMockChallenge({
      title: 'Different Challenge',
      timeLimitSec: null,
      starterCode: null
    });

    render(ChallengeHeader, {
      props: {
        challenge: differentChallenge
      }
    });

    // Should still render other elements correctly
    const title = page.getByText('Different Challenge');
    await expect.element(title).toBeInTheDocument();

    const backLink = page.getByText('← Back to Challenges');
    await expect.element(backLink).toBeInTheDocument();
  });
});
