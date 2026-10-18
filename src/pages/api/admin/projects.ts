import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { projects, auditLog } from "@lib/schema";
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
  if (!data.name) return err("name required", 400);
  const db = getDb(env);
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  const pid = id("proj_");
  await db.insert(projects).values({
    id: pid,
    slug,
    name: data.name,
    summary: data.summary ?? "",
    description: data.description ?? "",
    status: data.status ?? "planned",
    projectType: data.projectType ?? "Project",
    country: data.country ?? "",
    region: data.region ?? null,
    impactAreas: JSON.stringify(data.impactAreas ?? []),
    sdgs: JSON.stringify(data.sdgs ?? []),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "create_project", entityType: "project", entityId: pid, after: JSON.stringify({ name: data.name, slug }), timestamp: nowIso() });
  return ok({ id: pid, slug });
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  let data: any = {};
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) data = await request.json();
  else { const fd = await request.formData(); fd.forEach((v, k) => { data[k] = String(v); }); }
  if (!data.id) return err("id required", 400);
  const db = getDb(env);
  await db.update(projects).set({
    name: data.name,
    summary: data.summary,
    description: data.description,
    status: data.status,
    projectType: data.projectType,
    country: data.country,
    region: data.region,
    updatedAt: nowIso(),
  }).where(eq(projects.id, data.id));
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "update_project", entityType: "project", entityId: data.id, after: JSON.stringify(data), timestamp: nowIso() });
  return ok({ id: data.id });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(projects).where(eq(projects.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "delete_project", entityType: "project", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
