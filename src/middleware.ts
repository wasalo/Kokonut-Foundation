import { defineMiddleware } from "astro:middleware";
import { resolveAdminActor } from "@lib/admin-actor";

/**
 * Verifies the request is authorized for admin surfaces and resolves the
 * caller's Foundation role.
 *
 * Authentication is Cloudflare Access (PRD §33): a full JWT check (signature,
 * aud, expiry) when ACCESS_TEAM_DOMAIN + ACCESS_AUD are configured. In
 * production the absence of those settings is a hard deny — a
 * present-but-unverified header is not enough. The role behind the verified
 * identity comes from `admin_roles` (PRD §34).
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { url, locals } = context;
  const pathname = url.pathname;

  // Locale routing: /es/<path> is rewritten to the base route and the locale is
  // carried on a request header, so every page is authored once and served in
  // any locale.
  if ((pathname === "/es" || pathname.startsWith("/es/")) && (context.request.method === "GET" || context.request.method === "HEAD")) {
    const stripped = pathname.replace(/^\/es(?=\/|$)/, "") || "/";
    const rewrittenUrl = new URL(url);
    rewrittenUrl.pathname = stripped;
    const headers = new Headers(context.request.headers);
    headers.set("x-kokonut-locale", "es");
    headers.set("x-kokonut-rewritten", "1");
    const rewritten = new Request(rewrittenUrl, { method: context.request.method, headers });
    return await context.rewrite(rewritten);
  }
  locals.locale = "en";

  // Admin gate: Cloudflare Access identity + Foundation role.
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const env = (locals as any).runtime?.env ?? {};
    const actor = await resolveAdminActor(context.request, env);
    if (!actor) {
      const bypass = env.ADMIN_DEV_BYPASS === "true";
      if (!bypass) return new Response("Unauthorized", { status: 401 });
    }
    locals.admin = actor;
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
    const env = (locals as any).runtime?.env ?? {};
    const kv = env.CONFIG as KVNamespace | undefined;
    // A rewritten request re-enters the middleware; do not count it twice.
    const isRewritten = context.request.headers.get("x-kokonut-rewritten") === "1";
    if (kv && !isRewritten && pathname.startsWith("/api/")) {
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

  const response = await next();
  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https:; connect-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://unpkg.com https://cdn.jsdelivr.net https://easscan.org; frame-src https://challenges.cloudflare.com;");
  return response;
});
