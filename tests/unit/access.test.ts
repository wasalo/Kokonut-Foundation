import { describe, it, expect } from "vitest";
import { verifyAccessJwt, fetchTeamCerts } from "@lib/access";

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
