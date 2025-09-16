import { Page } from '@playwright/test';

/**
 * Login as admin user using dev credentials
 */
export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/admin');
}

/**
 * Check if user is already logged in, login if not
 */
export async function ensureAdminLogin(page: Page) {
  await page.goto('/admin');

  // If redirected to login page, perform login
  if (page.url().includes('/login')) {
    await loginAsAdmin(page);
  }
}