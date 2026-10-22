import { describe, it, expect, beforeAll } from "vitest";
import { createTestDb, applySeed } from "./helpers";
import { projects, metrics, auditLog, teamMembers } from "../../src/lib/schema";
import { eq } from "drizzle-orm";
import { runBulk, bulkCapability, BULK_ACTIONS } from "../../src/lib/admin-bulk";
import { findEntity, ADMIN_ENTITIES } from "../../src/lib/admin-entities";

let orm: any;

beforeAll(async () => {
  const created = await createTestDb();
  orm = created.orm;
  applySeed(created.db);
});

describe("admin entity registry", () => {
  it("covers every editable entity", () => {
    for (const key of ["projects", "farms", "metrics", "evidence", "attestations", "funding", "team", "partners", "reports", "resources"]) {
      expect(findEntity(key), `missing ${key}`).toBeDefined();
    }
  });

  it("maps each entity to a unique key and a label", () => {
    const keys = ADMIN_ENTITIES.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const e of ADMIN_ENTITIES) {
      expect(e.label.length).toBeGreaterThan(0);
      expect(e.plural.length).toBeGreaterThan(0);
      expect(e.entityType.length).toBeGreaterThan(0);
    }
  });

  it("renders a row label for every entity", () => {
    for (const e of ADMIN_ENTITIES) {
      const label = e.rowLabel({ name: "n", title: "t", key: "k", status: "s" });
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe("bulk action capabilities", () => {
  it("maps each action to the matching entity capability", () => {
    expect(bulkCapability("projects", "delete")).toBe("projects.delete");
    expect(bulkCapability("projects", "publish")).toBe("projects.publish");
    expect(bulkCapability("projects", "archive")).toBe("projects.update");
  });

  it("falls back to projects for an unknown entity", () => {
    expect(bulkCapability("nope", "delete")).toBe("projects.delete");
  });

  it("exposes exactly the three supported actions", () => {
    expect([...BULK_ACTIONS]).toEqual(["publish", "archive", "delete"]);
  });
});

describe("bulk actions against the real schema", () => {
  it("publishes a batch of records", async () => {
    const result = await runBulk(orm, { entity: "projects", action: "publish", ids: ["proj_adelphi"] }, "tester@example.org");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.affected).toBe(1);

    const rows = await orm.select().from(projects).where(eq(projects.id, "proj_adelphi"));
    expect(rows[0].status).toBe("published");
  });

  it("archives a batch of records", async () => {
    const result = await runBulk(orm, { entity: "projects", action: "archive", ids: ["proj_adelphi"] }, "tester@example.org");
    expect(result.ok).toBe(true);
    const rows = await orm.select().from(projects).where(eq(projects.id, "proj_adelphi"));
    expect(rows[0].status).toBe("archived");
  });

  it("writes one audit entry per affected record", async () => {
    const before = (await orm.select().from(auditLog).all()).length;
    await runBulk(orm, { entity: "metrics", action: "publish", ids: ["met_coconut-trees", "met_farm-area"] }, "tester@example.org");
    const entries = (await orm.select().from(auditLog).all()).slice(before);
    expect(entries.length).toBe(2);
    expect(entries.every((e: any) => e.actor === "tester@example.org")).toBe(true);
    expect(entries.every((e: any) => e.action.startsWith("bulk_publish_"))).toBe(true);
  });

  it("deletes a batch of records", async () => {
    await orm.insert(teamMembers).values({
      id: "tm_bulk1", name: "Bulk One", role: "Tester", order: 0,
    });
    await orm.insert(teamMembers).values({
      id: "tm_bulk2", name: "Bulk Two", role: "Tester", order: 0,
    });
    const result = await runBulk(orm, { entity: "team", action: "delete", ids: ["tm_bulk1", "tm_bulk2"] }, "tester@example.org");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.affected).toBe(2);
    const rows = await orm.select().from(teamMembers).where(eq(teamMembers.id, "tm_bulk1"));
    expect(rows.length).toBe(0);
  });

  it("refuses a status action on an entity without a status field", async () => {
    const result = await runBulk(orm, { entity: "team", action: "publish", ids: ["tm_bulk1"] }, "tester@example.org");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.error).toContain("no status field");
  });

  it("refuses an unknown entity", async () => {
    const result = await runBulk(orm, { entity: "unicorns", action: "delete", ids: ["x"] }, "tester@example.org");
    expect(result.ok).toBe(false);
  });

  it("refuses an empty batch", async () => {
    const result = await runBulk(orm, { entity: "projects", action: "publish", ids: [] }, "tester@example.org");
    expect(result.ok).toBe(false);
  });
});
