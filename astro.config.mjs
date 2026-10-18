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
    checkOrigin: false,
  },
  site: "https://kokonut.foundation",
});