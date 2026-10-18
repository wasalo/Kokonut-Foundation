import type { APIRoute } from "astro";
import { ok } from "@lib/api";

export const GET: APIRoute = async () => {
  const catalog = [
    { type: "reports", format: "pdf", endpoint: "/api/v1/downloads/reports/{slug}" },
    { type: "evidence", format: "file", endpoint: "/api/v1/downloads/evidence/{id}" },
    { type: "metrics", format: "csv", endpoint: "/api/v1/downloads/metrics" },
    { type: "measurements", format: "csv", endpoint: "/api/v1/downloads/measurements" },
    { type: "farms", format: "csv", endpoint: "/api/v1/downloads/farms" },
    { type: "treasury", format: "csv", endpoint: "/api/v1/downloads/treasury" },
    { type: "attestations", format: "csv", endpoint: "/api/v1/downloads/attestations" },
  ];
  return ok(catalog, { count: catalog.length });
};
