import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { projects } from "@lib/schema";
import { ok, err } from "@lib/api";
import { parseJson } from "@lib/utils";

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const rows = await db.select().from(projects);
    const data = rows.map((p: any) => ({
      ...p,
      impactAreas: parseJson(p.impactAreas, []),
      sdgs: parseJson(p.sdgs, []),
      partners: parseJson(p.partners, []),
      metrics: parseJson(p.metrics, []),
      milestones: parseJson(p.milestones, []),
      resources: parseJson(p.resources, []),
    }));
    return ok(data, { count: data.length });
  } catch (e) {
    return err(String(e), 500);
  }
};
