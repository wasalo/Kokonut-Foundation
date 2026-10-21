import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { farms } from "@lib/schema";
import { err } from "@lib/api";
import { csvRow } from "@lib/utils";

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const rows = await db.select().from(farms);
    const header = "id,slug,name,country,region,latitude,longitude,areaM2,status";
    const lines = rows.map((f: any) => csvRow([f.id, f.slug, f.name, f.country, f.region, f.latitude, f.longitude, f.areaM2, f.status]));
    const csv = [header, ...lines].join("\n");
    return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=farms.csv" } });
  } catch (e) {
    return err(String(e), 500);
  }
};
