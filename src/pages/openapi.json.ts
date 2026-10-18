import type { APIRoute } from "astro";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Kokonut Foundation Public API",
    version: "1.0.0",
    description: "Public API for Kokonut Foundation projects, impact, transparency, and resources.",
  },
  servers: [{ url: "https://kokonut.foundation" }],
  paths: {
    "/api/health": { get: { summary: "Health check", responses: { "200": { description: "OK" } } } },
    "/api/v1/projects": { get: { summary: "List projects", parameters: [
      { name: "page", in: "query", schema: { type: "integer" } },
      { name: "pageSize", in: "query", schema: { type: "integer" } },
      { name: "status", in: "query", schema: { type: "string" } },
      { name: "country", in: "query", schema: { type: "string" } },
      { name: "sdg", in: "query", schema: { type: "integer" } },
      { name: "q", in: "query", schema: { type: "string" } },
      { name: "sort", in: "query", schema: { type: "string" } },
    ], responses: { "200": { description: "List of projects" } } } },
    "/api/v1/projects/{slug}": { get: { summary: "Get project by slug", parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Project" }, "404": { description: "Not found" } } } },
    "/api/v1/metrics": { get: { summary: "List metrics", responses: { "200": { description: "List of metrics" } } } },
    "/api/v1/metrics/{slug}": { get: { summary: "Get metric with history and evidence", responses: { "200": { description: "Metric" } } } },
    "/api/v1/measurements": { get: { summary: "List measurements", responses: { "200": { description: "Measurements" } } } },
    "/api/v1/impact": { get: { summary: "Impact aggregate by category", responses: { "200": { description: "Impact" } } } },
    "/api/v1/farms": { get: { summary: "List farms", responses: { "200": { description: "Farms" } } } },
    "/api/v1/farms/{slug}": { get: { summary: "Get farm", responses: { "200": { description: "Farm" } } } },
    "/api/v1/evidence": { get: { summary: "List evidence", responses: { "200": { description: "Evidence" } } } },
    "/api/v1/attestations": { get: { summary: "List attestations", responses: { "200": { description: "Attestations" } } } },
    "/api/v1/treasury": { get: { summary: "Treasury wallets and entries", responses: { "200": { description: "Treasury" } } } },
    "/api/v1/funding-events": { get: { summary: "List funding events", responses: { "200": { description: "Funding events" } } } },
    "/api/v1/milestones": { get: { summary: "List milestones", responses: { "200": { description: "Milestones" } } } },
    "/api/v1/resources": { get: { summary: "List resources", responses: { "200": { description: "Resources" } } } },
    "/api/v1/resources/{slug}": { get: { summary: "Get resource", responses: { "200": { description: "Resource" } } } },
    "/api/v1/partners": { get: { summary: "List partners", responses: { "200": { description: "Partners" } } } },
    "/api/v1/reports": { get: { summary: "List reports", responses: { "200": { description: "Reports" } } } },
    "/api/v1/reports/{slug}": { get: { summary: "Get report", responses: { "200": { description: "Report" } } } },
    "/api/v1/search": { get: { summary: "Cross-entity search", parameters: [{ name: "q", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Results" } } } },
    "/api/v1/inquiries": { post: { summary: "Submit inquiry", responses: { "200": { description: "Received" } } } },
    "/api/v1/downloads/{type}/{slug}": { get: { summary: "Download file", parameters: [{ name: "type", in: "path", required: true, schema: { type: "string" } }, { name: "slug", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "File" } } } },
  },
};

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(spec, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
