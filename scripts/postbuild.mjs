// Post-build: prevent the Workers server bundle from being uploaded as a public asset.
// `dist/_worker.js` contains server-side code; Workers Static Assets must not serve it.
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve(process.cwd(), "dist");
if (!fs.existsSync(dist)) {
  console.warn("postbuild: dist/ not found, skipping .assetsignore");
  process.exit(0);
}
fs.writeFileSync(path.join(dist, ".assetsignore"), "_worker.js\n");
console.log("postbuild: wrote dist/.assetsignore");
