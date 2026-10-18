import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const body = `User-agent: *\nAllow: /\nSitemap: https://kokonut.foundation/sitemap.xml\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
};
