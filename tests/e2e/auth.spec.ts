import { expect, test } from "@playwright/test";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display home page with login buttons", async ({ page }) => {
    await expect(page).toHaveURL("/");
    await expect(
      page.locator("nav").getByRole("button", { name: "Zaloguj się" })
    ).toBeVisible();
    await expect(page.locator("text=Konta Testowe")).toBeVisible();
    await expect(page.locator("text=Zaloguj jako Admin")).toBeVisible();
  });

  test("should login using admin test account button", async ({ page }) => {
    await page.click("text=Zaloguj jako Admin");
    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByRole("banner").getByText("Jan Kowalski")
    ).toBeVisible();
    await expect(page.getByRole("banner").getByText("ADMIN")).toBeVisible();
  });

  test("should login using organizer test account button", async ({ page }) => {
    await page.click("text=Zaloguj jako Organizator");
    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByRole("banner").getByText("Anna Nowak")
    ).toBeVisible();
    await expect(page.getByRole("banner").getByText("ORGANIZER")).toBeVisible();
  });

  test("should login using coach test account button", async ({ page }) => {
    await page.click("text=Zaloguj jako Trener");
    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByRole("banner").getByText("Piotr Wiśniewski")
    ).toBeVisible();
    await expect(page.getByRole("banner").getByText("COACH")).toBeVisible();
  });

  test("should login using athlete test account button", async ({ page }) => {
    await page.click("text=Zaloguj jako Zawodnik");
    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByRole("banner").getByText("Maria Kowalczyk")
    ).toBeVisible();
    await expect(page.getByRole("banner").getByText("ATHLETE")).toBeVisible();
  });

  test("should display admin dashboard correctly", async ({ page }) => {
    await page.click("text=Zaloguj jako Admin");
    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Panel administratora" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Nowe zawody" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Wszystkie zawody" })
    ).toBeVisible();
    await expect(
      page.locator("main").getByText("Aktywne zawody")
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Zawodnicy" })).toBeVisible();
    await expect(page.locator("main").getByText("Rejestracje")).toBeVisible();
  });

  test("should logout successfully", async ({ page }) => {
    // Login first
    await page.click("text=Zaloguj jako Admin");
    await expect(page).toHaveURL("/dashboard");

    // Logout - kliknij przycisk wyloguj
    await page.getByRole("button", { name: "Wyloguj" }).click();
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("navigation").getByRole("button", { name: "Zaloguj się" })
    ).toBeVisible();
  });
});
