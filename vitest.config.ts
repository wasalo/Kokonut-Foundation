import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      "@lib": new URL("./src/lib", import.meta.url).pathname,
      "@components": new URL("./src/components", import.meta.url).pathname,
      "@layouts": new URL("./src/layouts", import.meta.url).pathname,
    },
  },
});
