import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { measurements, auditLog, metrics } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err, pickFields, readBody } from "@lib/api";
import { id, nowIso } from "@lib/utils";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "measurements.create");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  let data: any = {};
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) data = await request.json();
  else { const fd = await request.formData(); fd.forEach((v, k) => { data[k] = String(v); }); }
  if (!data.metricId || data.value == null) return err("metricId and value required", 400);
  const db = getDb(env);
  const mid = id("meas_");
  await db.insert(measurements).values({
    id: mid,
    metricId: data.metricId,
    projectId: data.projectId ?? null,
    value: Number(data.value),
    observedAt: data.observedAt ?? nowIso(),
    source: data.source ?? "manual",
    methodology: data.methodology ?? null,
    verificationStatus: data.verificationStatus ?? "reported",
  });
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "create_measurement", entityType: "measurement", entityId: mid, after: JSON.stringify({ metricId: data.metricId, value: data.value }), timestamp: nowIso() });
  return ok({ id: mid });
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "measurements.update");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const data = await readBody(request);
  if (!data.id) return err("id required", 400);
  const db = getDb(env);
  const update = pickFields<typeof measurements.$inferInsert>(data, [
    { name: "metricId", type: "text" },
    { name: "projectId", type: "text" },
    { name: "value", type: "number" },
    { name: "observedAt", type: "text" },
    { name: "source", type: "text" },
    { name: "methodology", type: "text" },
    { name: "verificationStatus", type: "text" },
    { name: "evidenceId", type: "text" },
  ]);
  if (!Object.keys(update).length) return err("no fields to update", 400);
  await db.update(measurements).set(update).where(eq(measurements.id, data.id));
  await db.insert(auditLog).values({
    id: id("aud_"), actor: actorOf(locals), action: "update_measurements",
    entityType: "measurements", entityId: data.id, after: JSON.stringify(update), timestamp: nowIso(),
  });
  return ok({ id: data.id });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const denied = denyUnless(locals, "measurements.delete");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(measurements).where(eq(measurements.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "delete_measurement", entityType: "measurement", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
