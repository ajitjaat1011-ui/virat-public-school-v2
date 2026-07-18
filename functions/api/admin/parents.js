/**
 * Admin — list & manage parent registration requests
 * GET  /api/admin/parents            — list (filter ?status=PENDING|APPROVED|REJECTED)
 * POST /api/admin/parents            — create a parent directly (rare)
 */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';
import { ensureParentLinkSchema } from '../../lib/migrations.js';
import { requireAdmin, cuid } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);
  try { await ensureParentLinkSchema(env); }
  catch (_) { return errorResponse('Parent-link database migration failed', 503); }

  const url = new URL(request.url);
  const status = url.searchParams.get('status');

  let rows;
  if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    rows = await db(env).prepare(
      `SELECT p.id, p.full_name, p.phone, p.status, p.created_at, p.reviewed_at, p.review_note,
              (SELECT COUNT(*) FROM parent_students ps WHERE ps.parent_id = p.id) AS child_count
       FROM parents p WHERE p.status = ?1
       ORDER BY p.created_at DESC`
    ).bind(status).all();
  } else {
    rows = await db(env).prepare(
      `SELECT p.id, p.full_name, p.phone, p.status, p.created_at, p.reviewed_at, p.review_note,
              (SELECT COUNT(*) FROM parent_students ps WHERE ps.parent_id = p.id) AS child_count
       FROM parents p
       ORDER BY (CASE p.status WHEN 'PENDING' THEN 0 WHEN 'APPROVED' THEN 1 ELSE 2 END), p.created_at DESC`
    ).all();
  }

  // Include both unverified requests and verified links for every account so
  // admins can complete linking before or after account approval.
  const results = rows.results || [];
  for (const r of results) {
    const cs = await db(env).prepare(`
      SELECT ps.id, ps.student_id, ps.student_name, ps.admission_number,
             ps.class_name, ps.section, ps.roll_number, ps.dob,
             ps.link_status, ps.verified_at,
             s.full_name AS master_name, s.admission_number AS master_admission_number,
             s.class_name AS master_class_name, s.section AS master_section,
             s.roll_number AS master_roll_number
      FROM parent_students ps
      LEFT JOIN students s ON s.id = ps.student_id AND s.deleted_at IS NULL
      WHERE ps.parent_id = ?1
      ORDER BY CASE ps.link_status WHEN 'REQUESTED' THEN 0 WHEN 'LINKED' THEN 1 ELSE 2 END, ps.created_at DESC`
    ).bind(r.id).all();
    r.children = cs.results || [];
  }

  return jsonResponse({ parents: results });
}
