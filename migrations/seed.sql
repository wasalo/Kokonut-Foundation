-- Seed data
INSERT OR IGNORE INTO projects (id, slug, name, summary, description, status, project_type, country, region, latitude, longitude, start_date, impact_areas, sdgs, metrics, created_at, updated_at)
VALUES ('proj_adelphi', 'adelphi', 'Adelphi Regenerative Farm', 'Live regenerative farm in the Dominican Republic.', 'Adelphi is a live regenerative farm implementing the Kokonut Framework in the Dominican Republic. It demonstrates Fund → Grow → Verify → Repeat with coconut production, free-range hens and community governance.', 'active', 'Regenerative Farm', 'Dominican Republic', 'Adelphi', 18.4861, -69.9312, '2024-01-01', '["Ecology","Agriculture","Community","Economic"]', '[2,13,15]', '["met_farm_area","met_coconut_trees","met_hens","met_sdgs","met_community"]', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO metrics (id, slug, name, description, category, value, unit, project_id, observed_at, source, verification_status, updated_at) VALUES
 ('met_farm_area','farm-area','Regenerative Farm Area','Total regenerative farm area.','Ecology',15725,'m²','proj_adelphi','2026-09-30','Kokonut Intelligence','verified',datetime('now')),
 ('met_coconut_trees','coconut-trees','Coconut Trees','Number of coconut trees.','Agriculture',96,'trees','proj_adelphi','2026-09-30','Kokonut Intelligence','verified',datetime('now')),
 ('met_hens','free-range-hens','Free-Range Hens','Number of free-range hens.','Agriculture',110,'hens','proj_adelphi','2026-09-30','Kokonut Intelligence','verified',datetime('now')),
 ('met_sdgs','sdgs-addressed','SDGs Addressed','Sustainable Development Goals addressed.','Public Goods',5,'','proj_adelphi','2026-09-30','Kokonut Intelligence','verified',datetime('now')),
 ('met_community','community-members','Community Members','Community members engaged.','Community',3000,'+','proj_adelphi','2026-09-30','Kokonut Network','reported',datetime('now'));

INSERT OR IGNORE INTO milestones (id, project_id, title, description, status, due_date) VALUES
 ('ms1','proj_adelphi','Farm established','Initial farm setup.','completed','2024-06-01'),
 ('ms2','proj_adelphi','First harvest cycle','First coconut harvest.','completed','2025-03-01'),
 ('ms3','proj_adelphi','Hen production','Free-range hen operation.','active','2026-01-01');

INSERT OR IGNORE INTO partners (id, slug, name, type, description, country, created_at) VALUES
 ('par_network','kokonut-network','Kokonut Network','Community','Community governance network.','Global',datetime('now'));

INSERT OR IGNORE INTO project_partners (project_id, partner_id) VALUES ('proj_adelphi','par_network');

INSERT OR IGNORE INTO team_members (id, name, role, bio, sort_order) VALUES
 ('tm1','Foundation Stewards','Stewardship','The people growing regenerative farms.',0);

INSERT OR IGNORE INTO resources (id, slug, title, summary, resource_type, published_at, visibility) VALUES
 ('res1','kokonut-framework','Kokonut Framework','Overview of the Kokonut Framework.','Framework','2025-01-01','public');

INSERT OR IGNORE INTO reports (id, slug, title, summary, report_type, project_id, published_at, document_key, authors, visibility) VALUES
 ('rep1','adelphi-annual-2025','Adelphi Annual Report 2025','Annual report for the Adelphi regenerative farm.','Annual','proj_adelphi','2025-12-31','reports/adelphi-annual-2025.pdf','["Kokonut Foundation"]','public');

INSERT OR IGNORE INTO redirects (id, from_path, to_path, status_code) VALUES
 ('red1','/home','/',301);
