import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://localhost:4322" },
  webServer: { command: "npm run dev", url: "http://localhost:4322", reuseExistingServer: true, timeout: 60000 },
});