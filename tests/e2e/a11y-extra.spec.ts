import { test, expect } from "@playwright/test";

test("skip link is focusable", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.className);
  expect(focused).toContain("skip-link");
});

test("nav links have visible text", async ({ page }) => {
  await page.goto("/");
  const links = page.locator("nav[aria-label='Primary'] a");
  const count = await links.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const text = await links.nth(i).textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  }
});

test("forms have labels", async ({ page }) => {
  await page.goto("/contact");
  const inputs = page.locator("input[required], textarea[required]");
  const count = await inputs.count();
  for (let i = 0; i < count; i++) {
    const id = await inputs.nth(i).getAttribute("id");
    if (id) {
      const label = page.locator(`label[for='${id}']`);
      await expect(label).toBeAttached();
    }
  }
});