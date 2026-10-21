import { App } from "astro/app";
import { handle } from "@astrojs/cloudflare/handler";
import { WorkflowEntrypoint } from "cloudflare:workers";
import { getDb } from "./lib/db";
import { syncJobs, auditLog } from "./lib/schema";
import { eq } from "drizzle-orm";
import { id, nowIso } from "./lib/utils";

export class PublishReportWorkflow extends WorkflowEntrypoint {
  async run(event: any, step: any) {
    const params = event.payload ?? {};
    // Step 1: validate
    await step.do("validate", async () => {
      if (!params.title || !params.documentKey) throw new Error("missing fields");
      return { ok: true };
    });
    // Step 2: store (already in R2 by caller; here we just record)
    await step.do("record", async () => {
      const env = this.env as any;
      if (env?.DB) {
        const db = getDb(env);
        const { reports, auditLog } = await import("./lib/schema");
        const { id, nowIso } = await import("./lib/utils");
        await db.insert(reports).values({
          id: id("rep_"),
          slug: (params.slug ?? params.title).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          title: params.title,
          summary: params.summary ?? null,
          reportType: params.reportType ?? "Report",
          projectId: params.projectId ?? null,
          publishedAt: nowIso(),
          documentKey: params.documentKey,
          authors: JSON.stringify(params.authors ?? ["Kokonut Foundation"]),
          visibility: params.visibility ?? "public",
          status: "published",
        });
      }
      return { ok: true };
    });
    // Step 3: audit
    await step.do("audit", async () => {
      const env = this.env as any;
      if (env?.DB) {
        const db = getDb(env);
        const { auditLog } = await import("./lib/schema");
        const { id, nowIso } = await import("./lib/utils");
        await db.insert(auditLog).values({
          id: id("aud_"),
          actor: "workflow",
          action: "publish_report",
          entityType: "report",
          entityId: params.title,
          after: JSON.stringify(params),
          timestamp: nowIso(),
        });
      }
      return { ok: true };
    });
  }
}

const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https:; connect-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://unpkg.com https://cdn.jsdelivr.net https://easscan.org; frame-src https://challenges.cloudflare.com;";

function applySecurityHeaders(headers: Headers) {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  headers.set("Content-Security-Policy", CSP);
}

// Wraps the static-assets binding so prerendered pages also receive security headers
// (Astro middleware does not run for prerendered routes).
function withSecurityHeaders(env: any) {
  if (!env || !env.ASSETS || env.__securityHeadersWrapped) return env;
  const assets = env.ASSETS;
  const patched = {
    ...env,
    __securityHeadersWrapped: true,
    ASSETS: {
      async fetch(input: any, init?: any) {
        const res = await assets.fetch(input, init);
        const headers = new Headers(res.headers);
        applySecurityHeaders(headers);
        return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
      },
    },
  };
  return patched;
}

export function createExports(manifest: any) {
  const app = new App(manifest);
  const fetch = async (request: any, env: any, context: any) => {
    return await handle(manifest, app, request, withSecurityHeaders(env), context);
  };
  const queue = async (batch: MessageBatch<any>, env: any, ctx: ExecutionContext) => {
    for (const msg of batch.messages) {
      try {
        const job = msg.body as { id?: string; source?: string };
        if (job?.source === "kokonut-intelligence" || job?.source === "cron") {
          const { runKiIngest } = await import("./lib/ki-ingest");
          await runKiIngest(env);
        }
        msg.ack();
      } catch (e) {
        if (env?.DB) {
          const db = getDb(env);
          const job = msg.body as { id?: string };
          if (job?.id) {
            await db.update(syncJobs).set({ status: "failed", finishedAt: nowIso(), details: String(e) }).where(eq(syncJobs.id, job.id));
          }
        }
        msg.retry();
      }
    }
  };
  const scheduled = async (event: ScheduledEvent, env: any, ctx: ExecutionContext) => {
    if (env?.SYNC_QUEUE) {
      const jobId = id("sync_");
      if (env?.DB) {
        const db = getDb(env);
        await db.insert(syncJobs).values({ id: jobId, source: "kokonut-intelligence", status: "pending", startedAt: nowIso(), details: "enqueued by cron" });
      }
      await env.SYNC_QUEUE.send({ id: jobId, source: "cron" });
    }
  };
  return {
    default: { fetch, queue, scheduled },
    queue,
    scheduled,
    PublishReportWorkflow,
  };
}
