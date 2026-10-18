import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { reports } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";
import { parseJson } from "@lib/utils";

export const GET: APIRoute = async ({ params, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const row = await db.select().from(reports).where(eq(reports.slug, params.slug as string)).get();
    if (!row) return err("Not found", 404);
    return ok({ ...row, authors: parseJson(row.authors, []) });
  } catch (e) {
    return err(String(e), 500);
  }
};
