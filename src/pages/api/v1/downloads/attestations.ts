import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { attestations } from "@lib/schema";
import { err } from "@lib/api";
import { csvRow } from "@lib/utils";

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const rows = await db.select().from(attestations);
    const header = "id,source,title,projectId,metricId,verificationStatus,issuedAt";
    const lines = rows.map((a: any) => csvRow([a.id, a.source, a.title, a.projectId, a.metricId, a.verificationStatus, a.issuedAt]));
    const csv = [header, ...lines].join("\n");
    return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=attestations.csv" } });
  } catch (e) {
    return err(String(e), 500);
  }
};
