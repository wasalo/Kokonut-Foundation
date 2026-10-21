-- Fix: resources.status was declared in the Drizzle schema but never created.
-- Also backfill metric methodology/source slugs so the V3 evidence-graph chain resolves.
ALTER TABLE resources ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
UPDATE resources SET status = 'published';

UPDATE metrics SET methodology = 'tree-count' WHERE slug = 'coconut-trees' AND (methodology IS NULL OR methodology = '');
UPDATE metrics SET methodology = 'area-measurement' WHERE slug IN ('farm-area','agricultural-area') AND (methodology IS NULL OR methodology = '');
UPDATE metrics SET source = 'kokonut-intelligence' WHERE source IS NOT NULL AND source != 'kokonut-intelligence' AND source NOT LIKE '%/%';

INSERT OR IGNORE INTO methodologies (id, slug, name, description, version, created_at, updated_at)
VALUES ('meth_area','area-measurement','Area Measurement Methodology','Measured mapped area of the farm perimeter.','1.0',datetime('now'),datetime('now'));
