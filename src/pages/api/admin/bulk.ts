import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { ok, err } from "@lib/api";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";
import { BULK_ACTIONS, bulkCapability, runBulk, type BulkAction } from "@lib/admin-bulk";

/**
 * Bulk actions over an admin entity.
 *
 * The capability is checked on the action, not on the row: publishing a batch
 * needs the publish capability, deleting a batch needs the delete capability.
 * Every affected record gets its own audit entry, so the trail names each
 * record rather than one opaque "bulk" line.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);

  const body: any = await request.json().catch(() => ({}));
  const entityKey = String(body.entity ?? "");
  const action = String(body.action ?? "") as BulkAction;
  const ids: string[] = Array.isArray(body.ids) ? body.ids.map(String) : [];

  if (!entityKey) return err("entity required", 400);
  if (!(BULK_ACTIONS as readonly string[]).includes(action)) {
    return err(`action must be one of ${BULK_ACTIONS.join(", ")}`, 400);
  }
  if (!ids.length) return err("ids required", 400);

  const denied = denyUnless(locals, bulkCapability(entityKey, action) as any);
  if (denied) return denied;

  const db = getDb(env);
  const result = await runBulk(db, { entity: entityKey, action, ids }, actorOf(locals));
  if (!result.ok) return err(result.error, result.status);
  return ok({ entity: result.entity, action: result.action, affected: result.affected, ids: result.ids });
};
