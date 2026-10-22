import { defineConfig } from "vitest/config";
import { astroComponentPlugin } from "./tests/support/astro-component-plugin";

const root = new URL("./", import.meta.url).pathname;

export default defineConfig({
  plugins: [astroComponentPlugin()],
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": `${root}src`,
      "@lib": `${root}src/lib`,
      "@components": `${root}src/components`,
      "@layouts": `${root}src/layouts`,
    },
  },
});
