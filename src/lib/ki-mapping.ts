// Mapping: Kokonut Intelligence (Directus collections) -> Foundation D1 entities.
// Field names follow the KI OpenAPI contract (docs/openapi.yaml in
// wasalo/Kokonut-Intelligence).

export interface KiFarm {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  farm_type?: string;
  total_area?: number;
  area_unit?: string;
  status?: string;
  location_id?: string;
  created_at?: string;
}

export interface KiLocation {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  country?: string;
  region?: string;
  sub_region?: string;
  latitude?: number;
  longitude?: number;
  boundary?: unknown;
  baseline_revenue?: number;
  baseline_cost?: number;
  baseline_source?: string;
  baseline_date?: string;
}

export interface KiMetricDefinition {
  id: string;
  metric_key?: string;
  display_name?: string;
  description?: string;
  unit?: string;
  version?: string;
  owner?: string;
  active?: boolean;
}

export interface KiMetricValue {
  id: string;
  metric_id?: string;
  location_id?: string;
  period_start?: string;
  period_end?: string;
  value?: number;
  unit?: string;
  computation_method?: string;
  source_record_ids?: string[];
  computed_at?: string;
  verified?: boolean;
  verified_by?: string;
  verified_at?: string;
  verification_notes?: string;
}

export interface KiMrvClaim {
  id: string;
  location_id?: string;
  plot_id?: string;
  claim_type?: string;
  claim_date?: string;
  claim_data?: Record<string, unknown>;
  source_record_ids?: string[];
  evidence_urls?: string[];
  evidence_hashes?: string[];
  status?: string;
  reviewer_id?: string;
  review_notes?: string;
  reviewed_at?: string;
  attestation_uid?: string;
  attested_at?: string;
  public_summary?: string;
  schema_version?: string;
  created_at?: string;
}

export interface KiAttestationRecord {
  id: string;
  attestation_uid?: string;
  schema_id?: string;
  claim_type?: string;
  subject_id?: string;
  subject_type?: string;
  claim_data?: Record<string, unknown>;
  evidence_hash?: string;
  evidence_cids?: string[];
  evidence_urls?: string[];
  status?: string;
  chain?: string;
  tx_hash?: string;
  attested_at?: string;
  expiration_date?: string;
  revocation_date?: string;
  reviewed_at?: string;
}

export interface KiReportSnapshot {
  id: string;
  report_name?: string;
  report_type?: string;
  location_id?: string;
  period_start?: string;
  period_end?: string;
  report_data?: Record<string, unknown>;
  snapshot_hash?: string;
  file_url?: string;
  status?: string;
}

export interface KiTreasuryEvent {
  id: string;
  location_id?: string;
  wallet_id?: string;
  chain?: string;
  event_date?: string;
  flow_direction?: string;
  amount?: number;
  token?: string;
  token_amount?: number;
  usd_value?: number;
  source?: string;
  purpose?: string;
  tx_hash?: string;
  block_number?: number;
  verified?: boolean;
  attestation_uid?: string;
}

export interface KiPartner {
  id: string;
  name?: string;
  slug?: string;
  partner_type?: string;
  description?: string;
  website?: string;
  contact_email?: string;
  status?: string;
}

export interface KiFarmRegistryRecord {
  id: string;
  location_id?: string;
  status?: string;
  evidence_maturity?: string;
  public_summary?: string;
  created_at?: string;
  updated_at?: string;
}

/** Refactor-branch collection: canonical MRV event (ground | remote | community). */
export interface KiMrvEvent {
  id: string;
  location_id?: string;
  plot_id?: string;
  event_type?: string;
  event_date?: string;
  measurement_type?: "ground" | "remote" | "community";
  payload?: Record<string, unknown>;
  source_record_ids?: string[];
  evidence_urls?: string[];
  evidence_hashes?: string[];
  status?: string;
  reviewer_id?: string;
  review_notes?: string;
  reviewed_at?: string;
  attestation_uid?: string;
  attested_at?: string;
  public_summary?: string;
  created_at?: string;
}

/** Refactor-branch collection: canonical revenue facts. */
export interface KiRevenueEvent {
  id: string;
  location_id?: string;
  event_date?: string;
  revenue_type?: string;
  amount?: number;
  currency?: string;
  usd_value?: number;
  counterparty?: string;
  description?: string;
  payment_status?: string;
  tx_hash?: string;
  evidence_urls?: string[];
  created_at?: string;
}

/**
 * KI collection names. The Intelligence platform is mid-refactor, so the
 * mapping is data-driven: override with KI_COLLECTION_MAP (JSON) so wiring the
 * new contract is a configuration change, not a code change.
 */
export const KI_COLLECTIONS = {
  farm: "farm",
  location: "location",
  partner: "partner",
  staff: "staff",
  metricDefinition: "metric_definition",
  metricValue: "metric_value",
  mrvClaim: "mrv_claim",
  mrvEvent: "mrv_event",
  attestationRecord: "attestation_record",
  reportSnapshot: "report_snapshot",
  treasuryEvent: "treasury_event",
  revenueEvent: "revenue_event",
  farmRegistryRecord: "farm_registry_record",
} as const;

export type KiCollectionMap = Record<keyof typeof KI_COLLECTIONS, string>;

export function resolveCollections(env: any): KiCollectionMap {
  const raw = env?.KI_COLLECTION_MAP;
  if (!raw) return { ...KI_COLLECTIONS };
  try {
    const parsed = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));
    return { ...KI_COLLECTIONS, ...parsed };
  } catch {
    return { ...KI_COLLECTIONS };
  }
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function mapKiProject(farm: KiFarm, location?: KiLocation) {
  return {
    id: `ki_${farm.id}`,
    slug: slugify(farm.slug || farm.name || farm.id),
    name: farm.name || farm.id,
    summary: farm.description || "",
    description: farm.description || "",
    status: farm.status || "active",
    projectType: farm.farm_type || "Regenerative Farm",
    country: location?.country || "",
    region: [location?.region, location?.sub_region].filter(Boolean).join(", "),
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    impactAreas: "[]",
    sdgs: "[]",
  };
}

export function mapKiMetric(def: KiMetricDefinition, projectId?: string) {
  // KI metric_key is the canonical, stable identifier — keep it verbatim so
  // lookups by metric_key work across systems.
  const key = def.metric_key
    ? def.metric_key.trim().toLowerCase().replace(/\s+/g, "-")
    : slugify(def.display_name || def.id);
  return {
    id: `ki_${def.id}`,
    slug: key,
    name: def.display_name || def.metric_key || def.id,
    description: def.description || "",
    category: def.owner || "Kokonut Intelligence",
    value: 0,
    unit: def.unit || "",
    projectId: projectId ?? null,
    methodology: def.version ? `KI metric definition v${def.version}` : null,
    source: "kokonut-intelligence",
    verificationStatus: "reported",
  };
}

export function mapKiMeasurement(value: KiMetricValue, metricId: string, projectId?: string) {
  return {
    id: `ki_${value.id}`,
    metricId,
    projectId: projectId ?? value.location_id ?? null,
    value: Number(value.value ?? 0),
    observedAt: value.period_end || value.period_start || value.computed_at || new Date().toISOString(),
    source: "Kokonut Intelligence",
    methodology: value.computation_method ?? null,
    verificationStatus: value.verified ? "verified" : "reported",
  };
}

export function mapKiClaim(claim: KiMrvClaim, projectId?: string) {
  return {
    id: `ki_${claim.id}`,
    slug: slugify(claim.claim_type || claim.id),
    title: claim.claim_type || "MRV claim",
    description: claim.public_summary ?? null,
    projectId: projectId ?? claim.location_id ?? null,
    metricId: null,
    status: claim.status || "reported",
    createdAt: new Date().toISOString(),
  };
}

export function mapKiAttestation(rec: KiAttestationRecord, projectId?: string) {
  return {
    id: `ki_${rec.id}`,
    slug: slugify(rec.attestation_uid || rec.id),
    source: rec.chain || "EAS",
    title: rec.claim_type || "Attestation",
    description: null,
    projectId: projectId ?? null,
    metricId: null,
    externalUrl: rec.evidence_urls?.[0] ?? null,
    issuedAt: rec.attested_at ?? rec.reviewed_at ?? null,
    verificationStatus: rec.status || "reported",
  };
}

export function mapKiReport(report: KiReportSnapshot, projectId?: string) {
  return {
    id: `ki_${report.id}`,
    slug: slugify(report.report_name || report.id),
    title: report.report_name || "Report",
    summary: report.report_type || null,
    reportType: report.report_type || "Snapshot",
    projectId: projectId ?? report.location_id ?? null,
    periodStart: report.period_start ?? null,
    periodEnd: report.period_end ?? null,
    publishedAt: new Date().toISOString(),
    documentKey: report.file_url ?? `reports/ki_${report.id}`,
    authors: "[\"Kokonut Intelligence\"]",
    visibility: "public",
    status: report.status === "published" ? "published" : "draft",
  };
}

export function mapKiTreasuryEvent(ev: KiTreasuryEvent, walletId?: string) {
  return {
    id: `ki_${ev.id}`,
    walletId: walletId ?? ev.wallet_id ?? "unknown",
    chain: ev.chain || "ethereum",
    txHash: ev.tx_hash ?? null,
    blockNumber: ev.block_number ?? null,
    fromAddr: ev.flow_direction === "in" ? ev.wallet_id ?? null : null,
    toAddr: ev.flow_direction === "in" ? null : ev.wallet_id ?? null,
    asset: ev.token || "native",
    amount: Number(ev.token_amount ?? ev.amount ?? 0),
    valueUsd: ev.usd_value ?? null,
    occurredAt: ev.event_date || new Date().toISOString(),
    category: ev.purpose ?? ev.source ?? null,
    interpretationLabel: ev.purpose ?? null,
    source: "onchain",
  };
}

export function mapKiPartner(p: KiPartner) {
  return {
    id: `ki_${p.id}`,
    slug: slugify(p.slug || p.name || p.id),
    name: p.name || p.id,
    type: p.partner_type || "Partner",
    description: p.description || "",
    website: p.website ?? null,
    country: null,
    createdAt: new Date().toISOString(),
  };
}

/** Maps a canonical MRV event (refactor branch) to a Foundation evidence row. */
export function mapKiMrvEvent(ev: KiMrvEvent, projectId?: string) {
  const evidenceClass =
    ev.measurement_type === "ground" || ev.measurement_type === "remote" || ev.measurement_type === "community"
      ? "measurement"
      : "direct_observation";
  return {
    id: `ki_${ev.id}`,
    type: ev.event_type || ev.measurement_type || "Observation",
    title: ev.public_summary || ev.event_type || "MRV event",
    description: ev.review_notes ?? ev.public_summary ?? null,
    projectId: projectId ?? ev.location_id ?? null,
    metricId: null,
    objectKey: ev.evidence_urls?.[0] ?? null,
    externalUrl: ev.evidence_urls?.[0] ?? null,
    capturedAt: ev.event_date ?? ev.created_at ?? null,
    uploadedAt: ev.created_at ?? new Date().toISOString(),
    hash: ev.evidence_hashes?.[0] ?? null,
    visibility: "public",
    status: ev.status === "published" ? "published" : "draft",
    evidenceClass,
    maturity: ev.attestation_uid ? "attested" : ev.reviewer_id ? "reviewed" : "structured",
  };
}

/** Maps a canonical revenue event to a Foundation funding event. */
export function mapKiRevenueEvent(ev: KiRevenueEvent, projectId?: string) {
  return {
    id: `ki_${ev.id}`,
    title: ev.description || ev.revenue_type || "Revenue event",
    amount: ev.amount ?? ev.usd_value ?? null,
    currency: ev.currency ?? "USD",
    funder: ev.counterparty ?? null,
    projectId: projectId ?? ev.location_id ?? null,
    occurredAt: ev.event_date ?? ev.created_at ?? new Date().toISOString(),
    category: ev.revenue_type ?? null,
    externalUrl: ev.tx_hash ? `https://gnosisscan.io/tx/${ev.tx_hash}` : null,
  };
}

/**
 * The 13-field Common Data Schema baseline as carried by KI's
 * farm_registry_record / farm / location collections.
 */
export function mapCommonDataSchema(
  farm: KiFarm,
  location: KiLocation | undefined,
  record: KiFarmRegistryRecord | undefined,
) {
  return {
    project_date: record?.created_at ?? farm.created_at ?? null,
    project_location: {
      coordinates: location ? `${location.latitude},${location.longitude}` : "",
      region: [location?.region, location?.sub_region].filter(Boolean).join(", "),
      country: location?.country ?? "",
    },
    land_size: farm.total_area ?? 0,
    revenue_streams: [] as string[],
    target_market: [] as string[],
    forecasted_budget: null as number | null,
    source_of_funding: record?.public_summary ?? null,
    public_goods_allocation: 0,
    governance_mechanism: "local_operator; kokonut_network_coordination",
    token_allocation: "not_applicable",
    project_summary: farm.description ?? "",
    local_problem: null as string | null,
    proposed_solution: location?.description ?? null,
  };
}
