import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { fundingEvents, auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err, pickFields, readBody } from "@lib/api";
import { id, nowIso } from "@lib/utils";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";

const FIELDS = [
  { name: "title", type: "text" as const },
  { name: "amount", type: "number" as const },
  { name: "currency", type: "text" as const },
  { name: "funder", type: "text" as const },
  { name: "projectId", type: "text" as const },
  { name: "occurredAt", type: "text" as const },
  { name: "category", type: "text" as const },
  { name: "externalUrl", type: "text" as const },
];

export const GET: APIRoute = async ({ locals }) => {
  const denied = denyUnless(locals, "funding.read");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const db = getDb(env);
  const list = await db.select().from(fundingEvents).all();
  return ok({ funding: list });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "funding.create");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const data = await readBody(request);
  if (!data.title) return err("title required", 400);
  const db = getDb(env);
  const fid = id("fund_");
  await db.insert(fundingEvents).values({
    id: fid,
    title: data.title,
    amount: data.amount === undefined || data.amount === "" ? null : Number(data.amount),
    currency: data.currency ?? null,
    funder: data.funder ?? null,
    projectId: data.projectId ?? null,
    occurredAt: data.occurredAt ?? nowIso(),
    category: data.category ?? null,
    externalUrl: data.externalUrl ?? null,
  });
  await db.insert(auditLog).values({
    id: id("aud_"), actor: actorOf(locals), action: "create_funding_event",
    entityType: "funding_event", entityId: fid, after: JSON.stringify({ title: data.title }), timestamp: nowIso(),
  });
  return ok({ id: fid });
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "funding.update");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const data = await readBody(request);
  if (!data.id) return err("id required", 400);
  const db = getDb(env);
  const update = pickFields<typeof fundingEvents.$inferInsert>(data, FIELDS);
  if (!Object.keys(update).length) return err("no fields to update", 400);
  await db.update(fundingEvents).set(update).where(eq(fundingEvents.id, data.id));
  await db.insert(auditLog).values({
    id: id("aud_"), actor: actorOf(locals), action: "update_funding_event",
    entityType: "funding_event", entityId: data.id, after: JSON.stringify(update), timestamp: nowIso(),
  });
  return ok({ id: data.id });
};

export const DELETE: APIRoute = async ({ locals, url }) => {
  const denied = denyUnless(locals, "funding.delete");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const idParam = url.searchParams.get("id") ?? "";
  if (!idParam) return err("id required", 400);
  const db = getDb(env);
  await db.delete(fundingEvents).where(eq(fundingEvents.id, idParam));
  await db.insert(auditLog).values({
    id: id("aud_"), actor: actorOf(locals), action: "delete_funding_event",
    entityType: "funding_event", entityId: idParam, timestamp: nowIso(),
  });
  return ok({ deleted: idParam });
};
