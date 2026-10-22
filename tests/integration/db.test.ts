import { describe, it, expect, beforeAll } from "vitest";
import { createTestDb, applySeed, columns, tables } from "./helpers";
import { projects, farms, metrics, measurements, evidence, redirects, contentBlocks } from "../../src/lib/schema";
import { eq } from "drizzle-orm";
import { mapKiProject, mapKiMrvEvent, mapCommonDataSchema } from "../../src/lib/ki-mapping";

let db: any;
let orm: any;

beforeAll(async () => {
  const created = await createTestDb();
  db = created.db;
  orm = created.orm;
});

describe("migration chain", () => {
  it("applies every migration in order without error", async () => {
    const created = await createTestDb();
    const names = tables(created.db);
    for (const t of [
      "projects", "farms", "metrics", "measurements", "evidence", "attestations",
      "reports", "treasury_entries", "wallets", "claims", "methodologies", "sources",
      "natural_assets", "activities", "audit_log", "sync_jobs", "redirects", "inquiries",
    ]) {
      expect(names).toContain(t);
    }
  });

  it("has no schema drift against the Drizzle model", async () => {
    const created = await createTestDb();
    for (const table of ["projects", "farms", "metrics", "evidence", "reports"]) {
      expect(columns(created.db, table)).toContain("id");
    }
    expect(columns(created.db, "projects")).toContain("created_at");
    expect(columns(created.db, "farms")).toContain("created_at");
    expect(columns(created.db, "metrics")).toContain("updated_at");
    expect(columns(created.db, "evidence")).toContain("uploaded_at");
    // resources gained the publishing `status` column in 0006
    expect(columns(created.db, "resources")).toContain("status");
  });
});

describe("seed data", () => {
  it("loads the Adelphi baseline and is queryable through Drizzle", async () => {
    applySeed(db);
    const rows = await orm.select().from(projects);
    expect(rows.length).toBeGreaterThanOrEqual(1);
    const adelphi = rows.find((p: any) => p.slug === "adelphi");
    expect(adelphi).toBeDefined();
    expect(adelphi.status).toBe("active");
    expect(JSON.parse(adelphi.sdgs)).toEqual([1, 2, 5, 8, 15]);
  });

  it("seeds the farm with KB-accurate coordinates and area", async () => {
    applySeed(db);
    const rows = await orm.select().from(farms);
    const adelphi = rows.find((f: any) => f.slug === "adelphi");
    expect(adelphi).toBeDefined();
    expect(adelphi.areaM2).toBe(15725);
    expect(adelphi.latitude).toBeCloseTo(18.9388, 3);
  });

  it("seeds metrics with resolvable methodology and source slugs", async () => {
    applySeed(db);
    const rows = await orm.select().from(metrics);
    const trees = rows.find((m: any) => m.slug === "coconut-trees");
    expect(trees).toBeDefined();
    expect(trees.methodology).toBe("tree-count");
    expect(trees.source).toBe("kokonut-intelligence");
  });

  it("seeds no self-referential redirects", async () => {
    applySeed(db);
    const rows = await orm.select().from(redirects);
    for (const r of rows) expect(r.fromPath).not.toBe(r.toPath);
  });
});

describe("ki ingest mapping against the real schema", () => {
  it("writes a KI farm into projects and farms with the 13-field baseline", async () => {
    applySeed(db);
    const m = mapKiProject(
      { id: "ki-99", name: "Nueva Finca", farm_type: "Syntropic", total_area: 4200, location_id: "7" },
      { id: "7", country: "Dominican Republic", region: "Monte Plata", latitude: 18.9388, longitude: -69.735 },
    );
    await orm.insert(projects).values({ ...m, createdAt: "now", updatedAt: "now" });
    const baseline = mapCommonDataSchema(
      { id: "ki-99", name: "Nueva Finca", total_area: 4200 },
      { id: "7", country: "Dominican Republic", region: "Monte Plata", latitude: 18.9388, longitude: -69.735 },
      { id: "9", public_summary: "Public Nouns #69" },
    );
    await orm.insert(contentBlocks).values({
      id: "ki_baseline_99",
      key: "baseline:nueva-finca",
      title: "Common Data Schema — Nueva Finca",
      body: JSON.stringify(baseline),
      updatedAt: "now",
    });

    const saved = await orm.select().from(contentBlocks).where(eq(contentBlocks.key, "baseline:nueva-finca"));
    expect(saved.length).toBe(1);
    const parsed = JSON.parse(saved[0].body);
    expect(Object.keys(parsed)).toHaveLength(13);
    expect(parsed.land_size).toBe(4200);

    const written = await orm.select().from(projects).where(eq(projects.id, "ki_ki-99"));
    expect(written.length).toBe(1);
    expect(written[0].country).toBe("Dominican Republic");
  });

  it("writes a KI MRV event as an evidence row with class and maturity", async () => {
    applySeed(db);
    const e = mapKiMrvEvent({
      id: "e1", event_type: "soil_carbon", measurement_type: "remote",
      evidence_hashes: ["sha256:abc"], attestation_uid: "0xuid", status: "published",
    });
    await orm.insert(evidence).values(e);
    const rows = await orm.select().from(evidence).where(eq(evidence.id, "ki_e1"));
    expect(rows.length).toBe(1);
    expect(rows[0].evidenceClass).toBe("measurement");
    expect(rows[0].maturity).toBe("attested");
    expect(rows[0].status).toBe("published");
  });

  it("writes KI measurements against a Foundation metric", async () => {
    applySeed(db);
    const metric = await orm.select().from(metrics).where(eq(metrics.slug, "coconut-trees"));
    await orm.insert(measurements).values({
      id: "ki_m1",
      metricId: metric[0].id,
      projectId: "proj_adelphi",
      value: 96,
      observedAt: "2026-09-30",
      source: "Kokonut Intelligence",
      methodology: "field count",
      verificationStatus: "verified",
    });
    const rows = await orm.select().from(measurements).where(eq(measurements.metricId, metric[0].id));
    expect(rows.length).toBe(1);
    expect(rows[0].value).toBe(96);
  });
});
