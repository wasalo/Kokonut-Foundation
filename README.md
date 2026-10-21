# Kokonut Foundation — Cloudflare-Native Web Platform

Astro + TypeScript + Cloudflare Workers (D1, R2, KV, Queues, Workflows).

## Develop
```bash
npm install
cp .dev.vars.example .dev.vars   # fill in local secrets
npm run dev
```

## Build / Test
```bash
npm run typecheck
npm test
npm run build
```

## Deploy
```bash
# 1. Create Cloudflare resources (one-time)
wrangler d1 create kokonut-foundation-db
wrangler r2 bucket create kokonut-foundation-media
wrangler kv namespace create CONFIG
wrangler queues create kokonut-sync-queue

# 2. Put the real IDs into wrangler.jsonc (d1_databases[].database_id, kv_namespaces[].id)

# 3. Set secrets
wrangler secret put TURNSTILE_SECRET_KEY
wrangler secret put CF_WEB_ANALYTICS_TOKEN   # optional
wrangler secret put KI_API_URL               # optional
wrangler secret put KI_API_KEY               # optional
wrangler secret put ETH_RPC_URL              # optional
wrangler secret put RESTRICTED_ACCESS_TOKEN  # optional

# 4. Apply schema + seed
npm run db:migrate:remote
npm run db:seed:remote

# 5. Deploy
npm run deploy
```

### GitHub Actions secrets
- `CLOUDFLARE_API_TOKEN` (Workers Scripts:Edit, D1:Edit, R2:Edit, KV:Edit, Queues:Edit)
- `CLOUDFLARE_ACCOUNT_ID`

The deploy step is skipped automatically when `CLOUDFLARE_API_TOKEN` is not set.

## Environment variables

| Name | Type | Purpose |
|---|---|---|
| `DB` | binding | D1 database |
| `MEDIA` | binding | R2 bucket (evidence, reports) |
| `CONFIG` | binding | KV namespace (rate limits, caches, event counters) |
| `SYNC_QUEUE` | binding | Queues producer (KI sync) |
| `PUBLISH_REPORT` | binding | Workflows binding (durable report publishing) |
| `ENVIRONMENT` | var | `production` \| `preview` \| `development` |
| `TURNSTILE_SITE_KEY` | var | Public Turnstile site key |
| `TURNSTILE_SECRET_KEY` | secret | Turnstile server verification (**required in production**) |
| `ADMIN_DEV_BYPASS` | var | Local-only admin bypass — never `true` in production |
| `CF_WEB_ANALYTICS_TOKEN` | secret | Cloudflare Web Analytics beacon token |
| `ACCESS_TEAM_DOMAIN` | secret | Cloudflare Access team domain (`<team>.cloudflareaccess.com`) — **required in production** |
| `ACCESS_AUD` | secret | Cloudflare Access application AUD tag — **required in production** |
| `KI_API_URL` | secret | Kokonut Intelligence API base URL |
| `KI_API_KEY` | secret | Kokonut Intelligence API bearer token |
| `ETH_RPC_URL` | secret | Ethereum RPC endpoint for treasury balances |
| `RESTRICTED_ACCESS_TOKEN` | secret | Required to download restricted-visibility files |

## Migrations
Hand-authored, ordered SQL migrations live in `migrations/` and are applied with
`wrangler d1 migrations apply`. `drizzle-kit generate` writes review artifacts to
`drizzle/` so it never collides with the applied chain.

## Kokonut Intelligence Integration
The Foundation platform is the public presentation layer. Kokonut Intelligence (KI) is the
governed data layer (PostgreSQL + PostGIS, Directus, ClickHouse, Redis, EAS on Celo,
Foundry on Gnosis). Sync endpoint: `/api/admin/sync/ki`. Webhook: `/api/admin/sync/webhook`.
KI API credentials via `KI_API_URL` and `KI_API_KEY` secrets. Record lifecycle:
draft → submitted → verified → published. Evidence maturity: narrative → structured →
reviewed → evidence-linked → attested → externally verified. Gnosis = governance/treasury;
Celo = EAS attestations. KI repo: https://github.com/wasalo/Kokonut-Intelligence
