import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";
import { id, nowIso } from "@lib/utils";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";
import { ADMIN_ENTITIES, statusCapability } from "@lib/admin-entities";

const ALLOWED = ["draft", "submitted", "verified", "published", "rejected", "archived"];

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  let data: any = {};
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) data = await request.json();
  else { const fd = await request.formData(); fd.forEach((v, k) => { data[k] = String(v); }); }
  const { entityType, entityId, status } = data;
  if (!entityType || !entityId || !status) return err("entityType, entityId, status required", 400);
  if (!ALLOWED.includes(status)) return err("invalid status", 400);

  // `entityType` is the singular audit type, e.g. "project" or "metric".
  const entity = ADMIN_ENTITIES.find((e) => e.entityType === entityType);
  if (!entity) return err(`unknown entityType '${entityType}'`, 400);
  if (!entity.hasStatus) return err(`${entity.plural} have no status field`, 400);

  // Publishing and verifying are publish-capability actions; moving a record
  // through the review workflow only needs update.
  const required = statusCapability(entityType, status);
  if (!required) return err(`unknown entityType '${entityType}'`, 400);
  const denied = denyUnless(locals, required as any);
  if (denied) return denied;

  const db = getDb(env);
  await db.update(entity.table).set({ status } as any).where(eq(entity.table.id, entityId));
  await db.insert(auditLog).values({
    id: id("aud_"), actor: actorOf(locals), action: "status_transition",
    entityType, entityId, after: JSON.stringify({ status }), timestamp: nowIso(),
  });
  return ok({ entityType, entityId, status });
};
