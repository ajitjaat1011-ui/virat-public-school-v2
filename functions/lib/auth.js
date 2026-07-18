/**
 * Auth helpers — session management, password hashing, rate limiting
 * Used by all admin functions.
 */

const SESSION_COOKIE = 'vps_session';
const SESSION_TTL_DAYS = 7;
const BCRYPT_PREFIX = '$2b$12$'; // we use cost factor 12

// ---------- ID generation ----------
export function cuid() {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// ---------- Password hashing ----------
// Uses Web Crypto API (available in Cloudflare Pages runtime).
// We implement PBKDF2-SHA256 with high iterations as a stand-in for bcrypt,
// since bcrypt is not available in the Pages runtime without WASM.
// (Same security properties for our purposes; documented in README.)

const PBKDF2_ITER = 100000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

async function pbkdf2(password, salt, iterations = PBKDF2_ITER) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
  );
  const saltBytes = typeof salt === 'string'
    ? Uint8Array.from(atob(salt), (c) => c.charCodeAt(0))
    : salt;
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' },
    keyMaterial,
    KEY_BITS
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await pbkdf2(password, salt);
  return `pbkdf2$${PBKDF2_ITER}$${btoa(String.fromCharCode(...salt))}$${hash}`;
}

export async function verifyPassword(password, stored) {
  if (!stored) return false;
  // Legacy bcrypt support (only for the seeded default admin)
  if (stored.startsWith('$2')) {
    // Cannot verify bcrypt without WASM. For initial bootstrap we keep the
    // seed user and require password reset on first login.
    // The actual seeded password hash is the PBKDF2 form below.
    return false;
  }
  if (!stored.startsWith('pbkdf2$')) return false;
  const [, iterStr, saltB64, expectedHash] = stored.split('$');
  const iter = parseInt(iterStr, 10);
  const hash = await pbkdf2(password, saltB64, iter);
  return timingSafeEqual(hash, expectedHash);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ---------- Cookies ----------
export function parseCookies(request) {
  const header = request.headers.get('Cookie') || '';
  const out = {};
  header.split(';').forEach((kv) => {
    const [k, ...rest] = kv.trim().split('=');
    if (!k) return;
    out[k] = decodeURIComponent(rest.join('='));
  });
  return out;
}

export function setSessionCookie(headers, sessionId, expiresAt) {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    `Path=/`,
    `HttpOnly`,
    `Secure`,
    `SameSite=Lax`,
    `Expires=${new Date(expiresAt).toUTCString()}`
  ];
  headers.append('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(headers) {
  headers.append('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

// ---------- Session lookup ----------
import { db } from './db.js';

export async function getCurrentUser(request, env) {
  const cookies = parseCookies(request);
  const sid = cookies[SESSION_COOKIE];
  if (!sid) return null;
  const session = await db(env).prepare(
    'SELECT s.id, s.user_id, s.expires_at, u.id as u_id, u.username, u.email, u.name, u.role, u.is_active FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?1'
  ).bind(sid).first();
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;
  if (!session.is_active) return null;
  return {
    id: session.u_id,
    username: session.username,
    email: session.email,
    name: session.name,
    role: session.role
  };
}

export async function requireUser(request, env) {
  const user = await getCurrentUser(request, env);
  if (!user) {
    return { user: null, error: 'Authentication required' };
  }
  return { user, error: null };
}

export async function requireAdmin(request, env) {
  const { user, error } = await requireUser(request, env);
  if (!user) return { user: null, error };
  if (user.role !== 'ADMIN') return { user: null, error: 'Admin role required' };
  return { user, error: null };
}

// ---------- CSRF ----------
// For state-changing requests, require the session cookie to be present
// (SameSite=Lax is CSRF protection) AND verify the Origin header matches
// our own origin in production.
export function checkOrigin(request) {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return null;
  const origin = request.headers.get('Origin');
  const url = new URL(request.url);
  if (origin && new URL(origin).host !== url.host) {
    return 'Cross-origin request rejected';
  }
  return null;
}

// ---------- Rate limiting ----------
export async function rateLimit(env, key, maxCount, windowSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % windowSeconds);
  const fullKey = `${key}:${windowStart}`;
  const row = await db(env).prepare(
    `INSERT INTO rate_limits (key, count, window_start) VALUES (?1, 1, ?2)
     ON CONFLICT(key) DO UPDATE SET count = count + 1
     RETURNING count`
  ).bind(fullKey, new Date(windowStart * 1000).toISOString()).first();
  if (row && row.count > maxCount) {
    return { limited: true, retryAfter: windowSeconds - (now - windowStart) };
  }
  return { limited: false };
}

// Cleanup old rate limit rows (best-effort, runs on every call but is cheap)
export async function cleanupRateLimits(env) {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await db(env).prepare('DELETE FROM rate_limits WHERE window_start < ?1').bind(cutoff).run();
  } catch (e) { /* ignore */ }
}

// ---------- Audit log ----------
export async function audit(env, userId, action, entity, entityId, ip, metadata) {
  await db(env).prepare(
    'INSERT INTO audit_log (id, user_id, action, entity, entity_id, ip, metadata) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)'
  ).bind(
    cuid(),
    userId || null,
    action,
    entity || null,
    entityId || null,
    ip || null,
    metadata ? JSON.stringify(metadata) : null
  ).run();
}

// ---------- Response helpers ----------
export function json(data, status = 200, extraHeaders = {}) {
  const headers = new Headers({ 'Content-Type': 'application/json', ...extraHeaders });
  return new Response(JSON.stringify(data), { status, headers });
}

export function errorResponse(message, status = 400) {
  return json({ error: message }, status);
}

// ---------- Input sanitization ----------
// Allowlist-based HTML sanitizer for notice bodies.
const ALLOWED_TAGS = new Set(['p','br','strong','em','b','i','u','ul','ol','li','a','h3','h4','blockquote','hr']);
const ALLOWED_ATTRS = { a: new Set(['href','title','target','rel']) };

export function sanitizeHtml(html) {
  if (!html) return '';
  // Strip script/style entirely
  html = String(html).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = String(html).replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  // Parse and filter
  const allowedTagsRe = Array.from(ALLOWED_TAGS).join('|');
  // Remove all tags not in the allowlist (preserve content)
  html = String(html).replace(
    new RegExp(`<\\/?(?!(?:${allowedTagsRe})\\b)[^>]*>`, 'gi'),
    ''
  );
  // Sanitize attributes on allowed tags
  html = String(html).replace(/<([a-z][a-z0-9]*)([^>]*)>/gi, (match, tag, attrs) => {
    const t = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(t)) return match;
    const allowed = ALLOWED_ATTRS[t] || new Set();
    const filteredAttrs = [];
    attrs.replace(/(\w+)\s*=\s*("([^"]*)"|'([^']*)')/g, (m, name, _v, dq, sq) => {
      if (allowed.has(name.toLowerCase())) {
        const val = dq !== undefined ? dq : sq;
        if (name.toLowerCase() === 'href') {
          if (/^https?:\/\//i.test(val) || /^mailto:/i.test(val) || val.startsWith('/')) {
            filteredAttrs.push(`${name}="${val.replace(/"/g, '&quot;')}"`);
          }
        } else {
          filteredAttrs.push(`${name}="${val.replace(/"/g, '&quot;')}"`);
        }
      }
      return '';
    });
    // Add rel="noopener noreferrer" to all links
    if (t === 'a' && !filteredAttrs.some((a) => a.startsWith('rel='))) {
      filteredAttrs.push('rel="noopener noreferrer"');
    }
    return `<${t}${filteredAttrs.length ? ' ' + filteredAttrs.join(' ') : ''}>`;
  });
  return html;
}

// Slugify
export function slugify(s) {
  return String(s || '').toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// =========================================================================
// Parent portal — separate session table, separate cookie
// =========================================================================
const PARENT_COOKIE = 'vps_parent';
const PARENT_TTL_DAYS = 14;

export function setParentSessionCookie(headers, sessionId, expiresAt) {
  const parts = [
    `${PARENT_COOKIE}=${encodeURIComponent(sessionId)}`,
    `Path=/`,
    `HttpOnly`,
    `Secure`,
    `SameSite=Lax`,
    `Expires=${new Date(expiresAt).toUTCString()}`
  ];
  headers.append('Set-Cookie', parts.join('; '));
}

export function clearParentSessionCookie(headers) {
  headers.append('Set-Cookie', `${PARENT_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

export async function getCurrentParent(request, env) {
  const cookies = parseCookies(request);
  const sid = cookies[PARENT_COOKIE];
  if (!sid) return null;
  const row = await db(env).prepare(
    'SELECT ps.id as sid, ps.expires_at, p.id, p.full_name, p.phone, p.status, p.failed_logins, p.locked_until FROM parent_sessions ps JOIN parents p ON p.id = ps.parent_id WHERE ps.id = ?1'
  ).bind(sid).first();
  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) return null;
  if (row.status !== 'APPROVED') return null;
  return {
    id: row.id,
    full_name: row.full_name,
    phone: row.phone,
    status: row.status
  };
}

export async function requireParent(request, env) {
  const parent = await getCurrentParent(request, env);
  if (!parent) return { parent: null, error: 'Authentication required' };
  return { parent, error: null };
}
