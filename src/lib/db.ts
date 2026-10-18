import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export type DB = ReturnType<typeof drizzle<typeof schema>>;

export function getDb(env: { DB: D1Database }): DB {
  return drizzle(env.DB, { schema });
}

// Convenience for pages: const db = getDb(Astro.locals.runtime.env);
export { schema };
