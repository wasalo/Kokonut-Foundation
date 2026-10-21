-- V2: explorers, farms, treasury, attestation, evidence, KI sync

CREATE TABLE IF NOT EXISTS farms (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  project_id TEXT,
  country TEXT NOT NULL,
  region TEXT,
  latitude REAL,
  longitude REAL,
  area_m2 REAL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wallets (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  chain TEXT NOT NULL,
  label TEXT NOT NULL,
  wallet_type TEXT NOT NULL DEFAULT 'foundation',
  visibility TEXT NOT NULL DEFAULT 'public',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS treasury_entries (
  id TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL,
  asset TEXT NOT NULL,
  amount REAL NOT NULL,
  value_usd REAL,
  occurred_at TEXT NOT NULL,
  tx_hash TEXT,
  category TEXT,
  interpretation_label TEXT,
  source TEXT NOT NULL DEFAULT 'foundation',
  project_id TEXT
);

CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  scopes TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  last_used_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_farms_project ON farms(project_id);
CREATE INDEX IF NOT EXISTS idx_treasury_wallet ON treasury_entries(wallet_id);
CREATE INDEX IF NOT EXISTS idx_treasury_occurred ON treasury_entries(occurred_at);
CREATE INDEX IF NOT EXISTS idx_measurements_metric ON measurements(metric_id);
CREATE INDEX IF NOT EXISTS idx_evidence_project ON evidence(project_id);
CREATE INDEX IF NOT EXISTS idx_evidence_metric ON evidence(metric_id);
CREATE INDEX IF NOT EXISTS idx_attestations_project ON attestations(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_resources_project ON resources(project_id);
CREATE INDEX IF NOT EXISTS idx_reports_project ON reports(project_id);

-- Seed Adelphi farm (KB-enriched columns are added in 0005_kb_enrichment.sql)
INSERT OR IGNORE INTO farms (id, slug, name, project_id, country, region, latitude, longitude, area_m2, description, status, created_at, updated_at)
VALUES ('farm_adelphi','adelphi','Adelphi Regenerative Farm','proj_adelphi','Dominican Republic','Gonzalo, Sabana Grande de Boyá, Monte Plata',18.9388,-69.7350,15725,'Women-led syntropic farm. First live Kokonut reference farm.','active',datetime('now'),datetime('now'));

-- Seed sample treasury entries
INSERT OR IGNORE INTO wallets (id, address, chain, label, wallet_type, visibility, created_at)
VALUES ('wal_foundation','0x000000000000000000000000000000000000f00d','ethereum','Foundation Treasury','foundation','public',datetime('now'));

INSERT OR IGNORE INTO treasury_entries (id, wallet_id, asset, amount, value_usd, occurred_at, category, interpretation_label, source)
VALUES ('te1','wal_foundation','ETH',1.5,4500,'2025-06-01','donation','Public-goods donation (Foundation interpretation)','onchain');
