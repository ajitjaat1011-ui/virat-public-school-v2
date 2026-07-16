/**
 * Admin: Dashboard stats
 */
import { json, errorResponse, requireUser } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const { user, error } = await requireUser(request, env);
  if (error) return errorResponse(error, 401);

  const inquiries = await env.DB.prepare("SELECT COUNT(*) as c FROM admission_inquiries WHERE status = 'NEW' AND deleted_at IS NULL").first();
  const inquiriesUnactioned = await env.DB.prepare("SELECT COUNT(*) as c FROM admission_inquiries WHERE status = 'NEW' AND deleted_at IS NULL AND created_at < datetime('now', '-24 hours')").first();
  const messages = await env.DB.prepare('SELECT COUNT(*) as c FROM contact_messages WHERE is_read = 0 AND deleted_at IS NULL').first();
  const notices = await env.DB.prepare('SELECT COUNT(*) as c FROM notices WHERE deleted_at IS NULL AND is_published = 1').first();
  const albums  = await env.DB.prepare('SELECT COUNT(*) as c FROM gallery_albums WHERE deleted_at IS NULL AND is_published = 1').first();
  const recentInquiries = (await env.DB.prepare('SELECT id, parent_name, student_name, class_seeking, created_at FROM admission_inquiries WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5').all()).results;
  const recentAudit = (await env.DB.prepare("SELECT a.id, a.action, a.entity, a.created_at, u.username FROM audit_log a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.created_at DESC LIMIT 10").all()).results;

  return json({
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
