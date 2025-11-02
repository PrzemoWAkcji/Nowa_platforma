import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Results Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should navigate to results page", async ({ page }) => {
    await page.goto("/results");
    await expect(page).toHaveURL("/results");
    await expect(page.getByRole("heading", { name: "Wyniki" })).toBeVisible();
  });

  test("should add track result", async ({ page }) => {
    await page.goto("/results");
    await page.click('[data-testid="add-result-button"]');

    await page.selectOption('[data-testid="event-select"]', "100m Men");
    await page.selectOption('[data-testid="athlete-select"]', "Jan Testowy");
    await page.fill('[data-testid="result-time"]', "10.50");
    await page.fill('[data-testid="result-wind"]', "1.2");
    await page.selectOption('[data-testid="result-place"]', "1");
    await page.fill('[data-testid="result-notes"]', "Personal best");

    await page.click('[data-testid="save-result-button"]');
    await expect(page.locator("text=Result added successfully")).toBeVisible();
  });

  test("should add field result", async ({ page }) => {
    await page.goto("/results");
    await page.click('[data-testid="add-result-button"]');

    await page.selectOption('[data-testid="event-select"]', "Shot Put Women");
    await page.selectOption('[data-testid="athlete-select"]', "Maria Testowa");
    await page.fill('[data-testid="result-distance"]', "15.25");
    await page.selectOption('[data-testid="result-place"]', "1");
    await page.fill('[data-testid="result-notes"]', "Season best");

    await page.click('[data-testid="save-result-button"]');
    await expect(page.locator("text=Result added successfully")).toBeVisible();
  });

  test("should edit result", async ({ page }) => {
    await page.goto("/results");
    await page.click('[data-testid="edit-result-button"]');

    await page.fill('[data-testid="result-time"]', "10.45");
    await page.click('[data-testid="save-result-button"]');

    await expect(
      page.locator("text=Result updated successfully")
    ).toBeVisible();
  });

  test("should delete result", async ({ page }) => {
    await page.goto("/results");
    await page.click('[data-testid="delete-result-button"]');
    await page.click('[data-testid="confirm-delete-button"]');

    await expect(
      page.locator("text=Result deleted successfully")
    ).toBeVisible();
  });

  test("should filter results by event", async ({ page }) => {
    await page.goto("/results");
    await page.selectOption('[data-testid="event-filter"]', "100m Men");
    await expect(page.locator('[data-testid="result-card"]')).toHaveCount({
      min: 1,
    });
  });

  test("should filter results by athlete", async ({ page }) => {
    await page.goto("/results");
    await page.selectOption('[data-testid="athlete-filter"]', "Jan Testowy");
    await expect(page.locator('[data-testid="result-card"]')).toHaveCount({
      min: 1,
    });
  });

  test("should filter results by competition", async ({ page }) => {
    await page.goto("/results");
    await page.selectOption(
      '[data-testid="competition-filter"]',
      "Test Competition"
    );
    await expect(page.locator('[data-testid="result-card"]')).toHaveCount({
      min: 1,
    });
  });

  test("should import results from finishlynx", async ({ page }) => {
    await page.goto("/results");
    await page.click('[data-testid="import-finishlynx-button"]');

    await page.setInputFiles(
      '[data-testid="file-input"]',
      "test-files/finishlynx-results.txt"
    );
    await page.click('[data-testid="import-button"]');

    await expect(
      page.locator("text=Results imported successfully")
    ).toBeVisible();
  });

  test("should export results to CSV", async ({ page }) => {
    await page.goto("/results");
    await page.click('[data-testid="export-results-button"]');

    const downloadPromise = page.waitForEvent("download");
    await page.click('[data-testid="download-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("results.csv");
  });

  test("should view result statistics", async ({ page }) => {
    await page.goto("/results");
    await page.click('[data-testid="result-stats-button"]');

    await expect(
      page.locator('[data-testid="result-stats-modal"]')
    ).toBeVisible();
    await expect(page.locator("text=Average Time")).toBeVisible();
    await expect(page.locator("text=Best Result")).toBeVisible();
  });

  test("should validate result times", async ({ page }) => {
    await page.goto("/results");
    await page.click('[data-testid="add-result-button"]');

    await page.selectOption('[data-testid="event-select"]', "100m Men");
    await page.selectOption('[data-testid="athlete-select"]', "Jan Testowy");
    await page.fill('[data-testid="result-time"]', "5.00"); // Invalid time

    await page.click('[data-testid="save-result-button"]');
    await expect(
      page.locator("text=Invalid time for this event")
    ).toBeVisible();
  });

  test("should mark result as personal best", async ({ page }) => {
    await page.goto("/results");
    await page.click('[data-testid="mark-pb-button"]');

    await expect(page.locator("text=Marked as personal best")).toBeVisible();
    await expect(page.locator('[data-testid="pb-badge"]')).toBeVisible();
  });

  test("should mark result as season best", async ({ page }) => {
    await page.goto("/results");
    await page.click('[data-testid="mark-sb-button"]');

    await expect(page.locator("text=Marked as season best")).toBeVisible();
    await expect(page.locator('[data-testid="sb-badge"]')).toBeVisible();
  });

  test("should view live results", async ({ page }) => {
    await page.goto("/results");
    await page.click('[data-testid="live-results-button"]');

    await expect(
      page.locator('[data-testid="live-results-modal"]')
    ).toBeVisible();
    await expect(page.locator("text=Live Results")).toBeVisible();
  });

  test("should generate minute program", async ({ page }) => {
    await page.goto("/results");
    await page.click('[data-testid="minute-program-button"]');

    await expect(
      page.locator('[data-testid="minute-program-modal"]')
    ).toBeVisible();
    await page.click('[data-testid="generate-program-button"]');

    await expect(page.locator("text=Minute program generated")).toBeVisible();
  });
});
