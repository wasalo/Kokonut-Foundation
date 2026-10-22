import { describe, it, expect, beforeAll } from "vitest";
import { createTestDb } from "./helpers";
import { recordTranslations, projects } from "../../src/lib/schema";
import { eq } from "drizzle-orm";
import {
  applyTranslation,
  clearTranslation,
  getTranslation,
  getTranslationsFor,
  localizeRecord,
  localizeRecords,
  saveTranslation,
} from "../../src/lib/translations";

let orm: any;

beforeAll(async () => {
  const created = await createTestDb();
  orm = created.orm;
});

describe("translation storage", () => {
  it("saves and reads a translated field", async () => {
    await saveTranslation(orm, "project", "proj_1", "es", { summary: "Resumen en español" });
    const fields = await getTranslation(orm, "project", "proj_1", "es");
    expect(fields.summary).toBe("Resumen en español");
  });

  it("returns an empty object for an unknown record", async () => {
    expect(await getTranslation(orm, "project", "missing", "es")).toEqual({});
  });

  it("merges new fields with the ones already stored", async () => {
    await saveTranslation(orm, "project", "proj_2", "es", { summary: "Resumen" });
    await saveTranslation(orm, "project", "proj_2", "es", { description: "Descripción" });
    const fields = await getTranslation(orm, "project", "proj_2", "es");
    expect(fields.summary).toBe("Resumen");
    expect(fields.description).toBe("Descripción");
  });

  it("removes a field when it is saved empty", async () => {
    await saveTranslation(orm, "project", "proj_3", "es", { summary: "Resumen", description: "Descripción" });
    await saveTranslation(orm, "project", "proj_3", "es", { summary: "" });
    const fields = await getTranslation(orm, "project", "proj_3", "es");
    expect(fields.summary).toBeUndefined();
    expect(fields.description).toBe("Descripción");
  });

  it("keeps locales apart", async () => {
    await saveTranslation(orm, "project", "proj_4", "es", { summary: "ES" });
    await saveTranslation(orm, "project", "proj_4", "fr", { summary: "FR" });
    expect((await getTranslation(orm, "project", "proj_4", "es")).summary).toBe("ES");
    expect((await getTranslation(orm, "project", "proj_4", "fr")).summary).toBe("FR");
  });

  it("clears a translation", async () => {
    await saveTranslation(orm, "project", "proj_5", "es", { summary: "Resumen" });
    await clearTranslation(orm, "project", "proj_5", "es");
    expect(await getTranslation(orm, "project", "proj_5", "es")).toEqual({});
  });

  it("reads translations for a list of records in one query", async () => {
    await saveTranslation(orm, "project", "proj_6", "es", { summary: "A" });
    await saveTranslation(orm, "project", "proj_7", "es", { summary: "B" });
    const map = await getTranslationsFor(orm, "project", ["proj_6", "proj_7", "proj_8"], "es");
    expect(map.proj_6.summary).toBe("A");
    expect(map.proj_7.summary).toBe("B");
    expect(map.proj_8).toBeUndefined();
  });
});

describe("applying translations", () => {
  it("overrides only the fields that have a translation", () => {
    const record = { id: "p", name: "Adelphi", summary: "English", description: "English body" };
    const merged = applyTranslation(record, { summary: "Español" }, ["name", "summary", "description"]);
    expect(merged.summary).toBe("Español");
    expect(merged.description).toBe("English body");
    expect(merged.name).toBe("Adelphi");
  });

  it("ignores an empty translation", () => {
    const record = { id: "p", summary: "English" };
    const merged = applyTranslation(record, { summary: "   " }, ["summary"]);
    expect(merged.summary).toBe("English");
  });

  it("does not mutate the original record", () => {
    const record = { id: "p", summary: "English" };
    applyTranslation(record, { summary: "Español" }, ["summary"]);
    expect(record.summary).toBe("English");
  });

  it("localises a list of records", async () => {
    await saveTranslation(orm, "project", "proj_l1", "es", { summary: "Uno" });
    await saveTranslation(orm, "project", "proj_l2", "es", { summary: "Dos" });
    const records = [
      { id: "proj_l1", summary: "One" },
      { id: "proj_l2", summary: "Two" },
      { id: "proj_l3", summary: "Three" },
    ];
    const out = await localizeRecords(orm, "project", records, "es", ["summary"]);
    expect(out.map((r: any) => r.summary)).toEqual(["Uno", "Dos", "Three"]);
  });

  it("leaves the default language untouched", async () => {
    await saveTranslation(orm, "project", "proj_en", "es", { summary: "Español" });
    const record = { id: "proj_en", summary: "English" };
    const out = await localizeRecord(orm, "project", record, "en", ["summary"]);
    expect(out!.summary).toBe("English");
  });

  it("localises a single record", async () => {
    await saveTranslation(orm, "project", "proj_s1", "es", { name: "Adelphi ES" });
    const out = await localizeRecord(orm, "project", { id: "proj_s1", name: "Adelphi" }, "es", ["name"]);
    expect(out!.name).toBe("Adelphi ES");
  });

  it("returns null for a missing record", async () => {
    expect(await localizeRecord(orm, "project", null, "es", ["name"])).toBeNull();
  });
});
