import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { sources } from "@lib/schema";
import { ok, err } from "@lib/api";

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const rows = await db.select().from(sources);
    return ok(rows, { count: rows.length });
  } catch (e) {
    return err(String(e), 500);
  }
};
