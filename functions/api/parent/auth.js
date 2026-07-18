/**
 * Parent auth — register (request), login, logout, me
 * - POST register  → creates a PENDING parent (admin must approve)
 * - POST login     → only succeeds if status = APPROVED
 * - GET  me        → returns current parent (or 401)
 * - DELETE logout  → clears session
 */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';
import { ensureParentLinkSchema } from '../../lib/migrations.js';
import {
  hashPassword, verifyPassword, cuid,
  setParentSessionCookie, clearParentSessionCookie,
  getCurrentParent, checkOrigin, audit, rateLimit
} from '../../lib/auth.js';

const SESSION_COOKIE = 'vps_parent';

export async function onRequestGet(context) {
  const parent = await getCurrentParent(context.request, context.env);
  if (!parent) return errorResponse('Not authenticated', 401);
  return jsonResponse({ parent });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);

  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }

  // === REGISTER (request account) ===
  if (body.action === 'register') {
    try { await ensureParentLinkSchema(env); }
    catch (error) { return errorResponse('Parent portal setup failed. Please try again shortly.', 503); }
    return register(request, env, body);
  }

  // === LOGIN ===
  return login(context, body);
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const cookies = parseCookies(request);
  const sid = cookies[SESSION_COOKIE];
  if (sid) {
    try { await db(env).prepare('DELETE FROM parent_sessions WHERE id = ?1').bind(sid).run(); } catch (e) {}
  }
  const headers = new Headers({ 'Content-Type': 'application/json' });
  clearParentSessionCookie(headers);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

function parseCookies(request) {
  const h = request.headers.get('Cookie') || '';
  const out = {};
  h.split(';').forEach((kv) => { const [k, ...rest] = kv.trim().split('='); if (k) out[k] = decodeURIComponent(rest.join('=')); });
  return out;
}

// === Registration ===
async function register(request, env, body) {
  const full_name = String(body.full_name || '').trim();
  const phone     = String(body.phone || '').trim().replace(/[^\d]/g, '');
  const password  = String(body.password || '');
  // Optional: child info to seed the parent_students link
  const student_name = String(body.student_name || '').trim();
  const class_name   = String(body.class_name || '').trim();
  const section      = String(body.section || '').trim() || null;
  const roll_number  = String(body.roll_number || '').trim() || null;
  const admission_number = String(body.admission_number || '').trim() || null;
  const dob = String(body.dob || '').trim() || null;

  if (!full_name || full_name.length < 2) return errorResponse('Please enter your full name', 400);
  if (!/^[6-9]\d{9}$/.test(phone)) return errorResponse('Please enter a valid 10-digit mobile number', 400);
  if (!password || password.length < 6) return errorResponse('Password must be at least 6 characters', 400);
  if (student_name && !class_name) return errorResponse('Please choose your child’s class', 400);
  if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return errorResponse('Please enter a valid date of birth', 400);

  try {
    const limit = await rateLimit(env, 'parent-register:' + (request.headers.get('CF-Connecting-IP') || 'unknown'), 5, 60 * 60);
    if (limit.limited) return errorResponse('Too many registration attempts. Please try again later.', 429);
  } catch (_) {}

  // Check duplicate
  const existing = await db(env).prepare('SELECT id, status FROM parents WHERE phone = ?1').bind(phone).first();
  if (existing) {
    if (existing.status === 'PENDING') return jsonResponse({
      ok: true,
      duplicate: true,
      reference: 'PAR-' + String(existing.id).slice(-6).toUpperCase(),
      message: 'This account request is already pending review.'
    });
    if (existing.status === 'APPROVED') return errorResponse('An account already exists. Please log in.', 409);
    if (existing.status === 'REJECTED')  return errorResponse('Your previous request was rejected. Please contact the school office.', 403);
  }

  const id = 'p_' + cuid();
  const hash = await hashPassword(password);
  try {
    await db(env).prepare(
      'INSERT INTO parents (id, full_name, phone, password_hash, status) VALUES (?1, ?2, ?3, ?4, ?5)'
    ).bind(id, full_name, phone, hash, 'PENDING').run();

    // If child info was provided, queue it for admin to confirm at approval time
    if (student_name && class_name) {
      await db(env).prepare(
        `INSERT INTO parent_students
          (id, parent_id, student_name, admission_number, class_name, section, roll_number, dob, link_status)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 'REQUESTED')`
      ).bind('ps_' + cuid(), id, student_name, admission_number, class_name, section, roll_number, dob).run();
    }

    await audit(env, null, 'parent.register', 'Parent', id,
      request.headers.get('CF-Connecting-IP') || '',
      { full_name, phone });
  } catch (e) {
    return errorResponse('Could not save request: ' + e.message, 500);
  }

  return jsonResponse({
    ok: true,
    reference: 'PAR-' + id.slice(-6).toUpperCase(),
    message: 'Your account request has been submitted. The school office will verify your account and child details.'
  });
}

// === Login (only for APPROVED parents) ===
async function login(context, body) {
  const { request, env } = context;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  try {
    const limit = await rateLimit(env, 'parent-login:' + ip, 12, 15 * 60);
    if (limit.limited) return errorResponse('Too many login attempts. Please try again later.', 429);
  } catch (_) {}
  const phone    = String(body.phone || '').trim().replace(/[^\d]/g, '');
  const password = String(body.password || '');
  if (!phone || !password) return errorResponse('Mobile number and password are required', 400);

  const parent = await db(env).prepare(
    'SELECT id, full_name, phone, password_hash, status, failed_logins, locked_until FROM parents WHERE phone = ?1'
  ).bind(phone).first();

  if (!parent) return errorResponse('Invalid mobile number or password', 401);

  // Different message if not yet approved (don't leak too much)
  if (parent.status === 'PENDING') {
    return errorResponse('Your account request is still pending review. Please check back later.', 403);
  }
  if (parent.status === 'REJECTED') {
    return errorResponse('Your account request was not approved. Please contact the school office.', 403);
  }
  if (parent.locked_until && new Date(parent.locked_until) > new Date()) {
    return errorResponse('Account temporarily locked. Please try again later.', 423);
  }

  const ok = await verifyPassword(password, parent.password_hash);
  if (!ok) {
    const newFailed = (parent.failed_logins || 0) + 1;
    const lockUntil = newFailed >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
    try {
      await db(env).prepare('UPDATE parents SET failed_logins = ?1, locked_until = ?2 WHERE id = ?3')
        .bind(newFailed, lockUntil, parent.id).run();
    } catch (e) {}
    return errorResponse('Invalid mobile number or password', 401);
  }

  const sid = 'ps_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 18);
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  try {
    await db(env).prepare(
      'INSERT INTO parent_sessions (id, parent_id, expires_at, ip, user_agent) VALUES (?1, ?2, ?3, ?4, ?5)'
    ).bind(sid, parent.id, expiresAt, request.headers.get('CF-Connecting-IP') || '', request.headers.get('User-Agent') || '').run();
    const updateLogin = db(env).prepare('UPDATE parents SET failed_logins = 0, locked_until = NULL, last_login_at = ?1 WHERE id = ?2')
      .bind(new Date().toISOString(), parent.id).run().catch(() => {});
    if (typeof context.waitUntil === 'function') context.waitUntil(updateLogin);
  } catch (e) {
    return errorResponse('Session creation failed: ' + e.message, 500);
  }

  const headers = new Headers({ 'Content-Type': 'application/json' });
  setParentSessionCookie(headers, sid, expiresAt);
  return new Response(JSON.stringify({
    parent: { id: parent.id, full_name: parent.full_name, phone: parent.phone, status: parent.status }
  }), { status: 200, headers });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
