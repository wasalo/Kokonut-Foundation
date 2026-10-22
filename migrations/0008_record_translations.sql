-- Localised versions of long-form record fields.
--
-- The base record holds the default-language copy. This table holds the
-- translated fields for other locales, keyed by the record they belong to, so
-- a detail page can serve its body copy in the visitor's language without
-- duplicating the record itself.
CREATE TABLE IF NOT EXISTS record_translations (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  fields TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL,
  UNIQUE (entity_type, entity_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_record_translations_lookup
  ON record_translations(entity_type, entity_id, locale);
