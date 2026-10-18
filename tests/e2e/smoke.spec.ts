import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Kokonut/);
});

test("projects page loads", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.locator("h1")).toContainText("Projects");
});

test("impact page loads", async ({ page }) => {
  await page.goto("/impact");
  await expect(page.locator("h1")).toContainText("Impact");
});

test("404 page", async ({ page }) => {
  await page.goto("/nonexistent-page-xyz");
  await expect(page.locator("h1")).toContainText("404");
});