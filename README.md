# Kokonut Foundation — Cloudflare-Native Web Platform

Astro + TypeScript + Cloudflare Workers (D1, R2, KV, Queues, Workflows).

## Develop
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Test
```bash
npm test
```

## Typecheck
```bash
npm run typecheck
```

## Deploy
```bash
npm run deploy
```

## Database
```bash
npm run db:migrate:local
npm run db:seed:local
```

## Kokonut Intelligence Integration
The Foundation platform is the public presentation layer. Kokonut Intelligence (KI) is the governed data layer (PostgreSQL + PostGIS, Directus, ClickHouse, Redis, EAS on Celo, Foundry on Gnosis). Sync endpoint: `/api/admin/sync/ki`. Webhook: `/api/admin/sync/webhook`. KI API credentials via `KI_API_URL` and `KI_API_KEY` secrets. Record lifecycle: draft → submitted → verified → published. Evidence maturity: narrative → structured → reviewed → evidence-linked → attested → externally verified. Gnosis = governance/treasury; Celo = EAS attestations. KI repo: https://github.com/wasalo/Kokonut-Intelligence
