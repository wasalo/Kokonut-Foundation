import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { ok, err, readBody } from "@lib/api";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";
import { genericEntity } from "@lib/admin-entities";
import { createRecord, deleteRecord, getRecord, listRecords, updateRecord } from "@lib/admin-records";

/**
 * Generic administration for the registry-driven reference data.
 *
 * Entities that need bespoke behaviour (projects, metrics, media, ...) have
 * their own route, and this one refuses them, so there is exactly one way to
 * change a record.
 */
function resolve(entityKey: string) {
  return genericEntity(entityKey);
}

export const GET: APIRoute = async ({ locals, params, url }) => {
  const entity = resolve(params.entity ?? "");
  if (!entity) return err("Unknown entity", 404);
  const denied = denyUnless(locals, `${entity.permissionEntity}.read` as any);
  if (denied) return denied;

  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const db = getDb(env);

  const one = url.searchParams.get("id");
  if (one) {
    const record = await getRecord(db, entity, one);
    if (!record) return err("Not found", 404);
    return ok({ record });
  }
  const records = await listRecords(db, entity);
  return ok({ records });
};

export const POST: APIRoute = async ({ request, locals, params }) => {
  const entity = resolve(params.entity ?? "");
  if (!entity) return err("Unknown entity", 404);
  const denied = denyUnless(locals, `${entity.permissionEntity}.create` as any);
  if (denied) return denied;

  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const data = await readBody(request);
  const result = await createRecord(getDb(env), entity, data, actorOf(locals));
  if (!result.ok) return err(result.error, result.status);
  return ok({ id: result.id });
};

export const PUT: APIRoute = async ({ request, locals, params, url }) => {
  const entity = resolve(params.entity ?? "");
  if (!entity) return err("Unknown entity", 404);
  const denied = denyUnless(locals, `${entity.permissionEntity}.update` as any);
  if (denied) return denied;

  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const data = await readBody(request);
  const recordId = String(data.id ?? url.searchParams.get("id") ?? "");
  const result = await updateRecord(getDb(env), entity, data, recordId, actorOf(locals));
  if (!result.ok) return err(result.error, result.status);
  return ok({ id: result.id });
};

export const DELETE: APIRoute = async ({ locals, params, url }) => {
  const entity = resolve(params.entity ?? "");
  if (!entity) return err("Unknown entity", 404);
  const denied = denyUnless(locals, `${entity.permissionEntity}.delete` as any);
  if (denied) return denied;

  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const recordId = url.searchParams.get("id") ?? "";
  const result = await deleteRecord(getDb(env), entity, recordId, actorOf(locals));
  if (!result.ok) return err(result.error, result.status);
  return ok({ deleted: result.id });
};
