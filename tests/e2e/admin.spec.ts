import { expect, test } from "@playwright/test";

test.describe("Admin Panel", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin using test button
    await page.goto("/");
    await page.click("text=Zaloguj jako Admin");
    await expect(page).toHaveURL("/dashboard");
  });

  test("should navigate to admin panel", async ({ page }) => {
    await page.getByRole("link", { name: "Użytkownicy" }).click();
    await expect(page).toHaveURL("/users");
    await expect(
      page.getByRole("heading", { name: "Użytkownicy" })
    ).toBeVisible();
    await expect(
      page.locator("text=Zarządzaj użytkownikami platformy")
    ).toBeVisible();
  });

  test("should navigate to users management", async ({ page }) => {
    await page.goto("/admin");
    await page.click("text=Użytkownicy");
    await expect(page).toHaveURL("/users");
    await expect(page.locator("text=Zarządzaj użytkownikami")).toBeVisible();
  });

  test("should create new user", async ({ page }) => {
    await page.goto("/users");
    await page.click('[data-testid="create-user-button"]');

    await page.fill('[data-testid="user-email"]', "newuser@athletics.pl");
    await page.fill('[data-testid="user-password"]', "password123");
    await page.fill('[data-testid="user-first-name"]', "New");
    await page.fill('[data-testid="user-last-name"]', "User");
    await page.fill('[data-testid="user-phone"]', "+48987654321");
    await page.selectOption('[data-testid="user-role"]', "ORGANIZER");
    await page.check('[data-testid="user-active"]');

    await page.click('[data-testid="save-user-button"]');
    await expect(page.locator("text=User created successfully")).toBeVisible();
  });

  test("should edit user", async ({ page }) => {
    await page.goto("/users");
    await page.click('[data-testid="edit-user-button"]');

    await page.fill('[data-testid="user-first-name"]', "Updated");
    await page.click('[data-testid="save-user-button"]');

    await expect(page.locator("text=User updated successfully")).toBeVisible();
  });

  test("should delete user", async ({ page }) => {
    await page.goto("/users");
    await page.click('[data-testid="delete-user-button"]');
    await page.click('[data-testid="confirm-delete-button"]');

    await expect(page.locator("text=User deleted successfully")).toBeVisible();
  });

  test("should filter users by role", async ({ page }) => {
    await page.goto("/users");
    await page.selectOption('[data-testid="role-filter"]', "ADMIN");
    await expect(page.locator('[data-testid="user-card"]')).toHaveCount({
      min: 1,
    });
  });

  test("should filter users by status", async ({ page }) => {
    await page.goto("/users");
    await page.selectOption('[data-testid="status-filter"]', "ACTIVE");
    await expect(page.locator('[data-testid="user-card"]')).toHaveCount({
      min: 1,
    });
  });

  test("should search users", async ({ page }) => {
    await page.goto("/users");
    await page.fill('[data-testid="search-input"]', "admin");
    await expect(page.locator("text=admin@athletics.pl")).toBeVisible();
  });

  test("should deactivate user", async ({ page }) => {
    await page.goto("/users");
    await page.click('[data-testid="deactivate-user-button"]');
    await page.click('[data-testid="confirm-deactivate-button"]');

    await expect(page.locator("text=User deactivated")).toBeVisible();
    await expect(page.locator('[data-testid="user-status"]')).toHaveText(
      "INACTIVE"
    );
  });

  test("should activate user", async ({ page }) => {
    await page.goto("/users");
    await page.click('[data-testid="activate-user-button"]');
    await page.click('[data-testid="confirm-activate-button"]');

    await expect(page.locator("text=User activated")).toBeVisible();
    await expect(page.locator('[data-testid="user-status"]')).toHaveText(
      "ACTIVE"
    );
  });

  test("should reset user password", async ({ page }) => {
    await page.goto("/users");
    await page.click('[data-testid="reset-password-button"]');

    await page.fill('[data-testid="new-password"]', "newpassword123");
    await page.fill('[data-testid="confirm-password"]', "newpassword123");
    await page.click('[data-testid="save-password-button"]');

    await expect(
      page.locator("text=Password reset successfully")
    ).toBeVisible();
  });

  test("should view system settings", async ({ page }) => {
    await page.goto("/admin");
    await page.click('[data-testid="system-settings-button"]');

    await expect(
      page.locator('[data-testid="system-settings-modal"]')
    ).toBeVisible();
    await expect(page.locator("text=System Settings")).toBeVisible();
  });

  test("should update system settings", async ({ page }) => {
    await page.goto("/admin");
    await page.click('[data-testid="system-settings-button"]');

    await page.fill(
      '[data-testid="system-name"]',
      "Updated Athletics Platform"
    );
    await page.fill('[data-testid="system-email"]', "updated@athletics.pl");
    await page.click('[data-testid="save-settings-button"]');

    await expect(
      page.locator("text=Settings updated successfully")
    ).toBeVisible();
  });

  test("should view system logs", async ({ page }) => {
    await page.goto("/admin");
    await page.click('[data-testid="system-logs-button"]');

    await expect(
      page.locator('[data-testid="system-logs-modal"]')
    ).toBeVisible();
    await expect(page.locator("text=System Logs")).toBeVisible();
  });

  test("should backup database", async ({ page }) => {
    await page.goto("/admin");
    await page.click('[data-testid="backup-database-button"]');

    const downloadPromise = page.waitForEvent("download");
    await page.click('[data-testid="create-backup-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /backup-\d{4}-\d{2}-\d{2}\.sql/
    );
  });

  test("should restore database", async ({ page }) => {
    await page.goto("/admin");
    await page.click('[data-testid="restore-database-button"]');

    await page.setInputFiles(
      '[data-testid="backup-file-input"]',
      "test-files/backup.sql"
    );
    await page.click('[data-testid="restore-backup-button"]');

    await expect(
      page.locator("text=Database restored successfully")
    ).toBeVisible();
  });

  test("should view system statistics", async ({ page }) => {
    await page.goto("/admin");
    await page.click('[data-testid="system-statistics-button"]');

    await expect(
      page.locator('[data-testid="statistics-modal"]')
    ).toBeVisible();
    await expect(page.locator("text=System Statistics")).toBeVisible();
    await expect(page.locator("text=Total Users")).toBeVisible();
    await expect(page.locator("text=Total Competitions")).toBeVisible();
    await expect(page.locator("text=Total Athletes")).toBeVisible();
  });

  test("should clear system cache", async ({ page }) => {
    await page.goto("/admin");
    await page.click('[data-testid="clear-cache-button"]');
    await page.click('[data-testid="confirm-clear-cache-button"]');

    await expect(page.locator("text=Cache cleared successfully")).toBeVisible();
  });
});
