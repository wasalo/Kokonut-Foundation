import { App } from "astro/app";
import { handle } from "@astrojs/cloudflare/handler";
import { getDb } from "./lib/db";
import { syncJobs, auditLog } from "./lib/schema";
import { eq } from "drizzle-orm";
import { id, nowIso } from "./lib/utils";

export function createExports(manifest: any) {
  const app = new App(manifest);
  const fetch = async (request: any, env: any, context: any) => {
    return await handle(manifest, app, request, env, context);
  };
  const queue = async (batch: MessageBatch<any>, env: any, ctx: ExecutionContext) => {
    for (const msg of batch.messages) {
      try {
        const job = msg.body as { source?: string; id?: string };
        if (env?.DB) {
          const db = getDb(env);
          if (job?.id) {
            await db.update(syncJobs).set({ status: "completed", finishedAt: nowIso(), details: "processed by queue consumer" }).where(eq(syncJobs.id, job.id));
          }
        }
        msg.ack();
      } catch (e) {
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
  };
}
