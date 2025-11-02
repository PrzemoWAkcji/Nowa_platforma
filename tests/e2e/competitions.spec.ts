import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Competitions Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should navigate to competitions page", async ({ page }) => {
    await page.getByRole("link", { name: "Wszystkie zawody" }).click();
    await page.waitForURL("/competitions");
    await expect(page).toHaveURL("/competitions");
    await expect(page.getByRole("heading", { name: "Zawody" })).toBeVisible();
  });

  test("should create new competition", async ({ page }) => {
    await page.goto("/competitions");
    await page.click('[data-testid="create-competition-button"]');

    await page.fill(
      '[data-testid="competition-name"]',
      "Test Competition 2025"
    );
    await page.fill('[data-testid="competition-location"]', "Test Stadium");
    await page.fill('[data-testid="competition-start-date"]', "2025-08-15");
    await page.fill('[data-testid="competition-end-date"]', "2025-08-17");
    await page.selectOption(
      '[data-testid="competition-category"]',
      "Mistrzostwa"
    );
    await page.fill(
      '[data-testid="competition-description"]',
      "Test competition description"
    );

    await page.click('[data-testid="save-competition-button"]');
    await expect(page.locator("text=Test Competition 2025")).toBeVisible();
  });

  test("should view competition details", async ({ page }) => {
    await page.goto("/competitions");
    await page.click('[data-testid="competition-details-button"]');
    await expect(
      page.locator('[data-testid="competition-details-modal"]')
    ).toBeVisible();
  });

  test("should edit competition", async ({ page }) => {
    await page.goto("/competitions");
    await page.click('[data-testid="edit-competition-button"]');

    await page.fill(
      '[data-testid="competition-name"]',
      "Updated Competition Name"
    );
    await page.click('[data-testid="save-competition-button"]');

    await expect(page.locator("text=Updated Competition Name")).toBeVisible();
  });

  test("should delete competition", async ({ page }) => {
    await page.goto("/competitions");
    await page.click('[data-testid="delete-competition-button"]');
    await page.click('[data-testid="confirm-delete-button"]');

    await expect(
      page.locator("text=Competition deleted successfully")
    ).toBeVisible();
  });

  test("should filter competitions by status", async ({ page }) => {
    await page.goto("/competitions");
    await page.selectOption('[data-testid="status-filter"]', "DRAFT");
    await expect(page.locator('[data-testid="competition-card"]')).toHaveCount(
      0
    );
  });

  test("should import startlist for competition", async ({ page }) => {
    await page.goto("/competitions");
    await page.click('[data-testid="import-startlist-button"]');

    await page.setInputFiles(
      '[data-testid="file-input"]',
      "test-files/startlist-pzla.csv"
    );
    await page.click('[data-testid="import-button"]');

    await expect(
      page.locator("text=Startlist imported successfully")
    ).toBeVisible();
  });

  test("should toggle live results", async ({ page }) => {
    await page.goto("/competitions");
    await page.click('[data-testid="live-results-toggle"]');

    await expect(page.locator("text=Live results enabled")).toBeVisible();
  });

  test("should manage competition logos", async ({ page }) => {
    await page.goto("/competitions");
    await page.click('[data-testid="manage-logos-button"]');

    await expect(
      page.locator('[data-testid="logo-manager-modal"]')
    ).toBeVisible();

    await page.setInputFiles(
      '[data-testid="logo-upload"]',
      "test-files/logo.png"
    );
    await page.click('[data-testid="upload-logo-button"]');

    await expect(page.locator("text=Logo uploaded successfully")).toBeVisible();
  });

  test("should export competition data", async ({ page }) => {
    await page.goto("/competitions");
    await page.click('[data-testid="export-button"]');

    await expect(page.locator('[data-testid="export-modal"]')).toBeVisible();
    await page.click('[data-testid="export-csv-button"]');

    // Check if download started
    const downloadPromise = page.waitForEvent("download");
    await page.click('[data-testid="download-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("competition-data.csv");
  });
});
