/**
 * Parent dashboard data — exams + results for the logged-in parent's children
 * Returns a structured payload:
 *   { parent, children: [...], exams: [...], results: [...] }
 */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';
import { requireParent } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const { parent, error } = await requireParent(request, env);
  if (!parent) return errorResponse(error, 401);

  // Get children
  const childrenRows = await db(env).prepare(
    'SELECT id, student_name, class_name, section, roll_number FROM parent_students WHERE parent_id = ?1 ORDER BY student_name'
  ).bind(parent.id).all();
  const children = (childrenRows.results || []).map(c => ({
    ...c,
    full_label: [c.student_name, c.class_name, c.section].filter(Boolean).join(' · ')
  }));

  // Determine which classes to fetch exams for
  const classNames = [...new Set(children.map(c => c.class_name).filter(Boolean))];

  // Exams: upcoming (any future date) + recent past (60 days back)
  const now = new Date();
  const pastCutoff = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  // No upper bound — parents should see all upcoming exams for their class,
  // not just those within 90 days. Class list can be filtered/paginated later.

  let exams = [];
  if (classNames.length) {
    const placeholders = classNames.map((_, i) => `?${i + 1}`).join(',');
    const params = [...classNames, pastCutoff];
    const res = await db(env).prepare(
      `SELECT id, title, class_name, subject, exam_date, start_time, end_time, max_marks, syllabus, notes
       FROM exams
       WHERE class_name IN (${placeholders}) AND is_published = 1 AND deleted_at IS NULL
         AND exam_date >= ?${classNames.length + 1}
       ORDER BY exam_date ASC, start_time ASC`
    ).bind(...params).all();
    exams = res.results || [];
  }

  // Results: any exam_result row matching this parent's children
  let results = [];
  if (children.length) {
    // Build a flexible lookup: (class+section+roll) OR (class+name)
    // We'll fetch by class_name and filter in code so we cover both matching modes.
    const childClasses = [...new Set(children.map(c => c.class_name).filter(Boolean))];
    if (childClasses.length) {
      const placeholders = childClasses.map((_, i) => `?${i + 1}`).join(',');
      const res = await db(env).prepare(
        `SELECT er.id, er.exam_id, er.student_name, er.class_name, er.section, er.roll_number,
                er.marks_obtained, er.max_marks, er.grade, er.remarks,
                e.title, e.subject, e.exam_date
         FROM exam_results er
         JOIN exams e ON e.id = er.exam_id
         WHERE er.class_name IN (${placeholders}) AND e.deleted_at IS NULL
         ORDER BY e.exam_date DESC, er.student_name ASC`
      ).bind(...childClasses).all();
      const allRows = res.results || [];

      // Filter to only this parent's children
      const myChildren = children.map(c => ({
        key: `${(c.student_name||'').trim().toLowerCase()}|${(c.class_name||'').trim().toLowerCase()}|${(c.section||'').trim().toLowerCase()}|${(c.roll_number||'').trim().toLowerCase()}`,
        ...c
      }));
      results = allRows.filter(r => {
        const key = `${(r.student_name||'').trim().toLowerCase()}|${(r.class_name||'').trim().toLowerCase()}|${(r.section||'').trim().toLowerCase()}|${(r.roll_number||'').trim().toLowerCase()}`;
        return myChildren.some(c => c.key === key);
      });
    }
  }

  return jsonResponse({
    parent,
    children,
    exams,
    results
  });
}
// date range v2 - no upper bound
