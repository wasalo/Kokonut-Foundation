import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { milestones } from "@lib/schema";
import { ok, err } from "@lib/api";

export const GET: APIRoute = async ({ locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const sp = url.searchParams;
    const projectId = sp.get("projectId");
    let rows = await db.select().from(milestones);
    if (projectId) rows = rows.filter((r: any) => r.projectId === projectId);
    return ok(rows, { count: rows.length });
  } catch (e) {
    return err(String(e), 500);
  }
};
