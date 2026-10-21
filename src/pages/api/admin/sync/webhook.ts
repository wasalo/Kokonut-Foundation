import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { syncJobs, auditLog } from "@lib/schema";
import { ok, err } from "@lib/api";
import { id, nowIso } from "@lib/utils";

/**
 * KI webhook receiver. KI can push update notifications; we record the event
 * and re-run the governed ingest so the Foundation store reflects the change.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const body = (await request.json()) as any;
    const db = getDb(env);
    const jobId = id("wh_");

    const { runKiIngest } = await import("@lib/ki-ingest");
    const result = await runKiIngest(env);

    await db.insert(syncJobs).values({
      id: jobId,
      source: "kokonut-intelligence-webhook",
      status: result.status === "failed" ? "failed" : "completed",
      startedAt: nowIso(),
      finishedAt: nowIso(),
      details: JSON.stringify({ received: true, ingest: result.details }).slice(0, 500),
    });
    await db.insert(auditLog).values({
      id: id("aud_"), actor: "ki-webhook", action: "webhook_received",
      entityType: "sync_job", entityId: jobId,
      after: JSON.stringify({ counts: result.counts }).slice(0, 500), timestamp: nowIso(),
    });

    return ok({ received: true, jobId, ingest: result });
  } catch (e) {
    return err(String(e), 500);
  }
};
