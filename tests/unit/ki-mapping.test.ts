import { describe, it, expect } from "vitest";
import {
  mapKiProject, mapKiMetric, mapKiMeasurement, mapKiClaim, mapKiAttestation,
  mapKiReport, mapKiTreasuryEvent, mapKiPartner, mapCommonDataSchema,
  mapKiMrvEvent, mapKiRevenueEvent, resolveCollections, KI_COLLECTIONS,
} from "@lib/ki-mapping";

describe("ki-mapping (Directus contract)", () => {
  it("maps a KI farm + location to a Foundation project", () => {
    const p = mapKiProject(
      { id: "41", name: "Adelphi", farm_type: "Syntropic", total_area: 15725, status: "active", location_id: "7" },
      { id: "7", country: "Dominican Republic", region: "Monte Plata", latitude: 18.9388, longitude: -69.735 },
    );
    expect(p.slug).toBe("adelphi");
    expect(p.projectType).toBe("Syntropic");
    expect(p.latitude).toBeCloseTo(18.9388);
    expect(p.region).toContain("Monte Plata");
  });

  it("maps a metric definition", () => {
    const m = mapKiMetric({ id: "9", metric_key: "coconut_trees", display_name: "Coconut Trees", unit: "trees", version: "3" });
    expect(m.slug).toBe("coconut_trees");
    expect(m.name).toBe("Coconut Trees");
    expect(m.source).toBe("kokonut-intelligence");
  });

  it("maps a metric value to a measurement with verification state", () => {
    const v = mapKiMeasurement(
      { id: "1", metric_id: "9", value: 96, unit: "trees", verified: true, computation_method: "field count", period_end: "2026-09-30" },
      "ki_9",
    );
    expect(v.value).toBe(96);
    expect(v.metricId).toBe("ki_9");
    expect(v.verificationStatus).toBe("verified");
    expect(v.observedAt).toBe("2026-09-30");
  });

  it("maps an MRV claim", () => {
    const c = mapKiClaim({ id: "5", claim_type: "soil_carbon", status: "verified" });
    expect(c.title).toBe("soil_carbon");
    expect(c.status).toBe("verified");
  });

  it("maps an attestation record", () => {
    const a = mapKiAttestation({ id: "3", attestation_uid: "0xabc", claim_type: "mrv", chain: "celo", tx_hash: "0xdef" });
    expect(a.slug).toBe("0xabc");
    expect(a.source).toBe("celo");
    expect(a.externalUrl).toBeNull();
  });

  it("maps a report snapshot", () => {
    const r = mapKiReport({ id: "2", report_name: "Adelphi Annual 2025", report_type: "annual", status: "published" });
    expect(r.slug).toBe("adelphi-annual-2025");
    expect(r.status).toBe("published");
  });

  it("maps a treasury event", () => {
    const t = mapKiTreasuryEvent({ id: "8", chain: "gnosis", token: "vKKN", token_amount: 100, usd_value: 250, flow_direction: "in" });
    expect(t.chain).toBe("gnosis");
    expect(t.asset).toBe("vKKN");
    expect(t.valueUsd).toBe(250);
    expect(t.source).toBe("onchain");
  });

  it("maps a partner", () => {
    const p = mapKiPartner({ id: "4", name: "Kokonut Network", partner_type: "Community" });
    expect(p.slug).toBe("kokonut-network");
    expect(p.type).toBe("Community");
  });

  it("builds the 13-field Common Data Schema baseline", () => {
    const b = mapCommonDataSchema(
      { id: "41", name: "Adelphi", total_area: 15725, description: "desc" },
      { id: "7", country: "Dominican Republic", region: "Monte Plata", latitude: 18.9388, longitude: -69.735 },
      { id: "9", public_summary: "Public Nouns #69" },
    );
    expect(Object.keys(b)).toHaveLength(13);
    expect(b.land_size).toBe(15725);
    expect(b.project_location.country).toBe("Dominican Republic");
    expect(b.token_allocation).toBe("not_applicable");
  });

  it("maps a canonical MRV event to an evidence row", () => {
    const e = mapKiMrvEvent({
      id: "12", event_type: "soil_carbon", measurement_type: "ground",
      evidence_urls: ["ipfs://abc"], evidence_hashes: ["sha256:xyz"],
      reviewer_id: "staff-1", status: "verified", event_date: "2026-05-01",
    });
    expect(e.type).toBe("soil_carbon");
    expect(e.evidenceClass).toBe("measurement");
    expect(e.maturity).toBe("reviewed");
    expect(e.hash).toBe("sha256:xyz");
  });

  it("maps a canonical revenue event to a funding event", () => {
    const r = mapKiRevenueEvent({
      id: "20", revenue_type: "sponsorship", amount: 5000, currency: "USD",
      counterparty: "Public Nouns", tx_hash: "0xfeed",
    });
    expect(r.amount).toBe(5000);
    expect(r.funder).toBe("Public Nouns");
    expect(r.externalUrl).toContain("0xfeed");
  });

  it("resolves the collection map with env overrides", () => {
    expect(resolveCollections({}).farm).toBe(KI_COLLECTIONS.farm);
    const overridden = resolveCollections({ KI_COLLECTION_MAP: JSON.stringify({ mrvEvent: "mrv_observation" }) });
    expect(overridden.mrvEvent).toBe("mrv_observation");
    expect(overridden.farm).toBe("farm");
  });

  it("falls back to defaults on an invalid collection map", () => {
    const fallback = resolveCollections({ KI_COLLECTION_MAP: "not-json" });
    expect(fallback.farm).toBe(KI_COLLECTIONS.farm);
  });
});
