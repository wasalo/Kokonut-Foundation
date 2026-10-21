# Kokonut Foundation — Open Follow-Ups

Items that remain open after the implementation passes and the pre-deployment audit.
Each item is either blocked on external resources/credentials, requires manual review, or is incremental content work.

---

## Verified by CI (2026-10-21)

| Check | Result |
|---|---|
| `npm run typecheck` | ✅ clean |
| `npm test` (vitest) | ✅ 23 tests / 5 files |
| `npm run test:e2e` (Playwright chromium) | ✅ 10 tests / 3 files |
| `npm run build` | ✅ server bundle + Cloudflare adapter |
| Lighthouse `/` | ✅ performance 1.00 · accessibility 1.00 · best-practices 1.00 · SEO 1.00 |
| Lighthouse `/projects` | ✅ performance 1.00 · accessibility 1.00 · best-practices 1.00 · SEO 1.00 |
| Lighthouse `/impact` | ✅ performance 1.00 · accessibility 1.00 · best-practices 1.00 · SEO 1.00 |
| CWV (simulated) | ✅ LCP 0.3 s (target < 2.5 s) · CLS 0 (target < 0.1) · TBT 0 ms (target < 200 ms) |
| D1 migration chain (sqlite replay of `migrations/0001`–`0006` + `seed.sql`) | ✅ applies cleanly, no schema drift vs `src/lib/schema.ts` |
| Built worker exports | ✅ `queue`, `scheduled`, `PublishReportWorkflow` present in `dist/_worker.js/index.js` |

CI runs: [39552883394](https://github.com/wasalo/Kokonut-Foundation/actions/runs/39552883394) ✅ · Lighthouse [39552890765](https://github.com/wasalo/Kokonut-Foundation/actions/runs/39552890765) ✅

---

## Fixed in the pre-deployment audit (2026-10-21)

| # | Issue | Fix |
|---|---|---|
| 1 | `migrations/0002_v2.sql` seeded `farms` with columns only added in `0005` → migration chain aborted | Seed reduced to columns present at `0002`; KB enrichment stays in `0005` |
| 2 | `resources.status` declared in Drizzle schema but never created → all resources reads threw `no such column` | New `migrations/0006_resources_status.sql` |
| 3 | `PublishReportWorkflow` not returned from `createExports()` → workflow binding resolved to `undefined` | Exported from `src/worker.ts`; `publish.ts` now calls `env.PUBLISH_REPORT.create()` |
| 4 | Turnstile silently passed when the secret was missing | Fail-closed in production (`src/lib/turnstile.ts`) |
| 5 | Web Analytics token was the literal `"PLACEHOLDER"` | Token read from `CF_WEB_ANALYTICS_TOKEN`; script omitted when unset |
| 6 | `env.preview` inherited no `vars`/`workflows` (non-inheritable in Wrangler) | Preview now declares full `vars` + `workflows` |
| 7 | Security headers skipped on 19 prerendered routes | `src/worker.ts` wraps the `ASSETS` binding to inject headers on static assets |
| 8 | Cloudflare Access check was header-presence only (bypassable) + CSRF possible on admin mutations | Full RS256 JWT verification (`src/lib/access.ts`), `checkOrigin: true` |
| 9 | `leaflet.markercluster` loaded as ESM (UMD → `L.markerClusterGroup` undefined) | Loaded as a UMD script with `window.L` set; falls back to plain markers |
| 10 | `/farms → /farms` self-redirect (infinite loop) | Removed from `migrations/seed.sql` |
| 11 | Graph methodology/source nodes never resolved | Metric slugs seeded; graph API resolves by slug **or** name |
| 12 | `/farms` fallback used wrong coordinates (50 km off) | Corrected to `18.9388, -69.7350` |
| 13 | `og:image` / `twitter:image` pointed at a non-existent file | Generated `public/og-home.png` (1200×630) |
| 14 | CSV exports were not escaped | `csvField`/`csvRow` (RFC 4180) applied to all 5 CSV endpoints |
| 15 | Inquiries had no sanitization, length caps, or email validation | `sanitize()` + caps + email regex |
| 16 | `robots.txt` allowed crawling of admin routes | `Disallow: /admin`, `/api/admin`, `/api/v1/inquiries` |
| 17 | Sitemap missing ~30 real URLs and all `/es/*` | 42 URLs incl. all Spanish pages + new transparency modules |
| 18 | `<html lang="en">` on all Spanish pages | `lang` prop on `BaseLayout`; all 15 Spanish pages pass `lang="es"` |
| 19 | No mobile navigation | `<details>`-based menu in `SiteNav.astro` |
| 20 | `@playwright/test` missing → e2e tests could not run | Added to devDependencies; CI installs browsers and runs `npm run test:e2e` |
| 21 | Lighthouse workflow started no server and asserted nothing | Starts `wrangler dev`, adds `lighthouserc.json` with ≥95 assertions + CWV thresholds |
| 22 | `drizzle-kit generate` would collide with the applied migration chain | `out: "./drizzle"` + `dbCredentials`; `migrations/` remains the applied chain |
| 23 | Health check never touched D1/R2/KV | `/api/health` now checks all three and returns 503 when degraded |
| 24 | CI never applied D1 migrations | Migration step + post-deploy health check added to `ci.yml` |
| 25 | `scroll-behavior: smooth` not disabled under reduced motion | Disabled in the `prefers-reduced-motion` block |
| 26 | `migrate-wp.mjs` redirect-ID regex was broken | Fixed to `/[^A-Za-z0-9]+/g` |
| 27 | OpenAPI spec had a phantom path and missed `POST /api/v1/events` | Spec corrected |
| 28 | Undeclared env vars (`TURNSTILE_SECRET_KEY`, `KI_API_*`, `ETH_RPC_URL`, `RESTRICTED_ACCESS_TOKEN`, `CF_WEB_ANALYTICS_TOKEN`, `ACCESS_*`) | Declared in `src/env.d.ts`, documented in README + `.dev.vars.example` |
| 29 | CI workflow used `secrets` in a step-level `if` (invalid → workflow file error) | Secrets mapped to job-level `env`, referenced as `env.*` in step conditions |
| 30 | Brand green `#009F4D` on white = 3.36:1 (fails AA for small text) | `--color-primary` is now `#007A3D` (5.43:1); `#009F4D` retained as `--color-primary-vivid` for large display/accent use |
| 31 | Form controls had no labels; headings skipped levels | Labels added to all selects/inputs; `sr-only` section headings added; static checker confirms 0 heading-order violations |
| 32 | Lighthouse accessibility 0.89 on `/projects` | Fixed → 1.00 on all three audited pages |

---

## Blocked on external resources / credentials
- **KI wiring (blocked on the KI refactor)**: Kokonut Intelligence is being re-factored and is **not ready to wire today** — the repository currently carries two branches (`main` and `feat/mobile-offline-acceptance`, the "kernel" stack). The Foundation side is now written to be contract-tolerant so the final wiring is configuration-only:
  - `src/lib/ki-client.ts` — auto-detects the API path style (`/items/{collection}` Directus surface vs `/api/{collection}` kernel surface) via `KI_PATH_STYLE`, Bearer auth via `KI_API_KEY` or `KI_API_EMAIL`/`KI_API_PASSWORD`.
  - `src/lib/ki-mapping.ts` — maps the real KI collections and fields: `farm`, `location`, `partner`, `metric_definition`, `metric_value`, `mrv_claim`, `mrv_event`, `attestation_record`, `report_snapshot`, `treasury_event`, `revenue_event`, `farm_registry_record`. Collection names are overridable with `KI_COLLECTION_MAP` (JSON).
  - `src/lib/ki-ingest.ts` — pulls governed records, upserts them into D1, writes `sync_jobs` + `audit_log`, and stores the 13-field Common Data Schema baseline from `farm_registry_record`.
  - Remaining once KI lands: confirm the final endpoint/collection names, set `KI_API_URL` + credentials, run `/api/admin/sync/ki`, and validate the imported records against the published Hub.
- **CWV validation in production**: CI enforces *simulated* thresholds. Real 75th-percentile LCP/INP/CLS needs production traffic data.
- **Cloudflare resource IDs**: `wrangler.jsonc` holds the real IDs created for this account (D1 `kokonut-foundation-db`, KV `kokonut-foundation-config`, R2 `kokonut-foundation-media`, Queue `kokonut-sync-queue`).
- **Cloudflare Access**: `ACCESS_TEAM_DOMAIN` + `ACCESS_AUD` are set as Worker secrets for `kokonut.foundation/admin*` and `kokonut.foundation/api/admin*`.
- **Turnstile production keys**: the real site key/secret are set (widget `kokonut-foundation`).
- **Web Analytics**: `CF_WEB_ANALYTICS_TOKEN` is set for the `kokonut.foundation` RUM site.

## Requires manual review / tooling
- **a11y audit to WCAG 2.2 AA**: automated checks now pass at 1.00 (Lighthouse) plus 6 hand-written Playwright assertions. Still needs an axe run and a manual screen-reader pass.
- **Expanded tests**: unit (23) and e2e (10) exist; no component tests, no integration tests against a live D1/R2, no axe assertions.
- **CI deploy path**: the migration / deploy / health-check steps are skipped until `CLOUDFLARE_API_TOKEN` is set; they have never executed against Cloudflare.
- **Admin roles**: Cloudflare Access handles authentication, but the PRD's role split (Administrator / Field Worker / Supervisor / Manager / Finance / Analyst) is not modelled in the app.

## Incremental content work
- **Full Spanish content**: 15 Spanish pages exist (index, about, about/foundation, about/team, support, how-it-works, contact, projects, resources, partners, transparency, transparency/treasury, transparency/governance, impact, farms). Remaining: project detail, farm detail, metric detail, resource detail, partner detail, evidence explorer, explorer/graph, data hub, admin pages, and full translations of the long-form English content.
- **Product event tracking UI calls**: added to project detail, impact, farms, transparency, contact, support. Remaining: home, resources, partners, about, evidence browser, reports, and event-counter read-back in an admin analytics page (counters are written to KV but never read).
- **Admin CRUD**: create forms exist for projects, metrics, farms, evidence, reports, team, resources, milestones, measurements, redirects. Still missing: edit forms, delete endpoints surfaced in the UI, and CRUD for partners + media.

## Deliberately deferred
- **Durable Objects** — not introduced; the PRD explicitly advises against it without a concrete need.
- **PDF generation for automated reports** — reports are published as HTML/JSON/CSV; PDF requires a rendering service.
- **Email delivery of reports** — out of scope; reports are listed and downloadable.
