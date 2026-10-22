import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { resources, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err, pickFields, readBody } from "@lib/api";
import { id, nowIso, slugify } from "@lib/utils";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "resources.create");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  let data: any = {};
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) data = await request.json();
  else { const fd = await request.formData(); fd.forEach((v, k) => { data[k] = String(v); }); }
  if (!data.title) return err("title required", 400);
  const db = getDb(env);
  const slug = data.slug ? slugify(data.slug) : slugify(data.title);
  const rid = id("res_");
  await db.insert(resources).values({
    id: rid,
    slug,
    title: data.title,
    summary: data.summary ?? null,
    resourceType: data.resourceType ?? "Resource",
    projectId: data.projectId ?? null,
    topic: data.topic ?? null,
    year: data.year ? Number(data.year) : null,
    publishedAt: data.publishedAt ?? nowIso(),
    visibility: data.visibility ?? "public",
  });
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "create_resource", entityType: "resource", entityId: rid, after: JSON.stringify({ title: data.title, slug }), timestamp: nowIso() });
  return ok({ id: rid, slug });
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "resources.update");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const data = await readBody(request);
  if (!data.id) return err("id required", 400);
  const db = getDb(env);
  const update = pickFields<typeof resources.$inferInsert>(data, [
    { name: "slug", type: "text" },
    { name: "title", type: "text" },
    { name: "summary", type: "text" },
    { name: "resourceType", type: "text" },
    { name: "projectId", type: "text" },
    { name: "topic", type: "text" },
    { name: "year", type: "number" },
    { name: "sdgs", type: "json" },
    { name: "impactAreas", type: "json" },
    { name: "documentKey", type: "text" },
    { name: "externalUrl", type: "text" },
    { name: "publishedAt", type: "text" },
    { name: "visibility", type: "text" },
    { name: "status", type: "text" },
  ]);
  if (!Object.keys(update).length) return err("no fields to update", 400);
  await db.update(resources).set(update).where(eq(resources.id, data.id));
  await db.insert(auditLog).values({
    id: id("aud_"), actor: actorOf(locals), action: "update_resources",
    entityType: "resources", entityId: data.id, after: JSON.stringify(update), timestamp: nowIso(),
  });
  return ok({ id: data.id });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const denied = denyUnless(locals, "resources.delete");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(resources).where(eq(resources.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "delete_resource", entityType: "resource", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
