/**
 * Admin — student master list
 * GET  /api/admin/students?class_name=Class%2012
 * POST /api/admin/students
 */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';
import { requireAdmin, cuid, checkOrigin, audit } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);
  const className = new URL(request.url).searchParams.get('class_name');
  const sql = `SELECT id, admission_number, full_name, class_name, section, roll_number, dob, is_active, created_at
    FROM students WHERE deleted_at IS NULL ${className ? 'AND class_name = ?1' : ''}
    ORDER BY class_name, section, CAST(roll_number AS INTEGER), full_name`;
  const rows = className ? await db(env).prepare(sql).bind(className).all() : await db(env).prepare(sql).all();
  return jsonResponse({ students: rows.results || [] });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }

  const admission = String(body.admission_number || '').trim() || null;
  const fullName = String(body.full_name || '').trim();
  const className = String(body.class_name || '').trim();
  const section = String(body.section || '').trim() || null;
  const roll = String(body.roll_number || '').trim() || null;
  const dob = String(body.dob || '').trim() || null;
  if (!fullName) return errorResponse('Student name is required', 400);
  if (!className) return errorResponse('Class is required', 400);

  // Protect the master list from double clicks when no admission number is
  // available to trigger the unique index.
  const duplicate = admission
    ? await db(env).prepare('SELECT id FROM students WHERE admission_number = ?1 AND deleted_at IS NULL').bind(admission).first()
    : await db(env).prepare(`SELECT id FROM students
        WHERE lower(full_name) = lower(?1) AND class_name = ?2
          AND IFNULL(section, '') = ?3 AND IFNULL(roll_number, '') = ?4
          AND deleted_at IS NULL LIMIT 1`)
        .bind(fullName, className, section || '', roll || '').first();
  if (duplicate) return errorResponse('This student already exists in the master list', 409);

  const id = 'std_' + cuid();
  try {
    await db(env).prepare(`INSERT INTO students
      (id, admission_number, full_name, class_name, section, roll_number, dob)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`)
      .bind(id, admission, fullName, className, section, roll, dob).run();
    await audit(env, user.id, 'student.create', 'Student', id, request.headers.get('CF-Connecting-IP') || '');
    return jsonResponse({ ok: true, id });
  } catch (e) {
    if (String(e.message).toLowerCase().includes('unique')) return errorResponse('Admission number already exists', 409);
    return errorResponse('Could not add student', 500);
  }
}
