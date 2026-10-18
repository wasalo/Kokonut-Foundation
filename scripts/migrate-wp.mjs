// WordPress migration helper (tooling only). Usage:
//   node scripts/migrate-wp.mjs crawl <baseUrl>   -> writes url inventory JSON
//   node scripts/migrate-wp.mjs redirects <csv>    -> prints SQL for redirects table
//   node scripts/migrate-wp.mjs classify <json>    -> prints classification summary
import fs from "node:fs";

const cmd = process.argv[2];
if (cmd === "crawl") {
  const base = process.argv[3] ?? "https://kokonut.foundation";
  console.log(JSON.stringify({ baseUrl: base, note: "Implement sitemap fetch + URL inventory here." }, null, 2));
} else if (cmd === "redirects") {
  const csv = process.argv[3];
  if (!csv) { console.error("provide csv path"); process.exit(1); }
  const lines = fs.readFileSync(csv, "utf8").trim().split("\n");
  console.log("-- Redirects SQL");
  for (const line of lines.slice(1)) {
    const [from, to, code] = line.split(",");
    console.log(`INSERT OR IGNORE INTO redirects (id, from_path, to_path, status_code) VALUES ('red_${from.replace(/\\W/g, "")}', '${from}', '${to}', ${code ?? 301});`);
  }
} else if (cmd === "classify") {
  console.log(JSON.stringify({ note: "Classify URLs into Page/Project/Impact/Resource/Partner/Team/External/Archive" }, null, 2));
} else {
  console.log("Usage: migrate-wp.mjs <crawl|redirects|classify> [args]");
}
