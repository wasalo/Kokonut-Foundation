import { describe, it, expect, beforeAll } from "vitest";
import { createTestDb, applySeed } from "./helpers";
import { projects, metrics, auditLog, teamMembers } from "../../src/lib/schema";
import { eq } from "drizzle-orm";
import { runBulk, bulkCapability, BULK_ACTIONS } from "../../src/lib/admin-bulk";
import { findEntity, ADMIN_ENTITIES, statusCapability } from "../../src/lib/admin-entities";

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

  it("resolves every status dropdown in the admin UI to a status-bearing entity", async () => {
    // The status dropdowns post an `entity` value; each must map to a registry
    // entry that actually has a status column, or the transition is a no-op.
    const pages = await import("node:fs/promises");
    const dir = new URL("../../src/pages/admin/", import.meta.url);
    const files = await pages.readdir(dir);
    const used = new Set<string>();
    for (const file of files) {
      if (!file.endsWith(".astro")) continue;
      const source = await pages.readFile(new URL(file, dir), "utf8");
      for (const m of source.matchAll(/StatusSelect entity="([^"]+)"/g)) used.add(m[1]);
    }
    expect(used.size).toBeGreaterThan(0);
    for (const entityType of used) {
      const entity = ADMIN_ENTITIES.find((e) => e.entityType === entityType);
      expect(entity, `status dropdown for '${entityType}' has no registry entry`).toBeDefined();
      expect(entity!.hasStatus, `'${entityType}' has no status column`).toBe(true);
    }
  });
});

describe("status transition capabilities", () => {
  it("requires publish for publishing and verifying", () => {
    expect(statusCapability("project", "published")).toBe("projects.publish");
    expect(statusCapability("project", "verified")).toBe("projects.publish");
  });

  it("requires only update for the review workflow", () => {
    expect(statusCapability("project", "submitted")).toBe("projects.update");
    expect(statusCapability("project", "draft")).toBe("projects.update");
    expect(statusCapability("evidence", "submitted")).toBe("evidence.update");
  });

  it("returns null for an unknown entity or one without a status", () => {
    expect(statusCapability("unicorn", "published")).toBeNull();
    expect(statusCapability("team_member", "published")).toBeNull();
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
