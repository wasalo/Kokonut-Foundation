import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { milestones, auditLog } from "@lib/schema";
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
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "create_milestone", entityType: "milestone", entityId: mid, after: JSON.stringify({ title: data.title }), timestamp: nowIso() });
  return ok({ id: mid });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(milestones).where(eq(milestones.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "delete_milestone", entityType: "milestone", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
