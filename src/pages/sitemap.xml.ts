import type { APIRoute } from "astro";

const routes = [
  "/", "/how-it-works", "/projects", "/impact", "/impact/methodology",
  "/transparency", "/transparency/governance", "/transparency/treasury",
  "/transparency/attestations", "/transparency/reports", "/transparency/funding",
  "/transparency/methodologies", "/transparency/open-source",
  "/partners", "/resources", "/about", "/about/team", "/about/foundation",
  "/support", "/contact", "/explorer", "/explorer/evidence", "/explorer/graph",
  "/farms", "/data", "/api-docs", "/search",
  "/es", "/es/about", "/es/about/foundation", "/es/about/team", "/es/support",
  "/es/how-it-works", "/es/contact", "/es/projects", "/es/resources",
  "/es/partners", "/es/transparency", "/es/transparency/treasury",
  "/es/transparency/governance", "/es/impact", "/es/farms",
];

export const GET: APIRoute = async () => {
  const urls = routes
    .map((r) => `  <url><loc>https://kokonut.foundation${r}</loc><changefreq>weekly</changefreq></url>`)
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
};
