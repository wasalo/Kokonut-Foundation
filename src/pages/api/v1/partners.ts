import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { partners } from "@lib/schema";
import { ok, err } from "@lib/api";

export const GET: APIRoute = async ({ locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const sp = url.searchParams;
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(sp.get("pageSize") ?? 20)));
    const type = sp.get("type");
    const q = sp.get("q");
    let rows = await db.select().from(partners);
    if (type) rows = rows.filter((r: any) => r.type === type);
    if (q) {
      const ql = q.toLowerCase();
      rows = rows.filter((r: any) => r.name?.toLowerCase().includes(ql));
    }
    const total = rows.length;
    const start = (page - 1) * pageSize;
    const paged = rows.slice(start, start + pageSize);
    return ok(paged, { page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
  } catch (e) {
    return err(String(e), 500);
  }
};
