/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

interface RuntimeEnv {
  DB: D1Database;
  MEDIA: R2Bucket;
  CONFIG: KVNamespace;
  SYNC_QUEUE?: Queue;
  ENVIRONMENT: string;
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET_KEY?: string;
  ADMIN_DEV_BYPASS?: string;
}

declare global {
  interface Env extends RuntimeEnv {}
}

export {};
