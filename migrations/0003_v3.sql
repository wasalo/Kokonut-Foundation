-- V3: evidence graph entities
CREATE TABLE IF NOT EXISTS natural_assets (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  project_id TEXT,
  farm_id TEXT,
  description TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  natural_asset_id TEXT,
  project_id TEXT,
  description TEXT,
  occurred_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  project_id TEXT,
  metric_id TEXT,
  status TEXT NOT NULL DEFAULT 'reported',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS methodologies (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT,
  document_key TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  url TEXT,
  description TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence_links (
  evidence_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  PRIMARY KEY (evidence_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS attestation_chain_refs (
  id TEXT PRIMARY KEY,
  attestation_id TEXT NOT NULL,
  chain TEXT NOT NULL,
  uid TEXT NOT NULL,
  tx_hash TEXT,
  attester TEXT,
  schema_id TEXT,
  issued_at TEXT,
  source_url TEXT
);

CREATE TABLE IF NOT EXISTS historical_metric_snapshots (
  id TEXT PRIMARY KEY,
  metric_id TEXT NOT NULL,
  period_start TEXT,
  period_end TEXT,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS treasury_transactions (
  id TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL,
  tx_hash TEXT,
  chain TEXT NOT NULL,
  block_number INTEGER,
  from_addr TEXT,
  to_addr TEXT,
  asset TEXT NOT NULL,
  amount REAL NOT NULL,
  value_usd REAL,
  occurred_at TEXT NOT NULL,
  category TEXT,
  interpretation_label TEXT,
  source TEXT NOT NULL DEFAULT 'foundation'
);

CREATE TABLE IF NOT EXISTS report_templates (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_natural_assets_project ON natural_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_natural_assets_farm ON natural_assets(farm_id);
CREATE INDEX IF NOT EXISTS idx_activities_asset ON activities(natural_asset_id);
CREATE INDEX IF NOT EXISTS idx_activities_project ON activities(project_id);
CREATE INDEX IF NOT EXISTS idx_claims_project ON claims(project_id);
CREATE INDEX IF NOT EXISTS idx_claims_metric ON claims(metric_id);
CREATE INDEX IF NOT EXISTS idx_evidence_links_evidence ON evidence_links(evidence_id);
CREATE INDEX IF NOT EXISTS idx_evidence_links_target ON evidence_links(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_attestation_refs_attestation ON attestation_chain_refs(attestation_id);
CREATE INDEX IF NOT EXISTS idx_hist_snap_metric ON historical_metric_snapshots(metric_id);
CREATE INDEX IF NOT EXISTS idx_treasury_tx_wallet ON treasury_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_treasury_tx_occurred ON treasury_transactions(occurred_at);

-- Seed Adelphi natural asset + activity + methodology + source
INSERT OR IGNORE INTO natural_assets (id, slug, name, asset_type, project_id, farm_id, description, created_at)
VALUES ('na_coconut','coconut-trees','Coconut Trees','crop','proj_adelphi','farm_adelphi','Coconut trees at Adelphi farm.',datetime('now'));

INSERT OR IGNORE INTO activities (id, slug, name, natural_asset_id, project_id, description, occurred_at, created_at)
VALUES ('act_harvest_2025','harvest-2025','First Coconut Harvest','na_coconut','proj_adelphi','First harvest cycle at Adelphi.','2025-03-01',datetime('now'));

INSERT OR IGNORE INTO methodologies (id, slug, name, description, version, created_at, updated_at)
VALUES ('meth_tree_count','tree-count','Tree Count Methodology','Count of coconut trees on farm via field observation.','1.0',datetime('now'),datetime('now'));

INSERT OR IGNORE INTO sources (id, slug, name, source_type, url, description, created_at)
VALUES ('src_ki','kokonut-intelligence','Kokonut Intelligence','system','https://kokonut.intelligence','Kokonut Intelligence MRV data.',datetime('now'));

INSERT OR IGNORE INTO evidence_links (evidence_id, target_type, target_id)
SELECT id,'metric',metric_id FROM evidence WHERE metric_id IS NOT NULL;
