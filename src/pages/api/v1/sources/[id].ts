import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { sources } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";

export const GET: APIRoute = async ({ params, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const row = await db.select().from(sources).where(eq(sources.id, params.id as string)).get();
    if (!row) return err("Not found", 404);
    return ok(row);
  } catch (e) {
    return err(String(e), 500);
  }
};
