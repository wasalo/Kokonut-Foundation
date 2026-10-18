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

  return next();
});
