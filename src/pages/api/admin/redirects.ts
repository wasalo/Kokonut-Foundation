import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { redirects, auditLog } from "@lib/schema";
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
  if (!data.fromPath || !data.toPath) return err("fromPath and toPath required", 400);
  const db = getDb(env);
  const rid = id("red_");
  await db.insert(redirects).values({
    id: rid,
    fromPath: data.fromPath,
    toPath: data.toPath,
    statusCode: Number(data.statusCode ?? 301),
  });
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "create_redirect", entityType: "redirect", entityId: rid, after: JSON.stringify({ from: data.fromPath, to: data.toPath }), timestamp: nowIso() });
  return ok({ id: rid });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(redirects).where(eq(redirects.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "delete_redirect", entityType: "redirect", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
