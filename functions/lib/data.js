/**
 * Shared helpers for the API endpoints.
 * Each endpoint tries D1 first, then falls back to static JSON in /public/data/
 * so the site works even without a D1 binding.
 */

const STATIC_DATA_BASE = '/data';

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

export async function loadStatic(env, filename) {
  try {
    const origin = env.ORIGIN_URL || (env.DEPLOY_URL ? 'https://' + env.DEPLOY_URL : 'https://virat-public-school-v2.pages.dev');
    const r = await fetch(origin + STATIC_DATA_BASE + '/' + filename);
    if (!r.ok) return null;
    return await r.json();
  } catch (e) {
    return null;
  }
}

export function isD1Available(env) {
  return !!env.DB;
}
