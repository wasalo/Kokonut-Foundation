import { defineMiddleware } from "astro:middleware";
import { verifyAccessJwt } from "@lib/access";

/**
 * Verifies the request is authorized for admin surfaces.
 * Uses a full Cloudflare Access JWT check (signature, aud, expiry) when
 * ACCESS_TEAM_DOMAIN + ACCESS_AUD are configured. In production the absence of
 * those settings is a hard deny — a present-but-unverified header is not enough.
 */
async function isAuthorizedAdmin(request: Request, env: any): Promise<boolean> {
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) return false;

  const teamDomain = env.ACCESS_TEAM_DOMAIN;
  const audience = env.ACCESS_AUD;
  if (!teamDomain || !audience) {
    // Unconfigured: allow only outside production so local preview still works.
    return env.ENVIRONMENT !== "production";
  }

  const result = await verifyAccessJwt(token, { teamDomain, audience });
  return result.valid;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, locals } = context;
  const pathname = url.pathname;

  // Admin gate
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const env = (locals as any).runtime?.env ?? {};
    const bypass = env.ADMIN_DEV_BYPASS === "true";
    if (!bypass) {
      const ok = await isAuthorizedAdmin(context.request, env);
      if (!ok) {
        return new Response("Unauthorized", { status: 401 });
      }
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

  const response = await next();
  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https:; connect-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://unpkg.com https://cdn.jsdelivr.net https://easscan.org; frame-src https://challenges.cloudflare.com;");
  return response;
});
