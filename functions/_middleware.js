/**
 * Global Pages Functions middleware
 * - Sets security headers on all responses
 * - For /admin/* paths: redirects to /admin/login if not authenticated
 *   (except for the login page itself and the auth API endpoint)
 */
import { parseCookies, getCurrentUser } from './lib/auth.js';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const response = await next();

  // Add security headers to all responses
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(k, v);
  }

  // For admin pages (not API), gate access
  if (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login') && !url.pathname.startsWith('/api/')) {
    const cookies = parseCookies(request);
    const sid = cookies['vps_session'];
    let user = null;
    if (sid) {
      const session = await env.DB.prepare(
        'SELECT u.id, u.role, u.is_active, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?1'
      ).bind(sid).first();
      if (session && session.is_active && new Date(session.expires_at) > new Date()) {
        user = { role: session.role };
      }
    }
    if (!user) {
      // Redirect to login
      return Response.redirect(new URL('/admin/login?next=' + encodeURIComponent(url.pathname), request.url), 302);
    }
    // For admin API endpoints under /api/admin, the API handler itself enforces auth
  }

  return response;
}
