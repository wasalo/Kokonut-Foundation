import { describe, it, expect, beforeAll } from "vitest";
import { createTestDb, applySeed } from "./helpers";
import { contentBlocks, naturalAssets, sources, methodologies, auditLog } from "../../src/lib/schema";
import { eq } from "drizzle-orm";
import {
  genericEntity, findEntity, BESPOKE_ENTITY_KEYS, ADMIN_ENTITIES,
} from "../../src/lib/admin-entities";
import {
  createRecord, updateRecord, deleteRecord, listRecords, getRecord, normaliseBody,
} from "../../src/lib/admin-records";

let orm: any;

beforeAll(async () => {
  const created = await createTestDb();
  orm = created.orm;
  applySeed(created.db);
});

describe("generic entity registry", () => {
  it("serves the reference data through the generic route", () => {
    for (const key of ["content", "natural-assets", "activities", "claims", "methodologies", "sources"]) {
      const entity = genericEntity(key);
      expect(entity, `${key} should be generic`).toBeDefined();
      expect(entity!.fields!.length).toBeGreaterThan(0);
    }
  });

  it("refuses entities that have a bespoke route", () => {
    for (const key of BESPOKE_ENTITY_KEYS) {
      expect(genericEntity(key), `${key} must not be generic`).toBeUndefined();
    }
  });

  it("refuses an unknown entity", () => {
    expect(genericEntity("unicorns")).toBeUndefined();
  });

  it("gives every generic entity an id prefix and a row label", () => {
    for (const entity of ADMIN_ENTITIES) {
      if (!entity.fields) continue;
      expect(entity.idPrefix, `${entity.key} needs an id prefix`).toBeTruthy();
      expect(entity.rowLabel({ name: "n", title: "t", key: "k" }).length).toBeGreaterThan(0);
    }
  });

  it("marks only the content block as JSON-bodied", () => {
    const jsonEntities = ADMIN_ENTITIES.filter((e) => e.bodyIsJson).map((e) => e.key);
    expect(jsonEntities).toEqual(["content"]);
  });
});

describe("JSON body normalisation", () => {
  it("pretty-prints a JSON document", () => {
    const result = normaliseBody('{"a":1}');
    expect("value" in result).toBe(true);
    if ("value" in result) expect(result.value).toBe('{\n  "a": 1\n}');
  });

  it("leaves plain text alone", () => {
    const result = normaliseBody("just words");
    if ("value" in result) expect(result.value).toBe("just words");
  });

  it("rejects a broken JSON document", () => {
    const result = normaliseBody('{"a":');
    expect("error" in result).toBe(true);
  });
});

describe("generic record CRUD", () => {
  it("creates a content block", async () => {
    const entity = findEntity("content")!;
    const result = await createRecord(orm, entity, { key: "home:intro", title: "Intro", body: "Hello" }, "editor@example.org");
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const rows = await orm.select().from(contentBlocks).where(eq(contentBlocks.key, "home:intro"));
    expect(rows.length).toBe(1);
    expect(rows[0].body).toBe("Hello");
    expect(rows[0].id.startsWith("blk_")).toBe(true);
  });

  it("refuses a content block without a key", async () => {
    const entity = findEntity("content")!;
    const result = await createRecord(orm, entity, { title: "No key", body: "x" }, "editor@example.org");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.error).toContain("Key");
  });

  it("refuses a duplicate content block key", async () => {
    const entity = findEntity("content")!;
    await createRecord(orm, entity, { key: "home:dupe", body: "x" }, "editor@example.org");
    const second = await createRecord(orm, entity, { key: "home:dupe", body: "y" }, "editor@example.org");
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.status).toBe(409);
  });

  it("stores a JSON content block pretty-printed", async () => {
    const entity = findEntity("content")!;
    const result = await createRecord(orm, entity, { key: "json:block", body: '{"land_size":4200}' }, "editor@example.org");
    expect(result.ok).toBe(true);
    const rows = await orm.select().from(contentBlocks).where(eq(contentBlocks.key, "json:block"));
    expect(rows[0].body).toContain('"land_size": 4200');
  });

  it("rejects a broken JSON content block", async () => {
    const entity = findEntity("content")!;
    const result = await createRecord(orm, entity, { key: "bad:json", body: '{"a":' }, "editor@example.org");
    expect(result.ok).toBe(false);
  });

  it("derives a slug from the name when none is given", async () => {
    const entity = findEntity("natural-assets")!;
    const result = await createRecord(orm, entity, { name: "Coconut Grove", assetType: "tree" }, "editor@example.org");
    expect(result.ok).toBe(true);
    const rows = await orm.select().from(naturalAssets).where(eq(naturalAssets.name, "Coconut Grove"));
    expect(rows[0].slug).toBe("coconut-grove");
  });

  it("keeps a supplied slug", async () => {
    const entity = findEntity("sources")!;
    await createRecord(orm, entity, { name: "Field Survey", sourceType: "field", slug: "field-survey-2026" }, "editor@example.org");
    const rows = await orm.select().from(sources).where(eq(sources.name, "Field Survey"));
    expect(rows[0].slug).toBe("field-survey-2026");
  });

  it("updates only the fields that were sent", async () => {
    const entity = findEntity("methodologies")!;
    const created = await createRecord(orm, entity, { name: "Canopy Cover", version: "1.0", description: "Mapped canopy." }, "editor@example.org");
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const updated = await updateRecord(orm, entity, { id: created.id, version: "2.0" }, created.id, "editor@example.org");
    expect(updated.ok).toBe(true);

    const rows = await orm.select().from(methodologies).where(eq(methodologies.id, created.id));
    expect(rows[0].version).toBe("2.0");
    expect(rows[0].name).toBe("Canopy Cover");
    expect(rows[0].description).toBe("Mapped canopy.");
  });

  it("refuses an update with no fields", async () => {
    const entity = findEntity("methodologies")!;
    const result = await updateRecord(orm, entity, { id: "x" }, "x", "editor@example.org");
    expect(result.ok).toBe(false);
  });

  it("deletes a record and writes an audit entry", async () => {
    const entity = findEntity("natural-assets")!;
    const created = await createRecord(orm, entity, { name: "Temp Asset", assetType: "tree" }, "editor@example.org");
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const before = (await orm.select().from(auditLog).all()).length;
    const deleted = await deleteRecord(orm, entity, created.id, "editor@example.org");
    expect(deleted.ok).toBe(true);

    const rows = await orm.select().from(naturalAssets).where(eq(naturalAssets.id, created.id));
    expect(rows.length).toBe(0);

    const entries = (await orm.select().from(auditLog).all()).slice(before);
    expect(entries.length).toBe(1);
    expect(entries[0].action).toBe("delete_natural_asset");
    expect(entries[0].actor).toBe("editor@example.org");
  });

  it("lists and reads records", async () => {
    const entity = findEntity("sources")!;
    const list = await listRecords(orm, entity);
    expect(Array.isArray(list)).toBe(true);
    const one = await getRecord(orm, entity, list[0].id);
    expect(one.id).toBe(list[0].id);
    const missing = await getRecord(orm, entity, "nope");
    expect(missing).toBeNull();
  });
});
