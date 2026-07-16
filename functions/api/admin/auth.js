/**
 * Admin auth — login / logout / me
 */
import {
  json, errorResponse, setSessionCookie, clearSessionCookie,
  getCurrentUser, verifyPassword, rateLimit, cleanupRateLimits, audit, cuid
} from '../../lib/auth.js';

export async function onRequestGet(context) {
  // GET /api/admin/auth — return current user
  const user = await getCurrentUser(context.request, context.env);
  if (!user) return errorResponse('Not authenticated', 401);
  return json({ user });
}

export async function onRequestPost(context) {
  // POST /api/admin/auth — login
  const { request, env } = context;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  // Rate limit: 5 per IP per minute
  await cleanupRateLimits(env);
  const limit = await rateLimit(env, `admin-login:${ip}`, 5, 60);
  if (limit.limited) {
    return new Response(JSON.stringify({ error: 'Too many attempts. Please wait a moment.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(limit.retryAfter) }
    });
  }

  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }
  if (!body.username || !body.password) return errorResponse('Username and password are required', 400);

  // Look up user
  const user = await env.DB.prepare(
    'SELECT id, username, email, password_hash, name, role, is_active, failed_logins, locked_until FROM users WHERE username = ?1 OR email = ?1'
  ).bind(String(body.username).trim()).first();

  if (!user || !user.is_active) {
    return errorResponse('Invalid username or password', 401);
  }

  // Check lockout
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return errorResponse('Account temporarily locked. Please try again later.', 423);
  }

  // Verify password
  const ok = await verifyPassword(String(body.password), user.password_hash);
  if (!ok) {
    const newFailed = (user.failed_logins || 0) + 1;
    const lockUntil = newFailed >= 5
      ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
      : null;
    await env.DB.prepare('UPDATE users SET failed_logins = ?1, locked_until = ?2 WHERE id = ?3')
      .bind(newFailed, lockUntil, user.id).run();
    await audit(env, user.id, 'user.login.failed', 'User', user.id, ip, { reason: 'bad password' });
    return errorResponse('Invalid username or password', 401);
  }

  // Success — create session
  const sid = cuid() + cuid();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, expires_at, ip, user_agent) VALUES (?1, ?2, ?3, ?4, ?5)'
  ).bind(sid, user.id, expiresAt, ip, request.headers.get('User-Agent') || '').run();

  await env.DB.prepare('UPDATE users SET failed_logins = 0, locked_until = NULL, last_login_at = ?1 WHERE id = ?2')
    .bind(new Date().toISOString(), user.id).run();

  await audit(env, user.id, 'user.login', 'User', user.id, ip, null);

  const headers = new Headers();
  setSessionCookie(headers, sid, expiresAt);
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify({
    user: { id: user.id, username: user.username, email: user.email, name: user.name, role: user.role }
  }), { status: 200, headers });
}

export async function onRequestDelete(context) {
  // Logout
  const { request, env } = context;
  const cookies = parseCookiesLocal(request);
  const sid = cookies['vps_session'];
  if (sid) {
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?1').bind(sid).run();
    await audit(env, null, 'user.logout', 'User', null, request.headers.get('CF-Connecting-IP') || null, null);
  }
  const headers = new Headers();
  clearSessionCookie(headers);
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

function parseCookiesLocal(request) {
  const header = request.headers.get('Cookie') || '';
  const out = {};
  header.split(';').forEach((kv) => {
    const [k, ...rest] = kv.trim().split('=');
    if (!k) return;
    out[k] = decodeURIComponent(rest.join('='));
  });
  return out;
}
