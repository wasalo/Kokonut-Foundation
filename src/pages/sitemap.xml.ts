import type { APIRoute } from "astro";

const routes = [
  "/", "/how-it-works", "/projects", "/impact", "/impact/methodology",
  "/transparency", "/transparency/governance", "/transparency/treasury",
  "/transparency/attestations", "/transparency/reports",
  "/partners", "/resources", "/about", "/about/team", "/about/foundation",
  "/support", "/contact",
];

export const GET: APIRoute = async () => {
  const urls = routes.map((r) => `  <url><loc>https://kokonut.foundation${r}</loc></url>`).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
};
