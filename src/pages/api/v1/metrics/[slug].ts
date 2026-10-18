import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { metrics, measurements, evidence } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";
import { parseJson } from "@lib/utils";

export const GET: APIRoute = async ({ params, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const row = await db.select().from(metrics).where(eq(metrics.slug, params.slug as string)).get();
    if (!row) return err("Not found", 404);
    const history = await db.select().from(measurements).where(eq(measurements.metricId, row.id));
    const ev = await db.select().from(evidence).where(eq(evidence.metricId, row.id));
    return ok({
      ...row,
      evidenceIds: parseJson(row.evidenceIds, []),
      measurements: history,
      evidence: ev,
    });
  } catch (e) {
    return err(String(e), 500);
  }
};
