-- Kokonut Foundation initial schema
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  project_type TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  latitude REAL,
  longitude REAL,
  start_date TEXT,
  end_date TEXT,
  hero_image TEXT,
  impact_areas TEXT NOT NULL DEFAULT '[]',
  sdgs TEXT NOT NULL DEFAULT '[]',
  partners TEXT NOT NULL DEFAULT '[]',
  metrics TEXT NOT NULL DEFAULT '[]',
  milestones TEXT NOT NULL DEFAULT '[]',
  resources TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS metrics (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  project_id TEXT,
  observed_at TEXT,
  reporting_period_start TEXT,
  reporting_period_end TEXT,
  methodology TEXT,
  source TEXT,
  confidence REAL,
  verification_status TEXT NOT NULL DEFAULT 'reported',
  evidence_ids TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS measurements (
  id TEXT PRIMARY KEY,
  metric_id TEXT NOT NULL,
  project_id TEXT,
  value REAL NOT NULL,
  observed_at TEXT NOT NULL,
  source TEXT,
  methodology TEXT,
  verification_status TEXT NOT NULL DEFAULT 'reported',
  evidence_id TEXT
);

CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  due_date TEXT,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  website TEXT,
  logo TEXT,
  country TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_partners (
  project_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  PRIMARY KEY (project_id, partner_id)
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  photo TEXT,
  email TEXT,
  linkedin TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  resource_type TEXT NOT NULL,
  project_id TEXT,
  topic TEXT,
  year INTEGER,
  sdgs TEXT NOT NULL DEFAULT '[]',
  impact_areas TEXT NOT NULL DEFAULT '[]',
  document_key TEXT,
  external_url TEXT,
  published_at TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public'
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  report_type TEXT NOT NULL,
  project_id TEXT,
  period_start TEXT,
  period_end TEXT,
  published_at TEXT NOT NULL,
  document_key TEXT NOT NULL,
  authors TEXT NOT NULL DEFAULT '[]',
  visibility TEXT NOT NULL DEFAULT 'public'
);

CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_id TEXT,
  metric_id TEXT,
  object_key TEXT,
  external_url TEXT,
  captured_at TEXT,
  uploaded_at TEXT NOT NULL,
  hash TEXT,
  visibility TEXT NOT NULL DEFAULT 'public'
);

CREATE TABLE IF NOT EXISTS attestations (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_id TEXT,
  metric_id TEXT,
  external_url TEXT,
  issued_at TEXT,
  verification_status TEXT NOT NULL DEFAULT 'reported'
);

CREATE TABLE IF NOT EXISTS funding_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  amount REAL,
  currency TEXT,
  funder TEXT,
  project_id TEXT,
  occurred_at TEXT NOT NULL,
  category TEXT,
  external_url TEXT
);

CREATE TABLE IF NOT EXISTS content_blocks (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title TEXT,
  body TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS redirects (
  id TEXT PRIMARY KEY,
  from_path TEXT NOT NULL UNIQUE,
  to_path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_jobs (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TEXT,
  finished_at TEXT,
  details TEXT
);
