import { describe, it, expect } from "vitest";
import { mapProject, mapMetric } from "@lib/ki-mapping";

describe("ki-mapping", () => {
  it("mapProject", () => {
    const p = mapProject({ id: 1, name: "Adelphi", country: "DR", sdgs: [2, 13] });
    expect(p.slug).toBe("adelphi");
    expect(p.name).toBe("Adelphi");
    expect(JSON.parse(p.sdgs)).toEqual([2, 13]);
  });
  it("mapMetric", () => {
    const m = mapMetric({ id: 2, name: "Trees", value: 96, unit: "trees", category: "Agriculture" }, "proj_1");
    expect(m.name).toBe("Trees");
    expect(m.value).toBe(96);
    expect(m.projectId).toBe("proj_1");
    expect(m.source).toBe("Kokonut Intelligence");
  });
});
