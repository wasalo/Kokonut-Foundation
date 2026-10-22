import { auditLog } from "@lib/schema";
import { eq } from "drizzle-orm";
import { id, nowIso, slugify } from "@lib/utils";
import { pickFields } from "@lib/api";
import type { AdminEntity } from "@lib/admin-entities";

/**
 * Registry-driven CRUD for the reference data.
 *
 * The admin route owns authentication, capability checks and the HTTP
 * envelope; this module owns the record manipulation, so it can be exercised
 * against a real database in the integration tests.
 */

export type RecordResult =
  | { ok: true; id: string }
  | { ok: false; error: string; status: number };

function fieldTypes(entity: AdminEntity) {
  return entity.fields!.map((f) => ({
    name: f.name,
    type: f.type === "number" ? ("number" as const) : ("text" as const),
  }));
}

/** Normalises a body that is meant to hold JSON, leaving plain text alone. */
export function normaliseBody(body: string): { value: string } | { error: string } {
  const trimmed = body.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return { value: body };
  try {
    return { value: JSON.stringify(JSON.parse(trimmed), null, 2) };
  } catch {
    return { error: "Body looks like JSON but does not parse" };
  }
}

export async function listRecords(db: any, entity: AdminEntity): Promise<any[]> {
  return db.select().from(entity.table).all();
}

export async function getRecord(db: any, entity: AdminEntity, recordId: string): Promise<any | null> {
  return (await db.select().from(entity.table).where(eq(entity.table.id, recordId)).get()) ?? null;
}

export async function createRecord(
  db: any,
  entity: AdminEntity,
  data: Record<string, any>,
  actor: string,
): Promise<RecordResult> {
  for (const field of entity.fields!) {
    if (field.required && !String(data[field.name] ?? "").trim()) {
      return { ok: false, error: `${field.label} is required`, status: 400 };
    }
  }

  const values: Record<string, unknown> = { ...pickFields<any>(data, fieldTypes(entity)) };

  if (entity.hasSlug) {
    const provided = String(data.slug ?? "").trim();
    const source = provided || String(data.name ?? data.title ?? "");
    if (!source) return { ok: false, error: "A name or title is required to derive the slug", status: 400 };
    values.slug = slugify(source);
  }

  if (entity.bodyIsJson) {
    const normalised = normaliseBody(String(values.body ?? ""));
    if ("error" in normalised) return { ok: false, error: normalised.error, status: 400 };
    values.body = normalised.value;
  }

  values.id = id(entity.idPrefix ?? "");
  const columns = new Set(Object.keys(entity.table));
  if (columns.has("createdAt")) values.createdAt = nowIso();
  if (columns.has("updatedAt")) values.updatedAt = nowIso();

  try {
    await db.insert(entity.table).values(values);
  } catch (e) {
    const message = String(e);
    if (message.includes("UNIQUE")) {
      return { ok: false, error: "A record with that key or slug already exists", status: 409 };
    }
    return { ok: false, error: message, status: 500 };
  }

  await db.insert(auditLog).values({
    id: id("aud_"), actor, action: `create_${entity.entityType}`,
    entityType: entity.entityType, entityId: String(values.id),
    after: JSON.stringify(values), timestamp: nowIso(),
  });
  return { ok: true, id: String(values.id) };
}

export async function updateRecord(
  db: any,
  entity: AdminEntity,
  data: Record<string, any>,
  recordId: string,
  actor: string,
): Promise<RecordResult> {
  if (!recordId) return { ok: false, error: "id required", status: 400 };

  const update = pickFields<any>(data, fieldTypes(entity));
  delete (update as any).id;
  if (!Object.keys(update).length) return { ok: false, error: "no fields to update", status: 400 };

  if (entity.hasSlug && update.slug) update.slug = slugify(String(update.slug));
  if (entity.bodyIsJson && typeof update.body === "string") {
    const normalised = normaliseBody(update.body);
    if ("error" in normalised) return { ok: false, error: normalised.error, status: 400 };
    update.body = normalised.value;
  }

  const columns = new Set(Object.keys(entity.table));
  if (columns.has("updatedAt")) update.updatedAt = nowIso();

  try {
    await db.update(entity.table).set(update).where(eq(entity.table.id, recordId));
  } catch (e) {
    const message = String(e);
    if (message.includes("UNIQUE")) {
      return { ok: false, error: "A record with that key or slug already exists", status: 409 };
    }
    return { ok: false, error: message, status: 500 };
  }

  await db.insert(auditLog).values({
    id: id("aud_"), actor, action: `update_${entity.entityType}`,
    entityType: entity.entityType, entityId: recordId,
    after: JSON.stringify(update), timestamp: nowIso(),
  });
  return { ok: true, id: recordId };
}

export async function deleteRecord(
  db: any,
  entity: AdminEntity,
  recordId: string,
  actor: string,
): Promise<RecordResult> {
  if (!recordId) return { ok: false, error: "id required", status: 400 };
  await db.delete(entity.table).where(eq(entity.table.id, recordId));
  await db.insert(auditLog).values({
    id: id("aud_"), actor, action: `delete_${entity.entityType}`,
    entityType: entity.entityType, entityId: recordId, timestamp: nowIso(),
  });
  return { ok: true, id: recordId };
}
