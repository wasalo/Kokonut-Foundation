import type { APIRoute } from "astro";
import { json } from "@lib/api";

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  const checks: Record<string, string> = {};
  let healthy = true;

  try {
    await env.DB.prepare("SELECT 1").first();
    checks.db = "ok";
  } catch (e) {
    checks.db = `error: ${String(e)}`;
    healthy = false;
  }

  try {
    await env.CONFIG.get("healthcheck");
    checks.kv = "ok";
  } catch (e) {
    checks.kv = `error: ${String(e)}`;
    healthy = false;
  }

  try {
    await env.MEDIA.head("__healthcheck__");
    checks.r2 = "ok";
  } catch (e) {
    // A missing object is fine; only a binding failure is not.
    checks.r2 = env.MEDIA ? "ok" : `error: ${String(e)}`;
    if (!env.MEDIA) healthy = false;
  }

  return json({ status: healthy ? "ok" : "degraded", checks }, healthy ? 200 : 503);
};
