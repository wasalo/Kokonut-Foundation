import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { reports, evidence, metrics, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";
import { id, nowIso } from "@lib/utils";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";

const ALLOWED = ["draft", "submitted", "verified", "published", "rejected", "archived"];

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "content.publish");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  let data: any = {};
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) data = await request.json();
  else { const fd = await request.formData(); fd.forEach((v, k) => { data[k] = String(v); }); }
  const { entityType, entityId, status } = data;
  if (!entityType || !entityId || !status) return err("entityType, entityId, status required", 400);
  if (!ALLOWED.includes(status)) return err("invalid status", 400);
  const db = getDb(env);
  const table = entityType === "report" ? reports : entityType === "evidence" ? evidence : entityType === "metric" ? metrics : null;
  if (!table) return err("unknown entityType", 400);
  await db.update(table).set({ status } as any).where(eq((table as any).id, entityId));
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "status_transition", entityType, entityId, after: JSON.stringify({ status }), timestamp: nowIso() });
  return ok({ entityType, entityId, status });
};
