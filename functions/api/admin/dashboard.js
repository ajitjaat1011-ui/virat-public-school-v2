/** Admin dashboard summary. Independent counts are fetched in parallel to keep the shell responsive. */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';
import { getCurrentUser } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const user = await getCurrentUser(request, env);
  if (!user) return errorResponse('Not authenticated', 401);

  const counts = { newInquiries: 0, oldInquiries: 0, unreadMessages: 0, notices: 0, albums: 0, parentRequests: 0, exams: 0, students: 0 };
  const safeCount = async (key, sql) => {
    try { const row = await db(env).prepare(sql).first(); counts[key] = row?.c || 0; } catch (_) {}
  };
  await Promise.all([
    safeCount('newInquiries', "SELECT COUNT(*) as c FROM admission_inquiries WHERE status = 'NEW' AND deleted_at IS NULL"),
    safeCount('oldInquiries', "SELECT COUNT(*) as c FROM admission_inquiries WHERE status = 'NEW' AND deleted_at IS NULL AND created_at < datetime('now', '-24 hours')"),
    safeCount('unreadMessages', 'SELECT COUNT(*) as c FROM contact_messages WHERE is_read = 0 AND deleted_at IS NULL'),
    safeCount('notices', 'SELECT COUNT(*) as c FROM notices WHERE deleted_at IS NULL AND is_published = 1'),
    safeCount('albums', 'SELECT COUNT(*) as c FROM gallery_albums WHERE deleted_at IS NULL AND is_published = 1'),
    safeCount('parentRequests', "SELECT COUNT(*) as c FROM parents WHERE status = 'PENDING'"),
    safeCount('exams', 'SELECT COUNT(*) as c FROM exams WHERE deleted_at IS NULL'),
    safeCount('students', 'SELECT COUNT(*) as c FROM students WHERE deleted_at IS NULL AND is_active = 1')
  ]);

  const recentInquiries = [];
  const recentAudit = [];
  try {
    const [ri, ra] = await Promise.all([
      db(env).prepare('SELECT id, parent_name, student_name, class_seeking, created_at FROM admission_inquiries WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5').all(),
      db(env).prepare('SELECT a.id, a.action, a.entity, a.created_at, u.username FROM audit_log a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.created_at DESC LIMIT 10').all()
    ]);
    recentInquiries.push(...(ri.results || []));
    recentAudit.push(...(ra.results || []));
  } catch (_) {}
  return jsonResponse({ counts, recentInquiries, recentAudit });
}
