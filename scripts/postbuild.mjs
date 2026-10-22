// Post-build fixes for the Cloudflare Workers asset manifest.
//
// 1. `dist/_worker.js` must not be uploaded as a public asset — it contains
//    server-side code.
// 2. Locale-prefixed paths (/es/...) are served by the Worker through a
//    middleware rewrite, but Astro's generated route manifest does not know
//    about them, so they would be looked up as static files and 404.
//    Add them to the worker's include list.
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve(process.cwd(), "dist");
if (!fs.existsSync(dist)) {
  console.warn("postbuild: dist/ not found, skipping");
  process.exit(0);
}

// 1. Never publish the server bundle as a static asset.
fs.writeFileSync(path.join(dist, ".assetsignore"), "_worker.js\n");

// 2. Route locale-prefixed requests to the Worker.
const routesPath = path.join(dist, "_routes.json");
if (fs.existsSync(routesPath)) {
  const routes = JSON.parse(fs.readFileSync(routesPath, "utf8"));
  const include = Array.isArray(routes.include) ? routes.include : [];
  const hasLocale = include.some((r) => typeof r === "string" && r.startsWith("/es"));
  if (!hasLocale) {
    include.push("/es");
    include.push("/es/*");
    routes.include = include;
    fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2));
    console.log("postbuild: added /es routes to the worker route manifest");
  }
}

console.log("postbuild: wrote dist/.assetsignore");
