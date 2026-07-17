/**
 * Admin — list & manage parent registration requests
 * GET  /api/admin/parents            — list (filter ?status=PENDING|APPROVED|REJECTED)
 * POST /api/admin/parents            — create a parent directly (rare)
 */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';
import { requireAdmin, cuid } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);

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

  // For each PENDING parent, also include any pre-registered child info
  const results = rows.results || [];
  for (const r of results) {
    if (r.status === 'PENDING') {
      const cs = await db(env).prepare(
        'SELECT student_name, class_name, section, roll_number FROM parent_students WHERE parent_id = ?1'
      ).bind(r.id).all();
      r.children = cs.results || [];
    }
  }

  return jsonResponse({ parents: results });
}
