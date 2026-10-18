import { describe, it, expect } from "vitest";
import { json, ok, err } from "@lib/api";

describe("api", () => {
  it("json sets content-type", async () => {
    const r = json({ a: 1 }, 201);
    expect(r.status).toBe(201);
    expect(await r.json()).toEqual({ a: 1 });
  });
  it("ok wraps data", async () => {
    const r = ok({ x: 2 }, { count: 1 });
    const body = (await r.json()) as any;
    expect(body.data).toEqual({ x: 2 });
    expect(body.meta).toEqual({ count: 1 });
  });
  it("err", async () => {
    const r = err("bad", 400);
    expect(r.status).toBe(400);
    expect(((await r.json()) as any).error).toBe("bad");
  });
});
