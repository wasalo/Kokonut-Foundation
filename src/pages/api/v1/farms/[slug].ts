import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { farms, projects, metrics } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";

export const GET: APIRoute = async ({ params, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const row = await db.select().from(farms).where(eq(farms.slug, params.slug as string)).get();
    if (!row) return err("Not found", 404);
    const project = row.projectId ? await db.select().from(projects).where(eq(projects.id, row.projectId)).get() : null;
    const farmMetrics = row.projectId ? await db.select().from(metrics).where(eq(metrics.projectId, row.projectId)) : [];
    return ok({ ...row, project: project ? { slug: project.slug, name: project.name } : null, metrics: farmMetrics });
  } catch (e) {
    return err(String(e), 500);
  }
};
