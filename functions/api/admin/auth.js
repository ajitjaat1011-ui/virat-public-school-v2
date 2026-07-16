/**
 * Admin auth — login / logout / me
 * With D1: validates against users table. Without D1: returns read-only mode.
 */
import { errorResponse, isD1Available, jsonResponse } from '../../lib/data.js';

const SESSION_COOKIE = 'vps_session';

export async function onRequestGet(context) {
  const user = await getCurrentUser(context.request, context.env);
  if (!user) return errorResponse('Not authenticated', 401);
  return jsonResponse({ user });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!isD1Available(env)) {
    return errorResponse('Admin login is not available in this deployment. The site is currently using static content only.', 503);
  }
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }
  if (!body.username || !body.password) return errorResponse('Username and password are required', 400);
  const user = await env.DB.prepare(
    'SELECT id, username, email, password_hash, name, role, is_active, failed_logins, locked_until FROM users WHERE username = ?1 OR email = ?1'
  ).bind(String(body.username).trim()).first();
  if (!user || !user.is_active) return errorResponse('Invalid username or password', 401);
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return errorResponse('Account temporarily locked', 423);
  }
  // PBKDF2 verify
  const ok = await verifyPassword(String(body.password), user.password_hash);
  if (!ok) {
    const newFailed = (user.failed_logins || 0) + 1;
    const lockUntil = newFailed >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
    await env.DB.prepare('UPDATE users SET failed_logins = ?1, locked_until = ?2 WHERE id = ?3')
      .bind(newFailed, lockUntil, user.id).run();
    return errorResponse('Invalid username or password', 401);
  }
  const sid = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 18);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, expires_at, ip, user_agent) VALUES (?1, ?2, ?3, ?4, ?5)'
  ).bind(sid, user.id, expiresAt, request.headers.get('CF-Connecting-IP') || '', request.headers.get('User-Agent') || '').run();
  await env.DB.prepare('UPDATE users SET failed_logins = 0, locked_until = NULL, last_login_at = ?1 WHERE id = ?2')
    .bind(new Date().toISOString(), user.id).run();
  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(sid)}; Path=/; HttpOnly; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}`);
  return new Response(JSON.stringify({
    user: { id: user.id, username: user.username, email: user.email, name: user.name, role: user.role }
  }), { status: 200, headers });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const cookies = parseCookies(request);
  const sid = cookies[SESSION_COOKIE];
  if (sid && isD1Available(env)) {
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?1').bind(sid).run();
  }
  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

async function getCurrentUser(request, env) {
  if (!isD1Available(env)) return null;
  const cookies = parseCookies(request);
  const sid = cookies[SESSION_COOKIE];
  if (!sid) return null;
  const s = await env.DB.prepare(
    'SELECT u.id, u.username, u.email, u.name, u.role, u.is_active, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?1'
  ).bind(sid).first();
  if (!s || !s.is_active || new Date(s.expires_at) < new Date()) return null;
  return { id: s.id, username: s.username, email: s.email, name: s.name, role: s.role };
}

function parseCookies(request) {
  const h = request.headers.get('Cookie') || '';
  const out = {};
  h.split(';').forEach((kv) => { const [k, ...rest] = kv.trim().split('='); if (k) out[k] = decodeURIComponent(rest.join('=')); });
  return out;
}

async function verifyPassword(password, stored) {
  if (!stored || !stored.startsWith('pbkdf2$')) return false;
  const [, iterStr, saltB64, expected] = stored.split('$');
  const iter = parseInt(iterStr, 10);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const saltBytes = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations: iter, hash: 'SHA-256' }, keyMaterial, 256);
  const got = btoa(String.fromCharCode(...new Uint8Array(bits)));
  return timingSafeEqual(got, expected);
}
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
