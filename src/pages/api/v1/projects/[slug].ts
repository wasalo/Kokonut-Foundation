import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { projects } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";
import { parseJson } from "@lib/utils";

export const GET: APIRoute = async ({ params, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const row = await db.select().from(projects).where(eq(projects.slug, params.slug as string)).get();
    if (!row) return err("Not found", 404);
    return ok({
      ...row,
      impactAreas: parseJson(row.impactAreas, []),
      sdgs: parseJson(row.sdgs, []),
      partners: parseJson(row.partners, []),
      metrics: parseJson(row.metrics, []),
      milestones: parseJson(row.milestones, []),
      resources: parseJson(row.resources, []),
    });
  } catch (e) {
    return err(String(e), 500);
  }
};
