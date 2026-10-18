import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { projects, metrics, farms, milestones, evidence, attestations, resources } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";
import { parseJson } from "@lib/utils";

export const GET: APIRoute = async ({ params, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const project = await db.select().from(projects).where(eq(projects.slug, params.slug as string)).get();
    if (!project) return err("Not found", 404);
    const ms = await db.select().from(metrics).where(eq(metrics.projectId, project.id));
    const farmRows = await db.select().from(farms).where(eq(farms.projectId, project.id));
    const miles = await db.select().from(milestones).where(eq(milestones.projectId, project.id));
    const ev = await db.select().from(evidence).where(eq(evidence.projectId, project.id));
    const atts = await db.select().from(attestations).where(eq(attestations.projectId, project.id));
    const res = await db.select().from(resources).where(eq(resources.projectId, project.id));
    return ok({
      project: { ...project, impactAreas: parseJson(project.impactAreas, []), sdgs: parseJson(project.sdgs, []), partners: parseJson(project.partners, []), metrics: parseJson(project.metrics, []), milestones: parseJson(project.milestones, []), resources: parseJson(project.resources, []) },
      metrics: ms.map((m: any) => ({ ...m, evidenceIds: parseJson(m.evidenceIds, []) })),
      farms: farmRows,
      milestones: miles,
      evidence: ev,
      attestations: atts,
      resources: res,
    });
  } catch (e) {
    return err(String(e), 500);
  }
};
