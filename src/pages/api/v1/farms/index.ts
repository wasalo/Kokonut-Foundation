import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { farms, projects } from "@lib/schema";
import { ok, err } from "@lib/api";
import { parseJson } from "@lib/utils";

export const GET: APIRoute = async ({ locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const sp = url.searchParams;
    const projectId = sp.get("projectId");
    const country = sp.get("country");
    const q = sp.get("q");
    const bbox = sp.get("bbox"); // minLng,minLat,maxLng,maxLat
    let rows = await db.select().from(farms);
    if (projectId) rows = rows.filter((r: any) => r.projectId === projectId);
    if (country) rows = rows.filter((r: any) => r.country?.toLowerCase() === country.toLowerCase());
    if (q) {
      const ql = q.toLowerCase();
      rows = rows.filter((r: any) => r.name?.toLowerCase().includes(ql));
    }
    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox.split(",").map(Number);
      rows = rows.filter((r: any) =>
        r.longitude >= minLng && r.longitude <= maxLng && r.latitude >= minLat && r.latitude <= maxLat,
      );
    }
    return ok(rows, { count: rows.length });
  } catch (e) {
    return err(String(e), 500);
  }
};
