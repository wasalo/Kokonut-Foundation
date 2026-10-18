import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { treasuryTransactions, wallets } from "@lib/schema";
import { ok, err } from "@lib/api";

export const GET: APIRoute = async ({ locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const walletId = url.searchParams.get("walletId");
    let rows = await db.select().from(treasuryTransactions);
    if (walletId) rows = rows.filter((r: any) => r.walletId === walletId);
    return ok(rows, { count: rows.length });
  } catch (e) {
    return err(String(e), 500);
  }
};
