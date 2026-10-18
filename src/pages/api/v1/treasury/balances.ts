import type { APIRoute } from "astro";
import { getDb } from "@lib/db";
import { wallets } from "@lib/schema";
import { ok, err } from "@lib/api";

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return err("DB not configured", 503);
  try {
    const db = getDb(env);
    const rpcUrl = (env as any).ETH_RPC_URL ?? "https://cloudflare-eth.com";
    const walletRows = await db.select().from(wallets);
    const results = await Promise.all(
      (walletRows as any[]).map(async (w: any) => {
        let balance = null;
        try {
          const res = await fetch(rpcUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getBalance", params: [w.address, "latest"] }),
          });
          const data = (await res.json()) as any;
          if (data.result) balance = parseInt(data.result, 16) / 1e18;
        } catch {}
        return { ...w, balance };
      }),
    );
    return ok(results, { count: results.length });
  } catch (e) {
    return err(String(e), 500);
  }
};
