# Kokonut Foundation — Cloudflare-Native Web Platform

The public platform for the Kokonut Foundation: a regenerative-agriculture nonprofit that
publishes what it planned, what actually happened, and the evidence behind both.

Astro 5 + TypeScript (strict) on Cloudflare Workers, with D1 (data), R2 (media), KV
(cache, rate limits, event counters), Queues (KI sync) and Workflows (durable report
publishing). Deployed as a **Worker**, not a static site — pages are server-rendered so
they can read live data, honour the request locale, and enforce access control per request.

- **Live:** https://kokonut.foundation
- **Spec:** [`Kokonut Foundation — Cloudflare-Native Web Platform PRD.md`](Kokonut%20Foundation%20%E2%80%94%20Cloudflare-Native%20Web%20Platform%20PRD.md)
- **Backlog:** [`Open Follow Ups.md`](Open%20Follow%20Ups.md)
- **Guide:** [`OPERATIONS.md`](OPERATIONS.md) — user and operational guide
- **Governed data layer:** [Kokonut Intelligence](https://github.com/wasalo/Kokonut-Intelligence)

---

## Contents

- [Quick start](#quick-start)
- [Commands](#commands)
- [Architecture](#architecture)
- [Public routes](#public-routes)
- [Admin application](#admin-application)
- [Roles and capabilities](#roles-and-capabilities)
- [Public API](#public-api)
- [Data model](#data-model)
- [Cloudflare resources](#cloudflare-resources)
- [Configuration](#configuration)
- [Migrations and seeding](#migrations-and-seeding)
- [Localised long-form content](#localised-long-form-content)
- [Internationalisation](#internationalisation)
- [Dark mode](#dark-mode)
- [Accessibility](#accessibility)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Deployment](#deployment)
- [Kokonut Intelligence integration](#kokonut-intelligence-integration)
- [Project layout](#project-layout)

---

## Quick start

```bash
npm install
cp .dev.vars.example .dev.vars   # local secrets — gitignored, never commit
npm run dev                      # http://localhost:4321
```

`.dev.vars.example` ships working Turnstile test keys and `ADMIN_DEV_BYPASS=true`, so the
admin application is reachable locally without a Cloudflare Access account. The admin is
also reachable on `astro dev` without it, because a request addressed to a loopback host
can only have come from the developer's own machine.

**Requirements:** Node 22+ (CI uses Node 22), a Cloudflare account, and `wrangler`
authenticated (`npx wrangler login`).

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Astro dev server on :4321 with the Cloudflare platform proxy |
| `npm run build` | Production build → `dist/` (server bundle + assets) |
| `npm run preview` | Serve the built output locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check` | `astro check` (template + type diagnostics) |
| `npm test` | Vitest — unit + integration |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright — smoke, a11y and axe suites |
| `npm run db:generate` | `drizzle-kit generate` → review artifacts in `drizzle/` |
| `npm run db:check` | `drizzle-kit check` |
| `npm run db:migrate:local` | Apply the migration chain to the local D1 |
| `npm run db:migrate:remote` | Apply the migration chain to the remote D1 |
| `npm run db:seed:local` | Load `scripts/seed.sql` into the local D1 |
| `npm run db:seed:remote` | Load `scripts/seed.sql` into the remote D1 |
| `npm run deploy` | Build then `wrangler deploy` |

## Architecture

```
                    Cloudflare Edge
                           │
        ┌──────────────────┴───────────────────┐
        │        Worker (dist/_worker.js)       │
        │  ┌──────────────────────────────────┐ │
        │  │ middleware.ts                     │ │
        │  │  • /es/* → locale rewrite         │ │
        │  │  • admin gate (Access + role)     │ │
        │  │  • D1-backed redirects            │ │
        │  │  • KV rate limiting on /api/*     │ │
        │  │  • security headers               │ │
        │  ├──────────────────────────────────┤ │
        │  │ src/pages/**   (Astro routes)     │ │
        │  │ src/pages/api/** (REST endpoints) │ │
        │  └──────────────────────────────────┘ │
        └──────┬────────┬────────┬────────┬────┘
               │        │        │        │
              D1       R2       KV     Queues ──► Workflows
           (33 tables) (media)  (cache,  (KI sync)  (publish-report)
                               limits,
                               events)
```

**Rendering.** `output: "server"` — every request is handled by the Worker, including the
404, so a missing page answers in the visitor's language.

**Middleware** (`src/middleware.ts`) runs before routing and handles, in order: locale
rewriting, the admin authentication + authorisation gate, D1-backed redirects, KV rate
limiting, and security headers.

**Worker entrypoint.** `src/worker.ts` exports the Queue consumer, the cron handler and
`PublishReportWorkflow`; `astro.config.mjs` wires them through the adapter's
`workerEntryPoint`.

## Public routes

Every route below is also served under `/es/…` (see [Internationalisation](#internationalisation)).

| Route | Page |
|---|---|
| `/` | Home — proof metrics, pillars, featured projects |
| `/how-it-works` | The regenerative value loop, evidence stack, boundaries |
| `/about` | About the Foundation |
| `/about/foundation` | Foundation model and commitments |
| `/about/team` | Team members |
| `/projects`, `/projects/[slug]` | Projects and project detail |
| `/farms`, `/farms/[slug]` | Farms and farm detail |
| `/impact` | Impact metrics index |
| `/impact/[metric]` | Metric detail with history and provenance chain |
| `/impact/methodology` | MRV methodology, evidence classes, record lifecycle |
| `/impact/methodology/[slug]` | Methodology detail |
| `/transparency` | Transparency hub |
| `/transparency/governance` | Governance model and authority boundaries |
| `/transparency/treasury` | Wallets, balances, transactions |
| `/transparency/attestations`, `/transparency/attestations/[uid]` | EAS attestations |
| `/transparency/reports` | Published reports |
| `/transparency/funding` | Funding events and public-goods contributions |
| `/transparency/methodologies` | Impact measurement methodologies |
| `/transparency/open-source` | Open-source outputs |
| `/partners`, `/partners/[slug]` | Partners |
| `/resources`, `/resources/[slug]` | Reports, research, frameworks, guides |
| `/explorer` | Explorer hub |
| `/explorer/evidence` | Evidence records |
| `/explorer/graph` | Evidence graph |
| `/data` | Data hub and dataset catalogue |
| `/api-docs` | Public API documentation |
| `/content`, `/content/[key]` | The addressable content store — published baselines and editable copy |
| `/contact` | Contact and partnership enquiries |
| `/support` | Ways to support the Foundation |
| `/search` | Search |

Also served: `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/openapi.json`, `/sw.js`.

## Admin application

`kokonut.foundation/admin/*` — the internal CMS that replaces WordPress.

- **Authentication** is Cloudflare Access (PRD §33). The middleware verifies the
  `cf-access-jwt-assertion` JWT — RS256 signature, `aud` tag and `exp` — before any
  admin code runs. A header that merely *exists* is not enough.
- **Authorisation** is a Foundation role (PRD §34) resolved from the verified identity's
  email. See [Roles and capabilities](#roles-and-capabilities).
- Every mutation writes an `audit_log` row naming the **actor's email**, the action, the
  entity and the payload.

| Screen | Manages |
|---|---|
| `/admin` | Dashboard and navigation |
| `/admin/projects` | Projects — create, edit, bulk publish/archive/delete |
| `/admin/farms` | Farms |
| `/admin/metrics` | Metrics |
| `/admin/measurements` | Measurements |
| `/admin/milestones` | Milestones |
| `/admin/evidence` | Evidence records (plus file upload to R2) |
| `/admin/attestations` | Attestations |
| `/admin/partners` | Partners |
| `/admin/team` | Team members |
| `/admin/reports` | Reports (plus generation and publishing) |
| `/admin/resources` | Resources |
| `/admin/funding` | Funding events |
| `/admin/inquiries` | Contact enquiries |
| `/admin/media` | R2 media library — upload, edit metadata, delete |
| `/admin/redirects` | Redirect rules |
| `/admin/content` | Content blocks — the addressable content store |
| `/admin/natural-assets` | Natural assets catalogue |
| `/admin/activities` | Activities catalogue |
| `/admin/claims` | Claims catalogue |
| `/admin/methodologies` | Methodologies catalogue |
| `/admin/sources` | Sources catalogue |
| `/admin/roles` | Role assignments |
| `/admin/audit` | Audit log |
| `/admin/analytics` | Product event analytics |
| `/admin/sync` | Kokonut Intelligence sync |

**Bulk actions.** Every list of editable records has row checkboxes and a bulk bar.
Publish and archive require the entity's publish/update capability; delete requires the
delete capability. Each affected record gets its own audit entry. The audit log, the
sync screen and the media library are not bulk-editable — they are not lists of
records.

## Roles and capabilities

Six roles, defined as an explicit allow-list in `src/lib/permissions.ts` — no implicit
inheritance, so granting a role never silently widens access.

| Role | Scope |
|---|---|
| **Administrator** | Everything, including role assignment, media deletion and the audit trail |
| **Manager** | Projects, farms, partners, team, reports, resources, inquiries, content, attestations, the catalogues, media (no delete) |
| **Supervisor** | Farms, milestones, measurements, evidence, natural assets, activities; read-only elsewhere |
| **Field Worker** | Measurements, evidence, farm notes, milestones, natural assets, activities; uploads media |
| **Finance** | Funding events and reports; read-only elsewhere |
| **Analyst** | Read-only across all data, plus analytics |

Capabilities are `entity.action` strings (`projects.update`, `evidence.publish`, …) plus
four platform-level ones: `access.admin`, `access.roles`, `access.audit`,
`access.analytics`, `access.sync`.

**How a role is assigned.** The verified Access email is looked up in the `admin_roles`
table. While that table is empty, the first authenticated identity bootstraps as
administrator and the assignment is written down. After that every role is explicit and
an **unassigned identity is read-only** — adding a colleague to Cloudflare Access never
silently grants write access. Roles are managed at `/admin/roles`.

Enforcement is real, not cosmetic:

- **API** — every `/api/admin/*` handler calls `denyUnless()` and returns `403` with the
  required capability when denied.
- **Pages** — every admin page calls `adminPageGuard()`; a role that cannot read an
  entity never sees its screen.
- **UI** — New / Edit / Delete controls are hidden when the role lacks the capability.

## Public API

`/api/v1/*` is a read-only, CORS-enabled JSON API over the published Foundation data.
`/api-docs` renders the reference; `/openapi.json` is the machine-readable spec.

| Area | Endpoints |
|---|---|
| Projects | `GET /api/v1/projects`, `GET /api/v1/projects/[slug]` |
| Farms | `GET /api/v1/farms`, `GET /api/v1/farms/[slug]` |
| Metrics | `GET /api/v1/metrics`, `GET /api/v1/metrics/[slug]`, `/history`, `/compare` |
| Measurements, milestones, evidence | `GET /api/v1/measurements`, `/milestones`, `/evidence` |
| Attestations | `GET /api/v1/attestations`, `/api/v1/attestations/[uid]` |
| Reports, resources, partners | `GET /api/v1/reports`, `/resources`, `/partners` |
| Treasury | `GET /api/v1/treasury`, `/balances`, `/transactions`, `/reconcile` |
| Impact | `GET /api/v1/impact` |
| Graph | `GET /api/v1/graph/project/[slug]`, `/graph/metric/[slug]` |
| Catalogue | `GET /api/v1/methodologies`, `/sources`, `/natural-assets`, `/activities`, `/claims` |
| Content blocks | `GET /api/v1/content` — list; `GET /api/v1/content/{key}` — one block, body parsed as JSON when it is JSON |
| Downloads | `GET /api/v1/downloads/{type}` — CSV exports (metrics, measurements, farms, treasury, attestations); `GET /api/v1/downloads/{type}/{slug}` — the report or evidence file itself |
| Search | `GET /api/v1/search?q=` |
| Funding | `GET /api/v1/funding-events` |
| Write | `POST /api/v1/inquiries` (Turnstile-protected), `POST /api/v1/events` (analytics) |
| Health | `GET /api/health` — checks D1, R2, KV and the queue |

Restricted-visibility downloads require the `RESTRICTED_ACCESS_TOKEN` value as an
`?access=` query parameter.

## Data model

33 tables created by the ordered migration chain. The core content tables:

`projects` · `farms` · `metrics` · `measurements` · `milestones` · `evidence` ·
`attestations` · `partners` · `project_partners` · `team_members` · `reports` ·
`resources` · `funding_events` · `content_blocks` · `inquiries` · `redirects` ·
`audit_log` · `sync_jobs` · `admin_roles` · `wallets` · `treasury_entries` ·
`treasury_transactions` · `historical_metric_snapshots` · `natural_assets` ·
`activities` · `claims` · `methodologies` · `sources` · `evidence_links` ·
`attestation_chain_refs` · `api_keys` · `report_templates` · `record_translations`

The Drizzle model lives in `src/lib/schema.ts`; the applied SQL in `migrations/`.

**Publishing states.** `draft → submitted → verified → published`, with `rejected` and
`archived` as terminal branches. "Verified" is a workflow state, not scientific
certification — the site says so explicitly.

**Evidence maturity** is tracked separately from record status:
`narrative → structured → reviewed → evidence_linked → attested → externally_verified`.

## Cloudflare resources

All resources live in `wrangler.jsonc`.

| Binding | Resource | Notes |
|---|---|---|
| `DB` | D1 `kokonut-foundation-db` | 33 tables; `migrations_dir: migrations` |
| `MEDIA` | R2 `kokonut-foundation-media` | Evidence files, generated reports, media library |
| `CONFIG` | KV namespace | Rate limits, caches, event counters |
| `SYNC_QUEUE` | Queue `kokonut-sync-queue` | KI sync producer + consumer (batch 10 / 30 s) |
| `PUBLISH_REPORT` | Workflow `publish-report` | Durable report publishing |
| `ASSETS` | Workers Static Assets | `dist/` |

Custom domains: `kokonut.foundation` and `www.kokonut.foundation` on production,
`staging.kokonut.foundation` on the preview environment. A cron trigger runs daily at
02:00 UTC. Observability is enabled with full sampling.

**The preview environment is genuinely separate** (PRD §86 #13). It is a different
Worker (`kokonut-foundation-preview`) with its own D1, R2, KV and Queue, its own
hostname, its own Access applications, and `ADMIN_DEV_BYPASS=false` — the
development bypass is never enabled outside a developer's machine. A record written
to staging is invisible to production, and the CI pipeline deploys and health-checks
both environments on every push to `main`.

## Configuration

**Bindings and vars** (in `wrangler.jsonc`):

| Name | Type | Purpose |
|---|---|---|
| `DB` | binding | D1 database |
| `MEDIA` | binding | R2 bucket (evidence, reports, media library) |
| `CONFIG` | binding | KV namespace (rate limits, caches, event counters) |
| `SYNC_QUEUE` | binding | Queues producer (KI sync) |
| `PUBLISH_REPORT` | binding | Workflows binding (durable report publishing) |
| `ENVIRONMENT` | var | `production` on the main Worker, `preview` on the staging Worker |
| `TURNSTILE_SITE_KEY` | var | Public Turnstile site key |
| `ADMIN_DEV_BYPASS` | var | Local-only admin bypass — `false` in production **and** in preview. Local development does not need it: a request addressed to a loopback host is treated as local |

**Secrets** (`wrangler secret put <name>`):

| Name | Purpose |
|---|---|
| `TURNSTILE_SECRET_KEY` | Turnstile server verification — **required in production**; forms fail closed without it |
| `ACCESS_TEAM_DOMAIN` | Cloudflare Access team domain (`<team>.cloudflareaccess.com`) — **required in production** |
| `ACCESS_AUD` | Cloudflare Access application AUD tag — **required in production** |
| `CF_WEB_ANALYTICS_TOKEN` | Cloudflare Web Analytics beacon token |
| `KI_API_URL` | Kokonut Intelligence API base URL |
| `KI_API_KEY` | Kokonut Intelligence bearer token |
| `KI_API_EMAIL` / `KI_API_PASSWORD` | Alternative KI basic credentials |
| `KI_PATH_STYLE` | `auto` (default) \| `directus` \| `kernel` |
| `KI_COLLECTION_MAP` | JSON map overriding KI collection names |
| `ETH_RPC_URL` | Ethereum RPC for treasury balance reads |
| `RESTRICTED_ACCESS_TOKEN` | Required to download restricted-visibility files |

Local secrets live in `.dev.vars` (gitignored). `.dev.vars.example` documents every key.

## Migrations and seeding

Hand-authored, ordered SQL migrations live in `migrations/` and are applied with
`wrangler d1 migrations apply` — the filenames are the migration names, so the applied
chain is tracked by Wrangler itself. `drizzle-kit generate` writes review artifacts to
`drizzle/` so it never collides with the applied chain.

```bash
npm run db:migrate:remote   # apply the chain
npm run db:seed:remote      # load scripts/seed.sql (Adelphi baseline + reference data)
```

`tests/integration/db.test.ts` replays the real chain against a SQL engine (sql.js) and
asserts no drift against the Drizzle model, so a migration that only works in production
fails in CI.

## Localised long-form content

Page chrome is translated in `src/lib/i18n.ts`. The **body copy of a record** — a
project's summary and description, a farm's description, a team member's bio — comes
from the database, so it needs somewhere to hold a second language.

`record_translations` holds translated fields keyed by the record they belong to:
`(entity_type, entity_id, locale) → { field: value }`. The base record keeps the
default-language copy; a translation only overrides the fields it provides, and a
blank field falls back to the default. The detail pages merge the translation over
the record at request time, so the same URL serves the visitor's language.

The admin editor writes them: every entity with translatable fields shows a
**Translations** panel next to the default-language fields, one block per locale.
The fields a record can translate are declared once in `src/lib/admin-entities.ts`.

## Internationalisation

Two locales: **English** (default, unprefixed) and **Spanish** (`/es/…`).

Pages are authored **once**. A middleware rewrite maps `/es/<path>` to `<path>` and
carries the active locale on a request header, so every route — including dynamic
detail pages like `/es/projects/adelphi/` — is served in Spanish without a duplicated
page tree. Strings come from `src/lib/i18n.ts`; the nav, footer, skip link, canonical URL
and page bodies are all localised. The header carries a language switch that links the
same page in the other language, and the sitemap lists both locales.

## Dark mode

Semantic colour tokens in `src/styles/global.css` (`--surface`, `--foreground`,
`--primary`, …) are flipped by a `data-theme` attribute on `<html>`, so the whole site
inverts without per-component overrides. The theme is resolved **before first paint** (no
flash of the wrong palette), persisted in `localStorage` under `kokonut-theme`, and
defaults to the operating system preference. Charts and badges are theme-aware.

## Accessibility

WCAG 2.1 AA is enforced, not aspirational:

- axe runs over the public pages in **both locales and both themes** — no serious or
  critical violations (`tests/e2e/axe.spec.ts`).
- Lighthouse asserts an accessibility score ≥ 0.95 on `/`, `/projects` and `/impact`.
- Skip link, landmark structure, labelled navigation, visible focus rings, and
  in-text links that are underlined so they never rely on colour alone (WCAG 1.4.1).
- Text green is `#007A3D` (not `#009F4D`) to clear the contrast threshold.

## Testing

| Suite | Count | Command |
|---|---|---|
| Unit | 109 | `npm test` |
| — of which component-render | 32 | `npm test` |
| Integration | 65 | `npm test` |
| E2E (Playwright) | 23 | `npm run test:e2e` |
| — of which axe | 13 | 12 public pages in both locales + a dark-theme pass |

Integration tests run the **real** migration chain and the **real** Drizzle model against
sql.js — not mocks. The component tests render Astro components through the container
API and assert on the markup, including the admin components that change what they
render based on the signed-in role. E2E and axe require a browser:
`npx playwright install chromium`.

## CI/CD

`.github/workflows/ci.yml` runs on every push to `main`:

1. `npm ci`
2. `npm run typecheck`
3. `npm test`
4. `npx playwright install --with-deps chromium`
5. `npm run test:e2e`
6. `npm run build`
7. `wrangler d1 migrations apply --remote` — production
8. `wrangler d1 migrations apply --remote --env preview` — preview
9. `wrangler deploy` — production
10. `wrangler deploy --env preview` — preview
11. Health check against both live domains

Steps 7–11 are skipped automatically when `CLOUDFLARE_API_TOKEN` is not set.

`.github/workflows/lighthouse.yml` runs Lighthouse on a preview build and asserts
performance/accessibility/best-practices/SEO ≥ 0.95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms.

**GitHub Actions secrets:** `CLOUDFLARE_API_TOKEN` (Workers Scripts:Edit, D1:Edit, R2:Edit,
KV:Edit, Queues:Edit) and `CLOUDFLARE_ACCOUNT_ID`.

## Deployment

One-time setup:

```bash
npx wrangler d1 create kokonut-foundation-db
npx wrangler r2 bucket create kokonut-foundation-media
npx wrangler kv namespace create CONFIG
npx wrangler queues create kokonut-sync-queue
```

Put the real IDs into `wrangler.jsonc`, set the secrets, apply the schema and deploy:

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put ACCESS_TEAM_DOMAIN
npx wrangler secret put ACCESS_AUD
npx wrangler secret put CF_WEB_ANALYTICS_TOKEN   # optional

npm run db:migrate:remote
npm run db:seed:remote
npm run deploy
```

Full operational runbook — including secret rotation, rollback, the daily cron and
troubleshooting — is in [`OPERATIONS.md`](OPERATIONS.md).

## Kokonut Intelligence integration

The Foundation platform is the **public presentation layer**. Kokonut Intelligence (KI) is
the **governed data layer** (PostgreSQL + PostGIS, Directus, ClickHouse, Redis, EAS on
Celo, Foundry on Gnosis).

KI is mid-refactor, so the client is written to be **contract-tolerant** and the wiring is
configuration-only once it lands:

- `src/lib/ki-client.ts` — auto-detects the API path style (`/items/{collection}` Directus
  surface vs `/api/{collection}` kernel surface) via `KI_PATH_STYLE`; Bearer auth via
  `KI_API_KEY`, or `KI_API_EMAIL`/`KI_API_PASSWORD`.
- `src/lib/ki-mapping.ts` — maps the real KI collections: `farm`, `location`, `partner`,
  `metric_definition`, `metric_value`, `mrv_claim`, `mrv_event`, `attestation_record`,
  `report_snapshot`, `treasury_event`, `revenue_event`, `farm_registry_record`. Collection
  names are overridable with `KI_COLLECTION_MAP`.
- `src/lib/ki-ingest.ts` — pulls governed records, upserts them into D1, writes
  `sync_jobs` + `audit_log`, and stores the 13-field Common Data Schema baseline from
  `farm_registry_record`.

Sync runs at `POST /api/admin/sync/ki`; KI can push at `POST /api/admin/sync/webhook`.
With no KI credentials configured the ingest reports `skipped` — it never fails the build
or the deploy.

**Record lifecycle:** draft → submitted → verified → published.
**Evidence maturity:** narrative → structured → reviewed → evidence-linked → attested →
externally verified.
**Chains:** Gnosis = governance and treasury; Celo = EAS attestations.

## Project layout

```
src/
  components/
    admin/        AdminLayout, BulkBar, Can, DeleteButton, EntityForm, StatusSelect
    domain/       ProjectCard, FarmSummary, EvidenceCard, AttestationCard, …
    layout/       SiteNav, SiteFooter, ThemeToggle
    primitives/   Button, Card, Input, Select, Table, Modal, Tabs, Toast, …
    seo/          SeoHead
  layouts/        BaseLayout
  lib/            schema, db, api, utils, i18n, permissions, admin-*, content, translations, ki-*, access, turnstile
  pages/          Astro routes, /api/v1/*, /api/admin/*
  styles/         global.css (semantic light/dark tokens)
  middleware.ts   locale rewrite, admin gate, redirects, rate limiting, headers
  worker.ts       queue consumer, cron handler, PublishReportWorkflow
migrations/       Ordered SQL chain (0001 → 0008)
scripts/          seed.sql, postbuild.mjs, migrate-wp.mjs
tests/            unit, integration, e2e
  support/        the component-test plugin and render helper
```
