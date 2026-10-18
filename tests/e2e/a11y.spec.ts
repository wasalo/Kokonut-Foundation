import { test, expect } from "@playwright/test";

test("home has skip link", async ({ page }) => {
  await page.goto("/");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeAttached();
});

test("home has main landmark", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main#main")).toBeVisible();
});

test("nav has aria-label", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("nav[aria-label='Primary']")).toBeAttached();
});