import {
  projects, metrics, farms, measurements, milestones, evidence, attestations,
  partners, teamMembers, reports, resources, fundingEvents, contentBlocks,
  inquiries, redirects, naturalAssets, activities, claims, methodologies, sources,
} from "@lib/schema";
import type { Entity } from "@lib/permissions";

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
}

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
    key: "content", label: "Content Block", plural: "Content Blocks", table: contentBlocks,
    entityType: "content_block", hasStatus: false, permissionEntity: "content",
    rowLabel: (r) => `${r.title ?? r.key}`,
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
  {
    key: "natural-assets", label: "Natural Asset", plural: "Natural Assets", table: naturalAssets,
    entityType: "natural_asset", hasStatus: false, permissionEntity: "projects",
    rowLabel: (r) => `${r.name} — ${r.assetType}`,
  },
  {
    key: "activities", label: "Activity", plural: "Activities", table: activities,
    entityType: "activity", hasStatus: false, permissionEntity: "projects",
    rowLabel: (r) => `${r.name}`,
  },
  {
    key: "claims", label: "Claim", plural: "Claims", table: claims,
    entityType: "claim", hasStatus: false, permissionEntity: "metrics",
    rowLabel: (r) => `${r.title} — ${r.status}`,
  },
  {
    key: "methodologies", label: "Methodology", plural: "Methodologies", table: methodologies,
    entityType: "methodology", hasStatus: false, permissionEntity: "metrics",
    rowLabel: (r) => `${r.name}${r.version ? ` v${r.version}` : ""}`,
  },
  {
    key: "sources", label: "Source", plural: "Sources", table: sources,
    entityType: "source", hasStatus: false, permissionEntity: "metrics",
    rowLabel: (r) => `${r.name} — ${r.sourceType}`,
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
