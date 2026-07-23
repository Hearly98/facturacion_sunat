import { test as setup, expect } from '@playwright/test';

const authFile = 'e2e/.auth/user.json';

const EMAIL = process.env['E2E_EMAIL'] ?? 'ux-review-test@local.com';
const PASSWORD = process.env['E2E_PASSWORD'] ?? 'UxReview2026!';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
