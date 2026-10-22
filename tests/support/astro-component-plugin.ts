import { transform } from "@astrojs/compiler";
import { transform as esbuildTransform } from "esbuild";
import type { Plugin } from "vite";

/**
 * Compiles `.astro` components for the component tests.
 *
 * Astro's own Vite plugin is tightly coupled to the dev server and the
 * Cloudflare adapter, so it cannot be reused inside Vitest. This plugin does
 * the one thing the tests need: turn a component into a module the Astro
 * container can render.
 */

/**
 * Removes the `export const $$metadata = $$createMetadata(...)` statement.
 *
 * The statement carries the component's hoisted `<script>` bodies, which the
 * installed Astro runtime does not provide `createMetadata` for, and which
 * contain template literals that do not survive a second parse. The metadata
 * only feeds the dev manifest, so the whole statement is dropped.
 */
function stripMetadata(code: string): string {
  const start = code.indexOf("export const $$metadata = $$createMetadata(");
  if (start === -1) return code;

  const open = code.indexOf("(", start);
  let depth = 0;
  let end = -1;
  for (let i = open; i < code.length; i++) {
    const ch = code[i];
    if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return code;

  const after = code.indexOf(";", end);
  if (after === -1) return code;

  const replacement =
    "export const $$metadata = { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: new Set([]), hoisted: [] };";

  return code.slice(0, start) + replacement + code.slice(after + 1);
}

export function astroComponentPlugin(): Plugin {
  return {
    name: "kokonut:astro-component",
    enforce: "pre",
    async transform(code, id) {
      const [file] = id.split("?");
      if (!file.endsWith(".astro")) return null;

      const compiled = (await transform(code, { filename: file, sourcemap: false })) as {
        code: string;
        error?: Error;
      };
      if (compiled.error) throw compiled.error;

      const neutralised = stripMetadata(compiled.code).replace(
        /\s*createMetadata as \$\$createMetadata,?/,
        "",
      );

      // The compiler leaves the component's TypeScript in place; strip it so the
      // module can be executed.
      const stripped = await esbuildTransform(neutralised, {
        loader: "ts",
        format: "esm",
        target: "es2022",
        sourcefile: file,
      });

      return {
        code: stripped.code,
        map: stripped.map,
      };
    },
  };
}
