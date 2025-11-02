import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Athletes Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should navigate to athletes page", async ({ page }) => {
    await page.getByRole("link", { name: "Zawodnicy" }).click();
    await page.waitForURL("/athletes");
    await expect(page).toHaveURL("/athletes");
    await expect(
      page.getByRole("heading", { name: "Zawodnicy" })
    ).toBeVisible();
  });

  test("should create new athlete", async ({ page }) => {
    await page.goto("/athletes");
    await page.click('[data-testid="create-athlete-button"]');

    await page.fill('[data-testid="athlete-first-name"]', "Jan");
    await page.fill('[data-testid="athlete-last-name"]', "Testowy");
    await page.fill('[data-testid="athlete-email"]', "jan.testowy@email.com");
    await page.fill('[data-testid="athlete-phone"]', "+48123456789");
    await page.fill('[data-testid="athlete-birth-date"]', "1990-01-01");
    await page.selectOption('[data-testid="athlete-gender"]', "MALE");
    await page.fill('[data-testid="athlete-club"]', "Test Club");
    await page.fill('[data-testid="athlete-license-number"]', "TC001");

    await page.click('[data-testid="save-athlete-button"]');
    await expect(page.locator("text=Jan Testowy")).toBeVisible();
  });

  test("should view athlete details", async ({ page }) => {
    await page.goto("/athletes");
    await page.click('[data-testid="athlete-details-button"]');
    await expect(
      page.locator('[data-testid="athlete-details-modal"]')
    ).toBeVisible();
  });

  test("should edit athlete", async ({ page }) => {
    await page.goto("/athletes");
    await page.click('[data-testid="edit-athlete-button"]');

    await page.fill('[data-testid="athlete-first-name"]', "Janusz");
    await page.click('[data-testid="save-athlete-button"]');

    await expect(page.locator("text=Janusz")).toBeVisible();
  });

  test("should delete athlete", async ({ page }) => {
    await page.goto("/athletes");
    await page.click('[data-testid="delete-athlete-button"]');
    await page.click('[data-testid="confirm-delete-button"]');

    await expect(
      page.locator("text=Athlete deleted successfully")
    ).toBeVisible();
  });

  test("should search athletes", async ({ page }) => {
    await page.goto("/athletes");
    await page.fill('[data-testid="search-input"]', "Jan");
    await expect(page.locator("text=Jan")).toBeVisible();
  });

  test("should filter athletes by gender", async ({ page }) => {
    await page.goto("/athletes");
    await page.selectOption('[data-testid="gender-filter"]', "MALE");
    await expect(page.locator('[data-testid="athlete-card"]')).toHaveCount({
      min: 1,
    });
  });

  test("should filter athletes by club", async ({ page }) => {
    await page.goto("/athletes");
    await page.selectOption('[data-testid="club-filter"]', "Test Club");
    await expect(page.locator('[data-testid="athlete-card"]')).toHaveCount({
      min: 1,
    });
  });

  test("should import athletes from CSV", async ({ page }) => {
    await page.goto("/athletes");
    await page.click('[data-testid="import-athletes-button"]');

    await page.setInputFiles(
      '[data-testid="file-input"]',
      "test-files/athletes.csv"
    );
    await page.click('[data-testid="import-button"]');

    await expect(
      page.locator("text=Athletes imported successfully")
    ).toBeVisible();
  });

  test("should export athletes to CSV", async ({ page }) => {
    await page.goto("/athletes");
    await page.click('[data-testid="export-athletes-button"]');

    const downloadPromise = page.waitForEvent("download");
    await page.click('[data-testid="download-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("athletes.csv");
  });

  test("should view athlete statistics", async ({ page }) => {
    await page.goto("/athletes");
    await page.click('[data-testid="athlete-stats-button"]');

    await expect(
      page.locator('[data-testid="athlete-stats-modal"]')
    ).toBeVisible();
    await expect(page.locator("text=Personal Best")).toBeVisible();
    await expect(page.locator("text=Season Best")).toBeVisible();
  });

  test("should view athlete records", async ({ page }) => {
    await page.goto("/athletes");
    await page.click('[data-testid="athlete-records-button"]');

    await expect(
      page.locator('[data-testid="athlete-records-modal"]')
    ).toBeVisible();
    await expect(page.locator("text=Personal Records")).toBeVisible();
  });

  test("should create athlete profile for coach", async ({ page }) => {
    // Login as coach using test button
    await page.goto("/");
    await page.getByRole("button", { name: "Wyloguj" }).click();
    await page.click("text=Zaloguj jako Trener");

    await page.goto("/athletes");
    await page.click('[data-testid="create-athlete-button"]');

    await page.fill('[data-testid="athlete-first-name"]', "Athlete");
    await page.fill('[data-testid="athlete-last-name"]', "Under Coach");
    await page.fill('[data-testid="athlete-email"]', "athlete.coach@email.com");
    await page.fill('[data-testid="athlete-birth-date"]', "1995-01-01");
    await page.selectOption('[data-testid="athlete-gender"]', "FEMALE");

    await page.click('[data-testid="save-athlete-button"]');
    await expect(page.locator("text=Athlete Under Coach")).toBeVisible();
  });
});
