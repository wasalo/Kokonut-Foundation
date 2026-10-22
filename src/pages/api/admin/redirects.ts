import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { redirects, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err, pickFields, readBody } from "@lib/api";
import { id, nowIso } from "@lib/utils";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "redirects.create");
  if (denied) return denied;
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
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "create_redirect", entityType: "redirect", entityId: rid, after: JSON.stringify({ from: data.fromPath, to: data.toPath }), timestamp: nowIso() });
  return ok({ id: rid });
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "redirects.update");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const data = await readBody(request);
  if (!data.id) return err("id required", 400);
  const db = getDb(env);
  const update = pickFields<typeof redirects.$inferInsert>(data, [
    { name: "fromPath", type: "text" },
    { name: "toPath", type: "text" },
    { name: "statusCode", type: "number" },
  ]);
  if (!Object.keys(update).length) return err("no fields to update", 400);
  await db.update(redirects).set(update).where(eq(redirects.id, data.id));
  await db.insert(auditLog).values({
    id: id("aud_"), actor: actorOf(locals), action: "update_redirects",
    entityType: "redirects", entityId: data.id, after: JSON.stringify(update), timestamp: nowIso(),
  });
  return ok({ id: data.id });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const denied = denyUnless(locals, "redirects.delete");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(redirects).where(eq(redirects.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "delete_redirect", entityType: "redirect", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
