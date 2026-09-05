import { Pool } from "pg";

/**
 * Server-only Postgres pool for the intelligence engine's aggregate
 * SQL queries. Never import this from client components.
 *
 * We use `pg` directly (rather than the Supabase JS client) for the
 * intelligence engine specifically because it needs multi-table
 * aggregate SQL (views, window functions) that's awkward to express
 * through a REST-style query builder. The Supabase client in
 * lib/db/supabase.ts is still used for simpler CRUD (e.g. webhooks).
 */
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("Missing DATABASE_URL environment variable.");
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}
