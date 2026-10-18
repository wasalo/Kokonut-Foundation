import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { reports } from "@lib/schema";
import { ok, err } from "@lib/api";
import { parseJson } from "@lib/utils";

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const rows = await db.select().from(reports);
    const data = rows.map((r: any) => ({ ...r, authors: parseJson(r.authors, []) }));
    return ok(data, { count: data.length });
  } catch (e) {
    return err(String(e), 500);
  }
};
