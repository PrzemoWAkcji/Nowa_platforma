import { expect, test } from "@playwright/test";

test.describe("Combined Events Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin using test button
    await page.goto("/");
    await page.click("text=Zaloguj jako Admin");
    await expect(page).toHaveURL("/dashboard");
  });

  test("should navigate to combined events page", async ({ page }) => {
    await page.click("text=Wieloboje");
    await expect(page).toHaveURL("/combined-events");
    await expect(page.locator("text=Zarządzaj wielobojami")).toBeVisible();
  });

  test("should create new decathlon event", async ({ page }) => {
    await page.goto("/combined-events");
    await page.click('[data-testid="create-combined-event-button"]');

    await page.fill('[data-testid="event-name"]', "Decathlon Men 2025");
    await page.selectOption('[data-testid="event-type"]', "DECATHLON");
    await page.selectOption('[data-testid="event-gender"]', "MALE");
    await page.selectOption('[data-testid="event-category"]', "SENIOR");
    await page.selectOption(
      '[data-testid="competition-select"]',
      "Test Competition"
    );
    await page.fill('[data-testid="event-date"]', "2025-08-15");

    await page.click('[data-testid="save-combined-event-button"]');
    await expect(page.locator("text=Decathlon Men 2025")).toBeVisible();
  });

  test("should create new heptathlon event", async ({ page }) => {
    await page.goto("/combined-events");
    await page.click('[data-testid="create-combined-event-button"]');

    await page.fill('[data-testid="event-name"]', "Heptathlon Women 2025");
    await page.selectOption('[data-testid="event-type"]', "HEPTATHLON");
    await page.selectOption('[data-testid="event-gender"]', "FEMALE");
    await page.selectOption('[data-testid="event-category"]', "SENIOR");
    await page.selectOption(
      '[data-testid="competition-select"]',
      "Test Competition"
    );
    await page.fill('[data-testid="event-date"]', "2025-08-16");

    await page.click('[data-testid="save-combined-event-button"]');
    await expect(page.locator("text=Heptathlon Women 2025")).toBeVisible();
  });

  test("should register athlete for combined event", async ({ page }) => {
    await page.goto("/combined-events");
    await page.click('[data-testid="register-athlete-button"]');

    await page.selectOption('[data-testid="athlete-select"]', "Jan Testowy");
    await page.selectOption(
      '[data-testid="combined-event-select"]',
      "Decathlon Men 2025"
    );
    await page.fill(
      '[data-testid="registration-notes"]',
      "Registration for decathlon"
    );

    await page.click('[data-testid="save-registration-button"]');
    await expect(
      page.locator("text=Athlete registered successfully")
    ).toBeVisible();
  });

  test("should add result to combined event discipline", async ({ page }) => {
    await page.goto("/combined-events");
    await page.click('[data-testid="combined-event-details-button"]');

    await page.click('[data-testid="add-discipline-result-button"]');
    await page.selectOption('[data-testid="discipline-select"]', "100m");
    await page.selectOption('[data-testid="athlete-select"]', "Jan Testowy");
    await page.fill('[data-testid="result-time"]', "10.80");
    await page.fill('[data-testid="result-wind"]', "1.5");

    await page.click('[data-testid="save-discipline-result-button"]');
    await expect(page.locator("text=Result added successfully")).toBeVisible();
  });

  test("should calculate combined event points", async ({ page }) => {
    await page.goto("/combined-events");
    await page.click('[data-testid="combined-event-details-button"]');

    await page.click('[data-testid="calculate-points-button"]');
    await expect(
      page.locator("text=Points calculated successfully")
    ).toBeVisible();
    await expect(page.locator('[data-testid="total-points"]')).toBeVisible();
  });

  test("should view combined event ranking", async ({ page }) => {
    await page.goto("/combined-events");
    await page.click('[data-testid="view-ranking-button"]');

    await expect(page.locator('[data-testid="ranking-modal"]')).toBeVisible();
    await expect(page.locator("text=Combined Event Ranking")).toBeVisible();
    await expect(page.locator('[data-testid="ranking-table"]')).toBeVisible();
  });

  test("should export combined event results", async ({ page }) => {
    await page.goto("/combined-events");
    await page.click('[data-testid="export-combined-event-button"]');

    const downloadPromise = page.waitForEvent("download");
    await page.click('[data-testid="download-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("combined-event-results.csv");
  });

  test("should edit combined event result", async ({ page }) => {
    await page.goto("/combined-events");
    await page.click('[data-testid="combined-event-details-button"]');

    await page.click('[data-testid="edit-discipline-result-button"]');
    await page.fill('[data-testid="result-time"]', "10.75");
    await page.click('[data-testid="save-discipline-result-button"]');

    await expect(
      page.locator("text=Result updated successfully")
    ).toBeVisible();
  });

  test("should delete combined event result", async ({ page }) => {
    await page.goto("/combined-events");
    await page.click('[data-testid="combined-event-details-button"]');

    await page.click('[data-testid="delete-discipline-result-button"]');
    await page.click('[data-testid="confirm-delete-button"]');

    await expect(
      page.locator("text=Result deleted successfully")
    ).toBeVisible();
  });

  test("should split combined event by day", async ({ page }) => {
    await page.goto("/combined-events");
    await page.click('[data-testid="split-event-button"]');

    await page.selectOption('[data-testid="split-option"]', "BY_DAY");
    await page.click('[data-testid="confirm-split-button"]');

    await expect(page.locator("text=Event split successfully")).toBeVisible();
  });

  test("should view combined event statistics", async ({ page }) => {
    await page.goto("/combined-events");
    await page.click('[data-testid="event-statistics-button"]');

    await expect(
      page.locator('[data-testid="statistics-modal"]')
    ).toBeVisible();
    await expect(page.locator("text=Event Statistics")).toBeVisible();
    await expect(page.locator("text=Average Points")).toBeVisible();
    await expect(page.locator("text=Best Performance")).toBeVisible();
  });

  test("should validate combined event discipline results", async ({
    page,
  }) => {
    await page.goto("/combined-events");
    await page.click('[data-testid="combined-event-details-button"]');

    await page.click('[data-testid="add-discipline-result-button"]');
    await page.selectOption('[data-testid="discipline-select"]', "100m");
    await page.selectOption('[data-testid="athlete-select"]', "Jan Testowy");
    await page.fill('[data-testid="result-time"]', "5.00"); // Invalid time

    await page.click('[data-testid="save-discipline-result-button"]');
    await expect(
      page.locator("text=Invalid result for this discipline")
    ).toBeVisible();
  });

  test("should create pentathlon u16 event", async ({ page }) => {
    await page.goto("/combined-events");
    await page.click('[data-testid="create-combined-event-button"]');

    await page.fill('[data-testid="event-name"]', "Pentathlon U16 Boys");
    await page.selectOption('[data-testid="event-type"]', "PENTATHLON_U16");
    await page.selectOption('[data-testid="event-gender"]', "MALE");
    await page.selectOption('[data-testid="event-category"]', "U16");
    await page.selectOption(
      '[data-testid="competition-select"]',
      "Test Competition"
    );
    await page.fill('[data-testid="event-date"]', "2025-08-17");

    await page.click('[data-testid="save-combined-event-button"]');
    await expect(page.locator("text=Pentathlon U16 Boys")).toBeVisible();
  });

  test("should bulk register athletes for combined event", async ({ page }) => {
    await page.goto("/combined-events");
    await page.click('[data-testid="bulk-register-button"]');

    await page.selectOption(
      '[data-testid="combined-event-select"]',
      "Decathlon Men 2025"
    );
    await page.click('[data-testid="select-all-athletes-checkbox"]');
    await page.click('[data-testid="bulk-register-submit-button"]');

    await expect(
      page.locator("text=Bulk registration completed")
    ).toBeVisible();
  });
});
