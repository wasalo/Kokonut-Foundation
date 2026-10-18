import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { teamMembers, auditLog } from "@lib/schema";
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
  if (!data.name || !data.role) return err("name and role required", 400);
  const db = getDb(env);
  const tid = id("tm_");
  await db.insert(teamMembers).values({
    id: tid,
    name: data.name,
    role: data.role,
    bio: data.bio ?? null,
    email: data.email ?? null,
    linkedin: data.linkedin ?? null,
    order: Number(data.order ?? 0),
  });
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "create_team_member", entityType: "team_member", entityId: tid, after: JSON.stringify({ name: data.name, role: data.role }), timestamp: nowIso() });
  return ok({ id: tid });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id");
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(teamMembers).where(eq(teamMembers.id, idParam));
  await db.insert(auditLog).values({ id: id("aud_"), actor: "admin", action: "delete_team_member", entityType: "team_member", entityId: idParam, timestamp: nowIso() });
  return ok({ deleted: idParam });
};
