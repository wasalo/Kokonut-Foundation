import { verifyAccessJwt } from "@lib/access";
import { getDb } from "@lib/db";
import { adminRoles, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { id, nowIso } from "@lib/utils";
import { DEFAULT_ROLE, ROLE_CAPABILITIES, normalizeRole, type Capability, type Role } from "@lib/permissions";

export interface AdminActor {
  email: string;
  role: Role;
  capabilities: Capability[];
  /** True when the role was assigned during first-run bootstrap. */
  bootstrapped: boolean;
}

/**
 * Resolves who is making an admin request and what they may do.
 *
 * Authentication is Cloudflare Access (PRD §33). The role lives in D1
 * (`admin_roles`) and maps the verified identity to a Foundation role
 * (PRD §34).
 *
 * First-run bootstrap: while `admin_roles` is empty, the first authenticated
 * Access identity is granted `administrator` and the assignment is written
 * down. After that every role is explicit — an unassigned identity is
 * read-only, so adding a colleague to Access never silently grants them write
 * access.
 */
export async function resolveAdminActor(request: Request, env: any): Promise<AdminActor | null> {
  const token = request.headers.get("cf-access-jwt-assertion");
  const teamDomain = env?.ACCESS_TEAM_DOMAIN;
  const audience = env?.ACCESS_AUD;

  let email: string;

  if (token) {
    // A presented token is always verified. If Access is not configured, or the
    // token does not check out, the request is refused — it never falls back to
    // the development bypass.
    if (!teamDomain || !audience) return null;
    const result = await verifyAccessJwt(token, { teamDomain, audience });
    if (!result.valid) return null;
    email = typeof result.claims?.email === "string" ? result.claims.email : "";
    if (!email) return null;
  } else {
    // Unconfigured Access: only the explicit local development bypass is
    // allowed. This must not be keyed off the environment name — a staging
    // environment that is merely "not production" would otherwise hand full
    // administrator rights to anyone who asked.
    if (env?.ADMIN_DEV_BYPASS !== "true") return null;
    email = env?.ADMIN_DEV_EMAIL || "dev@kokonut.foundation";
  }

  const { role, bootstrapped } = await resolveRole(email, env);
  return {
    email,
    role,
    capabilities: ROLE_CAPABILITIES[role] ?? [],
    bootstrapped,
  };
}

async function resolveRole(
  email: string,
  env: any,
): Promise<{ role: Role; bootstrapped: boolean }> {
  if (!env?.DB) {
    // No database configured (local preview): behave as a full administrator so
    // the admin UI is usable during development.
    return { role: "administrator", bootstrapped: false };
  }
  try {
    return await resolveRoleForEmail(email, getDb(env));
  } catch {
    return { role: DEFAULT_ROLE, bootstrapped: false };
  }
}

/**
 * Resolves a role for an identity against the `admin_roles` table.
 *
 * First-run bootstrap: while the table is empty, the first identity to ask is
 * granted `administrator` and the assignment is written down. After that every
 * role is explicit — an unassigned identity falls back to the read-only
 * default, so adding a colleague to Cloudflare Access never silently grants
 * them write access.
 */
export async function resolveRoleForEmail(
  email: string,
  db: any,
): Promise<{ role: Role; bootstrapped: boolean }> {
  const rows = await db.select().from(adminRoles).where(eq(adminRoles.email, email)).all();
  const active = rows.find((r: any) => r.active === 1) ?? rows[0];
  if (active) {
    return { role: normalizeRole(active.role), bootstrapped: false };
  }

  const all = await db.select().from(adminRoles).all();
  if (all.length === 0) {
    await db.insert(adminRoles).values({
      id: id("role_"),
      email,
      role: "administrator",
      grantedBy: "bootstrap",
      grantedAt: nowIso(),
      active: 1,
    });
    await db.insert(auditLog).values({
      id: id("aud_"),
      actor: email,
      action: "bootstrap_role",
      entityType: "admin_role",
      entityId: email,
      after: JSON.stringify({ role: "administrator", reason: "first authenticated Access identity" }),
      timestamp: nowIso(),
    });
    return { role: "administrator", bootstrapped: true };
  }

  return { role: DEFAULT_ROLE, bootstrapped: false };
}

/** The identity to record in the audit log. */
export function actorOf(locals: any): string {
  const email = locals?.admin?.email;
  return typeof email === "string" && email ? email : "admin";
}
