import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { wallets, treasuryEntries, treasuryTransactions } from "@lib/schema";
import { ok, err } from "@lib/api";

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const walletsRows = await db.select().from(wallets);
    const stored = await db.select().from(treasuryEntries);
    const onchain = await db.select().from(treasuryTransactions);
    const mismatches: any[] = [];
    for (const w of walletsRows as any[]) {
      const storedSum = stored.filter((e: any) => e.walletId === w.id).reduce((a: number, e: any) => a + (e.valueUsd ?? 0), 0);
      const onchainSum = onchain.filter((t: any) => t.walletId === w.id).reduce((a: number, t: any) => a + (t.valueUsd ?? 0), 0);
      if (Math.abs(storedSum - onchainSum) > 0.01) {
        mismatches.push({ walletId: w.id, label: w.label, storedSum, onchainSum, diff: storedSum - onchainSum });
      }
    }
    return ok({ wallets: walletsRows.length, storedCount: stored.length, onchainCount: onchain.length, mismatches });
  } catch (e) {
    return err(String(e), 500);
  }
};
