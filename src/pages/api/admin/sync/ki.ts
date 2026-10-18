import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { syncJobs, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";
import { id, nowIso } from "@lib/utils";

export const POST: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  const kiUrl = (env as any).KI_API_URL;
  const kiKey = (env as any).KI_API_KEY;
  if (!env.DB) return err("DB not configured", 503);

  const jobId = id("sync_");
  const db = getDb(env);
  await db.insert(syncJobs).values({
    id: jobId,
    source: "kokonut-intelligence",
    status: "running",
    startedAt: nowIso(),
    details: kiUrl ? "started" : "disabled (no KI_API_URL)",
  });

  let status = "completed";
  let details = "no-op (KI not configured)";
  try {
    if (kiUrl && kiKey) {
      const res = await fetch(`${kiUrl}/projects`, {
        headers: { Authorization: `Bearer ${kiKey}` },
      });
      if (!res.ok) throw new Error(`KI fetch failed: ${res.status}`);
      const data = await res.json();
      details = `fetched ${Array.isArray(data) ? data.length : 0} records`;
    }
  } catch (e) {
    status = "failed";
    details = String(e);
  }

  await db.update(syncJobs).set({ status, finishedAt: nowIso(), details }).where(eq(syncJobs.id, jobId));

  await db.insert(auditLog).values({
    id: id("aud_"),
    actor: "admin",
    action: "ki_sync",
    entityType: "sync_job",
    entityId: jobId,
    after: JSON.stringify({ status, details }),
    timestamp: nowIso(),
  });

  return ok({ jobId, status, details });
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
