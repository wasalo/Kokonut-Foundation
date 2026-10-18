import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { reports, reportTemplates, auditLog } from "@lib/schema";
import { ok, err } from "@lib/api";
import { id, nowIso, slugify } from "@lib/utils";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  let data: any = {};
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) data = await request.json();
  else { const fd = await request.formData(); fd.forEach((v, k) => { data[k] = String(v); }); }
  const title = (data.title ?? "").trim();
  if (!title) return err("title required", 400);

  const db = getDb(env);
  const slug = data.slug ? slugify(data.slug) : slugify(title);
  const reportId = id("rep_");
  const documentKey = data.documentKey ?? `reports/${slug}.html`;
  // If template provided, render (minimal: store template body as content)
  let body = data.body ?? "";
  if (data.templateSlug) {
    const tmpl = await db.select().from(reportTemplates).where(eq(reportTemplates.slug, data.templateSlug)).get();
    if (tmpl) body = (tmpl as any).body;
  }
  if (env.MEDIA && body) {
    await env.MEDIA.put(documentKey, body, { httpMetadata: { contentType: "text/html" } });
  }
  await db.insert(reports).values({
    id: reportId,
    slug,
    title,
    summary: data.summary ?? null,
    reportType: data.reportType ?? "Automated",
    projectId: data.projectId ?? null,
    periodStart: data.periodStart ?? null,
    periodEnd: data.periodEnd ?? null,
    publishedAt: data.publishedAt ?? nowIso(),
    documentKey,
    authors: JSON.stringify(data.authors ?? ["Kokonut Foundation"]),
    visibility: data.visibility ?? "public",
  });
  await db.insert(auditLog).values({
    id: id("aud_"),
    actor: "admin",
    action: "generate_report",
    entityType: "report",
    entityId: reportId,
    after: JSON.stringify({ title, slug, documentKey }),
    timestamp: nowIso(),
  });
  return ok({ id: reportId, slug, documentKey });
};
