import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { syncJobs, auditLog, projects, metrics, measurements } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";
import { id, nowIso } from "@lib/utils";
import { mapProject, mapMetric, mapMeasurement } from "@lib/ki-mapping";

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
  let counts = { projects: 0, metrics: 0, measurements: 0 };
  try {
    if (kiUrl && kiKey) {
      const headers = { Authorization: `Bearer ${kiKey}` };
      // Fetch projects
      const pRes = await fetch(`${kiUrl}/projects`, { headers });
      if (pRes.ok) {
        const pData = (await pRes.json()) as any;
        const arr = Array.isArray(pData) ? pData : pData?.data ?? [];
        for (const p of arr) {
          const mp = mapProject(p);
          await db.insert(projects).values({ ...mp, createdAt: nowIso(), updatedAt: nowIso() }).onConflictDoNothing?.();
          counts.projects++;
          // Fetch metrics per project if endpoint exists
          try {
            const mRes = await fetch(`${kiUrl}/projects/${p.id ?? p.slug}/metrics`, { headers });
            if (mRes.ok) {
              const mData = (await mRes.json()) as any;
              const mArr = Array.isArray(mData) ? mData : mData?.data ?? [];
              for (const m of mArr) {
                const mm = mapMetric(m, mp.id);
                await db.insert(metrics).values({ ...mm, updatedAt: nowIso() }).onConflictDoNothing?.();
                counts.metrics++;
              }
            }
          } catch {}
        }
      }
      details = `imported ${counts.projects} projects, ${counts.metrics} metrics`;
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
    after: JSON.stringify({ status, details, counts }),
    timestamp: nowIso(),
  });

  return ok({ jobId, status, details, counts });
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
