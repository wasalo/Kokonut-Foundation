import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { syncJobs, auditLog, projects, metrics } from "@lib/schema";
import { ok, err } from "@lib/api";
import { id, nowIso } from "@lib/utils";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const body = (await request.json()) as any;
    const db = getDb(env);
    const jobId = id("wh_");
    // Apply updates if recognized entity arrays present
    const projectsArr = Array.isArray(body?.projects) ? body.projects : [];
    const metricsArr = Array.isArray(body?.metrics) ? body.metrics : [];
    let applied = { projects: 0, metrics: 0 };
    for (const p of projectsArr) {
      const mp = (await import("@lib/ki-mapping")).mapProject(p);
      await db.insert(projects).values({ ...mp, createdAt: nowIso(), updatedAt: nowIso() }).onConflictDoNothing?.();
      applied.projects++;
    }
    for (const m of metricsArr) {
      const mm = (await import("@lib/ki-mapping")).mapMetric(m, m.projectId);
      await db.insert(metrics).values({ ...mm, updatedAt: nowIso() }).onConflictDoNothing?.();
      applied.metrics++;
    }
    await db.insert(syncJobs).values({
      id: jobId,
      source: "kokonut-intelligence-webhook",
      status: "completed",
      startedAt: nowIso(),
      finishedAt: nowIso(),
      details: JSON.stringify({ applied, raw: body }).slice(0, 500),
    });
    await db.insert(auditLog).values({
      id: id("aud_"),
      actor: "ki-webhook",
      action: "webhook_received",
      entityType: "sync_job",
      entityId: jobId,
      after: JSON.stringify({ applied }).slice(0, 500),
      timestamp: nowIso(),
    });
    return ok({ received: true, jobId, applied });
  } catch (e) {
    return err(String(e), 500);
  }
};
