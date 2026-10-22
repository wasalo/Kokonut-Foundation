import { recordTranslations } from "@lib/schema";
import { and, eq } from "drizzle-orm";
import { id as newId, nowIso } from "@lib/utils";

/**
 * Localised long-form record fields.
 *
 * A record keeps its default-language copy in its own table. Translations for
 * other locales live in `record_translations`, keyed by the record they belong
 * to, so a detail page can serve its body copy in the visitor's language
 * without duplicating the record.
 */
export interface TranslationFields {
  [field: string]: string;
}

/** Reads the translated fields for a record, or an empty object. */
export async function getTranslation(
  db: any,
  entityType: string,
  entityId: string,
  locale: string,
): Promise<TranslationFields> {
  if (!db || !entityId || !locale) return {};
  try {
    const row = await db
      .select()
      .from(recordTranslations)
      .where(
        and(
          eq(recordTranslations.entityType, entityType),
          eq(recordTranslations.entityId, entityId),
          eq(recordTranslations.locale, locale),
        ),
      )
      .get();
    if (!row) return {};
    const parsed = JSON.parse(row.fields ?? "{}");
    return parsed && typeof parsed === "object" ? (parsed as TranslationFields) : {};
  } catch {
    return {};
  }
}

/**
 * Reads the translated fields for a list of records in one query.
 * Returns a map of record id to its translated fields.
 */
export async function getTranslationsFor(
  db: any,
  entityType: string,
  entityIds: string[],
  locale: string,
): Promise<Record<string, TranslationFields>> {
  const out: Record<string, TranslationFields> = {};
  if (!db || !entityIds.length || !locale) return out;
  try {
    const rows = await db
      .select()
      .from(recordTranslations)
      .where(and(eq(recordTranslations.entityType, entityType), eq(recordTranslations.locale, locale)))
      .all();
    for (const row of rows) {
      if (!entityIds.includes(row.entityId)) continue;
      const parsed = JSON.parse(row.fields ?? "{}");
      out[row.entityId] = parsed && typeof parsed === "object" ? parsed : {};
    }
  } catch {
    // fall through with an empty map
  }
  return out;
}

/**
 * Merges translated fields over a record. The default-language copy is used
 * wherever a field has no translation.
 */
export function applyTranslation<T extends Record<string, any>>(
  record: T,
  translation: TranslationFields,
  fields: string[],
): T {
  if (!translation) return record;
  const merged: Record<string, any> = { ...record };
  for (const field of fields) {
    const value = translation[field];
    if (typeof value === "string" && value.trim() !== "") {
      merged[field] = value;
    }
  }
  return merged as T;
}

/**
 * Localises a list of records of one entity type in a single query.
 * The default locale is returned untouched.
 */
export async function localizeRecords<T extends { id: string }>(
  db: any,
  entityType: string,
  records: T[],
  locale: string,
  fields: string[],
): Promise<T[]> {
  if (!db || !records.length || !locale || locale === "en") return records;
  const map = await getTranslationsFor(db, entityType, records.map((r) => r.id), locale);
  return records.map((r) => applyTranslation(r, map[r.id] ?? {}, fields));
}

/**
 * Localises a single record.
 */
export async function localizeRecord<T extends { id: string }>(
  db: any,
  entityType: string,
  record: T | null,
  locale: string,
  fields: string[],
): Promise<T | null> {
  if (!db || !record || !locale || locale === "en") return record;
  const translation = await getTranslation(db, entityType, record.id, locale);
  return applyTranslation(record, translation, fields);
}

/**
 * Writes translated fields for a record, merging with anything already stored
 * for that locale.
 */
export async function saveTranslation(
  db: any,
  entityType: string,
  entityId: string,
  locale: string,
  fields: TranslationFields,
): Promise<void> {
  if (!db || !entityId || !locale) return;
  const existing = await getTranslation(db, entityType, entityId, locale);
  const merged: TranslationFields = { ...existing };
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value !== "string") continue;
    if (value.trim() === "") {
      delete merged[key];
    } else {
      merged[key] = value;
    }
  }

  const rows = await db
    .select()
    .from(recordTranslations)
    .where(
      and(
        eq(recordTranslations.entityType, entityType),
        eq(recordTranslations.entityId, entityId),
        eq(recordTranslations.locale, locale),
      ),
    )
    .all();

  if (rows.length) {
    await db
      .update(recordTranslations)
      .set({ fields: JSON.stringify(merged), updatedAt: nowIso() })
      .where(eq(recordTranslations.id, rows[0].id));
  } else {
    await db.insert(recordTranslations).values({
      id: newId("tr_"),
      entityType,
      entityId,
      locale,
      fields: JSON.stringify(merged),
      updatedAt: nowIso(),
    });
  }
}

/** Removes the translation for a record and locale. */
export async function clearTranslation(
  db: any,
  entityType: string,
  entityId: string,
  locale: string,
): Promise<void> {
  if (!db || !entityId || !locale) return;
  await db
    .delete(recordTranslations)
    .where(
      and(
        eq(recordTranslations.entityType, entityType),
        eq(recordTranslations.entityId, entityId),
        eq(recordTranslations.locale, locale),
      ),
    );
}
