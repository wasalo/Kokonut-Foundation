import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { evidence } from "@lib/schema";
import { ok, err } from "@lib/api";
import { id, nowIso } from "@lib/utils";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  if (!env.MEDIA) return err("Storage not configured", 503);
  try {
    const fd = await request.formData();
    const file = fd.get("file") as File | null;
    const title = (fd.get("title") as string) ?? "Evidence";
    const type = (fd.get("type") as string) ?? "Document";
    const projectId = (fd.get("projectId") as string) || null;
    const metricId = (fd.get("metricId") as string) || null;
    const visibility = (fd.get("visibility") as string) || "public";
    if (!file) return err("file required", 400);

    const key = `evidence/${id("")}${file.name}`;
    await env.MEDIA.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });

    const db = getDb(env);
    const evId = id("ev_");
    await db.insert(evidence).values({
      id: evId,
      type,
      title,
      description: (fd.get("description") as string) || null,
      projectId,
      metricId,
      objectKey: key,
      externalUrl: null,
      capturedAt: (fd.get("capturedAt") as string) || null,
      uploadedAt: nowIso(),
      hash: null,
      visibility,
    });
    return ok({ id: evId, objectKey: key });
  } catch (e) {
    return err(String(e), 500);
  }
};
