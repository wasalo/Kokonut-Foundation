import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { evidence, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err, pickFields, readBody } from "@lib/api";
import { id, nowIso } from "@lib/utils";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";

export const PUT: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "evidence.update");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const data = await readBody(request);
  if (!data.id) return err("id required", 400);
  const db = getDb(env);
  const update = pickFields<typeof evidence.$inferInsert>(data, [
    { name: "type", type: "text" },
    { name: "title", type: "text" },
    { name: "description", type: "text" },
    { name: "projectId", type: "text" },
    { name: "metricId", type: "text" },
    { name: "objectKey", type: "text" },
    { name: "externalUrl", type: "text" },
    { name: "capturedAt", type: "text" },
    { name: "hash", type: "text" },
    { name: "visibility", type: "text" },
    { name: "status", type: "text" },
    { name: "evidenceClass", type: "text" },
    { name: "maturity", type: "text" },
  ]);
  if (!Object.keys(update).length) return err("no fields to update", 400);
  await db.update(evidence).set(update).where(eq(evidence.id, data.id));
  await db.insert(auditLog).values({
    id: id("aud_"), actor: actorOf(locals), action: "update_evidence",
    entityType: "evidence", entityId: data.id, after: JSON.stringify(update), timestamp: nowIso(),
  });
  return ok({ id: data.id });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const denied = denyUnless(locals, "evidence.delete");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(evidence).where(eq(evidence.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "delete_evidence", entityType: "evidence", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
