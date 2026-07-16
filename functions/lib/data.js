/**
 * Shared response helpers + DB availability check.
 * D1 is checked first; Turso via env.TURSO_URL + env.TURSO_TOKEN is the fallback.
 */

export function errorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function isDbAvailable(env) {
  return !!(env.DB || (env.TURSO_URL && env.TURSO_TOKEN));
}
