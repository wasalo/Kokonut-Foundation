import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { reports, evidence } from "@lib/schema";
import { eq } from "drizzle-orm";
import { err } from "@lib/api";

export const GET: APIRoute = async ({ params, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  const type = params.type as string;
  const slug = params.slug as string;

  let objectKey: string | null = null;
  let visibility = "public";
  let contentType = "application/octet-stream";
  let filename = slug;

  try {
    if (!env.DB) return err("DB not configured", 503);
    const db = getDb(env);
    if (type === "reports") {
      const row = await db.select().from(reports).where(eq(reports.slug, slug)).get();
      if (!row) return err("Not found", 404);
      objectKey = row.documentKey;
      visibility = row.visibility;
      filename = `${row.slug}.pdf`;
      contentType = "application/pdf";
    } else if (type === "evidence") {
      const row = await db.select().from(evidence).where(eq(evidence.id, slug)).get();
      if (!row) return err("Not found", 404);
      objectKey = row.objectKey ?? null;
      visibility = row.visibility;
      filename = row.title;
      if (row.externalUrl && !objectKey) return Response.redirect(row.externalUrl, 302);
    } else {
      return err("Unknown type", 400);
    }
  } catch (e) {
    return err(String(e), 500);
  }

  if (visibility !== "public") return err("Restricted", 403);
  if (!objectKey) return err("No file", 404);
  if (!env.MEDIA) return err("Storage not configured", 503);

  try {
    const obj = await env.MEDIA.get(objectKey);
    if (!obj) return err("File not found", 404);
    const headers = new Headers();
    headers.set("Content-Type", obj.httpMetadata?.contentType ?? contentType);
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Cache-Control", "public, max-age=3600");
    return new Response(obj.body, { status: 200, headers });
  } catch (e) {
    return err(String(e), 500);
  }
};
