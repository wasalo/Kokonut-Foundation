import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { projects, metrics, resources, partners, reports } from "@lib/schema";
import { ok, err } from "@lib/api";

export const GET: APIRoute = async ({ locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  if (!q) return err("Missing q", 400);
  try {
    const db = getDb(env);
    const results: any[] = [];
    const ps = await db.select().from(projects);
    for (const p of ps as any[]) if (p.name?.toLowerCase().includes(q) || p.summary?.toLowerCase().includes(q)) results.push({ type: "project", slug: p.slug, title: p.name });
    const ms = await db.select().from(metrics);
    for (const m of ms as any[]) if (m.name?.toLowerCase().includes(q)) results.push({ type: "metric", slug: m.slug, title: m.name });
    const rs = await db.select().from(resources);
    for (const r of rs as any[]) if (r.title?.toLowerCase().includes(q)) results.push({ type: "resource", slug: r.slug, title: r.title });
    const pas = await db.select().from(partners);
    for (const p of pas as any[]) if (p.name?.toLowerCase().includes(q)) results.push({ type: "partner", slug: p.slug, title: p.name });
    const reps = await db.select().from(reports);
    for (const r of reps as any[]) if (r.title?.toLowerCase().includes(q)) results.push({ type: "report", slug: r.slug, title: r.title });
    return ok(results, { count: results.length, q });
  } catch (e) {
    return err(String(e), 500);
  }
};
