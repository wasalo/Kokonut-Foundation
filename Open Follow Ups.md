# Kokonut Foundation — Open Follow-Ups

Items that remain open after the implementation passes, the pre-deployment audit, and the i18n/dark-mode work.
Each item is either blocked on external resources/credentials, requires manual review, or is incremental content work.

---

## Closed
- **WordPress migration (PRD §68)**: the legacy site was a single page with minimal content, so there is no historical URL inventory beyond the root. The redirect map in `scripts/seed.sql` plus the live Worker custom domain covers the whole surface. The WP instance has been decommissioned; there is no rollback path. The archive step (backing up WP files/DB/media) is the only remaining artifact and must be captured from the VPS backup before that host is decommissioned.
- **Dark mode**: semantic light/dark token palettes in `src/styles/global.css`, a pre-paint theme script (no flash), a `ThemeToggle` in the nav, theme-aware charts/badges, and `localStorage` persistence. Verified visually in a real browser and by axe in both themes.
- **i18n (PRD §53)**: Astro i18n routing plus a middleware rewrite means every route — including dynamic detail pages — is served under `/es/`. Pages are authored once; strings come from `src/lib/i18n.ts`. Navigation, footer, skip link, canonical URLs, and page bodies are localized. Verified live for all public routes.
- **Accessibility automation**: axe (WCAG 2.1 A/AA) runs over the public pages in both locales and both themes — no serious or critical violations. In-text links are underlined so they are distinguishable without relying on colour (WCAG 1.4.1). The `tests/e2e/axe.spec.ts` suite enforces this in CI.
- **Integration tests**: `tests/integration/db.test.ts` replays the real ordered migration chain (0001–0007 + seed) against a real SQL engine (sql.js) and asserts no schema drift against the Drizzle model; `tests/integration/admin-roles.test.ts` covers role resolution and first-run bootstrap against the same engine.
- **Product event analytics**: events are written to KV by 18 page types and read back in `/admin/analytics` (the counters were previously write-only).
- **Admin delete actions**: DELETE endpoints + UI buttons for projects, metrics, farms, evidence, reports, team, resources, milestones, measurements, redirects, partners.
- **Admin edit forms**: prefilled update forms for projects, metrics and farms, built on a shared `EntityForm` component that posts JSON to the existing PUT endpoints.
- **Admin roles and permissions**: six roles (Administrator, Manager, Supervisor, Field Worker, Finance, Analyst) with an explicit capability matrix in `src/lib/permissions.ts`. The verified Cloudflare Access identity maps to a role through the `admin_roles` table (migration 0007); the first identity bootstraps as administrator and every unassigned identity falls back to read-only. Capabilities are enforced at the API (`denyUnless`) and at the page (`adminPageGuard`), the admin chrome hides actions the role cannot use, and `audit_log` records the real actor email. Roles are assigned and revoked at `/admin/roles`.
- **Admin CRUD**: create, edit and delete now exist for every managed entity (projects, metrics, farms, evidence, reports, team, resources, milestones, measurements, redirects, partners, attestations, funding).
- **Admin media library**: `/admin/media` lists the R2 bucket directly, with upload, metadata editing (title, description, alt text, visibility travel with the object as custom metadata) and delete.
- **Bulk actions**: every list screen has row checkboxes and a bulk bar for publish, archive and delete, checked against the entity's own capability, with one audit entry per affected record.
- **Admin entity registry**: `src/lib/admin-entities.ts` is the single source of truth for admin entities, their tables, capabilities and status support.
- **Documentation**: `README.md` is at parity with the codebase (architecture, commands, routes, roles, API, data model, resources, configuration, testing, deployment) and `OPERATIONS.md` is the user and operational guide for visitors, staff and operators.

## Blocked on external resources / credentials
- **KI wiring (blocked on the KI refactor)**: Kokonut Intelligence is being re-factored and is **not ready to wire today** — the repository currently carries two branches (`main` and `feat/mobile-offline-acceptance`, the "kernel" stack). The Foundation side is written to be contract-tolerant so the final wiring is configuration-only:
  - `src/lib/ki-client.ts` — auto-detects the API path style (`/items/{collection}` Directus surface vs `/api/{collection}` kernel surface) via `KI_PATH_STYLE`, Bearer auth via `KI_API_KEY` or `KI_API_EMAIL`/`KI_API_PASSWORD`.
  - `src/lib/ki-mapping.ts` — maps the real KI collections and fields: `farm`, `location`, `partner`, `metric_definition`, `metric_value`, `mrv_claim`, `mrv_event`, `attestation_record`, `report_snapshot`, `treasury_event`, `revenue_event`, `farm_registry_record`. Collection names are overridable with `KI_COLLECTION_MAP` (JSON).
  - `src/lib/ki-ingest.ts` — pulls governed records, upserts them into D1, writes `sync_jobs` + `audit_log`, and stores the 13-field Common Data Schema baseline from `farm_registry_record`.
  - Remaining once KI lands: confirm the final endpoint/collection names, set `KI_API_URL` + credentials, run `/api/admin/sync/ki`, and validate the imported records against the published Hub.
- **CWV validation in production**: CI enforces *simulated* thresholds (Lighthouse, LCP/CLS/TBT assertions). Real 75th-percentile LCP/INP/CLS needs production traffic data.
- **Cloudflare resource IDs**: `wrangler.jsonc` holds the real IDs created for this account (D1 `kokonut-foundation-db`, KV `kokonut-foundation-config`, R2 `kokonut-foundation-media`, Queue `kokonut-sync-queue`).
- **Cloudflare Access**: `ACCESS_TEAM_DOMAIN` + `ACCESS_AUD` are set as Worker secrets for `kokonut.foundation/admin*` and `kokonut.foundation/api/admin*`.
- **Turnstile production keys**: the real site key/secret are set (widget `kokonut-foundation`).
- **Web Analytics**: `CF_WEB_ANALYTICS_TOKEN` is set for the `kokonut.foundation` RUM site.

## Requires manual review / tooling
- **a11y audit to WCAG 2.2 AA**: automated checks pass at 1.00 (Lighthouse + axe) with no serious/critical violations. Still needs a manual screen-reader pass and a check of the map/chart interactions specifically.
- **Component tests**: unit (56) + integration (15) + e2e (10) + axe suites exist; there are no Astro component-render tests.
- **CI deploy path**: the migration / deploy / health-check steps are skipped until `CLOUDFLARE_API_TOKEN` is set in GitHub Actions secrets; they have never executed against Cloudflare.

## Incremental content work
- **Full Spanish content**: navigation, footer, skip link, canonical URLs and the body copy of every public page are translated — home, how it works, about, support, contact, impact, transparency and all its modules (governance, treasury, attestations, reports, funding, methodologies, open source), the MRV methodology page, the evidence explorer, and the project/farm/metric detail headings. Still open: the long-form descriptive paragraphs on the project and farm detail pages, which are generated from the database and therefore follow the source record's language.
- **Product event tracking UI calls**: added to project detail, impact, farms, transparency, treasury, attestations, reports, evidence, resources, partners, about, support, contact, home, data, API docs, graph and search. All 18 tracked events are read back in `/admin/analytics`.
- **Admin editors still missing**: content blocks and the natural-asset / activity / claim / methodology / source catalogues are read-only in the admin UI — they have no create/edit/delete forms yet.

## Deliberately deferred
- **Durable Objects** — not introduced; the PRD explicitly advises against it without a concrete need.
- **PDF generation for automated reports** — reports are published as HTML/JSON/CSV; PDF requires a rendering service.
- **Email delivery of reports** — out of scope; reports are listed and downloadable.
