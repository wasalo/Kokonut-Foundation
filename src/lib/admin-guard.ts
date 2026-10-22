import { actorOf } from "@lib/admin-actor";
import { can, capabilityFor, ROUTE_ENTITIES, type Capability, type Entity } from "@lib/permissions";

/**
 * Request-level guards for the admin API.
 *
 * The middleware has already established who the caller is (Cloudflare Access)
 * and what role they hold. These helpers turn that into a per-endpoint
 * capability check, so a role cannot read an entity it is not allowed to touch.
 */

/** The capability required for a request to an admin route. */
export function requiredCapability(route: string, method: string): Capability {
  const key = route.replace(/^\/api\/admin\//, "").split("/")[0];
  const entity: Entity = (ROUTE_ENTITIES as Record<string, Entity>)[key] ?? "projects";
  return capabilityFor(entity, method);
}

/**
 * Returns a 403 response when the caller lacks the capability, otherwise null.
 */
export function denyUnless(locals: any, capability: Capability): Response | null {
  const role = locals?.admin?.role;
  if (can(role, capability)) return null;
  const actor = actorOf(locals);
  return new Response(
    JSON.stringify({ error: "Forbidden", detail: `Role '${role ?? "none"}' cannot ${capability}` }),
    { status: 403, headers: { "Content-Type": "application/json" } },
  );
}

/** Convenience wrapper for route-based checks. */
export function denyUnlessRoute(locals: any, route: string, method: string): Response | null {
  return denyUnless(locals, requiredCapability(route, method));
}
