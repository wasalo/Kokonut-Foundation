import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, locals } = context;
  const pathname = url.pathname;

  // Admin gate
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const env = (locals as any).runtime?.env ?? {};
    const bypass = env.ADMIN_DEV_BYPASS === "true";
    const hasAccessJwt = Boolean(context.request.headers.get("cf-access-jwt-assertion"));
    if (!bypass && !hasAccessJwt) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  // Redirects (D1-backed) - best-effort
  try {
    const env = (locals as any).runtime?.env;
    if (env?.DB) {
      const row = (await env.DB.prepare("SELECT to_path, status_code FROM redirects WHERE from_path = ?")
        .bind(pathname)
        .first()) as { to_path: string; status_code: number } | null;
      if (row) {
        const code = (row.status_code === 302 ? 302 : 301) as 301 | 302;
        return context.redirect(row.to_path, code);
      }
    }
  } catch {
    // ignore
  }

  // Rate limiting (KV-based, best-effort)
  try {
    const env = (locals as any).runtime?.env;
    const kv = env?.CONFIG as KVNamespace | undefined;
    if (kv && pathname.startsWith("/api/")) {
      const ip = context.request.headers.get("cf-connecting-ip") ?? "unknown";
      const bucket = pathname.startsWith("/api/admin") ? "admin" : pathname.startsWith("/api/v1/downloads") ? "download" : pathname.startsWith("/api/v1/inquiries") ? "inquiry" : "api";
      const limits: Record<string, number> = { admin: 30, download: 20, inquiry: 10, api: 120 };
      const limit = limits[bucket];
      const windowSec = 60;
      const key = `rl:${bucket}:${ip}:${Math.floor(Date.now() / (windowSec * 1000))}`;
      const current = Number((await kv.get(key)) ?? "0");
      if (current >= limit) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": String(windowSec) },
        });
      }
      await kv.put(key, String(current + 1), { expirationTtl: windowSec });
    }
  } catch {
    // ignore rate limit errors
  }

  return next();
});
