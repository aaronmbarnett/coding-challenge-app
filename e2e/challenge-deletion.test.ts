import { test, expect } from './fixtures/test-fixtures';
import { navigateToChallenge } from './helpers/test-data';

test.describe('Challenge Deletion', () => {

  test('should show delete confirmation dialog', async ({ adminPage, cleanChallenge }) => {
    // Create a test challenge using fixture
    await cleanChallenge.create();

    // Navigate to the challenge details
    await navigateToChallenge(adminPage, cleanChallenge.title);

    // Click the delete button with mobile-friendly strategy
    const deleteButton = adminPage.locator('[data-testid="delete-challenge-button"]')
      .or(adminPage.locator('button:has-text("Delete")'));

    // Scroll element into view and force click for mobile compatibility
    await deleteButton.scrollIntoViewIfNeeded();
    await deleteButton.click({ force: true });

    // Verify confirmation dialog appears
    await expect(adminPage.locator('[data-testid="delete-confirmation-dialog"]')
      .or(adminPage.locator('text=Are you sure?'))).toBeVisible();
    await expect(adminPage.locator('[data-testid="confirm-delete-button"]')
      .or(adminPage.locator('button:has-text("Yes, Delete")'))).toBeVisible();
    await expect(adminPage.locator('[data-testid="cancel-delete-button"]')
      .or(adminPage.locator('button:has-text("Cancel")'))).toBeVisible();
  });

  test('should cancel deletion when cancel is clicked', async ({ adminPage, cleanChallenge }) => {
    // Create a test challenge using fixture
    await cleanChallenge.create();

    // Navigate to challenge details
    await navigateToChallenge(adminPage, cleanChallenge.title);

    // Click delete then cancel with mobile-friendly strategy
    const deleteButton = adminPage.locator('[data-testid="delete-challenge-button"]')
      .or(adminPage.locator('button:has-text("Delete")'));

    await deleteButton.scrollIntoViewIfNeeded();
    await deleteButton.click({ force: true });

    const cancelButton = adminPage.locator('[data-testid="cancel-delete-button"]')
      .or(adminPage.locator('button:has-text("Cancel")'));
    await cancelButton.click({ force: true });

    // Verify we're back to normal state
    await expect(adminPage.locator('[data-testid="delete-confirmation-dialog"]')
      .or(adminPage.locator('text=Are you sure?'))).not.toBeVisible();
    await expect(deleteButton).toBeVisible();

    // Verify challenge still exists
    await adminPage.goto('/admin/challenges');
    await adminPage.waitForLoadState('networkidle');
    await expect(adminPage.locator(`[data-testid="challenge-${cleanChallenge.title}"]`)
      .or(adminPage.locator(`text=${cleanChallenge.title}`))).toBeVisible();
  });

  test('should delete challenge successfully', async ({ adminPage, cleanChallenge }) => {
    // Create a test challenge using fixture
    await cleanChallenge.create();

    // Navigate to challenge details
    await navigateToChallenge(adminPage, cleanChallenge.title);

    // Perform deletion with mobile-friendly strategy
    const deleteButton = adminPage.locator('[data-testid="delete-challenge-button"]')
      .or(adminPage.locator('button:has-text("Delete")'));

    await deleteButton.scrollIntoViewIfNeeded();
    await deleteButton.click({ force: true });

    const confirmButton = adminPage.locator('[data-testid="confirm-delete-button"]')
      .or(adminPage.locator('button:has-text("Yes, Delete")'));
    await confirmButton.click({ force: true });

    // Should redirect to challenges list
    await adminPage.waitForURL('/admin/challenges', { timeout: 10000 });
    await adminPage.waitForLoadState('networkidle');

    // Verify challenge is no longer in the list
    await expect(adminPage.locator(`[data-testid="challenge-${cleanChallenge.title}"]`)
      .or(adminPage.locator(`text=${cleanChallenge.title}`))).not.toBeVisible();
  });

  test('should show error when deleting challenge with constraints', async ({ adminPage, cleanChallenge }) => {
    // This test would require setting up a challenge with sessions/attempts
    // For now, we'll skip it but the structure shows how to test error cases
    test.skip('Need to implement test data with constraints');
  });
});