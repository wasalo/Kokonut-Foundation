import type { APIRoute } from "astro";
import { ok, err } from "@lib/api";

/** Product events tracked by the public site (PRD §88). */
export const TRACKED_EVENTS = [
  "home_view",
  "project_view",
  "impact_view",
  "farms_view",
  "transparency_view",
  "treasury_view",
  "attestations_view",
  "reports_view",
  "evidence_view",
  "resources_view",
  "partners_view",
  "about_view",
  "support_view",
  "contact_view",
  "data_view",
  "api_docs_view",
  "graph_view",
  "search_view",
] as const;

export const EVENT_LABELS: Record<string, string> = {
  home_view: "Home views",
  project_view: "Project detail views",
  impact_view: "Impact explorer views",
  farms_view: "Farm explorer views",
  transparency_view: "Transparency portal views",
  treasury_view: "Treasury views",
  attestations_view: "Attestation views",
  reports_view: "Report views",
  evidence_view: "Evidence browser views",
  resources_view: "Resource views",
  partners_view: "Partner views",
  about_view: "About views",
  support_view: "Support views",
  contact_view: "Contact views",
  data_view: "Data hub views",
  api_docs_view: "API docs views",
  graph_view: "Evidence graph views",
  search_view: "Search views",
};

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  const kv = env.CONFIG as KVNamespace | undefined;
  if (!kv) return err("KV not configured", 503);

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const rows = await Promise.all(
    TRACKED_EVENTS.map(async (event) => {
      const todayKey = `ev:${event}:${today}`;
      const weekKey = `ev:${event}:${weekAgo}`;
      const [todayCount, weekCount] = await Promise.all([
        kv.get(todayKey).then((v) => Number(v ?? 0)),
        kv.get(weekKey).then((v) => Number(v ?? 0)),
      ]);
      return { event, label: EVENT_LABELS[event] ?? event, today: todayCount, sevenDaysAgo: weekCount };
    }),
  );

  const totals = rows.reduce(
    (acc, r) => ({ today: acc.today + r.today, sevenDaysAgo: acc.sevenDaysAgo + r.sevenDaysAgo }),
    { today: 0, sevenDaysAgo: 0 },
  );

  return ok({ date: today, totals, events: rows });
};
