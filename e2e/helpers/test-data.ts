import { Page, expect } from '@playwright/test';

/**
 * Create a test challenge through the UI with proper waiting
 */
export async function createTestChallenge(page: Page, challengeData: {
  title: string;
  description: string;
  languages: string;
  starterCode?: string;
  timeLimit?: string;
}) {
  await page.goto('/admin/challenges/new');

  // Wait for form to be fully loaded
  await page.waitForLoadState('networkidle');
  await expect(page.locator('input[name="title"]')).toBeVisible();

  // Fill out the challenge form with proper waiting
  await page.fill('input[name="title"]', challengeData.title);
  await page.fill('textarea[name="description"]', challengeData.description);
  await page.fill('input[name="languages"]', challengeData.languages);

  if (challengeData.starterCode) {
    await page.fill('textarea[name="starterCode"]', challengeData.starterCode);
  }

  if (challengeData.timeLimit) {
    await page.fill('input[name="timeLimit"]', challengeData.timeLimit);
  }

  // Submit the form and wait for success
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeVisible();
  await submitButton.click();

  // Wait for redirect and verify we're on challenges list
  await page.waitForURL('/admin/challenges', { timeout: 10000 });
  await page.waitForLoadState('networkidle');

  // Verify the challenge was created with better error handling
  const challengeLocator = page.locator(`[data-testid="challenge-${challengeData.title}"]`)
    .or(page.locator(`text=${challengeData.title}`));
  await expect(challengeLocator).toBeVisible({ timeout: 10000 });
}

/**
 * Navigate to a challenge by title and return the challenge ID from URL
 */
export async function navigateToChallenge(page: Page, title: string): Promise<string> {
  await page.goto('/admin/challenges');

  // Wait for challenges to load and look for the title
  await page.waitForLoadState('networkidle');

  try {
    // Click on "View" link for the challenge with the given title
    // Use better selector strategy with fallback
    const challengeRow = page.locator('tr', {
      has: page.locator(`[data-testid="challenge-${title}"]`)
        .or(page.locator(`text=${title}`))
    });

    const viewLink = challengeRow.locator('[data-testid="view-challenge-link"]')
      .or(challengeRow.locator('a:has-text("View")'));

    await expect(viewLink).toBeVisible({ timeout: 5000 });
    await viewLink.first().click();

    // Wait for navigation to challenge details page with proper timeout
    await page.waitForURL(/\/admin\/challenges\/[^\/]+$/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Extract challenge ID from URL
    const url = page.url();
    const match = url.match(/\/admin\/challenges\/([^\/]+)$/);
    if (!match) {
      throw new Error(`Could not extract challenge ID from URL: ${url}`);
    }

    return match[1];
  } catch (error) {
    throw new Error(`Failed to navigate to challenge "${title}": ${error.message}`);
  }
}

/**
 * Clean up test data by deleting a challenge
 */
export async function deleteTestChallenge(page: Page, challengeTitle: string) {
  try {
    await page.goto('/admin/challenges');
    await page.waitForLoadState('networkidle');

    // Check if challenge exists first with better selector strategy
    const challengeLocator = page.locator(`[data-testid="challenge-${challengeTitle}"]`)
      .or(page.locator(`text=${challengeTitle}`));

    const challengeExists = await challengeLocator.first().isVisible({ timeout: 3000 });
    if (!challengeExists) {
      console.log(`Challenge "${challengeTitle}" not found for cleanup`);
      return;
    }

    await navigateToChallenge(page, challengeTitle);

    // Use improved selectors for deletion with mobile compatibility
    const deleteButton = page.locator('[data-testid="delete-challenge-button"]')
      .or(page.locator('button:has-text("Delete")'));

    await deleteButton.scrollIntoViewIfNeeded();
    await deleteButton.click({ force: true });

    const confirmButton = page.locator('[data-testid="confirm-delete-button"]')
      .or(page.locator('button:has-text("Yes, Delete")'));
    await confirmButton.click({ force: true });

    await page.waitForURL('/admin/challenges', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  } catch (error) {
    // Challenge might not exist, which is fine for cleanup
    console.log(`Challenge "${challengeTitle}" cleanup failed:`, error.message);
  }
}