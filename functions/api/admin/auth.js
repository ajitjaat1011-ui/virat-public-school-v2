/**
 * Admin auth — login / logout / me
 */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';
import { setSessionCookie, clearSessionCookie, getCurrentUser, cuid, rateLimit, checkOrigin } from '../../lib/auth.js';

const SESSION_COOKIE = 'vps_session';

export async function onRequestGet(context) {
  const user = await getCurrentUser(context.request, context.env);
  if (!user) return errorResponse('Not authenticated', 401);
  return jsonResponse({ user });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  try {
    const limit = await rateLimit(env, 'admin-login:' + ip, 10, 15 * 60);
    if (limit.limited) return errorResponse('Too many login attempts. Please try again later.', 429);
  } catch (_) {}
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }
  if (!body.username || !body.password) return errorResponse('Username and password are required', 400);

  const user = await db(env).prepare(
    'SELECT id, username, email, password_hash, name, role, is_active, failed_logins, locked_until FROM users WHERE username = ?1 OR email = ?1'
  ).bind(String(body.username).trim()).first();

  if (!user || !user.is_active) return errorResponse('Invalid username or password', 401);
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return errorResponse('Account temporarily locked. Please try again later.', 423);
  }

  const ok = await verifyPassword(String(body.password), user.password_hash);
  if (!ok) {
    const newFailed = (user.failed_logins || 0) + 1;
    const lockUntil = newFailed >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
    try {
      await db(env).prepare('UPDATE users SET failed_logins = ?1, locked_until = ?2 WHERE id = ?3')
        .bind(newFailed, lockUntil, user.id).run();
    } catch (e) {}
    return errorResponse('Invalid username or password', 401);
  }

  const sid = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 18);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  try {
    await db(env).prepare(
      'INSERT INTO sessions (id, user_id, expires_at, ip, user_agent) VALUES (?1, ?2, ?3, ?4, ?5)'
    ).bind(sid, user.id, expiresAt, request.headers.get('CF-Connecting-IP') || '', request.headers.get('User-Agent') || '').run();
    const updateLogin = db(env).prepare('UPDATE users SET failed_logins = 0, locked_until = NULL, last_login_at = ?1 WHERE id = ?2')
      .bind(new Date().toISOString(), user.id).run().catch(() => {});
    if (typeof context.waitUntil === 'function') context.waitUntil(updateLogin);
  } catch (e) {
    console.error('Session creation failed');
    return errorResponse('Session creation failed', 500);
  }

  const headers = new Headers({ 'Content-Type': 'application/json' });
  setSessionCookie(headers, sid, expiresAt);
  return new Response(JSON.stringify({
    user: { id: user.id, username: user.username, email: user.email, name: user.name, role: user.role }
  }), { status: 200, headers });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const cookies = parseCookies(request);
  const sid = cookies[SESSION_COOKIE];
  if (sid) {
    try { await db(env).prepare('DELETE FROM sessions WHERE id = ?1').bind(sid).run(); } catch (e) {}
  }
  const headers = new Headers({ 'Content-Type': 'application/json' });
  clearSessionCookie(headers);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

function parseCookies(request) {
  const h = request.headers.get('Cookie') || '';
  const out = {};
  h.split(';').forEach((kv) => { const [k, ...rest] = kv.trim().split('='); if (k) out[k] = decodeURIComponent(rest.join('=')); });
  return out;
}

async function verifyPassword(password, stored) {
  if (!stored) return false;
  if (stored.startsWith('$2')) return false; // legacy bcrypt not supported
  if (!stored.startsWith('pbkdf2$')) return false;
  const parts = stored.split('$');
  if (parts.length !== 4) return false;
  const iterStr = parts[1];
  const saltB64 = parts[2];
  const expected = parts[3];
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
