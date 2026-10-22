import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { reports, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";
import { id, nowIso } from "@lib/utils";

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(reports).where(eq(reports.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "delete_report", entityType: "report", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
