import { describe, it, expect } from "vitest";
import { slugify, parseJson, formatDate, nowIso, id } from "@lib/utils";

describe("utils-extra", () => {
  it("slugify handles special chars", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
    expect(slugify("  A  B  ")).toBe("a-b");
    expect(slugify("")).toBe("");
  });
  it("parseJson handles arrays", () => {
    expect(parseJson("[1,2,3]", [])).toEqual([1, 2, 3]);
    expect(parseJson("", [5])).toEqual([5]);
    expect(parseJson(undefined as any, "x")).toBe("x");
  });
  it("formatDate UTC", () => {
    expect(formatDate("2025-06-15T12:00:00Z")).toContain("2025");
  });
  it("id prefixes", () => {
    expect(id("proj_")).toMatch(/^proj_/);
    expect(id()).toBeTruthy();
  });
  it("nowIso is ISO", () => {
    expect(nowIso()).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
