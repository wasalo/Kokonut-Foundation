import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { partners, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";
import { id, nowIso, slugify } from "@lib/utils";

export const POST: APIRoute = async ({ request, locals }) => {
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
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "create_partner", entityType: "partner", entityId: pid, after: JSON.stringify({ name: data.name, slug }), timestamp: nowIso() });
  return ok({ id: pid, slug });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(partners).where(eq(partners.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "delete_partner", entityType: "partner", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
