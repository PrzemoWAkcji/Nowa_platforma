import { expect, test } from "@playwright/test";

test.describe("Events Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin using test button
    await page.goto("/");
    await page.click("text=Zaloguj jako Admin");
    await expect(page).toHaveURL("/dashboard");
  });

  test("should navigate to events page", async ({ page }) => {
    await page.click("text=Wydarzenia");
    await expect(page).toHaveURL("/events");
    await expect(page.locator("text=Zarządzaj wydarzeniami")).toBeVisible();
  });

  test("should create new track event", async ({ page }) => {
    await page.goto("/events");
    await page.click('[data-testid="create-event-button"]');

    await page.fill('[data-testid="event-name"]', "100m Men");
    await page.selectOption('[data-testid="event-type"]', "TRACK");
    await page.selectOption('[data-testid="event-discipline"]', "100m");
    await page.selectOption('[data-testid="event-gender"]', "MALE");
    await page.selectOption('[data-testid="event-category"]', "SENIOR");
    await page.fill('[data-testid="event-scheduled-time"]', "2025-08-15T10:00");

    await page.click('[data-testid="save-event-button"]');
    await expect(page.locator("text=100m Men")).toBeVisible();
  });

  test("should create new field event", async ({ page }) => {
    await page.goto("/events");
    await page.click('[data-testid="create-event-button"]');

    await page.fill('[data-testid="event-name"]', "Shot Put Women");
    await page.selectOption('[data-testid="event-type"]', "FIELD");
    await page.selectOption('[data-testid="event-discipline"]', "Shot Put");
    await page.selectOption('[data-testid="event-gender"]', "FEMALE");
    await page.selectOption('[data-testid="event-category"]', "SENIOR");
    await page.fill('[data-testid="event-scheduled-time"]', "2025-08-15T14:00");

    await page.click('[data-testid="save-event-button"]');
    await expect(page.locator("text=Shot Put Women")).toBeVisible();
  });

  test("should edit event", async ({ page }) => {
    await page.goto("/events");
    await page.click('[data-testid="edit-event-button"]');

    await page.fill('[data-testid="event-name"]', "Updated Event Name");
    await page.click('[data-testid="save-event-button"]');

    await expect(page.locator("text=Updated Event Name")).toBeVisible();
  });

  test("should delete event", async ({ page }) => {
    await page.goto("/events");
    await page.click('[data-testid="delete-event-button"]');
    await page.click('[data-testid="confirm-delete-button"]');

    await expect(page.locator("text=Event deleted successfully")).toBeVisible();
  });

  test("should filter events by type", async ({ page }) => {
    await page.goto("/events");
    await page.selectOption('[data-testid="type-filter"]', "TRACK");
    await expect(page.locator('[data-testid="event-card"]')).toHaveCount({
      min: 1,
    });
  });

  test("should filter events by gender", async ({ page }) => {
    await page.goto("/events");
    await page.selectOption('[data-testid="gender-filter"]', "MALE");
    await expect(page.locator('[data-testid="event-card"]')).toHaveCount({
      min: 1,
    });
  });

  test("should filter events by category", async ({ page }) => {
    await page.goto("/events");
    await page.selectOption('[data-testid="category-filter"]', "SENIOR");
    await expect(page.locator('[data-testid="event-card"]')).toHaveCount({
      min: 1,
    });
  });

  test("should view event statistics", async ({ page }) => {
    await page.goto("/events");
    await page.click('[data-testid="event-stats-button"]');

    await expect(
      page.locator('[data-testid="event-stats-modal"]')
    ).toBeVisible();
    await expect(page.locator("text=Participants")).toBeVisible();
    await expect(page.locator("text=Best Result")).toBeVisible();
  });

  test("should mark event as ongoing", async ({ page }) => {
    await page.goto("/events");
    await page.click('[data-testid="mark-ongoing-button"]');

    await expect(page.locator("text=Event marked as ongoing")).toBeVisible();
    await expect(page.locator('[data-testid="event-status"]')).toHaveText(
      "ONGOING"
    );
  });

  test("should complete event", async ({ page }) => {
    await page.goto("/events");
    await page.click('[data-testid="complete-event-button"]');
    await page.click('[data-testid="confirm-complete-button"]');

    await expect(
      page.locator("text=Event completed successfully")
    ).toBeVisible();
    await expect(page.locator('[data-testid="event-status"]')).toHaveText(
      "COMPLETED"
    );
  });

  test("should manage event visibility", async ({ page }) => {
    await page.goto("/events");
    await page.click('[data-testid="manage-visibility-button"]');

    await expect(
      page.locator('[data-testid="visibility-modal"]')
    ).toBeVisible();
    await page.click('[data-testid="toggle-public-visibility"]');

    await expect(page.locator("text=Event visibility updated")).toBeVisible();
  });

  test("should create relay event", async ({ page }) => {
    await page.goto("/events");
    await page.click('[data-testid="create-event-button"]');

    await page.fill('[data-testid="event-name"]', "4x100m Relay Men");
    await page.selectOption('[data-testid="event-type"]', "RELAY");
    await page.selectOption('[data-testid="event-discipline"]', "4x100m Relay");
    await page.selectOption('[data-testid="event-gender"]', "MALE");
    await page.selectOption('[data-testid="event-category"]', "SENIOR");
    await page.fill('[data-testid="event-scheduled-time"]', "2025-08-15T16:00");

    await page.click('[data-testid="save-event-button"]');
    await expect(page.locator("text=4x100m Relay Men")).toBeVisible();
  });

  test("should create combined event", async ({ page }) => {
    await page.goto("/events");
    await page.click('[data-testid="create-event-button"]');

    await page.fill('[data-testid="event-name"]', "Decathlon Men");
    await page.selectOption('[data-testid="event-type"]', "COMBINED");
    await page.selectOption('[data-testid="event-discipline"]', "Decathlon");
    await page.selectOption('[data-testid="event-gender"]', "MALE");
    await page.selectOption('[data-testid="event-category"]', "SENIOR");
    await page.fill('[data-testid="event-scheduled-time"]', "2025-08-15T09:00");

    await page.click('[data-testid="save-event-button"]');
    await expect(page.locator("text=Decathlon Men")).toBeVisible();
  });
});
