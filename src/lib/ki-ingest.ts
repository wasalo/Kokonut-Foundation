import { getDb } from "./db";
import { getKiClient } from "./ki-client";
import {
  projects, farms, metrics, measurements, claims, attestations, reports,
  treasuryEntries, partners, fundingEvents, evidence, syncJobs, auditLog, contentBlocks,
} from "./schema";
import { eq } from "drizzle-orm";
import { id, nowIso, slugify } from "./utils";
import {
  mapKiProject, mapKiMetric, mapKiMeasurement, mapKiClaim, mapKiAttestation,
  mapKiReport, mapKiTreasuryEvent, mapKiPartner, mapCommonDataSchema,
  mapKiMrvEvent, mapKiRevenueEvent, resolveCollections,
} from "./ki-mapping";

export interface KiIngestResult {
  status: "completed" | "failed" | "skipped";
  details: string;
  counts: Record<string, number>;
}

/**
 * Pulls governed records from Kokonut Intelligence (Directus REST) and upserts
 * them into the Foundation's presentation store (D1).
 * The Foundation never becomes the canonical record owner — KI remains the
 * governed source of truth.
 */
export async function runKiIngest(env: any): Promise<KiIngestResult> {
  const counts: Record<string, number> = {
    projects: 0, farms: 0, metrics: 0, measurements: 0, claims: 0,
    attestations: 0, reports: 0, treasury: 0, partners: 0, evidence: 0, funding: 0,
  };

  if (!env.DB) return { status: "failed", details: "DB not configured", counts };

  const client = getKiClient(env);
  if (!client) {
    return { status: "skipped", details: "KI not configured (KI_API_URL missing)", counts };
  }

  const db = getDb(env);
  const jobId = id("sync_");
  await db.insert(syncJobs).values({
    id: jobId, source: "kokonut-intelligence", status: "running",
    startedAt: nowIso(), details: "started",
  });

  try {
    const C = resolveCollections(env);
    // --- Master data -------------------------------------------------------
    const [kiFarms, kiLocations, kiPartners, kiRegistry] = await Promise.all([
      client.listAll<any>(C.farm),
      client.listAll<any>(C.location),
      client.listAll<any>(C.partner),
      client.listAll<any>(C.farmRegistryRecord).catch(() => [] as any[]),
    ]);
    const locationById = new Map(kiLocations.map((l) => [String(l.id), l]));
    const registryByLocation = new Map(kiRegistry.map((r) => [String(r.location_id), r]));

    for (const pf of kiPartners) {
      const m = mapKiPartner(pf);
      await db.insert(partners).values(m).onConflictDoNothing?.();
      counts.partners++;
    }

    for (const f of kiFarms) {
      const loc = f.location_id ? locationById.get(String(f.location_id)) : undefined;
      const registry = f.location_id ? registryByLocation.get(String(f.location_id)) : undefined;
      const m = mapKiProject(f, loc);
      await db.insert(projects).values({ ...m, createdAt: nowIso(), updatedAt: nowIso() }).onConflictDoNothing?.();
      counts.projects++;

      // Farm record (Foundation `farms` table) mirrors the KI farm + location.
      const farmSlug = m.slug;
      const baseline = mapCommonDataSchema(f, loc, registry);
      const area = f.total_area ?? 0;
      await db.insert(farms).values({
        id: `ki_${f.id}`,
        slug: farmSlug,
        name: f.name || farmSlug,
        projectId: m.id,
        country: loc?.country ?? "",
        region: [loc?.region, loc?.sub_region].filter(Boolean).join(", "),
        latitude: loc?.latitude ?? null,
        longitude: loc?.longitude ?? null,
        areaM2: area,
        agriculturalAreaM2: null,
        description: f.description ?? "",
        status: f.status === "active" ? "active" : "planned",
        lifecycleState: registry?.status === "published" ? "published" : "draft",
        baseline: JSON.stringify(baseline),
        schemaVersion: "1.0",
        founders: null,
        jobs: null,
        frameworkPhase: null,
        fundingRef: registry?.public_summary ?? null,
        publicGoodsAllocation: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      }).onConflictDoNothing?.();
      counts.farms++;

      // Store the 13-field baseline as an addressable content block.
      await db.insert(contentBlocks).values({
        id: `ki_baseline_${f.id}`,
        key: `baseline:${farmSlug}`,
        title: `Common Data Schema — ${f.name || farmSlug}`,
        body: JSON.stringify(baseline),
        updatedAt: nowIso(),
      }).onConflictDoNothing?.();
    }

    // --- Governed metrics --------------------------------------------------
    const metricDefs = await client.listAll<any>(C.metricDefinition);
    const metricByKiId = new Map<string, string>();
    for (const def of metricDefs) {
      const m = mapKiMetric(def);
      await db.insert(metrics).values({ ...m, updatedAt: nowIso() }).onConflictDoNothing?.();
      metricByKiId.set(String(def.id), m.id);
      counts.metrics++;
    }

    const metricValues = await client.listAll<any>(C.metricValue);
    for (const mv of metricValues) {
      const metricId = metricByKiId.get(String(mv.metric_id));
      if (!metricId) continue;
      const m = mapKiMeasurement(mv, metricId);
      await db.insert(measurements).values(m).onConflictDoNothing?.();
      counts.measurements++;
    }

    // --- Evidence, claims, attestations ------------------------------------
    const claimsList = await client.listAll<any>(C.mrvClaim).catch(() => [] as any[]);
    for (const c of claimsList) {
      const m = mapKiClaim(c);
      await db.insert(claims).values(m).onConflictDoNothing?.();
      counts.claims++;
    }

    // Refactor-branch canonical MRV events become Foundation evidence rows.
    const mrvEvents = await client.listAll<any>(C.mrvEvent).catch(() => [] as any[]);
    for (const ev of mrvEvents) {
      const m = mapKiMrvEvent(ev);
      await db.insert(evidence).values(m).onConflictDoNothing?.();
      counts.evidence++;
    }

    const atts = await client.listAll<any>(C.attestationRecord);
    for (const a of atts) {
      const m = mapKiAttestation(a);
      await db.insert(attestations).values(m).onConflictDoNothing?.();
      counts.attestations++;
    }

    // --- Reports -----------------------------------------------------------
    const snapshots = await client.listAll<any>(C.reportSnapshot);
    for (const r of snapshots) {
      const m = mapKiReport(r);
      await db.insert(reports).values(m).onConflictDoNothing?.();
      counts.reports++;
    }

    // --- Treasury & funding -----------------------------------------------
    const treasury = await client.listAll<any>(C.treasuryEvent);
    for (const t of treasury) {
      const m = mapKiTreasuryEvent(t);
      await db.insert(treasuryEntries).values(m).onConflictDoNothing?.();
      counts.treasury++;
    }

    const revenue = await client.listAll<any>(C.revenueEvent).catch(() => [] as any[]);
    for (const r of revenue) {
      const m = mapKiRevenueEvent(r);
      await db.insert(fundingEvents).values(m).onConflictDoNothing?.();
      counts.funding++;
    }

    const details = `imported ${counts.projects} projects, ${counts.farms} farms, ${counts.metrics} metrics, ${counts.measurements} measurements, ${counts.claims} claims, ${counts.evidence} evidence, ${counts.attestations} attestations, ${counts.reports} reports, ${counts.treasury} treasury events, ${counts.funding} funding events, ${counts.partners} partners`;
    await db.update(syncJobs).set({ status: "completed", finishedAt: nowIso(), details }).where(eq(syncJobs.id, jobId));
    await db.insert(auditLog).values({
      id: id("aud_"), actor: "system", action: "ki_ingest", entityType: "sync_job",
      entityId: jobId, after: JSON.stringify(counts), timestamp: nowIso(),
    });
    return { status: "completed", details, counts };
  } catch (e) {
    const details = String(e);
    await db.update(syncJobs).set({ status: "failed", finishedAt: nowIso(), details }).where(eq(syncJobs.id, jobId));
    await db.insert(auditLog).values({
      id: id("aud_"), actor: "system", action: "ki_ingest", entityType: "sync_job",
      entityId: jobId, after: JSON.stringify({ error: details }), timestamp: nowIso(),
    });
    return { status: "failed", details, counts };
  }
}
