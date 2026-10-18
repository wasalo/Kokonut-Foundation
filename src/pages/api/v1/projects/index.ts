import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { projects } from "@lib/schema";
import { ok, err } from "@lib/api";
import { parseJson } from "@lib/utils";

export const GET: APIRoute = async ({ locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const sp = url.searchParams;
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(sp.get("pageSize") ?? 20)));
    const status = sp.get("status");
    const country = sp.get("country");
    const sdg = sp.get("sdg");
    const q = sp.get("q");
    const sort = sp.get("sort") ?? "name";

    let rows = await db.select().from(projects);
    if (status) rows = rows.filter((r: any) => r.status === status);
    if (country) rows = rows.filter((r: any) => r.country?.toLowerCase() === country.toLowerCase());
    if (sdg) rows = rows.filter((r: any) => parseJson<number[]>(r.sdgs, []).includes(Number(sdg)));
    if (q) {
      const ql = q.toLowerCase();
      rows = rows.filter((r: any) =>
        r.name?.toLowerCase().includes(ql) || r.summary?.toLowerCase().includes(ql),
      );
    }
    rows.sort((a: any, b: any) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "status") return a.status.localeCompare(b.status);
      if (sort === "country") return (a.country ?? "").localeCompare(b.country ?? "");
      return 0;
    });

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const paged = rows.slice(start, start + pageSize).map((p: any) => ({
      ...p,
      impactAreas: parseJson(p.impactAreas, []),
      sdgs: parseJson(p.sdgs, []),
      partners: parseJson(p.partners, []),
      metrics: parseJson(p.metrics, []),
      milestones: parseJson(p.milestones, []),
      resources: parseJson(p.resources, []),
    }));

    return ok(paged, { page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
  } catch (e) {
    return err(String(e), 500);
  }
};
