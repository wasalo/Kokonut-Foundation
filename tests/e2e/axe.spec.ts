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

// PRD §58 targets WCAG 2.2 AA, so the 2.2 rules are included alongside 2.0/2.1.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const path of PAGES) {
  test(`axe: no serious/critical violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
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
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  const summary = blocking.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) — ${v.help}`).join("\n");
  expect(summary, `dark theme violations:\n${summary}`).toBe("");
});
