import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { attestations, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err, pickFields, readBody } from "@lib/api";
import { id, nowIso } from "@lib/utils";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";

const FIELDS = [
  { name: "source", type: "text" as const },
  { name: "title", type: "text" as const },
  { name: "description", type: "text" as const },
  { name: "projectId", type: "text" as const },
  { name: "metricId", type: "text" as const },
  { name: "externalUrl", type: "text" as const },
  { name: "issuedAt", type: "text" as const },
  { name: "verificationStatus", type: "text" as const },
];

export const GET: APIRoute = async ({ locals }) => {
  const denied = denyUnless(locals, "attestations.read");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const db = getDb(env);
  const list = await db.select().from(attestations).all();
  return ok({ attestations: list });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "attestations.create");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const data = await readBody(request);
  if (!data.title) return err("title required", 400);
  const db = getDb(env);
  const aid = id("att_");
  await db.insert(attestations).values({
    id: aid,
    source: data.source ?? "EAS",
    title: data.title,
    description: data.description ?? null,
    projectId: data.projectId ?? null,
    metricId: data.metricId ?? null,
    externalUrl: data.externalUrl ?? null,
    issuedAt: data.issuedAt ?? null,
    verificationStatus: data.verificationStatus ?? "reported",
  });
  await db.insert(auditLog).values({
    id: id("aud_"), actor: actorOf(locals), action: "create_attestation",
    entityType: "attestation", entityId: aid, after: JSON.stringify({ title: data.title }), timestamp: nowIso(),
  });
  return ok({ id: aid });
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "attestations.update");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const data = await readBody(request);
  if (!data.id) return err("id required", 400);
  const db = getDb(env);
  const update = pickFields<typeof attestations.$inferInsert>(data, FIELDS);
  if (!Object.keys(update).length) return err("no fields to update", 400);
  await db.update(attestations).set(update).where(eq(attestations.id, data.id));
  await db.insert(auditLog).values({
    id: id("aud_"), actor: actorOf(locals), action: "update_attestation",
    entityType: "attestation", entityId: data.id, after: JSON.stringify(update), timestamp: nowIso(),
  });
  return ok({ id: data.id });
};

export const DELETE: APIRoute = async ({ locals, url }) => {
  const denied = denyUnless(locals, "attestations.delete");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id") ?? "";
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(attestations).where(eq(attestations.id, idParam));
  await db.insert(auditLog).values({
    id: id("aud_"), actor: actorOf(locals), action: "delete_attestation",
    entityType: "attestation", entityId: idParam, timestamp: nowIso(),
  });
  return ok({ deleted: idParam });
};
