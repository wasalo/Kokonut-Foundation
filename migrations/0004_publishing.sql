-- V3.1: publishing workflow states
ALTER TABLE reports ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE evidence ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE metrics ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
UPDATE reports SET status = 'published';
UPDATE evidence SET status = 'published';
UPDATE metrics SET status = 'published';
