import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  "/",
  "/how-it-works",
  "/projects",
  "/impact",
  "/transparency",
  "/partners",
  "/resources",
  "/about",
  "/support",
  "/contact",
  "/explorer",
  "/es/",
];

for (const path of PAGES) {
  test(`axe: no serious/critical violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const blocking = results.violations.filter((v) =>
      v.impact === "serious" || v.impact === "critical",
    );
    const summary = blocking.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) — ${v.help}`).join("\n");
    expect(summary, `accessibility violations on ${path}:\n${summary}`).toBe("");
  });
}

test("axe: dark theme has no serious/critical violations", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  await page.waitForTimeout(200);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  const summary = blocking.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) — ${v.help}`).join("\n");
  expect(summary, `dark theme violations:\n${summary}`).toBe("");
});
