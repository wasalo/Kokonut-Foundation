# Kokonut Foundation — User & Operational Guide

Three audiences, three parts:

| Part | Audience | Covers |
|---|---|---|
| [Part 1 — Using the site](#part-1--using-the-site) | Visitors, donors, partners, researchers | Finding and using the published information |
| [Part 2 — Using the admin](#part-2--using-the-admin) | Foundation staff | Roles, daily workflows, publishing states, bulk actions |
| [Part 3 — Operating the platform](#part-3--operating-the-platform) | Platform operators | Deploy, migrate, rotate secrets, sync KI, troubleshoot |

---

# Part 1 — Using the site

**Live:** https://kokonut.foundation

## Finding things

| I want to… | Go to |
|---|---|
| See what the Foundation does and what it has achieved | `/` |
| Understand the model end to end | `/how-it-works` |
| See live farms | `/farms` |
| See the projects in flight | `/projects` |
| See a number and its evidence | `/impact`, then any metric |
| Understand how impact is measured | `/impact/methodology` |
| Check the Foundation's own records | `/transparency` |
| Find a report, framework or guide | `/resources` |
| Browse everything at once | `/explorer` |
| Download the data | `/data` |
| Use the data programmatically | `/api-docs` |
| Get in touch | `/contact` |

## The two languages

The site is published in English and Spanish. Spanish pages live under `/es/…` — for
example `https://kokonut.foundation/es/projects/`. The language switch in the header
takes you to the same page in the other language, and each page declares its own
language so screen readers use the right voice.

## Light and dark

The theme toggle in the header switches between light and dark. Your choice is remembered
on this device and applied before the page paints — there is no flash of the wrong
theme. If you have never toggled it, the site follows your operating system's setting.

## Reading a number

Every metric shows its **verification status** and its **source**. These are not
decoration — they tell you how much weight the number carries:

| Status | What it means |
|---|---|
| `reported` | Someone stated it; nobody has checked it |
| `reviewed` | A Foundation reviewer looked at the underlying record |
| `verified` | The record has been checked against its evidence and moved through the workflow |
| `attested` | An on-chain attestation (EAS on Celo) records who, when and what evidence |

"Verified" is a workflow state, not scientific certification. The site says so wherever
it applies.

**Evidence maturity** is tracked separately from the record's status:
`narrative → structured → reviewed → evidence-linked → attested → externally verified`.
A record can be *published* while its evidence is still only *structured*.

## Downloads

`/data` lists every dataset. `/api/v1/downloads` catalogues the available exports:
**CSV** for metrics, measurements, farms, treasury and attestations, plus the
individual report and evidence files, which are downloadable from their own pages.

Some files are restricted; those need the `RESTRICTED_ACCESS_TOKEN` value passed as an
`?access=` query parameter. Ask the Foundation for a token.

## Sending an enquiry

`/contact` posts to the Foundation. The form is protected by Turnstile (an invisible
check that filters bots) and is rate-limited to 10 submissions per minute per address.
Enquiries land in `/admin/inquiries` for staff.

---

# Part 2 — Using the admin

**URL:** https://kokonut.foundation/admin

## Getting in

The admin is protected by **Cloudflare Access**. You sign in with your Foundation
account; the platform never sees or stores your password. If you can reach
`/admin` but are bounced to a login page, you need to be added to the Access
application — ask an Administrator.

Your Access email is mapped to a **Foundation role**. The first person to sign in
becomes the Administrator automatically; everyone after that is read-only until an
Administrator assigns them a role. The header of every admin page shows who you are and
what you can do.

## The six roles

| Role | What they run | What they cannot do |
|---|---|---|
| **Administrator** | Everything | — |
| **Manager** | Projects, farms, partners, team, reports, resources, enquiries, content, attestations, the catalogues, media | Delete media or attestations, manage roles, run the KI sync |
| **Supervisor** | Farms, milestones, measurements, evidence, natural assets, activities | Delete, manage roles |
| **Field Worker** | Measurements, evidence, farm notes, milestones, natural assets, activities, media uploads | Delete, publish, manage roles |
| **Finance** | Funding events, reports | Content pipeline, delete, manage roles |
| **Analyst** | Reads everything, sees analytics | Any write at all |

If a button is missing, that is the role model working — not a bug. Ask an Administrator
if you need more.

## The daily loop

1. **Read the dashboard** (`/admin`) — it links to every section you can reach.
2. **Work your section** — the navigation only shows what your role allows.
3. **Use the status control** on a row to move a record through its lifecycle.
4. **Check the audit log** (`/admin/audit`) if you need to see who changed what.

## Record lifecycle

```
draft ──► submitted ──► verified ──► published
             │             │
             └──► rejected └──► (back to draft, with rework)
any ──► archived
```

Move a record by using the dropdown next to it. A **Manager** can publish; a **Field
Worker** can only submit work for review.

## Creating a record

Every managed entity has a **New** button that opens a prefilled form. Fill it in and
submit — the form posts to the admin API and the new record appears in the list.

Required fields are marked. Slugs are generated from the name when you do not supply
one.

## Editing a record

Click **Edit** on a row. The form is prefilled with the current values. Only the fields
you actually change are written — saving one field never blanks out the rest.

## Deleting a record

Click **Delete** on a row. It asks for confirmation and cannot be undone. Media
deletion removes the file from R2, so it is reserved for Administrators.

## Bulk actions

Tick the checkboxes on a list to select several records, and a bar appears at the top:

- **Publish** — moves the selection to `published`
- **Archive** — moves the selection to `archived`
- **Delete** — removes the selection (with a confirmation)

Each affected record gets its own entry in the audit log, so the trail names every
record rather than one opaque "bulk" line. Bulk publish and archive only appear if your
role can publish that entity.

## The catalogue editors

Six reference-data screens share one mechanism: `/admin/content` (content blocks),
`/admin/natural-assets`, `/admin/activities`, `/admin/claims`, `/admin/methodologies`
and `/admin/sources`.

- **Create, edit and delete** work exactly like the rest of the admin, and the
  field definitions come from the entity registry — one list of fields, used by
  the screen and the API together.
- **Slugs are derived** from the name or title when you leave the slug blank, and
  must be unique. A duplicate is refused with a clear message rather than a
  database error.
- **Content blocks** are addressed by key rather than slug (`baseline:adelphi`,
  `home:intro`). Their body may be plain text or a JSON document: if it starts
  with `{` or `[` it is parsed and stored pretty-printed, and a broken JSON
  document is refused rather than saved. Content blocks are readable publicly at
  `/api/v1/content` and `/api/v1/content/{key}`.
- **Natural assets and activities** are the farm-level catalogue: what is growing
  and what was done to it. A Field Worker can add them; only a Manager or
  Supervisor can publish.

## The media library

`/admin/media` lists the R2 bucket directly.

- **Upload** — pick a file, choose a folder, and set a title, description, alt text and
  visibility. The title, description and alt text travel with the object as custom
  metadata, so they stay with the file wherever it is used.
- **Edit** — change the metadata of an existing object without re-uploading it.
- **Delete** — removes the object from the bucket. Administrator only.

Use the **Folder prefix** box to list a single folder (for example `evidence/`).

## Evidence and uploads

`/admin/evidence` manages evidence records. `+ New Evidence` uploads a file to R2 and
creates the evidence record in one step. Files uploaded through the evidence form are
also visible in the media library.

## Reports

`/admin/reports` lists published reports. Generation and publishing are available to
Managers and Finance, and run through a **Cloudflare Workflow** so a long report
survives a Worker restart.

## Roles and permissions

`/admin/roles` (Administrators only) shows:

- every role and what it can do, and
- every assignment, with who granted it and when.

Assign a role by entering an email and picking a role. Revoke with **Revoke**. You
cannot revoke your own Administrator role — ask another Administrator to do it, so the
Foundation never ends up locked out of its own admin.

Adding someone to Cloudflare Access gives them a **read-only** account until you assign
a role. That is deliberate.

## Analytics

`/admin/analytics` shows product events — page views across the site — read back from
KV. The counters are written by the pages themselves.

---

# Part 3 — Operating the platform

## Architecture in one paragraph

Astro 5 renders every request on a Cloudflare Worker. The Worker reads and writes D1
(32 tables), stores files in R2, keeps rate limits, caches and event counters in KV,
dispatches KI syncs through a Queue, and runs report publishing as a Workflow. A
middleware layer handles locale rewriting, the admin gate, D1-backed redirects, rate
limiting and security headers before any route runs.

## Daily and weekly commands

```bash
# Local development
npm install
cp .dev.vars.example .dev.vars
npm run dev                                  # :4321

# Validation — run these before every push
npm run typecheck
npm test                                     # 118 unit + integration tests
npm run build
npm run test:e2e                             # 23 Playwright tests (needs chromium)

# Database
npm run db:migrate:remote                    # apply pending migrations
npm run db:seed:remote                       # load the reference dataset
npx wrangler d1 migrations list kokonut-foundation-db --remote   # what is pending
npx wrangler d1 execute kokonut-foundation-db --remote --command "SELECT COUNT(*) FROM projects;"

# Deploy
npm run deploy                               # build + wrangler deploy
```

`npx playwright install chromium` is needed once before the e2e suite. Note that
Playwright does not support macOS 12 — on that host the e2e suite runs in CI instead.

## Deployment

The deploy pipeline is: **build → migrate → deploy → health check**.

CI (`.github/workflows/ci.yml`) runs on every push to `main` and performs all four
steps. The migration and deploy steps are skipped automatically when
`CLOUDFLARE_API_TOKEN` is not set, so a fork's CI stays safe.

Required GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN` — Workers Scripts:Edit, D1:Edit, R2:Edit, KV:Edit, Queues:Edit
- `CLOUDFLARE_ACCOUNT_ID`

Deploying by hand:

```bash
export CLOUDFLARE_API_TOKEN=...      # or: npx wrangler login
npm run db:migrate:remote
npm run deploy
curl -s https://kokonut.foundation/api/health | jq
```

`/api/health` returns `200` with `{"status":"ok"}` when D1, KV and R2 are all reachable,
and `503` with `{"status":"degraded"}` when any of them is not. It is the first thing to
check after a deploy.

### Custom domains and the two environments

| Host | Worker | Data | Admin |
|---|---|---|---|
| `kokonut.foundation`, `www.kokonut.foundation` | `kokonut-foundation` | Production D1 / R2 / KV | Cloudflare Access (`kokonut.foundation/admin*`, `kokonut.foundation/api/admin*`) |
| `staging.kokonut.foundation` | `kokonut-foundation-preview` | Its own `*-preview` D1 / R2 / KV | Cloudflare Access (`staging.kokonut.foundation/admin*`, `staging.kokonut.foundation/api/admin*`) |

The two environments share no data. A record written to staging is invisible to
production, and a change to the database in one does not touch the other. CI deploys
and health-checks both on every push to `main`.

`ADMIN_DEV_BYPASS` is `false` in **both** deployed environments. The bypass is only
ever enabled in a developer's local `.dev.vars`. It requires the exact value
`"true"`, and a request that presents an Access token is always verified — an
unverifiable token is refused rather than falling back to the bypass.

## Migrations

Hand-authored, ordered SQL in `migrations/`. The filename is the migration name, so
Wrangler tracks the applied chain itself. The order matters — later files assume
earlier ones ran.

```bash
# See what is pending
npx wrangler d1 migrations list kokonut-foundation-db --remote

# Apply
npm run db:migrate:remote
```

**Always apply migrations before deploying code that needs them.** A Worker that queries
a column that does not exist yet will throw at runtime, not at build time.

`drizzle-kit generate` writes review artifacts to `drizzle/` — a separate directory so
it never collides with the applied chain. The Drizzle model in `src/lib/schema.ts` and
the SQL chain are checked against each other by `tests/integration/db.test.ts`, which
replays the real chain against a SQL engine and asserts no drift.

To add a migration: write `migrations/000N_name.sql`, add the matching table or column
to `src/lib/schema.ts`, extend the drift test, then apply.

## Secrets

```bash
npx wrangler secret list          # what is set
npx wrangler secret put ACCESS_AUD
```

| Secret | Rotate when | Consequence if missing |
|---|---|---|
| `TURNSTILE_SECRET_KEY` | Annually or on suspicion | Contact and enquiry forms **fail closed** — submissions are rejected |
| `ACCESS_TEAM_DOMAIN` | Team domain changes | Admin routes are denied in production |
| `ACCESS_AUD` | Access application recreated | Admin routes are denied in production |
| `CF_WEB_ANALYTICS_TOKEN` | Site recreated | Analytics beacons stop; nothing else breaks |
| `KI_API_KEY` / `KI_API_EMAIL` | KI credentials rotate | The KI sync reports `skipped`; the site is unaffected |
| `ETH_RPC_URL` | Endpoint changes | Treasury balance reads fall back to the default public endpoint |
| `RESTRICTED_ACCESS_TOKEN` | Annually or on suspicion | Restricted downloads are rejected |

Secrets are **not** in `wrangler.jsonc` and never in the repository. `wrangler.jsonc`
holds only non-sensitive vars (`ENVIRONMENT`, `TURNSTILE_SITE_KEY`, `ADMIN_DEV_BYPASS`).

> `ADMIN_DEV_BYPASS` must be `false` in production **and** in the preview
> environment. It is only ever `true` in a local `.dev.vars`.

## The daily cron

A cron trigger fires at **02:00 UTC**. It writes a `sync_jobs` row and enqueues a
message on `kokonut-sync-queue`. The Queue consumer picks it up (batch size 10, 30-second
timeout), runs the KI ingest, and marks the job `pending → running → completed` or
`failed` in `sync_jobs`.

Check the job history:

```bash
npx wrangler d1 execute kokonut-foundation-db --remote \
  --command "SELECT id, source, status, started_at, finished_at, details FROM sync_jobs ORDER BY started_at DESC LIMIT 10;"
```

## Kokonut Intelligence sync

KI is the governed data layer; the Foundation is the presentation layer. KI is
mid-refactor, so the client auto-detects the API surface and every collection name is
overridable.

```bash
# Trigger a sync manually (Administrator)
curl -X POST https://kokonut.foundation/api/admin/sync/ki \
  -H "cf-access-jwt-assertion: $ACCESS_TOKEN"

# Status
curl https://kokonut.foundation/api/admin/sync/ki -H "cf-access-jwt-assertion: $ACCESS_TOKEN"
```

Configuration:

| Variable | Meaning |
|---|---|
| `KI_API_URL` | Base URL of the KI API |
| `KI_API_KEY` | Bearer token |
| `KI_API_EMAIL` / `KI_API_PASSWORD` | Alternative basic credentials |
| `KI_PATH_STYLE` | `auto` (default) probes `/items/{collection}` then `/api/{collection}`; `directus` or `kernel` forces one |
| `KI_COLLECTION_MAP` | JSON map to override collection names, e.g. `{"mrvEvent":"mrv_observation"}` |

**With no credentials configured the sync reports `skipped`** — it never fails a build
or a deploy, and the site continues to serve the data already in D1.

KI can also push to `POST /api/admin/sync/webhook`; that endpoint authenticates with
`RESTRICTED_ACCESS_TOKEN` rather than a role, because it is machine-to-machine.

## Rate limits

KV-backed sliding windows, one minute wide, keyed by client IP and bucket:

| Bucket | Limit |
|---|---|
| `/api/admin/*` | 30 / min |
| `/api/v1/downloads/*` | 20 / min |
| `/api/v1/inquiries` | 10 / min |
| Other `/api/*` | 120 / min |

A limit breach returns `429` with a `Retry-After` header. The counters live in KV and
expire on their own — no cleanup job needed.

## Security posture

| Control | Where |
|---|---|
| Admin authentication | Cloudflare Access, full JWT verification (RS256 signature, `aud`, `exp`) |
| Admin authorisation | Role capability matrix, enforced in the API and at the page |
| CSRF | Astro's `checkOrigin` rejects cross-site form posts |
| Spam | Turnstile on public forms; **fails closed** without a secret key |
| Headers | CSP, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, HSTS |
| Audit trail | Every admin mutation writes an `audit_log` row with the actor's email |
| Secrets | Worker secrets only; never in `wrangler.jsonc` or the repository |
| Restricted data | `RESTRICTED_ACCESS_TOKEN` required (as `?access=`) for restricted downloads |

The security headers are applied twice on purpose: the middleware covers server-rendered
routes, and `src/worker.ts` wraps the static-assets binding so prerendered routes (the
404 page) get them too.

## Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| Admin returns 302 to a login page | Cloudflare Access session expired or not enrolled | Re-authenticate; if not enrolled, ask an Administrator to add you to the Access application |
| Admin returns 401 | The Access JWT could not be verified, or Access is not configured | Confirm `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` are set; an unassigned identity gets read-only access, not a 401 |
| Admin returns 403 "Forbidden" | The role genuinely lacks that capability | Use the right account, or ask an Administrator to change the role |
| A button is missing on an admin page | The role lacks the capability | Expected behaviour — the API would refuse the same action |
| `/es/...` returns 404 | The Worker was deployed without the `/es/*` route in the manifest | Confirm `src/pages/es/[...path].astro` exists and redeploy |
| `/es/...` serves English | The middleware rewrite is not running | Check that `src/middleware.ts` sets `x-kokonut-locale` and that the Worker is the current build |
| Contact form rejects everything | `TURNSTILE_SECRET_KEY` missing or wrong | Set the secret; the form fails closed by design |
| `/api/health` returns 503 | A binding is unreachable | The `checks` object names which one: `db`, `kv` or `r2` |
| API returns 429 | Rate limit hit | Wait for the window to roll over; raise the limit in `src/middleware.ts` if legitimate |
| KI sync reports `skipped` | No KI credentials configured | Expected until the KI refactor lands; see the KI section |
| Deploy succeeds but the site 500s | A migration was not applied | `npx wrangler d1 migrations list … --remote` and apply |
| Static assets 404 after deploy | `dist/.assetsignore` missing | `postbuild.mjs` writes it; check the build log |

## Rollback

There is no automatic rollback. The platform is stateless — the Worker holds no state
of its own — so rolling back is:

```bash
git log --oneline            # find the previous good commit
git revert <sha>             # or: git checkout <sha> && npm run deploy
```

D1 is **not** rolled back. If a migration has to be undone, write a compensating
migration and apply it. Restore a D1 backup only as a last resort — it discards
everything written since the snapshot.

## Where things are

| Thing | Path |
|---|---|
| Route manifest, workers, bindings | `wrangler.jsonc` |
| Applied SQL chain | `migrations/` |
| Drizzle model | `src/lib/schema.ts` |
| Reference data | `scripts/seed.sql` |
| Middleware (locale, auth, rate limits) | `src/middleware.ts` |
| Worker entrypoint, queue, cron, workflow | `src/worker.ts` |
| Role matrix | `src/lib/permissions.ts` |
| Role resolution | `src/lib/admin-actor.ts` |
| Admin entity registry | `src/lib/admin-entities.ts` |
| Translations | `src/lib/i18n.ts` |
| KI client / mapping / ingest | `src/lib/ki-client.ts`, `ki-mapping.ts`, `ki-ingest.ts` |
| Theme tokens | `src/styles/global.css` |
| Admin components | `src/components/admin/` |

## Related documents

- [`README.md`](README.md) — architecture, commands, configuration, API reference
- [`Open Follow Ups.md`](Open%20Follow%20Ups.md) — what is still open
- [`Kokonut Foundation — Cloudflare-Native Web Platform PRD.md`](Kokonut%20Foundation%20%E2%80%94%20Cloudflare-Native%20Web%20Platform%20PRD.md) — the specification
- [Kokonut Intelligence](https://github.com/wasalo/Kokonut-Intelligence) — the governed data layer
