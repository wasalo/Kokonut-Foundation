-- Admin role assignments.
-- Authentication stays with Cloudflare Access (PRD §33); this table maps the
-- verified Access identity (email) to a Foundation role (PRD §34).
CREATE TABLE IF NOT EXISTS admin_roles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  granted_by TEXT,
  granted_at TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON admin_roles(role);
