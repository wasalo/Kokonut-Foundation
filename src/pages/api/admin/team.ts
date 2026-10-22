import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { teamMembers, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err, pickFields, readBody } from "@lib/api";
import { id, nowIso } from "@lib/utils";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "team.create");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  let data: any = {};
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) data = await request.json();
  else { const fd = await request.formData(); fd.forEach((v, k) => { data[k] = String(v); }); }
  if (!data.name || !data.role) return err("name and role required", 400);
  const db = getDb(env);
  const tid = id("tm_");
  await db.insert(teamMembers).values({
    id: tid,
    name: data.name,
    role: data.role,
    bio: data.bio ?? null,
    email: data.email ?? null,
    linkedin: data.linkedin ?? null,
    order: Number(data.order ?? 0),
  });
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "create_team_member", entityType: "team_member", entityId: tid, after: JSON.stringify({ name: data.name, role: data.role }), timestamp: nowIso() });
  return ok({ id: tid });
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "team.update");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const data = await readBody(request);
  if (!data.id) return err("id required", 400);
  const db = getDb(env);
  const update = pickFields<typeof teamMembers.$inferInsert>(data, [
    { name: "name", type: "text" },
    { name: "role", type: "text" },
    { name: "bio", type: "text" },
    { name: "photo", type: "text" },
    { name: "email", type: "text" },
    { name: "linkedin", type: "text" },
    { name: "order", type: "number" },
  ]);
  if (!Object.keys(update).length) return err("no fields to update", 400);
  await db.update(teamMembers).set(update).where(eq(teamMembers.id, data.id));
  await db.insert(auditLog).values({
    id: id("aud_"), actor: actorOf(locals), action: "update_team_members",
    entityType: "team_members", entityId: data.id, after: JSON.stringify(update), timestamp: nowIso(),
  });
  return ok({ id: data.id });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const denied = denyUnless(locals, "team.delete");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(teamMembers).where(eq(teamMembers.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "delete_team_member", entityType: "team_member", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
