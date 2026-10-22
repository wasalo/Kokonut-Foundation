import {
  projects, metrics, farms, measurements, milestones, evidence, attestations,
  partners, teamMembers, reports, resources, fundingEvents, contentBlocks,
  inquiries, redirects, naturalAssets, activities, claims, methodologies, sources,
} from "@lib/schema";
import type { Entity } from "@lib/permissions";

export interface AdminField {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "date";
  options?: { value: string; label: string }[];
  required?: boolean;
  /** Help text shown under the input. */
  help?: string;
}

export interface AdminEntity {
  /** Route segment and API key: /admin/<key>, /api/admin/<key>. */
  key: string;
  /** Singular label used in headings and audit entries. */
  label: string;
  plural: string;
  /** Drizzle table backing the entity. */
  table: any;
  /** Value written to `audit_log.entity_type`. */
  entityType: string;
  /** Whether the record carries a publishing `status`. */
  hasStatus: boolean;
  /** The permission entity this record belongs to. */
  permissionEntity: Entity;
  /** How a row is labelled in the admin list. */
  rowLabel: (row: any) => string;
  /** Editable fields, used by the generic editor and the generic endpoint. */
  fields?: AdminField[];
  /** Id prefix used when the generic endpoint creates a record. */
  idPrefix?: string;
  /** Whether the record has a unique slug derived from a name. */
  hasSlug?: boolean;
  /** Whether the body is a JSON document rather than plain text. */
  bodyIsJson?: boolean;
}

const STATUS_OPTIONS = [
  { value: "draft", label: "draft" },
  { value: "submitted", label: "submitted" },
  { value: "verified", label: "verified" },
  { value: "published", label: "published" },
  { value: "rejected", label: "rejected" },
  { value: "archived", label: "archived" },
];

const VERIFICATION_OPTIONS = [
  { value: "reported", label: "reported" },
  { value: "reviewed", label: "reviewed" },
  { value: "verified", label: "verified" },
  { value: "attested", label: "attested" },
];

export const ADMIN_ENTITIES: AdminEntity[] = [
  {
    key: "projects", label: "Project", plural: "Projects", table: projects,
    entityType: "project", hasStatus: true, permissionEntity: "projects",
    rowLabel: (r) => `${r.name} — ${r.status}`,
  },
  {
    key: "farms", label: "Farm", plural: "Farms", table: farms,
    entityType: "farm", hasStatus: true, permissionEntity: "farms",
    rowLabel: (r) => `${r.name} — ${r.status}`,
  },
  {
    key: "metrics", label: "Metric", plural: "Metrics", table: metrics,
    entityType: "metric", hasStatus: true, permissionEntity: "metrics",
    rowLabel: (r) => `${r.name}: ${r.value} ${r.unit} — ${r.status}`,
  },
  {
    key: "measurements", label: "Measurement", plural: "Measurements", table: measurements,
    entityType: "measurement", hasStatus: false, permissionEntity: "measurements",
    rowLabel: (r) => `${r.metricId}: ${r.value} (${r.observedAt})`,
  },
  {
    key: "milestones", label: "Milestone", plural: "Milestones", table: milestones,
    entityType: "milestone", hasStatus: true, permissionEntity: "milestones",
    rowLabel: (r) => `${r.title} — ${r.status}`,
  },
  {
    key: "evidence", label: "Evidence", plural: "Evidence", table: evidence,
    entityType: "evidence", hasStatus: true, permissionEntity: "evidence",
    rowLabel: (r) => `${r.title} — ${r.status}`,
  },
  {
    key: "attestations", label: "Attestation", plural: "Attestations", table: attestations,
    entityType: "attestation", hasStatus: false, permissionEntity: "attestations",
    rowLabel: (r) => `${r.title} — ${r.verificationStatus}`,
  },
  {
    key: "partners", label: "Partner", plural: "Partners", table: partners,
    entityType: "partner", hasStatus: false, permissionEntity: "partners",
    rowLabel: (r) => `${r.name} — ${r.type} (${r.country})`,
  },
  {
    key: "team", label: "Team Member", plural: "Team", table: teamMembers,
    entityType: "team_member", hasStatus: false, permissionEntity: "team",
    rowLabel: (r) => `${r.name} — ${r.role}`,
  },
  {
    key: "reports", label: "Report", plural: "Reports", table: reports,
    entityType: "report", hasStatus: true, permissionEntity: "reports",
    rowLabel: (r) => `${r.title} — ${r.status}`,
  },
  {
    key: "resources", label: "Resource", plural: "Resources", table: resources,
    entityType: "resource", hasStatus: true, permissionEntity: "resources",
    rowLabel: (r) => `${r.title} — ${r.resourceType}`,
  },
  {
    key: "funding", label: "Funding Event", plural: "Funding", table: fundingEvents,
    entityType: "funding_event", hasStatus: false, permissionEntity: "funding",
    rowLabel: (r) => `${r.title} — ${r.amount ?? "?"} ${r.currency ?? ""}`.trim(),
  },
  {
    key: "inquiries", label: "Inquiry", plural: "Inquiries", table: inquiries,
    entityType: "inquiry", hasStatus: true, permissionEntity: "inquiries",
    rowLabel: (r) => `${r.name} (${r.email}) — ${r.status}`,
  },
  {
    key: "redirects", label: "Redirect", plural: "Redirects", table: redirects,
    entityType: "redirect", hasStatus: false, permissionEntity: "redirects",
    rowLabel: (r) => `${r.fromPath} → ${r.toPath} (${r.statusCode})`,
  },

  // --- Registry-driven reference data -------------------------------------
  // These share one generic endpoint and one shared editor, so their field
  // definitions live here rather than in a bespoke route.

  {
    key: "content", label: "Content Block", plural: "Content Blocks", table: contentBlocks,
    entityType: "content_block", hasStatus: false, permissionEntity: "content",
    rowLabel: (r) => `${r.title ?? r.key} (${r.key})`,
    idPrefix: "blk_",
    bodyIsJson: true,
    fields: [
      { name: "key", label: "Key", required: true, help: "Addressable identifier, e.g. baseline:adelphi. Unique." },
      { name: "title", label: "Title" },
      { name: "body", label: "Body", type: "textarea", required: true, help: "Plain text or a JSON document." },
    ],
  },
  {
    key: "natural-assets", label: "Natural Asset", plural: "Natural Assets", table: naturalAssets,
    entityType: "natural_asset", hasStatus: false, permissionEntity: "natural_assets",
    rowLabel: (r) => `${r.name} — ${r.assetType}`,
    idPrefix: "na_",
    hasSlug: true,
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "Slug", help: "Derived from the name when left empty. Unique." },
      { name: "assetType", label: "Asset type", required: true, help: "e.g. tree, soil, water, seed bank" },
      { name: "projectId", label: "Project ID" },
      { name: "farmId", label: "Farm ID" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  {
    key: "activities", label: "Activity", plural: "Activities", table: activities,
    entityType: "activity", hasStatus: false, permissionEntity: "activities",
    rowLabel: (r) => `${r.name}`,
    idPrefix: "act_",
    hasSlug: true,
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "Slug", help: "Derived from the name when left empty. Unique." },
      { name: "naturalAssetId", label: "Natural asset ID" },
      { name: "projectId", label: "Project ID" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "occurredAt", label: "Occurred at", type: "date" },
    ],
  },
  {
    key: "claims", label: "Claim", plural: "Claims", table: claims,
    entityType: "claim", hasStatus: false, permissionEntity: "claims",
    rowLabel: (r) => `${r.title} — ${r.status}`,
    idPrefix: "clm_",
    hasSlug: true,
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug", help: "Derived from the title when left empty. Unique." },
      { name: "description", label: "Description", type: "textarea" },
      { name: "projectId", label: "Project ID" },
      { name: "metricId", label: "Metric ID" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
    ],
  },
  {
    key: "methodologies", label: "Methodology", plural: "Methodologies", table: methodologies,
    entityType: "methodology", hasStatus: false, permissionEntity: "methodologies",
    rowLabel: (r) => `${r.name}${r.version ? ` v${r.version}` : ""}`,
    idPrefix: "meth_",
    hasSlug: true,
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "Slug", help: "Derived from the name when left empty. Unique." },
      { name: "version", label: "Version" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "documentKey", label: "Document key", help: "R2 object key of the published document." },
    ],
  },
  {
    key: "sources", label: "Source", plural: "Sources", table: sources,
    entityType: "source", hasStatus: false, permissionEntity: "sources",
    rowLabel: (r) => `${r.name} — ${r.sourceType}`,
    idPrefix: "src_",
    hasSlug: true,
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "Slug", help: "Derived from the name when left empty. Unique." },
      { name: "sourceType", label: "Source type", required: true, help: "e.g. field, remote_sensing, community, review" },
      { name: "url", label: "URL" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
];

export function findEntity(key: string): AdminEntity | undefined {
  return ADMIN_ENTITIES.find((e) => e.key === key);
}

/** Statuses that require the publish capability; the rest need only update. */
export const PUBLISH_STATES = ["published", "verified"];

/**
 * The capability a status transition requires, for the entity being changed.
 * Returns null when the entity is unknown or has no status column.
 */
export function statusCapability(entityType: string, status: string): string | null {
  const entity = ADMIN_ENTITIES.find((e) => e.entityType === entityType);
  if (!entity || !entity.hasStatus) return null;
  return PUBLISH_STATES.includes(status)
    ? `${entity.permissionEntity}.publish`
    : `${entity.permissionEntity}.update`;
}

/**
 * Entities that have their own bespoke API route. The generic route refuses
 * these so there is exactly one way to change a record.
 */
export const BESPOKE_ENTITY_KEYS = new Set([
  "projects", "farms", "metrics", "measurements", "milestones", "evidence",
  "attestations", "partners", "team", "reports", "resources", "funding",
  "inquiries", "redirects",
]);

/** Entities the generic admin route can serve. */
export function genericEntity(key: string): AdminEntity | undefined {
  if (BESPOKE_ENTITY_KEYS.has(key)) return undefined;
  const entity = findEntity(key);
  if (!entity || !entity.fields?.length) return undefined;
  return entity;
}
