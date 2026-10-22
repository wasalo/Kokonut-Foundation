import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { contentBlocks } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";

/** A single content block, addressed by its key. */
export const GET: APIRoute = async ({ locals, params }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const key = params.key ?? "";
  if (!key) return err("key required", 400);
  try {
    const db = getDb(env);
    const row = await db.select().from(contentBlocks).where(eq(contentBlocks.key, key)).get();
    if (!row) return err("Not found", 404);
    // The body may be a JSON document; hand it back as JSON when it parses.
    let body: unknown = row.body;
    try {
      body = JSON.parse(row.body);
    } catch {
      body = row.body;
    }
    return ok({ id: row.id, key: row.key, title: row.title, body, updatedAt: row.updatedAt });
  } catch (e) {
    return err(String(e), 500);
  }
};
