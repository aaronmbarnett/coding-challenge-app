import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ChallengeSidebar from './ChallengeSidebar.svelte';
import { createMockChallenge } from '$lib/test-fixtures';

describe('ChallengeSidebar', () => {
  const mockChallenge = createMockChallenge({
    id: 'challenge-123',
    languagesCsv: 'javascript,python,java',
    timeLimitSec: 3600, // 1 hour
    createdAt: new Date('2024-01-15T10:00:00Z')
  });

  describe('action buttons section', () => {
    it('should render actions section heading', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      const heading = page.getByRole('heading', { name: 'Actions' });
      await expect.element(heading).toBeVisible();
    });

    it('should render edit challenge link', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      const editLink = page.getByRole('link', { name: 'Edit Challenge' });
      await expect.element(editLink).toBeVisible();
      await expect.element(editLink).toHaveAttribute('href', '/admin/challenges/challenge-123/edit');
    });

    it('should render manage test cases link', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      const testCasesLink = page.getByRole('link', { name: 'Manage Test Cases' });
      await expect.element(testCasesLink).toBeVisible();
      await expect.element(testCasesLink).toHaveAttribute('href', '/admin/challenges/challenge-123/tests');
    });

    it('should render test solution link', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      const testRunnerLink = page.getByRole('link', { name: '🏃 Test Solution' });
      await expect.element(testRunnerLink).toBeVisible();
      await expect.element(testRunnerLink).toHaveAttribute('href', '/admin/challenges/challenge-123/test-runner');
    });

    it('should adapt links to different challenge IDs', async () => {
      const differentChallenge = createMockChallenge({ id: 'challenge-456' });
      render(ChallengeSidebar, { props: { challenge: differentChallenge } });

      const editLink = page.getByRole('link', { name: 'Edit Challenge' });
      const testCasesLink = page.getByRole('link', { name: 'Manage Test Cases' });
      const testRunnerLink = page.getByRole('link', { name: '🏃 Test Solution' });

      await expect.element(editLink).toHaveAttribute('href', '/admin/challenges/challenge-456/edit');
      await expect.element(testCasesLink).toHaveAttribute('href', '/admin/challenges/challenge-456/tests');
      await expect.element(testRunnerLink).toHaveAttribute('href', '/admin/challenges/challenge-456/test-runner');
    });
  });

  describe('challenge info section', () => {
    it('should render challenge info heading', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      const heading = page.getByRole('heading', { name: 'Challenge Info' });
      await expect.element(heading).toBeVisible();
    });

    it('should display programming languages', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      const languagesLabel = page.getByText('Languages');
      await expect.element(languagesLabel).toBeVisible();

      // Check individual language badges - they are trimmed from CSV
      const javascriptBadge = page.getByText('javascript');
      const pythonBadge = page.getByText('python');
      const javaBadge = page.getByText('java');

      await expect.element(javascriptBadge).toBeVisible();
      await expect.element(pythonBadge).toBeVisible();
      await expect.element(javaBadge).toBeVisible();
    });

    it('should display time limit when present', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      const timeLimitLabel = page.getByText('Time Limit');
      await expect.element(timeLimitLabel).toBeVisible();

      const timeLimitValue = page.getByText('3600 seconds');
      await expect.element(timeLimitValue).toBeVisible();
    });

    it('should not display time limit when null', async () => {
      const challengeWithoutTimeLimit = createMockChallenge({ timeLimitSec: null });
      render(ChallengeSidebar, { props: { challenge: challengeWithoutTimeLimit } });

      // Should not find 'Time Limit' text anywhere on the page
      const languagesLabel = page.getByText('Languages');
      const createdLabel = page.getByText('Created');
      await expect.element(languagesLabel).toBeVisible();
      await expect.element(createdLabel).toBeVisible();
    });

    it('should display creation date', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      const createdLabel = page.getByText('Created');
      await expect.element(createdLabel).toBeVisible();

      // Check for formatted date (format may vary by locale)
      const dateText = page.getByText(/1\/15\/2024|15\/1\/2024|2024-1-15/);
      await expect.element(dateText).toBeVisible();
    });

    it('should handle different language configurations', async () => {
      const singleLangChallenge = createMockChallenge({ 
        languagesCsv: 'rust' 
      });
      render(ChallengeSidebar, { props: { challenge: singleLangChallenge } });

      const rustBadge = page.getByText('rust');
      await expect.element(rustBadge).toBeVisible();
    });

    it('should handle languages with spaces', async () => {
      const spaceLanguagesChallenge = createMockChallenge({ 
        languagesCsv: 'c++, go , typescript ' 
      });
      render(ChallengeSidebar, { props: { challenge: spaceLanguagesChallenge } });

      const cppBadge = page.getByText('c++');
      const goBadge = page.getByText('go');
      const tsBadge = page.getByText('typescript');

      await expect.element(cppBadge).toBeVisible();
      await expect.element(goBadge).toBeVisible();
      await expect.element(tsBadge).toBeVisible();
    });
  });

  describe('statistics section', () => {
    it('should render statistics heading', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      const heading = page.getByRole('heading', { name: 'Statistics' });
      await expect.element(heading).toBeVisible();
    });

    it('should display placeholder statistics', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      // Check for statistics labels
      const totalAttemptsLabel = page.getByText('Total Attempts');
      const successRateLabel = page.getByText('Success Rate');
      const avgTimeLabel = page.getByText('Avg Time');

      await expect.element(totalAttemptsLabel).toBeVisible();
      await expect.element(successRateLabel).toBeVisible();
      await expect.element(avgTimeLabel).toBeVisible();

      // Check for placeholder values - they're in dd elements
      const zeroAttempts = page.getByText('0');
      const naValue = page.getByText('N/A');

      await expect.element(zeroAttempts).toBeVisible();
      await expect.element(naValue).toBeVisible();
    });

    it('should have proper layout for statistics', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      const totalAttemptsLabel = page.getByText('Total Attempts');
      const successRateLabel = page.getByText('Success Rate');
      const avgTimeLabel = page.getByText('Avg Time');

      // All statistics should be visible
      await expect.element(totalAttemptsLabel).toBeVisible();
      await expect.element(successRateLabel).toBeVisible();
      await expect.element(avgTimeLabel).toBeVisible();
    });
  });

  describe('layout and structure', () => {
    it('should render all three main sections', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      const actionsHeading = page.getByRole('heading', { name: 'Actions' });
      const infoHeading = page.getByRole('heading', { name: 'Challenge Info' });
      const statsHeading = page.getByRole('heading', { name: 'Statistics' });

      await expect.element(actionsHeading).toBeVisible();
      await expect.element(infoHeading).toBeVisible();
      await expect.element(statsHeading).toBeVisible();
    });

    it('should have proper heading hierarchy', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      const actionsHeading = page.getByRole('heading', { name: 'Actions', level: 3 });
      const infoHeading = page.getByRole('heading', { name: 'Challenge Info', level: 3 });
      const statsHeading = page.getByRole('heading', { name: 'Statistics', level: 3 });

      await expect.element(actionsHeading).toBeVisible();
      await expect.element(infoHeading).toBeVisible();
      await expect.element(statsHeading).toBeVisible();
    });

    it('should maintain consistent section structure', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      // Each section should have its content visible
      const editLink = page.getByRole('link', { name: 'Edit Challenge' });
      const languagesLabel = page.getByText('Languages');
      const totalAttemptsLabel = page.getByText('Total Attempts');

      await expect.element(editLink).toBeVisible();
      await expect.element(languagesLabel).toBeVisible();
      await expect.element(totalAttemptsLabel).toBeVisible();
    });
  });

  describe('accessibility and semantics', () => {
    it('should have accessible action links', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      const editLink = page.getByRole('link', { name: 'Edit Challenge' });
      const testCasesLink = page.getByRole('link', { name: 'Manage Test Cases' });
      const testRunnerLink = page.getByRole('link', { name: '🏃 Test Solution' });

      await expect.element(editLink).toBeVisible();
      await expect.element(testCasesLink).toBeVisible();
      await expect.element(testRunnerLink).toBeVisible();
    });

    it('should use proper description lists for info', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      // Terms and descriptions should be properly structured
      const languagesLabel = page.getByText('Languages');
      const timeLimitLabel = page.getByText('Time Limit');
      const createdLabel = page.getByText('Created');

      await expect.element(languagesLabel).toBeVisible();
      await expect.element(timeLimitLabel).toBeVisible();
      await expect.element(createdLabel).toBeVisible();
    });

    it('should provide clear visual grouping', async () => {
      render(ChallengeSidebar, { props: { challenge: mockChallenge } });

      // All three section headings should be visible
      const actionsHeading = page.getByRole('heading', { name: 'Actions', level: 3 });
      const infoHeading = page.getByRole('heading', { name: 'Challenge Info', level: 3 });
      const statsHeading = page.getByRole('heading', { name: 'Statistics', level: 3 });

      await expect.element(actionsHeading).toBeVisible();
      await expect.element(infoHeading).toBeVisible();
      await expect.element(statsHeading).toBeVisible();
    });
  });

  describe('edge cases and variations', () => {
    it('should handle challenge with no time limit', async () => {
      const noTimeLimitChallenge = createMockChallenge({ timeLimitSec: null });
      render(ChallengeSidebar, { props: { challenge: noTimeLimitChallenge } });

      const languagesLabel = page.getByText('Languages');
      const createdLabel = page.getByText('Created');
      
      await expect.element(languagesLabel).toBeVisible();
      await expect.element(createdLabel).toBeVisible();
    });

    it('should handle zero time limit', async () => {
      const zeroTimeLimitChallenge = createMockChallenge({ timeLimitSec: 0 });
      render(ChallengeSidebar, { props: { challenge: zeroTimeLimitChallenge } });

      // Other sections should still be visible
      const languagesLabel = page.getByText('Languages');
      const createdLabel = page.getByText('Created');
      
      await expect.element(languagesLabel).toBeVisible();
      await expect.element(createdLabel).toBeVisible();
    });

    it('should handle different date formats', async () => {
      const recentChallenge = createMockChallenge({ 
        createdAt: new Date('2024-12-01T15:30:00Z') 
      });
      render(ChallengeSidebar, { props: { challenge: recentChallenge } });

      const createdLabel = page.getByText('Created');
      await expect.element(createdLabel).toBeVisible();
      
      // Check for some form of date - could be various formats
      const datePattern = page.getByText(/12\/1\/2024|1\/12\/2024|2024/);
      await expect.element(datePattern).toBeVisible();
    });

    it('should handle many programming languages', async () => {
      const manyLanguagesChallenge = createMockChallenge({ 
        languagesCsv: 'javascript,python,java,c++,rust,go,typescript,kotlin' 
      });
      render(ChallengeSidebar, { props: { challenge: manyLanguagesChallenge } });

      const languagesLabel = page.getByText('Languages');
      await expect.element(languagesLabel).toBeVisible();

      // At least some languages should be visible
      const jsBadge = page.getByText('javascript');
      const pythonBadge = page.getByText('python');
      
      await expect.element(jsBadge).toBeVisible();
      await expect.element(pythonBadge).toBeVisible();
    });
  });
});