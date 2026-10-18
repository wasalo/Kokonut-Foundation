import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { metrics, measurements, historicalMetricSnapshots } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";

export const GET: APIRoute = async ({ params, locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const metric = await db.select().from(metrics).where(eq(metrics.slug, params.slug as string)).get();
    if (!metric) return err("Not found", 404);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    let history = await db.select().from(measurements).where(eq(measurements.metricId, metric.id));
    if (from) history = history.filter((h: any) => h.observedAt >= from);
    if (to) history = history.filter((h: any) => h.observedAt <= to);
    const snapshots = await db.select().from(historicalMetricSnapshots).where(eq(historicalMetricSnapshots.metricId, metric.id));
    return ok({ metric: metric.slug, measurements: history, snapshots }, { count: history.length });
  } catch (e) {
    return err(String(e), 500);
  }
};
