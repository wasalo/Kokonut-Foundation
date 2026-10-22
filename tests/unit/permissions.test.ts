import { describe, it, expect } from "vitest";
import {
  ROLES,
  ROLE_CAPABILITIES,
  ENTITIES,
  ACTIONS,
  can,
  canAny,
  isRole,
  normalizeRole,
  capabilityFor,
  type Capability,
  type Role,
} from "../../src/lib/permissions";
import { requiredCapability, denyUnless } from "../../src/lib/admin-guard";

describe("role matrix", () => {
  it("defines every role", () => {
    expect(ROLES.length).toBe(6);
    for (const r of ROLES) expect(ROLE_CAPABILITIES[r]).toBeDefined();
  });

  it("gives no role a capability the administrator lacks", () => {
    const admin = new Set(ROLE_CAPABILITIES.administrator);
    for (const r of ROLES) {
      for (const c of ROLE_CAPABILITIES[r]) {
        expect(admin.has(c), `${r} has ${c} which the administrator lacks`).toBe(true);
      }
    }
  });

  it("gives the administrator every entity action plus the platform capabilities", () => {
    const admin = new Set<Capability>(ROLE_CAPABILITIES.administrator);
    for (const e of ENTITIES) {
      for (const a of ACTIONS) expect(admin.has(`${e}.${a}`)).toBe(true);
    }
    for (const c of ["access.admin", "access.roles", "access.audit", "access.analytics", "access.sync"]) {
      expect(admin.has(c as Capability)).toBe(true);
    }
  });

  it("keeps the analyst strictly read-only", () => {
    expect(can("analyst", "projects.read")).toBe(true);
    expect(can("analyst", "projects.update")).toBe(false);
    expect(can("analyst", "projects.delete")).toBe(false);
    expect(can("analyst", "projects.create")).toBe(false);
    expect(can("analyst", "evidence.publish")).toBe(false);
  });

  it("lets the field worker record measurements and evidence but not delete projects", () => {
    expect(can("field_worker", "measurements.create")).toBe(true);
    expect(can("field_worker", "evidence.create")).toBe(true);
    expect(can("field_worker", "farms.update")).toBe(true);
    expect(can("field_worker", "projects.delete")).toBe(false);
    expect(can("field_worker", "access.roles")).toBe(false);
  });

  it("keeps finance out of the content pipeline", () => {
    expect(can("finance", "funding.update")).toBe(true);
    expect(can("finance", "reports.publish")).toBe(true);
    expect(can("finance", "projects.update")).toBe(false);
    expect(can("finance", "evidence.delete")).toBe(false);
  });

  it("lets the manager run content but not manage roles", () => {
    expect(can("manager", "projects.create")).toBe(true);
    expect(can("manager", "reports.publish")).toBe(true);
    expect(can("manager", "access.roles")).toBe(false);
    expect(can("manager", "access.sync")).toBe(false);
  });

  it("never grants role management outside the administrator role", () => {
    for (const r of ROLES) {
      if (r === "administrator") continue;
      expect(can(r, "access.roles"), `${r} must not manage roles`).toBe(false);
    }
  });

  it("keeps destructive media and attestation actions with the administrator", () => {
    expect(can("manager", "media.delete")).toBe(false);
    expect(can("manager", "attestations.delete")).toBe(false);
    expect(can("finance", "funding.delete")).toBe(false);
    expect(can("supervisor", "media.delete")).toBe(false);
    expect(can("administrator", "media.delete")).toBe(true);
    expect(can("administrator", "attestations.delete")).toBe(true);
    expect(can("administrator", "funding.delete")).toBe(true);
  });

  it("gives finance the funding write path and nobody else", () => {
    expect(can("finance", "funding.create")).toBe(true);
    expect(can("finance", "funding.update")).toBe(true);
    expect(can("manager", "funding.create")).toBe(false);
    expect(can("analyst", "funding.update")).toBe(false);
  });

  it("contains no duplicate capabilities in a role", () => {
    for (const r of ROLES) {
      const list = ROLE_CAPABILITIES[r];
      expect(new Set(list).size, `${r} has duplicate capabilities`).toBe(list.length);
    }
  });
});

describe("capability lookup", () => {
  it("maps HTTP methods to entity actions", () => {
    expect(capabilityFor("projects", "GET")).toBe("projects.read");
    expect(capabilityFor("projects", "POST")).toBe("projects.create");
    expect(capabilityFor("projects", "PUT")).toBe("projects.update");
    expect(capabilityFor("projects", "PATCH")).toBe("projects.update");
    expect(capabilityFor("projects", "DELETE")).toBe("projects.delete");
  });

  it("maps admin routes to their entity", () => {
    expect(requiredCapability("/api/admin/projects", "POST")).toBe("projects.create");
    expect(requiredCapability("/api/admin/farms", "DELETE")).toBe("farms.delete");
    expect(requiredCapability("/api/admin/evidence/upload", "POST")).toBe("evidence.create");
  });

  it("treats an unknown route as projects", () => {
    expect(requiredCapability("/api/admin/whatever", "GET")).toBe("projects.read");
  });
});

describe("role normalization", () => {
  it("recognises known roles", () => {
    expect(isRole("manager")).toBe(true);
    expect(isRole("root")).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });

  it("falls back to a read-only role for unknown values", () => {
    expect(normalizeRole("root")).toBe("analyst");
    expect(normalizeRole(null)).toBe("analyst");
  });

  it("denies everything for a missing role", () => {
    expect(can(null, "projects.read")).toBe(false);
    expect(can(undefined, "access.admin")).toBe(false);
    expect(canAny(null, ["projects.read"])).toBe(false);
  });
});

describe("request guard", () => {
  it("allows a capability the role holds", () => {
    const locals = { admin: { email: "a@b.c", role: "manager", capabilities: [] } };
    expect(denyUnless(locals, "projects.create")).toBeNull();
  });

  it("denies a capability the role lacks with a 403", () => {
    const locals = { admin: { email: "a@b.c", role: "analyst", capabilities: [] } };
    const res = denyUnless(locals, "projects.delete");
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });

  it("denies when there is no actor at all", () => {
    const res = denyUnless({}, "projects.read");
    expect(res!.status).toBe(403);
  });
});
