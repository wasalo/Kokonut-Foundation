import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = process.cwd();

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: { enabled: true },
    workerEntryPoint: { path: "src/worker.ts", namedExports: ["queue", "scheduled", "PublishReportWorkflow"] },
  }),
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(root, "src"),
        "@lib": path.resolve(root, "src/lib"),
        "@components": path.resolve(root, "src/components"),
        "@layouts": path.resolve(root, "src/layouts"),
      },
    },
  },
  security: {
    // Origin check stays enabled so cross-site form posts to admin/API routes are rejected.
    checkOrigin: true,
  },
  site: "https://kokonut.foundation",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: { prefixDefaultLocale: false },
  },
});