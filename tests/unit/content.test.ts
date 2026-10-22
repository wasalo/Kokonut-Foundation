import { describe, it, expect } from "vitest";
import { parseBlockBody, toParagraphs, toFields } from "@lib/content";

describe("content block bodies", () => {
  it("treats plain text as text", () => {
    const parsed = parseBlockBody("Just a sentence.");
    expect(parsed.kind).toBe("text");
    expect(parsed.json).toBeNull();
  });

  it("parses a JSON object", () => {
    const parsed = parseBlockBody('{"land_size":4200}');
    expect(parsed.kind).toBe("json");
    expect(parsed.json).toEqual({ land_size: 4200 });
  });

  it("falls back to text when the body only looks like JSON", () => {
    const parsed = parseBlockBody('{"land_size":');
    expect(parsed.kind).toBe("text");
  });

  it("treats a JSON array as text", () => {
    const parsed = parseBlockBody("[1, 2, 3]");
    expect(parsed.kind).toBe("text");
  });

  it("splits text into paragraphs on blank lines", () => {
    expect(toParagraphs("One.\n\nTwo.\n\n\nThree.")).toEqual(["One.", "Two.", "Three."]);
  });

  it("returns no paragraphs for empty text", () => {
    expect(toParagraphs("   ")).toEqual([]);
  });

  it("turns a JSON body into readable fields", () => {
    const fields = toFields({ land_size: 4200, public_nouns: "Mango" });
    expect(fields[0]).toEqual({ label: "Land Size", value: "4200" });
    expect(fields[1]).toEqual({ label: "Public Nouns", value: "Mango" });
  });

  it("renders a missing value as a dash", () => {
    const fields = toFields({ value: null });
    expect(fields[0].value).toBe("—");
  });
});
