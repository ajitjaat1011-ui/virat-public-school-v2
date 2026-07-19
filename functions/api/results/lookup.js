/** Public result lookup for both legacy result sets and the admin exam-results system. */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const roll = (url.searchParams.get('roll') || '').trim();
  const dob = (url.searchParams.get('dob') || '').trim();
  if (!roll || !dob) return errorResponse('Roll number and date of birth are required', 400);

  // Keep existing result-set records working.
  const legacy = await db(env).prepare(`
    SELECT r.roll_number, r.student_name, r.dob, r.class_name, r.section, r.marks_json,
      r.total, r.max_total, r.percentage, r.grade, r.rank, s.exam_name, s.academic_year
    FROM student_results r JOIN result_sets s ON s.id = r.result_set_id
    WHERE r.roll_number = ?1 AND r.dob = ?2 AND s.is_published = 1
    ORDER BY s.declared_at DESC LIMIT 1
  `).bind(roll, dob).first();

  if (legacy) {
    const rawMarks = typeof legacy.marks_json === 'string' ? JSON.parse(legacy.marks_json) : (legacy.marks_json || []);
    // Legacy records store marks as { Subject: number }; the UI consumes rows.
    const marks = Array.isArray(rawMarks)
      ? rawMarks
      : Object.entries(rawMarks).map(([subject, value]) => ({ subject, marks: value, grade: '' }));
    return jsonResponse({
      student: { name: legacy.student_name, class: legacy.class_name, roll: legacy.roll_number },
      roll_number: legacy.roll_number, student_name: legacy.student_name, class_name: legacy.class_name,
      section: legacy.section, exam_name: legacy.exam_name, academic_year: legacy.academic_year,
      marks, total: legacy.total, max_total: legacy.max_total, percentage: legacy.percentage,
      grade: legacy.grade, rank: legacy.rank
    });
  }

  // New admin-uploaded results are linked to the student master list by roll/class.
  const { results: rows } = await db(env).prepare(`
    SELECT er.roll_number, er.student_name, er.class_name, er.section,
      er.marks_obtained, er.max_marks, er.grade, er.remarks,
      e.title AS exam_name, e.subject, e.exam_date
    FROM exam_results er
    JOIN exams e ON e.id = er.exam_id AND e.is_published = 1 AND e.deleted_at IS NULL
    JOIN students st ON st.class_name = er.class_name
      AND IFNULL(st.roll_number, '') = IFNULL(er.roll_number, '')
      AND st.deleted_at IS NULL AND st.is_active = 1
    WHERE er.roll_number = ?1 AND st.dob = ?2
    ORDER BY e.exam_date DESC, e.subject ASC
  `).bind(roll, dob).all();

  if (!rows || !rows.length) return errorResponse('No result found', 404);

  // Filter to rows from the most recent exam date / exam name
  const latestExamDate = rows[0].exam_date;
  const latestExamName = rows[0].exam_name;
  const latestRows = rows.filter(r => r.exam_date === latestExamDate || r.exam_name === latestExamName);

  const first = latestRows[0];
  const marks = latestRows.map(r => ({
    subject: r.subject || 'General',
    marks: r.marks_obtained,
    max_marks: r.max_marks,
    grade: r.grade || ''
  }));

  const totalObtained = latestRows.reduce((sum, r) => sum + (Number(r.marks_obtained) || 0), 0);
  const totalMax = latestRows.reduce((sum, r) => sum + (Number(r.max_marks) || 100), 0);

  return jsonResponse({
    student: { name: first.student_name, class: first.class_name, roll: first.roll_number },
    roll_number: first.roll_number, student_name: first.student_name, class_name: first.class_name,
    section: first.section, exam_name: first.exam_name,
    marks,
    total: totalObtained, max_total: totalMax, grade: first.grade || '', remarks: first.remarks || ''
  });
}
