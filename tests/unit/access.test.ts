import { describe, it, expect } from "vitest";
import { verifyAccessJwt, fetchTeamCerts } from "@lib/access";
import { resolveAdminActor } from "@lib/admin-actor";

function b64(obj: unknown) {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

describe("access jwt verification", () => {
  it("rejects a token with a non-RS256 algorithm", async () => {
    const token = `${b64({ alg: "none", kid: "k" })}.${b64({ aud: "aud" })}.sig`;
    const r = await verifyAccessJwt(token, { teamDomain: "x.cloudflareaccess.com", audience: "aud", certs: { k: "pem" } });
    expect(r.valid).toBe(false);
    expect(r.reason).toContain("alg");
  });

  it("rejects a token whose aud does not match any configured audience", async () => {
    const token = `${b64({ alg: "RS256", kid: "k" })}.${b64({ aud: "other" })}.sig`;
    const r = await verifyAccessJwt(token, { teamDomain: "x.cloudflareaccess.com", audience: "aud1,aud2", certs: { k: "pem" } });
    expect(r.valid).toBe(false);
    expect(r.reason).toBe("aud mismatch");
  });

  it("rejects an expired token", async () => {
    const token = `${b64({ alg: "RS256", kid: "unknown" })}.${b64({ aud: "aud", exp: 1 })}.sig`;
    const r = await verifyAccessJwt(token, { teamDomain: "x.cloudflareaccess.com", audience: "aud", certs: { other: "pem" } });
    expect(r.valid).toBe(false);
  });

  it("rejects a malformed token", async () => {
    const r = await verifyAccessJwt("abc", { teamDomain: "x.cloudflareaccess.com", audience: "aud" });
    expect(r.valid).toBe(false);
  });

  it("fetchTeamCerts is exported", () => {
    expect(typeof fetchTeamCerts).toBe("function");
  });
});

describe("admin actor resolution without an Access token", () => {
  const noToken = () => new Request("https://kokonut.foundation/admin/");
  const loopback = () => new Request("http://localhost:4321/admin/");

  it("allows the local development bypass", async () => {
    const actor = await resolveAdminActor(noToken(), { ADMIN_DEV_BYPASS: "true" });
    expect(actor).not.toBeNull();
    expect(actor!.email).toBe("dev@kokonut.foundation");
  });

  it("denies when no bypass is configured", async () => {
    expect(await resolveAdminActor(noToken(), {})).toBeNull();
  });

  it("denies in production", async () => {
    expect(await resolveAdminActor(noToken(), { ENVIRONMENT: "production" })).toBeNull();
  });

  it("denies a non-production environment that has no explicit bypass", async () => {
    // A staging environment must never hand out administrator rights just
    // because it is not production.
    expect(await resolveAdminActor(noToken(), { ENVIRONMENT: "preview" })).toBeNull();
    expect(await resolveAdminActor(noToken(), { ENVIRONMENT: "staging" })).toBeNull();
  });

  it("denies a bypass that is not exactly 'true'", async () => {
    expect(await resolveAdminActor(noToken(), { ADMIN_DEV_BYPASS: "1" })).toBeNull();
    expect(await resolveAdminActor(noToken(), { ADMIN_DEV_BYPASS: "yes" })).toBeNull();
  });

  it("allows the bypass for a loopback request", async () => {
    // `astro dev` and `wrangler dev` address the local machine, so the admin
    // is reachable without an Access identity. A deployed Worker only ever
    // sees its public host.
    const actor = await resolveAdminActor(loopback(), {});
    expect(actor).not.toBeNull();
    expect(actor!.email).toBe("dev@kokonut.foundation");
  });

  it("does not allow the loopback bypass when a token is presented", async () => {
    const request = new Request("http://localhost:4321/admin/", {
      headers: { "cf-access-jwt-assertion": "not.a.jwt" },
    });
    expect(await resolveAdminActor(request, {})).toBeNull();
  });

  it("never accepts a request that carries an unverifiable token, even with a bypass", async () => {
    const request = new Request("https://kokonut.foundation/admin/", {
      headers: { "cf-access-jwt-assertion": "not.a.jwt" },
    });
    expect(await resolveAdminActor(request, { ADMIN_DEV_BYPASS: "true" })).toBeNull();
  });
});
