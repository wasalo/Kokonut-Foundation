import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { farms, auditLog } from "@lib/schema";
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
  const fid = id("farm_");
  await db.insert(farms).values({
    id: fid,
    slug,
    name: data.name,
    projectId: data.projectId ?? null,
    country: data.country ?? "",
    region: data.region ?? null,
    latitude: data.latitude != null ? Number(data.latitude) : null,
    longitude: data.longitude != null ? Number(data.longitude) : null,
    areaM2: data.areaM2 != null ? Number(data.areaM2) : null,
    agriculturalAreaM2: data.agriculturalAreaM2 != null ? Number(data.agriculturalAreaM2) : null,
    description: data.description ?? null,
    status: data.status ?? "active",
    founders: data.founders ?? null,
    jobs: data.jobs != null ? Number(data.jobs) : null,
    frameworkPhase: data.frameworkPhase ?? null,
    fundingRef: data.fundingRef ?? null,
    publicGoodsAllocation: data.publicGoodsAllocation != null ? Number(data.publicGoodsAllocation) : null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "create_farm", entityType: "farm", entityId: fid, after: JSON.stringify({ name: data.name, slug }), timestamp: nowIso() });
  return ok({ id: fid, slug });
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
  await db.update(farms).set({
    name: data.name,
    country: data.country,
    region: data.region,
    latitude: data.latitude != null ? Number(data.latitude) : undefined,
    longitude: data.longitude != null ? Number(data.longitude) : undefined,
    areaM2: data.areaM2 != null ? Number(data.areaM2) : undefined,
    description: data.description,
    status: data.status,
    founders: data.founders,
    jobs: data.jobs != null ? Number(data.jobs) : undefined,
    frameworkPhase: data.frameworkPhase,
    fundingRef: data.fundingRef,
    publicGoodsAllocation: data.publicGoodsAllocation != null ? Number(data.publicGoodsAllocation) : undefined,
    updatedAt: nowIso(),
  }).where(eq(farms.id, data.id));
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "update_farm", entityType: "farm", entityId: data.id, after: JSON.stringify(data), timestamp: nowIso() });
  return ok({ id: data.id });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(farms).where(eq(farms.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "delete_farm", entityType: "farm", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
