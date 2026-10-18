import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { wallets, treasuryEntries } from "@lib/schema";
import { ok, err } from "@lib/api";

export const GET: APIRoute = async ({ locals, url }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const sp = url.searchParams;
    const walletId = sp.get("walletId");
    const projectId = sp.get("projectId");
    const walletsRows = await db.select().from(wallets);
    let entries = await db.select().from(treasuryEntries);
    if (walletId) entries = entries.filter((e: any) => e.walletId === walletId);
    if (projectId) entries = entries.filter((e: any) => e.projectId === projectId);
    const summary = entries.reduce((acc: any, e: any) => {
      acc.totalUsd = (acc.totalUsd ?? 0) + (e.valueUsd ?? 0);
      acc.count = (acc.count ?? 0) + 1;
      return acc;
    }, { totalUsd: 0, count: 0 });
    return ok({ wallets: walletsRows, entries, summary });
  } catch (e) {
    return err(String(e), 500);
  }
};
