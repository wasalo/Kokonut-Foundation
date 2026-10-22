import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { partners, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err, pickFields, readBody } from "@lib/api";
import { id, nowIso, slugify } from "@lib/utils";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "partners.create");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  let data: any = {};
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) data = await request.json();
  else { const fd = await request.formData(); fd.forEach((v, k) => { data[k] = String(v); }); }
  if (!data.name) return err("name required", 400);
  const db = getDb(env);
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  const pid = id("par_");
  await db.insert(partners).values({
    id: pid,
    slug,
    name: data.name,
    type: data.type ?? "Partner",
    description: data.description ?? "",
    website: data.website ?? null,
    country: data.country ?? null,
    createdAt: nowIso(),
  });
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "create_partner", entityType: "partner", entityId: pid, after: JSON.stringify({ name: data.name, slug }), timestamp: nowIso() });
  return ok({ id: pid, slug });
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "partners.update");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const data = await readBody(request);
  if (!data.id) return err("id required", 400);
  const db = getDb(env);
  const update = pickFields<typeof partners.$inferInsert>(data, [
    { name: "slug", type: "text" },
    { name: "name", type: "text" },
    { name: "type", type: "text" },
    { name: "description", type: "text" },
    { name: "website", type: "text" },
    { name: "logo", type: "text" },
    { name: "country", type: "text" },
  ]);
  if (!Object.keys(update).length) return err("no fields to update", 400);
  await db.update(partners).set(update).where(eq(partners.id, data.id));
  await db.insert(auditLog).values({
    id: id("aud_"), actor: actorOf(locals), action: "update_partners",
    entityType: "partners", entityId: data.id, after: JSON.stringify(update), timestamp: nowIso(),
  });
  return ok({ id: data.id });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const denied = denyUnless(locals, "partners.delete");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(partners).where(eq(partners.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: actorOf(locals), action: "delete_partner", entityType: "partner", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
