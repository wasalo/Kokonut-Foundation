import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { resources, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";
import { id, nowIso, slugify } from "@lib/utils";

export const POST: APIRoute = async ({ request, locals }) => {
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
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "create_resource", entityType: "resource", entityId: rid, after: JSON.stringify({ title: data.title, slug }), timestamp: nowIso() });
  return ok({ id: rid, slug });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(resources).where(eq(resources.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "delete_resource", entityType: "resource", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
