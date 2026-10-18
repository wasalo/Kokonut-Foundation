# Kokonut Foundation — Open Follow-Ups

Items that remain open after the comprehensive implementation passes. These require external resources, credentials, manual review, or incremental content work.

## Blocked on external resources / credentials
- **KI real integration**: sync code is complete (`src/lib/ki-ingest.ts`, `src/pages/api/admin/sync/ki.ts`, webhook). Needs live KI API endpoint + `KI_API_URL`/`KI_API_KEY` secrets to test. KI repo: https://github.com/wasalo/Kokonut-Intelligence
- **CWV validation**: requires real production traffic data to measure LCP/INP/CLS at 75th percentile.

## Requires manual review / tooling
- **a11y audit to WCAG 2.2 AA**: automated axe tests + manual screen reader review needed. Partial: skip link, focus-visible, reduced-motion, aria-current on nav, a11y e2e tests done.
- **Expanded tests**: integration tests (miniflare D1), e2e (Playwright setup + 7 tests done), a11y (axe). Need broader coverage.
- **Lighthouse CI**: workflow created (`.github/workflows/lighthouse.yml`); needs CI run to verify ≥95 scores.

## Incremental content work
- **Full Spanish content**: 11 Spanish pages created (index, about, about/foundation, about/team, support, how-it-works, contact, projects, resources, partners, transparency, transparency/treasury, transparency/governance, impact, farms). Remaining: project detail, farm detail, metric detail, resource detail, partner detail, evidence, explorer, data, admin pages.
- **Product event tracking UI calls**: added to project, impact, farms, transparency pages. Remaining: home, support, contact, resources, partners, about, admin pages.

## Admin CRUD (read-only lists done; forms partial)
- Create/edit forms done for: projects, metrics, farms, evidence, reports, team, resources, milestones, measurements, redirects.
- Read-only lists done for: partners, team, resources, milestones, measurements, redirects, media, inquiries.
- Still needed: edit/delete forms for all entities; CRUD for partners, media; audit log viewer (done).

## KI integration (code complete, needs live endpoint)
- `src/lib/ki-ingest.ts`: fetch → validate → map → upsert D1 (projects, metrics, measurements, attestations) + audit. Needs live KI API to test.
- Webhook (`/api/admin/sync/webhook`): applies updates (upsert) for projects/metrics arrays.
- Queue consumer (`src/worker.ts`): processes sync jobs.
- Cron handler: enqueues sync job daily at 2am.

## Completed (for reference)
- V1: Full institutional platform (home, projects, impact, transparency, partners, resources, about, support, contact, admin, SEO, D1, R2, KV, Turnstile, Access, redirects, sitemap, robots, llms.txt)
- V2: Farm explorer, geospatial map, treasury/attestation explorers, historical metrics, complete API, OpenAPI, downloads, KI sync scaffold
- V3: Evidence graph, provenance chain, graph API, /data hub, on-chain treasury reads, EAS attestation detail
- KB enrichment: Adelphi seed corrected (coords, SDGs 1/2/5/8/15, founders, funding, phase), 13-field baseline, evidence classes/maturity, governance plural authority, MRV methodology, Gnosis/Celo contract refs, EAS schema UIDs
- Security: CSP + HSTS headers, rate limiting (KV), R2 visibility enforcement, R2 restricted access token
- Workflows: PublishReportWorkflow (Cloudflare Workflows binding)
- PWA: manifest + service worker
- CI/CD: GitHub Actions (build, typecheck, test, deploy) + Lighthouse
- Analytics: Cloudflare Web Analytics snippet, product event tracking endpoint
- Observability: Workers observability enabled
- i18n: Astro i18n config (/en, /es) + 11 Spanish pages
- Component library: 14 primitives + 11 domain components
- Admin CRUD: projects, metrics, farms, evidence, reports, team, resources, milestones, measurements, redirects (create forms + endpoints)
- Publishing workflow: status transitions (draft/submitted/verified/published/rejected/archived)
- Breadcrumbs: on 6 detail pages
- JSON-LD: on 5 pages
- Maps: Leaflet on farms index (clustering) + project/farm detail
- Tests: 4 unit test files, 15 tests; Playwright e2e config + 7 tests
- WP migration tooling: scripts/migrate-wp.mjs
