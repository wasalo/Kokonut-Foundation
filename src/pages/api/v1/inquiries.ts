import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { inquiries } from "@lib/schema";
import { ok, err } from "@lib/api";
import { verifyTurnstile } from "@lib/turnstile";
import { id, nowIso } from "@lib/utils";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  const ip = request.headers.get("cf-connecting-ip") ?? undefined;

  let data: Record<string, string> = {};
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    data = await request.json();
  } else {
    const fd = await request.formData();
    fd.forEach((v, k) => { data[k] = String(v); });
  }

  const token = data["cf-turnstile-response"] || data["turnstileToken"];
  const okTurnstile = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip);
  if (!okTurnstile) return err("Turnstile verification failed", 400);

  const name = (data.name ?? "").trim();
  const email = (data.email ?? "").trim();
  const message = (data.message ?? "").trim();
  if (!name || !email || !message) return err("Missing required fields", 400);

  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    await db.insert(inquiries).values({
      id: id("inq_"),
      type: data.type ?? "contact",
      name,
      email,
      organization: data.organization ?? null,
      message,
      status: "new",
      createdAt: nowIso(),
    });
    return ok({ received: true });
  } catch (e) {
    return err(String(e), 500);
  }
};
