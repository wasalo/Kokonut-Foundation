import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { measurements } from "@lib/schema";
import { err } from "@lib/api";

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const rows = await db.select().from(measurements);
    const header = "id,metricId,projectId,value,observedAt,source,verificationStatus";
    const lines = rows.map((m: any) => [m.id, m.metricId, m.projectId ?? "", m.value, m.observedAt, m.source ?? "", m.verificationStatus].join(","));
    const csv = [header, ...lines].join("\n");
    return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=measurements.csv" } });
  } catch (e) {
    return err(String(e), 500);
  }
};
