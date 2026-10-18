import { describe, it, expect } from "vitest";
import { slugify, parseJson, formatDate, nowIso, id } from "@lib/utils";

describe("utils", () => {
  it("slugify", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
    expect(slugify("  Foo--Bar  ")).toBe("foo-bar");
  });
  it("parseJson fallback", () => {
    expect(parseJson("not json", [1])).toEqual([1]);
    expect(parseJson('{"a":2}', {})).toEqual({ a: 2 });
    expect(parseJson(null, "x")).toBe("x");
  });
  it("formatDate", () => {
    expect(formatDate("2025-01-01T00:00:00Z")).toContain("2025");
  });
  it("nowIso / id", () => {
    expect(nowIso()).toMatch(/^\d{4}-/);
    expect(id("p_")).toMatch(/^p_/);
  });
});
