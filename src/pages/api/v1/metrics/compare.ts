import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { metrics, measurements } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";

export const GET: APIRoute = async ({ locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const slugs = (url.searchParams.get("slugs") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!slugs.length) return err("Missing slugs", 400);
  try {
    const db = getDb(env);
    const metricRows = await db.select().from(metrics);
    const selected = metricRows.filter((m: any) => slugs.includes(m.slug));
    const result = await Promise.all(
      selected.map(async (m: any) => {
        const hist = await db.select().from(measurements).where(eq(measurements.metricId, m.id));
        return { slug: m.slug, name: m.name, unit: m.unit, measurements: hist };
      }),
    );
    return ok(result, { count: result.length });
  } catch (e) {
    return err(String(e), 500);
  }
};
