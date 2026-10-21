import { describe, it, expect } from "vitest";
import { sanitize, csvField, csvRow } from "@lib/utils";
import { verifyAccessJwt } from "@lib/access";

describe("sanitize", () => {
  it("strips control characters and trims", () => {
    expect(sanitize("  hello world  ")).toBe("hello world");
    expect(sanitize("a\nb")).toBe("ab");
  });
  it("caps length", () => {
    expect(sanitize("x".repeat(50), 10)).toHaveLength(10);
  });
  it("handles null/undefined", () => {
    expect(sanitize(null)).toBe("");
    expect(sanitize(undefined)).toBe("");
  });
});

describe("csv", () => {
  it("quotes fields containing commas or quotes", () => {
    expect(csvField("a,b")).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
  });
  it("leaves plain fields unquoted", () => {
    expect(csvField("plain")).toBe("plain");
    expect(csvField(null)).toBe("");
  });
  it("csvRow joins with commas", () => {
    expect(csvRow(["a", "b,c", 1])).toBe('a,"b,c",1');
  });
});

describe("verifyAccessJwt", () => {
  it("rejects malformed tokens", async () => {
    const r = await verifyAccessJwt("not-a-jwt", { teamDomain: "x.cloudflareaccess.com", audience: "aud" });
    expect(r.valid).toBe(false);
  });
  it("rejects a token with an unknown kid", async () => {
    const header = btoa(JSON.stringify({ alg: "RS256", kid: "unknown" }));
    const payload = btoa(JSON.stringify({ aud: "aud", exp: Math.floor(Date.now() / 1000) + 60 }));
    const token = `${header}.${payload}.sig`;
    const r = await verifyAccessJwt(token, {
      teamDomain: "x.cloudflareaccess.com",
      audience: "aud",
      certs: { other: "pem" },
    });
    expect(r.valid).toBe(false);
    expect(r.reason).toContain("kid");
  });
});
