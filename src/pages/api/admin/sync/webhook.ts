import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { syncJobs, auditLog } from "@lib/schema";
import { ok, err } from "@lib/api";
import { id, nowIso } from "@lib/utils";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const body = await request.json();
    const db = getDb(env);
    const jobId = id("wh_");
    await db.insert(syncJobs).values({
      id: jobId,
      source: "kokonut-intelligence-webhook",
      status: "completed",
      startedAt: nowIso(),
      finishedAt: nowIso(),
      details: JSON.stringify(body).slice(0, 500),
    });
    await db.insert(auditLog).values({
      id: id("aud_"),
      actor: "ki-webhook",
      action: "webhook_received",
      entityType: "sync_job",
      entityId: jobId,
      after: JSON.stringify(body).slice(0, 500),
      timestamp: nowIso(),
    });
    return ok({ received: true, jobId });
  } catch (e) {
    return err(String(e), 500);
  }
};
