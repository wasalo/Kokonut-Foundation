import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { reports, auditLog } from "@lib/schema";
import { ok, err } from "@lib/api";
import { id, nowIso, slugify } from "@lib/utils";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "reports.publish");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  let data: any = {};
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) data = await request.json();
  else {
    const fd = await request.formData();
    fd.forEach((v, k) => { data[k] = String(v); });
  }
  const title = (data.title ?? "").trim();
  const documentKey = (data.documentKey ?? "").trim();
  if (!title || !documentKey) return err("title and documentKey required", 400);

  const db = getDb(env);
  const slug = data.slug ? slugify(data.slug) : slugify(title);
  const reportId = id("rep_");

  // Prefer the durable Workflow when the binding is available.
  if (env.PUBLISH_REPORT) {
    const instance = await env.PUBLISH_REPORT.create({
      params: { title, slug, summary: data.summary ?? null, reportType: data.reportType ?? "Report", projectId: data.projectId ?? null, documentKey, visibility: data.visibility ?? "public" },
    });
    return ok({ id: instance.id, slug, workflow: true });
  }

  await db.insert(reports).values({
    id: reportId,
    slug,
    title,
    summary: data.summary ?? null,
    reportType: data.reportType ?? "Report",
    projectId: data.projectId ?? null,
    periodStart: data.periodStart ?? null,
    periodEnd: data.periodEnd ?? null,
    publishedAt: data.publishedAt ?? nowIso(),
    documentKey,
    authors: JSON.stringify(data.authors ?? []),
    visibility: data.visibility ?? "public",
  });
  await db.insert(auditLog).values({
    id: id("aud_"),
    actor: actorOf(locals),
    action: "publish_report",
    entityType: "report",
    entityId: reportId,
    after: JSON.stringify({ title, slug, documentKey }),
    timestamp: nowIso(),
  });
  return ok({ id: reportId, slug });
};
