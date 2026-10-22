import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { ok, err } from "@lib/api";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";
import { clearTranslation, getTranslation, saveTranslation } from "@lib/translations";
import { ADMIN_ENTITIES } from "@lib/admin-entities";

/**
 * Translated long-form fields for a record.
 *
 * The base record keeps the default-language copy; this endpoint holds the
 * translated fields for other locales, keyed by the record they belong to.
 */
export const GET: APIRoute = async ({ locals, url }) => {
  const denied = denyUnless(locals, "content.read");
  if (denied) return denied;

  const entityType = url.searchParams.get("entityType") ?? "";
  const entityId = url.searchParams.get("entityId") ?? "";
  const locale = url.searchParams.get("locale") ?? "";
  if (!entityType || !entityId || !locale) return err("entityType, entityId, locale required", 400);

  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const fields = await getTranslation(getDb(env), entityType, entityId, locale);
  return ok({ entityType, entityId, locale, fields });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "content.update");
  if (denied) return denied;

  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);

  const body: any = await request.json().catch(() => ({}));
  const entityType = String(body.entityType ?? "");
  const entityId = String(body.entityId ?? "");
  const locale = String(body.locale ?? "");
  const fields = body.fields && typeof body.fields === "object" ? body.fields : {};
  if (!entityType || !entityId || !locale) return err("entityType, entityId, locale required", 400);

  const entity = ADMIN_ENTITIES.find((e) => e.entityType === entityType);
  if (!entity) return err(`unknown entity type '${entityType}'`, 400);
  if (!(entity.translatableFields ?? []).length) {
    return err(`'${entityType}' has no translatable fields`, 400);
  }

  const allowed = entity.translatableFields ?? [];
  const cleaned: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (!allowed.includes(key)) continue;
    if (typeof value !== "string") continue;
    cleaned[key] = value;
  }

  const db = getDb(env);
  await saveTranslation(db, entityType, entityId, locale, cleaned);
  return ok({ entityType, entityId, locale, fields: cleaned, actor: actorOf(locals) });
};

export const DELETE: APIRoute = async ({ locals, url }) => {
  const denied = denyUnless(locals, "content.update");
  if (denied) return denied;

  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const entityType = url.searchParams.get("entityType") ?? "";
  const entityId = url.searchParams.get("entityId") ?? "";
  const locale = url.searchParams.get("locale") ?? "";
  if (!entityType || !entityId || !locale) return err("entityType, entityId, locale required", 400);

  await clearTranslation(getDb(env), entityType, entityId, locale);
  return ok({ cleared: { entityType, entityId, locale } });
};
