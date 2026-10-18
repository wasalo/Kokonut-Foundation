import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { syncJobs } from "@lib/schema";
import { ok, err } from "@lib/api";

export const POST: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const { runKiIngest } = await import("@lib/ki-ingest");
    const result = await runKiIngest(env);
    return ok(result);
  } catch (e) {
    return err(String(e), 500);
  }
};

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const rows = await db.select().from(syncJobs);
    const sorted = [...(rows as any[])].sort((a, b) => (b.startedAt ?? "").localeCompare(a.startedAt ?? ""));
    return ok(sorted.slice(0, 20));
  } catch (e) {
    return err(String(e), 500);
  }
};
