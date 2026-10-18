import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { metrics, measurements, evidence, farms, projects, methodologies, sources, naturalAssets, activities, claims, attestations, attestationChainRefs } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";
import { parseJson } from "@lib/utils";

export const GET: APIRoute = async ({ params, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const metric = await db.select().from(metrics).where(eq(metrics.slug, params.slug as string)).get();
    if (!metric) return err("Not found", 404);

    const farm = metric.projectId
      ? (await db.select().from(farms).where(eq(farms.projectId, metric.projectId)).all())[0] ?? null
      : null;
    const project = metric.projectId ? await db.select().from(projects).where(eq(projects.id, metric.projectId)).get() : null;
    const history = await db.select().from(measurements).where(eq(measurements.metricId, metric.id));
    const ev = await db.select().from(evidence).where(eq(evidence.metricId, metric.id));
    const atts = await db.select().from(attestations).where(eq(attestations.metricId, metric.id));
    const attRefs = [];
    for (const a of atts) {
      const refs = await db.select().from(attestationChainRefs).where(eq(attestationChainRefs.attestationId, a.id));
      attRefs.push(...refs.map((r: any) => ({ ...r, attestation: a })));
    }
    const methodology = metric.methodology
      ? await db.select().from(methodologies).where(eq(methodologies.slug, metric.methodology)).get() ?? null
      : null;
    const src = metric.source
      ? await db.select().from(sources).where(eq(sources.slug, metric.source)).get() ?? null
      : null;
    const assets = metric.projectId ? await db.select().from(naturalAssets).where(eq(naturalAssets.projectId, metric.projectId)) : [];
    const acts = metric.projectId ? await db.select().from(activities).where(eq(activities.projectId, metric.projectId)) : [];
    const cls = metric.projectId ? await db.select().from(claims).where(eq(claims.projectId, metric.projectId)) : [];

    const chain = [
      { node: "metric", data: { ...metric, evidenceIds: parseJson(metric.evidenceIds, []) } },
      ...(farm ? [{ node: "farm", data: farm }] : []),
      ...(project ? [{ node: "project", data: { slug: project.slug, name: project.name } }] : []),
      ...history.map((h: any) => ({ node: "measurement", data: h })),
      ...ev.map((e: any) => ({ node: "evidence", data: e })),
      ...(methodology ? [{ node: "methodology", data: methodology }] : []),
      ...attRefs.map((r: any) => ({ node: "attestation", data: r })),
      ...(src ? [{ node: "source", data: src }] : []),
      ...assets.map((a: any) => ({ node: "natural_asset", data: a })),
      ...acts.map((a: any) => ({ node: "activity", data: a })),
      ...cls.map((c: any) => ({ node: "claim", data: c })),
    ];

    return ok({ metric: metric.slug, chain });
  } catch (e) {
    return err(String(e), 500);
  }
};
