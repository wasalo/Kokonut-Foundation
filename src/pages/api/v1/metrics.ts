import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { metrics } from "@lib/schema";
import { ok, err } from "@lib/api";
import { parseJson } from "@lib/utils";

export const GET: APIRoute = async ({ locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const sp = url.searchParams;
    const kv = (env as any).CONFIG as KVNamespace | undefined;
    const cacheKey = "metrics:list";
    const noFilter = !sp.has("category") && !sp.has("projectId") && !sp.has("verificationStatus") && !sp.has("q") && !sp.has("page") && !sp.has("pageSize");
    if (kv && noFilter) {
      const cached = await kv.get(cacheKey);
      if (cached) return new Response(cached, { headers: { "Content-Type": "application/json", "X-Cache": "HIT" } });
    }
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(sp.get("pageSize") ?? 50)));
    const category = sp.get("category");
    const projectId = sp.get("projectId");
    const verificationStatus = sp.get("verificationStatus");
    const q = sp.get("q");

    let rows = await db.select().from(metrics);
    if (category) rows = rows.filter((r: any) => r.category === category);
    if (projectId) rows = rows.filter((r: any) => r.projectId === projectId);
    if (verificationStatus) rows = rows.filter((r: any) => r.verificationStatus === verificationStatus);
    if (q) {
      const ql = q.toLowerCase();
      rows = rows.filter((r: any) => r.name?.toLowerCase().includes(ql));
    }
    const total = rows.length;
    const start = (page - 1) * pageSize;
    const paged = rows.slice(start, start + pageSize).map((m: any) => ({ ...m, evidenceIds: parseJson(m.evidenceIds, []) }));
    const resp = ok(paged, { page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
    if (kv && noFilter) {
      const body = await resp.clone().text();
      await kv.put(cacheKey, body, { expirationTtl: 300 });
    }
    return resp;
  } catch (e) {
    return err(String(e), 500);
  }
};
