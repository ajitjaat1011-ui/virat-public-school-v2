/**
 * Admin: Dashboard
 */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';
import { getCurrentUser } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const user = await getCurrentUser(request, env);
  if (!user) return errorResponse('Not authenticated', 401);

  const counts = {
    newInquiries: 0, oldInquiries: 0, unreadMessages: 0, notices: 0, albums: 0,
    parentRequests: 0, exams: 0
  };
  const recentInquiries = [];
  const recentAudit = [];

  try {
    const inquiries = await db(env).prepare("SELECT COUNT(*) as c FROM admission_inquiries WHERE status = 'NEW' AND deleted_at IS NULL").first();
    counts.newInquiries = inquiries?.c || 0;
    const inquiriesOld = await db(env).prepare("SELECT COUNT(*) as c FROM admission_inquiries WHERE status = 'NEW' AND deleted_at IS NULL AND created_at < datetime('now', '-24 hours')").first();
    counts.oldInquiries = inquiriesOld?.c || 0;
    const messages = await db(env).prepare('SELECT COUNT(*) as c FROM contact_messages WHERE is_read = 0 AND deleted_at IS NULL').first();
    counts.unreadMessages = messages?.c || 0;
    const notices = await db(env).prepare('SELECT COUNT(*) as c FROM notices WHERE deleted_at IS NULL AND is_published = 1').first();
    counts.notices = notices?.c || 0;
    const albums = await db(env).prepare('SELECT COUNT(*) as c FROM gallery_albums WHERE deleted_at IS NULL AND is_published = 1').first();
    counts.albums = albums?.c || 0;
    const parents = await db(env).prepare("SELECT COUNT(*) as c FROM parents WHERE status = 'PENDING'").first();
    counts.parentRequests = parents?.c || 0;
    const exams = await db(env).prepare('SELECT COUNT(*) as c FROM exams WHERE deleted_at IS NULL').first();
    counts.exams = exams?.c || 0;
    const ri = await db(env).prepare('SELECT id, parent_name, student_name, class_seeking, created_at FROM admission_inquiries WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5').all();
    recentInquiries.push(...(ri.results || []));
    const ra = await db(env).prepare("SELECT a.id, a.action, a.entity, a.created_at, u.username FROM audit_log a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.created_at DESC LIMIT 10").all();
    recentAudit.push(...(ra.results || []));
  } catch (e) {}

  return jsonResponse({ counts, recentInquiries, recentAudit });
}
