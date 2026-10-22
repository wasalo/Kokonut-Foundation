import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { adminRoles, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";
import { id, nowIso } from "@lib/utils";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";
import { ROLES, isRole } from "@lib/permissions";

export const GET: APIRoute = async ({ locals }) => {
  const denied = denyUnless(locals, "access.roles");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const db = getDb(env);
  const list = await db.select().from(adminRoles).all();
  return ok({ roles: list });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "access.roles");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);

  let data: any = {};
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) data = await request.json();
  else { const fd = await request.formData(); fd.forEach((v, k) => { data[k] = String(v); }); }

  const email = String(data.email ?? "").trim().toLowerCase();
  const role = String(data.role ?? "").trim();
  if (!email) return err("email required", 400);
  if (!isRole(role)) return err(`role must be one of ${ROLES.join(", ")}`, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err("invalid email", 400);

  const db = getDb(env);
  const existing = await db.select().from(adminRoles).where(eq(adminRoles.email, email)).all();
  const actor = actorOf(locals);

  if (existing.length) {
    const before = existing[0].role;
    await db
      .update(adminRoles)
      .set({ role, grantedBy: actor, grantedAt: nowIso(), active: 1 })
      .where(eq(adminRoles.email, email));
    await db.insert(auditLog).values({
      id: id("aud_"), actor, action: "update_role", entityType: "admin_role", entityId: email,
      before: JSON.stringify({ role: before }), after: JSON.stringify({ role }), timestamp: nowIso(),
    });
    return ok({ email, role });
  }

  await db.insert(adminRoles).values({
    id: id("role_"), email, role, grantedBy: actor, grantedAt: nowIso(), active: 1,
  });
  await db.insert(auditLog).values({
    id: id("aud_"), actor, action: "grant_role", entityType: "admin_role", entityId: email,
    after: JSON.stringify({ role }), timestamp: nowIso(),
  });
  return ok({ email, role });
};

export const DELETE: APIRoute = async ({ locals, url }) => {
  const denied = denyUnless(locals, "access.roles");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const email = (url.searchParams.get("email") ?? "").trim().toLowerCase();
  if (!email) return err("email required", 400);

  const db = getDb(env);
  const existing = await db.select().from(adminRoles).where(eq(adminRoles.email, email)).all();
  if (!existing.length) return err("assignment not found", 404);

  const actor = actorOf(locals);
  if (existing[0].email === actor && existing[0].role === "administrator") {
    return err("You cannot revoke your own administrator role", 400);
  }

  await db.delete(adminRoles).where(eq(adminRoles.email, email));
  await db.insert(auditLog).values({
    id: id("aud_"), actor, action: "revoke_role", entityType: "admin_role", entityId: email,
    before: JSON.stringify({ role: existing[0].role }), timestamp: nowIso(),
  });
  return ok({ revoked: email });
};
