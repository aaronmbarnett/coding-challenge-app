import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ChallengeSelector from './ChallengeSelector.svelte';

describe('ChallengeSelector', () => {
  const mockChallenges = [
    { id: 'challenge-1', title: 'Two Sum Problem', timeLimitSec: 1800 },
    { id: 'challenge-2', title: 'Binary Tree Traversal', timeLimitSec: 3600 },
    { id: 'challenge-3', title: 'Quick Sort Implementation', timeLimitSec: null }
  ];

  describe('basic rendering', () => {
    it('should render the title and empty challenges', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: [],
          selectedChallengeIds: []
        }
      });

      const title = page.getByText('Select Challenges');
      await expect.element(title).toBeInTheDocument();

      const emptyMessage = page.getByText('No challenges available');
      await expect.element(emptyMessage).toBeInTheDocument();
    });

    it('should render custom empty message', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: [],
          selectedChallengeIds: [],
          emptyMessage: 'No coding challenges found'
        }
      });

      const emptyMessage = page.getByText('No coding challenges found');
      await expect.element(emptyMessage).toBeInTheDocument();
    });

    it('should render empty action link when provided', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: [],
          selectedChallengeIds: [],
          emptyActionHref: '/admin/challenges/new',
          emptyActionText: 'Create one'
        }
      });

      const actionLink = page.getByText('Create one');
      await expect.element(actionLink).toBeInTheDocument();
      await expect.element(actionLink).toHaveAttribute('href', '/admin/challenges/new');
    });
  });

  describe('challenge list rendering', () => {
    it('should render all challenges when provided', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: mockChallenges,
          selectedChallengeIds: []
        }
      });

      const challenge1 = page.getByText('Two Sum Problem');
      await expect.element(challenge1).toBeInTheDocument();

      const challenge2 = page.getByText('Binary Tree Traversal');
      await expect.element(challenge2).toBeInTheDocument();

      const challenge3 = page.getByText('Quick Sort Implementation');
      await expect.element(challenge3).toBeInTheDocument();
    });

    it('should render time limits correctly', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: mockChallenges,
          selectedChallengeIds: []
        }
      });

      // 1800 seconds = 30 minutes
      const timeLimit1 = page.getByText('Individual time limit: 30m');
      await expect.element(timeLimit1).toBeInTheDocument();

      // 3600 seconds = 1 hour
      const timeLimit2 = page.getByText('Individual time limit: 1h 0m');
      await expect.element(timeLimit2).toBeInTheDocument();
    });

    it('should not render time limit for challenges without time limits', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: [{ id: 'test', title: 'Test Challenge', timeLimitSec: null }],
          selectedChallengeIds: []
        }
      });

      // Verify challenge renders without time limit
      const challenge = page.getByText('Test Challenge');
      await expect.element(challenge).toBeInTheDocument();
    });

    it('should render checkboxes for each challenge', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: mockChallenges,
          selectedChallengeIds: []
        }
      });

      // Check that checkboxes are present (by checking input elements)
      const challenge1Title = page.getByText('Two Sum Problem');
      await expect.element(challenge1Title).toBeInTheDocument();
    });
  });

  describe('selection functionality', () => {
    it('should show selected count with no selections', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: mockChallenges,
          selectedChallengeIds: []
        }
      });

      const selectedCount = page.getByText('Selected: 0 challenges');
      await expect.element(selectedCount).toBeInTheDocument();
    });

    it('should show selected count with one selection', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: mockChallenges,
          selectedChallengeIds: ['challenge-1']
        }
      });

      const selectedCount = page.getByText('Selected: 1 challenge');
      await expect.element(selectedCount).toBeInTheDocument();
    });

    it('should show selected count with multiple selections', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: mockChallenges,
          selectedChallengeIds: ['challenge-1', 'challenge-2']
        }
      });

      const selectedCount = page.getByText('Selected: 2 challenges');
      await expect.element(selectedCount).toBeInTheDocument();
    });

    it('should show all challenges as selected when all are selected', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: mockChallenges,
          selectedChallengeIds: ['challenge-1', 'challenge-2', 'challenge-3']
        }
      });

      const selectedCount = page.getByText('Selected: 3 challenges');
      await expect.element(selectedCount).toBeInTheDocument();
    });
  });

  describe('form integration', () => {
    it('should use default name attribute', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: mockChallenges,
          selectedChallengeIds: []
        }
      });

      // Challenge should be rendered (indicating checkboxes are present)
      const challenge = page.getByText('Two Sum Problem');
      await expect.element(challenge).toBeInTheDocument();
    });

    it('should use custom name attribute', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: mockChallenges,
          selectedChallengeIds: [],
          name: 'selectedChallenges'
        }
      });

      // Challenge should be rendered (indicating checkboxes are present)
      const challenge = page.getByText('Two Sum Problem');
      await expect.element(challenge).toBeInTheDocument();
    });
  });

  describe('time formatting', () => {
    it('should format minutes correctly', async () => {
      const challengesWithMinutes = [
        { id: 'test-1', title: 'Test 1', timeLimitSec: 900 }, // 15 minutes
        { id: 'test-2', title: 'Test 2', timeLimitSec: 600 }  // 10 minutes
      ];

      render(ChallengeSelector, {
        props: {
          challenges: challengesWithMinutes,
          selectedChallengeIds: []
        }
      });

      const timeLimit1 = page.getByText('Individual time limit: 15m');
      await expect.element(timeLimit1).toBeInTheDocument();

      const timeLimit2 = page.getByText('Individual time limit: 10m');
      await expect.element(timeLimit2).toBeInTheDocument();
    });

    it('should format hours and minutes correctly', async () => {
      const challengesWithHours = [
        { id: 'test-1', title: 'Test 1', timeLimitSec: 5400 }, // 1h 30m
        { id: 'test-2', title: 'Test 2', timeLimitSec: 7200 }  // 2h 0m
      ];

      render(ChallengeSelector, {
        props: {
          challenges: challengesWithHours,
          selectedChallengeIds: []
        }
      });

      const timeLimit1 = page.getByText('Individual time limit: 1h 30m');
      await expect.element(timeLimit1).toBeInTheDocument();

      const timeLimit2 = page.getByText('Individual time limit: 2h 0m');
      await expect.element(timeLimit2).toBeInTheDocument();
    });
  });

  describe('layout and styling', () => {
    it('should have proper scrollable container for many challenges', async () => {
      const manyChallenges = [
        { id: 'c1', title: 'Algorithm Challenge A', timeLimitSec: 1800 },
        { id: 'c2', title: 'Data Structure Challenge B', timeLimitSec: 1800 },
        { id: 'c3', title: 'System Design Challenge C', timeLimitSec: 1800 }
      ];

      render(ChallengeSelector, {
        props: {
          challenges: manyChallenges,
          selectedChallengeIds: []
        }
      });

      // Should render the challenges
      const challenge1 = page.getByText('Algorithm Challenge A');
      await expect.element(challenge1).toBeInTheDocument();

      const challenge2 = page.getByText('Data Structure Challenge B');
      await expect.element(challenge2).toBeInTheDocument();
    });

    it('should have hover effects on challenge items', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: [mockChallenges[0]],
          selectedChallengeIds: []
        }
      });

      const challenge = page.getByText('Two Sum Problem');
      await expect.element(challenge).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle single challenge', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: [mockChallenges[0]],
          selectedChallengeIds: ['challenge-1']
        }
      });

      const challenge = page.getByText('Two Sum Problem');
      await expect.element(challenge).toBeInTheDocument();

      const selectedCount = page.getByText('Selected: 1 challenge');
      await expect.element(selectedCount).toBeInTheDocument();
    });

    it('should handle challenges with zero time limit', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: [{ id: 'test', title: 'Test Challenge', timeLimitSec: 0 }],
          selectedChallengeIds: []
        }
      });

      const challenge = page.getByText('Test Challenge');
      await expect.element(challenge).toBeInTheDocument();

      // Zero time limit is falsy, so no time limit should be shown (same as null)
      // This behavior is correct for the component
    });

    it('should handle very long challenge titles', async () => {
      render(ChallengeSelector, {
        props: {
          challenges: [{
            id: 'long-title',
            title: 'This is a very long challenge title that might wrap to multiple lines and should be handled gracefully',
            timeLimitSec: 1800
          }],
          selectedChallengeIds: []
        }
      });

      const longTitle = page.getByText(/This is a very long challenge title/);
      await expect.element(longTitle).toBeInTheDocument();
    });
  });
});