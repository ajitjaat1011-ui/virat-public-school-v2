/**
 * Turso (libSQL) client for Cloudflare Pages Functions.
 * Uses the libSQL HTTP API directly so it works without WASM and without D1.
 *
 * Configuration priority:
 *   1. env.TURSO_URL + env.TURSO_TOKEN (set via Cloudflare dashboard or wrangler secret)
 *   2. HARDCODED_FALLBACK below (used in this deployment where env vars aren't propagating)
 *
 * To change the database, update HARDCODED_FALLBACK and redeploy.
 */

const HARDCODED_FALLBACK = {
  url: 'libsql://virat-public-school-ajitjaat1011-ui.aws-ap-south-1.turso.io',
  token: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODQxNzI0ODEsImlkIjoiMDE5ZjY4ZjctNWMwMS03NDVhLTllZDItZTIzNzAyZmIwYzRhIiwia2lkIjoienVDWHBCUlUtOU1paW1aOW45NlhYRUJyRzdUU0U3Y1JJWG4zbE5rQUxzWSIsInJpZCI6IjBhMjBkYmFmLTc5YTktNDliOC1hZDg2LWMzYzNiOGEyYzgxZCJ9.luNfzLTKvqXKQlLyOM4suZbdCihXhKlxwTwoVCvLELFQyjlUu5E_Q5PiLTAn6hEscx2_IC7Y1MuqT185DDD_BA'
};

function getConfig(env) {
  const url = (env && env.TURSO_URL) || HARDCODED_FALLBACK.url;
  const token = (env && env.TURSO_TOKEN) || HARDCODED_FALLBACK.token;
  if (!url || !token) throw new Error('Turso not configured: set TURSO_URL and TURSO_TOKEN env vars or update HARDCODED_FALLBACK in functions/lib/turso.js');
  return { url, token };
}

export async function tursoQuery(env, sql, params = []) {
  const { url, token } = getConfig(env);
  const httpUrl = url.replace(/^libsql:/, 'https:');
  const res = await fetch(httpUrl + '/v2/pipeline', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: params.map(toTursoValue) } },
        { type: 'close' }
      ]
    })
  });
  if (!res.ok) throw new Error('Turso query failed: HTTP ' + res.status + ' — ' + (await res.text()).slice(0, 200));
  const data = await res.json();
  const first = data.results?.[0]?.response;
  if (!first) return { rows: [], rowsAffected: 0, lastInsertRowid: null, insertId: null };
  if (first.type === 'error') throw new Error('Turso SQL error: ' + (first.error?.message || JSON.stringify(first)));
  if (first.type === 'execute') {
    const exec = first.result || {};
    const cols = (exec.cols || []).map((c) => c.name);
    const rows = (exec.rows || []).map((values) => {
      const obj = {};
      cols.forEach((col, i) => { obj[col] = decodeValue(values[i]); });
      return obj;
    });
    return {
      rows,
      rowsAffected: exec.rows_affected ?? exec.rowsAffected ?? exec.affected_row_count ?? 0,
      lastInsertRowid: exec.last_insert_rowid ?? exec.lastInsertRowid ?? null,
      insertId: exec.last_insert_rowid ?? exec.lastInsertRowid ?? null
    };
  }
  return { rows: [], rowsAffected: 0, lastInsertRowid: null, insertId: null };
}

export async function tursoBatch(env, stmts) {
  const { url, token } = getConfig(env);
  const httpUrl = url.replace(/^libsql:/, 'https:');
  const requests = [];
  for (const { sql, params = [] } of stmts) {
    requests.push({ type: 'execute', stmt: { sql, args: params.map(toTursoValue) } });
  }
  requests.push({ type: 'close' });
  const res = await fetch(httpUrl + '/v2/pipeline', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
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
  if (typeof v === 'bigint') return { type: 'integer', value: v.toString() };
  if (v instanceof Uint8Array) return { type: 'blob', value: btoa(String.fromCharCode(...v)) };
  return { type: 'text', value: String(v) };
}

function parseRow(row) {
  if (!row || !Array.isArray(row)) return row;
  if (row.columns && Array.isArray(row.values)) {
    const out = {};
    row.columns.forEach((col, i) => { out[col] = decodeValue(row.values[i]); });
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
