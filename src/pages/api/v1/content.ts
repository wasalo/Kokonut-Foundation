import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { contentBlocks } from "@lib/schema";
import { ok, err } from "@lib/api";

/**
 * Content blocks are the Foundation's addressable content store — the KI
 * Common Data Schema baselines land here, keyed `baseline:<farm-slug>`, and
 * editorial blocks are keyed by their own name.
 */
export const GET: APIRoute = async ({ locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const prefix = url.searchParams.get("prefix");
  try {
    const db = getDb(env);
    const rows = await db.select().from(contentBlocks).all();
    const filtered = prefix ? rows.filter((r: any) => r.key.startsWith(prefix)) : rows;
    return ok(
      filtered.map((r: any) => ({ id: r.id, key: r.key, title: r.title, updatedAt: r.updatedAt })),
      { count: filtered.length },
    );
  } catch (e) {
    return err(String(e), 500);
  }
};
