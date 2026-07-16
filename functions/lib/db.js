/**
 * DB compatibility shim.
 * If env.DB is available (D1), use it directly.
 * Otherwise, use Turso via HTTP (env.TURSO_URL + env.TURSO_TOKEN).
 *
 * The exposed API mimics D1's `prepare().bind().first()/.all()/.run()` pattern
 * so the rest of the codebase doesn't need to change.
 *
 * Usage:
 *   const row = await db(env).prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
 *   const { results } = await db(env).prepare('SELECT * FROM users').all();
 *   await db(env).prepare('INSERT INTO ... VALUES (?, ?)').bind(a, b).run();
 */
import { tursoQuery, tursoBatch } from './turso.js';

export function db(env) {
  if (env.DB) {
    // Use native D1 binding (when configured)
    return env.DB;
  }
  // Fall back to a Turso-backed shim with the same surface API
  return makeTursoAdapter(env);
}

function makeTursoAdapter(env) {
  return {
    prepare(sql) {
      let params = [];
      const exec = () => tursoQuery(env, sql, params);
      return {
        bind(...args) {
          params = args;
          return this;
        },
        first: () => exec().then((r) => r.rows?.[0] || null),
        all: () => exec().then((r) => ({ results: r.rows || [] })),
        run: () => exec().then((r) => ({
          success: true,
          meta: { rows_written: r.rowsAffected || 0, last_row_id: r.lastInsertRowid }
        })),
        raw: () => exec()
      };
    },
    exec: (sql, params) => tursoQuery(env, sql, params),
    batch: (stmts) => tursoBatch(env, stmts)
  };
}
