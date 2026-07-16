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
  const exec = (sql, params = []) => {
    const promise = tursoQuery(env, sql, params);
    return {
      first: () => promise.then((r) => r.rows?.[0] || null),
      all: () => promise.then((r) => ({ results: r.rows || [] })),
      run: () => promise.then((r) => ({
        success: true,
        meta: {
          rows_written: r.rowsAffected || 0,
          last_row_id: r.lastInsertRowid
        }
      })),
      raw: () => promise
    };
  };
  return {
    prepare(sql) {
      let params = [];
      return {
        bind(...args) {
          params = args;
          return {
            first: () => tursoQuery(env, sql, params).then((r) => r.rows?.[0] || null),
            all: () => tursoQuery(env, sql, params).then((r) => ({ results: r.rows || [] })),
            run: () => tursoQuery(env, sql, params).then((r) => ({
              success: true,
              meta: { rows_written: r.rowsAffected || 0, last_row_id: r.lastInsertRowid }
            })),
            raw: () => tursoQuery(env, sql, params)
          };
        },
        // Allow calling .bind(...) chain
        first: () => tursoQuery(env, sql, []).then((r) => r.rows?.[0] || null),
        all: () => tursoQuery(env, sql, []).then((r) => ({ results: r.rows || [] })),
        run: () => tursoQuery(env, sql, []).then((r) => ({
          success: true,
          meta: { rows_written: r.rowsAffected || 0, last_row_id: r.lastInsertRowid }
        }))
      };
    },
    // Allow direct exec(sql, params)
    exec: (sql, params) => tursoQuery(env, sql, params),
    batch: (stmts) => tursoBatch(env, stmts)
  };
}
