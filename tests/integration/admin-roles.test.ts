import { describe, it, expect, beforeAll } from "vitest";
import { createTestDb } from "./helpers";
import { adminRoles, auditLog } from "../../src/lib/schema";
import { eq } from "drizzle-orm";
import { resolveRoleForEmail } from "../../src/lib/admin-actor";

let orm: any;

beforeAll(async () => {
  const created = await createTestDb();
  orm = created.orm;
});

describe("admin role resolution", () => {
  it("grants administrator to the first identity and records it", async () => {
    const result = await resolveRoleForEmail("first@example.org", orm);
    expect(result.role).toBe("administrator");
    expect(result.bootstrapped).toBe(true);

    const rows = await orm.select().from(adminRoles).all();
    expect(rows.length).toBe(1);
    expect(rows[0].email).toBe("first@example.org");
    expect(rows[0].role).toBe("administrator");
    expect(rows[0].grantedBy).toBe("bootstrap");
  });

  it("writes a bootstrap audit entry", async () => {
    const entries = await orm.select().from(auditLog).all();
    const boot = entries.find((e: any) => e.action === "bootstrap_role");
    expect(boot).toBeDefined();
    expect(boot.actor).toBe("first@example.org");
  });

  it("falls back to read-only for an unassigned identity once roles exist", async () => {
    const result = await resolveRoleForEmail("stranger@example.org", orm);
    expect(result.role).toBe("analyst");
    expect(result.bootstrapped).toBe(false);
  });

  it("returns the explicitly assigned role", async () => {
    await orm.insert(adminRoles).values({
      id: "role_stranger",
      email: "stranger@example.org",
      role: "field_worker",
      grantedBy: "first@example.org",
      grantedAt: "2026-01-01T00:00:00.000Z",
      active: 1,
    });
    const result = await resolveRoleForEmail("stranger@example.org", orm);
    expect(result.role).toBe("field_worker");
    expect(result.bootstrapped).toBe(false);
  });

  it("does not bootstrap a second time", async () => {
    const before = (await orm.select().from(adminRoles).all()).length;
    await resolveRoleForEmail("third@example.org", orm);
    const after = (await orm.select().from(adminRoles).all()).length;
    expect(after).toBe(before);
  });

  it("falls back to read-only for an unknown stored role", async () => {
    await orm.insert(adminRoles).values({
      id: "role_bogus",
      email: "bogus@example.org",
      role: "superuser",
      grantedBy: "first@example.org",
      grantedAt: "2026-01-01T00:00:00.000Z",
      active: 1,
    });
    const result = await resolveRoleForEmail("bogus@example.org", orm);
    expect(result.role).toBe("analyst");
  });
});
