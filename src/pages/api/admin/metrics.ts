import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { metrics, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";
import { id, nowIso, slugify } from "@lib/utils";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "metrics.create");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  let data: any = {};
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) data = await request.json();
  else { const fd = await request.formData(); fd.forEach((v, k) => { data[k] = String(v); }); }
  if (!data.name) return err("name required", 400);
  const db = getDb(env);
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  const mid = id("met_");
  await db.insert(metrics).values({
    id: mid,
    slug,
    name: data.name,
    description: data.description ?? "",
    category: data.category ?? "General",
    value: Number(data.value ?? 0),
    unit: data.unit ?? "",
    projectId: data.projectId ?? null,
    methodology: data.methodology ?? null,
    source: data.source ?? null,
    verificationStatus: data.verificationStatus ?? "reported",
    updatedAt: nowIso(),
  });
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "create_metric", entityType: "metric", entityId: mid, after: JSON.stringify({ name: data.name, slug }), timestamp: nowIso() });
  return ok({ id: mid, slug });
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "metrics.update");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  let data: any = {};
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) data = await request.json();
  else { const fd = await request.formData(); fd.forEach((v, k) => { data[k] = String(v); }); }
  if (!data.id) return err("id required", 400);
  const db = getDb(env);
  await db.update(metrics).set({
    name: data.name,
    description: data.description,
    category: data.category,
    value: data.value != null ? Number(data.value) : undefined,
    unit: data.unit,
    verificationStatus: data.verificationStatus,
    methodology: data.methodology,
    source: data.source,
    updatedAt: nowIso(),
  }).where(eq(metrics.id, data.id));
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "update_metric", entityType: "metric", entityId: data.id, after: JSON.stringify(data), timestamp: nowIso() });
  return ok({ id: data.id });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const denied = denyUnless(locals, "metrics.delete");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(metrics).where(eq(metrics.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "delete_metric", entityType: "metric", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
