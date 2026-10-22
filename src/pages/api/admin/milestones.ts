import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { milestones, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err, pickFields, readBody } from "@lib/api";
import { id, nowIso } from "@lib/utils";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "milestones.create");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  let data: any = {};
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) data = await request.json();
  else { const fd = await request.formData(); fd.forEach((v, k) => { data[k] = String(v); }); }
  if (!data.title || !data.projectId) return err("title and projectId required", 400);
  const db = getDb(env);
  const mid = id("ms_");
  await db.insert(milestones).values({
    id: mid,
    projectId: data.projectId,
    title: data.title,
    description: data.description ?? null,
    status: data.status ?? "planned",
    dueDate: data.dueDate ?? null,
  });
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "create_milestone", entityType: "milestone", entityId: mid, after: JSON.stringify({ title: data.title }), timestamp: nowIso() });
  return ok({ id: mid });
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "milestones.update");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const data = await readBody(request);
  if (!data.id) return err("id required", 400);
  const db = getDb(env);
  const update = pickFields<typeof milestones.$inferInsert>(data, [
    { name: "projectId", type: "text" },
    { name: "title", type: "text" },
    { name: "description", type: "text" },
    { name: "status", type: "text" },
    { name: "dueDate", type: "text" },
    { name: "completedAt", type: "text" },
  ]);
  if (!Object.keys(update).length) return err("no fields to update", 400);
  await db.update(milestones).set(update).where(eq(milestones.id, data.id));
  await db.insert(auditLog).values({
    id: id("aud_"), actor: actorOf(locals), action: "update_milestones",
    entityType: "milestones", entityId: data.id, after: JSON.stringify(update), timestamp: nowIso(),
  });
  return ok({ id: data.id });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const denied = denyUnless(locals, "milestones.delete");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(milestones).where(eq(milestones.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "delete_milestone", entityType: "milestone", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
