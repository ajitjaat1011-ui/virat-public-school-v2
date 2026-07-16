/**
 * Turso (libSQL) client for Cloudflare Pages Functions.
 * Uses the libSQL HTTP API directly so it works without WASM and without D1.
 *
 * Set these env vars on the Pages project:
 *   TURSO_URL   - libsql://<db>.<org>.turso.io
 *   TURSO_TOKEN - database auth token (starts with eyJ...)
 *
 * Usage (replaces env.DB.prepare(...)):
 *   const r = await tursoQuery(env, 'SELECT * FROM users WHERE id = ?', [id]);
 *   r.rows      - array of objects
 *   r.rowsAffected, r.lastInsertRowid, r.insertId
 */
export async function tursoQuery(env, sql, params = []) {
  const url = env.TURSO_URL;
  const token = env.TURSO_TOKEN;
  if (!url || !token) throw new Error('Turso not configured: set TURSO_URL and TURSO_TOKEN env vars');

  // POST to the libSQL HTTP pipeline endpoint
  // See: https://docs.turso.tech/sdk/http
  const httpUrl = url.replace(/^libsql:/, 'https:');
  const res = await fetch(httpUrl + '/v2/pipeline', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: { sql, args: params.map(toTursoValue) }
        },
        // Close the pipeline after the execute
        { type: 'close' }
      ]
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error('Turso query failed: HTTP ' + res.status + ' — ' + text.slice(0, 200));
  }

  const data = await res.json();
  // libSQL returns { "baton": ..., "results": [ { type, response: {...} } ] }
  const first = data.results?.[0]?.response;
  if (!first) {
    // For non-result statements (DDL, INSERT without RETURNING) it may be { type: 'ok' }
    return { rows: [], rowsAffected: 0, lastInsertRowid: null, insertId: null };
  }

  if (first.type === 'error') {
    throw new Error('Turso SQL error: ' + (first.error?.message || JSON.stringify(first)));
  }

  if (first.type === 'execute') {
    const exec = first.result || {};
    return {
      rows: (exec.rows || []).map(parseRow),
      rowsAffected: exec.rows_affected ?? exec.rowsAffected ?? 0,
      lastInsertRowid: exec.last_insert_rowid ?? exec.lastInsertRowid ?? null,
      insertId: exec.last_insert_rowid ?? exec.lastInsertRowid ?? null
    };
  }

  return { rows: [], rowsAffected: 0, lastInsertRowid: null, insertId: null };
}

/**
 * Run multiple statements in a single pipeline (transaction-like batch).
 * Useful for inserts that should be atomic.
 */
export async function tursoBatch(env, stmts) {
  const url = env.TURSO_URL;
  const token = env.TURSO_TOKEN;
  if (!url || !token) throw new Error('Turso not configured');

  const httpUrl = url.replace(/^libsql:/, 'https:');
  const requests = [];
  for (const { sql, params = [] } of stmts) {
    requests.push({ type: 'execute', stmt: { sql, args: params.map(toTursoValue) } });
  }
  requests.push({ type: 'close' });

  const res = await fetch(httpUrl + '/v2/pipeline', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requests })
  });

  if (!res.ok) throw new Error('Turso batch failed: HTTP ' + res.status);
  return await res.json();
}

function toTursoValue(v) {
  if (v === null || v === undefined) return { type: 'null' };
  if (typeof v === 'number') {
    return Number.isInteger(v) ? { type: 'integer', value: String(v) } : { type: 'float', value: v };
  }
  if (typeof v === 'boolean') return { type: 'integer', value: v ? '1' : '0' };
  // BigInt
  if (typeof v === 'bigint') return { type: 'integer', value: v.toString() };
  // Array of numbers → blob
  if (v instanceof Uint8Array) return { type: 'blob', value: btoa(String.fromCharCode(...v)) };
  // Default: text
  return { type: 'text', value: String(v) };
}

function parseRow(row) {
  // libSQL returns columns as { name, type } and values as positional array
  // We need to zip them into an object
  if (!row || !Array.isArray(row)) return row;
  // If already an object, return as-is
  if (row.columns && Array.isArray(row.values)) {
    const out = {};
    row.columns.forEach((col, i) => {
      out[col] = decodeValue(row.values[i]);
    });
    return out;
  }
  return row;
}

function decodeValue(v) {
  if (!v || typeof v !== 'object') return v;
  if (v.type === 'null') return null;
  if (v.type === 'integer') return parseInt(v.value, 10);
  if (v.type === 'float') return parseFloat(v.value);
  if (v.type === 'text') return v.value;
  if (v.type === 'blob') {
    try { return Uint8Array.from(atob(v.value), c => c.charCodeAt(0)); }
    catch (e) { return v.value; }
  }
  return v.value ?? null;
}
