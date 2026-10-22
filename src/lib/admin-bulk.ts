import { getDb } from "@lib/db";
import { auditLog } from "@lib/schema";
import { inArray } from "drizzle-orm";
import { id, nowIso } from "@lib/utils";
import { findEntity } from "@lib/admin-entities";

export const BULK_ACTIONS = ["publish", "archive", "delete"] as const;
export type BulkAction = (typeof BULK_ACTIONS)[number];

export interface BulkRequest {
  entity: string;
  action: BulkAction;
  ids: string[];
}

export type BulkResult =
  | { ok: true; entity: string; action: BulkAction; affected: number; ids: string[] }
  | { ok: false; error: string; status: number };

/**
 * Applies a bulk action to a set of records.
 *
 * The capability check happens in the route handler, on the action rather than
 * on the row. Every affected record gets its own audit entry, so the trail
 * names each record rather than one opaque "bulk" line.
 */
export async function runBulk(db: any, request: BulkRequest, actor: string): Promise<BulkResult> {
  const entity = findEntity(request.entity);
  if (!entity) return { ok: false, error: `unknown entity '${request.entity}'`, status: 400 };

  if (!request.ids.length) return { ok: false, error: "ids required", status: 400 };
  if (request.ids.length > 500) return { ok: false, error: "at most 500 records per request", status: 400 };

  if ((request.action === "publish" || request.action === "archive") && !entity.hasStatus) {
    return { ok: false, error: `${entity.plural} have no status field; use delete instead`, status: 400 };
  }

  const affected: string[] = [];

  if (request.action === "delete") {
    for (const entityId of request.ids) {
      await db.delete(entity.table).where(inArray(entity.table.id, [entityId]));
      await db.insert(auditLog).values({
        id: id("aud_"), actor, action: `bulk_delete_${entity.entityType}`,
        entityType: entity.entityType, entityId,
        after: JSON.stringify({ bulk: true, batch: request.ids.length }), timestamp: nowIso(),
      });
      affected.push(entityId);
    }
  } else {
    const status = request.action === "publish" ? "published" : "archived";
    for (const entityId of request.ids) {
      await db.update(entity.table).set({ status } as any).where(inArray(entity.table.id, [entityId]));
      await db.insert(auditLog).values({
        id: id("aud_"), actor, action: `bulk_${request.action}_${entity.entityType}`,
        entityType: entity.entityType, entityId,
        after: JSON.stringify({ status, bulk: true, batch: request.ids.length }), timestamp: nowIso(),
      });
      affected.push(entityId);
    }
  }

  return { ok: true, entity: entity.key, action: request.action, affected: affected.length, ids: affected };
}

/** The capability a bulk action requires, for the given entity. */
export function bulkCapability(entityKey: string, action: BulkAction): string {
  const entity = findEntity(entityKey);
  const base = entity?.permissionEntity ?? "projects";
  if (action === "delete") return `${base}.delete`;
  if (action === "publish") return `${base}.publish`;
  return `${base}.update`;
}

export { getDb };
