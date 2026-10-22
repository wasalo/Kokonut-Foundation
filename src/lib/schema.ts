import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("active"),
  projectType: text("project_type").notNull(),
  country: text("country").notNull(),
  region: text("region"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  heroImage: text("hero_image"),
  impactAreas: text("impact_areas").notNull().default("[]"),
  sdgs: text("sdgs").notNull().default("[]"),
  partners: text("partners").notNull().default("[]"),
  metrics: text("metrics").notNull().default("[]"),
  milestones: text("milestones").notNull().default("[]"),
  resources: text("resources").notNull().default("[]"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const metrics = sqliteTable("metrics", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  value: real("value").notNull(),
  unit: text("unit").notNull(),
  projectId: text("project_id"),
  observedAt: text("observed_at"),
  reportingPeriodStart: text("reporting_period_start"),
  reportingPeriodEnd: text("reporting_period_end"),
  methodology: text("methodology"),
  source: text("source"),
  confidence: real("confidence"),
  verificationStatus: text("verification_status").notNull().default("reported"),
  evidenceIds: text("evidence_ids").notNull().default("[]"),
  updatedAt: text("updated_at").notNull(),
  status: text("status").notNull().default("published"),
});

export const measurements = sqliteTable("measurements", {
  id: text("id").primaryKey(),
  metricId: text("metric_id").notNull(),
  projectId: text("project_id"),
  value: real("value").notNull(),
  observedAt: text("observed_at").notNull(),
  source: text("source"),
  methodology: text("methodology"),
  verificationStatus: text("verification_status").notNull().default("reported"),
  evidenceId: text("evidence_id"),
});

export const milestones = sqliteTable("milestones", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("planned"),
  dueDate: text("due_date"),
  completedAt: text("completed_at"),
});

export const partners = sqliteTable("partners", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  website: text("website"),
  logo: text("logo"),
  country: text("country"),
  createdAt: text("created_at").notNull(),
});

export const projectPartners = sqliteTable("project_partners", {
  projectId: text("project_id").notNull(),
  partnerId: text("partner_id").notNull(),
});

export const teamMembers = sqliteTable("team_members", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio"),
  photo: text("photo"),
  email: text("email"),
  linkedin: text("linkedin"),
  order: integer("sort_order").notNull().default(0),
});

export const resources = sqliteTable("resources", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary"),
  resourceType: text("resource_type").notNull(),
  projectId: text("project_id"),
  topic: text("topic"),
  year: integer("year"),
  sdgs: text("sdgs").notNull().default("[]"),
  impactAreas: text("impact_areas").notNull().default("[]"),
  documentKey: text("document_key"),
  externalUrl: text("external_url"),
  publishedAt: text("published_at").notNull(),
  visibility: text("visibility").notNull().default("public"),
  status: text("status").notNull().default("published"),
});

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary"),
  reportType: text("report_type").notNull(),
  projectId: text("project_id"),
  periodStart: text("period_start"),
  periodEnd: text("period_end"),
  publishedAt: text("published_at").notNull(),
  documentKey: text("document_key").notNull(),
  authors: text("authors").notNull().default("[]"),
  visibility: text("visibility").notNull().default("public"),
  status: text("status").notNull().default("published"),
});

export const evidence = sqliteTable("evidence", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  projectId: text("project_id"),
  metricId: text("metric_id"),
  objectKey: text("object_key"),
  externalUrl: text("external_url"),
  capturedAt: text("captured_at"),
  uploadedAt: text("uploaded_at").notNull(),
  hash: text("hash"),
  visibility: text("visibility").notNull().default("public"),
  status: text("status").notNull().default("published"),
  evidenceClass: text("evidence_class").notNull().default("measurement"),
  maturity: text("maturity").notNull().default("structured"),
});

export const attestations = sqliteTable("attestations", {
  id: text("id").primaryKey(),
  source: text("source").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  projectId: text("project_id"),
  metricId: text("metric_id"),
  externalUrl: text("external_url"),
  issuedAt: text("issued_at"),
  verificationStatus: text("verification_status").notNull().default("reported"),
});

export const fundingEvents = sqliteTable("funding_events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  amount: real("amount"),
  currency: text("currency"),
  funder: text("funder"),
  projectId: text("project_id"),
  occurredAt: text("occurred_at").notNull(),
  category: text("category"),
  externalUrl: text("external_url"),
});

export const contentBlocks = sqliteTable("content_blocks", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  title: text("title"),
  body: text("body").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const inquiries = sqliteTable("inquiries", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  organization: text("organization"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull(),
});

export const redirects = sqliteTable("redirects", {
  id: text("id").primaryKey(),
  fromPath: text("from_path").notNull().unique(),
  toPath: text("to_path").notNull(),
  statusCode: integer("status_code").notNull().default(301),
});

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  before: text("before_json"),
  after: text("after_json"),
  timestamp: text("timestamp").notNull(),
});

export const adminRoles = sqliteTable("admin_roles", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  grantedBy: text("granted_by"),
  grantedAt: text("granted_at").notNull(),
  active: integer("active").notNull().default(1),
});

export const syncJobs = sqliteTable("sync_jobs", {
  id: text("id").primaryKey(),
  source: text("source").notNull(),
  status: text("status").notNull().default("pending"),
  startedAt: text("started_at"),
  finishedAt: text("finished_at"),
  details: text("details"),
});

export const farms = sqliteTable("farms", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  projectId: text("project_id"),
  country: text("country").notNull(),
  region: text("region"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  areaM2: real("area_m2"),
  agriculturalAreaM2: real("agricultural_area_m2"),
  description: text("description"),
  status: text("status").notNull().default("active"),
  lifecycleState: text("lifecycle_state").notNull().default("draft"),
  privacyClass: text("privacy_class").notNull().default("public"),
  baseline: text("baseline"), // JSON: 13-field Common Data Schema
  schemaVersion: text("schema_version").notNull().default("1.0"),
  jobs: integer("jobs"),
  founders: text("founders"),
  frameworkPhase: text("framework_phase"),
  fundingRef: text("funding_ref"),
  publicGoodsAllocation: real("public_goods_allocation"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const wallets = sqliteTable("wallets", {
  id: text("id").primaryKey(),
  address: text("address").notNull(),
  chain: text("chain").notNull(),
  label: text("label").notNull(),
  walletType: text("wallet_type").notNull().default("foundation"),
  visibility: text("visibility").notNull().default("public"),
  createdAt: text("created_at").notNull(),
});

export const treasuryEntries = sqliteTable("treasury_entries", {
  id: text("id").primaryKey(),
  walletId: text("wallet_id").notNull(),
  asset: text("asset").notNull(),
  amount: real("amount").notNull(),
  valueUsd: real("value_usd"),
  occurredAt: text("occurred_at").notNull(),
  txHash: text("tx_hash"),
  category: text("category"),
  interpretationLabel: text("interpretation_label"),
  source: text("source").notNull().default("foundation"),
  projectId: text("project_id"),
});

export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  scopes: text("scopes").notNull().default("[]"),
  createdAt: text("created_at").notNull(),
  lastUsedAt: text("last_used_at"),
});

export const naturalAssets = sqliteTable("natural_assets", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  assetType: text("asset_type").notNull(),
  projectId: text("project_id"),
  farmId: text("farm_id"),
  description: text("description"),
  createdAt: text("created_at").notNull(),
});

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  naturalAssetId: text("natural_asset_id"),
  projectId: text("project_id"),
  description: text("description"),
  occurredAt: text("occurred_at"),
  createdAt: text("created_at").notNull(),
});

export const claims = sqliteTable("claims", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  projectId: text("project_id"),
  metricId: text("metric_id"),
  status: text("status").notNull().default("reported"),
  createdAt: text("created_at").notNull(),
});

export const methodologies = sqliteTable("methodologies", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  version: text("version"),
  documentKey: text("document_key"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sourceType: text("source_type").notNull(),
  url: text("url"),
  description: text("description"),
  createdAt: text("created_at").notNull(),
});

export const evidenceLinks = sqliteTable("evidence_links", {
  evidenceId: text("evidence_id").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
});

export const attestationChainRefs = sqliteTable("attestation_chain_refs", {
  id: text("id").primaryKey(),
  attestationId: text("attestation_id").notNull(),
  chain: text("chain").notNull(),
  uid: text("uid").notNull(),
  txHash: text("tx_hash"),
  attester: text("attester"),
  schemaId: text("schema_id"),
  issuedAt: text("issued_at"),
  sourceUrl: text("source_url"),
});

export const historicalMetricSnapshots = sqliteTable("historical_metric_snapshots", {
  id: text("id").primaryKey(),
  metricId: text("metric_id").notNull(),
  periodStart: text("period_start"),
  periodEnd: text("period_end"),
  value: real("value").notNull(),
  unit: text("unit").notNull(),
  createdAt: text("created_at").notNull(),
});

export const treasuryTransactions = sqliteTable("treasury_transactions", {
  id: text("id").primaryKey(),
  walletId: text("wallet_id").notNull(),
  txHash: text("tx_hash"),
  chain: text("chain").notNull(),
  blockNumber: integer("block_number"),
  fromAddr: text("from_addr"),
  toAddr: text("to_addr"),
  asset: text("asset").notNull(),
  amount: real("amount").notNull(),
  valueUsd: real("value_usd"),
  occurredAt: text("occurred_at").notNull(),
  category: text("category"),
  interpretationLabel: text("interpretation_label"),
  source: text("source").notNull().default("foundation"),
});

export const reportTemplates = sqliteTable("report_templates", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
});