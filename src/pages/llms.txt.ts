import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const body = `# Kokonut Foundation\n\n> Cloudflare-native public platform for regenerative farms, impact and transparency.\n\n## Links\n- Home: https://kokonut.foundation/\n- Projects: https://kokonut.foundation/projects\n- Impact: https://kokonut.foundation/impact\n- Transparency: https://kokonut.foundation/transparency\n- API: https://kokonut.foundation/api/v1/projects\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
};
