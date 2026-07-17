/**
 * Global Pages Functions middleware
 * - Sets security headers on all responses
 * - For /admin/* paths: redirects to /admin/login if not authenticated
 */
import { parseCookies } from './lib/auth.js';
import { db } from './lib/db.js';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; frame-ancestors 'self'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.turso.io; form-action 'self'"
};

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const response = await next();

  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(k, v);
  }

  // Gate /admin/* HTML pages
  if (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login') && !url.pathname.startsWith('/api/')) {
    const cookies = parseCookies(request);
    const sid = cookies['vps_session'];
    let user = null;
    if (sid) {
      try {
        const s = await db(env).prepare('SELECT u.id, u.role, u.is_active, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?1').bind(sid).first();
        if (s && s.is_active && new Date(s.expires_at) > new Date()) {
          user = { role: s.role };
        }
      } catch (e) {}
    }
    if (!user) {
      return Response.redirect(new URL('/admin/login.html?next=' + encodeURIComponent(url.pathname), request.url), 302);
    }
  }
  return response;
}
