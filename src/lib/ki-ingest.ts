import { getDb } from "./db";
import { projects, metrics, measurements, evidence, attestations, syncJobs, auditLog, attestationChainRefs } from "./schema";
import { eq } from "drizzle-orm";
import { id, nowIso } from "./utils";
import { mapProject, mapMetric, mapMeasurement } from "./ki-mapping";

export async function runKiIngest(env: any): Promise<{ status: string; details: string; counts: any }> {
  const kiUrl = env.KI_API_URL;
  const kiKey = env.KI_API_KEY;
  if (!env.DB) throw new Error("DB not configured");
  const db = getDb(env);
  const jobId = id("sync_");
  await db.insert(syncJobs).values({ id: jobId, source: "kokonut-intelligence", status: "running", startedAt: nowIso(), details: kiUrl ? "started" : "disabled" });

  let status = "completed";
  let details = "no-op (KI not configured)";
  const counts = { projects: 0, metrics: 0, measurements: 0, attestations: 0 };

  try {
    if (kiUrl && kiKey) {
      const headers = { Authorization: `Bearer ${kiKey}` };
      const pRes = await fetch(`${kiUrl}/projects`, { headers });
      if (pRes.ok) {
        const pData = (await pRes.json()) as any;
        const arr = Array.isArray(pData) ? pData : pData?.data ?? [];
        for (const p of arr) {
          const mp = mapProject(p);
          await db.insert(projects).values({ ...mp, createdAt: nowIso(), updatedAt: nowIso() }).onConflictDoNothing?.();
          counts.projects++;
          // metrics
          try {
            const mRes = await fetch(`${kiUrl}/projects/${p.id ?? p.slug}/metrics`, { headers });
            if (mRes.ok) {
              const mData = (await mRes.json()) as any;
              const mArr = Array.isArray(mData) ? mData : mData?.data ?? [];
              for (const m of mArr) {
                const mm = mapMetric(m, mp.id);
                await db.insert(metrics).values({ ...mm, updatedAt: nowIso() }).onConflictDoNothing?.();
                counts.metrics++;
                // measurements per metric
                try {
                  const measRes = await fetch(`${kiUrl}/metrics/${m.id ?? m.slug}/measurements`, { headers });
                  if (measRes.ok) {
                    const measData = (await measRes.json()) as any;
                    const measArr = Array.isArray(measData) ? measData : measData?.data ?? [];
                    for (const meas of measArr) {
                      const mm2 = mapMeasurement(meas, mm.id, mp.id);
                      await db.insert(measurements).values(mm2).onConflictDoNothing?.();
                      counts.measurements++;
                    }
                  }
                } catch {}
              }
            }
          } catch {}
          // attestations per project
          try {
            const aRes = await fetch(`${kiUrl}/projects/${p.id ?? p.slug}/attestations`, { headers });
            if (aRes.ok) {
              const aData = (await aRes.json()) as any;
              const aArr = Array.isArray(aData) ? aData : aData?.data ?? [];
              for (const a of aArr) {
                await db.insert(attestations).values({
                  id: `ki_${a.id ?? a.uid ?? Math.random().toString(36).slice(2)}`,
                  source: a.source ?? "Kokonut Intelligence",
                  title: a.title ?? "Attestation",
                  description: a.description ?? null,
                  projectId: mp.id,
                  metricId: a.metricId ?? null,
                  externalUrl: a.url ?? a.explorerUrl ?? null,
                  issuedAt: a.issuedAt ?? a.time ?? null,
                  verificationStatus: a.verificationStatus ?? "reported",
                }).onConflictDoNothing?.();
                counts.attestations++;
              }
            }
          } catch {}
        }
      }
      details = `imported ${counts.projects} projects, ${counts.metrics} metrics, ${counts.measurements} measurements, ${counts.attestations} attestations`;
    }
  } catch (e) {
    status = "failed";
    details = String(e);
  }

  await db.update(syncJobs).set({ status, finishedAt: nowIso(), details }).where(eq(syncJobs.id, jobId));
  await db.insert(auditLog).values({ id: id("aud_"), actor: "system", action: "ki_ingest", entityType: "sync_job", entityId: jobId, after: JSON.stringify({ status, details, counts }), timestamp: nowIso() });

  return { status, details, counts };
}
