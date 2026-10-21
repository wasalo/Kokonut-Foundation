import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { treasuryEntries } from "@lib/schema";
import { err } from "@lib/api";
import { csvRow } from "@lib/utils";

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const rows = await db.select().from(treasuryEntries);
    const header = "id,walletId,asset,amount,valueUsd,occurredAt,category,source";
    const lines = rows.map((t: any) => csvRow([t.id, t.walletId, t.asset, t.amount, t.valueUsd, t.occurredAt, t.category, t.source]));
    const csv = [header, ...lines].join("\n");
    return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=treasury.csv" } });
  } catch (e) {
    return err(String(e), 500);
  }
};
