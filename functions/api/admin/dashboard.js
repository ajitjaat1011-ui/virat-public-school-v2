/**
 * Admin dashboard — D1 if available, else static JSONs (read-only)
 */
import { errorResponse, loadStatic, isD1Available } from '../../lib/data.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  // Without DB, return a read-only dashboard summary from static data
  if (!isD1Available(env)) {
    const [n, g, i, m] = await Promise.all([
      loadStatic(env, 'notices.json'),
      loadStatic(env, 'gallery.json'),
      loadStatic(env, 'inquiries.json').catch(() => ({ inquiries: [] })),
      loadStatic(env, 'messages.json').catch(() => ({ messages: [] }))
    ]);
    return Response.json({
      counts: {
        newInquiries: i?.inquiries?.filter((x) => x.status === 'NEW').length || 0,
        oldInquiries: 0,
        unreadMessages: m?.messages?.filter((x) => !x.is_read).length || 0,
        notices: n?.notices?.length || 0,
        albums: g?.albums?.length || 0
      },
      recentInquiries: (i?.inquiries || []).slice(0, 5),
      recentAudit: [],
      readOnly: true
    });
  }

  // With DB
  const { user, error } = await requireUser(request, env);
  if (error) return errorResponse(error, 401);
  const inquiries = await env.DB.prepare("SELECT COUNT(*) as c FROM admission_inquiries WHERE status = 'NEW' AND deleted_at IS NULL").first();
  const inquiriesUnactioned = await env.DB.prepare("SELECT COUNT(*) as c FROM admission_inquiries WHERE status = 'NEW' AND deleted_at IS NULL AND created_at < datetime('now', '-24 hours')").first();
  const messages = await env.DB.prepare('SELECT COUNT(*) as c FROM contact_messages WHERE is_read = 0 AND deleted_at IS NULL').first();
  const notices = await env.DB.prepare('SELECT COUNT(*) as c FROM notices WHERE deleted_at IS NULL AND is_published = 1').first();
  const albums  = await env.DB.prepare('SELECT COUNT(*) as c FROM gallery_albums WHERE deleted_at IS NULL AND is_published = 1').first();
  const recentInquiries = (await env.DB.prepare('SELECT id, parent_name, student_name, class_seeking, created_at FROM admission_inquiries WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5').all()).results;
  const recentAudit = (await env.DB.prepare("SELECT a.id, a.action, a.entity, a.created_at, u.username FROM audit_log a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.created_at DESC LIMIT 10").all()).results;
  return Response.json({
    counts: {
      newInquiries: inquiries?.c || 0,
      oldInquiries: inquiriesUnactioned?.c || 0,
      unreadMessages: messages?.c || 0,
      notices: notices?.c || 0,
      albums: albums?.c || 0
    },
    recentInquiries,
    recentAudit
  });
}

async function requireUser(request, env) {
  const cookies = parseCookies(request);
  const sid = cookies['vps_session'];
  if (!sid) return { user: null, error: 'Not authenticated' };
  const s = await env.DB.prepare(
    'SELECT u.id, u.role, u.is_active, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?1'
  ).bind(sid).first();
  if (!s || !s.is_active || new Date(s.expires_at) < new Date()) return { user: null, error: 'Session expired' };
  return { user: { role: s.role }, error: null };
}
function parseCookies(request) {
  const h = request.headers.get('Cookie') || '';
  const out = {};
  h.split(';').forEach((kv) => { const [k, ...rest] = kv.trim().split('='); if (k) out[k] = decodeURIComponent(rest.join('=')); });
  return out;
}
