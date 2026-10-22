/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

interface RuntimeEnv {
  DB: D1Database;
  MEDIA: R2Bucket;
  CONFIG: KVNamespace;
  SYNC_QUEUE?: Queue;
  PUBLISH_REPORT?: Workflow;
  ENVIRONMENT: string;
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET_KEY?: string;
  ADMIN_DEV_BYPASS?: string;
  CF_WEB_ANALYTICS_TOKEN?: string;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  KI_API_URL?: string;
  KI_API_KEY?: string;
  KI_API_EMAIL?: string;
  KI_API_PASSWORD?: string;
  KI_PATH_STYLE?: "directus" | "rest" | "auto";
  KI_COLLECTION_MAP?: string;
  ETH_RPC_URL?: string;
  RESTRICTED_ACCESS_TOKEN?: string;
}

declare global {
  interface Env extends RuntimeEnv {}

  namespace App {
    interface Locals {
      locale?: string;
    }
  }
}

export {};
