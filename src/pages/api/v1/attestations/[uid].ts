import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { attestations, attestationChainRefs } from "@lib/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@lib/api";

export const GET: APIRoute = async ({ params, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const uid = params.uid as string;
    const ref = await db.select().from(attestationChainRefs).where(eq(attestationChainRefs.uid, uid)).get();
    if (!ref) return err("Not found", 404);
    const att = await db.select().from(attestations).where(eq(attestations.id, ref.attestationId)).get();
    return ok({ ...ref, attestation: att });
  } catch (e) {
    return err(String(e), 500);
  }
};
