import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display dashboard after login", async ({ page }) => {
    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Panel administratora" })
    ).toBeVisible();
  });

  test("should display user information", async ({ page }) => {
    await expect(page.getByText("Jan Kowalski").first()).toBeVisible();
    await expect(page.getByText("ADMIN")).toBeVisible();
  });

  test("should display navigation sidebar", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Wszystkie zawody" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Zawodnicy" })).toBeVisible();
  });

  test("should display statistics cards", async ({ page }) => {
    // Użyj bardziej specyficznych selektorów dla kart statystyk
    await expect(
      page.locator(".grid").getByText("Wszystkie zawody").first()
    ).toBeVisible();
    await expect(page.getByText("Aktywne zawody")).toBeVisible();
    await expect(page.locator(".grid").getByText("Zawodnicy")).toBeVisible();
    await expect(page.getByText("Rejestracje")).toBeVisible();
  });

  test("should display recent activities", async ({ page }) => {
    await expect(
      page.locator('[data-testid="recent-activities"]')
    ).toBeVisible();
    await expect(page.locator("text=Recent Activities")).toBeVisible();
  });

  test("should display upcoming events", async ({ page }) => {
    await expect(page.locator('[data-testid="upcoming-events"]')).toBeVisible();
    await expect(page.locator("text=Upcoming Events")).toBeVisible();
  });

  test("should navigate to competitions from dashboard", async ({ page }) => {
    await page.click('[data-testid="competitions-nav"]');
    await expect(page).toHaveURL("/competitions");
  });

  test("should navigate to athletes from dashboard", async ({ page }) => {
    await page.click('[data-testid="athletes-nav"]');
    await expect(page).toHaveURL("/athletes");
  });

  test("should navigate to events from dashboard", async ({ page }) => {
    await page.click('[data-testid="events-nav"]');
    await expect(page).toHaveURL("/events");
  });

  test("should navigate to registrations from dashboard", async ({ page }) => {
    await page.click('[data-testid="registrations-nav"]');
    await expect(page).toHaveURL("/registrations");
  });

  test("should navigate to results from dashboard", async ({ page }) => {
    await page.click('[data-testid="results-nav"]');
    await expect(page).toHaveURL("/results");
  });

  test("should navigate to combined events from dashboard", async ({
    page,
  }) => {
    await page.click('[data-testid="combined-events-nav"]');
    await expect(page).toHaveURL("/combined-events");
  });

  test("should display different dashboard for coach", async ({ page }) => {
    // Logout and login as coach using test button
    await page.getByRole("button", { name: "Wyloguj" }).click();
    await page.click("text=Zaloguj jako Trener");

    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("text=Piotr")).toBeVisible();
    await expect(page.locator("text=COACH")).toBeVisible();

    // Coach should see my-athletes section
    await expect(page.locator("text=My Athletes")).toBeVisible();
  });

  test("should display different dashboard for organizer", async ({ page }) => {
    // Logout and login as organizer using test button
    await page.getByRole("button", { name: "Wyloguj" }).click();
    await page.click("text=Zaloguj jako Organizator");

    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("text=Anna")).toBeVisible();
    await expect(page.locator("text=ORGANIZER")).toBeVisible();

    // Organizer should see competition management tools
    await expect(page.locator("text=Competition Management")).toBeVisible();
  });

  test("should display different dashboard for athlete", async ({ page }) => {
    // Logout and login as athlete using test button
    await page.getByRole("button", { name: "Wyloguj" }).click();
    await page.click("text=Zaloguj jako Zawodnik");

    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("text=Maria")).toBeVisible();
    await expect(page.locator("text=ATHLETE")).toBeVisible();

    // Athlete should see personal statistics
    await expect(page.locator("text=My Results")).toBeVisible();
    await expect(page.locator("text=My Competitions")).toBeVisible();
  });

  test("should refresh dashboard data", async ({ page }) => {
    await page.click('[data-testid="refresh-dashboard-button"]');
    await expect(page.locator("text=Dashboard refreshed")).toBeVisible();
  });

  test("should display notifications", async ({ page }) => {
    await page.click('[data-testid="notifications-button"]');
    await expect(
      page.locator('[data-testid="notifications-dropdown"]')
    ).toBeVisible();
  });

  test("should display profile menu", async ({ page }) => {
    await page.click('[data-testid="profile-menu-button"]');
    await expect(
      page.locator('[data-testid="profile-dropdown"]')
    ).toBeVisible();
    await expect(page.locator("text=Profile")).toBeVisible();
    await expect(page.locator("text=Settings")).toBeVisible();
    await expect(page.locator("text=Logout")).toBeVisible();
  });

  test("should navigate to profile settings", async ({ page }) => {
    await page.click('[data-testid="profile-menu-button"]');
    await page.click("text=Profile");
    await expect(page).toHaveURL("/profile");
  });

  test("should navigate to settings", async ({ page }) => {
    await page.click('[data-testid="profile-menu-button"]');
    await page.click("text=Settings");
    await expect(page).toHaveURL("/settings");
  });

  test("should logout from profile menu", async ({ page }) => {
    await page.click('[data-testid="profile-menu-button"]');
    await page.click("text=Logout");
    await expect(page).toHaveURL("/");
  });
});
