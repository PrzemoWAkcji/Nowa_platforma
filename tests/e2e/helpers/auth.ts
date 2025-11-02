import { Page, expect } from "@playwright/test";

export async function loginAsAdmin(page: Page) {
  await page.goto("/");
  await page.click("text=Zaloguj jako Admin");
  // Poczekaj na przekierowanie lub przejdź ręcznie
  await page.waitForTimeout(2000);
  if (page.url().includes("localhost:3001/")) {
    await page.goto("/dashboard");
  }
  await expect(page).toHaveURL("/dashboard");
}

export async function loginAsCoach(page: Page) {
  await page.goto("/");
  await page.click("text=Zaloguj jako Trener");
  // Poczekaj na przekierowanie lub przejdź ręcznie
  await page.waitForTimeout(2000);
  if (page.url().includes("localhost:3001/")) {
    await page.goto("/dashboard");
  }
  await expect(page).toHaveURL("/dashboard");
}

export async function loginAsOrganizer(page: Page) {
  await page.goto("/");
  await page.click("text=Zaloguj jako Organizator");
  // Poczekaj na przekierowanie lub przejdź ręcznie
  await page.waitForTimeout(2000);
  if (page.url().includes("localhost:3001/")) {
    await page.goto("/dashboard");
  }
  await expect(page).toHaveURL("/dashboard");
}
