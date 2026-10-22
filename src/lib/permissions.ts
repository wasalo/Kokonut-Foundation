/**
 * Admin role model.
 *
 * Authentication is Cloudflare Access (PRD §33) — the verified Access identity
 * is who a request is. This module answers the separate question the PRD §34
 * leaves open: what that person is allowed to do.
 *
 * A role grants a set of capabilities, written as `entity.action`:
 *
 *   entity   the thing being worked on (projects, farms, metrics, …)
 *   action   read | create | update | delete | publish
 *
 * Two capabilities sit outside the entity grid:
 *
 *   access.admin     reach the admin application at all
 *   access.roles     manage role assignments
 *   access.audit     read the audit log
 *   access.analytics read product analytics
 *   access.sync      run the KI sync job
 */

export const ROLES = [
  "administrator",
  "manager",
  "supervisor",
  "field_worker",
  "finance",
  "analyst",
] as const;

export type Role = (typeof ROLES)[number];

export const ACTIONS = ["read", "create", "update", "delete", "publish"] as const;
export type Action = (typeof ACTIONS)[number];

/** Entities managed through the admin application (PRD §34). */
export const ENTITIES = [
  "projects",
  "farms",
  "metrics",
  "measurements",
  "milestones",
  "evidence",
  "partners",
  "team",
  "reports",
  "resources",
  "inquiries",
  "media",
  "redirects",
  "attestations",
  "funding",
  "content",
] as const;

export type Entity = (typeof ENTITIES)[number];

export type Capability = `${Entity}.${Action}` | "access.admin" | "access.roles" | "access.audit" | "access.analytics" | "access.sync";

export const ROLE_LABELS: Record<Role, string> = {
  administrator: "Administrator",
  manager: "Manager",
  supervisor: "Supervisor",
  field_worker: "Field Worker",
  finance: "Finance",
  analyst: "Analyst",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  administrator: "Full control over every entity, role assignment and the audit trail.",
  manager: "Runs the Foundation's content: projects, farms, partners, reports and the team.",
  supervisor: "Oversees field work: farms, measurements, milestones and evidence.",
  field_worker: "Records field activity: measurements, evidence and farm notes.",
  finance: "Funding, treasury and financial reporting; read-only elsewhere.",
  analyst: "Read-only across the Foundation's data, metrics and analytics.",
};

const READ_ONLY_ENTITIES: Entity[] = [
  "projects", "farms", "metrics", "measurements", "milestones", "evidence",
  "partners", "team", "reports", "resources", "inquiries", "media", "redirects",
  "attestations", "funding", "content",
];

function cap(entity: Entity, action: Action): Capability {
  return `${entity}.${action}`;
}

function readOnly(): Capability[] {
  return READ_ONLY_ENTITIES.flatMap((e) => [cap(e, "read")]);
}

function writeSet(entities: Entity[], actions: Action[] = ["read", "create", "update", "publish"]): Capability[] {
  return entities.flatMap((e) => actions.map((a) => cap(e, a)));
}

/**
 * The capability matrix. Every role is an explicit allow-list — there is no
 * implicit inheritance, so granting a role never silently widens access.
 */
export const ROLE_CAPABILITIES: Record<Role, Capability[]> = {
  administrator: [
    ...ENTITIES.flatMap((e) => ACTIONS.map((a) => cap(e, a))),
    "access.admin", "access.roles", "access.audit", "access.analytics", "access.sync",
  ],

  manager: [
    ...writeSet(["projects", "farms", "milestones", "partners", "team", "reports", "resources", "inquiries", "content"]),
    ...writeSet(["metrics", "measurements", "evidence"], ["read", "create", "update", "publish"]),
    cap("media", "read"), cap("media", "create"), cap("media", "update"),
    cap("redirects", "read"), cap("redirects", "create"), cap("redirects", "update"),
    cap("attestations", "read"), cap("attestations", "create"), cap("attestations", "update"),
    cap("funding", "read"),
    "access.admin", "access.audit", "access.analytics",
  ],

  supervisor: [
    ...writeSet(["farms", "milestones"]),
    ...writeSet(["measurements", "evidence"], ["read", "create", "update", "publish"]),
    cap("projects", "read"), cap("projects", "update"),
    cap("metrics", "read"), cap("metrics", "update"),
    cap("team", "read"), cap("reports", "read"), cap("resources", "read"),
    cap("inquiries", "read"), cap("media", "read"), cap("redirects", "read"),
    cap("attestations", "read"), cap("funding", "read"), cap("content", "read"),
    "access.admin", "access.audit",
  ],

  field_worker: [
    ...writeSet(["measurements", "evidence"], ["read", "create", "update"]),
    cap("farms", "read"), cap("farms", "update"),
    cap("projects", "read"), cap("milestones", "read"), cap("milestones", "update"),
    cap("metrics", "read"), cap("media", "read"), cap("media", "create"),
    "access.admin",
  ],

  finance: [
    cap("funding", "read"), cap("funding", "create"), cap("funding", "update"),
    cap("reports", "read"), cap("reports", "create"), cap("reports", "update"), cap("reports", "publish"),
    cap("projects", "read"), cap("metrics", "read"), cap("partners", "read"),
    cap("attestations", "read"), cap("media", "read"), cap("redirects", "read"),
    "access.admin", "access.audit", "access.analytics",
  ],

  analyst: [...readOnly(), "access.admin", "access.analytics"],
};

const CAPABILITY_SETS: Record<Role, Set<Capability>> = Object.fromEntries(
  (Object.keys(ROLE_CAPABILITIES) as Role[]).map((r) => [r, new Set(ROLE_CAPABILITIES[r])]),
) as Record<Role, Set<Capability>>;

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function normalizeRole(value: unknown): Role {
  return isRole(value) ? value : "analyst";
}

/** True when the role grants the capability. */
export function can(role: Role | null | undefined, capability: Capability): boolean {
  if (!role) return false;
  return CAPABILITY_SETS[role]?.has(capability) ?? false;
}

/** True when the role grants any of the capabilities. */
export function canAny(role: Role | null | undefined, capabilities: Capability[]): boolean {
  return capabilities.some((c) => can(role, c));
}

/**
 * Maps an HTTP method on an admin entity to the capability it requires.
 * `publish` is a status transition and is exposed through the status endpoint.
 */
export function capabilityFor(entity: Entity, method: string): Capability {
  switch (method.toUpperCase()) {
    case "GET": return cap(entity, "read");
    case "POST": return cap(entity, "create");
    case "PUT":
    case "PATCH": return cap(entity, "update");
    case "DELETE": return cap(entity, "delete");
    default: return cap(entity, "read");
  }
}

/** The entity each admin API route manages, used for capability lookups. */
export const ROUTE_ENTITIES: Record<string, Entity> = {
  projects: "projects",
  farms: "farms",
  metrics: "metrics",
  measurements: "measurements",
  milestones: "milestones",
  evidence: "evidence",
  partners: "partners",
  team: "team",
  reports: "reports",
  resources: "resources",
  inquiries: "inquiries",
  media: "media",
  redirects: "redirects",
  attestations: "attestations",
  funding: "funding",
  content: "content",
  status: "content",
  analytics: "projects",
  audit: "projects",
  roles: "team",
  sync: "projects",
};

/**
 * The role an authenticated user gets when they have no explicit assignment.
 * Read-only by default: a new Access identity can look, but not change.
 */
export const DEFAULT_ROLE: Role = "analyst";
