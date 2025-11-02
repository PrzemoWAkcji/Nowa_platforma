import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Registrations Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should navigate to registrations page", async ({ page }) => {
    await page.goto("/registrations");
    await expect(page).toHaveURL("/registrations");
    await expect(
      page.getByRole("heading", { name: "Rejestracje" })
    ).toBeVisible();
  });

  test("should create new registration", async ({ page }) => {
    await page.goto("/registrations");
    await page.click('[data-testid="create-registration-button"]');

    await page.selectOption('[data-testid="athlete-select"]', "Jan Testowy");
    await page.selectOption(
      '[data-testid="competition-select"]',
      "Test Competition"
    );
    await page.selectOption('[data-testid="event-select"]', "100m Men");
    await page.fill(
      '[data-testid="registration-notes"]',
      "Test registration notes"
    );

    await page.click('[data-testid="save-registration-button"]');
    await expect(
      page.locator("text=Registration created successfully")
    ).toBeVisible();
  });

  test("should view registration details", async ({ page }) => {
    await page.goto("/registrations");
    await page.click('[data-testid="registration-details-button"]');
    await expect(
      page.locator('[data-testid="registration-details-modal"]')
    ).toBeVisible();
  });

  test("should edit registration", async ({ page }) => {
    await page.goto("/registrations");
    await page.click('[data-testid="edit-registration-button"]');

    await page.fill(
      '[data-testid="registration-notes"]',
      "Updated registration notes"
    );
    await page.click('[data-testid="save-registration-button"]');

    await expect(
      page.locator("text=Registration updated successfully")
    ).toBeVisible();
  });

  test("should delete registration", async ({ page }) => {
    await page.goto("/registrations");
    await page.click('[data-testid="delete-registration-button"]');
    await page.click('[data-testid="confirm-delete-button"]');

    await expect(
      page.locator("text=Registration deleted successfully")
    ).toBeVisible();
  });

  test("should filter registrations by competition", async ({ page }) => {
    await page.goto("/registrations");
    await page.selectOption(
      '[data-testid="competition-filter"]',
      "Test Competition"
    );
    await expect(page.locator('[data-testid="registration-card"]')).toHaveCount(
      { min: 1 }
    );
  });

  test("should filter registrations by event", async ({ page }) => {
    await page.goto("/registrations");
    await page.selectOption('[data-testid="event-filter"]', "100m Men");
    await expect(page.locator('[data-testid="registration-card"]')).toHaveCount(
      { min: 1 }
    );
  });

  test("should filter registrations by status", async ({ page }) => {
    await page.goto("/registrations");
    await page.selectOption('[data-testid="status-filter"]', "CONFIRMED");
    await expect(page.locator('[data-testid="registration-card"]')).toHaveCount(
      { min: 1 }
    );
  });

  test("should search registrations", async ({ page }) => {
    await page.goto("/registrations");
    await page.fill('[data-testid="search-input"]', "Jan");
    await expect(page.locator("text=Jan")).toBeVisible();
  });

  test("should approve registration", async ({ page }) => {
    await page.goto("/registrations");
    await page.click('[data-testid="approve-registration-button"]');
    await page.click('[data-testid="confirm-approve-button"]');

    await expect(page.locator("text=Registration approved")).toBeVisible();
    await expect(
      page.locator('[data-testid="registration-status"]')
    ).toHaveText("CONFIRMED");
  });

  test("should reject registration", async ({ page }) => {
    await page.goto("/registrations");
    await page.click('[data-testid="reject-registration-button"]');
    await page.fill(
      '[data-testid="rejection-reason"]',
      "Does not meet requirements"
    );
    await page.click('[data-testid="confirm-reject-button"]');

    await expect(page.locator("text=Registration rejected")).toBeVisible();
    await expect(
      page.locator('[data-testid="registration-status"]')
    ).toHaveText("REJECTED");
  });

  test("should export registrations to CSV", async ({ page }) => {
    await page.goto("/registrations");
    await page.click('[data-testid="export-registrations-button"]');

    const downloadPromise = page.waitForEvent("download");
    await page.click('[data-testid="download-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("registrations.csv");
  });

  test("should bulk approve registrations", async ({ page }) => {
    await page.goto("/registrations");
    await page.click('[data-testid="select-all-checkbox"]');
    await page.click('[data-testid="bulk-approve-button"]');
    await page.click('[data-testid="confirm-bulk-approve-button"]');

    await expect(page.locator("text=Bulk approval completed")).toBeVisible();
  });

  test("should bulk reject registrations", async ({ page }) => {
    await page.goto("/registrations");
    await page.click('[data-testid="select-all-checkbox"]');
    await page.click('[data-testid="bulk-reject-button"]');
    await page.fill(
      '[data-testid="bulk-rejection-reason"]',
      "Bulk rejection reason"
    );
    await page.click('[data-testid="confirm-bulk-reject-button"]');

    await expect(page.locator("text=Bulk rejection completed")).toBeVisible();
  });

  test("should register athlete for event as coach", async ({ page }) => {
    // Login as coach using test button
    await page.goto("/");
    await page.getByRole("button", { name: "Wyloguj" }).click();
    await page.click("text=Zaloguj jako Trener");

    await page.goto("/registrations");
    await page.click('[data-testid="create-registration-button"]');

    await page.selectOption(
      '[data-testid="athlete-select"]',
      "Athlete Under Coach"
    );
    await page.selectOption(
      '[data-testid="competition-select"]',
      "Test Competition"
    );
    await page.selectOption('[data-testid="event-select"]', "100m Women");

    await page.click('[data-testid="save-registration-button"]');
    await expect(
      page.locator("text=Registration created successfully")
    ).toBeVisible();
  });
});
