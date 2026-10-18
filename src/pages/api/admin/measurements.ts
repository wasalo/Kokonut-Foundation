import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { measurements, auditLog, metrics } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";
import { id, nowIso } from "@lib/utils";

export const POST: APIRoute = async ({ request, locals }) => {
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
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "create_measurement", entityType: "measurement", entityId: mid, after: JSON.stringify({ metricId: data.metricId, value: data.value }), timestamp: nowIso() });
  return ok({ id: mid });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(measurements).where(eq(measurements.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "delete_measurement", entityType: "measurement", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
