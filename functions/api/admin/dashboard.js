/** Admin dashboard summary. Independent counts are fetched in parallel to keep the shell responsive. */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';
import { getCurrentUser } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const user = await getCurrentUser(request, env);
  if (!user) return errorResponse('Not authenticated', 401);

  let counts = { newInquiries: 0, oldInquiries: 0, unreadMessages: 0, notices: 0, albums: 0, parentRequests: 0, exams: 0, students: 0 };
  try {
    const row = await db(env).prepare(`SELECT
      (SELECT COUNT(*) FROM admission_inquiries WHERE status='NEW' AND deleted_at IS NULL) AS newInquiries,
      (SELECT COUNT(*) FROM admission_inquiries WHERE status='NEW' AND deleted_at IS NULL AND created_at < datetime('now','-24 hours')) AS oldInquiries,
      (SELECT COUNT(*) FROM contact_messages WHERE is_read=0 AND deleted_at IS NULL) AS unreadMessages,
      (SELECT COUNT(*) FROM notices WHERE deleted_at IS NULL AND is_published=1) AS notices,
      (SELECT COUNT(*) FROM gallery_albums WHERE deleted_at IS NULL AND is_published=1) AS albums,
      (SELECT COUNT(*) FROM parents WHERE status='PENDING') AS parentRequests,
      (SELECT COUNT(*) FROM exams WHERE deleted_at IS NULL) AS exams,
      (SELECT COUNT(*) FROM students WHERE deleted_at IS NULL AND is_active=1) AS students`).first();
    if (row) counts = { ...counts, ...row };
  } catch (_) { /* render zero fallbacks instead of failing the dashboard */ }

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
