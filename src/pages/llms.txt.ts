import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const body = `# Kokonut Foundation

> Cloudflare-native public platform for regenerative farms, impact and transparency.

## Public pages
- Home: https://kokonut.foundation/
- How It Works: https://kokonut.foundation/how-it-works
- Projects: https://kokonut.foundation/projects
- Project detail: https://kokonut.foundation/projects/{slug}
- Impact: https://kokonut.foundation/impact
- Metric detail: https://kokonut.foundation/impact/{metric}
- Farms: https://kokonut.foundation/farms
- Farm detail: https://kokonut.foundation/farms/{slug}
- Transparency: https://kokonut.foundation/transparency
- Treasury: https://kokonut.foundation/transparency/treasury
- Attestations: https://kokonut.foundation/transparency/attestations
- Reports: https://kokonut.foundation/transparency/reports
- Partners: https://kokonut.foundation/partners
- Resources: https://kokonut.foundation/resources
- About: https://kokonut.foundation/about
- Explorer: https://kokonut.foundation/explorer
- Evidence graph: https://kokonut.foundation/explorer/graph
- Data hub: https://kokonut.foundation/data

## API
- Base: https://kokonut.foundation/api/v1/
- OpenAPI: https://kokonut.foundation/openapi.json
- API docs: https://kokonut.foundation/api-docs
- Endpoints: projects, metrics, measurements, impact, farms, evidence, attestations, treasury, funding-events, milestones, resources, partners, reports, search, graph/metric/{slug}, graph/project/{slug}, methodologies, sources, natural-assets, activities, claims, downloads

## Machine-readable
- Sitemap: https://kokonut.foundation/sitemap.xml
- Robots: https://kokonut.foundation/robots.txt
`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
};
