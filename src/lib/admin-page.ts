import { can, type Capability } from "@lib/permissions";

/**
 * Page-level guard for the admin UI.
 *
 * The middleware has already verified the Cloudflare Access identity; this
 * applies the role's capability to the page itself, so a role that cannot read
 * an entity never sees the admin screen for it.
 */
export function adminPageGuard(astro: any, capability: Capability): Response | null {
  const role = astro?.locals?.admin?.role;
  if (can(role, capability)) return null;
  const actor = astro?.locals?.admin?.email ?? "unknown";
  return new Response(
    `Forbidden: role '${role ?? "none"}' cannot ${capability}`,
    { status: 403, headers: { "Content-Type": "text/plain" } },
  );
}

/** The read capability an admin list screen needs, derived from its path. */
export function capabilityForAdminPath(pathname: string): Capability {
  const segment = pathname.replace(/^\/admin\/?/, "").split("/")[0];
  const map: Record<string, Capability> = {
    analytics: "access.analytics",
    audit: "access.audit",
    sync: "access.sync",
    roles: "access.roles",
    projects: "projects.read",
    farms: "farms.read",
    metrics: "metrics.read",
    measurements: "measurements.read",
    milestones: "milestones.read",
    evidence: "evidence.read",
    partners: "partners.read",
    team: "team.read",
    reports: "reports.read",
    resources: "resources.read",
    inquiries: "inquiries.read",
    media: "media.read",
    redirects: "redirects.read",
  };
  return map[segment] ?? "access.admin";
}
