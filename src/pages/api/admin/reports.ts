import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { reports, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err, pickFields, readBody } from "@lib/api";
import { id, nowIso } from "@lib/utils";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";

export const PUT: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "reports.update");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const data = await readBody(request);
  if (!data.id) return err("id required", 400);
  const db = getDb(env);
  const update = pickFields<typeof reports.$inferInsert>(data, [
    { name: "slug", type: "text" },
    { name: "title", type: "text" },
    { name: "summary", type: "text" },
    { name: "reportType", type: "text" },
    { name: "projectId", type: "text" },
    { name: "periodStart", type: "text" },
    { name: "periodEnd", type: "text" },
    { name: "publishedAt", type: "text" },
    { name: "documentKey", type: "text" },
    { name: "authors", type: "json" },
    { name: "visibility", type: "text" },
    { name: "status", type: "text" },
  ]);
  if (!Object.keys(update).length) return err("no fields to update", 400);
  await db.update(reports).set(update).where(eq(reports.id, data.id));
  await db.insert(auditLog).values({
    id: id("aud_"), actor: actorOf(locals), action: "update_reports",
    entityType: "reports", entityId: data.id, after: JSON.stringify(update), timestamp: nowIso(),
  });
  return ok({ id: data.id });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const denied = denyUnless(locals, "reports.delete");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(reports).where(eq(reports.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "delete_report", entityType: "report", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
