import type { APIRoute } from "astro";
import { ok, err } from "@lib/api";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  const kv = (env as any).CONFIG as KVNamespace | undefined;
  if (!kv) return err("KV not configured", 503);
  try {
    const body = (await request.json()) as any;
    const event = (body?.event ?? "unknown").toString().slice(0, 64);
    const key = `ev:${event}:${new Date().toISOString().slice(0, 10)}`;
    const current = Number((await kv.get(key)) ?? "0");
    await kv.put(key, String(current + 1), { expirationTtl: 86400 * 30 });
    return ok({ event, count: current + 1 });
  } catch (e) {
    return err(String(e), 500);
  }
};
