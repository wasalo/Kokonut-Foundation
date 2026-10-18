import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { evidence } from "@lib/schema";
import { ok, err } from "@lib/api";
import { parseJson } from "@lib/utils";

export const GET: APIRoute = async ({ locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const sp = url.searchParams;
    const projectId = sp.get("projectId");
    const metricId = sp.get("metricId");
    const type = sp.get("type");
    const visibility = sp.get("visibility") ?? "public";
    let rows = await db.select().from(evidence);
    if (projectId) rows = rows.filter((r: any) => r.projectId === projectId);
    if (metricId) rows = rows.filter((r: any) => r.metricId === metricId);
    if (type) rows = rows.filter((r: any) => r.type === type);
    rows = rows.filter((r: any) => r.visibility === visibility || visibility === "all");
    return ok(rows.map((r: any) => ({ ...r, downloadUrl: r.objectKey ? `/api/v1/downloads/evidence/${r.id}` : r.externalUrl })), { count: rows.length });
  } catch (e) {
    return err(String(e), 500);
  }
};
