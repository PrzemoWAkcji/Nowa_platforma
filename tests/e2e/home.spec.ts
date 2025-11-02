import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display main landing page', async ({ page }) => {
    await expect(page).toHaveTitle(/Athletics Platform/);
    await expect(page.locator('text=Athletics Platform')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    await expect(page.locator('text=Zawody')).toBeVisible();
    await expect(page.locator('text=Demo')).toBeVisible();
    await expect(page.locator('text=O nas')).toBeVisible();
    await expect(page.locator('text=Kontakt')).toBeVisible();
  });

  test('should display competition cards', async ({ page }) => {
    await expect(page.locator('text=Mistrzostwa Polski Seniorów 2025')).toBeVisible();
    await expect(page.locator('text=Memoriał Janusza Kusocińskiego')).toBeVisible();
    await expect(page.locator('text=Młodzieżowe Mistrzostwa Województwa')).toBeVisible();
  });

  test('should filter competitions by status', async ({ page }) => {
    await page.selectOption('[data-testid="status-filter"]', 'REGISTRATION_OPEN');
    await expect(page.locator('text=Mistrzostwa Polski Seniorów 2025')).toBeVisible();
    await expect(page.locator('text=Memoriał Janusza Kusocińskiego')).toBeVisible();
  });

  test('should filter competitions by category', async ({ page }) => {
    await page.selectOption('[data-testid="category-filter"]', 'Mistrzostwa');
    await expect(page.locator('text=Mistrzostwa Polski Seniorów 2025')).toBeVisible();
  });

  test('should search competitions', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'Mistrzostwa');
    await expect(page.locator('text=Mistrzostwa Polski Seniorów 2025')).toBeVisible();
    await expect(page.locator('text=Młodzieżowe Mistrzostwa Województwa')).toBeVisible();
  });

  test('should open competition details modal', async ({ page }) => {
    await page.click('[data-testid="view-details-button"]');
    await expect(page.locator('[data-testid="competition-details-modal"]')).toBeVisible();
  });

  test('should open demo modal', async ({ page }) => {
    await page.click('text=Demo');
    await expect(page.locator('[data-testid="demo-modal"]')).toBeVisible();
  });

  test('should scroll to competitions section', async ({ page }) => {
    await page.click('text=Zawody');
    await expect(page.locator('#competitions')).toBeInViewport();
  });

  test('should navigate to competition registration', async ({ page }) => {
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="registration-modal"]')).toBeVisible();
  });
});