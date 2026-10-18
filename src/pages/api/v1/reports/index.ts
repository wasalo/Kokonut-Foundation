import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { reports } from "@lib/schema";
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
    const reportType = sp.get("reportType");
    const projectId = sp.get("projectId");
    const q = sp.get("q");
    let rows = await db.select().from(reports);
    if (reportType) rows = rows.filter((r: any) => r.reportType === reportType);
    if (projectId) rows = rows.filter((r: any) => r.projectId === projectId);
    if (q) {
      const ql = q.toLowerCase();
      rows = rows.filter((r: any) => r.title?.toLowerCase().includes(ql));
    }
    const total = rows.length;
    const start = (page - 1) * pageSize;
    const paged = rows.slice(start, start + pageSize).map((r: any) => ({ ...r, authors: parseJson(r.authors, []), downloadUrl: `/api/v1/downloads/reports/${r.slug}` }));
    return ok(paged, { page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
  } catch (e) {
    return err(String(e), 500);
  }
};
