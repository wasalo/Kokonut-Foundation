import fs from "node:fs";
import path from "node:path";
import initSqlJs from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import * as schema from "../../src/lib/schema";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "migrations");

/**
 * Applies the real, ordered migration chain to an in-memory SQL engine so
 * integration tests exercise the exact schema production uses.
 */
export async function createTestDb() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && /^\d{4}_/.test(f))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    db.run(sql);
  }

  return { db, orm: drizzle(db, { schema }), files };
}

/** Loads the seed SQL into the given sql.js database. */
export function applySeed(db: any) {
  const seed = fs.readFileSync(path.resolve(process.cwd(), "scripts", "seed.sql"), "utf8");
  db.run(seed);
}

/** Column names for a table, read through a prepared statement. */
export function columns(db: any, table: string): string[] {
  const stmt = db.prepare(`PRAGMA table_info(${table})`);
  const rows: any[] = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows.map((r) => r.name);
}

/** Table names present in the database. */
export function tables(db: any): string[] {
  const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  const rows: any[] = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows.map((r) => r.name);
}
