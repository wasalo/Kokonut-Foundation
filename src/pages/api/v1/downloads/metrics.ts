import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { metrics } from "@lib/schema";
import { err } from "@lib/api";
import { csvRow } from "@lib/utils";

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const rows = await db.select().from(metrics);
    const header = "id,slug,name,category,value,unit,verificationStatus,source,updatedAt";
    const lines = rows.map((m: any) => csvRow([m.id, m.slug, m.name, m.category, m.value, m.unit, m.verificationStatus, m.source, m.updatedAt]));
    const csv = [header, ...lines].join("\n");
    return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=metrics.csv" } });
  } catch (e) {
    return err(String(e), 500);
  }
};
