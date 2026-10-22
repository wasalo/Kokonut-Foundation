import type { APIRoute } from "astro";
import { ok, err } from "@lib/api";
import { denyUnless } from "@lib/admin-guard";
import { actorOf } from "@lib/admin-actor";
import { id } from "@lib/utils";

/**
 * Media administration.
 *
 * Media lives in R2 — the object key is the record. Editorial metadata (title,
 * description, alt text, visibility) travels with the object as custom
 * metadata, so there is no second source of truth to drift.
 */

const META_KEYS = ["title", "description", "altText", "visibility"] as const;

interface MediaObject {
  key: string;
  size: number;
  uploaded: string | null;
  contentType: string | null;
  title: string;
  description: string;
  altText: string;
  visibility: string;
}

function toMediaObject(obj: any): MediaObject {
  const meta = obj.customMetadata ?? {};
  return {
    key: obj.key,
    size: obj.size ?? 0,
    uploaded: obj.uploaded ? new Date(obj.uploaded).toISOString() : null,
    contentType: obj.httpMetadata?.contentType ?? null,
    title: meta.title ?? obj.key.split("/").pop() ?? obj.key,
    description: meta.description ?? "",
    altText: meta.altText ?? "",
    visibility: meta.visibility ?? "public",
  };
}

export const GET: APIRoute = async ({ locals, url }) => {
  const denied = denyUnless(locals, "media.read");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.MEDIA) return err("Storage not configured", 503);

  const prefix = url.searchParams.get("prefix") ?? "";
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const listed = await env.MEDIA.list({ prefix, cursor, limit: 200 });
  const objects = (listed.objects ?? []).map(toMediaObject);
  return ok({ objects, truncated: listed.truncated, cursor: listed.truncated ? listed.cursor : null });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = denyUnless(locals, "media.create");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.MEDIA) return err("Storage not configured", 503);

  try {
    const fd = await request.formData();
    const file = fd.get("file") as File | null;
    if (!file) return err("file required", 400);
    const folder = ((fd.get("folder") as string) || "media").replace(/[^a-zA-Z0-9/_-]/g, "");
    const name = (file.name || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${folder}/${id("")}${name}`;

    await env.MEDIA.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
      customMetadata: {
        title: (fd.get("title") as string) || name,
        description: (fd.get("description") as string) || "",
        altText: (fd.get("altText") as string) || "",
        visibility: (fd.get("visibility") as string) || "public",
      },
    });
    return ok({ key });
  } catch (e) {
    return err(String(e), 500);
  }
};

export const PUT: APIRoute = async ({ request, locals, url }) => {
  const denied = denyUnless(locals, "media.update");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.MEDIA) return err("Storage not configured", 503);

  const key = url.searchParams.get("key") ?? "";
  if (!key) return err("key required", 400);

  const existing = await env.MEDIA.head(key);
  if (!existing) return err("object not found", 404);

  const body: any = await request.json().catch(() => ({}));
  const customMetadata: Record<string, string> = { ...(existing.customMetadata ?? {}) };
  for (const field of META_KEYS) {
    if (field in body) customMetadata[field] = String(body[field] ?? "");
  }

  // R2 has no partial-update call, so the object is rewritten with its current
  // bytes and the updated metadata.
  const object = await env.MEDIA.get(key);
  if (!object) return err("object not found", 404);
  await env.MEDIA.put(key, await object.arrayBuffer(), {
    httpMetadata: object.httpMetadata,
    customMetadata,
  });
  return ok({ key, customMetadata });
};

export const DELETE: APIRoute = async ({ locals, url }) => {
  const denied = denyUnless(locals, "media.delete");
  if (denied) return denied;
  const env = (locals as any).runtime?.env ?? {};
  if (!env.MEDIA) return err("Storage not configured", 503);
  const key = url.searchParams.get("key") ?? "";
  if (!key) return err("key required", 400);
  await env.MEDIA.delete(key);
  return ok({ deleted: key, actor: actorOf(locals) });
};
